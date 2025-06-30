import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "ethereum-starter",
  description:
    "This project can be use as a starting point for developing your new Ethereum SubQuery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=6.1.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for Ethereum this is 1
     * https://chainlist.org/chain/1
     */
    chainId: "1",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: [
      "wss://lb.drpc.org/ogws?network=ethereum&dkey=ArT8p5S52UM0rgz3Qb99bmsedepYUR8R8JLJrqRhf0fE",
      "https://rpc.ankr.com/eth/f966ebe407abe74ead6049b91d40bc36aa908b2b6209b041fb0584ec3c96d927",
      "wss://eth-mainnet.blastapi.io/c6fa55f7-bd66-415d-a0df-a03d0ab010db",
      "https://mainnet.gateway.tenderly.co/4xf8YI6aUgYitPpoUnWC64",
      "https://eth-mainnet.public.blastapi.io",
      "https://ethereum-rpc.publicnode.com",
      "https://eth.drpc.org",
    ],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 19426500,

      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Block,
            handler: "handleBlock",
          },
        ],
      },
    },
  ],
  repository: "https://github.com/subquery/ethereum-subql-starter",
};

// Must set default to the project instance
export default project;
