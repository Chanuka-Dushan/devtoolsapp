/**
 * OpenRouter AI Provider
 *
 * Uses OpenAI-compatible API client pointing to https://openrouter.ai/api/v1
 * Supports diverse models (GPT-4o-mini, Claude, Llama 3, DeepSeek, etc.)
 */

import type { AICompletionOptions, AICompletionResult } from "../provider";

export async function openrouterCompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "OpenRouter API key is not configured.",
    };
  }

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "DevTools Platform",
      },
    });

    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    const response = await client.chat.completions.create({
      model,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.3,
    });

    const content = response.choices[0]?.message?.content ?? "";

    return {
      success: true,
      content,
      usage: {
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      },
    };
  } catch (err) {
    console.error("[OpenRouter Provider] Error:", err);
    const message = err instanceof Error ? err.message : "OpenRouter API error.";

    if (message.includes("401") || message.includes("API key")) {
      return {
        success: false,
        error: "Invalid or unauthorized OpenRouter API key.",
      };
    }

    if (message.includes("429") || message.includes("quota")) {
      return {
        success: false,
        error: "OpenRouter rate limit or credit quota exceeded.",
      };
    }

    return {
      success: false,
      error: `AI service error: ${message}`,
    };
  }
}
