# Deprecated: Substreams-powered Ethereum blobs

> **Deprecated:** This implementation is retained for reference and is not
> included in the monorepo's default build. Use `apps/ethereum-subquery` for
> the active Ethereum indexer.

This workspace contains the legacy Rust Substreams module and its
Substreams-powered subgraph for Ethereum blob data.

## Commands

Run commands from the monorepo root:

```bash
pnpm codegen:substream-eth-blobs
pnpm build:substream-eth-blobs
pnpm --filter @blobs-guru/substream-eth-blobs substreams:prepare
```

The build uses the workspace-managed Graph CLI and first compiles and packs the
`.spkg` referenced by `subgraph.yaml`. It requires Rust with the
`wasm32-unknown-unknown` target and the Substreams CLI.

## Project files

- `substreams.yaml` defines the Substreams package and modules.
- `Cargo.toml` and `src/lib.rs` define the Rust WASM module.
- `subgraph.yaml` and `schema.graphql` define the Substreams-powered subgraph.
- `proto` contains the protobuf definitions.
