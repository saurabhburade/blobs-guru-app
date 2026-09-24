# Indexer schema and PostgreSQL audit — 2026-09-25

This is an analysis only. No schema or database rows were removed.

## Current Ethereum PostgreSQL footprint

The VPS database uses the `app` schema. These figures are from `pg_stat_user_tables` and `pg_total_relation_size`; row estimates are not exact counts.

| Table | Total | Indexes |
| --- | ---: | ---: |
| `blob_data` | 16 GB | 11 GB |
| `account_hour_data` | 12 GB | 9.4 GB |
| `account_day_data` | 11 GB | 8.3 GB |
| `account_entities` | 8.8 GB | 6.6 GB |
| `transaction_data` | 6.3 GB | 4.0 GB |

The largest indexes are historical GiST indexes on relations such as `blob_data.transaction_id` (2.8 GB) and `blob_data.signer_id` (2.7 GB). Dropping a small scalar column alone will save much less than removing an unused index or limiting historical entity versions. Measure index usage and check external GraphQL clients before any such change.

In the current `pg_stat_user_indexes` snapshot, the `blob_data.signer_id` index (2.7 GB), `blob_data.size` index (1.6 GB), `blob_data.block_height_id` index (1.4 GB), and account day/hour previous-period indexes (about 1.7 GB each) show zero scans. These are candidates for a query-plan review, not immediate drops: statistics may miss external query patterns, and relation queries can require an index even when current traffic has not used it.

## Candidates to investigate

| Chain | Candidate | Evidence and condition |
| --- | --- | --- |
| Ethereum | `BlockData.totalSquareSize` | Mapper always writes zero; current app does not query it. |
| Ethereum | `TransactionData.totalFeeNatve` | Duplicates `txFeeNative`; current app uses `txFeeNative`. |
| Ethereum | Zero-only `totalTransferCount` and `totalDataAccountsCount` fields | Current mapper initializes these but does not increment them. Confirm live values first. |
| Ethereum | `BlobData.size` index | Keep the field; review whether any API client filters or orders by it. |
| Celestia | `Transfers` entity, `BlockData.totalSquareSize`, `BlobData.data` | No active mapper/UI use for `Transfers`; `totalSquareSize` is zero; `data` is saved as an empty string. Confirm live rows. |
| Celestia | `AppEntity.creationRawData` | Full transaction JSON is stored but current app does not query it. Retain if used for audit or debugging. |
| Avail | `KeyDataRaw`, `AccounToUpdateValue`, `PriceFeed`, `PriceFeedHour`, `PriceFeedDay` | No active mapper writes or current app queries found. Confirm live tables and external users. |
| Avail | `DataSubmission.feesPerMb` | Could be computed from stored fee and byte size, but check API consumers before removal. |

## Keep as stored data

Transaction and blob IDs, signer and block relations, timestamps, fees, byte size, blob namespace/commitment, account/app totals, and day/hour rollups are used by current views, filtering, or ordering. A per-account cumulative fee cannot be cheaply reconstructed in the UI from a paginated transaction list, and current stored rollups are inconsistent, so deleting them now would hide rather than repair the issue.

The app also contains legacy GraphQL queries that do not match all inspected schemas. Before a migration, compare each candidate with live GraphQL usage and any third-party clients. Change schema and mapping together, back up PostgreSQL, and validate a test migration. Index removal can be done separately from field removal.
