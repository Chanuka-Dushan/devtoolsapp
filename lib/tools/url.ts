/**
 * URL Encoder/Decoder Tool Logic
 */

export interface URLResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Encode a URL component (percent-encoding).
 * Uses encodeURIComponent which encodes all special chars except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
 */
export function encodeURL(input: string): URLResult {
  if (!input) {
    return { success: false, output: "", error: "Input is empty." };
  }
  try {
    const output = encodeURIComponent(input);
    return { success: true, output };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Encoding failed.";
    return { success: false, output: "", error: message };
  }
}

/**
 * Decode a percent-encoded URL component.
 */
export function decodeURL(input: string): URLResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Input is empty." };
  }
  try {
    const output = decodeURIComponent(trimmed);
    return { success: true, output };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Decoding failed.";
    return {
      success: false,
      output: "",
      error: `Invalid percent-encoding: ${message}`,
    };
  }
}
