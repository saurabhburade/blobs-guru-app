import { EthereumBlock } from "@subql/types-ethereum";
import { TransactionReceipt } from "../types";
import fetch from "node-fetch";

const rpcUrls = [
  "https://eth.drpc.org",
  "https://1.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
];

// Pick a random index each process start
const RPC_URL = rpcUrls[Math.floor(Math.random() * rpcUrls.length)];
console.log("Using RPC:", RPC_URL);

// ===== Simple sliding cache (blockNumber -> receipts[]) =====
const CACHE_WINDOW = 100; // prefetch window
const CACHE_MAX_BLOCKS = 500; // soft cap to avoid unbounded memory
const receiptCache = new Map<number, ParsedReceipt[]>(); // key: blockNumber

// ===== Helpers =====
function toHexQuantity(n: number) {
  return "0x" + BigInt(n).toString(16);
}

// hex -> number | undefined (safe for TS fields typed as number | undefined)
function fromHexQuantityNumber(hex: unknown): number | undefined {
  if (hex == null) return undefined;
  const s = String(hex);
  // Support hex "0x..." or decimal string
  const bi = s.startsWith("0x") ? BigInt(s) : BigInt(s);
  const MAX = BigInt(Number.MAX_SAFE_INTEGER);
  if (bi > MAX) {
    // Too large to represent precisely as JS number; drop or change schema to string
    // logger?.warn?.(`Quantity ${s} exceeds MAX_SAFE_INTEGER; omitting`);
    return undefined;
  }
  return Number(bi);
}

// ===== Types =====
type ParsedReceipt = {
  blockNumber: number;
  blockHash: string;
  txHash: string;
  gasUsed?: number; // numbers to satisfy schema with number | undefined
  effectiveGasPrice?: number;
};

function evictIfNeeded() {
  if (receiptCache.size <= CACHE_MAX_BLOCKS) return;
  const keys = Array.from(receiptCache.keys()).sort((a, b) => a - b);
  const removeCount = receiptCache.size - CACHE_MAX_BLOCKS;
  for (let i = 0; i < removeCount; i++) {
    receiptCache.delete(keys[i]);
  }
}

// ===== JSON-RPC: single and batch =====
async function rpcCall(body: any) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function parseBlockReceipts(result: any): ParsedReceipt[] {
  const receipts = result || [];
  return receipts.map((r: any) => ({
    blockNumber: parseInt(r.blockNumber, 16),
    blockHash: r.blockHash,
    txHash: r.transactionHash,
    gasUsed: fromHexQuantityNumber(r.gasUsed),
    effectiveGasPrice: fromHexQuantityNumber(r.effectiveGasPrice),
  }));
}

// Single-block fallback
async function getBlockReceipts(blockNumber: number): Promise<ParsedReceipt[]> {
  const body = {
    jsonrpc: "2.0",
    id: `b:${blockNumber}`,
    method: "eth_getBlockReceipts",
    params: [toHexQuantity(blockNumber)],
  };
  const data = await rpcCall(body);
  if (data?.error) throw new Error(data.error.message);
  return parseBlockReceipts(data?.result);
}

// Batch prefetch [startBlock, startBlock + count - 1]
async function prefetchBlockRange(
  startBlock: number,
  count = CACHE_WINDOW
): Promise<void> {
  const requests: any[] = [];
  for (let i = 0; i < count; i++) {
    const bn = startBlock + i;
    if (receiptCache.has(bn)) continue; // already cached
    requests.push({
      jsonrpc: "2.0",
      id: `b:${bn}`,
      method: "eth_getBlockReceipts",
      params: [toHexQuantity(bn)],
    });
  }
  if (requests.length === 0) return;

  let responses: any[];
  try {
    const resp = await rpcCall(requests);
    responses = Array.isArray(resp) ? resp : [resp];
  } catch {
    // If the batch request fails, fallback to serial single requests (best-effort)
    for (const req of requests) {
      const bn = Number(String(req.id).split(":")[1]);
      try {
        const single = await rpcCall(req);
        if (!single?.error) {
          receiptCache.set(bn, parseBlockReceipts(single?.result));
        }
      } catch {
        // swallow; if it fails, we just won't have this block cached
      }
    }
    evictIfNeeded();
    return;
  }

  // Responses may arrive out of order; match by id
  for (const r of responses) {
    if (!r || r.error) continue;
    const id = String(r.id || "");
    if (!id.startsWith("b:")) continue;
    const bn = Number(id.slice(2));
    receiptCache.set(bn, parseBlockReceipts(r.result));
  }
  evictIfNeeded();
}

async function getOrPrefetchBlockReceipts(
  blockNumber: number
): Promise<ParsedReceipt[]> {
  // Cache hit?
  const cached = receiptCache.get(blockNumber);
  if (cached) return cached;

  // Prefetch blockNumber..blockNumber+49
  try {
    await prefetchBlockRange(blockNumber, CACHE_WINDOW);
  } catch {
    // ignore; we'll fallback below
  }

  // After prefetch, try again
  const after = receiptCache.get(blockNumber);
  if (after) return after;

  // Fallback: single-block fetch
  const fresh = await getBlockReceipts(blockNumber);
  receiptCache.set(blockNumber, fresh);
  evictIfNeeded();
  return fresh;
}

// ===== Optional: chunker kept for bulk persistence later =====
function chunkArray<T>(array: T[], chunkSize = 1000) {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// ===== Public mapping =====
export async function getTxReceipts({
  block,
}: {
  block: EthereumBlock;
}): Promise<Map<string, TransactionReceipt>> {
  const batchReceipt = new Map<string, TransactionReceipt>();

  try {
    const receipts = await getOrPrefetchBlockReceipts(block.number);

    for (const r of receipts) {
      if (!r?.txHash) continue;
      const txHash = r.txHash.toLowerCase();

      const newReceipt = TransactionReceipt.create({
        id: txHash,
        hash: r.txHash,
        blockId: String(block.number),
        effectiveGasPrice: r.effectiveGasPrice, // number | undefined
        gasUsed: r.gasUsed, // number | undefined
        transactionId: r.txHash,
        blockNumber: r.blockNumber, // number
      });

      batchReceipt.set(txHash, newReceipt);
    }

    // If you want to persist in bulk:
    // const values = Array.from(batchReceipt.values());
    // for (const chunk of chunkArray(values, 1000)) {
    //   await store.bulkUpdate("TransactionReceipt", chunk);
    // }

    return batchReceipt;
  } catch (error) {
    // @ts-ignore (logger available in SubQuery runtime; ignore if not)
    logger?.error?.(
      `getTxReceipts failed for block ${String(block?.number)}: ${String(
        error
      )}`
    );
    return batchReceipt;
  }
}
