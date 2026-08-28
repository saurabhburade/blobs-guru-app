function requirePublicEnv(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${name} environment variable is required`);
  }
  return normalized;
}

export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export const ETHEREUM_SUBQUERY_URL = requirePublicEnv(
  "NEXT_PUBLIC_ETHEREUM_SUBQUERY_URL",
  process.env.NEXT_PUBLIC_ETHEREUM_SUBQUERY_URL,
);
export const AVAIL_SUBQUERY_URL = requirePublicEnv(
  "NEXT_PUBLIC_AVAIL_SUBQUERY_URL",
  process.env.NEXT_PUBLIC_AVAIL_SUBQUERY_URL,
);
export const CELESTIA_SUBQUERY_URL = requirePublicEnv(
  "NEXT_PUBLIC_CELESTIA_SUBQUERY_URL",
  process.env.NEXT_PUBLIC_CELESTIA_SUBQUERY_URL,
);
export const ETHEREUM_RPC_URL = requirePublicEnv(
  "NEXT_PUBLIC_ETHEREUM_RPC_URL",
  process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL,
);
export const SEPOLIA_RPC_URL = requirePublicEnv(
  "NEXT_PUBLIC_SEPOLIA_RPC_URL",
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
);
export const ETHERSCAN_URL = requirePublicEnv(
  "NEXT_PUBLIC_ETHERSCAN_URL",
  process.env.NEXT_PUBLIC_ETHERSCAN_URL,
);
export const AVAIL_STATS_API_URL = requirePublicEnv(
  "NEXT_PUBLIC_AVAIL_STATS_API_URL",
  process.env.NEXT_PUBLIC_AVAIL_STATS_API_URL,
);
export const CELESTIA_RPC_STATUS_URL = requirePublicEnv(
  "NEXT_PUBLIC_CELESTIA_RPC_STATUS_URL",
  process.env.NEXT_PUBLIC_CELESTIA_RPC_STATUS_URL,
);
export const L2BEAT_TRPC_URL = requirePublicEnv(
  "NEXT_PUBLIC_L2BEAT_TRPC_URL",
  process.env.NEXT_PUBLIC_L2BEAT_TRPC_URL,
);
export const L2BEAT_TVS_API_BASE_URL = requirePublicEnv(
  "NEXT_PUBLIC_L2BEAT_TVS_API_BASE_URL",
  process.env.NEXT_PUBLIC_L2BEAT_TVS_API_BASE_URL,
);
export const EIGENDA_API_URL = requirePublicEnv(
  "NEXT_PUBLIC_EIGENDA_API_URL",
  process.env.NEXT_PUBLIC_EIGENDA_API_URL,
);
export const CELESTIA_STATS_API_URL = requirePublicEnv(
  "NEXT_PUBLIC_CELESTIA_STATS_API_URL",
  process.env.NEXT_PUBLIC_CELESTIA_STATS_API_URL,
);
export const OP_STACK_METADATA_URL = requirePublicEnv(
  "NEXT_PUBLIC_OP_STACK_METADATA_URL",
  process.env.NEXT_PUBLIC_OP_STACK_METADATA_URL,
);
export const L2BEAT_RAW_DATA_BASE_URL = requirePublicEnv(
  "NEXT_PUBLIC_L2BEAT_RAW_DATA_BASE_URL",
  process.env.NEXT_PUBLIC_L2BEAT_RAW_DATA_BASE_URL,
);
