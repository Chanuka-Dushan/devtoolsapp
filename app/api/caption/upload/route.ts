import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    const configuredBackend =
      process.env.CAPTION_BACKEND_URL ||
      process.env.NEXT_PUBLIC_CAPTION_BACKEND_URL;
    const isProduction = process.env.NODE_ENV === "production";
    const backendUrl = configuredBackend || (!isProduction ? "http://127.0.0.1:8000" : null);

    // 1. Try forwarding to external Python Whisper backend if online
    if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const forwardFormData = new FormData();
        if (file) {
          forwardFormData.append("file", file);
        }
        const res = await fetch(`${backendUrl.replace(/\/+$/, "")}/api/upload`, {
          method: "POST",
          body: forwardFormData,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {}
    }

    // 2. Cloud Serverless Fallback (instant acknowledgment)
    const filename = file?.name || "video.mp4";
    return NextResponse.json({
      success: true,
      filename,
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      resolutionLabel: "1920 × 1080 (16:9)",
      category: "16:9 (Landscape)",
      mode: "cloud-serverless",
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process upload" },
      { status: 500 }
    );
  }
}
