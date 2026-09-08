/**
 * AI Provider Abstraction Layer
 *
 * This module provides a provider-agnostic interface for AI completions.
 * Switch between Gemini, OpenAI, or other providers via environment variables.
 * Never hard-code API keys — always use environment variables.
 */

export type AIProvider = "openrouter" | "gemini" | "openai";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Stream the response (if supported by provider) */
  stream?: boolean;
}

export interface AICompletionResult {
  success: boolean;
  content?: string;
  error?: string;
  /** Provider-specific usage info */
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

/**
 * Get the configured AI provider from environment variables.
 */
export function getConfiguredProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === "openrouter") return "openrouter";
  if (provider === "openai") return "openai";
  if (provider === "gemini") return "gemini";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  return "openrouter"; // Default to openrouter
}

/**
 * Check if AI is configured (API key present).
 */
export function isAIConfigured(): boolean {
  const provider = getConfiguredProvider();
  if (provider === "openrouter") {
    return !!process.env.OPENROUTER_API_KEY || !!process.env.AI_API_KEY;
  }
  if (provider === "openai") {
    return !!process.env.OPENAI_API_KEY;
  }
  return !!process.env.GEMINI_API_KEY || !!process.env.AI_API_KEY;
}

/**
 * Main AI completion function.
 * Routes to the configured provider.
 */
export async function getCompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  if (!isAIConfigured()) {
    return {
      success: false,
      error:
        "AI service is not configured. Please set your OPENROUTER_API_KEY environment variable.",
    };
  }

  const provider = getConfiguredProvider();

  try {
    if (provider === "openrouter") {
      const { openrouterCompletion } = await import("./providers/openrouter");
      return openrouterCompletion(options);
    } else if (provider === "openai") {
      const { openaiCompletion } = await import("./providers/openai");
      return openaiCompletion(options);
    } else {
      const { geminiCompletion } = await import("./providers/gemini");
      return geminiCompletion(options);
    }
  } catch (err) {
    console.error("[AI Provider] Error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error occurred.";
    return {
      success: false,
      error: `AI service error: ${message}`,
    };
  }
}
