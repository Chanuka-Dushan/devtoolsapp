import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    let body: { toolSlug?: string; metadata?: Record<string, unknown> } = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty or plain text
    }

    const { toolSlug, metadata } = body;
    if (!toolSlug || typeof toolSlug !== "string") {
      return NextResponse.json({ ok: false, message: "Missing toolSlug" }, { status: 400 });
    }

    // Attempt to log to Prisma safely
    try {
      await prisma.toolUsage.create({
        data: {
          toolSlug,
          metadata: (metadata as object) || {},
        },
      });
    } catch (dbErr) {
      // If DB is offline or table not migrated yet, log debug and continue gracefully
      console.debug("[Analytics API] Database write skipped:", (dbErr as Error).message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Analytics API] Unexpected error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
