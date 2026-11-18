/**
 * Client for AutoCaption Studio API
 * Supports:
 * 1. Cloud backend URL configured via `NEXT_PUBLIC_CAPTION_BACKEND_URL`
 * 2. Next.js `/caption-api` rewrite proxy (configured with CAPTION_BACKEND_URL)
 * 3. Local development fallback (localhost:8000) ONLY when running in local development
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
  // This avoids ERR_CONNECTION_REFUSED & Mixed Content warnings on hosted domains
  if (isLocalEnvironment()) {
    urls.push(`http://127.0.0.1:8000${cleanEndpoint}`);
    urls.push(`http://localhost:8000${cleanEndpoint}`);
  }

  // 3. Next.js proxy rewrite `/caption-api`
  urls.push(`/caption-api${cleanEndpoint}`);

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
    : `AI Caption Backend is offline or unreachable. Please set NEXT_PUBLIC_CAPTION_BACKEND_URL in your hosting environment settings.`;

  throw lastError || new Error(errMsg);
}
