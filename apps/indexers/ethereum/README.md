# SubQuery - Ethereum

This workspace indexes Ethereum blocks, blob transactions, receipts, accounts,
and aggregate price data for Blobs Guru.

## Commands

Run commands from the monorepo root:

```bash
pnpm --filter @blobs-guru/indexer-ethereum codegen
pnpm --filter @blobs-guru/indexer-ethereum build
pnpm dev:indexer:ethereum
```

The `dev` command generates types, builds the project, and starts PostgreSQL,
the Ethereum SubQuery node, and the GraphQL service through Docker Compose.

## Project files

- `project.ts` configures the Ethereum network and block handler.
- `schema.graphql` defines the indexed entities.
- `src/mappings` contains the indexing logic.
- `.env.example` documents the local environment variables.
