/**
 * Base64 Tool Logic
 * Handles Unicode correctly using TextEncoder/TextDecoder.
 */

export interface Base64Result {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Encode a UTF-8 string to Base64.
 * Handles the full Unicode range — not limited to ASCII.
 */
export function encodeBase64(input: string): Base64Result {
  if (!input) {
    return { success: false, output: "", error: "Input is empty." };
  }

  try {
    // Handle Unicode: encode to UTF-8 bytes first, then to Base64
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const output = btoa(binary);
    return { success: true, output };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Encoding failed.";
    return { success: false, output: "", error: message };
  }
}

/**
 * Decode a Base64 string to UTF-8.
 */
export function decodeBase64(input: string): Base64Result {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Input is empty." };
  }

  try {
    // Validate Base64 format
    const cleaned = trimmed.replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
      return {
        success: false,
        output: "",
        error: "Invalid Base64 string. Contains illegal characters.",
      };
    }

    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const output = new TextDecoder().decode(bytes);
    return { success: true, output };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Decoding failed.";
    return {
      success: false,
      output: "",
      error: `Invalid Base64: ${message}`,
    };
  }
}
