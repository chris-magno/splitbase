"use client";

import { use, useState, useEffect } from "react";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { SPLITBASE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { useEthPrice } from "@/hooks/useEthPrice";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { SettleButton } from "@/components/SettleButton";
import { Identity, Name } from "@coinbase/onchainkit/identity";
import { baseSepolia, base } from "viem/chains";

const chain = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

interface ActivityItem {
  type: "expense" | "settled";
  paidBy?: string;
  from?: string;
  to?: string;
  amount: bigint;
  description?: string;
  blockNumber: bigint;
}

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId: groupIdStr } = use(params);
  const groupId = BigInt(groupIdStr);
  const { address } = useAccount();
  const { weiToUsd, weiToEth } = useEthPrice();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Group data
  const { data: groupData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SPLITBASE_ABI,
    functionName: "getGroup",
    args: [groupId],
  });

  const groupName = groupData?.[0] ?? "";
  const members = (groupData?.[1] ?? []) as `0x${string}`[];
  const groupExists = groupData?.[2] ?? false;

  // Balances: what does current user owe each member?
  const [balances, setBalances] = useState<Record<string, bigint>>({});

  useEffect(() => {
    if (!address || members.length === 0) return;
    async function loadBalances() {
      const next: Record<string, bigint> = {};
      for (const m of members) {
        if (m.toLowerCase() === address!.toLowerCase()) continue;
        try {
          const res = await fetch(
            `/api/balance?groupId=${groupId}&debtor=${address}&creditor=${m}`
          );
          const data = await res.json();
          if (BigInt(data.amount ?? "0") > 0n) {
            next[m] = BigInt(data.amount);
          }
        } catch { /* skip */ }
      }
      setBalances(next);
    }
    loadBalances();
  }, [address, members, groupId, refreshKey]);

  function onTxSuccess() {
    setRefreshKey((k) => k + 1);
  }

  if (!groupExists && groupData) {
    return <p className="text-center text-gray-400 mt-20">Group not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{groupName || "Loading…"}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Group #{groupIdStr} · {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddExpense(true)}>
          + Add Expense
        </button>
      </div>

      {/* What you owe */}
      {Object.keys(balances).length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-red-400">💳 You Owe</h2>
          {Object.entries(balances).map(([creditor, amount]) => (
            <SettleButton
              key={creditor}
              groupId={groupId}
              creditor={creditor as `0x${string}`}
              creditorName={`${creditor.slice(0, 6)}…${creditor.slice(-4)}`}
              amountWei={amount}
              onSuccess={onTxSuccess}
            />
          ))}
        </div>
      )}

      {/* Members */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-300">👥 Members</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m} className="flex items-center gap-3">
              <Identity address={m} chain={chain}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <Name className="text-sm text-gray-300" />
                  {m.toLowerCase() === address?.toLowerCase() && (
                    <span className="badge-green">You</span>
                  )}
                </div>
              </Identity>
            </li>
          ))}
        </ul>
      </div>

      {/* Basescan link */}
      <div className="text-center">
        <a
          href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener"
          className="text-xs text-gray-600 hover:text-blue-400 underline"
        >
          View contract on Basescan ↗
        </a>
      </div>

      {/* Add expense modal */}
      {showAddExpense && (
        <AddExpenseModal
          groupId={groupId}
          memberCount={members.length}
          onSuccess={() => { setShowAddExpense(false); onTxSuccess(); }}
          onClose={() => setShowAddExpense(false)}
        />
      )}
    </div>
  );
}
