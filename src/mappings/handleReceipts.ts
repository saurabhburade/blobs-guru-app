import { EthereumBlock } from "@subql/types-ethereum";
import { TransactionReceipt } from "../types";
import fetch from "node-fetch";

const rpcUrls = [
  "https://eth.drpc.org",
  "https://1.rpc.hypersync.xyz",
  "https://eth-traces.rpc.hypersync.xyz",
];
const RPC_URL = rpcUrls[Math.floor(Math.random() * rpcUrls.length)];
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

  if (block?.number < 23460919) {
    for (let index = 0; index < block?.transactions.length; index++) {
      const tx = block?.transactions[index];
      if (tx.type !== "0x3") {
        continue;
      }
      const r = await TransactionReceipt.get(
        (tx?.hash as string)?.toLowerCase()
      );
      if (r) {
        batchReceipt.set((tx?.hash as string)?.toLowerCase(), r);
      } else {
        if (block?.number > 19426500 || block?.number < 23460919) {
          let fileIdx = 0;
          for (let filesIndex = 1; filesIndex <= FILES_COUNT; filesIndex++) {
            const data = await fetchData(
              `https://raw.githubusercontent.com/saurabhburade/eth-subql-starter/refs/heads/dev/scripts/receipts/receipts-${fileIdx}.json`,
              {}
            );
            logger.info(
              `FETCHED PRICE DATA FROM FILE :: receipts-${fileIdx}.json`
            );
            const receiptsToSave: TransactionReceipt[] = [];
            for (const element of data) {
              const newReceipt = TransactionReceipt.create({
                id: (element?.txHash as string)?.toLowerCase(),
                hash: element?.txHash,
                blockId: element?.blockNumber?.toString(),
                effectiveGasPrice: element?.effectiveGasPrice?.toNumber(),
                gasUsed: element?.gasUsed?.toNumber(),
                transactionId: element?.txHash,
                blockNumber: element?.blockNumber,
              });
              receiptsToSave.push(newReceipt);
              if (element?.blockNumber === block.number) {
                batchReceipt.set(
                  (element?.txHash as string)?.toLowerCase(),
                  newReceipt
                );
              }
            }
            const splitedChunk = chunkArray(receiptsToSave, 1000);
            for (let index = 0; index < splitedChunk.length; index++) {
              logger.info(`SAVING RECEIPTS CHUNK`);

              const ck = splitedChunk[index];
              await store.bulkUpdate("TransactionReceipt", ck);
              logger.info(
                `SAVED RECEIPTS CHUNK :: ${index} out of ${splitedChunk.length}`
              );
            }
            fileIdx += 1;
          }

          return batchReceipt;
        } else {
          const receiptRaw = await api.getTransactionReceipt(tx?.hash);
          const newReceipt = TransactionReceipt.create({
            id: (receiptRaw?.transactionHash as string)?.toLowerCase(),
            hash: receiptRaw?.transactionHash,
            blockId: block?.number?.toString(),
            effectiveGasPrice: receiptRaw?.effectiveGasPrice?.toNumber(),
            gasUsed: receiptRaw?.gasUsed?.toNumber(),
            transactionId: receiptRaw?.transactionHash,
            blockNumber: receiptRaw?.blockNumber,
          });
          batchReceipt.set((tx?.hash as string)?.toLowerCase(), newReceipt);
        }
      }
    }
  } else {
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
      });
    }
    return batchReceipt;
  }
}
