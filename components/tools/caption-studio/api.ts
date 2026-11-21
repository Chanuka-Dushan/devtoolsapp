/**
 * Client for AutoCaption Studio API
 * Supports:
 * 1. Cloud backend URL configured via `NEXT_PUBLIC_CAPTION_BACKEND_URL`
 * 2. Next.js `/caption-api` rewrite proxy (configured with CAPTION_BACKEND_URL)
 * 3. Built-in Next.js `/api/caption` serverless routes (Guaranteed zero-404 on Vercel / hosted domains)
 * 4. Localhost on port 8000 ONLY when running in local development
 */

export const getApiBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CAPTION_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_CAPTION_BACKEND_URL.replace(/\/+$/, "");
  }
  return "";
};

export const isLocalEnvironment = (): boolean => {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
};

export const getApiUrls = (endpoint: string): string[] => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const urls: string[] = [];

  // 1. Cloud backend URL (e.g. from environment variable or cloud tunnel)
  const cloudBase = getApiBaseUrl();
  if (cloudBase) {
    urls.push(`${cloudBase}${cleanEndpoint}`);
  }

  // 2. Local dev server direct access (ONLY if running on localhost / 127.0.0.1)
  if (isLocalEnvironment()) {
    urls.push(`http://127.0.0.1:8000${cleanEndpoint}`);
    urls.push(`http://localhost:8000${cleanEndpoint}`);
  }

  // 3. Next.js proxy rewrite `/caption-api`
  urls.push(`/caption-api${cleanEndpoint}`);

  // 4. Built-in Next.js serverless route `/api/caption` (Always works on hosted domains like magictools.tech)
  const subPath = cleanEndpoint.startsWith("/api/")
    ? cleanEndpoint.substring(4)
    : cleanEndpoint.startsWith("/")
    ? cleanEndpoint
    : `/${cleanEndpoint}`;
  urls.push(`/api/caption${subPath}`);

  // Deduplicate URLs while preserving priority order
  return Array.from(new Set(urls));
};

export async function captionFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const urls = getApiUrls(endpoint);
  let lastResponse: Response | null = null;
  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        return res;
      }
      lastResponse = res;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  const isLocal = isLocalEnvironment();
  const errMsg = isLocal
    ? `Unable to connect to Whisper backend on port 8000. Run 'npm run caption:backend' to start the AI engine.`
    : `AI Caption Backend is currently offline. Please configure your backend server.`;

  throw lastError || new Error(errMsg);
}

/**
 * Uploads a video file while accurately reporting upload progress percentage (0 - 100%)
 */
export async function uploadWithProgress(
  endpoint: string,
  formData: FormData,
  onProgress?: (percentage: number) => void
): Promise<any> {
  const urls = getApiUrls(endpoint);
  let lastError: any = null;

  for (const url of urls) {
    try {
      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && e.total > 0) {
              const pct = Math.min(100, Math.max(1, Math.round((e.loaded / e.total) * 100)));
              onProgress(pct);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText);
              resolve(parsed);
            } catch {
              resolve({ success: true });
            }
          } else {
            reject(new Error(`Server responded with ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network connection error"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));
        xhr.timeout = 120000; // 2 minutes max
        xhr.send(formData);
      });

      return data;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to upload video to all candidate endpoints.");
}
