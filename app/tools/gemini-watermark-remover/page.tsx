"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Upload,
  Download,
  Wand2,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  Info,
  Layers,
  Move,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import {
  getPresetWatermarkRegion,
  inpaintRegion,
  WatermarkRegion,
  WatermarkPresetCorner,
} from "@/lib/tools/watermark-remover";

export default function GeminiWatermarkRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [cleanDataUrl, setCleanDataUrl] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Region parameters
  const [presetCorner, setPresetCorner] = useState<WatermarkPresetCorner>("bottom-right");
  const [region, setRegion] = useState<WatermarkRegion>({ x: 0, y: 0, width: 64, height: 64 });
  const [blendRadius, setBlendRadius] = useState(14);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasInpainted, setHasInpainted] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (uploadedFile: File | null) => {
    if (!uploadedFile || !uploadedFile.type.startsWith("image/")) return;

    setFile(uploadedFile);
    setHasInpainted(false);
    setCleanDataUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalDataUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setImageWidth(w);
        setImageHeight(h);

        // Calculate standard Gemini preset
        const defaultRegion = getPresetWatermarkRegion(w, h, "bottom-right");
        setRegion(defaultRegion);

        // Auto-perform initial inpainting on upload for an instant WOW experience!
        runInpainting(img, defaultRegion, blendRadius);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(uploadedFile);
  };

  const runInpainting = (
    img: HTMLImageElement,
    targetRegion: WatermarkRegion,
    radius: number
  ) => {
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        hiddenCanvasRef.current = canvas;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Perform content-aware inpainting
        inpaintRegion(ctx, targetRegion, { blendRadius: radius, noiseBlend: true });

        const resultUrl = canvas.toDataURL("image/png");
        setCleanDataUrl(resultUrl);
        setHasInpainted(true);
      } catch (err) {
        console.error("Watermark removal failed:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const handlePresetChange = (corner: WatermarkPresetCorner) => {
    setPresetCorner(corner);
    if (imageWidth > 0 && imageHeight > 0) {
      const newRegion = getPresetWatermarkRegion(imageWidth, imageHeight, corner);
      setRegion(newRegion);
      if (originalDataUrl) {
        const img = new Image();
        img.onload = () => runInpainting(img, newRegion, blendRadius);
        img.src = originalDataUrl;
      }
    }
  };

  const handleReapply = () => {
    if (!originalDataUrl) return;
    const img = new Image();
    img.onload = () => runInpainting(img, region, blendRadius);
    img.src = originalDataUrl;
  };

  const handleExportConfirm = (chosenFilename: string) => {
    if (!cleanDataUrl) return;

    const link = document.createElement("a");
    link.href = cleanDataUrl;
    link.download = chosenFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportModalOpen(false);
  };

  const defaultExportName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}-clean.png`
    : "gemini-clean-image.png";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Gemini & AI Watermark Remover
            </h1>
            <p className="text-sm text-muted mt-1">
              Remove Google Gemini 4-point sparkle watermarks, Imagen logos, and AI badges using client-side content-aware inpainting.
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
                Drop your Gemini or AI-generated image here, or click to browse
              </p>
              <p className="text-xs text-muted mt-1">
                Auto-detects bottom-right sparkle icon • Reconstructs seamless background pixels
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
              Select AI Image
            </Button>
          </div>
        </div>
      ) : (
        /* Active Inpainting Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visual Display (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-card p-3.5 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant={showOriginal ? "primary" : "outline"}
                  size="sm"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  leftIcon={<Eye className="h-3.5 w-3.5" />}
                >
                  Hold to Compare with Original
                </Button>
                <span className="text-xs text-muted font-medium">
                  {showOriginal ? "Viewing Original (With Watermark)" : "Viewing Clean Image"}
                </span>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setOriginalDataUrl(null);
                  setCleanDataUrl(null);
                }}
                className="text-xs text-muted hover:text-error transition-colors"
              >
                Change Image
              </button>
            </div>

            {/* Canvas Preview */}
            <Card className="p-6 border-border bg-card/40 flex items-center justify-center min-h-[420px] relative overflow-hidden">
              {isProcessing ? (
                <div className="text-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-500 mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    Synthesizing background pixels...
                  </p>
                </div>
              ) : cleanDataUrl && originalDataUrl ? (
                <div className="relative max-h-[480px] max-w-full overflow-hidden rounded-xl border border-border bg-black/5 dark:bg-white/5 flex items-center justify-center p-2">
                  <img
                    src={showOriginal ? originalDataUrl : cleanDataUrl}
                    alt="Result Preview"
                    className="max-h-[460px] max-w-full object-contain rounded-lg shadow-sm"
                  />

                  {/* Watermark Region Indicator Badge */}
                  {!showOriginal && hasInpainted && (
                    <div className="absolute bottom-4 left-4 bg-emerald-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Watermark Removed</span>
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-border space-y-5 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-brand-500" />
                Watermark Detection Preset
              </h3>

              {/* Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Watermark Placement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetChange("bottom-right")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border text-left transition-all ${
                      presetCorner === "bottom-right"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="block font-bold">Bottom-Right</span>
                    <span className="text-[10px] opacity-80">Standard Gemini</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange("bottom-left")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border text-left transition-all ${
                      presetCorner === "bottom-left"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="block font-bold">Bottom-Left</span>
                    <span className="text-[10px] opacity-80">Imagen Preset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange("top-right")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border text-left transition-all ${
                      presetCorner === "top-right"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="block font-bold">Top-Right</span>
                    <span className="text-[10px] opacity-80">Corner Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange("top-left")}
                    className={`px-3 py-2 text-xs rounded-lg font-medium border text-left transition-all ${
                      presetCorner === "top-left"
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-background border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="block font-bold">Top-Left</span>
                    <span className="text-[10px] opacity-80">Header Badge</span>
                  </button>
                </div>
              </div>

              {/* Watermark Box Size Tuning */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-foreground">
                    Removal Box Width & Height
                  </label>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {region.width}px
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="4"
                  value={region.width}
                  onChange={(e) => {
                    const newDim = parseInt(e.target.value);
                    const newReg = {
                      ...region,
                      x: Math.max(0, imageWidth - newDim - 20),
                      y: Math.max(0, imageHeight - newDim - 20),
                      width: newDim,
                      height: newDim,
                    };
                    setRegion(newReg);
                  }}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Blend Radius */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-foreground">
                    Boundary Feathering
                  </label>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {blendRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="2"
                  value={blendRadius}
                  onChange={(e) => setBlendRadius(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Feathers surrounding pixels into the inpaint region for seamless gradients.
                </p>
              </div>

              {/* Re-apply Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReapply}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Re-Apply Inpainting
              </Button>

              {/* Export Action */}
              <div className="pt-4 border-t border-border space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!cleanDataUrl || isProcessing}
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Clean Image</span>
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
        extension=".png"
        title="Export Clean Image"
        description="Choose a filename for your watermark-free image before downloading."
      />
    </div>
  );
}
