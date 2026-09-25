# Three SubQuery indexers on one VPS

This Compose project runs the three indexers from the public `blobs-guru-app` checkout under `apps/`. Each chain has its own PostgreSQL container, data volume, node, and GraphQL query service.

| Chain | GraphQL port on VPS | Public GraphQL path |
| --- | ---: | --- |
| Ethereum | 3000 | `/ethereum` |
| Celestia | 3001 | `/celestia` |
| Avail | 3002 | `/avail` |

GraphQL ports bind to `127.0.0.1`; Nginx terminates HTTPS on `ethapi.blobs.guru`. The existing `/` route can continue to serve Ethereum clients. PostgreSQL ports are not published.

## Fresh start

1. Clone `https://github.com/saurabhburade/blobs-guru-app.git` at the deployment branch to `/root/blobs-guru-app`.
2. Copy `deploy/indexers/.env.example` to `deploy/indexers/.env`. Set `REPO_DIR=/root/blobs-guru-app` and three unique random database passwords. Keep `.env` readable only by root (`chmod 600`). Never source `.env.example` in the deployment shell: exported shell variables override Docker Compose's `--env-file` values.
3. Use Node 22 or newer and `pnpm` 11.18. At the checkout root, run `pnpm install --frozen-lockfile`; run `set -a; . ./deploy/indexers/.env; set +a` in the same shell; then run `pnpm codegen:subqueries` and `pnpm build:subqueries`.
4. Make the extension script and public app files readable inside the containers (`chmod 644 deploy/indexers/initdb.sql` and `chmod -R a+rX apps/{ethereum,celestia,avail}-subquery`). In `deploy/indexers`, run `docker compose --env-file .env -f compose.yaml config --quiet`.
5. Stop and remove the old `eth-subql-starter` Compose project and its data directory if a complete reset is intended. **This irreversibly discards its indexed Ethereum data.** Run `docker compose --env-file .env -f compose.yaml up -d` to create fresh volumes and start all nine services.
6. Include `nginx-locations.conf` inside the existing HTTPS `server` for `ethapi.blobs.guru`. Run `nginx -t` before reloading Nginx.
7. Check each container, its restart count, node `/ready` endpoint, and GraphQL `_metadata.lastProcessedHeight`. Verify heights advance on two readings.

Ethereum starts at block 19,426,500, Celestia and Avail at block 1. The public APIs expose partial data while these fresh databases sync. All nodes start with one worker; Ethereum uses batch size 1 to avoid concurrent read-modify-write updates in its account aggregates.

Ethereum stores one historical ETH price per 15-minute UTC bucket. It uses validated receipt gas values for both the execution fee and the blob fee, then rolls those values into account, hour, and day totals.

See [schema-audit.md](schema-audit.md) for the storage audit. The audit does not drop any columns or indexes.
