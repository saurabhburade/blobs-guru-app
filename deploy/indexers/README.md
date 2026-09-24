# Three SubQuery indexers on one VPS

This directory runs the existing Ethereum indexer and new Celestia and Avail indexers against the VPS's existing PostgreSQL container. Each chain has its own database and GraphQL query process. No PostgreSQL data directory is moved or reset.

## Layout

| Chain | Database | Local GraphQL port | Public GraphQL path |
| --- | --- | ---: | --- |
| Ethereum | existing `postgres` | 3000 | `/ethereum` |
| Celestia | `celestia` | 3001 | `/celestia` |
| Avail | `avail` | 3002 | `/avail` |

The Compose file joins the existing `eth-subql-starter_default` network. All query ports bind to `127.0.0.1`; Nginx terminates HTTPS on the existing `ethapi.blobs.guru` host. Its old `/` route can continue to serve Ethereum clients.

All three indexers are in the public `blobs-guru-app` repository under `apps/`. Set `REPO_DIR` to the single checkout on the VPS and build the three apps there. Keep database passwords in the VPS `.env` file only.

## Start procedure

1. Back up PostgreSQL and the existing Ethereum Compose files. Confirm free disk and that the existing PostgreSQL container and Docker network are running.
2. Create the `celestia` and `avail` PostgreSQL databases and separate login roles. Install `btree_gist` in each new database, and grant each role ownership of its own database. Keep the existing Ethereum database unchanged.
3. Clone the deployment branch of `https://github.com/saurabhburade/blobs-guru-app.git` to `/root/blobs-guru-app`. Copy `.env.example` to `.env` under `deploy/indexers`, set `REPO_DIR=/root/blobs-guru-app` and unique database passwords, and restrict the file to root (`chmod 600`). The `.env` file is Git-ignored.
4. At the checkout root, run `pnpm install --frozen-lockfile`, then `pnpm codegen:subqueries` and `pnpm build:subqueries`. Validate the Compose file with `docker compose --env-file .env -f compose.yaml config --quiet` from `deploy/indexers`.
5. Stop only the old Ethereum `subquery-node` and `graphql-engine` containers; leave PostgreSQL running. Start this Compose project with `docker compose --env-file .env up -d`.
6. Include `nginx-locations.conf` inside the existing HTTPS `server` for `ethapi.blobs.guru`. Run `nginx -t` before reloading Nginx.
7. Check all six containers, their restart counts, each `/ready` endpoint, and `_metadata.lastProcessedHeight` through each public path. Verify heights advance on two readings.

Ethereum is deliberately serialized (`workers=1`, `batch-size=1`) while its account and interval aggregates use read-modify-write updates. Celestia and Avail also start with one worker. Raise throughput only after an aggregate reconciliation check proves it safe.

All three projects start or resume at their own stored heights. New Celestia and Avail databases will start from their manifest start blocks and need time and disk to catch up. Do not treat a live query service as fully synced until its metadata is near the chain head.

## Rollback

Stop the new Compose project. Start the old Ethereum `subquery-node` and `graphql-engine` containers from `/root/eth-subql-starter`; PostgreSQL remains running throughout. Remove the Nginx include and reload only after `nginx -t` succeeds. The new Celestia and Avail databases can remain for a later retry.

See [schema-audit.md](schema-audit.md) for the read-only storage audit. No schema columns or indexes are dropped by this deployment.
