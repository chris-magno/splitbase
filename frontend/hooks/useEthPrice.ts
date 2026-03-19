"use client";

import { useState, useEffect } from "react";

export function useEthPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch("/api/eth-price");
        const data = await res.json();
        if (data.price) setPrice(parseFloat(data.price));
      } catch {
        // fallback: keep previous price
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 30_000);
    return () => clearInterval(interval);
  }, []);

  function usdToWei(usd: number): bigint {
    if (!price || price === 0) return 0n;
    const eth = usd / price;
    return BigInt(Math.round(eth * 1e18));
  }

  function weiToUsd(wei: bigint): string {
    if (!price) return "–";
    const eth = Number(wei) / 1e18;
    return (eth * price).toFixed(2);
  }

  function weiToEth(wei: bigint): string {
    return (Number(wei) / 1e18).toFixed(6);
  }

  return { price, usdToWei, weiToUsd, weiToEth };
}
