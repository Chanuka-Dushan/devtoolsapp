"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  FileCheck,
  RefreshCw,
  Edit3,
  Sparkles,
  Info,
  CheckCircle2,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import { loadPdfJs } from "@/lib/utils/pdfjs-loader";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

interface ExtractedParagraph {
  text: string;
  isHeading?: boolean;
}

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (uploadedFile: File | null) => {
    if (!uploadedFile || !uploadedFile.name.toLowerCase().endsWith(".pdf")) {
      return;
    }

    setFile(uploadedFile);
    setLoading(true);
    setLoadingProgress("Initializing PDF extraction engine...");

    try {
      const pdfjsLib = await loadPdfJs();
      setLoadingProgress("Reading PDF document...");

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(loadedPdf.numPages);

      let fullExtractedContent: string[] = [];

      for (let i = 1; i <= loadedPdf.numPages; i++) {
        setLoadingProgress(`Extracting text from page ${i} of ${loadedPdf.numPages}...`);
        const page = await loadedPdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by Y coordinate to preserve lines
        const linesMap = new Map<number, string[]>();

        for (const item of textContent.items as any[]) {
          if (!item.str || item.str.trim() === "") continue;
          // Approximate line rounding (within 3 units)
          const y = Math.round(item.transform[5] / 4) * 4;
          if (!linesMap.has(y)) {
            linesMap.set(y, []);
          }
          linesMap.get(y)!.push(item.str);
        }

        // Sort descending by Y (PDF coordinates start at bottom-left)
        const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

        const pageLines = sortedY.map((y) => linesMap.get(y)!.join(" ").trim());
        fullExtractedContent.push(`--- Page ${i} ---\n` + pageLines.join("\n"));
      }

      setExtractedText(fullExtractedContent.join("\n\n"));
    } catch (err: any) {
      console.error("PDF to Word extraction error:", err);
      alert("Failed to extract text from PDF: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
      setLoadingProgress("");
    }
  };

  const handleExportDocx = async (fullFilename: string) => {
    if (!extractedText.trim()) return;
    setIsExporting(true);

    try {
      // Split into lines/paragraphs
      const rawLines = extractedText.split("\n");
      const docxParagraphs: Paragraph[] = [];

      for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          // Empty spacing paragraph
          docxParagraphs.push(new Paragraph({ text: "" }));
          continue;
        }

        if (trimmed.startsWith("--- Page ") && trimmed.endsWith(" ---")) {
          // Page header separator
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmed,
                  color: "888888",
                  size: 18, // 9pt
                  italics: true,
                }),
              ],
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (trimmed.length < 60 && !trimmed.endsWith(".") && !trimmed.endsWith(",")) {
          // Potential heading
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmed,
                  bold: true,
                  size: 26, // 13pt
                }),
              ],
              spacing: { before: 200, after: 100 },
            })
          );
        } else {
          // Normal body paragraph
          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmed,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120, line: 276 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxParagraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fullFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
    } catch (err: any) {
      console.error("DOCX generation error:", err);
      alert("Failed to create Word document: " + (err?.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const wordCount = extractedText.trim()
    ? extractedText.trim().split(/\s+/).length
    : 0;
  const charCount = extractedText.length;

  const defaultExportName = file
    ? `${file.name.replace(/\.pdf$/i, "")}.docx`
    : "converted-document.docx";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <FileCode className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              PDF to Word (.docx) Converter
            </h1>
            <p className="text-sm text-muted mt-1">
              Extract text, headings, and structure from your PDF and convert to a genuine Microsoft Word (.docx) document.
            </p>
          </div>
        </div>
      </div>

      {!file ? (
        /* Upload Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handlePdfUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-brand-500 bg-brand-500/5 ring-4 ring-brand-500/10"
              : "border-border hover:border-brand-500/50 hover:bg-card/50 bg-card/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handlePdfUpload(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Drop your PDF file here, or click to browse
              </p>
              <p className="text-xs text-muted mt-1">
                Extracts clean text and paragraphs into editable Microsoft Word format
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose PDF File
            </Button>
          </div>
        </div>
      ) : (
        /* Active Document Converter & Editor */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor Preview (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Edit3 className="h-4 w-4 text-brand-500" />
                <span>Editable Preview (Make any adjustments before exporting)</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setExtractedText("");
                }}
                className="text-xs text-muted hover:text-error transition-colors"
              >
                Change PDF
              </button>
            </div>

            {loading ? (
              <div className="p-16 text-center bg-card rounded-2xl border border-border">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-500 mb-3" />
                <p className="text-sm font-semibold text-foreground">
                  {loadingProgress}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted document text will appear here..."
                  rows={20}
                  className="w-full rounded-2xl border border-input bg-card p-5 font-mono text-xs sm:text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y shadow-inner"
                />
              </div>
            )}
          </div>

          {/* Sidebar & Action */}
          <div className="space-y-6">
            <Card className="p-6 border-border space-y-5 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-brand-500" />
                Document Information
              </h3>

              <div className="space-y-2.5 text-xs text-muted">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Source File:</span>
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {file.name}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Page Count:</span>
                  <span className="font-bold text-foreground">{pageCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Total Words:</span>
                  <span className="font-bold text-foreground">
                    {wordCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Characters:</span>
                  <span className="font-bold text-foreground">
                    {charCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Target Format:</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400 font-mono">
                    Microsoft Word (.docx)
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={loading || !extractedText.trim() || isExporting}
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
                >
                  <Download className="h-5 w-5" />
                  <span>Export to Word (.docx)</span>
                </Button>

                <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                  <span>
                    When exporting, you will be prompted to name your .docx file before downloading.
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Export Filename Modal */}
      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportDocx}
        defaultFilename={defaultExportName}
        extension=".docx"
        title="Export to Word (.docx)"
        description="Choose a filename for your converted Word document before downloading."
        isProcessing={isExporting}
      />
    </div>
  );
}
