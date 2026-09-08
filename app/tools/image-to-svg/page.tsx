"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileCode,
  Upload,
  Download,
  Copy,
  Check,
  Sliders,
  Sparkles,
  Eye,
  Code2,
  Info,
  Layers,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import { traceImageToSvg, loadImage } from "@/lib/tools/image-converter";

export default function ImageToSvgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [svgCode, setSvgCode] = useState<string>("");
  const [colors, setColors] = useState<number>(8);
  const [detail, setDetail] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<"visual" | "code">("visual");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (uploadedFile: File | null) => {
    if (!uploadedFile || !uploadedFile.type.startsWith("image/")) return;

    setFile(uploadedFile);
    loadImage(uploadedFile).then((img) => {
      setImgElement(img);
    });
  };

  // Run vector tracing whenever image or parameters change
  useEffect(() => {
    if (!imgElement) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      try {
        const svg = traceImageToSvg(imgElement, {
          colors,
          detail,
        });
        setSvgCode(svg);
      } catch (err) {
        console.error("Vector tracing error:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [imgElement, colors, detail]);

  const copySvgToClipboard = () => {
    if (!svgCode) return;
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportConfirm = (chosenFilename: string) => {
    if (!svgCode) return;

    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = chosenFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportModalOpen(false);
  };

  const defaultExportName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.svg`
    : "vectorized-image.svg";

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
              Image to SVG Vectorizer
            </h1>
            <p className="text-sm text-muted mt-1">
              Trace bitmap images (PNG, JPG, WebP) into crisp, infinitely scalable SVG vector graphics.
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
                Drop your image here to vectorize, or click to browse
              </p>
              <p className="text-xs text-muted mt-1">
                Best for logos, illustrations, icons, drawings, and clean graphics
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
        /* Active Vectorizer Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visual & Code Area (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* View Tab Bar */}
            <div className="flex items-center justify-between bg-card p-2 rounded-xl border border-border">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("visual")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "visual"
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Vector Preview
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "code"
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" /> SVG Code
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copySvgToClipboard}
                  disabled={!svgCode}
                  className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline px-2 py-1 font-medium"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied SVG" : "Copy SVG"}</span>
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setImgElement(null);
                    setSvgCode("");
                  }}
                  className="text-xs text-muted hover:text-error transition-colors px-2 py-1"
                >
                  Change Image
                </button>
              </div>
            </div>

            {/* Content Display */}
            {activeTab === "visual" ? (
              <Card className="p-8 border-border bg-card/40 flex items-center justify-center min-h-[420px]">
                {svgCode ? (
                  <div
                    className="max-h-[460px] max-w-full overflow-hidden flex items-center justify-center p-4 border border-dashed border-border rounded-xl bg-white shadow-md dark:bg-neutral-900"
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                ) : (
                  <p className="text-xs text-muted">Vectorizing paths...</p>
                )}
              </Card>
            ) : (
              <div className="relative">
                <textarea
                  readOnly
                  value={svgCode}
                  rows={20}
                  className="w-full rounded-2xl border border-input bg-card p-5 font-mono text-xs text-foreground leading-relaxed focus:outline-none resize-y shadow-inner"
                />
              </div>
            )}
          </div>

          {/* Sidebar Settings & Export */}
          <div className="space-y-6">
            <Card className="p-6 border-border space-y-5 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-500" />
                Vector Tracing Parameters
              </h3>

              {/* Number of Colors */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-foreground">
                    Color Palette Layers
                  </label>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {colors} colors
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="2"
                  value={colors}
                  onChange={(e) => setColors(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>Minimalist (2 colors)</span>
                  <span>Rich Palette (24 colors)</span>
                </div>
              </div>

              {/* Detail Smoothness */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-semibold text-foreground">
                    Tracing Precision
                  </label>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    Level {detail}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={detail}
                  onChange={(e) => setDetail(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>Abstract / Smooth</span>
                  <span>High Detail</span>
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-border space-y-2 text-xs text-muted">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Input File:</span>
                  <span className="font-semibold text-foreground truncate max-w-[140px]">
                    {file.name}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Format:</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">
                    Scalable Vector (SVG)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>SVG XML Size:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {svgCode ? `${(svgCode.length / 1024).toFixed(1)} KB` : "0 KB"}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-border space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!svgCode || isProcessing}
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
                >
                  <Download className="h-5 w-5" />
                  <span>Download SVG File</span>
                </Button>

                <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                  <span>
                    When exporting, you will be prompted to name your .svg file before downloading.
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
        extension=".svg"
        title="Export SVG Vector"
        description="Choose a filename for your vectorized SVG before downloading."
      />
    </div>
  );
}
