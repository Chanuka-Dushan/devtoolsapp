import { NextRequest, NextResponse } from "next/server";
import { authorizeAndTrackUsage } from "@/lib/auth/usageGuard";

export async function POST(request: NextRequest) {
  try {
    let body: { toolSlug?: string; metadata?: Record<string, unknown> } = {};
    try {
      body = await request.json();
    } catch {
      // body empty or non-json
    }

    const { toolSlug = "general", metadata = {} } = body;
    const result = await authorizeAndTrackUsage(request, toolSlug, metadata);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in authorize-tool route:", error);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR", message: "Server error during authorization" },
      { status: 500 }
    );
  }
}
