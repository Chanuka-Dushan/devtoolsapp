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
  ArrowLeft,
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
  onBackToLanding?: () => void;
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
  onBackToLanding,
}: HeaderProps) {
  return (
    <header className="min-h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-20 shrink-0 select-none">
      {/* Left: Back button + Brand */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60 cursor-pointer"
            title="Return to upload and features overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AutoCaption
          </span>
          <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Studio
          </span>
          <span className="hidden md:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Whisper AI
          </span>
        </div>
      </div>

      {/* Middle: Aspect Ratio Switcher */}
      <div className="flex items-center space-x-2">
        {videoResolution && (
          <div
            className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono shadow-inner"
            title={`Detected Video Resolution: ${videoResolution.width} × ${videoResolution.height}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-[11px]">Res:</span>
            <span className="font-bold text-white text-xs">{videoResolution.width}×{videoResolution.height}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
              {videoResolution.aspectRatio}
            </span>
          </div>
        )}

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center bg-slate-950/70 p-0.5 sm:p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setAspectRatio("16:9")}
            title="16:9 Landscape"
            className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              aspectRatio === "16:9"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>16:9</span>
          </button>
          <button
            onClick={() => setAspectRatio("9:16")}
            title="9:16 Vertical TikTok / Reels"
            className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              aspectRatio === "9:16"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>9:16</span>
          </button>
          <button
            onClick={() => setAspectRatio("1:1")}
            title="1:1 Square"
            className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              aspectRatio === "1:1"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">1:1</span>
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        <button
          onClick={onLoadDemo}
          className="hidden md:inline-flex px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/60 cursor-pointer"
        >
          Demo
        </button>

        <button
          onClick={onLoadSinhalaDemo}
          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/30 cursor-pointer"
          title="Load Sinhala subtitles"
        >
          <span>🇱🇰</span>
          <span className="hidden sm:inline">සිංහල</span>
        </button>

        <button
          onClick={onOpenTranslate}
          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/30 cursor-pointer"
          title="Translate captions to 14+ languages"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Translate</span>
        </button>

        <button
          onClick={onUploadClick}
          disabled={isTranscribing}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          title="Upload new video"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 rounded-lg shadow-md shadow-purple-500/20 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export<span className="hidden sm:inline"> Video</span></span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
