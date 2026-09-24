import type { EthereumBlock } from "@subql/types-ethereum";
import fetch from "node-fetch";
import { joinUrl, requireEnv } from "../../config/env";
import { PriceFeedMinute } from "../../types";

const PRICE_FEED_ARCHIVE_BASE_URL = requireEnv("PRICE_FEED_ARCHIVE_BASE_URL");
const BINANCE_API_BASE_URL = requireEnv("BINANCE_API_BASE_URL");
const REDSTONE_API_BASE_URL = requireEnv("REDSTONE_API_BASE_URL");
const COINGECKO_API_BASE_URL = requireEnv("COINGECKO_API_BASE_URL");

const MS_IN_MINUTE = 60_000;
const PRICE_BUCKET_MINUTES = 15;
const PRICE_BUCKET_MS = PRICE_BUCKET_MINUTES * MS_IN_MINUTE;
const SOURCE_TIMEZONE_OFFSET_MS = 330 * MS_IN_MINUTE; // Asia/Kolkata

// Existing domain cutoffs, expressed in the legacy epoch-minute ID space.
const GENESIS_MINUTE_ID = 28_312_800;
const HISTORICAL_LAST_MINUTE_ID = 29_147_512;

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

const HISTORICAL_FILE_CACHE_CAP = 2;

type SavedPriceRow = {
  minuteId: number;
  avgPrice: number;
  date: Date;
};

type HistoricalPriceFile = {
  // One canonical source row per 15-minute bucket.
  byBucket: Map<number, SavedPriceRow>;
};

// Each monthly file is several MB. Keep only the current and previous month.
// Promises are cached so concurrent blocks share the same download and parse.
const historicalPriceFileCache = new Map<
  string,
  Promise<HistoricalPriceFile>
>();

async function fetchData(url: string, options: any): Promise<any> {
  const response = await fetch(url, { ...options, timeout: 30_000 });
  if (!response.ok) {
    throw new Error(`Price request returned HTTP ${response.status}`);
  }
  return response.json();
}

function getBucketId(timestampMs: number): number {
  const minuteId = Math.floor(timestampMs / MS_IN_MINUTE);
  return Math.floor(minuteId / PRICE_BUCKET_MINUTES) * PRICE_BUCKET_MINUTES;
}

function getBucketStartMs(bucketId: number): number {
  return bucketId * MS_IN_MINUTE;
}

function getHistoricalFileMonth(bucketId: number): string {
  // The saved files are named by their Asia/Kolkata calendar month, while
  // their timestamps are serialized as UTC. For example, 2025-06.json starts
  // at 2025-05-31T18:30:00.000Z (2025-06-01 00:00 IST).
  return new Date(getBucketStartMs(bucketId) + SOURCE_TIMEZONE_OFFSET_MS)
    .toISOString()
    .slice(0, 7);
}

function createPriceFeed(
  block: EthereumBlock,
  bucketId: number,
  nativePrice: number,
  date: Date,
): PriceFeedMinute {
  return PriceFeedMinute.create({
    id: bucketId.toString(),
    nativeBlockId: block.number.toString(),
    nativePrice,
    date,
  });
}

function normalizeHistoricalRows(
  month: string,
  payload: unknown,
): HistoricalPriceFile {
  if (!Array.isArray(payload)) {
    throw new Error(`Historical price file ${month} is not an array`);
  }

  const byMinute = new Map<number, SavedPriceRow>();

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
    if (existing) {
      if (existing.avgPrice !== avgPrice) {
        throw new Error(
          `Historical price conflict for ${month} minute ${minuteId}`,
        );
      }
      continue;
    }

    byMinute.set(minuteId, { minuteId, avgPrice, date });
  }

  const byBucket = new Map<number, SavedPriceRow>();
  for (const row of byMinute.values()) {
    const bucketId =
      Math.floor(row.minuteId / PRICE_BUCKET_MINUTES) * PRICE_BUCKET_MINUTES;
    const existing = byBucket.get(bucketId);
    if (!existing || row.minuteId < existing.minuteId) {
      byBucket.set(bucketId, row);
    }
  }

  return { byBucket };
}

async function loadHistoricalRows(month: string): Promise<HistoricalPriceFile> {
  if (!CONSTANT_PRICE_FEED_FILES.includes(month)) {
    throw new Error(`No saved price file for ${month}`);
  }

  const cached = historicalPriceFileCache.get(month);
  if (cached) {
    // Refresh insertion order so this month is the most recently used entry.
    historicalPriceFileCache.delete(month);
    historicalPriceFileCache.set(month, cached);
    return cached;
  }

  const request = fetchData(
    joinUrl(PRICE_FEED_ARCHIVE_BASE_URL, `${month}.json`),
    {},
  )
    .then((payload) => normalizeHistoricalRows(month, payload))
    .catch((error) => {
      if (historicalPriceFileCache.get(month) === request) {
        historicalPriceFileCache.delete(month);
      }
      throw error;
    });

  historicalPriceFileCache.set(month, request);
  while (historicalPriceFileCache.size > HISTORICAL_FILE_CACHE_CAP) {
    const oldestKey = historicalPriceFileCache.keys().next().value;
    if (oldestKey === undefined) break;
    historicalPriceFileCache.delete(oldestKey);
  }

  return request;
}

async function getHistoricalPrice(
  block: EthereumBlock,
  bucketId: number,
): Promise<PriceFeedMinute | undefined> {
  const month = getHistoricalFileMonth(bucketId);
  const historicalFile = await loadHistoricalRows(month);
  const sourceRow = historicalFile.byBucket.get(bucketId);

  if (!sourceRow) {
    // A valid file can have an intentional coverage gap. Let the caller use
    // the bounded Binance candle fallback; do not catch file/network or
    // validation errors here.
    return undefined;
  }

  return createPriceFeed(block, bucketId, sourceRow.avgPrice, sourceRow.date);
}

async function getBinancePrice(
  block: EthereumBlock,
  bucketId: number,
): Promise<PriceFeedMinute> {
  const bucketStartMs = getBucketStartMs(bucketId);
  const bucketEndMs = bucketStartMs + PRICE_BUCKET_MS - 1;
  const url =
    `${joinUrl(BINANCE_API_BASE_URL, "api/v3/klines")}?symbol=ETHUSDC` +
    `&interval=15m&limit=1&startTime=${bucketStartMs}&endTime=${bucketEndMs}`;
  const response = await fetchData(url, {});
  const candle = Array.isArray(response) ? response[0] : undefined;

  if (!Array.isArray(candle) || Number(candle[0]) !== bucketStartMs) {
    throw new Error(`No Binance ETH candle for bucket ${bucketId}`);
  }

  const high = Number(candle[2]);
  const low = Number(candle[3]);
  if (
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    high <= 0 ||
    low <= 0 ||
    high < low
  ) {
    throw new Error(`Invalid Binance ETH candle for bucket ${bucketId}`);
  }

  return createPriceFeed(
    block,
    bucketId,
    (high + low) / 2,
    new Date(bucketStartMs),
  );
}

function assertSameBucket(
  sourceTimestampMs: number,
  bucketId: number,
  sourceName: string,
): void {
  if (
    !Number.isFinite(sourceTimestampMs) ||
    getBucketId(sourceTimestampMs) !== bucketId
  ) {
    throw new Error(`${sourceName} timestamp is outside bucket ${bucketId}`);
  }
}

async function getLivePrice(
  block: EthereumBlock,
  bucketId: number,
): Promise<PriceFeedMinute> {
  try {
    const response = await fetchData(
      `${joinUrl(REDSTONE_API_BASE_URL, "prices")}?forceInflux=true&interval=1&symbols=ETH`,
      {},
    );

    if (!response?.ETH) {
      throw new Error("Redstone returned no ETH price");
    }

    const sourceTimestampMs = Number(response.timestamp);
    assertSameBucket(sourceTimestampMs, bucketId, "Redstone");

    const value = Number(response.ETH.value);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Redstone returned an invalid ETH price");
    }

    return createPriceFeed(block, bucketId, value, new Date(sourceTimestampMs));
  } catch (redstoneError) {
    logger.info(`PRICE ERROR REDSTONE API ${redstoneError}`);
    logger.info("TRY PRICE FROM COINGECKO");

    const response = await fetchData(
      `${joinUrl(COINGECKO_API_BASE_URL, "api/v3/simple/price")}?vs_currencies=usd&symbols=eth&include_last_updated_at=true`,
      {},
    );

    if (!response?.eth) {
      throw new Error("CoinGecko returned no ETH price");
    }

    const sourceTimestampMs = Number(response.eth.last_updated_at) * 1000;
    assertSameBucket(sourceTimestampMs, bucketId, "CoinGecko");

    const value = Number(response.eth.usd);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("CoinGecko returned an invalid ETH price");
    }

    return createPriceFeed(block, bucketId, value, new Date(sourceTimestampMs));
  }
}

async function resolvePriceForBucket(
  block: EthereumBlock,
  bucketId: number,
): Promise<PriceFeedMinute> {
  const cacheId = bucketId.toString();
  const existingPrice = await PriceFeedMinute.get(cacheId);
  if (existingPrice) {
    return existingPrice;
  }

  if (bucketId < GENESIS_MINUTE_ID) {
    const price = createPriceFeed(
      block,
      bucketId,
      2.4,
      new Date(getBucketStartMs(bucketId)),
    );
    await price.save();
    return price;
  }

  let price: PriceFeedMinute;
  if (bucketId <= HISTORICAL_LAST_MINUTE_ID) {
    const historicalPrice = await getHistoricalPrice(block, bucketId);
    price = historicalPrice ?? (await getBinancePrice(block, bucketId));
  } else if (bucketId < getBucketId(Date.now())) {
    // A completed bucket is fetched as one bounded 15-minute candle.
    price = await getBinancePrice(block, bucketId);
  } else {
    price = await getLivePrice(block, bucketId);
  }

  await price.save();
  return price;
}

export async function handleNewPriceMinute({
  block,
}: {
  block: EthereumBlock;
}): Promise<PriceFeedMinute> {
  const timestampMs = Number(block.timestamp) * 1000;
  if (!Number.isFinite(timestampMs)) {
    throw new Error(`Invalid block timestamp ${String(block.timestamp)}`);
  }

  const bucketId = getBucketId(timestampMs);
  return resolvePriceForBucket(block, bucketId);
}
