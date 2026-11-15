"use client";

import React from "react";
import {
  Sparkles,
  Upload,
  Download,
  HelpCircle,
  Smartphone,
  Monitor,
  Square,
  Film,
  Globe,
} from "lucide-react";
import { VideoResolution } from "./types";

interface HeaderProps {
  aspectRatio: string;
  setAspectRatio: (ar: string) => void;
  videoResolution: VideoResolution;
  onLoadDemo: () => void;
  onLoadSinhalaDemo: () => void;
  onUploadClick: () => void;
  onOpenTranslate: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  isTranscribing: boolean;
  backendOnline: boolean;
}

export function Header({
  aspectRatio,
  setAspectRatio,
  videoResolution,
  onLoadDemo,
  onLoadSinhalaDemo,
  onUploadClick,
  onOpenTranslate,
  onOpenExport,
  onOpenShortcuts,
  isTranscribing,
  backendOnline,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Film className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AutoCaption
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Studio Pro
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Whisper AI
            </span>
          </div>
        </div>
      </div>

      {/* Middle Tools: Detected Resolution Badge & Aspect Ratio Switcher */}
      <div className="flex items-center space-x-3">
        {videoResolution && (
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono shadow-inner"
            title={`Detected Video Resolution: ${videoResolution.width} × ${videoResolution.height} (${videoResolution.category || videoResolution.aspectRatio})`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-sans text-[11px] font-medium">Resolution:</span>
            <span className="font-bold text-white tracking-tight">
              {videoResolution.width} × {videoResolution.height}
            </span>
            {videoResolution.quality && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-sans font-semibold">
                {videoResolution.quality}
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans font-bold">
              {videoResolution.aspectRatio}
            </span>
          </div>
        )}

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setAspectRatio("16:9")}
            title="16:9 YouTube / Landscape"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              aspectRatio === "16:9"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>16:9</span>
          </button>
          <button
            onClick={() => setAspectRatio("9:16")}
            title="9:16 TikTok / Reels / Shorts"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              aspectRatio === "9:16"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16</span>
          </button>
          <button
            onClick={() => setAspectRatio("1:1")}
            title="1:1 Square"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              aspectRatio === "1:1"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1</span>
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onLoadDemo}
          className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/60 cursor-pointer"
        >
          Demo Video
        </button>

        <button
          onClick={onLoadSinhalaDemo}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/30 cursor-pointer"
          title="Load Sinhala subtitles with 2-lines max per frame and Noto Sans Sinhala font"
        >
          <span className="text-xs">🇱🇰</span>
          <span>සිංහල Demo</span>
        </button>

        <button
          onClick={onOpenTranslate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/30 cursor-pointer"
          title="Translate captions to Sinhala, English, and 14+ languages"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Translate</span>
        </button>

        <button
          onClick={onUploadClick}
          disabled={isTranscribing}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Upload</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 rounded-lg shadow-md shadow-purple-500/20 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
