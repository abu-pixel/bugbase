import { NextResponse } from "next/server";
import { calculateScore } from "@/lib/scoring";

export async function POST(req: Request) {
  const body = await req.json();

  const { base, bonus, penalty } = body;

  const score = calculateScore(base, bonus, penalty);

  return NextResponse.json({ score });
}