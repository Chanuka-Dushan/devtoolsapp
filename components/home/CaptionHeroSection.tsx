"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  Play,
  Film,
  Zap,
  CheckCircle2,
  FileVideo,
  Languages,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { storePendingVideo } from "@/lib/utils/pendingVideo";
import { cn } from "@/lib/utils";

export function CaptionHeroSection() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  const handleProcessAndNavigate = async (file: File) => {
    try {
      setIsNavigating(true);
      setUploadFileName(file.name);
      await storePendingVideo(file);
      router.push("/tools/video-caption-generator?studio=1");
    } catch (err) {
      console.error("Failed to route to studio with file:", err);
      // Fallback: navigate directly to studio
      router.push("/tools/video-caption-generator?studio=1");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessAndNavigate(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i))) {
      handleProcessAndNavigate(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-18 lg:pb-28">
      {/* Background radiant ambient glows */}
      <div className="absolute inset-0 hero-grid opacity-50" aria-hidden="true" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-5xl rounded-full bg-gradient-to-b from-brand-500/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-20 -right-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <Link href="/tools/video-caption-generator" className="inline-block">
              <Badge
                variant="primary"
                className="text-xs font-semibold px-3 py-1.5 hover:bg-brand-500/25 transition-colors cursor-pointer shadow-sm shadow-brand-500/20"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-brand-400" aria-hidden="true" />
                🔥 New: AI Video Caption Generator
              </Badge>
            </Link>
            <Badge
              variant="secondary"
              className="text-xs font-medium px-3 py-1.5 border border-amber-500/30 text-amber-500 bg-amber-500/5"
            >
              🇱🇰 Sinhala &amp; 50+ Languages
            </Badge>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface/80 border border-border text-muted">
              <Zap className="h-3 w-3 text-amber-400" />
              Kinetic Voice Sync
            </span>
          </div>

          {/* Headline requested by user */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] max-w-4xl">
            Do you need to generate{" "}
            <span className="bg-gradient-to-r from-amber-400 via-brand-400 to-emerald-400 bg-clip-text text-transparent">
              auto caption correctly?
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted max-w-3xl leading-relaxed">
            Upload your video here. Automatically transcribe voices with millisecond accuracy, animate subtitles with viral kinetic highlights (Alex Hormozi &amp; TikTok styles), and translate across 50+ languages including Sinhala.
          </p>

          {/* Beautiful Upload Dropzone Section */}
          <div className="w-full max-w-3xl mt-8 sm:mt-10">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
              className="hidden"
              id="hero-caption-video-upload"
            />

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                if (!isNavigating && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={cn(
                "relative group cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 transition-all duration-300",
                "bg-gradient-to-b from-surface/90 via-surface/60 to-surface/90 backdrop-blur-md shadow-xl",
                isDragOver
                  ? "border-brand-500 bg-brand-500/10 shadow-2xl shadow-brand-500/20 scale-[1.01]"
                  : "border-border hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10"
              )}
            >
              {isNavigating ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-400 mb-4 animate-pulse">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    Opening Video Caption Studio...
                  </h3>
                  <p className="text-sm text-muted mt-1 max-w-md truncate">
                    {uploadFileName || "Preparing your video file"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Glowing upload icon */}
                  <div className="relative mb-4">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-brand-500/30 to-amber-500/30 blur-lg opacity-70 group-hover:opacity-100 transition duration-300" />
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-b from-surface to-background border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:scale-105 group-hover:text-brand-300 transition-all duration-300 shadow-md">
                      <Upload className="h-8 w-8 sm:h-10 sm:w-10 animate-bounce group-hover:animate-none" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-brand-400 transition-colors">
                    <span className="hidden sm:inline">Drop your video file here, or </span>
                    <span className="sm:hidden">Tap here to choose your video</span>
                    <span className="text-brand-500 dark:text-brand-400 underline underline-offset-4 hidden sm:inline ml-1">
                      browse
                    </span>
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-muted max-w-md">
                    Supports MP4, WebM, MOV, MKV up to 4K resolution • 100% private client-side processing
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      className="font-semibold shadow-lg shadow-brand-500/25 pointer-events-none"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Video File
                    </Button>
                  </div>

                  {/* Format pills */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border/80">MP4</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border/80">WebM</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border/80">MOV</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border/80">9:16 Shorts</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface border border-border/80">16:9 Landscape</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                      ✓ No watermark
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo & Studio Links */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted text-xs">Or try instantly:</span>
                <Link
                  href="/tools/video-caption-generator?studio=1"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface border border-border hover:border-brand-500/40 text-foreground hover:text-brand-400 font-medium transition-colors"
                >
                  <Play className="h-3 w-3 text-brand-400" />
                  Try Sample Video
                </Link>
                <Link
                  href="/tools/video-caption-generator?studio=1&mode=sinhala"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 text-amber-500 font-medium transition-colors"
                >
                  🇱🇰 Sinhala Subtitles (සිංහල)
                </Link>
              </div>

              <Link
                href="/tools/video-caption-generator/studio"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Launch Full Studio
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl text-left">
            <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-brand-400 font-bold text-xs sm:text-sm mb-1">
                <Zap className="h-4 w-4" />
                Kinetic Highlights
              </div>
              <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                Word-by-word active voice synchronization with bright yellow / gold pop-ins.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm mb-1">
                <Sliders className="h-4 w-4" />
                2 Lines Max
              </div>
              <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                Strict max 2 lines per frame or rapid single-line frames for high viral retention.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm mb-1">
                <Languages className="h-4 w-4" />
                50+ Languages
              </div>
              <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                Transcribe &amp; translate into Sinhala, Spanish, French, German, Japanese, and more.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs sm:text-sm mb-1">
                <ShieldCheck className="h-4 w-4" />
                Decimal Outlines
              </div>
              <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                Precision strokes in decimals (e.g. 2.5px), custom shadows, and permanent MP4 burn-in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
