import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCompletion, isAIConfigured } from "@/lib/ai/provider";

const requestSchema = z.object({
  code: z.string().min(1, "Code is required").max(10000, "Code too long"),
  language: z.string().min(1).max(50).optional().default("auto"),
  errorMessage: z.string().max(2000).optional().default(""),
  context: z.string().max(2000).optional().default(""),
});

export async function POST(request: NextRequest) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI service is not configured. Please set your AI_API_KEY environment variable." },
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
    return NextResponse.json({ error: "Validation failed.", details: parsed.error.flatten() }, { status: 422 });
  }

  const { code, language, errorMessage, context } = parsed.data;

  const prompt = `Debug the following ${language !== "auto" ? language : ""} code.

${errorMessage ? `**Error message:**\n${errorMessage}\n` : ""}
${context ? `**Additional context:**\n${context}\n` : ""}

**Code:**
\`\`\`${language !== "auto" ? language : ""}
${code}
\`\`\`

Structure your response with:
1. **Probable Cause** — what is most likely causing the issue
2. **Explanation** — why this causes the observed error
3. **Suggested Fix** — step-by-step fix
4. **Fixed Code** — provide the corrected code

IMPORTANT: State clearly that your suggestions are AI-generated and should be tested. Do not guarantee correctness.`;

  const result = await getCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are an expert debugger. Analyze code and errors carefully. Provide accurate diagnoses and fixes. Always acknowledge uncertainty when present.",
      },
      { role: "user", content: prompt },
    ],
    maxTokens: 2000,
    temperature: 0.1,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ analysis: result.content });
}
