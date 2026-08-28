import {
  SubstrateDatasourceKind,
  SubstrateHandlerKind,
  type SubstrateProject,
} from "@subql/types";
import { requireEnvList } from "./src/config/env";

const project: SubstrateProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "avail-starter",
  description:
    "SubQuery project for Avail blocks, data submissions, applications, accounts, and price data",
  runner: {
    node: {
      name: "@subql/node",
      version: ">=4.6.6",
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
    chainId:
      "0xb91746b45e0346cc2f815a520b9c6cb4d5c0902af848db0a80f85932d2e8276a",
    endpoint: requireEnvList("AVAIL_RPC_ENDPOINTS"),
    chaintypes: {
      file: "./dist/chaintypes.js",
    },
  },
  dataSources: [
    {
      name: "main",
      startBlock: 1,
      kind: SubstrateDatasourceKind.Runtime,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: SubstrateHandlerKind.Block,
            handler: "handleBlock",
          },
        ],
      },
    },
  ],
};

export default project;
