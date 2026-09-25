import type { EthereumBlock } from "@subql/types-ethereum";
import fetch from "../network/httpFetch";

// These endpoints returned complete receipts for the stalled block in VPS checks.
// Keep this pool separate from the SubQuery block-fetch endpoints.
const rpcUrls = [
  "https://ethereum-rpc.publicnode.com",
  "https://eth.drpc.org",
  "https://rpc.mevblocker.io",
];
const RPC_TIMEOUT_MS = 10000;

export type ValidReceipt = {
  txHash: string;
  blockNumber: number;
  gasUsed: number;
  effectiveGasPrice: number;
  blobGasUsed: number;
  blobGasPrice: number;
};

function toHexQuantity(value: number): string {
  return `0x${BigInt(value).toString(16)}`;
}

function fromHexQuantityNumber(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value)) {
    return undefined;
  }
  const number = BigInt(value);
  return number <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(number) : undefined;
}

async function fetchBlockReceipts(
  rpcUrl: string,
  blockNumber: number,
): Promise<unknown[]> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `b:${blockNumber}`,
      method: "eth_getBlockReceipts",
      params: [toHexQuantity(blockNumber)],
    }),
    timeout: RPC_TIMEOUT_MS,
  });
  if (!response.ok) {
    throw new Error(`Receipt RPC returned HTTP ${response.status}`);
  }
  const payload = await response.json();
  if (payload?.error) {
    throw new Error(`Receipt RPC error: ${payload.error.message}`);
  }
  if (!Array.isArray(payload?.result)) {
    throw new Error("Receipt RPC returned an invalid result");
  }
  return payload.result;
}

function parseBlobReceipt(
  item: unknown,
  blockNumber: number,
  blockHash: string,
  blobTxHashes: Set<string>,
): ValidReceipt | undefined {
  if (!item || typeof item !== "object") return undefined;
  const receipt = item as Record<string, unknown>;
  const txHash = receipt.transactionHash;
  if (typeof txHash !== "string" || !blobTxHashes.has(txHash.toLowerCase())) {
    return undefined;
  }

  const receiptBlockNumber = fromHexQuantityNumber(receipt.blockNumber);
  const gasUsed = fromHexQuantityNumber(receipt.gasUsed);
  const effectiveGasPrice = fromHexQuantityNumber(receipt.effectiveGasPrice);
  const blobGasUsed = fromHexQuantityNumber(receipt.blobGasUsed);
  const blobGasPrice = fromHexQuantityNumber(receipt.blobGasPrice);
  if (
    receiptBlockNumber !== blockNumber ||
    typeof receipt.blockHash !== "string" ||
    receipt.blockHash.toLowerCase() !== blockHash.toLowerCase() ||
    gasUsed === undefined ||
    effectiveGasPrice === undefined ||
    blobGasUsed === undefined ||
    blobGasPrice === undefined
  ) {
    return undefined;
  }

  return {
    txHash,
    blockNumber,
    gasUsed,
    effectiveGasPrice,
    blobGasUsed,
    blobGasPrice,
  };
}

export async function getTxReceipts({
  block,
}: {
  block: EthereumBlock;
}): Promise<Map<string, ValidReceipt>> {
  const receipts = new Map<string, ValidReceipt>();
  const blobTxHashes = new Set(
    block.transactions
      .filter((transaction) => transaction.type?.toLowerCase() === "0x3")
      .map((transaction) => transaction.hash.toLowerCase()),
  );
  if (blobTxHashes.size === 0) return receipts;

  const blockNumber = Number(block.number);
  const firstEndpoint = blockNumber % rpcUrls.length;
  let lastError: unknown = new Error("No receipt RPC endpoint succeeded");

  for (let attempt = 0; attempt < rpcUrls.length; attempt++) {
    const rpcUrl = rpcUrls[(firstEndpoint + attempt) % rpcUrls.length];
    try {
      const result = await fetchBlockReceipts(rpcUrl, blockNumber);
      const valid = new Map<string, ValidReceipt>();
      for (const item of result) {
        const receipt = parseBlobReceipt(
          item,
          blockNumber,
          block.hash,
          blobTxHashes,
        );
        if (receipt) valid.set(receipt.txHash.toLowerCase(), receipt);
      }
      if (valid.size !== blobTxHashes.size) {
        throw new Error(
          `Receipt RPC returned ${valid.size}/${blobTxHashes.size} blob receipts`,
        );
      }
      for (const [hash, receipt] of valid) receipts.set(hash, receipt);
      return receipts;
    } catch (error) {
      lastError = error;
      logger.warn(
        `Receipt RPC attempt ${attempt + 1} failed for block ${blockNumber}: ${error}`,
      );
    }
  }

  throw new Error(
    `Could not fetch complete receipts for block ${blockNumber}: ${lastError}`,
  );
}
