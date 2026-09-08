"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  CheckSquare,
  Square,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import { loadPdfJs } from "@/lib/utils/pdfjs-loader";

interface PagePreview {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  selected: boolean;
}

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState<number>(2); // 2x for crisp high-resolution
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<"all" | "selected" | number>("selected");
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (uploadedFile: File | null) => {
    if (!uploadedFile || !uploadedFile.name.toLowerCase().endsWith(".pdf")) {
      return;
    }

    setFile(uploadedFile);
    setLoading(true);
    setLoadingProgress("Loading PDF rendering engine...");
    setPages([]);

    try {
      const pdfjsLib = await loadPdfJs();
      setLoadingProgress("Parsing PDF document...");

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(loadedPdf);

      const numPages = loadedPdf.numPages;
      const previewList: PagePreview[] = [];

      for (let i = 1; i <= numPages; i++) {
        setLoadingProgress(`Rendering preview of page ${i} of ${numPages}...`);
        const page = await loadedPdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.75 }); // Fast preview scale

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          previewList.push({
            pageNumber: i,
            dataUrl: canvas.toDataURL("image/png"),
            width: viewport.width,
            height: viewport.height,
            selected: true,
          });
        }
      }

      setPages(previewList);
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      alert("Failed to render PDF: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
      setLoadingProgress("");
    }
  };

  const toggleSelectPage = (pageNum: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNum ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const selectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  const triggerExport = (target: "all" | "selected" | number) => {
    setExportTarget(target);
    setIsExportModalOpen(true);
  };

  const executeExport = async (customFilename: string) => {
    if (!pdfDoc) return;
    setIsExporting(true);

    try {
      const pagesToRender: number[] = [];
      if (typeof exportTarget === "number") {
        pagesToRender.push(exportTarget);
      } else if (exportTarget === "all") {
        pagesToRender.push(...pages.map((p) => p.pageNumber));
      } else {
        pagesToRender.push(...pages.filter((p) => p.selected).map((p) => p.pageNumber));
      }

      if (pagesToRender.length === 0) {
        alert("No pages selected to export.");
        setIsExporting(false);
        return;
      }

      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const ext = format === "png" ? ".png" : ".jpg";

      // Strip extension from base customFilename
      const baseName = customFilename.replace(/\.[^/.]+$/, "");

      for (let i = 0; i < pagesToRender.length; i++) {
        const pageNum = pagesToRender[i];
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          if (format === "jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
          }
          await page.render({ canvasContext: context, viewport }).promise;

          const dataUrl = canvas.toDataURL(mimeType, 0.95);
          const link = document.createElement("a");
          link.href = dataUrl;

          // If single page exported, use exact customFilename. If multiple, append page number.
          if (pagesToRender.length === 1) {
            link.download = `${baseName}${ext}`;
          } else {
            link.download = `${baseName}-page-${pageNum}${ext}`;
          }

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Brief delay between multiple downloads
          if (pagesToRender.length > 1) {
            await new Promise((resolve) => setTimeout(resolve, 350));
          }
        }
      }

      setIsExportModalOpen(false);
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Failed to export images: " + (err?.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const defaultExportName = file
    ? typeof exportTarget === "number"
      ? `${file.name.replace(/\.pdf$/i, "")}-page-${exportTarget}`
      : `${file.name.replace(/\.pdf$/i, "")}-images`
    : "pdf-images";

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
              PDF to Image Converter
            </h1>
            <p className="text-sm text-muted mt-1">
              Extract high-resolution PNG or JPG images from any PDF file. Rendered securely directly in your browser.
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
                Client-side conversion • Your documents never leave your computer
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
        /* Active PDF View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Page Grid (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Control Bar */}
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAll(true)}
                  leftIcon={<CheckSquare className="h-3.5 w-3.5" />}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAll(false)}
                  leftIcon={<Square className="h-3.5 w-3.5" />}
                >
                  Deselect All
                </Button>
                <span className="text-xs text-muted">
                  {selectedCount} of {pages.length} pages selected
                </span>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setPdfDoc(null);
                  setPages([]);
                }}
                className="text-xs text-muted hover:text-error transition-colors"
              >
                Change PDF
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-card rounded-2xl border border-border">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-500 mb-3" />
                <p className="text-sm font-semibold text-foreground">
                  {loadingProgress}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pages.map((p) => (
                  <Card
                    key={p.pageNumber}
                    onClick={() => toggleSelectPage(p.pageNumber)}
                    className={`cursor-pointer overflow-hidden p-2 relative group border transition-all ${
                      p.selected
                        ? "border-brand-500 ring-2 ring-brand-500/30 bg-brand-500/5"
                        : "border-border hover:border-brand-500/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <div
                        className={`h-5 w-5 rounded flex items-center justify-center text-xs shadow ${
                          p.selected
                            ? "bg-brand-600 text-white"
                            : "bg-background/90 text-muted border border-border"
                        }`}
                      >
                        {p.selected && "✓"}
                      </div>
                    </div>

                    {/* Page Number Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                        Page {p.pageNumber}
                      </span>
                    </div>

                    {/* Preview Canvas Image */}
                    <div className="aspect-[1/1.4] bg-white rounded border border-border/50 overflow-hidden flex items-center justify-center">
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="max-h-full max-w-full object-contain shadow-sm"
                      />
                    </div>

                    {/* Quick Single Page Download */}
                    <div className="mt-2 flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted font-mono">
                        #{p.pageNumber}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerExport(p.pageNumber);
                        }}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Download className="h-3 w-3" /> Save this page
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Export Settings Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-border space-y-5 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-500" />
                Export Settings
              </h3>

              {/* Format Choice */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("png")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border transition-all ${
                      format === "png"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    PNG (Lossless, Sharp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("jpeg")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border transition-all ${
                      format === "jpeg"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    JPG (Smaller Size)
                  </button>
                </div>
              </div>

              {/* Resolution / Scale Choice */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Image Resolution
                </label>
                <select
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="1">1x Standard Resolution (72-96 DPI)</option>
                  <option value="1.5">1.5x Medium Resolution (150 DPI)</option>
                  <option value="2">2x High Resolution (200 DPI - Recommended)</option>
                  <option value="3">3x Ultra High Resolution (300 DPI - Print)</option>
                </select>
              </div>

              {/* Summary & Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="space-y-1 text-xs text-muted">
                  <div className="flex justify-between">
                    <span>Document:</span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Pages:</span>
                    <span className="font-bold text-foreground">
                      {selectedCount} of {pages.length}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={selectedCount === 0 || isExporting}
                  onClick={() => triggerExport("selected")}
                  className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
                >
                  <Download className="h-5 w-5" />
                  <span>Export Selected ({selectedCount})</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  disabled={pages.length === 0 || isExporting}
                  onClick={() => triggerExport("all")}
                  className="w-full flex items-center justify-center gap-2"
                >
                  Export All {pages.length} Pages
                </Button>

                <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                  <span>
                    When exporting, you will be prompted to choose the export filename.
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
        onConfirm={executeExport}
        defaultFilename={defaultExportName}
        extension={format === "png" ? ".png" : ".jpg"}
        title="Export PDF as Image(s)"
        description="Choose a filename for your converted image files before downloading."
        isProcessing={isExporting}
      />
    </div>
  );
}
