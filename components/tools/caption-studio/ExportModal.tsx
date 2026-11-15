"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Film,
  FileText,
  Code,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { getCaptionWordsWithTimings } from "./utils/text";
import { captionFetch } from "./api";
import { CaptionSegment, StylePreset, VideoResolution } from "./types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  captions: CaptionSegment[];
  style: StylePreset;
  trimStart: number;
  trimEnd: number;
  aspectRatio: string;
  videoResolution: VideoResolution;
  videoSrc: string;
  videoPath: string | null;
}

export function ExportModal({
  isOpen,
  onClose,
  captions,
  style,
  trimStart,
  trimEnd,
  aspectRatio,
  videoSrc,
  videoPath,
}: ExportModalProps) {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRenderMP4 = async () => {
    setIsRendering(true);
    setDownloadUrl(null);
    setErrorMsg(null);
    setRenderProgress("Generating subtitles & rendering video with FFmpeg...");

    try {
      const payload = {
        videoPath: videoPath || null,
        sampleName: !videoPath ? "sample.mp4" : null,
        trimStart: trimStart || 0.0,
        trimEnd: trimEnd || null,
        captions: captions.map((c) => {
          const words = c.words && c.words.length > 0 ? c.words : getCaptionWordsWithTimings(c);
          return {
            id: c.id,
            start: c.start,
            end: c.end,
            text: c.text,
            words: words,
          };
        }),
        style: {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          textColor: style.textColor,
          bgColor: style.bgColor,
          strokeColor: style.strokeColor,
          strokeWidth: style.strokeWidth,
          accentColor: style.accentColor,
          positionY: style.positionY,
          positionX: style.positionX,
          textAlign: style.textAlign,
          uppercase: style.uppercase,
          preset: style.id || "tiktok",
          animation: style.animation || "karaoke",
        },
        aspectRatio: aspectRatio,
      };

      const res = await captionFetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to render video");
      }

      const data = await res.json();
      setDownloadUrl(data.downloadUrl);
      setIsRendering(false);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to render video");
      setIsRendering(false);
    }
  };

  const handleDownloadSRT = async () => {
    try {
      const res = await captionFetch("/api/export-srt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captions,
          style,
          trimStart,
          trimEnd,
        }),
      });
      const srtText = await res.text();
      const blob = new Blob([srtText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "captions.srt";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("Failed to generate SRT: " + e.message);
    }
  };

  const handleDownloadVTT = async () => {
    try {
      const res = await captionFetch("/api/export-vtt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captions,
          style,
          trimStart,
          trimEnd,
        }),
      });
      const vttText = await res.text();
      const blob = new Blob([vttText], { type: "text/vtt;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "captions.vtt";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("Failed to generate VTT: " + e.message);
    }
  };

  const handleExportProjectJSON = () => {
    const projectData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      aspectRatio,
      trimStart,
      trimEnd,
      style,
      captions,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caption-project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Export & Download</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Option 1: MP4 with burned-in captions */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 p-4 rounded-xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm text-white">Render MP4 Video</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                1080p HD Burn-in
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Burn kinetic animated subtitles and custom styles directly into your MP4 video using the
              high-speed FFmpeg engine.
            </p>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {downloadUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Video rendered successfully!</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={downloadUrl.startsWith("http") ? downloadUrl : `http://localhost:8000${downloadUrl}`}
                    download="captioned_video.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Rendered MP4</span>
                  </a>
                  <button
                    onClick={handleRenderMP4}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                    title="Render again"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRenderMP4}
                disabled={isRendering}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isRendering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{renderProgress || "Rendering video..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start MP4 Render ({captions.length} Frames)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Option 2: Subtitle Files & Project Data */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Subtitle Files & Project Data
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleDownloadSRT}
                className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group"
              >
                <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">.SRT File</span>
                <span className="text-[10px] text-slate-500">SubRip Subtitles</span>
              </button>

              <button
                onClick={handleDownloadVTT}
                className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group"
              >
                <FileText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">.VTT File</span>
                <span className="text-[10px] text-slate-500">Web Video Text</span>
              </button>

              <button
                onClick={handleExportProjectJSON}
                className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group"
              >
                <Code className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Project JSON</span>
                <span className="text-[10px] text-slate-500">Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
