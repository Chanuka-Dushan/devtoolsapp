import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCompletion, isAIConfigured } from "@/lib/ai/provider";

const SQL_DIALECTS = ["PostgreSQL", "MySQL", "SQLite", "SQL Server", "Oracle", "Generic SQL"] as const;

const requestSchema = z.object({
  request: z.string().min(1, "Request is required").max(2000, "Request too long"),
  dialect: z.enum(SQL_DIALECTS).optional().default("PostgreSQL"),
  schemaContext: z.string().max(5000).optional().default(""),
});

export async function POST(req: NextRequest) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI service is not configured. Please set your AI_API_KEY environment variable." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed.", details: parsed.error.flatten() }, { status: 422 });
  }

  const { request, dialect, schemaContext } = parsed.data;

  const prompt = `Generate a ${dialect} SQL query for the following request.

**Request:** ${request}
${schemaContext ? `\n**Database Schema / Context:**\n${schemaContext}\n` : ""}

Respond with:
1. **SQL Query** — the complete, formatted SQL query in a code block
2. **Explanation** — plain English explanation of what the query does
3. **Warnings** — any destructive operations (DELETE/DROP/UPDATE without WHERE), performance concerns, or dialect-specific caveats

IMPORTANT SAFETY NOTES:
- If the query involves DELETE, DROP, TRUNCATE, or UPDATE without a WHERE clause, add a clear warning
- Never suggest queries that could cause data loss without explicit warning
- Remind the user to test queries on non-production data first`;

  const result = await getCompletion({
    messages: [
      {
        role: "system",
        content: `You are an expert SQL developer specializing in ${dialect}. Generate accurate, efficient, and safe SQL queries. Always warn about potentially destructive operations.`,
      },
      { role: "user", content: prompt },
    ],
    maxTokens: 1500,
    temperature: 0.1,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ result: result.content, dialect });
}
