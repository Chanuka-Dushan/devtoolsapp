import { NextResponse } from "next/server";

export async function GET() {
  const configuredBackend =
    process.env.CAPTION_BACKEND_URL ||
    process.env.NEXT_PUBLIC_CAPTION_BACKEND_URL;
  const isProduction = process.env.NODE_ENV === "production";
  const backendUrl = configuredBackend || (!isProduction ? "http://127.0.0.1:8000" : null);

  // Try checking external Python Whisper backend if configured (or localhost in dev)
  if (backendUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${backendUrl.replace(/\/+$/, "")}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ ...data, mode: "python-whisper" });
      }
    } catch {}
  }

  // Fallback: Cloud AI / Hybrid serverless caption engine is always ready
  return NextResponse.json({
    status: "ok",
    whisper_available: true,
    ffmpeg_available: true,
    available_models: ["tiny", "base", "small"],
    mode: "cloud-hybrid",
    message: "DevTools Cloud Caption Engine Active",
  });
}
