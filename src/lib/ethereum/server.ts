const ETHEREUM_GRAPHQL_URL = "https://ethapi.blobs.guru/";

type FetchMode = "isr" | "dynamic";

async function queryEthereum<T>(
  query: string,
  variables: Record<string, unknown> = {},
  mode: FetchMode = "isr",
): Promise<T> {
  const response = await fetch(ETHEREUM_GRAPHQL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10_000),
    ...(mode === "dynamic"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 300 } }),
  });

  if (!response.ok) {
    throw new Error(`Ethereum data request failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(
      payload.errors[0]?.message || "Ethereum data request failed",
    );
  }

  return payload.data as T;
}

const COLLECTIVE_QUERY = `
  query Collective {
    collectiveData { nodes {
      totalByteSize totalBlocksCount totalDataSubmissionCount totalFeesNative
      totalDAFees totalDAFeesUSD totalTxnCount avgNativePrice totalDataBlocksCount
      timestampLast endBlock lastPriceFeed { nativePrice }
    } }
  }
`;

const ACCOUNTS_QUERY = `
  query Accounts($skip: Int, $limit: Int) {
    accountEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip) {
      totalCount nodes { id totalByteSize totalFees totalTxnCount totalDAFees
        endBlock startBlock totalDataSubmissionCount totalFeesUSD totalDAFeesUSD }
    }
  }
`;

const APPS_QUERY = `
  query Apps($skip: Int, $limit: Int) {
    appEntities: accountEntities(orderBy: TOTAL_BYTE_SIZE_DESC, first: $limit, offset: $skip) {
      totalCount nodes { id totalByteSize totalFeesNative totalTxnCount
        totalDAFees endBlock startBlock totalDataSubmissionCount totalFeesUSD totalDAFeesUSD }
    }
  }
`;

const ACCOUNT_QUERY = `
  query Account($id: String!) {
    accountEntity(id: $id) { id totalByteSize totalFees totalTxnCount totalDAFees
      endBlock startBlock totalDataSubmissionCount totalFeesUSD totalDAFeesUSD totalFeesNative }
  }
`;

const APP_QUERY = `
  query App($appId: String!) {
    appEntity: accountEntity(id: $appId) { id totalByteSize totalFeesNative totalTxnCount
      totalDAFees endBlock startBlock totalDataSubmissionCount totalFeesUSD totalDAFeesUSD }
  }
`;

const TRANSACTIONS_QUERY = `
  query Transactions($signerId: String!, $skip: Int, $limit: Int) {
    transactionData(filter: { signerId: { equalTo: $signerId } }, first: $limit,
      offset: $skip, orderBy: TIMESTAMP_DESC) { totalCount nodes { hash timestamp txFeeNative
      blockHeightId nEvents id txFeeUSD: totalFeeUSD totalBytes signerId blobs { nodes { signer: signerId size } } } }
  }
`;

const APP_TRANSACTIONS_QUERY = `
  query AppTransactions($namespaceID: String!, $skip: Int, $limit: Int) {
    transactionData(filter: { blobs: { some: { namespaceID: { like: $namespaceID } } } },
      first: $limit, offset: $skip) { nodes { hash timestamp txFeeNative blockHeightId
      nEvents id txFeeUSD: totalFeeUSD totalBytes signerId blobs { nodes { signerId size } } } }
  }
`;

const BLOCKS_QUERY = `
  query Blocks($skip: Int, $limit: Int) {
    blockData(orderBy: HEIGHT_DESC, first: $limit, offset: $skip) {
      totalCount aggregates { sum { totalBlobSize totalBlobTransactionCount } }
      nodes { timestamp id avgNativePrice totalBlobSize totalEventsCount
        totalBlobTransactionCount totalTransactionCount currentNativePrice
        totalBlockFeeNatve totalBlockFeeUSD }
    }
  }
`;

const BLOCK_QUERY = `
  query Block($id: String!) {
    blockDatum(id: $id) { id hash height timestamp proposer avgNativePrice totalBlockFeeUSD
      totalBlockFeeNatve totalBlobSize totalEventsCount totalTransactionCount
      totalBlobTransactionCount transactions { nodes { hash txFeeNative blockHeightId nEvents
      id txFeeUSD: totalFeeUSD totalBytes signerId timestamp blobs { nodes { signer: signerId size } } } } }
  }
`;

const TRANSACTION_QUERY = `
  query Transaction($id: String!) {
    transactionDatum(id: $id) { hash timestamp txFeeNative blockHeightId nEvents id txFeeUSD: totalFeeUSD
      totalBytes signerId blockHeight { currentNativePrice } blobs { nodes { signer: signerId size } } }
  }
`;

const DAY_DATA_QUERY = `
  query DayData($duration: Int, $limit: Int) {
    collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) { totalCount nodes {
      id totalTxnCount totalFees timestampLast timestampStart totalByteSize
      totalDataSubmissionCount totalFeesUSD totalDAFeesUSD totalFeesNative avgNativePrice
      totalDAFees
      appDayDataParticipant: accountDayDataParticipant(
        first: $limit
        orderBy: TOTAL_TXN_COUNT_DESC
      ) {
        nodes {
          id
          appId: id
          totalTxnCount
          totalByteSize
          totalDataSubmissionCount
          totalDAFees
          totalDAFeesUSD
        }
      }
      appDayDataParticipantOthers: accountDayDataParticipant(
        orderBy: TOTAL_BYTE_SIZE_DESC
        offset: $limit
      ) {
        aggregates { sum {
          totalTxnCount
          totalByteSize
          totalDataSubmissionCount
          totalDAFees
          totalDAFeesUSD
        } }
      }
    } }
  }
`;

const PRICE_DAY_DATA_QUERY = `
  query PriceDayData($duration: Int) {
    collectiveDayData(orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes {
      id timestampLast timestampStart totalByteSize avgNativePrice
      totalDataSubmissionCount totalDAFees totalDAFeesUSD
    } }
  }
`;

const ACCOUNT_DAY_DATA_QUERY = `
  query AccountDayData($address: String, $duration: Int) {
    accountDayData(filter: { accountId: { includesInsensitive: $address } },
      orderBy: TIMESTAMP_LAST_DESC, first: $duration) { nodes { id totalTxnCount totalFees
      timestampLast timestampStart totalFeesUSD totalByteSize accountId totalDataSubmissionCount
      totalDAFeesUSD totalFeesNative } }
  }
`;

const APP_DAY_DATA_QUERY = `
  query AppDayData($appId: String, $duration: Int) {
    appDayData(filter: { appId: { equalTo: $appId } }, orderBy: TIMESTAMP_LAST_DESC,
      first: $duration) { nodes { id totalTxnCount timestampLast timestampStart totalFeesUSD
      totalByteSize totalDataSubmissionCount totalDAFeesUSD totalFeesNative } }
  }
`;

export type EthereumData = Record<string, any>;

type L2BeatChart = {
  types?: string[];
  data?: unknown[][];
};

type L2BeatTvsResponse = {
  data?: { chart?: L2BeatChart };
};

export type EthereumL2BeatTvlPoint = {
  timestamp: number;
  tvlChart: number;
  nativeChart: number;
  canonicalChart: number;
  externalChart: number;
  native: number;
  canonical: number;
  external: number;
};

export type EthereumL2BeatTvlSummary = {
  tvl: number;
  tvlChange: number;
  canonical: number;
  native: number;
  external: number;
  canonicalPercent: number;
  nativePercent: number;
  externalPercent: number;
};

export type EthereumL2BeatData = {
  project: EthereumData;
  tvlPoints: EthereumL2BeatTvlPoint[];
  tvlSummary: EthereumL2BeatTvlSummary | null;
};

async function fetchL2BeatJson<T>(
  url: string,
  revalidate: number,
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate, tags: ["ethereum:l2beat"] },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getEthereumL2BeatProject(
  address: string,
): Promise<EthereumData | null> {
  const normalizedAddress = address.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(normalizedAddress)) return null;
  return fetchL2BeatJson<EthereumData>(
    `https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/blobs-guru-raw-data/data/projects/with-da-id/ethereum/ethereum/${encodeURIComponent(normalizedAddress)}.json`,
    3_600,
  );
}

export async function enrichEthereumAccounts<T extends EthereumData>(
  accounts: T[],
): Promise<Array<T & { name?: string; logoUri?: string }>> {
  return Promise.all(
    accounts.map(async (account) => {
      const project = await getEthereumL2BeatProject(String(account.id || ""));
      const display = project?.display as EthereumData | undefined;
      const slug = String(display?.slug || "").toLowerCase();
      return {
        ...account,
        name: typeof display?.name === "string" ? display.name : undefined,
        logoUri: slug
          ? `https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/frontend/static/icons/${encodeURIComponent(slug)}.png`
          : undefined,
      };
    }),
  );
}

function mapEthereumL2BeatTvl(chart: L2BeatChart | undefined) {
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
    return { points: [] as EthereumL2BeatTvlPoint[], summary: null };
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
    } satisfies EthereumL2BeatTvlSummary,
  };
}

export async function getEthereumL2BeatData(
  address: string,
): Promise<EthereumL2BeatData | null> {
  const project = await getEthereumL2BeatProject(address);
  const projectId =
    typeof project?.id === "string" ? project.id.trim().toLowerCase() : "";
  if (!project || !projectId) return null;
  const tvs = await fetchL2BeatJson<L2BeatTvsResponse>(
    `https://l2beat.com/api/scaling/tvs/${encodeURIComponent(projectId)}?range=30d`,
    1_440,
  );
  const tvl = mapEthereumL2BeatTvl(tvs?.data?.chart);
  return {
    project,
    tvlPoints: tvl.points,
    tvlSummary: tvl.summary,
  };
}

export function getEthereumSummaryData(blockSkip = 0, blockLimit = 10) {
  return Promise.all([
    queryEthereum<{ collectiveData?: EthereumData }>(COLLECTIVE_QUERY),
    getEthereumBlocks(blockSkip, blockLimit),
    getEthereumDayData(30),
    getEthereumPriceDayData(60),
  ]);
}

export function getEthereumAccounts(skip = 0, limit = 10) {
  return queryEthereum<{ accountEntities?: EthereumData }>(ACCOUNTS_QUERY, {
    skip,
    limit,
  });
}

export function getEthereumApps(skip = 0, limit = 10) {
  return queryEthereum<{ appEntities?: EthereumData }>(APPS_QUERY, {
    skip,
    limit,
  });
}

export function getEthereumAccount(
  id: string,
  transactionSkip = 0,
  transactionLimit = 10,
) {
  return Promise.all([
    queryEthereum<{ accountEntity?: EthereumData }>(
      ACCOUNT_QUERY,
      { id },
      "dynamic",
    ),
    queryEthereum<EthereumData>(
      TRANSACTIONS_QUERY,
      { signerId: id, skip: transactionSkip, limit: transactionLimit },
      "dynamic",
    ),
    queryEthereum<EthereumData>(
      ACCOUNT_DAY_DATA_QUERY,
      { address: id, duration: 90 },
      "dynamic",
    ),
  ]);
}

export function getEthereumApp(
  id: string,
  transactionSkip = 0,
  transactionLimit = 10,
) {
  return getEthereumAccount(id, transactionSkip, transactionLimit);
}

export function getEthereumBlocks(skip = 0, limit = 10) {
  return queryEthereum<{ blockData?: EthereumData }>(BLOCKS_QUERY, {
    skip,
    limit,
  });
}

export function getEthereumBlock(id: string) {
  return queryEthereum<{ blockDatum?: EthereumData }>(
    BLOCK_QUERY,
    { id },
    "dynamic",
  );
}

export function getEthereumTransaction(id: string) {
  return queryEthereum<{ transactionDatum?: EthereumData }>(
    TRANSACTION_QUERY,
    { id },
    "dynamic",
  );
}

export function getEthereumDayData(duration = 30) {
  return queryEthereum<{ collectiveDayData?: EthereumData }>(DAY_DATA_QUERY, {
    duration,
    limit: 5,
  });
}

export function getEthereumPriceDayData(duration = 60) {
  return queryEthereum<{ collectiveDayData?: EthereumData }>(
    PRICE_DAY_DATA_QUERY,
    { duration },
  );
}

export function getEthereumAccountDayData(address: string, duration = 15) {
  return queryEthereum<{ accountDayData?: EthereumData }>(
    ACCOUNT_DAY_DATA_QUERY,
    { address, duration },
    "dynamic",
  );
}

export function getEthereumAppDayData(appId: string, duration = 15) {
  return queryEthereum<{ appDayData?: EthereumData }>(
    APP_DAY_DATA_QUERY,
    { appId, duration },
    "dynamic",
  );
}

export async function searchEthereum(query: string) {
  const normalized = query.trim();
  if (!normalized) return { accounts: [], apps: [] };

  const result = await queryEthereum<EthereumData>(
    `query Search($query: String!) {
      accountEntities(filter: { id: { like: $query } }, first: 5) { nodes { id } }
    }`,
    { query: normalized },
    "dynamic",
  );

  return {
    accounts: result.accountEntities?.nodes || [],
    apps: [],
  };
}
