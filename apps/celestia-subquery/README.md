# SubQuery - Celestia

This workspace indexes Celestia blocks, blob transactions, namespaces,
accounts, applications, transfers, and aggregate price data for Blobs Guru.

## Commands

Run commands from the monorepo root:

```bash
pnpm exec turbo run codegen --filter=@blobs-guru/celestia-subquery
pnpm exec turbo run build --filter=@blobs-guru/celestia-subquery
pnpm dev:celestia-subquery
```

The `dev` command generates types, builds the project, and starts PostgreSQL,
the Celestia SubQuery node, and the GraphQL service through Docker Compose.
Copy `.env.example` to `.env` and set `POSTGRES_PASSWORD` before starting the
indexer. Do not commit the populated `.env` file.

## Project files

- `project.ts` configures the Celestia network, protobuf types, and block
  handler.
- `schema.graphql` defines the indexed entities.
- `proto` contains the Cosmos and Celestia protobuf definitions used by
  codegen.
- `src/mappings` contains the indexing logic.

After the Docker services are healthy, the GraphQL playground is available at
[http://localhost:3000](http://localhost:3000).

See the [SubQuery documentation](https://subquery.network/doc/) for manifest,
runtime, and deployment guidance.
