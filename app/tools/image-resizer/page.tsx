"use client";

import { useState, useRef, useEffect } from "react";
import {
  Scaling,
  Upload,
  Download,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  Info,
  Maximize2,
  Minimize2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";

interface PresetSize {
  name: string;
  width: number;
  height: number;
  category: "social" | "standard";
}

const PRESETS: PresetSize[] = [
  { name: "Instagram Square", width: 1080, height: 1080, category: "social" },
  { name: "Instagram Story / Reels", width: 1080, height: 1920, category: "social" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, category: "social" },
  { name: "Twitter / X Post", width: 1200, height: 675, category: "social" },
  { name: "LinkedIn Banner", width: 1584, height: 396, category: "social" },
  { name: "Full HD (1080p)", width: 1920, height: 1080, category: "standard" },
  { name: "HD (720p)", width: 1280, height: 720, category: "standard" },
  { name: "Avatar / Profile", width: 400, height: 400, category: "standard" },
];

export default function ImageResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalImg, setOriginalImg] = useState<HTMLImageElement | null>(null);
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);

  // Resize controls
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [quality, setQuality] = useState<number>(85);
  const [format, setFormat] = useState<"webp" | "jpeg" | "png">("webp");

  // Output calculation
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (uploadedFile: File | null) => {
    if (!uploadedFile || !uploadedFile.type.startsWith("image/")) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImg(img);
        setOrigWidth(img.naturalWidth || img.width);
        setOrigHeight(img.naturalHeight || img.height);
        setTargetWidth(img.naturalWidth || img.width);
        setTargetHeight(img.naturalHeight || img.height);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(uploadedFile);
  };

  // Re-compute resized image whenever dimensions, format, or quality changes
  useEffect(() => {
    if (!originalImg || targetWidth <= 0 || targetHeight <= 0) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          if (format === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }
          ctx.drawImage(originalImg, 0, 0, targetWidth, targetHeight);

          const mime =
            format === "webp"
              ? "image/webp"
              : format === "jpeg"
              ? "image/jpeg"
              : "image/png";

          canvas.toBlob(
            (blob) => {
              if (blob) {
                setResultBlob(blob);
                const url = canvas.toDataURL(mime, quality / 100);
                setResultDataUrl(url);
              }
              setIsProcessing(false);
            },
            mime,
            quality / 100
          );
        }
      } catch (err) {
        console.error("Resize calculation error:", err);
        setIsProcessing(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [originalImg, targetWidth, targetHeight, quality, format]);

  const handleWidthChange = (w: number) => {
    const val = Math.max(1, w);
    setTargetWidth(val);
    if (lockAspectRatio && origWidth > 0) {
      setTargetHeight(Math.round((val * origHeight) / origWidth));
    }
  };

  const handleHeightChange = (h: number) => {
    const val = Math.max(1, h);
    setTargetHeight(val);
    if (lockAspectRatio && origHeight > 0) {
      setTargetWidth(Math.round((val * origWidth) / origHeight));
    }
  };

  const applyScalePercent = (pct: number) => {
    if (origWidth > 0 && origHeight > 0) {
      setTargetWidth(Math.round((origWidth * pct) / 100));
      setTargetHeight(Math.round((origHeight * pct) / 100));
    }
  };

  const applyPreset = (preset: PresetSize) => {
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
  };

  const handleExportConfirm = (chosenFilename: string) => {
    if (!resultDataUrl) return;

    const link = document.createElement("a");
    link.href = resultDataUrl;
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

  const ext = format === "webp" ? ".webp" : format === "jpeg" ? ".jpg" : ".png";
  const defaultExportName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}-${targetWidth}x${targetHeight}${ext}`
    : `resized-image${ext}`;

  const originalSize = file?.size || 0;
  const newSize = resultBlob?.size || 0;
  const diff = originalSize - newSize;
  const percentSaved = originalSize > 0 ? Math.round((diff / originalSize) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <Scaling className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Image Resizer & Size Reducer
            </h1>
            <p className="text-sm text-muted mt-1">
              Resize image dimensions and reduce file size up to 90% without visible quality loss. 100% private in-browser.
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
              handleFileUpload(e.dataTransfer.files[0]);
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
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Drop your image here, or click to browse
              </p>
              <p className="text-xs text-muted mt-1">
                Supports PNG, JPG, WebP, GIF, BMP • Real-time compression & dimension reduction
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
              Choose Image File
            </Button>
          </div>
        </div>
      ) : (
        /* Active Resizer & Optimizer */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visual Preview (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Maximize2 className="h-4 w-4 text-brand-500" />
                <span>
                  Original: {origWidth} × {origHeight} px ({formatBytes(originalSize)})
                </span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setOriginalImg(null);
                  setResultDataUrl(null);
                }}
                className="text-xs text-muted hover:text-error transition-colors"
              >
                Change Image
              </button>
            </div>

            {/* Canvas Preview Container */}
            <Card className="p-6 border-border bg-card/50 flex flex-col items-center justify-center min-h-[380px]">
              {resultDataUrl ? (
                <div className="relative max-h-[460px] max-w-full overflow-hidden rounded-xl border border-border bg-black/5 dark:bg-white/5 flex items-center justify-center p-2">
                  <img
                    src={resultDataUrl}
                    alt="Resized Preview"
                    className="max-h-[440px] max-w-full object-contain rounded-lg shadow-sm"
                  />
                  {/* Resolution & Size Overlay Pill */}
                  <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-mono font-semibold shadow-lg flex items-center gap-2">
                    <span>{targetWidth} × {targetHeight} px</span>
                    <span>•</span>
                    <span className="text-emerald-400">{formatBytes(newSize)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">Processing preview...</p>
              )}
            </Card>

            {/* Size Comparison Card */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 border-border text-center">
                <p className="text-xs text-muted">Original Size</p>
                <p className="text-base font-bold font-mono text-foreground mt-1">
                  {formatBytes(originalSize)}
                </p>
              </Card>
              <Card className="p-4 border-border text-center">
                <p className="text-xs text-muted">Reduced Size</p>
                <p className="text-base font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
                  {formatBytes(newSize)}
                </p>
              </Card>
              <Card className="p-4 border-border text-center">
                <p className="text-xs text-muted">Saved</p>
                <p className={`text-base font-bold font-mono mt-1 ${percentSaved > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
                  {percentSaved > 0 ? `-${percentSaved}%` : "0%"}
                </p>
              </Card>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-border space-y-5 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-500" />
                Dimensions & Compression
              </h3>

              {/* Exact Dimension Inputs */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Dimensions (Pixels)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-muted uppercase font-mono">Width</span>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`mt-4 p-2 rounded-lg border transition-all ${
                      lockAspectRatio
                        ? "bg-brand-500/10 text-brand-600 border-brand-500/30"
                        : "bg-background text-muted border-border"
                    }`}
                    title={lockAspectRatio ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                  >
                    {lockAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>

                  <div className="flex-1">
                    <span className="text-[10px] text-muted uppercase font-mono">Height</span>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Scale Percentage Shortcuts */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Quick Scale
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyScalePercent(pct)}
                      className="px-2 py-1 text-xs rounded-lg font-medium border bg-background border-border text-muted hover:text-foreground hover:border-brand-500 transition-all"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Standard & Social Presets
                </label>
                <select
                  onChange={(e) => {
                    const found = PRESETS.find((p) => p.name === e.target.value);
                    if (found) applyPreset(found);
                  }}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                  defaultValue=""
                >
                  <option value="" disabled>Choose preset...</option>
                  {PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.width} × {p.height})
                    </option>
                  ))}
                </select>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Compression Format
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["webp", "jpeg", "png"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium border uppercase transition-all ${
                        format === fmt
                          ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                          : "bg-background border-border text-muted hover:text-foreground"
                      }`}
                    >
                      {fmt === "jpeg" ? "JPG" : fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compression Quality Slider */}
              {format !== "png" && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-foreground">Size Compression</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>Smallest File (15%)</span>
                    <span>High Quality (95%)</span>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-border space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!resultDataUrl || isProcessing}
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Resized Image</span>
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

      {/* Filename Prompt Modal */}
      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        defaultFilename={defaultExportName}
        extension={ext}
        title="Export Resized Image"
        description="Choose a filename for your resized and optimized image before downloading."
      />
    </div>
  );
}
