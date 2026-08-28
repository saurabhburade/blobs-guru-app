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

## Project files

- `project.ts` configures the Ethereum network and block handler.
- `schema.graphql` defines the indexed entities.
- `src/mappings` contains the indexing logic.
- `.env.example` documents the local environment variables.
