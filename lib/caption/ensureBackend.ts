import { spawn } from "child_process";
import path from "path";
import fs from "fs";

let backendSpawnPromise: Promise<boolean> | null = null;

/**
 * Pings http://127.0.0.1:8000/api/health with a quick timeout.
 */
export async function isBackendHealthy(timeoutMs = 1200): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch("http://127.0.0.1:8000/api/health", {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Ensures the Python Whisper backend is running on 127.0.0.1:8000.
 * In local development, if port 8000 is not responding, it automatically
 * spawns the uvicorn process in the background and waits for it to become ready.
 */
export async function ensureBackendRunning(): Promise<boolean> {
  // If already healthy, return immediately
  const healthy = await isBackendHealthy(1000);
  if (healthy) return true;

  // Don't auto-spawn on hosted production environments (e.g. Vercel)
  if (process.env.NODE_ENV === "production" && !process.env.CAPTION_FORCE_LOCAL_BACKEND) {
    return false;
  }

  // Prevent multiple simultaneous spawn attempts
  if (backendSpawnPromise) {
    return backendSpawnPromise;
  }

  backendSpawnPromise = (async () => {
    try {
      // Look for backend directory
      const candidates = [
        "D:\\Video Auto Caption Tool\\backend",
        path.resolve(process.cwd(), "../Video Auto Caption Tool/backend"),
        path.resolve(process.cwd(), "backend"),
      ];

      let backendDir: string | null = null;
      for (const c of candidates) {
        if (fs.existsSync(/*turbopackIgnore: true*/ c) && fs.existsSync(/*turbopackIgnore: true*/ path.join(c, "main.py"))) {
          backendDir = c;
          break;
        }
      }

      if (!backendDir) {
        console.warn("[CaptionBackend] Could not locate Python backend directory.");
        return false;
      }

      console.log(`[CaptionBackend] Auto-starting Whisper backend in: ${backendDir}...`);

      const child = spawn(
        "python",
        ["-m", "uvicorn", "main:app", "--app-dir", backendDir, "--host", "127.0.0.1", "--port", "8000"],
        {
          detached: true,
          stdio: "ignore",
          cwd: backendDir,
          windowsHide: true,
        }
      );

      child.unref();

      // Poll until backend responds or 8s timeout
      const startTime = Date.now();
      while (Date.now() - startTime < 8000) {
        await new Promise((r) => setTimeout(r, 600));
        if (await isBackendHealthy(800)) {
          console.log("[CaptionBackend] Whisper backend successfully started on port 8000.");
          return true;
        }
      }

      console.warn("[CaptionBackend] Timed out waiting for port 8000 to become ready.");
      return false;
    } catch (err: any) {
      console.warn("[CaptionBackend] Error auto-spawning backend:", err.message);
      return false;
    } finally {
      backendSpawnPromise = null;
    }
  })();

  return backendSpawnPromise;
}
