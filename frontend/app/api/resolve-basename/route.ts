import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";
import { normalize } from "viem/ens";

const chain =
  process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

// Base L2 Universal Resolver address (same on mainnet + sepolia)
const UNIVERSAL_RESOLVER = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";

const client = createPublicClient({
  chain,
  transport: http(process.env.RPC_URL || undefined),
});

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing name param" }, { status: 400 });
  }

  try {
    const fullName = name.endsWith(".base.eth") ? name : `${name}.base.eth`;
    const address = await client.getEnsAddress({
      name: normalize(fullName),
      universalResolverAddress: UNIVERSAL_RESOLVER,
    });

    if (!address) {
      return NextResponse.json({ address: null, found: false });
    }

    return NextResponse.json({ address, found: true });
  } catch (err: any) {
    // ENS not-found throws — treat as not found
    return NextResponse.json({ address: null, found: false });
  }
}
