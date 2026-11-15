"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Film,
  Mic,
  Languages,
  Sliders,
  Download,
  CheckCircle2,
  Maximize2,
  ExternalLink,
  RefreshCw,
  Play,
  Volume2,
  Layers,
  Type,
  Zap,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Palette,
  ArrowRight,
  MonitorPlay,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const studioContainerRef = useRef<HTMLDivElement>(null);

  const studioUrl = "/caption-studio/";

  const toggleFullscreen = () => {
    if (!studioContainerRef.current) return;
    if (!document.fullscreenElement) {
      studioContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const reloadStudio = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* ── Hero Section ───────────────────────────────────── */}
      <div className="text-center space-y-5 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary" className="px-3 py-1 text-xs font-semibold gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            OpenAI Whisper AI Powered
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold gap-1.5 border border-amber-500/30 text-amber-500">
            🇱🇰 Sinhala & 50+ Languages
          </Badge>
          <Badge variant="default" className="px-3 py-1 text-xs font-semibold gap-1.5">
            🔥 Viral Hormozi & TikTok Styles
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
          AI Video Caption & Subtitle Generator
        </h1>

        <p className="text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Automatically transcribe voices into frame-synced animated subtitles. Choose viral creator
          templates, translate across 50+ languages including Sinhala, and export high-definition MP4s in
          seconds.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="gap-2 font-bold shadow-lg shadow-brand-500/20"
            onClick={() => {
              studioContainerRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            Open Caption Studio
          </Button>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-elevated text-sm font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-muted" />
            Launch in Full Tab
          </a>
        </div>
      </div>

      {/* ── Embedded Interactive Caption Studio ─────────────── */}
      <div
        ref={studioContainerRef}
        id="studio-frame-container"
        className={cn(
          "rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "w-full"
        )}
      >
        {/* Studio Window Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-elevated border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-border mx-1" />
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Film className="w-3.5 h-3.5 text-brand-500" />
              <span>AutoCaption Studio v2.0</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Whisper AI Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reloadStudio}
              title="Reload Studio"
              className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
              className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              title="Open standalone app"
              className="p-1.5 text-muted hover:text-brand-500 rounded-lg hover:bg-surface transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Studio iFrame Container */}
        <div className="relative w-full bg-zinc-950" style={{ height: isFullscreen ? "calc(100vh - 49px)" : "780px" }}>
          <iframe
            key={iframeKey}
            src={studioUrl}
            title="AutoCaption Video Studio"
            className="w-full h-full border-none"
            allow="camera; microphone; display-capture; autoplay; clipboard-write;"
          />
        </div>
      </div>

      {/* ── Preset Caption Templates ───────────────────────── */}
      <div className="space-y-6">
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

                {/* Subtitle simulation card */}
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
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:text-brand-500 transition-colors"
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

      {/* ── Bottom CTA ─────────────────────────────────────── */}
      <div className="text-center rounded-2xl bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent border border-brand-500/20 p-8 sm:p-12 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Ready to Create Viral Captioned Videos?
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
          Start generating synchronized subtitles now with voice recognition, custom typography, and
          instant Sinhala translation.
        </p>
        <div className="pt-2">
          <Button
            size="lg"
            className="gap-2 font-bold shadow-lg shadow-brand-500/20"
            onClick={() => {
              studioContainerRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Sparkles className="w-4 h-4" />
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
}
