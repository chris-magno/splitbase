"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { GroupList } from "@/components/GroupList";

export default function HomePage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8">
        {/* Hero */}
        <div className="space-y-3">
          <div className="text-5xl font-bold tracking-tight">
            Split<span className="text-blue-500">Base</span>
          </div>
          <p className="text-xl text-gray-400">
            Split bills with friends. Settle with ETH.
          </p>
          <p className="text-gray-500 text-sm">No more &quot;I&apos;ll pay you back.&quot;</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {[
            "🔑 Passkey wallet — no seed phrase",
            "🏷️ Identify by Basename",
            "⚡ Sub-cent gas on Base",
            "🔗 Fully on-chain ledger",
          ].map((f) => (
            <span
              key={f}
              className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-gray-300"
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <ConnectWalletButton />
          <p className="text-xs text-gray-600">
            Uses Coinbase Smart Wallet — FaceID/TouchID on mobile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Groups</h1>
        <Link href="/groups/new" className="btn-primary">
          + New Group
        </Link>
      </div>
      <GroupList />
    </div>
  );
}
