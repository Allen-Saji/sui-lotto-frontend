"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { LotteryProvider } from "@/lib/lottery-context";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getJsonRpcFullnodeUrl("testnet"), network: "testnet" },
  mainnet: { url: getJsonRpcFullnodeUrl("mainnet"), network: "mainnet" },
  // Some wallets report their network as "sui" — alias to testnet
  sui: { url: getJsonRpcFullnodeUrl("testnet"), network: "testnet" },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect slushWallet={{ name: "SuiLotto" }}>
          <LotteryProvider>
            {children}
          </LotteryProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
