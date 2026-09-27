# SubQuery - Ethereum

This workspace indexes Ethereum blocks, blob transactions, receipts, accounts,
and aggregate price data for Blobs Guru.

## Commands

Run commands from the monorepo root:

```bash
pnpm exec turbo run codegen --filter=@blobs-guru/ethereum-subquery
pnpm exec turbo run build --filter=@blobs-guru/ethereum-subquery
pnpm dev:ethereum-subquery
```

The `dev` command generates types, builds the project, and starts PostgreSQL,
the Ethereum SubQuery node, and the GraphQL service through Docker Compose.

Copy `.env.example` to `.env`, set `POSTGRES_PASSWORD`, and review the RPC and
price-feed service URLs before starting the indexer. `ETH_RPC_ENDPOINTS` is a
comma-separated endpoint list. Do not commit populated environment files.

## Project files

- `project.ts` configures the Ethereum network and block handler.
- `schema.graphql` defines the indexed entities.
- `src/mappings` contains the indexing logic.
- `.env.example` documents the local environment variables.

## Blob transaction fees

For type `0x3` transactions, the indexer reads the actual receipt. Execution
fee is `gasUsed * effectiveGasPrice`; blob DA fee is
`blobGasUsed * blobGasPrice`. Their sum is the total paid by the transaction.
The `executionFeeWei` and `blobFeeWei` transaction fields, and their plural
block/account/day/hour/chain equivalents, are exact `BigInt` values. Sum the
two fields at query time for the total, then divide by `10^18` for ETH.

The older `Float` fee fields remain for existing GraphQL clients and may have
wei-level rounding. Their USD counterparts store USD multiplied by `10^18`;
divide by `10^18` to display dollars. USD amounts also depend on the selected
15-minute ETH/USD price and are estimates rather than on-chain values.

When migrating a populated database, old rows have null exact fields because
their exact wei cannot be recovered from the rounded `Float` fields. New
transactions and blocks get exact values immediately. New aggregate rows do
too; an aggregate with historical transactions stays null until its full
history is reindexed from receipts. Reindex from the configured `startBlock`
to make all historical aggregates exact.
