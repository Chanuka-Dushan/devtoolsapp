import { describe, it, expect } from "vitest";
import { getToolBySlug, getToolsByCategory, TOOLS } from "@/lib/tools/registry";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";

describe("PDF & Document Tools Suite", () => {
  it("registers all 4 PDF tools in the registry with category 'pdf'", () => {
    const pdfTools = getToolsByCategory("pdf");
    expect(pdfTools.length).toBe(4);

    const slugs = pdfTools.map((t) => t.slug);
    expect(slugs).toContain("images-to-pdf");
    expect(slugs).toContain("pdf-to-image");
    expect(slugs).toContain("pdf-to-word");
    expect(slugs).toContain("word-to-pdf");
  });

  it("retrieves each tool by slug with proper metadata", () => {
    const imagesToPdf = getToolBySlug("images-to-pdf");
    expect(imagesToPdf).toBeDefined();
    expect(imagesToPdf?.name).toBe("Images to PDF Converter");
    expect(imagesToPdf?.path).toBe("/tools/images-to-pdf");

    const pdfToWord = getToolBySlug("pdf-to-word");
    expect(pdfToWord).toBeDefined();
    expect(pdfToWord?.name).toBe("PDF to Word Converter");
  });

  it("can construct and serialize a PDF with jsPDF", () => {
    const doc = new jsPDF();
    doc.text("Hello PDF World", 10, 10);
    const output = doc.output();
    expect(output).toBeDefined();
    expect(typeof output).toBe("string");
    expect(output.startsWith("%PDF")).toBe(true);
  });

  it("can construct a valid Word (.docx) document with docx", async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun("Test Word Content")],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });
});
