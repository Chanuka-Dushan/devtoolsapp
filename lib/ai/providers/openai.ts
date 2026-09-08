/**
 * OpenAI Provider
 * Uses the official openai SDK.
 */

import type { AICompletionOptions, AICompletionResult } from "../provider";

export async function openaiCompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "OpenAI API key not configured.",
    };
  }

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey });

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
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
    console.error("[OpenAI Provider] Error:", err);
    const message = err instanceof Error ? err.message : "OpenAI API error.";
    return {
      success: false,
      error: message.includes("API key")
        ? "Invalid or missing API key."
        : "AI service temporarily unavailable. Please try again.",
    };
  }
}
