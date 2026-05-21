// app/api/score/update/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateFinalScore } from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      bugQuality,
      examScore,
      reportScore,
    } = body;

    // 🧠 Basic validation (anti-abuse)
    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    // 🔐 Calculate score ONLY on server
    const finalScore = calculateFinalScore({
      bugQuality,
      examScore,
      reportScore,
    });

    // 💾 Update DB securely
    const { error } = await supabase
      .from("users")
      .update({
        total_score: finalScore,
      })
      .eq("id", user_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      finalScore,
    });

  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Server error",
        details: err?.message || "unknown",
      },
      { status: 500 }
    );
  }
}