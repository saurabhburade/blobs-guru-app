# Blobs Guru

Blobs Guru is a pnpm monorepo containing the web explorer and the SubQuery
indexers that provide its Ethereum, Avail, and Celestia data.

## Applications

| Workspace | Path | Purpose |
| --- | --- | --- |
| `@blobs-guru/web` | `apps/web` | Next.js web application |
| `@blobs-guru/indexer-ethereum` | `apps/indexers/ethereum` | Ethereum SubQuery indexer |
| `@blobs-guru/indexer-avail` | `apps/indexers/avail` | Avail SubQuery indexer |
| `@blobs-guru/indexer-celestia` | `apps/indexers/celestia` | Celestia SubQuery indexer |

## Getting started

Install all workspace dependencies from the repository root:

```bash
pnpm install
```

Run the web application:

```bash
pnpm dev
```

Generate and build every indexer:

```bash
pnpm codegen:indexers
pnpm build:indexers
```

Run an individual indexer and its Docker services:

```bash
pnpm dev:indexer:ethereum
pnpm dev:indexer:avail
pnpm dev:indexer:celestia
```

Each indexer's own README contains its network-specific configuration and
deployment details. Their source repositories were imported as unsquashed Git
subtrees, so their original commits remain in this repository's commit graph.

## Common commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the web application |
| `pnpm build` | Build every workspace with a build script |
| `pnpm build:web` | Build only the web application |
| `pnpm build:indexers` | Build all indexers |
| `pnpm codegen:indexers` | Generate types for all indexers |
| `pnpm check-types` | Type-check the web application |
| `pnpm test:indexers` | Run all indexer test commands |
