/**
 * Client for AutoCaption Studio API
 * Direct to FastAPI on port 8000 or via Next.js `/caption-api` rewrite
 */

const getApiUrls = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return [
    `http://localhost:8000${cleanEndpoint}`,
    `/caption-api${cleanEndpoint}`,
  ];
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

  throw lastError || new Error(`Failed to fetch ${endpoint} from all backend candidates.`);
}
