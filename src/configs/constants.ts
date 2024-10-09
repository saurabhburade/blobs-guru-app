import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const wagmiconfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export const ADDRESS_BOOK = {
  "0x000000633b68f5d8d3a86593ebb815b4663bcbe0": {
    name: "Taiko",
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/31525.png",
    rpc: "https://rpc.mainnet.taiko.xyz/",
    tags: ["Optimistic Rollup", "EVM", "Mainnet"],
  },
};
