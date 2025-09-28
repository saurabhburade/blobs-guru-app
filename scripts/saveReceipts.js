#!/usr/bin/env node
/**
 * ETH Receipt Exporter (multi-RPC, concurrent, batched)
 * -----------------------------------------------------
 * - Parallel workers
 * - Round-robin across multiple RPC URLs
 * - JSON-RPC batching (multiple blocks per request)
 * - Async file writes with split chunks
 *
 * Output: receipts-00001.json, receipts-00002.json, ...
 * Node.js 18+ (global fetch)
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

// ===================== CONFIG =====================
const RPC_URLS = [
  "https://1.rpc.hypersync.xyz",
  "https://1.rpc.hypersync.xyz",
  "https://1.rpc.hypersync.xyz",
  "https://1.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
];

// Block range
const START = 19426500n; // inclusive
const END = 23460919n; // inclusive

// Output
const OUT_DIR = "./scripts/receipts";
const FILE_SPLIT_SIZE = 350_000; // receipts per file
const FILE_NUMBER_PAD = 5;

// Concurrency & batching
const WORKERS = 20; // total concurrent workers (tune this)
const BATCH_BLOCKS = 20; // blocks per JSON-RPC batch call (5–10 recommended)

// Resilience
const MAX_RETRIES = 5; // per HTTP request
const RPC_TIMEOUT_MS = 30_000; // per HTTP request timeout
const BACKOFF_BASE_MS = 2_000; // exponential backoff base
const BACKOFF_MAX_MS = 12_000;
const ENDPOINT_COOL_MS = 8_000; // temporarily cool failing endpoint

// Logging
const LOG_LEVEL = "info"; // 'debug' | 'info' | 'warn' | 'error'
const PROGRESS_EVERY_BATCHES = 100;

// ===================== UTILITIES =====================
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
function log(level, msg, meta) {
  if (LEVELS[level] < LEVELS[LOG_LEVEL]) return;
  const ts = new Date().toISOString();
  const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
  const fn = level === "warn" ? "warn" : level === "error" ? "error" : "log";
  console[fn](`[${ts}] [${level.toUpperCase()}] ${line}`);
}
const jitter = (ms) => Math.floor(ms * (0.85 + Math.random() * 0.3));
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const toHexQuantity = (n) =>
  typeof n === "string" && n.startsWith("0x")
    ? n
    : "0x" + BigInt(n).toString(16);
const fromHexQuantity = (hex) => (hex ? BigInt(hex) : null);

class Stopwatch {
  constructor() {
    this.t0 = Date.now();
  }
  ms() {
    return Date.now() - this.t0;
  }
}

function formatDuration(ms) {
  if (ms == null || !isFinite(ms) || ms < 0) return null;
  const totalSeconds = Math.round(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ===================== ENDPOINT POOL =====================
// Simple round-robin with cooling when an endpoint errors out
const pool = RPC_URLS.map((url) => ({ url, coolUntil: 0 }));
let rr = 0;
function pickEndpoint() {
  const now = Date.now();
  for (let i = 0; i < pool.length; i++) {
    const idx = (rr + i) % pool.length;
    if (pool[idx].coolUntil <= now) {
      rr = idx + 1;
      return pool[idx];
    }
  }
  // if all cooled, pick the next and ignore cool (last resort)
  const idx = rr++ % pool.length;
  return pool[idx];
}
function coolEndpoint(endpoint, reason) {
  endpoint.coolUntil = Date.now() + ENDPOINT_COOL_MS;
  log("warn", "Cooling endpoint", { url: endpoint.url, reason });
}

// ===================== JSON-RPC =====================
async function rpcBatch(url, calls, attempt = 0) {
  // local ids to keep mapping small
  const payload = calls.map((c, i) => ({
    jsonrpc: "2.0",
    id: i + 1,
    method: c.method,
    params: c.params,
  }));
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Non-batch response");
    const byId = new Map(data.map((d) => [d.id, d]));
    return payload.map((p) => {
      const r = byId.get(p.id);
      if (!r) return { error: { message: "missing response" } };
      if (r.error) return { error: r.error };
      return { result: r.result };
    });
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const backoff = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** attempt);
      const wait = jitter(backoff);
      log("warn", "Batch request failed; retrying", {
        url,
        attempt: attempt + 1,
        waitMs: wait,
        error: String(err),
      });
      await sleep(wait);
      return rpcBatch(url, calls, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(t);
  }
}

async function getBlockReceiptsByNumberBatch(url, blockNumsHex) {
  const calls = blockNumsHex.map((n) => ({
    method: "eth_getBlockReceipts",
    params: [n],
  }));
  return rpcBatch(url, calls);
}

// ===================== WRITER (async, split files) =====================
let FILE_INDEX = 1;
let BUFFER = [];
let pendingWrite = Promise.resolve(); // serialize actual writes (avoid contention)

function nextFileName() {
  const num = String(FILE_INDEX).padStart(FILE_NUMBER_PAD, "0");
  return path.join(OUT_DIR, `receipts-${num}.json`);
}

async function enqueueWrite(force = false) {
  if (BUFFER.length < FILE_SPLIT_SIZE && !force) return;

  const toWrite = BUFFER.splice(0, Math.min(BUFFER.length, FILE_SPLIT_SIZE));
  if (toWrite.length === 0) return;

  const filename = nextFileName();
  FILE_INDEX++;

  // chain writes to keep disk pressure predictable
  pendingWrite = pendingWrite.then(async () => {
    await fsp.mkdir(OUT_DIR, { recursive: true });
    await fsp.writeFile(filename, JSON.stringify(toWrite, null, 2));
    log("info", "Wrote file", { file: filename, records: toWrite.length });
  });
  await pendingWrite; // optional: wait here to throttle memory
}

// ===================== PIPELINE =====================
function* chunkArray(arr, size) {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size);
}

async function processRange(start, end) {
  const sw = new Stopwatch();

  if (typeof start !== "bigint" || typeof end !== "bigint" || end < start) {
    throw new Error("Invalid START/END configuration");
  }
  if (!RPC_URLS?.length) throw new Error("No RPC_URLS configured");

  // create block batches
  const blocks = [];
  for (let b = start; b <= end; b++) blocks.push(b);
  const batches = Array.from(chunkArray(blocks, BATCH_BLOCKS));
  const initialBatchCount = batches.length; // snapshot for ETA calculations

  log("info", "Starting export", {
    startBlock: String(start),
    endBlock: String(end),
    totalBlocks: blocks.length,
    batchSize: BATCH_BLOCKS,
    workers: WORKERS,
    endpoints: RPC_URLS.length,
    fileSplitSize: FILE_SPLIT_SIZE,
  });

  let completedBatches = 0;
  let okBlocks = 0;
  let failedBlocks = 0;

  let cursor = 0;

  async function nextBatch() {
    // simple atomic-ish fetch of next index
    const i = cursor;
    if (i >= batches.length) return null;
    cursor = i + 1;
    return { idx: i, batch: batches[i] };
  }

  async function worker(workerId) {
    while (true) {
      const item = await nextBatch();
      if (!item) break;

      const { idx, batch } = item;
      const bnHexes = batch.map((bn) => toHexQuantity(bn));
      let endpoint = pickEndpoint();

      try {
        const res = await getBlockReceiptsByNumberBatch(endpoint.url, bnHexes);

        for (let j = 0; j < res.length; j++) {
          const entry = res[j];
          const bn = batch[j];
          if (entry.error) {
            failedBlocks++;
            log("warn", "eth_getBlockReceipts error for block", {
              block: String(bn),
              error: entry.error.message || entry.error,
              endpoint: endpoint.url,
            });
            continue;
          }
          const recs = entry.result || [];
          const records = recs.map((r) => ({
            blockNumber: Number(fromHexQuantity(r.blockNumber)),
            txHash: r.transactionHash,
            gasUsed: fromHexQuantity(r.gasUsed)?.toString(),
            effectiveGasPrice: fromHexQuantity(r.effectiveGasPrice)?.toString(),
          }));
          BUFFER.push(...records);
          await enqueueWrite(false);
          okBlocks++;
        }
      } catch (err) {
        failedBlocks += batch.length;
        coolEndpoint(endpoint, String(err));
        log("warn", "Batch failed for worker; endpoint cooled", {
          workerId,
          idx,
          error: String(err),
          endpoint: endpoint.url,
        });
        // optional: re-queue the failed batch for another endpoint try
        // Keep it simple but effective: push it near the end
        batches.push(batch);
      } finally {
        completedBatches++;

        // ---- Progress & ETA (based on initialBatchCount snapshot) ----
        const doneBatches = Math.min(completedBatches, initialBatchCount);
        const pct = Math.min(
          100,
          Number(((doneBatches / initialBatchCount) * 100).toFixed(1))
        );

        const elapsedMs = sw.ms();
        const avgBatchesPerSec =
          doneBatches > 0 ? doneBatches / (elapsedMs / 1000) : 0;

        const remainingBatches = Math.max(0, initialBatchCount - doneBatches);
        const etaMs =
          avgBatchesPerSec > 0
            ? Math.round((remainingBatches / avgBatchesPerSec) * 1000)
            : null;

        if (
          completedBatches % PROGRESS_EVERY_BATCHES === 0 ||
          doneBatches === initialBatchCount
        ) {
          log("info", "Progress", {
            completedBatches: doneBatches,
            totalBatches: initialBatchCount,
            pct: String(pct),
            okBlocks,
            failedBlocks,
            buffer: BUFFER.length,
            filesWritten: FILE_INDEX - 1,
            elapsedMs,
            elapsedHuman: formatDuration(elapsedMs),
            etaMs,
            etaHuman: formatDuration(etaMs),
            etaAt: etaMs ? new Date(Date.now() + etaMs).toISOString() : null,
            avgBatchesPerSec: avgBatchesPerSec.toFixed(2),
          });
        }
      }
    }
  }

  const workers = Array.from({ length: WORKERS }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // Flush remaining buffer & ensure all writes finished
  await enqueueWrite(true);
  await pendingWrite;

  const elapsed = sw.ms();
  const rpsBlocks = (blocks.length / (elapsed / 1000)).toFixed(2);

  log("info", "Export complete", {
    outputDir: OUT_DIR,
    totalBlocks: blocks.length,
    okBlocks,
    failedBlocks,
    estimatedReceipts: (FILE_INDEX - 1) * FILE_SPLIT_SIZE + BUFFER.length,
    durationMs: elapsed,
    durationHuman: formatDuration(elapsed),
    blocksPerSecond: rpsBlocks,
    filesWritten: FILE_INDEX - 1,
  });
}

// ===================== RUN =====================
processRange(START, END).catch((err) => {
  log("error", "Fatal error", { error: String(err?.stack || err) });
  process.exit(1);
});
