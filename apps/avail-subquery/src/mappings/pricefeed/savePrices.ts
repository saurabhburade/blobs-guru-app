import { ethers } from "ethers";
import OneinchABI from "../../../abis/OneinchABI.abi.json";
import { joinUrl } from "../../config/env";
import fetch from "../../network/httpFetch";
import { PriceFeedMinute } from "../../types";
import { ORACLE_ADDRESS } from "../helper";
import type { CorrectSubstrateBlock } from "../mappingHandlers";

// Mapping workers run in a sandbox where process.env is unavailable.
const ETH_PRICE_RPC_URL = "https://eth.drpc.org";
const PRICE_FEED_ARCHIVE_BASE_URL =
  "https://raw.githubusercontent.com/saurabhburade/blobs-guru-app/refs/heads/main/apps/avail-subquery/src/mappings/pricefeed/saved";
const DEX_GURU_API_BASE_URL = "https://api.dev.dex.guru";
const DEFILLAMA_API_BASE_URL = "https://coins.llama.fi";
const ETHERSCAN_API_BASE_URL = "https://api.etherscan.io";
const DEX_GURU_API_KEY = "";
const ETHERSCAN_API_KEY = "";

const MS_IN_MINUTE = 60_000;
const PRICE_BUCKET_MINUTES = 15;
const PRICE_BUCKET_MS = PRICE_BUCKET_MINUTES * MS_IN_MINUTE;
const SOURCE_TIMEZONE_OFFSET_MS = 330 * MS_IN_MINUTE; // Archive filenames use Asia/Kolkata months.
const FIRST_ARCHIVED_MINUTE_ID = 28_696_059;
const HISTORICAL_LAST_MINUTE_ID = 29_164_030;
const HISTORICAL_FILE_CACHE_CAP = 2;
const HISTORICAL_FILES = [
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

const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const AVAIL_ADDRESS = "0xEeB4d8400AEefafC1B2953e0094134A887C76Bd8";
const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";

type SavedPriceRow = { minuteId: number; avgPrice: number; date: Date };
type HistoricalPriceFile = { byBucket: Map<number, SavedPriceRow> };
const historicalFileCache = new Map<string, Promise<HistoricalPriceFile>>();

function getBucketId(timestampMs: number): number {
  const minuteId = Math.floor(timestampMs / MS_IN_MINUTE);
  return Math.floor(minuteId / PRICE_BUCKET_MINUTES) * PRICE_BUCKET_MINUTES;
}

function getBucketStartMs(bucketId: number): number {
  return bucketId * MS_IN_MINUTE;
}

function createPrice(
  block: CorrectSubstrateBlock,
  id: string,
  availPrice: number,
  date: Date,
  ethPrice = 0,
  ethBlock = 0,
): PriceFeedMinute {
  return PriceFeedMinute.create({
    id,
    availBlock: block.block.header.number.toNumber(),
    availPrice,
    ethBlock,
    ethPrice,
    date,
    availDate: date,
    ethDate: date,
  });
}

async function fetchData<T = unknown>(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {},
): Promise<T> {
  const response = await fetch(url, { ...options, timeout: 30_000 });
  if (!response.ok)
    throw new Error(`Price request returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

function normalizeHistoricalRows(
  month: string,
  payload: unknown,
): HistoricalPriceFile {
  if (!Array.isArray(payload))
    throw new Error(`Historical price file ${month} is not an array`);
  const byMinute = new Map<number, SavedPriceRow>();
  let correctedMinutes = 0;
  for (const rawRow of payload) {
    if (typeof rawRow !== "object" || rawRow === null) {
      throw new Error(`Historical price file ${month} contains an invalid row`);
    }
    const row = rawRow as Record<string, unknown>;
    const minuteId = Number(row.minuteId);
    const avgPrice = Number(row.avgPrice);
    const timestamp = Number(row.timestamp);
    const date = Number.isFinite(timestamp)
      ? new Date(timestamp)
      : new Date(String(row.timestampF));
    if (
      !Number.isSafeInteger(minuteId) ||
      !Number.isFinite(avgPrice) ||
      avgPrice <= 0 ||
      Number.isNaN(date.getTime())
    ) {
      throw new Error(`Historical price file ${month} contains invalid data`);
    }
    const existing = byMinute.get(minuteId);
    if (existing && existing.avgPrice !== avgPrice) {
      correctedMinutes++;
    }
    // The final occurrence matches the value applied by the old importer.
    byMinute.set(minuteId, { minuteId, avgPrice, date });
  }
  if (correctedMinutes > 0) {
    logger.info(
      `Applied ${correctedMinutes} archived price corrections for ${month}`,
    );
  }
  const byBucket = new Map<number, SavedPriceRow>();
  for (const row of byMinute.values()) {
    const bucketId =
      Math.floor(row.minuteId / PRICE_BUCKET_MINUTES) * PRICE_BUCKET_MINUTES;
    const existing = byBucket.get(bucketId);
    if (!existing || row.minuteId < existing.minuteId)
      byBucket.set(bucketId, row);
  }
  return { byBucket };
}

async function loadHistoricalRows(month: string): Promise<HistoricalPriceFile> {
  if (!HISTORICAL_FILES.includes(month))
    throw new Error(`No saved price file for ${month}`);
  const cached = historicalFileCache.get(month);
  if (cached) {
    historicalFileCache.delete(month);
    historicalFileCache.set(month, cached);
    return cached;
  }
  const request = fetchData(
    joinUrl(PRICE_FEED_ARCHIVE_BASE_URL, `${month}.json`),
  )
    .then((payload) => normalizeHistoricalRows(month, payload))
    .catch((error) => {
      if (historicalFileCache.get(month) === request)
        historicalFileCache.delete(month);
      throw error;
    });
  historicalFileCache.set(month, request);
  while (historicalFileCache.size > HISTORICAL_FILE_CACHE_CAP) {
    const oldest = historicalFileCache.keys().next().value;
    if (oldest === undefined) break;
    historicalFileCache.delete(oldest);
  }
  return request;
}

async function getHistoricalPrice(
  block: CorrectSubstrateBlock,
  bucketId: number,
): Promise<PriceFeedMinute | undefined> {
  const month = new Date(getBucketStartMs(bucketId) + SOURCE_TIMEZONE_OFFSET_MS)
    .toISOString()
    .slice(0, 7);
  const sourceRow = (await loadHistoricalRows(month)).byBucket.get(bucketId);
  return sourceRow
    ? createPrice(
        block,
        bucketId.toString(),
        sourceRow.avgPrice,
        sourceRow.date,
      )
    : undefined;
}

async function getDexGuruPrice(
  block: CorrectSubstrateBlock,
  bucketId: number,
): Promise<PriceFeedMinute> {
  const startMs = getBucketStartMs(bucketId);
  const endMs = startMs + PRICE_BUCKET_MS - 1;
  const url = `${joinUrl(DEX_GURU_API_BASE_URL, "v1/tradingview/history")}?symbol=0xeeb4d8400aeefafc1b2953e0094134a887c76bd8-eth_USD&resolution=1&from=${Math.floor(startMs / 1000)}&to=${Math.floor(endMs / 1000)}&currencyCode=USD&api-key=${DEX_GURU_API_KEY}`;
  const response = await fetchData<{
    t?: unknown[];
    o?: unknown[];
    c?: unknown[];
  }>(url);
  if (
    !Array.isArray(response?.t) ||
    !Array.isArray(response?.o) ||
    !Array.isArray(response?.c)
  ) {
    throw new Error(`DexGuru returned no AVAIL price for bucket ${bucketId}`);
  }
  let first: { timestampMs: number; price: number } | undefined;
  for (let index = 0; index < response.t.length; index++) {
    const timestampMs = Number(response.t[index]) * 1000;
    const open = Number(response.o[index]);
    const close = Number(response.c[index]);
    if (getBucketId(timestampMs) !== bucketId) continue;
    if (
      !Number.isFinite(open) ||
      !Number.isFinite(close) ||
      open <= 0 ||
      close <= 0
    )
      continue;
    if (!first || timestampMs < first.timestampMs)
      first = { timestampMs, price: (open + close) / 2 };
  }
  if (!first)
    throw new Error(
      `DexGuru returned no valid AVAIL price for bucket ${bucketId}`,
    );
  return createPrice(
    block,
    bucketId.toString(),
    first.price,
    new Date(first.timestampMs),
  );
}

async function getEthereumBlockAt(timestampMs: number): Promise<number> {
  try {
    const response = await fetchData<{ height?: unknown }>(
      joinUrl(
        DEFILLAMA_API_BASE_URL,
        `block/ethereum/${Math.floor(timestampMs / 1000)}`,
      ),
    );
    const height = Number(response?.height);
    if (Number.isSafeInteger(height) && height > 0) return height;
    throw new Error("DefiLlama returned no Ethereum block height");
  } catch (error) {
    if (!ETHERSCAN_API_KEY) throw error;
    const url = `${joinUrl(ETHERSCAN_API_BASE_URL, "api")}?module=block&action=getblocknobytime&timestamp=${Math.floor(timestampMs / 1000)}&closest=before&apikey=${ETHERSCAN_API_KEY}`;
    const response = await fetchData<{ result?: unknown }>(url);
    const height = Number(response?.result);
    if (!Number.isSafeInteger(height) || height <= 0)
      throw new Error("Etherscan returned no Ethereum block height");
    return height;
  }
}

async function getOraclePrice(
  block: CorrectSubstrateBlock,
  bucketId: number,
): Promise<PriceFeedMinute> {
  const startMs = getBucketStartMs(bucketId);
  const ethBlock = await getEthereumBlockAt(startMs);
  const oracle = new ethers.utils.Interface(OneinchABI);
  async function getRate(token: string): Promise<number> {
    const data = oracle.encodeFunctionData("getRate", [
      token,
      USDT_ADDRESS,
      false,
    ]);
    const response = await fetchData<{ result?: unknown; error?: unknown }>(
      ETH_PRICE_RPC_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: ORACLE_ADDRESS, data }, `0x${ethBlock.toString(16)}`],
        }),
      },
    );
    if (typeof response?.result !== "string")
      throw new Error(
        `Ethereum oracle failed: ${JSON.stringify(response?.error)}`,
      );
    const rate =
      Number(
        oracle.decodeFunctionResult("getRate", response.result)[0].toString(),
      ) / 1e6;
    if (!Number.isFinite(rate) || rate <= 0)
      throw new Error("Ethereum oracle returned an invalid price");
    return rate;
  }
  const [availPrice, ethPrice] = await Promise.all([
    getRate(AVAIL_ADDRESS),
    getRate(WETH_ADDRESS),
  ]);
  return createPrice(
    block,
    bucketId.toString(),
    availPrice,
    new Date(startMs),
    ethPrice,
    ethBlock,
  );
}

async function getExternalPrice(
  block: CorrectSubstrateBlock,
  bucketId: number,
): Promise<PriceFeedMinute> {
  if (!DEX_GURU_API_KEY) return getOraclePrice(block, bucketId);
  try {
    return await getDexGuruPrice(block, bucketId);
  } catch (error) {
    logger.info(`PRICE ERROR DEXGURU API ${error}`);
    return getOraclePrice(block, bucketId);
  }
}

export async function handleNewPriceMinute({
  block,
}: {
  block: CorrectSubstrateBlock;
}): Promise<PriceFeedMinute> {
  const timestampMs = Number(block.timestamp.getTime());
  if (!Number.isFinite(timestampMs))
    throw new Error("Invalid Avail block timestamp");
  const minuteId = Math.floor(timestampMs / MS_IN_MINUTE);

  if (minuteId < FIRST_ARCHIVED_MINUTE_ID) {
    // The first archive price arrives inside a UTC bucket. Keep one separate
    // zero-price sentinel for earlier blocks so that bucket can have its real price.
    const existing = await PriceFeedMinute.get("prelaunch");
    if (existing) return existing;
    const zero = createPrice(block, "prelaunch", 0, new Date(timestampMs));
    await zero.save();
    return zero;
  }

  const bucketId = getBucketId(timestampMs);
  const existing = await PriceFeedMinute.get(bucketId.toString());
  if (existing) return existing;

  let price: PriceFeedMinute;
  if (
    bucketId <=
    Math.floor(HISTORICAL_LAST_MINUTE_ID / PRICE_BUCKET_MINUTES) *
      PRICE_BUCKET_MINUTES
  ) {
    price =
      (await getHistoricalPrice(block, bucketId)) ??
      (await getExternalPrice(block, bucketId));
  } else {
    price = await getExternalPrice(block, bucketId);
  }
  await price.save();
  return price;
}
