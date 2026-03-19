"use client";

import { useAccount, useReadContract } from "wagmi";
import { SPLITBASE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useEthPrice } from "@/hooks/useEthPrice";

interface GroupSummary {
  groupId: bigint;
  name: string;
  members: string[];
}

export function GroupList() {
  const { address } = useAccount();
  const { weiToUsd, weiToEth } = useEthPrice();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: groupCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SPLITBASE_ABI,
    functionName: "groupCount",
  });

  useEffect(() => {
    if (!groupCount || !address) return;
    const count = Number(groupCount);
    if (count === 0) { setLoading(false); return; }

    async function load() {
      const results: GroupSummary[] = [];
      // Fetch last 50 groups max for MVP
      const start = Math.max(1, count - 49);
      for (let i = start; i <= count; i++) {
        try {
          const res = await fetch(`/api/group/${i}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (
            data.exists &&
            data.members
              .map((m: string) => m.toLowerCase())
              .includes(address!.toLowerCase())
          ) {
            results.push({ groupId: BigInt(i), name: data.name, members: data.members });
          }
        } catch { /* skip */ }
      }
      setGroups(results.reverse());
      setLoading(false);
    }
    load();
  }, [groupCount, address]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse h-20 bg-gray-800/50" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="card text-center py-16 space-y-4">
        <p className="text-4xl">💸</p>
        <p className="text-gray-400">No groups yet.</p>
        <p className="text-gray-600 text-sm">Create one to start splitting bills on-chain.</p>
        <Link href="/groups/new" className="btn-primary inline-block mt-2">
          Create your first group
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <Link key={g.groupId.toString()} href={`/groups/${g.groupId}`}>
          <div className="card hover:border-blue-700 transition-colors cursor-pointer flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{g.name}</p>
              <p className="text-sm text-gray-500">
                {g.members.length} member{g.members.length !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-gray-600 text-xl">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
