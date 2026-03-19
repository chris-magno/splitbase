import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { baseSepolia, base } from "viem/chains";
import { SPLITBASE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

const chain = process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseSepolia;

const client = createPublicClient({
  chain,
  transport: http(process.env.RPC_URL || undefined),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const groupId = searchParams.get("groupId");
  const debtor = searchParams.get("debtor");
  const creditor = searchParams.get("creditor");

  if (!groupId || !debtor || !creditor) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const amount = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: SPLITBASE_ABI,
      functionName: "getBalance",
      args: [BigInt(groupId), debtor as `0x${string}`, creditor as `0x${string}`],
    });
    return NextResponse.json({ amount: amount.toString() });
  } catch (err: any) {
    return NextResponse.json({ amount: "0" });
  }
}
