"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SPLITBASE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { useEthPrice } from "@/hooks/useEthPrice";
import confetti from "canvas-confetti";

interface Props {
  groupId: bigint;
  creditor: `0x${string}`;
  creditorName: string;
  amountWei: bigint;
  onSuccess: () => void;
}

export function SettleButton({ groupId, creditor, creditorName, amountWei, onSuccess }: Props) {
  const { weiToUsd, weiToEth } = useEthPrice();
  const [settled, setSettled] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (isSuccess && !settled) {
    setSettled(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    onSuccess();
  }

  function handleSettle() {
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: SPLITBASE_ABI,
        functionName: "settle",
        args: [groupId, creditor],
        value: amountWei,
      },
      { onSuccess: (hash) => setTxHash(hash) }
    );
  }

  if (settled) {
    return (
      <div className="space-y-2">
        <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 text-center">
          <p className="text-green-400 font-semibold">🎉 Settled!</p>
          {txHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener"
              className="text-xs text-blue-400 underline"
            >
              View on Basescan ↗
            </a>
          )}
        </div>
        <a
          href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
            `Just settled a debt on-chain with SplitBase! 💸 No more "I'll pay you back." https://sepolia.basescan.org/tx/${txHash}`
          )}`}
          target="_blank"
          rel="noopener"
          className="block text-center text-xs text-purple-400 underline"
        >
          Share on Warpcast ↗
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
      <div>
        <p className="text-sm text-gray-300">
          You owe <span className="font-semibold text-white">{creditorName}</span>
        </p>
        <p className="text-xs text-gray-500">
          ${weiToUsd(amountWei)} ≈ {weiToEth(amountWei)} ETH
        </p>
      </div>
      <button
        className="btn-primary text-sm"
        onClick={handleSettle}
        disabled={isPending || isConfirming}
      >
        {isPending ? "Confirm…" : isConfirming ? "Settling…" : "Settle"}
      </button>
    </div>
  );
}
