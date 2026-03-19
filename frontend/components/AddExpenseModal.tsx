"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { SPLITBASE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { useEthPrice } from "@/hooks/useEthPrice";

interface Props {
  groupId: bigint;
  memberCount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function AddExpenseModal({ groupId, memberCount, onSuccess, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const { price, usdToWei, weiToEth } = useEthPrice();

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (isSuccess) { onSuccess(); }

  const weiAmount = usdAmount ? usdToWei(parseFloat(usdAmount)) : 0n;
  const ethDisplay = weiAmount > 0n ? weiToEth(weiAmount) : "0";
  const shareWei = memberCount > 0 ? weiAmount / BigInt(memberCount) : 0n;
  const shareEth = shareWei > 0n ? weiToEth(shareWei) : "0";
  const shareUsd = usdAmount && memberCount > 0
    ? (parseFloat(usdAmount) / memberCount).toFixed(2)
    : "0.00";

  function handleSubmit() {
    if (!description.trim() || weiAmount === 0n) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SPLITBASE_ABI,
      functionName: "addExpense",
      args: [groupId, description.trim()],
      value: weiAmount,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Description</label>
          <input
            className="input"
            placeholder="e.g. Dinner, Airbnb, Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-yellow-600">⚠️ Descriptions are public on-chain. Keep it generic.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Total Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              className="input pl-7"
              type="number"
              placeholder="0.00"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
            />
          </div>
          {price && weiAmount > 0n && (
            <p className="text-xs text-gray-500">
              ≈ {ethDisplay} ETH{" "}
              <span className="text-gray-600">
                (ETH price: ${price.toFixed(2)})
              </span>
            </p>
          )}
        </div>

        {/* Split preview */}
        {weiAmount > 0n && (
          <div className="bg-gray-800 rounded-xl p-4 space-y-1 text-sm">
            <p className="text-gray-400 font-medium">Split Preview</p>
            <p className="text-gray-300">
              ${usdAmount} ÷ {memberCount} people ={" "}
              <span className="text-white font-semibold">${shareUsd} / person</span>
            </p>
            <p className="text-gray-500 text-xs">≈ {shareEth} ETH each</p>
          </div>
        )}

        {writeError && (
          <p className="text-red-400 text-sm">{writeError.message.slice(0, 100)}</p>
        )}

        <button
          className="btn-primary w-full"
          onClick={handleSubmit}
          disabled={isPending || isConfirming || !description.trim() || weiAmount === 0n}
        >
          {isPending ? "Confirm in wallet…" : isConfirming ? "Recording expense…" : "Log Expense on Base"}
        </button>
      </div>
    </div>
  );
}
