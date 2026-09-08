import { describe, it, expect } from "vitest";
import { generateToolMetadata, generateToolJsonLd } from "@/lib/seo/tool-seo";
import { TOOLS } from "@/lib/tools/registry";
import fs from "fs";
import path from "path";

describe("Tool-Specific SEO & AdSense Suite", () => {
  it("generates comprehensive SEO metadata for every tool in the registry", () => {
    for (const tool of TOOLS) {
      const meta = generateToolMetadata(tool.slug);
      expect(meta.title).toBeDefined();
      expect(typeof meta.title).toBe("string");
      expect((meta.title as string).includes(tool.name)).toBe(true);

      expect(meta.description).toBeDefined();
      expect(typeof meta.description).toBe("string");
      expect((meta.description as string).length).toBeGreaterThan(15);

      expect(meta.alternates?.canonical).toBeDefined();
      expect((meta.alternates?.canonical as string).endsWith(tool.path)).toBe(true);

      expect(meta.openGraph).toBeDefined();
      expect(meta.twitter).toBeDefined();
    }
  });

  it("generates valid Google WebApplication JSON-LD schema for each tool", () => {
    for (const tool of TOOLS) {
      const schema = generateToolJsonLd(tool.slug);
      expect(schema).toBeDefined();
      expect(schema?.["@context"]).toBe("https://schema.org");
      expect(schema?.["@type"]).toBe("WebApplication");
      expect(schema?.name).toBe(tool.name);
      expect(schema?.offers.price).toBe("0");
    }
  });

  it("has a valid public/ads.txt file for Google AdSense authorization", () => {
    const adsTxtPath = path.join(process.cwd(), "public", "ads.txt");
    expect(fs.existsSync(adsTxtPath)).toBe(true);

    const content = fs.readFileSync(adsTxtPath, "utf-8");
    expect(content.includes("google.com")).toBe(true);
    expect(content.includes("DIRECT")).toBe(true);
    expect(content.includes("f08c47fec0942fa0")).toBe(true);
  });
});
