import { describe, it, expect } from "vitest";
import { inspectHtml } from "@/lib/seo/inspector";
import { getToolBySlug } from "@/lib/tools/registry";

describe("Website SEO Checker Suite", () => {
  it("registers seo-checker in tool registry", () => {
    const tool = getToolBySlug("seo-checker");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("Website SEO Checker");
    expect(tool?.path).toBe("/tools/seo-checker");
  });

  it("detects missing title and h1 and flags critical errors", () => {
    const rawHtml = `<html><head></head><body><p>Bare body content without headers</p></body></html>`;
    const result = inspectHtml(rawHtml, "https://example.com");

    expect(result.score).toBeLessThan(70);
    const errorIds = result.issues.filter((i) => i.type === "error").map((i) => i.id);
    expect(errorIds).toContain("missing-title");
    expect(errorIds).toContain("missing-h1");
  });

  it("scores well-optimized HTML highly with A/A+ grade", () => {
    const optimizedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Comprehensive Developer Tools & Utilities Online</title>
        <meta name="description" content="Access dozens of free developer utilities including JSON formatters, Base64 converters, and PDF tools directly in your browser." />
        <link rel="canonical" href="https://example.com/tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Comprehensive Developer Tools" />
        <meta property="og:description" content="Access free developer utilities in your browser." />
        <meta property="og:image" content="https://example.com/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>
      </head>
      <body>
        <h1>Primary Developer Tools Dashboard</h1>
        <h2>Featured Image & PDF Converters</h2>
        <img src="/logo.png" alt="DevTools Platform Logo" />
      </body>
      </html>
    `;

    const result = inspectHtml(optimizedHtml, "https://example.com/tools");
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.grade).toMatch(/A\+?/);
    expect(result.stats.titleLength).toBeGreaterThanOrEqual(30);
    expect(result.stats.hasCanonical).toBe(true);
    expect(result.stats.hasOg).toBe(true);
    expect(result.stats.h1Count).toBe(1);
    expect(result.stats.imagesWithoutAlt).toBe(0);
  });
});
