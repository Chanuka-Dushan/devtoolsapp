import { NextRequest, NextResponse } from "next/server";
import { ensureBackendRunning } from "@/lib/caption/ensureBackend";

interface CaptionWord {
  word: string;
  start: number;
  end: number;
  probability?: number;
}

interface CaptionSegment {
  id: number | string;
  start: number;
  end: number;
  text: string;
  words?: CaptionWord[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const modelName = (formData.get("model_name") as string) || "tiny";
    const language = (formData.get("language") as string) || "auto";
    const videoPath = formData.get("video_path") as string | null;

    const configuredBackend =
      process.env.CAPTION_BACKEND_URL ||
      process.env.NEXT_PUBLIC_CAPTION_BACKEND_URL;
    const isProduction = process.env.NODE_ENV === "production";
    const backendUrl = configuredBackend || (!isProduction ? "http://127.0.0.1:8000" : null);

    // In local development, ensure the backend process is running on port 8000
    if (!isProduction && (!configuredBackend || configuredBackend.includes("127.0.0.1") || configuredBackend.includes("localhost"))) {
      await ensureBackendRunning();
    }

    let backendErrorMessage: string | null = null;

    // 1. Try external Python Whisper backend if configured (or localhost in dev)
    if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 300000); // 5 min timeout for Whisper AI transcription
        const forwardFormData = new FormData();
        forwardFormData.append("model_name", modelName);
        if (language && language !== "auto") {
          forwardFormData.append("language", language);
        }
        if (videoPath) {
          forwardFormData.append("video_path", videoPath);
        }
        if (file) {
          forwardFormData.append("file", file);
        }

        const res = await fetch(`${backendUrl.replace(/\/+$/, "")}/api/transcribe`, {
          method: "POST",
          body: forwardFormData,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data.segments && data.segments.length > 0) {
            return NextResponse.json(data);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          backendErrorMessage = errData.detail || `Backend returned status ${res.status}`;
        }
      } catch (backendErr: any) {
        backendErrorMessage = backendErr.message || "Failed to connect to local Whisper backend";
        console.debug("Backend transcribe proxy note:", backendErrorMessage);
      }
    }

    // 2. Cloud Whisper API via Groq or OpenAI if configured
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (file && (groqKey || openaiKey)) {
      try {
        const apiEndpoint = groqKey
          ? "https://api.groq.com/openai/v1/audio/transcriptions"
          : "https://api.openai.com/v1/audio/transcriptions";
        const authHeader = `Bearer ${groqKey || openaiKey}`;
        const modelToUse = groqKey ? "whisper-large-v3-turbo" : "whisper-1";

        const apiFormData = new FormData();
        apiFormData.append("file", file);
        apiFormData.append("model", modelToUse);
        apiFormData.append("response_format", "verbose_json");
        apiFormData.append("timestamp_granularities[]", "word");
        apiFormData.append("timestamp_granularities[]", "segment");
        if (language && language !== "auto") {
          apiFormData.append("language", language);
        }

        const whisperRes = await fetch(apiEndpoint, {
          method: "POST",
          headers: { Authorization: authHeader },
          body: apiFormData,
        });

        if (whisperRes.ok) {
          const wData = await whisperRes.json();
          const segments: CaptionSegment[] = (wData.segments || []).map(
            (seg: any, idx: number) => ({
              id: idx + 1,
              start: Math.round(seg.start * 100) / 100,
              end: Math.round(seg.end * 100) / 100,
              text: seg.text.trim(),
              words: (seg.words || []).map((w: any) => ({
                word: w.word.trim(),
                start: Math.round(w.start * 100) / 100,
                end: Math.round(w.end * 100) / 100,
              })),
            })
          );

          if (segments.length > 0) {
            return NextResponse.json({
              success: true,
              detected_language: wData.language || language,
              duration: wData.duration || 0,
              segments,
              mode: groqKey ? "groq-whisper" : "openai-whisper",
            });
          }
        }
      } catch (cloudErr: any) {
        console.warn("Cloud Whisper API attempt note:", cloudErr.message);
      }
    }

    // 3. If no transcription could be generated, return a truthful, helpful error
    // Never return fake/hardcoded demo captions for a user's uploaded video!
    const errorDetails = backendErrorMessage
      ? `Whisper transcription failed: ${backendErrorMessage}`
      : `AI Caption Backend is unreachable. Please verify that the Python backend is running on port 8000 ('npm run caption:backend'), or set GROQ_API_KEY in your environment for cloud transcription.`;

    return NextResponse.json(
      {
        success: false,
        error: errorDetails,
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Transcribe route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
