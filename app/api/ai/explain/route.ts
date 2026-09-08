import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCompletion, isAIConfigured } from "@/lib/ai/provider";

const requestSchema = z.object({
  code: z.string().min(1, "Code is required").max(10000, "Code too long"),
  language: z.string().min(1).max(50).optional().default("auto"),
  style: z.enum(["concise", "detailed", "beginner"]).optional().default("detailed"),
});

/**
 * POST /api/ai/explain
 * Explain a code snippet using the configured AI provider.
 */
export async function POST(request: NextRequest) {
  // Check if AI is configured
  if (!isAIConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI service is not configured. Please set your AI_API_KEY environment variable.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { code, language, style } = parsed.data;

  const styleInstructions: Record<string, string> = {
    concise: "Be concise and direct. Use bullet points.",
    detailed: "Be thorough. Explain what the code does, key functions, potential issues, and suggestions.",
    beginner: "Explain as if to a beginner. Avoid jargon. Use simple examples.",
  };

  const prompt = `Explain the following ${language !== "auto" ? language : ""} code.

${styleInstructions[style]}

Structure your response with these sections:
1. **Summary** — what the code does in 1-3 sentences
2. **Key Functions/Logic** — explain important parts
3. **Potential Issues** — any bugs, security concerns, or edge cases
4. **Suggestions** — improvements (if any)

Code to explain:
\`\`\`${language !== "auto" ? language : ""}
${code}
\`\`\``;

  const result = await getCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are an expert software engineer and teacher. Explain code clearly, accurately, and helpfully. Never make up functionality that isn't in the code.",
      },
      { role: "user", content: prompt },
    ],
    maxTokens: 1500,
    temperature: 0.2,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ explanation: result.content });
}
