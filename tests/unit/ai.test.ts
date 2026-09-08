import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getConfiguredProvider, isAIConfigured } from "@/lib/ai/provider";

describe("AI Provider Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("detects openrouter as default when OPENROUTER_API_KEY is present", () => {
    process.env.AI_PROVIDER = "openrouter";
    process.env.OPENROUTER_API_KEY = "sk-test-key";
    expect(getConfiguredProvider()).toBe("openrouter");
    expect(isAIConfigured()).toBe(true);
  });

  it("detects openai when AI_PROVIDER is openai and OPENAI_API_KEY is present", () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "sk-test-openai";
    delete process.env.OPENROUTER_API_KEY;
    expect(getConfiguredProvider()).toBe("openai");
    expect(isAIConfigured()).toBe(true);
  });

  it("detects gemini when AI_PROVIDER is gemini", () => {
    process.env.AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "test-gemini";
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(getConfiguredProvider()).toBe("gemini");
    expect(isAIConfigured()).toBe(true);
  });

  it("returns isAIConfigured=false when no keys are provided", () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_API_KEY;
    expect(isAIConfigured()).toBe(false);
  });
});
