"use client";

import { useState } from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";

export function ConnectWalletButton() {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [showPicker, setShowPicker] = useState(false);

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="btn-secondary text-sm text-gray-400"
      >
        Disconnect
      </button>
    );
  }

  // Wallet label map
  const walletLabels: Record<string, { label: string; icon: string; hint: string }> = {
    baseWallet: {
      label: "Base Wallet",
      icon: "🔵",
      hint: "Recommended — install from Chrome Web Store",
    },
    coinbaseWallet: {
      label: "Coinbase Smart Wallet",
      icon: "🔑",
      hint: "Passkey / FaceID — no seed phrase",
    },
    metaMask: {
      label: "MetaMask",
      icon: "🦊",
      hint: "Standard browser wallet",
    },
  };

  return (
    <div className="relative">
      <button
        className="btn-primary"
        onClick={() => setShowPicker((v) => !v)}
        disabled={isPending}
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>

      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-sm font-semibold text-gray-300">
                Choose a wallet
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Base Wallet is recommended for this app
              </p>
            </div>

            <div className="p-2 space-y-1">
              {connectors.map((connector) => {
                const meta = walletLabels[connector.id] ?? {
                  label: connector.name,
                  icon: "💼",
                  hint: "",
                };
                return (
                  <button
                    key={connector.id}
                    onClick={() => {
                      connect({ connector });
                      setShowPicker(false);
                    }}
                    className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="text-2xl leading-none mt-0.5">
                      {meta.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {meta.label}
                      </p>
                      {meta.hint && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {meta.hint}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-gray-800">
              <a
                href="https://chromewebstore.google.com/detail/base-wallet/oonmhmgnhgnoeoioikfnaoadhiaeoebh"
                target="_blank"
                rel="noopener"
                className="text-xs text-blue-400 underline"
              >
                Don't have Base Wallet? Install it here ↗
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

