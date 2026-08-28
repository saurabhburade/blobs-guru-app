# Blobs Guru Web

The Blobs Guru web app is a Next.js explorer for blob and data-availability
activity across Ethereum, Avail, and Celestia. It provides network summaries,
statistics, blocks, transactions, accounts, applications, data-availability
comparisons, and blob cost and size views.

This package is part of the [Blobs Guru monorepo](../../README.md) and is
published internally as `@blobs-guru/web`.

## Getting started

Install workspace dependencies from the repository root:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The app is available at [http://localhost:3000](http://localhost:3000) by
default.

To run the package command directly from the repository root:

```bash
pnpm --filter @blobs-guru/web dev
```

## Data sources

The app queries the GraphQL APIs backed by the monorepo's active SubQuery
indexers:

| Network | GraphQL endpoint | Indexer workspace |
| --- | --- | --- |
| Ethereum | `https://ethapi.blobs.guru/` | [`../ethereum-subquery`](../ethereum-subquery) |
| Avail | `https://availapi.blobs.guru/` | [`../avail-subquery`](../avail-subquery) |
| Celestia | `https://celestiaapi.blobs.guru/` | [`../celestia-subquery`](../celestia-subquery) |

The endpoint configuration lives in `src/lib/apollo/client.ts`. Some views
also use public network RPCs and public APIs such as L2BEAT.

## Configuration

The app works with its built-in defaults. To override its public runtime
settings, create `apps/web/.env.local` and set any of the following variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Empty | Optional base URL used by API helpers |
| `NEXT_PUBLIC_MAX_BLOBS_TARGET` | `9` | Target blob count |
| `NEXT_PUBLIC_MAX_BLOBS_SIZE_TARGET_AVAIL` | `4194304` | Avail target size in bytes |
| `NEXT_PUBLIC_MAX_BLOBS_SIZE_TARGET_CELESTIA` | `8388608` | Celestia target size in bytes |
| `NEXT_PUBLIC_MAX_BLOBS_SIZE_TARGET_ETHEREUM` | `1179648` | Ethereum target size in bytes |
| `NEXT_PUBLIC_KB_PER_BLOB` | `128` | Ethereum blob size in KiB |

Only expose non-sensitive values through `NEXT_PUBLIC_*` variables because
Next.js includes them in the browser bundle.

## Commands

Run these commands from the repository root:

| Command | Description |
| --- | --- |
| `pnpm dev:web` | Start the Next.js development server through Turbo |
| `pnpm build:web` | Create a production build through Turbo |
| `pnpm check-types` | Run the web TypeScript check |
| `pnpm lint:web` | Run the web ESLint configuration |
| `pnpm --filter @blobs-guru/web start` | Serve an existing production build |
| `pnpm --filter @blobs-guru/web dev:https` | Start the experimental local HTTPS server |

## Project structure

```text
src/
├── app/          Next.js App Router pages, layouts, and providers
├── components/   Shared interface components
├── configs/      Network constants and application configuration
├── hooks/        Reusable data-fetching and UI hooks
├── lib/          Apollo clients and data-access helpers
└── views/        Feature views for Ethereum, Avail, Celestia, and shared pages
```

Static images, icons, and web manifests are stored in `public/`. Tailwind CSS
and DaisyUI provide the styling foundation, Apollo Client handles GraphQL
queries, and TanStack Query handles additional asynchronous data.

## Production build

```bash
pnpm build:web
pnpm --filter @blobs-guru/web start
```

The repository's root [`LICENSE`](../../LICENSE) applies to this package.
