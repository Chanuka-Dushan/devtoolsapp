"use client";

import { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Upload,
  Download,
  Sliders,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info,
  Trash2,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import {
  convertImage,
  ImageOutputFormat,
  ImageConversionResult,
} from "@/lib/tools/image-converter";

interface UploadedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  result?: ImageConversionResult;
  isConverting?: boolean;
}

const SUPPORTED_FORMATS: { format: ImageOutputFormat; label: string; ext: string; desc: string }[] = [
  { format: "webp", label: "WebP", ext: ".webp", desc: "Modern web standard with 30-50% smaller file size" },
  { format: "png", label: "PNG", ext: ".png", desc: "Lossless with transparency support" },
  { format: "jpeg", label: "JPG / JPEG", ext: ".jpg", desc: "Universal format for photographs" },
  { format: "svg", label: "SVG Vector", ext: ".svg", desc: "Scalable vector graphics outline tracing" },
  { format: "ico", label: "ICO Favicon", ext: ".ico", desc: "32x32 standard browser favicon" },
  { format: "bmp", label: "BMP", ext: ".bmp", desc: "Uncompressed bitmap format" },
];

export default function ImageConverterPage() {
  const [items, setItems] = useState<UploadedFileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageOutputFormat>("webp");
  const [quality, setQuality] = useState<number>(90);
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [svgColors, setSvgColors] = useState<number>(8);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportItem, setExportItem] = useState<UploadedFileItem | null>(null);
  const [isBatchConverting, setIsBatchConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/") || f.name.match(/\.(png|jpe?g|webp|bmp|gif|svg|ico)$/i)
    );

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const newItem: UploadedFileItem = {
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        };
        setItems((prev) => [...prev, newItem]);
      };
      img.src = previewUrl;
    });
  };

  const processConversion = async (item: UploadedFileItem): Promise<ImageConversionResult> => {
    const targetW = scalePercent === 100 ? undefined : Math.round((item.width * scalePercent) / 100);
    const targetH = scalePercent === 100 ? undefined : Math.round((item.height * scalePercent) / 100);

    return await convertImage(item.file, {
      format: targetFormat,
      quality: quality / 100,
      width: targetW,
      height: targetH,
      maintainAspectRatio: true,
      svgColors,
    });
  };

  const convertSingle = async (item: UploadedFileItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isConverting: true } : i))
    );

    try {
      const result = await processConversion(item);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, result, isConverting: false } : i))
      );
      return result;
    } catch (err: any) {
      console.error("Conversion error:", err);
      alert(`Failed to convert ${item.file.name}: ` + (err?.message || "Unknown error"));
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isConverting: false } : i))
      );
    }
  };

  const convertAll = async () => {
    setIsBatchConverting(true);
    for (const item of items) {
      await convertSingle(item);
    }
    setIsBatchConverting(false);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const match = prev.find((i) => i.id === id);
      if (match?.previewUrl) URL.revokeObjectURL(match.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const triggerExport = async (item: UploadedFileItem) => {
    if (!item.result) {
      const res = await convertSingle(item);
      if (!res) return;
    }
    setExportItem(item);
    setIsExportModalOpen(true);
  };

  const handleExportConfirm = (chosenFilename: string) => {
    if (!exportItem?.result) return;

    const link = document.createElement("a");
    link.href = exportItem.result.dataUrl;
    link.download = chosenFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportModalOpen(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const activeExt = SUPPORTED_FORMATS.find((f) => f.format === targetFormat)?.ext || `.${targetFormat}`;
  const defaultExportName = exportItem
    ? `${exportItem.file.name.replace(/\.[^/.]+$/, "")}${activeExt}`
    : `converted-image${activeExt}`;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Image Format Converter
            </h1>
            <p className="text-sm text-muted mt-1">
              Convert across WebP, PNG, JPG, SVG Vector, ICO, and BMP formats directly in your browser.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload / Items Area (2 cols) */}
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
              accept="image/*,.webp,.png,.jpg,.jpeg,.bmp,.gif,.ico,.svg"
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
                  Supports PNG, JPG, WebP, BMP, GIF, SVG, ICO • Single or batch files
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Select Images
              </Button>
            </div>
          </div>

          {/* Uploaded Items List */}
          {items.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Selected Images ({items.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={convertAll}
                    disabled={isBatchConverting}
                    isLoading={isBatchConverting}
                  >
                    Convert All to {targetFormat.toUpperCase()}
                  </Button>
                  <button
                    onClick={() => setItems([])}
                    className="text-xs text-muted-foreground hover:text-error transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const sizeDiff = item.result
                    ? item.result.convertedSize - item.file.size
                    : 0;
                  const percentDiff = item.result
                    ? Math.round((Math.abs(sizeDiff) / item.file.size) * 100)
                    : 0;
                  const isSmaller = sizeDiff < 0;

                  return (
                    <Card
                      key={item.id}
                      className="p-4 border-border bg-card/60 transition-all hover:border-brand-500/30"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Thumbnail & Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-16 w-16 rounded-xl bg-black/5 dark:bg-white/5 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={item.result ? item.result.dataUrl : item.previewUrl}
                              alt={item.file.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                              {item.file.name}
                            </p>
                            <p className="text-[11px] text-muted mt-0.5">
                              {item.width} × {item.height} px • Original: {formatBytes(item.file.size)}
                            </p>

                            {/* Conversion Results Badge */}
                            {item.result && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-foreground">
                                  {formatBytes(item.result.convertedSize)}
                                </span>
                                {isSmaller ? (
                                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    -{percentDiff}% saved
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-muted bg-muted/60 px-1.5 py-0.5 rounded">
                                    {targetFormat.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Button
                            variant={item.result ? "primary" : "outline"}
                            size="sm"
                            disabled={item.isConverting}
                            isLoading={item.isConverting}
                            onClick={() => triggerExport(item)}
                            leftIcon={<Download className="h-3.5 w-3.5" />}
                          >
                            {item.result ? `Download ${targetFormat.toUpperCase()}` : `Convert & Save`}
                          </Button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-muted hover:text-error rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Conversion Settings */}
        <div className="space-y-6">
          <Card className="p-6 border-border space-y-5 bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-brand-500" />
              Target Conversion Settings
            </h3>

            {/* Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Target Output Format
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {SUPPORTED_FORMATS.map((fmt) => (
                  <button
                    key={fmt.format}
                    type="button"
                    onClick={() => setTargetFormat(fmt.format)}
                    className={`px-2.5 py-2 text-xs rounded-lg font-medium border text-center transition-all ${
                      targetFormat === fmt.format
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted mt-1.5">
                {SUPPORTED_FORMATS.find((f) => f.format === targetFormat)?.desc}
              </p>
            </div>

            {/* Quality Slider (for WebP and JPG) */}
            {(targetFormat === "webp" || targetFormat === "jpeg") && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-foreground">
                    Quality Level
                  </label>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>Smaller Size (30%)</span>
                  <span>Maximum Quality (100%)</span>
                </div>
              </div>
            )}

            {/* SVG Color Quantization (for SVG) */}
            {targetFormat === "svg" && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-foreground">
                    Vector Color Palette
                  </label>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {svgColors} colors
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="2"
                  value={svgColors}
                  onChange={(e) => setSvgColors(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <p className="text-[11px] text-muted mt-1">
                  Traces polygonal vector paths clustered into {svgColors} color layers.
                </p>
              </div>
            )}

            {/* Scale Resize Selection */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Output Dimension Scaling
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[100, 75, 50, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setScalePercent(pct)}
                    className={`px-2 py-1.5 text-xs rounded-lg font-medium border text-center transition-all ${
                      scalePercent === pct
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Summary & Prompt Note */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                <span>
                  When you download, you will be prompted to confirm or customize the exported filename before saving.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filename Prompt Modal */}
      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        defaultFilename={defaultExportName}
        extension={activeExt}
        title={`Export as ${targetFormat.toUpperCase()}`}
        description="Choose a filename for your converted image file before downloading."
      />
    </div>
  );
}
