import { describe, it, expect } from "vitest";
import { getToolBySlug, AI_TOOLS } from "@/lib/tools/registry";

describe("AI Cover Letter Writer Suite", () => {
  it("registers cover-letter-writer in AI_TOOLS registry", () => {
    const slugs = AI_TOOLS.map((t) => t.slug);
    expect(slugs).toContain("cover-letter-writer");
  });

  it("retrieves cover-letter-writer tool with expected properties", () => {
    const tool = getToolBySlug("cover-letter-writer");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("AI Cover Letter Writer");
    expect(tool?.category).toBe("ai");
    expect(tool?.path).toBe("/ai/cover-letter-writer");
    expect(tool?.isAI).toBe(true);
  });
});
