import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCompletion, isAIConfigured } from "@/lib/ai/provider";

const requestSchema = z.object({
  jobDescription: z.string().min(10, "Job description must be at least 10 characters.").max(15000, "Job description too long."),
  jobTitle: z.string().max(100).optional().default(""),
  companyName: z.string().max(100).optional().default(""),
  userExperience: z.string().max(8000).optional().default(""),
  tone: z.enum(["professional", "modern", "enthusiastic", "concise", "executive"]).optional().default("modern"),
  letterLength: z.enum(["short", "standard", "detailed"]).optional().default("standard"),
});

export async function POST(request: NextRequest) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI service is not configured. Please set your OPENROUTER_API_KEY environment variable.",
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

  const { jobDescription, jobTitle, companyName, userExperience, tone, letterLength } = parsed.data;

  const toneInstructions: Record<string, string> = {
    professional: "Polished, formal, and articulate tone emphasizing credentials, standards, and reliability.",
    modern: "Confident, engaging, contemporary, and authentic. Natural yet authoritative voice.",
    enthusiastic: "High energy, passion for the company's mission and product, eager and proactive.",
    concise: "Ultra direct, punchy, high-impact bullet points, no fluff or filler words.",
    executive: "Strategic, leadership-focused, business value, ROI, and vision-oriented.",
  };

  const lengthInstructions: Record<string, string> = {
    short: "Keep it under 220 words. 3 tight paragraphs or bullet points.",
    standard: "Around 320-380 words. Standard 3-4 paragraph layout with hook, qualifications, and closing.",
    detailed: "Around 450-520 words. In-depth alignment across multiple initiatives and achievements.",
  };

  const systemPrompt = `You are a world-class career strategist, executive resume writer, and recruiter.
Your job is to generate an exceptional, highly customized, ATS-optimized cover letter based on the provided Job Description.

Key Rules:
1. Do NOT write a generic cookie-cutter letter. Specifically weave in key skills, problems, and technical requirements mentioned in the Job Description.
2. If candidate experience/skills are provided, directly map their achievements to the company's requirements. If not provided, make realistic, exemplary professional assertions that directly address the JD.
3. Use clean formatting with clear paragraph breaks.
4. Include standard letter metadata headers (Date, Recipient: Hiring Team, Subject line).
5. Use placeholders like [Your Name], [Your Phone], [Your Email], [Portfolio/LinkedIn Link] where appropriate.
6. Return the response in clean Markdown with the cover letter text, followed by a brief '### Key ATS Keywords Matched' list and '### Top Interview Talking Points' section.`;

  const userPrompt = `Job Title: ${jobTitle || "As specified in job description"}
Company: ${companyName || "The Hiring Organization"}
Target Tone: ${toneInstructions[tone]}
Length Requirement: ${lengthInstructions[letterLength]}

Candidate Experience / Highlights:
${userExperience.trim() ? userExperience : "Experienced professional with deep expertise aligned with the JD requirements."}

Job Description:
"""
${jobDescription}
"""

Please generate the complete, ready-to-send cover letter now.`;

  try {
    const result = await getCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 1800,
    });

    if (!result.success || !result.content) {
      return NextResponse.json(
        { error: result.error || "Failed to generate cover letter." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      coverLetter: result.content,
      usage: result.usage,
    });
  } catch (err: any) {
    console.error("Cover letter generation error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
