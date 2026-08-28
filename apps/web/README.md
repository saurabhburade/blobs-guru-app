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

| Network | Environment variable | Indexer workspace |
| --- | --- | --- |
| Ethereum | `NEXT_PUBLIC_ETHEREUM_SUBQUERY_URL` | [`../ethereum-subquery`](../ethereum-subquery) |
| Avail | `NEXT_PUBLIC_AVAIL_SUBQUERY_URL` | [`../avail-subquery`](../avail-subquery) |
| Celestia | `NEXT_PUBLIC_CELESTIA_SUBQUERY_URL` | [`../celestia-subquery`](../celestia-subquery) |

All GraphQL, RPC, and public data API URLs are configured through environment
variables. Some views use public services such as L2BEAT.

## Configuration

Copy `.env.example` to `.env.local` before starting the app. The example lists
every required public endpoint and the optional numeric settings:

| Variable group | Purpose |
| --- | --- |
| `NEXT_PUBLIC_*_SUBQUERY_URL` | Ethereum, Avail, and Celestia GraphQL endpoints |
| `NEXT_PUBLIC_*_RPC_URL` | Ethereum, Sepolia, and Celestia RPC endpoints |
| `NEXT_PUBLIC_*_API_URL` | Avail, L2BEAT, EigenDA, Celestia, and metadata APIs |
| `NEXT_PUBLIC_L2BEAT_RAW_DATA_BASE_URL` | L2BEAT-derived JSON data base URL |
| `NEXT_PUBLIC_MAX_*`, `NEXT_PUBLIC_KB_PER_BLOB` | Network capacity and blob-size settings |

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
