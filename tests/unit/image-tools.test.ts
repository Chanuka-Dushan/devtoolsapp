import { describe, it, expect } from "vitest";
import { getToolBySlug, getToolsByCategory } from "@/lib/tools/registry";
import { getPresetWatermarkRegion } from "@/lib/tools/watermark-remover";

describe("Image Processing & Watermark Tools Suite", () => {
  it("registers all 4 image tools in the registry with category 'images'", () => {
    const imageTools = getToolsByCategory("images");
    expect(imageTools.length).toBe(4);

    const slugs = imageTools.map((t) => t.slug);
    expect(slugs).toContain("image-converter");
    expect(slugs).toContain("image-resizer");
    expect(slugs).toContain("image-to-svg");
    expect(slugs).toContain("gemini-watermark-remover");
  });

  it("retrieves each tool by slug with proper metadata", () => {
    const converter = getToolBySlug("image-converter");
    expect(converter).toBeDefined();
    expect(converter?.name).toBe("Image Format Converter");
    expect(converter?.path).toBe("/tools/image-converter");

    const resizer = getToolBySlug("image-resizer");
    expect(resizer).toBeDefined();
    expect(resizer?.name).toBe("Image Resizer & Size Reducer");

    const watermarkRemover = getToolBySlug("gemini-watermark-remover");
    expect(watermarkRemover).toBeDefined();
    expect(watermarkRemover?.name).toBe("Gemini & AI Watermark Remover");
  });

  it("accurately calculates Gemini watermark regions based on image dimensions", () => {
    // Standard 1024x1024 AI image
    const region = getPresetWatermarkRegion(1024, 1024, "bottom-right");
    expect(region.width).toBeGreaterThanOrEqual(40);
    expect(region.height).toBeGreaterThanOrEqual(40);
    expect(region.x + region.width).toBeLessThanOrEqual(1024);
    expect(region.y + region.height).toBeLessThanOrEqual(1024);
    expect(region.x).toBeGreaterThan(800); // In the right portion
    expect(region.y).toBeGreaterThan(800); // In the bottom portion
  });

  it("calculates top-left and bottom-left preset corners correctly", () => {
    const topLeft = getPresetWatermarkRegion(1920, 1080, "top-left");
    expect(topLeft.x).toBe(0);
    expect(topLeft.y).toBe(0);

    const bottomLeft = getPresetWatermarkRegion(1920, 1080, "bottom-left");
    expect(bottomLeft.x).toBe(0);
    expect(bottomLeft.y).toBeGreaterThan(900);
  });
});
