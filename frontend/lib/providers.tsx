"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnchainKitProvider } from "@coinbase/onchainkit";

const queryClient = new QueryClient();

const chain =
  process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    // ── 1. Base Extension Wallet (injected — the wallet shown in the screenshot)
    // This is the PRIMARY wallet for this hackathon build.
    // Install from: Chrome Web Store → "Base Extension Wallet"
    injected({
      target: {
        id: "baseWallet",
        name: "Base Wallet",
        // Base Extension Wallet injects itself as window.ethereum
        // with provider.isBaseWallet = true
        provider(window) {
          if (typeof window === "undefined") return undefined;
          // Prefer Base Wallet if multiple wallets are injected
          const providers: any[] =
            (window as any).ethereum?.providers ?? [];
          const baseWallet = providers.find((p: any) => p.isBaseWallet);
          if (baseWallet) return baseWallet;
          // Fallback: single injected provider (when only Base Wallet is installed)
          if ((window as any).ethereum?.isBaseWallet) {
            return (window as any).ethereum;
          }
          return undefined;
        },
      },
    }),

    // ── 2. Coinbase Smart Wallet (passkey / ERC-4337 — mobile fallback)
    // Used when Base Extension Wallet is not installed.
    // Also works with FaceID/TouchID on mobile — no seed phrase.
    coinbaseWallet({
      appName: "SplitBase",
      preference: "all", // "all" = show both Smart Wallet and extension
    }),

    // ── 3. MetaMask (fallback for judges who don't have Base Wallet)
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET || undefined),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={chain}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
