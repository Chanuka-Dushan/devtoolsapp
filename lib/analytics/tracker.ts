/**
 * Analytics and Usage Tracking
 *
 * Supports client-side history recording (localStorage) and server-side tracking (Prisma ToolUsage).
 * Respects user privacy: never records sensitive payloads, passwords, or secret tokens.
 */

export interface ToolHistoryItem {
  id: string;
  toolSlug: string;
  toolName: string;
  timestamp: number;
  summary?: string;
}

const STORAGE_KEY = "devtools_usage_history";
const MAX_HISTORY = 50;

/**
 * Record a tool usage event locally in localStorage and asynchronously on server.
 */
export function recordToolUsage(
  toolSlug: string,
  toolName: string,
  summary?: string
): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: ToolHistoryItem[] = raw ? JSON.parse(raw) : [];

    const newItem: ToolHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      toolSlug,
      toolName,
      timestamp: Date.now(),
      summary,
    };

    // Keep most recent first, limit to MAX_HISTORY
    const updated = [newItem, ...history.filter((h) => h.toolSlug !== toolSlug || Date.now() - h.timestamp > 60000)].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Async beacon/fetch to server (fire and forget)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ toolSlug, metadata: { summary } })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/tools/track", blob);
    } else {
      fetch("/api/tools/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug, metadata: { summary } }),
      }).catch(() => {});
    }
  } catch (err) {
    // Fail silently on storage errors
    console.debug("[Analytics] Failed to record usage:", err);
  }
}

/**
 * Get recent tool history from localStorage.
 */
export function getLocalToolHistory(): ToolHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear local tool history.
 */
export function clearLocalToolHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
