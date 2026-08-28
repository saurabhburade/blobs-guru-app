# SubQuery - Celestia

This workspace indexes Celestia blocks, blob transactions, namespaces,
accounts, applications, transfers, and aggregate price data for Blobs Guru.

## Commands

Run commands from the monorepo root:

```bash
pnpm --filter @blobs-guru/indexer-celestia codegen
pnpm --filter @blobs-guru/indexer-celestia build
pnpm dev:indexer:celestia
```

The `dev` command generates types, builds the project, and starts PostgreSQL,
the Celestia SubQuery node, and the GraphQL service through Docker Compose.

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
