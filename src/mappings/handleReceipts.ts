import { EthereumBlock } from "@subql/types-ethereum";
import { TransactionReceipt } from "../types";
import fetch from "node-fetch";

const rpcUrls = [
  "https://eth.drpc.org",
  "https://1.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
];

// Pick a random index
const RPC_URL = rpcUrls[Math.floor(Math.random() * rpcUrls.length)];

console.log("Using RPC:", RPC_URL);

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
}): Promise<Map<string, TransactionReceipt>> {
  let batchReceipt: Map<string, TransactionReceipt> = new Map();
  // const receiptsToSave = [];
  try {
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
    }
    return batchReceipt;
  } catch (error) {
    logger.info(`ERROR::: batchReceipt ::  ${error}`);
    return batchReceipt;
  }
}
