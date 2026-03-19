"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SPLITBASE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { MemberInput } from "@/components/MemberInput";

interface ResolvedMember {
  basename: string;
  address: string;
}

export default function NewGroupPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<ResolvedMember[]>([]);
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (isSuccess) {
    router.push("/");
  }

  function handleCreate() {
    setError("");
    if (!groupName.trim()) { setError("Please enter a group name."); return; }
    if (members.length === 0) { setError("Add at least one other member."); return; }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SPLITBASE_ABI,
      functionName: "createGroup",
      args: [
        groupName.trim(),
        members.map((m) => m.address as `0x${string}`),
      ],
    });
  }

  if (!isConnected) {
    return <p className="text-center text-gray-400 mt-20">Connect your wallet to create a group.</p>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create a Group</h1>

      <div className="card space-y-5">
        {/* Group name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Group Name</label>
          <input
            className="input"
            placeholder="e.g. Vegas Trip, House Expenses"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* Members */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">
            Members (by Basename)
          </label>
          <p className="text-xs text-gray-600">
            You are automatically included. Add the others.
          </p>
          <MemberInput members={members} onChange={setMembers} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          className="btn-primary w-full"
          onClick={handleCreate}
          disabled={isPending || isConfirming}
        >
          {isPending
            ? "Confirm in wallet…"
            : isConfirming
            ? "Creating group…"
            : "Create Group on Base"}
        </button>
      </div>

      {/* What happens explainer */}
      <div className="card bg-gray-900/50 space-y-2 text-sm text-gray-500">
        <p className="font-medium text-gray-400">What happens when you click Create?</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Your wallet signs one transaction on Base Sepolia.</li>
          <li>The smart contract records the group on-chain permanently.</li>
          <li>Gas cost: ~$0.001 (less than a fraction of a cent).</li>
          <li>Group members are identified by their wallet addresses (resolved from Basenames).</li>
        </ol>
      </div>
    </div>
  );
}
