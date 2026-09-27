# Three-indexer security review — 2026-09-25

Scope: `apps/{ethereum,celestia,avail}-subquery`, the shared Compose deployment, the live VPS listener/SSH configuration, and the public GraphQL paths. This was a configuration and source review with live reachability checks, not a penetration test or full dependency CVE scan. No database backup was made during the user-requested reset.

## Summary

The three PostgreSQL services have no published host ports. GraphQL binds only to `127.0.0.1:3000-3002` and is exposed through the existing TLS Nginx host. The VPS firewall allows 22, 80, and 443 and denies 5432. The new `.env` is root-readable only. A tracked-source scan for common private-key and access-token patterns under `apps/` and `deploy/` found no match. These checks do not prove that all dependencies or historical Git commits are free of secrets.

## High

### SEC-01 — Root password login is available on the public SSH port

- **Location:** live `/etc/ssh/sshd_config` effective settings; `sshd -T` returned `permitrootlogin yes` and `passwordauthentication yes`, and `ss` showed port 22 listening on all interfaces.
- **Impact:** A leaked or reused root password gives immediate control of all three indexers and databases. The password was shared in this task conversation, so it should be treated as exposed.
- **Fix:** Add and verify an SSH key for an administrative user, rotate the root password, then disable root password login. Keep a second verified administrative session open while changing SSH settings.
- **Mitigation:** UFW is active, but SSH is reachable from anywhere; restrict allowed source IPs if practical.
- **Uncertainty:** No SSH key inventory or access policy was reviewed, so SSH settings were not changed during deployment.

### SEC-02 — Public GraphQL processes use PostgreSQL superuser credentials

- **Location:** `deploy/indexers/compose.yaml:95-101`, `:149-155`, `:205-211`; PostgreSQL initialization in the same file uses each query service's database user as `POSTGRES_USER`.
- **Impact:** A query-service compromise would have full control of its chain's PostgreSQL database. The databases are separate, limiting cross-chain impact.
- **Fix:** Create separate read-only query roles and use those credentials only in query containers. Give indexer roles ownership of their own schema without PostgreSQL superuser rights after schema setup.
- **Mitigation:** Query ports are localhost-only and no PostgreSQL port is published. Nginx applies request rate limits.
- **Uncertainty:** No SQL injection was found or demonstrated in SubQuery itself; this finding concerns privilege if the query process is compromised.

### SEC-03 — `--unsafe` grants mapping code broader capabilities

- **Location:** `deploy/indexers/compose.yaml:76`, `:132`, `:188`; mappings make external HTTP requests from `apps/*-subquery/src/network/httpFetch.ts`.
- **Impact:** Malicious mapping code or a compromised dependency can access the network and more of the container runtime.
- **Fix:** Move HTTP enrichment behind a controlled service or preloaded data source, then remove unsafe mode when the mappings no longer need it.
- **Mitigation:** The repository mounts are read-only (`compose.yaml:67`, `:122`, `:179`), the Docker socket is not mounted, and only the query ports reach the host.
- **Uncertainty:** Unsafe mode is required by the current mapping design; removing it now would interrupt indexing.

## Medium

### SEC-04 — Public query cost controls are loose

- **Location:** `deploy/indexers/compose.yaml:101`, `:155`, `:211` set 60-second query timeouts; `deploy/indexers/nginx-locations.conf:3-44` uses the existing `ethapi_limit` zone, configured live at 500 requests per second with burst 100.
- **Impact:** Many expensive GraphQL requests can consume query and database capacity during catch-up.
- **Fix:** Measure real client queries, then lower the rate, timeout and database connection limits and set a tested GraphQL complexity limit. Consider an edge WAF for sustained public traffic.
- **Mitigation:** Localhost binding and the existing Nginx rate limit already block direct query-port access and unlimited request bursts.
- **Uncertainty:** A load test and real client traffic sample were not available; aggressive limits could break existing consumers.

### SEC-05 — Mutable runtime image tags

- **Location:** `deploy/indexers/compose.yaml:53`, `:93`, `:162`, `:203` use `latest`; the Celestia image at `:108` is version-tagged without a digest.
- **Impact:** A future pull can change executable code without a repository diff or reproducible rollback.
- **Fix:** Record the tested image digests and pin them in Compose; update after a deliberate compatibility and vulnerability review.
- **Mitigation:** This deployment reused the already-tested local images, and the monorepo uses a frozen pnpm lockfile for its own code.

## Fixed in this branch

- The shared deployment does not publish PostgreSQL ports and binds GraphQL to localhost (`deploy/indexers/compose.yaml:105`, `:159`, `:215`). The legacy per-app Compose files now also bind their PostgreSQL and GraphQL ports to localhost.
- Avail now rethrows mapping errors, so SubQuery retries rather than silently advancing over a failed block (`apps/avail-subquery/src/mappings/mappingHandlers.ts:68-84`). The fresh Avail database had zero `block_errors` at the check.
- Ethereum receipt HTTP requests have a timeout and validate receipt block identity, execution gas, effective gas price, blob gas used, and blob gas price (`apps/ethereum-subquery/src/mappings/handleReceipts.ts`).
- After the fresh startup, the VPS database roles were rotated to the three generated passwords in its root-only `.env`; all nine services were recreated with that environment and passed health/reachability checks. No PostgreSQL data volume was removed during this credential correction.
