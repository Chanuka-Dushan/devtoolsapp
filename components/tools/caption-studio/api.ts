/**
 * Client for AutoCaption Studio API
 * Uses `/caption-api` Next.js rewrite or direct `http://localhost:8000`
 */

const getApiUrls = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return [
    `/caption-api${cleanEndpoint}`,
    `http://localhost:8000${cleanEndpoint}`,
  ];
};

export async function captionFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const urls = getApiUrls(endpoint);
  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to fetch ${endpoint} from all backend candidates.`);
}
