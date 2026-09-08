import { describe, it, expect } from "vitest";
import { encodeBase64, decodeBase64 } from "@/lib/tools/base64";

describe("encodeBase64", () => {
  it("encodes ASCII text correctly", () => {
    const result = encodeBase64("Hello, World!");
    expect(result.success).toBe(true);
    expect(result.output).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("encodes empty string fails", () => {
    const result = encodeBase64("");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("encodes Unicode text", () => {
    const result = encodeBase64("Hello 🌍");
    expect(result.success).toBe(true);
    expect(result.output).toBeTruthy();
  });

  it("encoded result contains only valid Base64 characters", () => {
    const result = encodeBase64("test string");
    expect(result.success).toBe(true);
    expect(/^[A-Za-z0-9+/=]+$/.test(result.output)).toBe(true);
  });
});

describe("decodeBase64", () => {
  it("decodes valid Base64", () => {
    const result = decodeBase64("SGVsbG8sIFdvcmxkIQ==");
    expect(result.success).toBe(true);
    expect(result.output).toBe("Hello, World!");
  });

  it("decodes Base64 without padding", () => {
    const encoded = btoa("test");
    const result = decodeBase64(encoded);
    expect(result.success).toBe(true);
    expect(result.output).toBe("test");
  });

  it("fails on invalid Base64", () => {
    const result = decodeBase64("!!!invalid!!!");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("fails on empty input", () => {
    const result = decodeBase64("");
    expect(result.success).toBe(false);
  });

  it("encode-decode roundtrip is lossless", () => {
    const original = "The quick brown fox jumps over the lazy dog 1234567890!";
    const encoded = encodeBase64(original);
    expect(encoded.success).toBe(true);
    const decoded = decodeBase64(encoded.output);
    expect(decoded.success).toBe(true);
    expect(decoded.output).toBe(original);
  });
});
