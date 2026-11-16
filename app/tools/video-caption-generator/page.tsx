"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Film,
  Mic,
  Languages,
  Sliders,
  Download,
  Maximize2,
  ChevronDown,
  Palette,
  Zap,
  Play,
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileVideo,
  MonitorSmartphone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { CaptionStudio } from "@/components/tools/caption-studio/CaptionStudio";

const TEMPLATES = [
  {
    id: "tiktok-viral",
    name: "TikTok Viral",
    badge: "Trending",
    color: "from-amber-400 to-yellow-500",
    bgClass: "bg-black/90",
    textClass: "text-yellow-400 font-extrabold tracking-wide uppercase",
    stroke: "3px black",
    previewText: "THAT IS CRAZY!",
    desc: "Bold high-contrast font with active yellow kinetic highlighting favored by top TikTok and Reels creators.",
  },
  {
    id: "alex-hormozi",
    name: "Alex Hormozi",
    badge: "High Retention",
    color: "from-yellow-400 to-amber-600",
    bgClass: "bg-zinc-950",
    textClass: "text-amber-300 font-black tracking-tight uppercase",
    stroke: "4px black",
    previewText: "$100M SECRETS",
    desc: "Punchy, single-word or short-phrase pop-in animations with intense black border for 80%+ retention.",
  },
  {
    id: "mrbeast",
    name: "MrBeast Bold",
    badge: "YouTube #1",
    color: "from-blue-500 to-cyan-400",
    bgClass: "bg-blue-950/80",
    textClass: "text-white font-extrabold tracking-wider uppercase",
    stroke: "3.5px black",
    previewText: "YOU WON'T BELIEVE THIS",
    desc: "Vibrant and punchy captions that grab viewer attention instantly across long-form and short-form video.",
  },
  {
    id: "sinhala-heritage",
    name: "Sinhala Golden",
    badge: "🇱🇰 Sinhala",
    color: "from-orange-500 to-amber-500",
    bgClass: "bg-stone-950",
    textClass: "text-yellow-300 font-bold",
    stroke: "2.8px black",
    previewText: "ස්වයංක්‍රීය උපසිරැසි",
    desc: "Optimized for Sinhala unicode fonts (Iskoola Pota / Noto Sans Sinhala) with warm golden accents.",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    badge: "Futuristic",
    color: "from-cyan-400 to-fuchsia-500",
    bgClass: "bg-slate-950",
    textClass: "text-cyan-400 font-mono font-bold italic",
    stroke: "2px #0f172a",
    previewText: "SYNCHRONIZED VOICE",
    desc: "Cyberpunk neon glow and italicized typography ideal for gaming, tech reviews, and futuristic shorts.",
  },
];

const FEATURES = [
  {
    icon: Mic,
    title: "AI Voice-to-Text with Whisper",
    description:
      "State-of-the-art automatic speech recognition accurately transcribes English, Sinhala, and 50+ languages with precise millisecond timestamps.",
  },
  {
    icon: Zap,
    title: "Kinetic Word-by-Word Voice Sync",
    description:
      "Subtitles highlight word-by-word in real time as each syllable is spoken, driving maximum engagement and watch time.",
  },
  {
    icon: Languages,
    title: "Instant Multilingual Subtitle Translation",
    description:
      "Translate existing or generated subtitles into Sinhala, Spanish, French, German, Japanese, and more while preserving voice timing.",
  },
  {
    icon: Sliders,
    title: "Single & Dual Line Pacing Control",
    description:
      "Keep frames punchy with strict 1-line or 2-line maximum pacing, preventing cluttered multi-line text blocks on mobile screens.",
  },
  {
    icon: Palette,
    title: "Granular Styling & Decimal Outlines",
    description:
      "Fine-tune stroke outlines in precise decimals (e.g., 2.5px), set box backgrounds, customize highlight colors, font families, and shadows.",
  },
  {
    icon: Download,
    title: "Client-Side MP4 Video Rendering",
    description:
      "Export high-resolution MP4 videos with permanently burned-in kinetic animated subtitles directly from your browser.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Upload Video",
    desc: "Drag and drop any MP4, WebM, or MOV video file. The studio instantly detects video resolution and aspect ratio (9:16 or 16:9).",
  },
  {
    step: "02",
    title: "Auto Transcribe & Style",
    desc: "Click 'Auto Transcribe' to run local Whisper AI speech recognition. Pick a creator template (Hormozi, TikTok, Sinhala) or translate subtitles.",
  },
  {
    step: "03",
    title: "Preview & Export MP4",
    desc: "Play back in real time with interactive timeline scrubber. Adjust text per-frame or drag positions, then click 'Export Video' to render your MP4.",
  },
];

const FAQS = [
  {
    q: "Does this support Sinhala language subtitles?",
    a: "Yes! The tool provides full Sinhala speech transcription, built-in translation to Sinhala, and automatic typography styling with Iskoola Pota and Noto Sans Sinhala unicode fonts.",
  },
  {
    q: "How does the kinetic voice synchronization work?",
    a: "The OpenAI Whisper backend extracts word-level start and end timestamps. As the video plays, the active word is dynamically calculated and styled with high-visibility kinetic highlights (e.g., bright yellow or gold).",
  },
  {
    q: "Can I manually edit generated text or adjust timings in each frame?",
    a: "Absolutely. You can click on any subtitle segment in the timeline or sidebar to modify text, adjust start/end seconds, change font size, customize outline stroke, or reposition captions on screen.",
  },
  {
    q: "What video formats and aspect ratios are supported?",
    a: "All modern video formats including MP4, WebM, and MOV are supported. The tool automatically detects whether your video is vertical 9:16 (TikTok, Instagram Reels, YouTube Shorts) or horizontal 16:9 (standard YouTube).",
  },
  {
    q: "Is my video kept private and secure?",
    a: "Yes. All video processing and subtitle rendering occur locally in your browser and on your local studio backend. Your video files are never uploaded to public clouds or third-party storage.",
  },
];

export default function VideoCaptionGeneratorPage() {
  const [viewMode, setViewMode] = useState<"landing" | "studio">("landing");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [demoMode, setDemoMode] = useState<"default" | "sinhala">("default");
  const [isDragOver, setIsDragOver] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  // Check URL query parameters on mount (?studio=1 or ?mode=sinhala)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("studio") === "1" || params.get("mode") === "studio") {
        setViewMode("studio");
      }
      if (params.get("mode") === "sinhala") {
        setDemoMode("sinhala");
        setViewMode("studio");
      }
    }
  }, []);

  const handleSelectFile = (file: File) => {
    if (!file) return;
    setUploadedFile(file);
    setViewMode("studio");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleHeroFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectFile(file);
    }
    e.target.value = "";
  };

  const handleHeroDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      handleSelectFile(file);
    }
  };

  const handleOpenDemoStudio = (mode: "default" | "sinhala" = "default") => {
    setUploadedFile(null);
    setDemoMode(mode);
    setViewMode("studio");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToLanding = () => {
    setViewMode("landing");
    setUploadedFile(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── VIEW 1: FULL TAB STUDIO VIEW (with Mobile Responsive Design) ──
  if (viewMode === "studio") {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex flex-col">
        <CaptionStudio
          initialVideoFile={uploadedFile}
          initialMode={demoMode}
          isFullTab={true}
          onBackToLanding={handleBackToLanding}
        />
      </div>
    );
  }

  // ── VIEW 2: LANDING PAGE WITH BEAUTIFUL UPLOAD HERO SECTION ──
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20">
      {/* Hidden File Input for Hero Upload */}
      <input
        ref={heroFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
        onChange={handleHeroFileInputChange}
        className="hidden"
      />

      {/* ── First Hero Section ────────────────────────────── */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary" className="px-3 py-1 text-xs font-semibold gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            OpenAI Whisper AI Powered
          </Badge>
          <Badge
            variant="secondary"
            className="px-3 py-1 text-xs font-semibold gap-1.5 border border-amber-500/30 text-amber-500"
          >
            🇱🇰 Sinhala & 50+ Languages
          </Badge>
          <Badge variant="default" className="px-3 py-1 text-xs font-semibold gap-1.5">
            🔥 Viral Hormozi & TikTok Styles
          </Badge>
        </div>

        {/* Headline as requested: "Do you need to generate auto caption correctly?" */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
          Do you need to generate auto caption correctly?
        </h1>

        {/* Description as requested: "upload your video here..." */}
        <p className="text-muted text-base sm:text-xl leading-relaxed max-w-2xl mx-auto">
          Upload your video here. Automatically transcribe voices with millisecond accuracy, animate
          subtitles with viral kinetic word highlights, and translate into 50+ languages including Sinhala.
        </p>

        {/* ── Beautiful Upload Section ──────────────────────── */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleHeroDrop}
          className={cn(
            "mt-8 max-w-3xl mx-auto rounded-3xl border-2 border-dashed transition-all duration-300 relative overflow-hidden p-8 sm:p-12 text-center",
            isDragOver
              ? "border-brand-500 bg-brand-500/15 scale-[1.01] shadow-2xl shadow-brand-500/20"
              : "border-brand-500/40 hover:border-brand-500 bg-gradient-to-b from-brand-500/[0.08] via-surface to-surface shadow-2xl shadow-brand-500/5"
          )}
        >
          {/* Subtle glow background */}
          <div
            className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Upload Icon Badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 mx-auto mb-6 group cursor-pointer hover:scale-105 transition-transform"
            onClick={() => heroFileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 animate-bounce" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Upload your video to generate captions
          </h2>
          <p className="text-muted text-sm sm:text-base max-w-md mx-auto mb-6">
            Drag and drop your video file here, or click the button below to browse from your device.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="gap-2.5 font-bold px-8 py-3.5 text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 cursor-pointer"
              onClick={() => heroFileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5" />
              <span>Select Video File</span>
            </Button>
          </div>

          {/* Accepted Formats Pill */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
            <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border font-medium">
              MP4
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border font-medium">
              WebM
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border font-medium">
              MOV
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border font-medium">
              Up to 4K resolution
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border font-medium">
              No file size limits
            </span>
          </div>

          {/* Fast Trial Quick Launchers */}
          <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-muted font-medium w-full sm:w-auto">Don&apos;t have a video right now?</span>
            <button
              onClick={() => handleOpenDemoStudio("default")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-surface text-foreground hover:bg-surface-elevated text-xs font-semibold transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-brand-500 fill-current" />
              <span>Try with Sample Demo</span>
            </button>

            <button
              onClick={() => handleOpenDemoStudio("sinhala")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>🇱🇰</span>
              <span>Try Sinhala Subtitles Demo</span>
            </button>
          </div>
        </div>

        {/* 4 Feature Badges beneath upload */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
            <Mic className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-foreground block">Whisper AI Sync</span>
              <span className="text-[11px] text-muted">Accurate word-level timings</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-foreground block">Kinetic Highlight</span>
              <span className="text-[11px] text-muted">Hormozi & TikTok styles</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
            <Languages className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-foreground block">Sinhala & 50+ Langs</span>
              <span className="text-[11px] text-muted">Instant translation</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
            <MonitorSmartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-foreground block">Full Mobile Design</span>
              <span className="text-[11px] text-muted">Optimized for all screens</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preset Caption Templates ───────────────────────── */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="text-xs font-semibold">
            Creator Presets
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Viral Caption Styles & Animation Presets
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto">
            Switch styles with one click. Every template syncs kinetic highlights with the voice speaker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEMPLATES.map((tmpl) => (
            <Card
              key={tmpl.id}
              className="p-4 flex flex-col justify-between hover:border-brand-500/40 hover:shadow-lg transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{tmpl.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-elevated text-muted border border-border">
                    {tmpl.badge}
                  </span>
                </div>

                <div
                  className={cn(
                    "rounded-lg p-4 h-24 flex items-center justify-center text-center shadow-inner relative overflow-hidden",
                    tmpl.bgClass
                  )}
                >
                  <span
                    className={cn("text-base select-none", tmpl.textClass)}
                    style={{ textShadow: `0 0 10px rgba(0,0,0,0.8)` }}
                  >
                    {tmpl.previewText}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed">{tmpl.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 6 Core Features Grid ────────────────────────────── */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="text-xs font-semibold">
            Features & Capabilities
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Everything You Need for Viral Short-Form Videos
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto">
            Engineered specifically for content creators across YouTube Shorts, TikTok, and Instagram Reels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group rounded-xl border border-border bg-surface p-6 hover:border-brand-500/40 hover:shadow-lg transition-all duration-200 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground text-base">{feat.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3 Steps Workflow ───────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="primary" className="text-xs font-semibold">
            3-Step Workflow
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            How It Works in 3 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, idx) => (
            <div key={idx} className="relative space-y-3 p-5 rounded-xl bg-surface-elevated border border-border">
              <span className="text-3xl font-black text-brand-500/40 block">{s.step}</span>
              <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ Section ────────────────────────────────────── */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="text-xs font-semibold">
            Common Questions
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-surface overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:text-brand-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={cn("w-4 h-4 text-muted transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-sm text-muted leading-relaxed border-t border-border/50">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
