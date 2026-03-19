import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";
import { SPLITBASE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

const chain = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

const client = createPublicClient({
  chain,
  transport: http(process.env.RPC_URL || undefined),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;

  try {
    const [name, members, exists] = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: SPLITBASE_ABI,
      functionName: "getGroup",
      args: [BigInt(groupId)],
    });
    return NextResponse.json({ name, members, exists });
  } catch {
    return NextResponse.json({ exists: false }, { status: 404 });
  }
}
