"use client";

import { useState, useCallback } from "react";

export type ResolveStatus = "idle" | "loading" | "resolved" | "not_found";

export function useBasenameResolver() {
  const [cache, setCache] = useState<Record<string, string>>({});

  const resolve = useCallback(
    async (basename: string): Promise<string | null> => {
      const normalized = basename.toLowerCase().replace(/\.base\.eth$/, "");
      if (!normalized) return null;

      const cacheKey = normalized;
      if (cache[cacheKey]) return cache[cacheKey];

      try {
        const res = await fetch(
          `/api/resolve-basename?name=${encodeURIComponent(normalized)}`
        );
        const data = await res.json();
        if (data.address) {
          setCache((prev) => ({ ...prev, [cacheKey]: data.address }));
          return data.address;
        }
        return null;
      } catch {
        return null;
      }
    },
    [cache]
  );

  return { resolve };
}
