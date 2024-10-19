import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const ETHERSCAN_LINK = "https://etherscan.io";
export const wagmiconfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http("https://cloudflare-eth.com", { batch: true }),
    [sepolia.id]: http(),
  },
});
interface AddressBook {
  [address: string]: any;
}
export const ADDRESS_BOOK: AddressBook = {
  "0x000000633b68f5d8d3a86593ebb815b4663bcbe0": {
    name: "Taikobeat Proposer",
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/31525.png",
    rpc: "https://rpc.mainnet.taiko.xyz/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0x000000633b68f5d8d3a86593ebb815b4663bcbe0",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/taiko.json",

    l2beatDiscoveryDataUrl:
      "https://raw.githubusercontent.com/l2beat/l2beat/refs/heads/main/packages/backend/discovery/arbitrum/ethereum/discovered.json",
  },
  "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f": {
    name: "Scroll",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/153/small/scroll.jpeg",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/scroll.json",
  },
  "0x5050f69a9786f081509234f1a7f4684b5e5b76c9": {
    name: "Base: Batch Sender",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/131/small/base-network.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/base.json",
  },
  "0xc1b634853cb333d3ad8663715b08f41a3aec47cc": {
    name: "Arbitrum: Batch Submitter",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/33/small/AO_logomark.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/arbitrum.json",
  },
  "0x6887246668a3b87f54deb3b94ba47a6f63f32985": {
    name: "Optimism: Batcher",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/41/small/optimism.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/optimism.json",
  },
  "0x2c169dfe5fbba12957bdd0ba47d9cedbfe260ca7": {
    name: "StarkNet: Operator",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/151/small/starknet.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/starknet.json",
  },
  "0x0d3250c3d5facb74ac15834096397a3ef790ec99": {
    name: "zkSync Era: Batcher",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/121/small/zksync.jpeg",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/zksync2.json",
  },
  "0x625726c858dbf78c0125436c943bf4b4be9d9033": {
    name: "Zora",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/196/small/zora.jpeg",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/zora.json",
  },
  "0x99199a22125034c808ff20f377d91187e8050f2e": {
    name: "Mode",
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/31016.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/mode.json",
  },
  "0xa9268341831efa4937537bc3e9eb36dbece83c7e": {
    name: "Linea",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/135/small/linea.jpeg",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/linea.json",
  },
  "0x415c8893d514f9bc5211d36eeda4183226b84aa7": {
    name: "Blast",
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/28480.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/blast.json",
  },
  "0xc70ae19b5feaa5c19f576e621d2bad9771864fe2": {
    name: "StarkNet (Unknown)",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/151/small/starknet.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/starknet.json",
  },
  "0xc94c243f8fb37223f3eb2f7961f7072602a51b8b": {
    name: "Metal L2",
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/1788.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/metal.json",
  },
  "0x41b8cd6791de4d8f9e0eaf7861ac506822adce12": {
    name: "Kroma",
    logoUri:
      "https://assets.coingecko.com/coins/images/30830/standard/Kroma-symbol.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/kroma.json",
  },
  "0xaf1e4f6a47af647f87c0ec814d8032c4a4bff145": {
    name: "Zircuit",
    logoUri:
      "https://assets.coingecko.com/asset_platforms/images/287/small/zircuit.png",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xcf2898225ed05be911d3709d9417e86e0b4cfc8f",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/zircuit.json",
  },
  "0xdbbe3d8c2d2b22a2611c5a94a9a12c2fcd49eb29": {
    name: "World Chain",
    logoUri:
      "https://assets.coingecko.com/coins/images/31069/standard/worldcoin.jpeg",
    rpc: "https://rpc.scroll.io/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
    address: "0xdbbe3d8c2d2b22a2611c5a94a9a12c2fcd49eb29",
    l2beatProjectDataUrl:
      "https://raw.githubusercontent.com/saurabhburade/l2beat/refs/heads/main/packages/config/data/projects/layer2s/world.json",
  },
};
export const getAccountDetailsFromAddressBook = (address: string) => {
  const d = ADDRESS_BOOK[address?.toLowerCase()];
  if (d) {
    return d;
  }
  return {
    address: d,
  };
};
