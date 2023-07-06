import type { Chain } from "@wagmi/chains";
import { MUDChain } from "./types";

// The reason why we need to have our own custom testnet is because
// when ppl connect to our faucet service, they will connect to the right URL
// we can't use "localhost" because when the user goes on our website, localhost is THEIR computer, not our AWS instance running the node
const nodeUrl = "ec2-18-191-133-57.us-east-2.compute.amazonaws.com";

export const tenetTestnet = {
  name: "Tenet Testnet",
  id: 905,
  network: "innocent-gold-porpoise",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: [`http://${nodeUrl}:8545`],
      webSocket: [`ws://${nodeUrl}:8545`],
    },
    public: {
      http: [`http://${nodeUrl}:8545`],
      webSocket: [`ws://${nodeUrl}:8545`],
    },
  },
  blockExplorers: {
    otterscan: {
      name: "Explorer L2",
      url: "",
    },
    default: {
      name: "Explorer L2",
      url: "",
    },
  },
  modeUrl: `http://${nodeUrl}:1111`, // TODO: fix
  faucetUrl: `http://${nodeUrl}:2222`, // TODO: fix
} as const satisfies MUDChain;
