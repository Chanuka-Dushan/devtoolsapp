/**
 * UUID Generator Tool Logic
 * Uses the Web Crypto API for cryptographically secure UUIDs.
 */

export interface UUIDResult {
  success: boolean;
  uuids: string[];
  error?: string;
}

/**
 * Generate a single UUID v4 using the Web Crypto API.
 */
export function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers + Node 18+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: manual UUID v4 construction
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate multiple UUIDs.
 * @param count Number of UUIDs to generate (1–100)
 */
export function generateUUIDs(count: number): UUIDResult {
  if (count < 1 || count > 100) {
    return {
      success: false,
      uuids: [],
      error: "Count must be between 1 and 100.",
    };
  }

  const uuids: string[] = [];
  for (let i = 0; i < count; i++) {
    uuids.push(generateUUID());
  }

  return { success: true, uuids };
}
