/**
 * Timestamp Converter Tool Logic
 */

export interface TimestampResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface TimestampInfo {
  unix: number;
  unixMs: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
}

/**
 * Convert a Unix timestamp (seconds or milliseconds) to a detailed date info object.
 */
export function unixToDate(input: string | number): TimestampResult & { info?: TimestampInfo } {
  const raw = typeof input === "string" ? input.trim() : String(input);
  if (!raw) {
    return { success: false, error: "Input is empty." };
  }

  const num = Number(raw);
  if (isNaN(num)) {
    return { success: false, error: "Not a valid number." };
  }

  // Determine if seconds or milliseconds
  // Unix timestamps in seconds are ~10 digits, ms are ~13 digits
  const isMilliseconds = Math.abs(num) > 1e10;
  const ms = isMilliseconds ? num : num * 1000;
  const date = new Date(ms);

  if (isNaN(date.getTime())) {
    return { success: false, error: "Timestamp results in an invalid date." };
  }

  const info: TimestampInfo = {
    unix: Math.floor(ms / 1000),
    unixMs: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }),
    relative: getRelative(date),
  };

  return { success: true, output: info.local, info };
}

/**
 * Convert a date string or Date object to Unix timestamps.
 */
export function dateToUnix(input: string | Date): TimestampResult & { info?: TimestampInfo } {
  const raw = typeof input === "string" ? input.trim() : null;
  if (raw !== null && !raw) {
    return { success: false, error: "Input is empty." };
  }

  const date = input instanceof Date ? input : new Date(raw!);

  if (isNaN(date.getTime())) {
    return {
      success: false,
      error: "Could not parse date. Try formats like: 2024-01-15, January 15 2024, or ISO 8601.",
    };
  }

  const ms = date.getTime();
  const info: TimestampInfo = {
    unix: Math.floor(ms / 1000),
    unixMs: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }),
    relative: getRelative(date),
  };

  return { success: true, output: String(info.unix), info };
}

/**
 * Get the current Unix timestamp info.
 */
export function getCurrentTimestamp(): TimestampInfo {
  const date = new Date();
  const ms = date.getTime();
  return {
    unix: Math.floor(ms / 1000),
    unixMs: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative: "just now",
  };
}

function getRelative(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const abs = Math.abs(diffMs);
  const future = diffMs < 0;
  const prefix = future ? "in " : "";
  const suffix = future ? "" : " ago";

  if (abs < 60_000) return `${prefix}${Math.floor(abs / 1000)}s${suffix}`;
  if (abs < 3_600_000) return `${prefix}${Math.floor(abs / 60_000)}m${suffix}`;
  if (abs < 86_400_000) return `${prefix}${Math.floor(abs / 3_600_000)}h${suffix}`;
  if (abs < 2_592_000_000) return `${prefix}${Math.floor(abs / 86_400_000)}d${suffix}`;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
