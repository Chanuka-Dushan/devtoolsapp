"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  FileCheck,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [fontSize, setFontSize] = useState<10 | 11 | 12>(11);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWordUpload = async (uploadedFile: File | null) => {
    if (!uploadedFile || !uploadedFile.name.toLowerCase().endsWith(".docx")) {
      return;
    }

    setFile(uploadedFile);
    setLoading(true);
    setLoadingProgress("Parsing Microsoft Word document...");

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();

      // Convert to HTML for formatted preview
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(htmlResult.value);

      // Extract raw text for reliable PDF line wrapping
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      setRawText(textResult.value);
    } catch (err: any) {
      console.error("Error reading Word file:", err);
      alert("Failed to parse Word document: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
      setLoadingProgress("");
    }
  };

  const handleExportPdf = async (fullFilename: string) => {
    if (!rawText.trim()) return;
    setIsExporting(true);

    try {
      // Create jsPDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pageSize,
      });

      const pageWidth = pageSize === "a4" ? 210 : 215.9;
      const pageHeight = pageSize === "a4" ? 297 : 279.4;
      const margin = 20;
      const usableWidth = pageWidth - margin * 2;
      const bottomMargin = pageHeight - margin;

      let currentY = margin;
      let pageNum = 1;

      // Helper to add page header / footer
      const renderPageNumber = (pNum: number) => {
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Page ${pNum}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      };

      const paragraphs = rawText.split("\n");

      for (let p of paragraphs) {
        const trimmed = p.trim();
        if (!trimmed) {
          currentY += 4;
          continue;
        }

        // Check if paragraph looks like a title/heading
        const isHeader =
          trimmed.length < 75 &&
          !trimmed.endsWith(".") &&
          !trimmed.endsWith(",") &&
          (trimmed.toUpperCase() === trimmed || !trimmed.includes("  "));

        if (isHeader) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(fontSize + 4);
          doc.setTextColor(20, 20, 20);
          currentY += 3;
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fontSize);
          doc.setTextColor(50, 50, 50);
        }

        // Split paragraph into lines that fit usable width
        const lines = doc.splitTextToSize(trimmed, usableWidth);

        const lineHeight = isHeader ? (fontSize + 4) * 0.45 : fontSize * 0.42;

        // Check page overflow
        if (currentY + lines.length * lineHeight > bottomMargin) {
          renderPageNumber(pageNum);
          doc.addPage(pageSize, "portrait");
          pageNum++;
          currentY = margin;
        }

        for (const line of lines) {
          if (currentY + lineHeight > bottomMargin) {
            renderPageNumber(pageNum);
            doc.addPage(pageSize, "portrait");
            pageNum++;
            currentY = margin;
          }
          doc.text(line, margin, currentY);
          currentY += lineHeight;
        }

        currentY += 3.5; // space between paragraphs
      }

      // Add page number to last page
      renderPageNumber(pageNum);

      // Save with user-specified filename
      doc.save(fullFilename);
      setIsExportModalOpen(false);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert("Failed to export PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const defaultExportName = file
    ? `${file.name.replace(/\.docx$/i, "")}.pdf`
    : "converted-document.pdf";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Word (.docx) to PDF Converter
            </h1>
            <p className="text-sm text-muted mt-1">
              Convert your Microsoft Word documents into clean, publishable PDF files directly in your browser.
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
              handleWordUpload(e.dataTransfer.files[0]);
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
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleWordUpload(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Drop your Word (.docx) file here, or click to browse
              </p>
              <p className="text-xs text-muted mt-1">
                Fast client-side document processing with high-fidelity formatting
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
              Choose Word File
            </Button>
          </div>
        </div>
      ) : (
        /* Active Document View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Preview (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-xs text-muted">
                <BookOpen className="h-4 w-4 text-brand-500" />
                <span>Document Reader Preview</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setHtmlContent("");
                  setRawText("");
                }}
                className="text-xs text-muted hover:text-error transition-colors"
              >
                Change Word File
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
              <Card className="p-8 sm:p-12 border-border bg-white text-neutral-900 shadow-lg min-h-[500px]">
                <div
                  className="prose prose-neutral max-w-none text-sm sm:text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </Card>
            )}
          </div>

          {/* Sidebar Settings & Export */}
          <div className="space-y-6">
            <Card className="p-6 border-border space-y-5 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-500" />
                PDF Output Settings
              </h3>

              {/* Page Format */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Page Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize("a4")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border transition-all ${
                      pageSize === "a4"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    A4 (210 × 297 mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize("letter")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border transition-all ${
                      pageSize === "letter"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    US Letter
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Base Font Size
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([10, 11, 12] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSize(sz)}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-all ${
                        fontSize === sz
                          ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                          : "bg-background border-border text-muted hover:text-foreground"
                      }`}
                    >
                      {sz} pt
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Summary */}
              <div className="pt-4 border-t border-border space-y-2 text-xs text-muted">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Filename:</span>
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {file.name}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Total Words:</span>
                  <span className="font-bold text-foreground">
                    {wordCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Target Format:</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400 font-mono">
                    PDF Document (.pdf)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={loading || !rawText.trim() || isExporting}
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
                >
                  <Download className="h-5 w-5" />
                  <span>Export to PDF</span>
                </Button>

                <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                  <span>
                    When exporting, you will be prompted to name your .pdf file before downloading.
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
        onConfirm={handleExportPdf}
        defaultFilename={defaultExportName}
        extension=".pdf"
        title="Export Word to PDF"
        description="Specify a custom filename for your converted PDF file before downloading."
        isProcessing={isExporting}
      />
    </div>
  );
}
