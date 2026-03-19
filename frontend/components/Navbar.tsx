"use client";

import Link from "next/link";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { useAccount } from "wagmi";
import { Identity, Name, Avatar } from "@coinbase/onchainkit/identity";
import { baseSepolia, base } from "viem/chains";

const chain =
  process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

export function Navbar() {
  const { address, isConnected } = useAccount();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Split<span className="text-blue-500">Base</span>
        </Link>

        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <Identity address={address} chain={chain}>
              <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-1.5">
                <Avatar className="w-6 h-6 rounded-full" />
                <Name className="text-sm font-medium text-gray-200" />
              </div>
            </Identity>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>
    </nav>
  );
}
