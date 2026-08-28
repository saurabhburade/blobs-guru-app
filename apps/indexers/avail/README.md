# SubQuery - Avail

This workspace indexes Avail blocks, extrinsics, data submissions,
applications, accounts, balances, and aggregate price data for Blobs Guru.

## Commands

Run commands from the monorepo root:

```bash
pnpm --filter @blobs-guru/indexer-avail codegen
pnpm --filter @blobs-guru/indexer-avail build
pnpm dev:indexer:avail
```

The `dev` command generates types, builds the project, and starts PostgreSQL,
the Avail SubQuery node, and the GraphQL service through Docker Compose.

## Project files

- `avail.yaml` configures the Avail network and block handler.
- `schema.graphql` defines the indexed entities.
- `src/mappings` contains the indexing logic.
- `.env.example` documents the local environment variables.
