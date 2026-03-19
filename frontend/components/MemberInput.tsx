"use client";

import { useState, useEffect } from "react";
import { useBasenameResolver } from "@/hooks/useBasenameResolver";

interface ResolvedMember {
  basename: string;
  address: string;
}

interface Props {
  members: ResolvedMember[];
  onChange: (members: ResolvedMember[]) => void;
}

export function MemberInput({ members, onChange }: Props) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const { resolve } = useBasenameResolver();

  useEffect(() => {
    if (!input.trim()) { setStatus("idle"); return; }

    const timer = setTimeout(async () => {
      setStatus("loading");
      const addr = await resolve(input.trim());
      if (addr) {
        setResolvedAddress(addr);
        setStatus("found");
      } else {
        setResolvedAddress(null);
        setStatus("not_found");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [input, resolve]);

  function addMember() {
    if (!resolvedAddress || status !== "found") return;
    const normalized = input.trim().replace(/\.base\.eth$/, "");
    if (members.some((m) => m.address.toLowerCase() === resolvedAddress.toLowerCase())) return;
    onChange([...members, { basename: normalized, address: resolvedAddress }]);
    setInput("");
    setStatus("idle");
    setResolvedAddress(null);
  }

  function removeMember(address: string) {
    onChange(members.filter((m) => m.address !== address));
  }

  const statusIcon = {
    idle: null,
    loading: <span className="text-gray-500 text-sm animate-pulse">Resolving…</span>,
    found: <span className="text-green-400 text-sm">✓ {resolvedAddress?.slice(0, 6)}…{resolvedAddress?.slice(-4)}</span>,
    not_found: (
      <span className="text-red-400 text-sm">
        Not found —{" "}
        <a href="https://www.base.org/names" target="_blank" rel="noopener" className="underline">
          Register at base.org/names
        </a>
      </span>
    ),
  }[status];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="alice (resolves alice.base.eth)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMember()}
        />
        <button
          className="btn-secondary px-4"
          onClick={addMember}
          disabled={status !== "found"}
        >
          Add
        </button>
      </div>
      {statusIcon && <div>{statusIcon}</div>}

      {members.length > 0 && (
        <ul className="space-y-1.5">
          {members.map((m) => (
            <li
              key={m.address}
              className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
            >
              <div>
                <span className="font-medium">{m.basename}.base.eth</span>
                <span className="text-gray-500 text-xs ml-2">
                  {m.address.slice(0, 8)}…{m.address.slice(-6)}
                </span>
              </div>
              <button
                onClick={() => removeMember(m.address)}
                className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
