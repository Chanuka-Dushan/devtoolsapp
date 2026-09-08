"use client";

import { useState, useRef } from "react";
import {
  FileImage,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileDown,
  RefreshCw,
  Plus,
  CheckCircle2,
  Settings2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import { jsPDF } from "jspdf";

interface UploadedImage {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
}

export default function ImagesToPdfPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin] = useState<"none" | "small" | "normal">("small");
  const [fitMode, setFitMode] = useState<"contain" | "stretch">("contain");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newImg: UploadedImage = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            dataUrl,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          };
          setImages((prev) => [...prev, newImg]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleExportConfirm = async (fullFilename: string) => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      // Define page dimension map in mm
      const dimensions = {
        a4: { portrait: [210, 297], landscape: [297, 210] },
        letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
      };

      const marginSizes = {
        none: 0,
        small: 10,
        normal: 20,
      };

      const marginMm = marginSizes[margin];

      // Initialize first page
      let doc: jsPDF | null = null;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const isImgLandscape = item.width > item.height;

        let pageOrient: "portrait" | "landscape" = "portrait";
        if (orientation === "auto") {
          pageOrient = isImgLandscape ? "landscape" : "portrait";
        } else {
          pageOrient = orientation;
        }

        let pageWidthMm = 210;
        let pageHeightMm = 297;

        if (pageSize === "fit") {
          // Fit page to image resolution (1px ≈ 0.264583 mm)
          pageWidthMm = Math.round(item.width * 0.264583);
          pageHeightMm = Math.round(item.height * 0.264583);
        } else {
          const dims = dimensions[pageSize][pageOrient];
          pageWidthMm = dims[0];
          pageHeightMm = dims[1];
        }

        if (i === 0) {
          doc = new jsPDF({
            orientation: pageOrient,
            unit: "mm",
            format: pageSize === "fit" ? [pageWidthMm, pageHeightMm] : pageSize,
          });
        } else if (doc) {
          doc.addPage(
            pageSize === "fit" ? [pageWidthMm, pageHeightMm] : pageSize,
            pageOrient
          );
        }

        if (!doc) continue;

        const usableWidth = pageWidthMm - marginMm * 2;
        const usableHeight = pageHeightMm - marginMm * 2;

        let imgWidth = usableWidth;
        let imgHeight = usableHeight;
        let x = marginMm;
        let y = marginMm;

        if (fitMode === "contain" && pageSize !== "fit") {
          const imgRatio = item.width / item.height;
          const pageRatio = usableWidth / usableHeight;

          if (imgRatio > pageRatio) {
            // Image is wider than page area
            imgWidth = usableWidth;
            imgHeight = usableWidth / imgRatio;
            x = marginMm;
            y = marginMm + (usableHeight - imgHeight) / 2;
          } else {
            // Image is taller than page area
            imgHeight = usableHeight;
            imgWidth = usableHeight * imgRatio;
            x = marginMm + (usableWidth - imgWidth) / 2;
            y = marginMm;
          }
        }

        // Determine image format (JPEG or PNG)
        const format = item.dataUrl.includes("image/png") ? "PNG" : "JPEG";
        doc.addImage(item.dataUrl, format, x, y, imgWidth, imgHeight);
      }

      if (doc) {
        doc.save(fullFilename);
      }

      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const defaultExportName =
    images.length === 1
      ? images[0].name.replace(/\.[^/.]+$/, "") + ".pdf"
      : "images-collection.pdf";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <FileImage className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Images to PDF Converter
            </h1>
            <p className="text-sm text-muted mt-1">
              Combine multiple JPG, PNG, and WebP images into a single professional PDF document. 100% free and client-side.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? "border-brand-500 bg-brand-500/5 ring-4 ring-brand-500/10"
                : "border-border hover:border-brand-500/50 hover:bg-card/50 bg-card/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Click to select images or drag & drop here
                </p>
                <p className="text-xs text-muted mt-1">
                  Supports PNG, JPG, JPEG, WebP, GIF • Add single or multiple images
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Select Images
              </Button>
            </div>
          </div>

          {/* Uploaded Images List / Reordering */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Selected Images ({images.length})</span>
                  <span className="text-xs font-normal text-muted">
                    • Reorder pages as desired
                  </span>
                </h3>
                <button
                  onClick={() => setImages([])}
                  className="text-xs text-muted-foreground hover:text-error transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <Card
                    key={img.id}
                    className="p-3 flex items-center gap-3 relative group border-border hover:border-brand-500/40 transition-all bg-card/60"
                  >
                    {/* Page Number Badge */}
                    <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      {idx + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="h-16 w-16 rounded-lg bg-black/5 dark:bg-white/5 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {img.name}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {img.width} × {img.height} px • {formatFileSize(img.size)}
                      </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveImage(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-muted/40 transition-colors"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveImage(idx, "down")}
                        disabled={idx === images.length - 1}
                        title="Move Down"
                        className="p-1 text-muted hover:text-foreground disabled:opacity-30 rounded hover:bg-muted/40 transition-colors"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeImage(img.id)}
                        title="Remove Image"
                        className="p-1 text-muted hover:text-error rounded hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings & Export Action */}
        <div className="space-y-6">
          <Card className="p-6 border-border space-y-5 bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-brand-500" />
              Document Layout Settings
            </h3>

            {/* Page Size */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="letter">US Letter (8.5 × 11 in)</option>
                <option value="fit">Fit Page to Image Size</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Page Orientation
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["auto", "portrait", "landscape"] as const).map((orient) => (
                  <button
                    key={orient}
                    type="button"
                    onClick={() => setOrientation(orient)}
                    className={`px-2 py-1.5 text-xs rounded-lg font-medium border capitalize transition-all ${
                      orientation === orient
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {orient}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Page Margins
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["none", "small", "normal"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMargin(m)}
                    className={`px-2 py-1.5 text-xs rounded-lg font-medium border capitalize transition-all ${
                      margin === m
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {m === "none" ? "None" : m === "small" ? "10 mm" : "20 mm"}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Fit Mode */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Image Placement
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFitMode("contain")}
                  className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-all ${
                    fitMode === "contain"
                      ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                      : "bg-background border-border text-muted hover:text-foreground"
                  }`}
                >
                  Keep Aspect Ratio
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode("stretch")}
                  className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-all ${
                    fitMode === "stretch"
                      ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                      : "bg-background border-border text-muted hover:text-foreground"
                  }`}
                >
                  Fill Entire Page
                </button>
              </div>
            </div>

            {/* Summary & Export Button */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="text-xs text-muted flex items-center justify-between">
                <span>Total Pages:</span>
                <span className="font-bold text-foreground">{images.length}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={images.length === 0}
                onClick={() => setIsExportModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
              >
                <FileDown className="h-5 w-5" />
                <span>Export to PDF</span>
              </Button>

              <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                <span>
                  When you click Export, you will be prompted to name your PDF file before download.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Export Filename Modal */}
      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        defaultFilename={defaultExportName}
        extension=".pdf"
        title="Export Images to PDF"
        description="Specify the custom filename for your generated PDF document."
        isProcessing={isGenerating}
      />
    </div>
  );
}
