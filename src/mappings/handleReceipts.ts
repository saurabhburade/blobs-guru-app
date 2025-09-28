import { EthereumBlock } from "@subql/types-ethereum";
import { TransactionReceipt } from "../types";
import fetch from "node-fetch";

const rpcUrls = [
  "https://eth.drpc.org",
  "https://1.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
];
const RPC_URL = "https://eth-traces.rpc.hypersync.xyz";
const FILES_COUNT = 100;

// Helper: convert number to hex quantity
function toHexQuantity(n: number) {
  return "0x" + BigInt(n).toString(16);
}

// Helper: hex → decimal string
function fromHexQuantity(hex: any) {
  return BigInt(hex).toString();
}

async function getBlockReceipts(blockNumber: number) {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBlockReceipts",
    params: [toHexQuantity(blockNumber)],
  };

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const receipts = data.result || [];
  return receipts.map((r: any) => ({
    blockNumber: parseInt(r.blockNumber, 16),
    blockHash: r.blockHash,
    txHash: r.transactionHash,
    gasUsed: fromHexQuantity(r.gasUsed),
    effectiveGasPrice: fromHexQuantity(r.effectiveGasPrice),
  }));
}
const CONSTANT_PRICE_FEED_FILES = [
  "2024-03",
  "2024-04",
  "2024-05",
  "2024-06",
  "2024-07",
  "2024-08",
  "2024-09",
  "2024-10",
  "2024-11",
  "2024-12",
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
  "2025-05",
  "2025-06",
];
function chunkArray(array: TransactionReceipt[], chunkSize = 1000) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

async function fetchData(url: string, options: any) {
  const response = await fetch(url, {
    ...options,
    //  signal: signal
  });
  if (!response?.ok) {
    throw new Error("Fetch failed");
  }
  return await response.json();
}
export async function getTxReceipts({
  block,
}: {
  block: EthereumBlock;
}): Promise<Map<string, TransactionReceipt> | undefined> {
  let batchReceipt: Map<string, TransactionReceipt> = new Map();
  // const receiptsToSave = [];

  const receipts = await getBlockReceipts(block.number);
  if (receipts) {
    receipts.forEach((r: any) => {
      const newReceipt = TransactionReceipt.create({
        id: (r?.txHash as string)?.toLowerCase(),
        hash: r?.txHash,
        blockId: block?.number?.toString(),
        effectiveGasPrice: r?.effectiveGasPrice,
        gasUsed: r?.gasUsed,
        transactionId: r?.txHash,
        blockNumber: r?.blockNumber,
      });
      batchReceipt.set((r?.txHash as string)?.toLowerCase(), newReceipt);
      // receiptsToSave.push(newReceipt);
    });
    // await store.bulkUpdate("TransactionReceipt", receiptsToSave);
    return batchReceipt;
  }
}
