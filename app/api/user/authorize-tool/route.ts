import { NextRequest, NextResponse } from "next/server";
import { checkToolAccess, consumeToolCredit } from "@/lib/auth/usageGuard";

export async function POST(request: NextRequest) {
  try {
    let body: { toolSlug?: string; action?: "check" | "consume"; metadata?: Record<string, unknown> } = {};
    try {
      body = await request.json();
    } catch {}

    const { toolSlug = "video-caption-generator", action = "check", metadata = {} } = body;

    let result;
    if (action === "consume") {
      result = await consumeToolCredit(request, toolSlug, metadata);
    } else {
      result = await checkToolAccess(request, toolSlug);
    }

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in authorize-tool route:", error);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR", message: "Server error during authorization" },
      { status: 500 }
    );
  }
}
