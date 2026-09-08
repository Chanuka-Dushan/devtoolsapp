/**
 * JWT Decoder Tool Logic
 *
 * IMPORTANT SECURITY NOTE:
 * This tool ONLY decodes JWT tokens (base64url decoding of header + payload).
 * It does NOT verify the cryptographic signature.
 * A successfully decoded token is NOT a verified or trusted token.
 * Never use decoded claims for authorization without proper signature verification.
 */

export interface JWTHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JWTPayload {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface JWTDecodeResult {
  success: boolean;
  header?: JWTHeader;
  payload?: JWTPayload;
  signature?: string;
  error?: string;
  /** Expiration date if exp claim is present */
  expiresAt?: Date;
  /** Whether the token is expired (based on exp claim only — NOT cryptographic verification) */
  isExpired?: boolean;
}

/**
 * Decode a JWT token without verifying the signature.
 *
 * @security This does NOT verify the signature. Do not use decoded claims for auth.
 */
export function decodeJWT(token: string): JWTDecodeResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { success: false, error: "Input is empty." };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      success: false,
      error: `A JWT must have exactly 3 parts separated by dots. Found ${parts.length} part(s).`,
    };
  }

  const [headerPart, payloadPart, signaturePart] = parts;

  let header: JWTHeader;
  let payload: JWTPayload;

  try {
    header = JSON.parse(base64urlDecode(headerPart));
  } catch {
    return {
      success: false,
      error: "Failed to decode JWT header. It may be malformed.",
    };
  }

  try {
    payload = JSON.parse(base64urlDecode(payloadPart));
  } catch {
    return {
      success: false,
      error: "Failed to decode JWT payload. It may be malformed.",
    };
  }

  let expiresAt: Date | undefined;
  let isExpired: boolean | undefined;

  if (typeof payload.exp === "number") {
    expiresAt = new Date(payload.exp * 1000);
    isExpired = Date.now() > payload.exp * 1000;
  }

  return {
    success: true,
    header,
    payload,
    signature: signaturePart,
    expiresAt,
    isExpired,
  };
}

/**
 * Decode a base64url-encoded string to UTF-8.
 */
function base64urlDecode(input: string): string {
  // Convert base64url to standard base64
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  // Decode
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
