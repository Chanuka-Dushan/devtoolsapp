"use client";

import React, { useState } from "react";
import {
  Type,
  Palette,
  Sliders,
  Search,
  Plus,
  Trash2,
  Play,
  Scissors,
  Check,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Globe,
  Zap,
} from "lucide-react";
import { STYLE_PRESETS } from "./presets";
import { formatTimecode } from "./utils/time";
import { formatToMaxTwoLines, isSinhala } from "./utils/text";
import { CaptionSegment, StylePreset, VideoFilters } from "./types";

interface SidebarProps {
  captions: CaptionSegment[];
  selectedCaptionId: number | string | null;
  onSelectCaption: (id: number | string | null) => void;
  onUpdateCaptionText: (id: number | string, text: string) => void;
  onUpdateCaptionTime: (id: number | string, start: number, end: number) => void;
  onAddCaption: (start: number, end: number, text?: string) => void;
  onDeleteCaption: (id: number | string) => void;
  onSplitCaption: (time: number) => void;
  onConvertToRapidOneLine: () => void;
  onEnforceTwoLines: () => void;
  onAutoSplitCaption: (id: number | string) => void;
  onOpenTranslate: () => void;
  onSeek: (time: number) => void;
  currentTime: number;
  style: StylePreset;
  onUpdateStyle: (style: StylePreset) => void;
  onSelectPreset: (preset: StylePreset) => void;
  videoFilters: VideoFilters;
  onUpdateFilters: (filters: VideoFilters) => void;
  onAutoTranscribe: (model?: string, lang?: string) => void;
  isTranscribing: boolean;
  whisperProgress: string;
  progressPercentage?: number;
}

export function Sidebar({
  captions,
  selectedCaptionId,
  onSelectCaption,
  onUpdateCaptionText,
  onUpdateCaptionTime,
  onAddCaption,
  onDeleteCaption,
  onSplitCaption,
  onConvertToRapidOneLine,
  onEnforceTwoLines,
  onAutoSplitCaption,
  onOpenTranslate,
  onSeek,
  currentTime,
  style,
  onUpdateStyle,
  onSelectPreset,
  videoFilters,
  onUpdateFilters,
  onAutoTranscribe,
  isTranscribing,
  whisperProgress,
  progressPercentage = 0,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"captions" | "styles" | "filters">("captions");
  const [searchQuery, setSearchQuery] = useState("");
  const [whisperModel, setWhisperModel] = useState("tiny");
  const [whisperLang, setWhisperLang] = useState("auto");
  const [presetCategory, setPresetCategory] = useState("all");

  const filteredCaptions = captions.filter((c) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPresets = STYLE_PRESETS.filter((p) => {
    if (presetCategory === "all") return true;
    if (presetCategory === "trending") return ["tiktok", "hormozi", "mrbeast", "breaking-news"].includes(p.id);
    if (presetCategory === "sinhala") return p.id.startsWith("sinhala");
    if (presetCategory === "clean") return ["ali-abdaal", "cinema", "minimal"].includes(p.id);
    if (presetCategory === "creative")
      return ["neon", "retro", "anime-comic", "golden-luxury", "karaoke-glow"].includes(p.id);
    return true;
  });

  return (
    <aside className="w-96 border-l border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col h-full shrink-0 z-10 select-none">
      {/* Sidebar Tabs Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
        <button
          onClick={() => setActiveTab("captions")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "captions"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Captions ({captions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("styles")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "styles"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          <span>Templates ({STYLE_PRESETS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("filters")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "filters"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-pink-400" />
          <span>Video</span>
        </button>
      </div>

      {/* ── TAB 1: CAPTIONS EDITOR ──────────────────────────────────── */}
      {activeTab === "captions" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick AI Whisper Transcription Bar */}
          <div className="p-3 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Whisper Transcribe</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Word-Level Sync</span>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={whisperModel}
                onChange={(e) => setWhisperModel(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-md border border-slate-700 outline-none flex-1"
              >
                <option value="tiny">Whisper Tiny (Fastest)</option>
                <option value="base">Whisper Base (Balanced)</option>
                <option value="small">Whisper Small (Accurate)</option>
              </select>

              <select
                value={whisperLang}
                onChange={(e) => setWhisperLang(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-md border border-slate-700 outline-none flex-1"
              >
                <option value="auto">Auto Language</option>
                <option value="si">Sinhala (සිංහල)</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <button
              onClick={() => onAutoTranscribe(whisperModel, whisperLang)}
              disabled={isTranscribing}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer relative overflow-hidden"
            >
              {isTranscribing ? (
                <>
                  <div className="w-full flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                      <span className="truncate text-[11px]">{whisperProgress || "Transcribing..."}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-300 shrink-0">
                      {progressPercentage}%
                    </span>
                  </div>
                  {/* Embedded progress bar */}
                  <div className="w-full h-1 bg-slate-700/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-300 transition-all duration-200"
                      style={{ width: `${Math.min(100, Math.max(5, progressPercentage))}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Auto Transcribe Voice</span>
                </div>
              )}
            </button>
          </div>

          {/* Rapid Pacing & Subtitle Formatting Toolbar */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-1.5">
            <button
              onClick={onConvertToRapidOneLine}
              title="Ensure strictly 1-line rapid scenes synchronized to voice cadence"
              className="flex-1 py-1 px-2 text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>1-Line Voice Sync</span>
            </button>

            <button
              onClick={onEnforceTwoLines}
              title="Automatically reformat subtitles so no frame exceeds 2 lines"
              className="flex-1 py-1 px-2 text-[11px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Max 2 Lines</span>
            </button>

            <button
              onClick={onOpenTranslate}
              title="Translate all subtitles to Sinhala, English, and 14+ languages"
              className="py-1 px-2.5 text-[11px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Globe className="w-3 h-3 text-purple-400" />
              <span>Translate</span>
            </button>
          </div>

          {/* Subtitle Search Bar */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subtitle frames..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={() => onAddCaption(currentTime, currentTime + 2.5, "New Subtitle")}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Add caption at current playhead"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Captions List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredCaptions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Type className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No captions found.</p>
              </div>
            ) : (
              filteredCaptions.map((cap) => {
                const isSelected = selectedCaptionId === cap.id;
                const isActive = currentTime >= cap.start && currentTime <= cap.end;
                const lines = cap.text.split("\n").filter((l) => l.trim().length > 0);
                const exceedsTwoLines = lines.length > 2;

                return (
                  <div
                    key={cap.id}
                    onClick={() => onSelectCaption(cap.id)}
                    className={`rounded-xl border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10"
                        : isActive
                        ? "bg-purple-950/20 border-purple-500/40"
                        : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    {/* Timestamp & Actions Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeek(cap.start);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                          title="Seek to start"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                        <input
                          type="number"
                          step="0.1"
                          value={cap.start}
                          onChange={(e) => onUpdateCaptionTime(cap.id, parseFloat(e.target.value) || 0, cap.end)}
                          className="w-14 bg-slate-900 font-mono text-[11px] text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700 text-center"
                        />
                        <span className="text-slate-500 text-xs">→</span>
                        <input
                          type="number"
                          step="0.1"
                          value={cap.end}
                          onChange={(e) => onUpdateCaptionTime(cap.id, cap.start, parseFloat(e.target.value) || 0)}
                          className="w-14 bg-slate-900 font-mono text-[11px] text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700 text-center"
                        />
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSplitCaption((cap.start + cap.end) / 2);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 cursor-pointer"
                          title="Split caption in half"
                        >
                          <Scissors className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCaption(cap.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 cursor-pointer"
                          title="Delete caption"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subtitle Text Area */}
                    <textarea
                      value={cap.text}
                      onChange={(e) => onUpdateCaptionText(cap.id, e.target.value)}
                      rows={Math.min(3, Math.max(1, lines.length))}
                      className="w-full bg-slate-900 text-slate-100 text-xs p-2 rounded-lg border border-slate-700/80 focus:border-indigo-500 outline-none resize-none font-sans"
                    />

                    {/* Exceeds 2 Lines Warning & Fix Button */}
                    {exceedsTwoLines && (
                      <div className="mt-2 flex items-center justify-between text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                        <span>Exceeds 2 lines ({lines.length} lines)</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAutoSplitCaption(cap.id);
                          }}
                          className="underline hover:text-white font-semibold cursor-pointer"
                        >
                          Fix to 2 Lines
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: STYLES & TEMPLATES ───────────────────────────────── */}
      {activeTab === "styles" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Preset Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {["all", "trending", "sinhala", "clean", "creative"].map((cat) => (
              <button
                key={cat}
                onClick={() => setPresetCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  presetCategory === cat ? "bg-indigo-600 text-white font-semibold" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Creator Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {filteredPresets.map((preset) => {
                const isSelected = style.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-xs text-white truncate pr-1">{preset.name}</span>
                      {preset.badge && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 shrink-0 font-medium">
                          {preset.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-center py-2 text-sm select-none"
                      style={{
                        fontFamily: preset.fontFamily,
                        color: preset.accentColor || preset.textColor,
                        textShadow:
                          preset.strokeWidth > 0
                            ? `0 0 4px ${preset.strokeColor}, -1px -1px 0 ${preset.strokeColor}, 1px -1px 0 ${preset.strokeColor}`
                            : "none",
                      }}
                    >
                      POP TEXT
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Typography & Stroke Controls */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Custom Typography & Position
            </span>

            {/* Font Family */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Font Family</label>
              <select
                value={style.fontFamily}
                onChange={(e) => onUpdateStyle({ ...style, fontFamily: e.target.value })}
                className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-800 outline-none"
              >
                <option value="Impact">Impact (TikTok / Viral)</option>
                <option value="Noto Sans Sinhala">Noto Sans Sinhala (සිංහල)</option>
                <option value="Iskoola Pota">Iskoola Pota (සිංහල)</option>
                <option value="Arial">Arial</option>
                <option value="Inter">Inter (Clean Modern)</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier">Courier (Monospace Retro)</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Georgia">Georgia (Serif)</option>
              </select>
            </div>

            {/* Font Size & Decimal Stroke Slider */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Font Size</span>
                  <span className="font-mono text-indigo-400">{style.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="64"
                  value={style.fontSize}
                  onChange={(e) => onUpdateStyle({ ...style, fontSize: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Decimal Stroke Width Control */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Stroke Width</span>
                  <span className="font-mono text-indigo-400">{Number(style.strokeWidth || 0).toFixed(1)}px</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="8.0"
                  step="0.1"
                  value={style.strokeWidth || 0}
                  onChange={(e) => onUpdateStyle({ ...style, strokeWidth: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Colors Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Text Color</label>
                <input
                  type="color"
                  value={style.textColor}
                  onChange={(e) => onUpdateStyle({ ...style, textColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-slate-900 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Outline Color</label>
                <input
                  type="color"
                  value={style.strokeColor === "transparent" ? "#000000" : style.strokeColor}
                  onChange={(e) => onUpdateStyle({ ...style, strokeColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-slate-900 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Active Pop</label>
                <input
                  type="color"
                  value={style.accentColor}
                  onChange={(e) => onUpdateStyle({ ...style, accentColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Position Y (Vertical) & Position X (Horizontal) Sliders */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Position Vertical (Y)</span>
                  <span className="font-mono text-indigo-400">{style.positionY}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={style.positionY}
                  onChange={(e) => onUpdateStyle({ ...style, positionY: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Position Horizontal (X)</span>
                  <span className="font-mono text-indigo-400">{style.positionX}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={style.positionX}
                  onChange={(e) => onUpdateStyle({ ...style, positionX: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Alignment</label>
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onUpdateStyle({ ...style, textAlign: align })}
                    className={`flex-1 py-1 text-xs rounded capitalize flex items-center justify-center transition-colors cursor-pointer ${
                      style.textAlign === align ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {align === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                    {align === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                    {align === "right" && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: VIDEO FILTERS ────────────────────────────────────── */}
      {activeTab === "filters" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Video Canvas Color Grading
          </span>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Brightness</span>
              <span className="font-mono text-indigo-400">{videoFilters.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={videoFilters.brightness}
              onChange={(e) => onUpdateFilters({ ...videoFilters, brightness: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Contrast</span>
              <span className="font-mono text-indigo-400">{videoFilters.contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={videoFilters.contrast}
              onChange={(e) => onUpdateFilters({ ...videoFilters, contrast: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Saturation</span>
              <span className="font-mono text-indigo-400">{videoFilters.saturate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={videoFilters.saturate}
              onChange={(e) => onUpdateFilters({ ...videoFilters, saturate: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Reset Filters */}
          <button
            onClick={() =>
              onUpdateFilters({
                brightness: 100,
                contrast: 100,
                saturate: 100,
                grayscale: 0,
                blur: 0,
              })
            }
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer mt-4"
          >
            Reset Filters
          </button>
        </div>
      )}
    </aside>
  );
}
