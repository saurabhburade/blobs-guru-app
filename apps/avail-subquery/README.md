# SubQuery - Avail

This workspace indexes Avail blocks, extrinsics, data submissions,
applications, accounts, balances, and aggregate price data for Blobs Guru.

## Commands

Run commands from the monorepo root:

```bash
pnpm exec turbo run codegen --filter=@blobs-guru/avail-subquery
pnpm exec turbo run build --filter=@blobs-guru/avail-subquery
pnpm dev:avail-subquery
```

The `dev` command generates types, builds the project, and starts PostgreSQL,
the Avail SubQuery node, and the GraphQL service through Docker Compose.

Copy `.env.example` to `.env` and provide `POSTGRES_PASSWORD`,
`DEX_GURU_API_KEY`, and `ETHERSCAN_API_KEY` before starting the indexer. Review
the RPC and API URLs as well; `AVAIL_RPC_ENDPOINTS` is a comma-separated list.
Do not commit populated environment files.

## Project files

- `project.ts` configures the Avail network and block handler.
- `schema.graphql` defines the indexed entities.
- `src/mappings` contains the indexing logic.
- `.env.example` documents the local environment variables.
