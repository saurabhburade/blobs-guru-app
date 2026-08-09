export type DaChain = "celestia" | "avail";
export type DaNode = Record<string, unknown>;

type GraphqlResponse = {
  data?: Record<string, unknown>;
  errors?: Array<{ message?: string }>;
};

const endpoints: Record<DaChain, string> = {
  celestia: "https://celestiaapi.blobs.guru/",
  avail: "https://availapi.blobs.guru/",
};

export async function queryDa<T extends GraphqlResponse = GraphqlResponse>(
  chain: DaChain,
  query: string,
  variables: Record<string, unknown> = {},
  revalidateSeconds?: number,
): Promise<T> {
  const cacheOptions =
    revalidateSeconds === undefined
      ? { cache: "no-store" as const }
      : { next: { revalidate: revalidateSeconds, tags: [`da:${chain}`] } };

  try {
    const response = await fetch(endpoints[chain], {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(10_000),
      ...cacheOptions,
    });

    if (!response.ok) return { data: {} } as T;

    const result = (await response.json()) as T;
    return result.errors?.length ? ({ data: {} } as T) : result;
  } catch {
    return { data: {} } as T;
  }
}

export function nodes(data: GraphqlResponse, field: string): DaNode[] {
  const value = data.data?.[field] as { nodes?: DaNode[] } | undefined;
  return value?.nodes ?? [];
}

export function one(data: GraphqlResponse, field: string): DaNode | null {
  const value = data.data?.[field];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as DaNode;
  }
  return nodes(data, field)[0] ?? null;
}

const COLLECTIVE_QUERY = {
  celestia: `query { collectiveData { nodes { totalByteSize totalBlocksCount totalDataSubmissionCount totalFeesNative totalDAFees totalDAFeesUSD totalTxnCount avgNativePrice endBlock timestampLast } } }`,
  avail: `query { collectiveData { nodes { totalByteSize totalBlocksCount totalDataSubmissionCount totalFees totalDAFees totalDAFeesUSD totalExtrinsicCount avgAvailPrice avgEthPrice endBlock timestampLast } } }`,
};

const DAY_QUERY = {
  celestia: `query Days($duration: Int, $limit: Int) { collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id timestampLast timestampStart totalByteSize totalTxnCount totalDataSubmissionCount totalDAFees totalDAFeesUSD totalFeesUSD appDayDataParticipant(first: $limit, orderBy: TOTAL_TXN_COUNT_DESC, filter: { type: { equalTo: 0 } }) { nodes { appId totalTxnCount totalByteSize totalDataSubmissionCount totalDAFees totalDAFeesUSD } } appDayDataParticipantOthers: appDayDataParticipant(orderBy: TOTAL_BYTE_SIZE_DESC, offset: $limit, filter: { type: { equalTo: 0 } }) { aggregates { sum { totalTxnCount totalByteSize totalDataSubmissionCount totalDAFees totalDAFeesUSD } } } } } }`,
  avail: `query Days($duration: Int, $limit: Int) { collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id timestampLast timestampStart totalByteSize totalExtrinsicCount totalDataSubmissionCount totalDAFees totalDAFeesUSD totalFeesUSD totalFeesAvail appDayDataParticipant(orderBy: TOTAL_BYTE_SIZE_DESC) { nodes { appId app { id name } totalByteSize totalExtrinsicCount totalDataSubmissionCount totalFeesUSD totalDAFeesUSD totalFeesAvail } } accountDayDataParticipant(first: $limit, orderBy: TOTAL_EXTRINSIC_COUNT_DESC, filter: { type: { equalTo: 0 } }) { nodes { accountId totalExtrinsicCount } } accountDayDataParticipantOthers: accountDayDataParticipant(orderBy: TOTAL_EXTRINSIC_COUNT_DESC, offset: $limit, filter: { type: { equalTo: 0 } }) { aggregates { sum { totalExtrinsicCount } } } } } }`,
};

const PRICE_QUERY = {
  celestia: `query Prices($duration: Int) { collectiveDayData(first: $duration, orderBy: ID_DESC) { nodes { id timestampLast timestampStart avgNativePrice totalByteSize totalDataSubmissionCount totalDAFees totalDAFeesUSD } } }`,
  avail: `query Prices($duration: Int) { collectiveDayData(first: $duration, orderBy: ID_DESC) { nodes { id timestampLast timestampStart avgAvailPrice avgEthPrice totalByteSize totalDataSubmissionCount totalDAFees totalDAFeesUSD } } }`,
};

const AVAIL_UTILISATION_QUERY = `query DataSubmission($timestamps: [Datetime!]!) { dataSubmissions(filter: { timestamp: { in: $timestamps } }) { totalCount aggregates { sum { byteSize } } } }`;

const APPS_QUERY = {
  celestia: `query Apps($limit: Int, $skip: Int) { appEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip) { totalCount nodes { id name totalByteSize totalFeesNative totalFeesUSD totalTxnCount totalDAFees totalDAFeesUSD totalDataSubmissionCount } } }`,
  avail: `query Apps($limit: Int, $skip: Int) { appEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip) { totalCount nodes { id name totalByteSize totalFeesAvail totalFeesUSD totalExtrinsicCount totalDAFees totalDAFeesUSD totalDataSubmissionCount } } }`,
};

const ACCOUNTS_QUERY = {
  celestia: `query Accounts($limit: Int, $skip: Int) { accountEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip, filter: { type: { equalTo: 0 } }) { totalCount nodes { id totalByteSize totalFees totalFeesUSD totalTxnCount totalDAFees totalDAFeesUSD totalDataSubmissionCount } } }`,
  avail: `query Accounts($limit: Int, $skip: Int) { accountEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip, filter: { type: { equalTo: 0 } }) { totalCount nodes { id totalByteSize totalFees totalFeesUSD totalExtrinsicCount totalDAFees totalDAFeesUSD totalDataSubmissionCount } } }`,
};

const BLOCKS_QUERY = {
  celestia: `query Blocks($limit: Int, $skip: Int) { blockData(orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) { totalCount nodes { id timestamp totalBlobSize totalBlobTransactionCount totalTransactionCount totalEventsCount totalBlockFeeNatve totalBlockFeeUSD } } }`,
  avail: `query Blocks($limit: Int, $skip: Int) { blocks(orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) { totalCount nodes { id timestamp blockFee nbExtrinsics nbEvents availPrice } } }`,
};

const AVAIL_SUMMARY_BLOCKS_QUERY = `query Blocks($limit: Int, $skip: Int) { blocks(orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) { totalCount nodes { id timestamp blockFee nbExtrinsics nbEvents availPrice extrinsics { nodes { dataSubmissions { totalCount aggregates { sum { byteSize } } } } } } } }`;

const ACTIVITY_QUERY = {
  celestia: {
    account: `query Activity($id: String!, $limit: Int, $skip: Int) { transactionData(filter: { signerId: { equalTo: $id } }, orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) { totalCount nodes { id hash timestamp signerId totalBytes txFeeNative txFeeUSD blockHeightId index nEvents } } }`,
    app: `query Activity($id: String!, $limit: Int, $skip: Int) { transactionData(filter: { blobs: { some: { namespaceID: { like: $id } } } }, orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) { totalCount nodes { id hash timestamp signerId totalBytes txFeeNative txFeeUSD blockHeightId index nEvents } } }`,
  },
  avail: {
    account: `query Activity($id: String!, $limit: Int, $skip: Int) { extrinsics(filter: { signer: { equalTo: $id } }, orderBy: TIMESTAMP_DESC, first: $limit, offset: $skip) { totalCount nodes { id signer fees timestamp module blockHeight extrinsicIndex nbEvents dataSubmissions { totalCount aggregates { sum { byteSize fees feesUSD } } } } } }`,
  },
};

const SEARCH_QUERY = {
  celestia: `query Search($query: String!) { accountEntities(filter: { address: { includesInsensitive: $query }, type: { equalTo: 0 } }, first: 5) { nodes { id } } appEntities(filter: { id: { includesInsensitive: $query } }, first: 5) { nodes { id name } } }`,
  avail: `query Search($query: String!) { accountEntities(filter: { address: { includesInsensitive: $query }, type: { equalTo: 0 } }, first: 5) { nodes { id } } appEntities(filter: { name: { includesInsensitive: $query } }, first: 5) { nodes { id name } } }`,
};

export async function getSummary(chain: DaChain, blocksPage = 1) {
  const safeBlocksPage = normalizePage(blocksPage);
  const [summary, days, prices, blocks, appData] = await Promise.all([
    queryDa(chain, COLLECTIVE_QUERY[chain], {}, 60),
    queryDa(chain, DAY_QUERY[chain], { duration: 30, limit: 5 }, 300),
    queryDa(chain, PRICE_QUERY[chain], { duration: 60 }, 300),
    queryDa(
      chain,
      chain === "avail" ? AVAIL_SUMMARY_BLOCKS_QUERY : BLOCKS_QUERY[chain],
      { limit: LIST_PAGE_SIZE, skip: LIST_PAGE_SIZE * (safeBlocksPage - 1) },
      60,
    ),
    queryDa(chain, APPS_QUERY[chain], { limit: 4, skip: 0 }, 300),
  ]);
  const blockRows = nodes(
    blocks,
    chain === "celestia" ? "blockData" : "blocks",
  );
  const normalizedBlocks =
    chain === "avail"
      ? blockRows.map((block) => {
          const extrinsics = block.extrinsics as
            | { nodes?: Array<{ dataSubmissions?: DaNode }> }
            | undefined;
          const totals = (extrinsics?.nodes ?? []).reduce(
            (result, extrinsic) => {
              const submissions = extrinsic.dataSubmissions;
              const aggregates = submissions?.aggregates as DaNode | undefined;
              const sum = aggregates?.sum as DaNode | undefined;
              result.totalByteSize += Number(sum?.byteSize ?? 0);
              result.totalDataSubmissionCount += Number(
                submissions?.totalCount ?? 0,
              );
              return result;
            },
            { totalByteSize: 0, totalDataSubmissionCount: 0 },
          );
          const { extrinsics: _extrinsics, ...serializableBlock } = block;
          return { ...serializableBlock, ...totals };
        })
      : blockRows;
  return {
    summary: one(summary, "collectiveData"),
    days: nodes(days, "collectiveDayData"),
    prices: nodes(prices, "collectiveDayData"),
    blocks: normalizedBlocks,
    blocksPage: safeBlocksPage,
    blocksPageSize: LIST_PAGE_SIZE,
    blocksTotalCount: Number(
      (
        blocks.data?.[chain === "celestia" ? "blockData" : "blocks"] as
          | { totalCount?: number }
          | undefined
      )?.totalCount ?? 0,
    ),
    apps: nodes(appData, "appEntities"),
  };
}

const LIST_PAGE_SIZE = 10;

function normalizePage(page: number) {
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function getApps(chain: DaChain, page = 1) {
  const safePage = normalizePage(page);
  const result = await queryDa(
    chain,
    APPS_QUERY[chain],
    { limit: LIST_PAGE_SIZE, skip: LIST_PAGE_SIZE * (safePage - 1) },
    300,
  );
  const entity = result.data?.appEntities as
    | { totalCount?: number; nodes?: DaNode[] }
    | undefined;
  return {
    rows: entity?.nodes ?? [],
    totalCount: Number(entity?.totalCount ?? 0),
    page: safePage,
    pageSize: LIST_PAGE_SIZE,
  };
}

export async function getAccounts(chain: DaChain, page = 1) {
  const safePage = normalizePage(page);
  const result = await queryDa(
    chain,
    ACCOUNTS_QUERY[chain],
    { limit: LIST_PAGE_SIZE, skip: LIST_PAGE_SIZE * (safePage - 1) },
    300,
  );
  const entity = result.data?.accountEntities as
    | { totalCount?: number; nodes?: DaNode[] }
    | undefined;
  return {
    rows: entity?.nodes ?? [],
    totalCount: Number(entity?.totalCount ?? 0),
    page: safePage,
    pageSize: LIST_PAGE_SIZE,
  };
}

export async function getActivity(
  chain: "celestia",
  kind: "account" | "app",
  id: string,
  page?: number,
): Promise<{
  rows: DaNode[];
  totalCount: number;
  page: number;
  pageSize: number;
}>;
export async function getActivity(
  chain: "avail",
  kind: "account",
  id: string,
  page?: number,
): Promise<{
  rows: DaNode[];
  totalCount: number;
  page: number;
  pageSize: number;
}>;
export async function getActivity(
  chain: DaChain,
  kind: "account" | "app",
  id: string,
  page = 1,
) {
  const safePage = normalizePage(page);
  const query =
    chain === "celestia"
      ? ACTIVITY_QUERY.celestia[kind]
      : kind === "account"
        ? ACTIVITY_QUERY.avail.account
        : null;
  if (!query) {
    return {
      rows: [],
      totalCount: 0,
      page: safePage,
      pageSize: LIST_PAGE_SIZE,
    };
  }
  const result = await queryDa(
    chain,
    query,
    {
      id,
      limit: LIST_PAGE_SIZE,
      skip: LIST_PAGE_SIZE * (safePage - 1),
    },
    undefined,
  );
  const field = chain === "avail" ? "extrinsics" : "transactionData";
  const connection = result.data?.[field] as
    | { totalCount?: number; nodes?: DaNode[] }
    | undefined;
  return {
    rows: connection?.nodes ?? [],
    totalCount: Number(connection?.totalCount ?? 0),
    page: safePage,
    pageSize: LIST_PAGE_SIZE,
  };
}

export async function getStats(chain: DaChain, duration = 90) {
  const [summary, days, prices, blockData] = await Promise.all([
    queryDa(chain, COLLECTIVE_QUERY[chain], {}, 60),
    queryDa(chain, DAY_QUERY[chain], { duration, limit: 5 }, 300),
    queryDa(chain, PRICE_QUERY[chain], { duration }, 300),
    queryDa(chain, BLOCKS_QUERY[chain], { limit: 100 }, 60),
  ]);
  const blocks = nodes(
    blockData,
    chain === "celestia" ? "blockData" : "blocks",
  );
  const availUtilisation =
    chain === "avail"
      ? await queryDa(
          "avail",
          AVAIL_UTILISATION_QUERY,
          {
            timestamps: blocks.map((block) => block.timestamp).filter(Boolean),
          },
          60,
        )
      : undefined;
  return {
    summary: one(summary, "collectiveData"),
    days: nodes(days, "collectiveDayData"),
    prices: nodes(prices, "collectiveDayData"),
    blocks,
    utilization:
      chain === "avail" ? one(availUtilisation ?? {}, "dataSubmissions") : null,
  };
}

const DETAIL_QUERIES = {
  celestia: {
    app: `query App($id: String!) { appEntity(id: $id) { id name totalByteSize totalFeesNative totalTxnCount totalDAFees totalDAFeesUSD totalDataSubmissionCount appHourData(first: 24) { nodes { id timestampLast timestampStart totalByteSize } } } }`,
    account: `query Account($id: String!) { accountEntity(id: $id) { id totalByteSize totalFees totalTxnCount totalDAFees totalDAFeesUSD totalDataSubmissionCount totalFeesNative } }`,
    block: `query Block($id: String!) { blockDatum(id: $id) { id hash height timestamp proposer avgNativePrice totalBlockFeeUSD totalBlobSize totalEventsCount totalTransactionCount totalBlobTransactionCount } }`,
    txn: `query Txn($id: String!) { transactionDatum(id: $id) { id hash timestamp txFeeNative txFeeUSD blockHeightId nEvents totalBytes signerId blockHeight { currentNativePrice } } }`,
  },
  avail: {
    app: `query App($id: String!) { appEntity(id: $id) { id name totalByteSize totalFeesAvail totalExtrinsicCount totalDAFees totalDAFeesUSD totalDataSubmissionCount appHourData(first: 24) { nodes { id timestampLast timestampStart totalByteSize } } } }`,
    account: `query Account($id: String!) { accountEntity(id: $id) { id totalByteSize totalFees totalExtrinsicCount totalDAFees totalDAFeesUSD totalDataSubmissionCount totalFeesAvail } }`,
    block: `query Block($id: String!) { block(id: $id) { id blockFee hash parentHash stateRoot extrinsicsRoot runtimeVersion availPrice timestamp nbEvents nbExtrinsics extrinsics { nodes { id call blockHeight fees signer timestamp module extrinsicIndex nbEvents dataSubmissions { totalCount aggregates { sum { fees feesUSD byteSize } } } } } } }`,
    txn: `query Txn($id: String!) { extrinsic(id: $id) { id call argsName argsValue blockId blockHeight fees availPrice success isSigned nbEvents extrinsicIndex signer timestamp module dataSubmissions { totalCount aggregates { sum { fees feesUSD byteSize } } } } }`,
  },
};

const DETAIL_HISTORY_QUERIES = {
  celestia: {
    account: `query AccountDayData($id: String!, $duration: Int) { accountDayData(filter: { accountId: { includesInsensitive: $id } }, orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id timestampLast timestampStart totalByteSize totalTxnCount totalDataSubmissionCount totalFees totalFeesNative totalDAFeesUSD } } }`,
    app: `query AppDayData($id: String!, $duration: Int) { appDayData(filter: { appId: { equalTo: $id } }, orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id timestampLast timestampStart totalByteSize totalTxnCount totalDataSubmissionCount totalFees totalFeesNative totalDAFeesUSD } } }`,
  },
  avail: {
    account: `query AccountDayData($id: String!, $duration: Int) { accountDayData(filter: { accountId: { includesInsensitive: $id } }, orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id timestampLast timestampStart totalByteSize totalExtrinsicCount totalDataSubmissionCount totalFees totalFeesAvail totalDAFeesUSD } } }`,
    app: `query AppDayData($id: String!, $duration: Int) { appDayData(filter: { appId: { equalTo: $id } }, orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id timestampLast timestampStart totalByteSize totalExtrinsicCount totalDataSubmissionCount totalFees totalFeesAvail totalDAFeesUSD } } }`,
  },
};

const AVAIL_BALANCE_HISTORY_QUERY = `query AccountBalanceDayData($id: String!, $duration: Int) { accountBalanceDayData(filter: { accountId: { equalTo: $id } }, orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id timestampLast timestampStart accountId amountTotal } } }`;

export async function getDetail(
  chain: DaChain,
  kind: "app" | "account" | "block" | "txn",
  id: string,
) {
  const result = await queryDa(
    chain,
    DETAIL_QUERIES[chain][kind],
    { id },
    undefined,
  );
  const field =
    chain === "celestia"
      ? {
          app: "appEntity",
          account: "accountEntity",
          block: "blockDatum",
          txn: "transactionDatum",
        }[kind]
      : {
          app: "appEntity",
          account: "accountEntity",
          block: "block",
          txn: "extrinsic",
        }[kind];
  return one(result, field);
}

export async function getDetailHistory(
  chain: DaChain,
  kind: "app" | "account",
  id: string,
  duration = 90,
) {
  const [dayResult, balanceResult] = await Promise.all([
    queryDa(
      chain,
      DETAIL_HISTORY_QUERIES[chain][kind],
      { id, duration },
      undefined,
    ),
    chain === "avail" && kind === "account"
      ? queryDa(
          "avail",
          AVAIL_BALANCE_HISTORY_QUERY,
          { id, duration },
          undefined,
        )
      : Promise.resolve({ data: {} }),
  ]);

  return {
    days: nodes(
      dayResult,
      kind === "account" ? "accountDayData" : "appDayData",
    ),
    balances: nodes(balanceResult, "accountBalanceDayData"),
  };
}

export async function getSearch(chain: DaChain, query: string) {
  const normalizedQuery = query.trim().slice(0, 80);
  if (!normalizedQuery) return { accounts: [], apps: [] };

  const result = await queryDa(
    chain,
    SEARCH_QUERY[chain],
    { query: normalizedQuery },
    60,
  );
  return {
    accounts: nodes(result, "accountEntities"),
    apps: nodes(result, "appEntities"),
  };
}

type L2BeatChart = {
  types?: string[];
  data?: unknown[][];
};

type L2BeatTvsResponse = {
  success?: boolean;
  data?: { chart?: L2BeatChart };
};

export type AvailL2BeatTvlPoint = {
  timestamp: number;
  tvlChart: number;
  nativeChart: number;
  canonicalChart: number;
  externalChart: number;
  native: number;
  canonical: number;
  external: number;
};

export type AvailL2BeatTvlSummary = {
  tvl: number;
  tvlChange: number;
  canonical: number;
  native: number;
  external: number;
  canonicalPercent: number;
  nativePercent: number;
  externalPercent: number;
};

export type AvailL2BeatAppData = {
  project: DaNode;
  tvlPoints: AvailL2BeatTvlPoint[];
  tvlSummary: AvailL2BeatTvlSummary | null;
};

async function fetchJson<T>(
  url: string,
  revalidate: number,
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate, tags: ["l2beat:avail"] },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function mapL2BeatTvl(chart: L2BeatChart | undefined) {
  const types = chart?.types ?? [];
  const rows = chart?.data ?? [];
  const mapped = rows.map((row) =>
    Object.fromEntries(types.map((type, index) => [type, row[index]])),
  );
  const points = mapped.map((entry) => {
    const timestamp = Number(entry.timestamp ?? 0);
    const canonical = Number(entry.canonical ?? 0);
    const native = Number(entry.native ?? 0);
    const external = Number(entry.external ?? 0);
    const tvl = canonical + native + external;
    return {
      timestamp,
      tvlChart: tvl
        ? (canonical * canonical + native * native + external * external) / tvl
        : 0,
      canonicalChart: tvl ? (canonical / tvl) * canonical : 0,
      nativeChart: tvl ? (native / tvl) * native : 0,
      externalChart: tvl ? (external / tvl) * external : 0,
      canonical,
      native,
      external,
      tvl,
    };
  });
  const latest = points.at(-1);
  const previous = points.at(-2);
  if (!latest || !Number.isFinite(latest.tvl) || latest.tvl <= 0) {
    return { points: [] as AvailL2BeatTvlPoint[], summary: null };
  }
  const previousTvl = previous?.tvl ?? 0;
  return {
    points: points.map(
      ({
        timestamp,
        tvlChart,
        nativeChart,
        canonicalChart,
        externalChart,
        native,
        canonical,
        external,
      }) => ({
        timestamp,
        tvlChart,
        nativeChart,
        canonicalChart,
        externalChart,
        native,
        canonical,
        external,
      }),
    ),
    summary: {
      tvl: latest.tvl,
      tvlChange: previousTvl
        ? ((latest.tvl - previousTvl) / previousTvl) * 100
        : 0,
      canonical: latest.canonicalChart,
      native: latest.nativeChart,
      external: latest.externalChart,
      canonicalPercent: (latest.canonical / latest.tvl) * 100,
      nativePercent: (latest.native / latest.tvl) * 100,
      externalPercent: (latest.external / latest.tvl) * 100,
    } satisfies AvailL2BeatTvlSummary,
  };
}

export async function getAvailL2BeatApp(
  appId: string,
): Promise<AvailL2BeatAppData | null> {
  const normalizedId = appId.trim().toLowerCase();
  if (!normalizedId || normalizedId.length > 100) return null;
  const project = await fetchJson<DaNode>(
    `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/blobs-guru-raw-data/data/projects/with-da-id/avail/avail/${encodeURIComponent(normalizedId)}.json`,
    3600,
  );
  const projectId =
    typeof project?.id === "string" ? project.id.trim().toLowerCase() : "";
  if (!project || !projectId) return null;
  const tvs = await fetchJson<L2BeatTvsResponse>(
    `https://l2beat.com/api/scaling/tvs/${encodeURIComponent(projectId)}?range=30d`,
    1440,
  );
  const tvl = mapL2BeatTvl(tvs?.data?.chart);
  return {
    project,
    tvlPoints: tvl.points,
    tvlSummary: tvl.summary,
  };
}
