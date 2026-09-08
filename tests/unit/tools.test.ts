import { describe, it, expect } from "vitest";
import { encodeURL, decodeURL } from "@/lib/tools/url";
import { generateUUIDs } from "@/lib/tools/uuid";
import { decodeJWT } from "@/lib/tools/jwt";
import { testRegex } from "@/lib/tools/regex";
import { unixToDate, dateToUnix } from "@/lib/tools/timestamp";

// ─── URL ──────────────────────────────────────────────────────────────────────
describe("encodeURL", () => {
  it("encodes special characters", () => {
    const result = encodeURL("hello world & more");
    expect(result.success).toBe(true);
    expect(result.output).toBe("hello%20world%20%26%20more");
  });

  it("fails on empty input", () => {
    expect(encodeURL("").success).toBe(false);
  });

  it("encodes URL-unsafe characters", () => {
    const result = encodeURL("https://example.com/path?q=a+b&c=d");
    expect(result.success).toBe(true);
    expect(result.output).not.toContain(" ");
  });
});

describe("decodeURL", () => {
  it("decodes percent-encoded characters", () => {
    const result = decodeURL("hello%20world");
    expect(result.success).toBe(true);
    expect(result.output).toBe("hello world");
  });

  it("fails on invalid percent-encoding", () => {
    const result = decodeURL("%gg");
    expect(result.success).toBe(false);
  });

  it("encode-decode roundtrip", () => {
    const original = "search?q=hello world&page=1";
    const encoded = encodeURL(original);
    const decoded = decodeURL(encoded.output);
    expect(decoded.output).toBe(original);
  });
});

// ─── UUID ─────────────────────────────────────────────────────────────────────
describe("generateUUIDs", () => {
  it("generates the requested number of UUIDs", () => {
    const result = generateUUIDs(5);
    expect(result.success).toBe(true);
    expect(result.uuids).toHaveLength(5);
  });

  it("generates valid UUID v4 format", () => {
    const result = generateUUIDs(1);
    expect(result.success).toBe(true);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(result.uuids[0])).toBe(true);
  });

  it("generates unique UUIDs", () => {
    const result = generateUUIDs(100);
    const unique = new Set(result.uuids);
    expect(unique.size).toBe(100);
  });

  it("fails for count > 100", () => {
    const result = generateUUIDs(101);
    expect(result.success).toBe(false);
  });

  it("fails for count < 1", () => {
    const result = generateUUIDs(0);
    expect(result.success).toBe(false);
  });
});

// ─── JWT ──────────────────────────────────────────────────────────────────────
describe("decodeJWT", () => {
  // A real JWT structure (this is NOT a verified JWT — just for decode testing)
  const sampleJWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  it("decodes a valid JWT", () => {
    const result = decodeJWT(sampleJWT);
    expect(result.success).toBe(true);
    expect(result.header?.alg).toBe("HS256");
    expect(result.header?.typ).toBe("JWT");
    expect(result.payload?.sub).toBe("1234567890");
    expect(result.payload?.name).toBe("John Doe");
  });

  it("fails for empty input", () => {
    expect(decodeJWT("").success).toBe(false);
  });

  it("fails for token with wrong number of parts", () => {
    expect(decodeJWT("only.two").success).toBe(false);
    expect(decodeJWT("one").success).toBe(false);
  });

  it("correctly identifies expiration for expired token", () => {
    // Token with exp in the past
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const payload = btoa(JSON.stringify({ exp: pastExp })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const token = `${header}.${payload}.fakesig`;
    const result = decodeJWT(token);
    expect(result.success).toBe(true);
    expect(result.isExpired).toBe(true);
  });
});

// ─── Regex ────────────────────────────────────────────────────────────────────
describe("testRegex", () => {
  it("finds matches with global flag", () => {
    const result = testRegex("\\d+", "abc 123 def 456", ["g"]);
    expect(result.success).toBe(true);
    expect(result.matchCount).toBe(2);
    expect(result.matches[0].fullMatch).toBe("123");
    expect(result.matches[1].fullMatch).toBe("456");
  });

  it("is case insensitive with i flag", () => {
    const result = testRegex("hello", "Hello World", ["g", "i"]);
    expect(result.success).toBe(true);
    expect(result.matchCount).toBe(1);
  });

  it("returns error for invalid regex", () => {
    const result = testRegex("[invalid", "test");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns empty matches for no match", () => {
    const result = testRegex("xyz", "abc", ["g"]);
    expect(result.success).toBe(true);
    expect(result.matchCount).toBe(0);
  });
});

// ─── Timestamp ───────────────────────────────────────────────────────────────
describe("unixToDate", () => {
  it("converts Unix seconds to date info", () => {
    const result = unixToDate("1700000000");
    expect(result.success).toBe(true);
    expect(result.info?.unix).toBe(1700000000);
    expect(result.info?.iso).toContain("2023");
  });

  it("auto-detects milliseconds", () => {
    const result = unixToDate("1700000000000");
    expect(result.success).toBe(true);
    expect(result.info?.unix).toBe(1700000000);
  });

  it("fails for non-numeric input", () => {
    const result = unixToDate("not-a-number");
    expect(result.success).toBe(false);
  });
});

describe("dateToUnix", () => {
  it("converts ISO date to Unix timestamp", () => {
    const result = dateToUnix("2023-01-01T00:00:00Z");
    expect(result.success).toBe(true);
    expect(result.info?.unix).toBe(1672531200);
  });

  it("fails for invalid date strings", () => {
    const result = dateToUnix("not-a-date");
    expect(result.success).toBe(false);
  });
});
