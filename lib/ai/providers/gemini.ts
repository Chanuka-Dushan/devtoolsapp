/**
 * Gemini AI Provider
 * Uses @google/generative-ai SDK.
 */

import type { AICompletionOptions, AICompletionResult } from "../provider";

export async function geminiCompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Gemini API key not configured.",
    };
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.3,
    },
  });

  // Build contents from messages
  const systemMessages = options.messages.filter((m) => m.role === "system");
  const conversationMessages = options.messages.filter((m) => m.role !== "system");

  const systemInstruction =
    systemMessages.length > 0
      ? systemMessages.map((m) => m.content).join("\n\n")
      : undefined;

  // Convert to Gemini's format
  const contents = conversationMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  try {
    // Handle system instruction via model config if available
    const modelWithSystem = systemInstruction
      ? genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
          systemInstruction,
          generationConfig: {
            maxOutputTokens: options.maxTokens ?? 2048,
            temperature: options.temperature ?? 0.3,
          },
        })
      : model;

    const result = await modelWithSystem.generateContent({ contents });
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      content: text,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini API error.";
    // Don't leak internal error details to the client
    console.error("[Gemini Provider] Error:", err);
    return {
      success: false,
      error: message.includes("API key")
        ? "Invalid or missing API key."
        : "AI service temporarily unavailable. Please try again.",
    };
  }
}
