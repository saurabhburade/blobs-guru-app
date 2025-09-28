#!/usr/bin/env node
/**
 * ETH Receipt Exporter (batched file output)
 * -----------------------------------------
 * Exports gasUsed and effectiveGasPrice from transaction receipts across a block range
 * using ONLY `eth_getBlockReceipts` with JSON‑RPC batching.
 *
 * Output: multiple JSON files, each containing up to 5000 records.
 *   receipts-00001.json, receipts-00002.json, ...
 *
 * Requirements
 * - Node.js 18+ (uses global fetch)
 * - An Ethereum JSON-RPC endpoint that supports `eth_getBlockReceipts`
 */

import fs from "node:fs";
import path from "node:path";

// ===================== CONFIG =====================
const rpcUrls = [
  "https://eth.drpc.org",
  "https://1.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
];
const RPC_URL = rpcUrls[Math.floor(Math.random() * rpcUrls.length)];
const START = 19426500n; // inclusive
const END = 23460919n; // inclusive

const OUT_DIR = "./scripts/receipts";

const CONCURRENCY = 4; // number of parallel batch workers
const BATCH_BLOCKS = 8; // blocks per JSON-RPC batch (recommended 5–10)
const MAX_RETRIES = 5; // per request (batch) retries
const RPC_TIMEOUT_MS = 30_000; // per HTTP request timeout
const BACKOFF_BASE_MS = 5_000; // retry backoff base
const BACKOFF_MAX_MS = 10_000; // retry backoff cap
const FILE_SPLIT_SIZE = 50_000; // receipts per file

// Logging verbosity
const LOG_LEVEL = "info"; // 'debug' | 'info' | 'warn' | 'error'
const PROGRESS_EVERY_BATCHES = 20; // log progress every N completed batches

// ===================== UTILITIES =====================
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
function log(level, msg, meta) {
  if (LEVELS[level] < LEVELS[LOG_LEVEL]) return;
  const ts = new Date().toISOString();
  const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
  console[level === "warn" ? "warn" : level === "error" ? "error" : "log"](
    `[${ts}] [${level.toUpperCase()}] ${line}`
  );
}

function toHexQuantity(n) {
  if (typeof n === "string" && n.startsWith("0x")) return n;
  const bi = BigInt(n);
  return "0x" + bi.toString(16);
}

function fromHexQuantity(hex) {
  if (!hex) return null;
  return BigInt(hex);
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
function jitter(ms) {
  return Math.floor(ms * (0.85 + Math.random() * 0.3));
}

class Stopwatch {
  constructor() {
    this.start = Date.now();
  }
  elapsedMs() {
    return Date.now() - this.start;
  }
}

// ===================== JSON-RPC CORE =====================
let rpcId = 1;
async function rpcBatch(calls, attempt = 0) {
  const ids = calls.map(() => rpcId++);
  const payload = calls.map((c, i) => ({
    jsonrpc: "2.0",
    id: ids[i],
    method: c.method,
    params: c.params,
  }));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(RPC_URL, {
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
      log("warn", `Batch request failed. Retrying`, {
        attempt: attempt + 1,
        waitMs: wait,
        error: String(err),
      });
      await sleep(wait);
      return rpcBatch(calls, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function getBlockReceiptsByNumberBatch(blockNumsHex) {
  const calls = blockNumsHex.map((n) => ({
    method: "eth_getBlockReceipts",
    params: [n],
  }));
  return rpcBatch(calls);
}

// ===================== PIPELINE =====================
let FILE_INDEX = 1;
let CURRENT_BATCH = [];

function writeFileIfNeeded(force = false) {
  if (
    CURRENT_BATCH.length >= FILE_SPLIT_SIZE ||
    (force && CURRENT_BATCH.length > 0)
  ) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const filename = path.join(OUT_DIR, `receipts-${String(FILE_INDEX)}.json`);
    fs.writeFileSync(filename, JSON.stringify(CURRENT_BATCH, null, 2));
    log("info", "Wrote file", {
      file: filename,
      records: CURRENT_BATCH.length,
    });
    FILE_INDEX++;
    CURRENT_BATCH = [];
  }
}

function* chunkArray(arr, size) {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size);
}

async function processRange(start, end) {
  const sw = new Stopwatch();
  if (typeof start !== "bigint" || typeof end !== "bigint" || end < start) {
    throw new Error("Invalid START/END configuration");
  }
  if (!RPC_URL) throw new Error("RPC_URL is not configured");

  const blocks = [];
  for (let b = start; b <= end; b++) blocks.push(b);
  const batches = Array.from(chunkArray(blocks, BATCH_BLOCKS));

  log("info", "Starting export", {
    startBlock: String(start),
    endBlock: String(end),
    totalBlocks: blocks.length,
    batchSize: BATCH_BLOCKS,
    concurrency: CONCURRENCY,
    fileSplitSize: FILE_SPLIT_SIZE,
  });

  let completedBatches = 0;
  let okBlocks = 0;
  let failedBlocks = 0;

  let bi = 0;
  async function batchWorker() {
    while (true) {
      const idx = bi++;
      if (idx >= batches.length) break;
      const batch = batches[idx];
      const bnHexes = batch.map((bn) => toHexQuantity(bn));

      const res = await getBlockReceiptsByNumberBatch(bnHexes);

      for (let j = 0; j < res.length; j++) {
        const entry = res[j];
        const bn = batch[j];
        if (entry.error) {
          failedBlocks++;
          log("warn", "eth_getBlockReceipts error for block", {
            block: String(bn),
            error: entry.error.message || entry.error,
          });
          continue;
        }
        const recs = entry.result || [];
        const records = recs
          .map((r) => {
            // if (r.type !== "0x3") {
            //   return null;
            // }
            return {
              blockNumber: Number(fromHexQuantity(r.blockNumber)),
              txHash: r.transactionHash,
              gasUsed: fromHexQuantity(r.gasUsed)?.toString(),
              effectiveGasPrice: fromHexQuantity(
                r.effectiveGasPrice
              )?.toString(),
            };
          })
          ?.filter((v) => v);
        CURRENT_BATCH.push(...records);
        writeFileIfNeeded(false);
        okBlocks++;
      }

      completedBatches++;
      if (
        completedBatches % PROGRESS_EVERY_BATCHES === 0 ||
        completedBatches === batches.length
      ) {
        const pct = ((completedBatches / batches.length) * 100).toFixed(1);
        log("info", "Progress", {
          completedBatches,
          totalBatches: batches.length,
          pct,
        });
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => batchWorker());
  await Promise.all(workers);

  // Flush remaining
  writeFileIfNeeded(true);

  const elapsed = sw.elapsedMs();
  const rps = (blocks.length / (elapsed / 1000)).toFixed(2);
  log("info", "Export complete", {
    outputDir: OUT_DIR,
    totalBlocks: blocks.length,
    okBlocks,
    failedBlocks,
    totalReceipts: (FILE_INDEX - 1) * FILE_SPLIT_SIZE + CURRENT_BATCH.length,
    durationMs: elapsed,
    blocksPerSecond: rps,
    filesWritten: FILE_INDEX - 1,
  });
}

processRange(START, END)
  .then(() => log("info", "Done."))
  .catch((err) => {
    log("error", "Fatal error", { error: String(err?.stack || err) });
    process.exit(1);
  });
