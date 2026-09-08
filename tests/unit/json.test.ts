import { describe, it, expect } from "vitest";
import { formatJSON, validateJSON, minifyJSON } from "@/lib/tools/json";

describe("formatJSON", () => {
  it("formats valid JSON with 2-space indentation", () => {
    const result = formatJSON('{"a":1,"b":2}');
    expect(result.success).toBe(true);
    expect(result.output).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("formats valid JSON with 4-space indentation", () => {
    const result = formatJSON('{"a":1}', 4);
    expect(result.success).toBe(true);
    expect(result.output).toBe('{\n    "a": 1\n}');
  });

  it("handles already-formatted JSON", () => {
    const input = '{\n  "key": "value"\n}';
    const result = formatJSON(input);
    expect(result.success).toBe(true);
  });

  it("returns error for invalid JSON", () => {
    const result = formatJSON("{invalid json}");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Invalid JSON");
  });

  it("returns error for empty input", () => {
    const result = formatJSON("");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Input is empty.");
  });

  it("handles JSON arrays", () => {
    const result = formatJSON("[1,2,3]");
    expect(result.success).toBe(true);
    expect(result.output).toBe("[\n  1,\n  2,\n  3\n]");
  });

  it("handles nested JSON", () => {
    const result = formatJSON('{"a":{"b":{"c":1}}}');
    expect(result.success).toBe(true);
    expect(result.output).toContain('"c": 1');
  });
});

describe("validateJSON", () => {
  it("returns success for valid JSON object", () => {
    const result = validateJSON('{"key": "value"}');
    expect(result.success).toBe(true);
  });

  it("returns success for valid JSON array", () => {
    const result = validateJSON("[1, 2, 3]");
    expect(result.success).toBe(true);
  });

  it("returns success for JSON primitives", () => {
    expect(validateJSON("true").success).toBe(true);
    expect(validateJSON("42").success).toBe(true);
    expect(validateJSON('"hello"').success).toBe(true);
    expect(validateJSON("null").success).toBe(true);
  });

  it("returns error for trailing comma", () => {
    const result = validateJSON('{"key": "value",}');
    expect(result.success).toBe(false);
  });

  it("returns error for unquoted keys", () => {
    const result = validateJSON("{key: 'value'}");
    expect(result.success).toBe(false);
  });

  it("returns error for empty input", () => {
    const result = validateJSON("");
    expect(result.success).toBe(false);
  });
});

describe("minifyJSON", () => {
  it("removes all whitespace from valid JSON", () => {
    const result = minifyJSON('{\n  "a": 1,\n  "b": 2\n}');
    expect(result.success).toBe(true);
    expect(result.output).toBe('{"a":1,"b":2}');
  });

  it("minifies JSON arrays", () => {
    const result = minifyJSON("[\n  1,\n  2,\n  3\n]");
    expect(result.success).toBe(true);
    expect(result.output).toBe("[1,2,3]");
  });

  it("returns error for invalid JSON", () => {
    const result = minifyJSON("{broken");
    expect(result.success).toBe(false);
  });

  it("output is shorter than input for formatted JSON", () => {
    const formatted = '{\n  "key": "value",\n  "count": 42\n}';
    const result = minifyJSON(formatted);
    expect(result.success).toBe(true);
    expect(result.output.length).toBeLessThan(formatted.length);
  });
});
