import { NextResponse } from "next/server";

export const revalidate = 30; // Cache for 30 seconds

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coinbase.com/v2/prices/ETH-USD/spot",
      { next: { revalidate: 30 } }
    );
    const data = await res.json();
    return NextResponse.json({ price: data?.data?.amount ?? null });
  } catch {
    return NextResponse.json({ price: null }, { status: 500 });
  }
}
