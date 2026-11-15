"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Move,
  Check,
  Edit2,
} from "lucide-react";
import { formatTimecode } from "./utils/time";
import { splitCaptionIntoTwoLinesOfWords, isSinhala } from "./utils/text";
import { CaptionSegment, StylePreset, VideoFilters, VideoResolution } from "./types";

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoSrc: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onStepFrame: (delta: number) => void;
  captions: CaptionSegment[];
  activeCaption?: CaptionSegment;
  style: StylePreset;
  onUpdateStyle: (style: StylePreset) => void;
  onEditCaptionText: (id: number | string, text: string) => void;
  aspectRatio: string;
  videoResolution: VideoResolution;
  videoFilters: VideoFilters;
  playbackRate: number;
  onSetPlaybackRate: (rate: number) => void;
  volume: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
}

export function VideoPlayer({
  videoRef,
  videoSrc,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  onStepFrame,
  activeCaption,
  style,
  onUpdateStyle,
  onEditCaptionText,
  aspectRatio,
  videoFilters,
  playbackRate,
  onSetPlaybackRate,
  volume,
  isMuted,
  onToggleMute,
  onVolumeChange,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingCaption, setIsDraggingCaption] = useState(false);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, initialPosX: 50, initialPosY: 80 });
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineEditText, setInlineEditText] = useState("");

  const handleCaptionMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingCaption(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPosX: style.positionX,
      initialPosY: style.positionY,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCaption || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

      const newX = Math.max(10, Math.min(90, Math.round(dragStart.initialPosX + deltaX)));
      const newY = Math.max(10, Math.min(95, Math.round(dragStart.initialPosY + deltaY)));

      onUpdateStyle({
        ...style,
        positionX: newX,
        positionY: newY,
      });
    };

    const handleMouseUp = () => {
      if (isDraggingCaption) {
        setIsDraggingCaption(false);
      }
    };

    if (isDraggingCaption) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingCaption, dragStart, style, onUpdateStyle]);

  const handleStartInlineEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCaption) {
      setInlineEditText(activeCaption.text);
      setIsEditingInline(true);
    }
  };

  const handleSaveInlineEdit = () => {
    if (activeCaption) {
      onEditCaptionText(activeCaption.id, inlineEditText);
    }
    setIsEditingInline(false);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const getContainerAspectClass = () => {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16] max-h-[82vh]";
      case "1:1":
        return "aspect-square max-h-[82vh]";
      case "4:5":
        return "aspect-[4/5] max-h-[82vh]";
      case "16:9":
      default:
        return "aspect-video max-w-5xl w-full";
    }
  };

  const filterStyle: React.CSSProperties = {
    filter: `brightness(${videoFilters.brightness}%) contrast(${videoFilters.contrast}%) saturate(${videoFilters.saturate}%) grayscale(${videoFilters.grayscale}%) blur(${videoFilters.blur}px)`,
  };

  const { line1Words, line2Words } = activeCaption
    ? splitCaptionIntoTwoLinesOfWords(activeCaption)
    : { line1Words: [], line2Words: [] };

  const hasSinhalaText = activeCaption ? isSinhala(activeCaption.text) : false;

  const renderWord = (w: { word: string; start: number; end: number }, idx: number) => {
    const isWordActive = currentTime >= w.start && currentTime <= w.end;
    const isPastWord = currentTime > w.end;

    let wordColor = style.textColor;
    let wordScale = "scale-100";
    let textShadow = "";

    const strokeVal = Number(style.strokeWidth || 0);
    const strokeCss =
      strokeVal > 0
        ? `-${strokeVal}px -${strokeVal}px 0 ${style.strokeColor}, ${strokeVal}px -${strokeVal}px 0 ${style.strokeColor}, -${strokeVal}px ${strokeVal}px 0 ${style.strokeColor}, ${strokeVal}px ${strokeVal}px 0 ${style.strokeColor}, 0 ${strokeVal}px 0 ${style.strokeColor}, 0 -${strokeVal}px 0 ${style.strokeColor}, ${strokeVal}px 0 0 ${style.strokeColor}, -${strokeVal}px 0 0 ${style.strokeColor}, 0 4px 10px rgba(0,0,0,0.85)`
        : "0 2px 8px rgba(0,0,0,0.8)";

    if (style.animation === "karaoke") {
      if (isWordActive) {
        wordColor = style.accentColor;
        wordScale = "scale-115 -translate-y-1";
        textShadow = `0 0 16px ${style.accentColor}, ${strokeCss}`;
      } else if (isPastWord) {
        wordColor = style.textColor;
        textShadow = strokeCss;
      } else {
        wordColor = "rgba(255, 255, 255, 0.75)";
        textShadow = strokeCss;
      }
    } else {
      textShadow = strokeCss;
      if (isWordActive) {
        wordScale = "scale-110";
      }
    }

    return (
      <span
        key={idx}
        className={`inline-block transition-all duration-100 origin-bottom select-none ${wordScale}`}
        style={{
          color: wordColor,
          textShadow: textShadow,
          fontFamily: hasSinhalaText ? "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" : style.fontFamily,
          textTransform: style.uppercase && !hasSinhalaText ? "uppercase" : "none",
        }}
      >
        {w.word}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Video Viewport Container */}
      <div
        ref={containerRef}
        className={`relative rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center border border-slate-800 group ${getContainerAspectClass()}`}
      >
        {/* HTML5 Video Element */}
        <video
          ref={videoRef as any}
          src={videoSrc}
          style={filterStyle}
          className="w-full h-full object-contain pointer-events-auto cursor-pointer"
          onClick={onPlayPause}
          playsInline
        />

        {/* Overlay Interactive Subtitle Layer */}
        {activeCaption && (
          <div
            className={`absolute flex flex-col items-center justify-center cursor-move transition-transform duration-75 ${
              isDraggingCaption ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent" : "hover:ring-1 hover:ring-indigo-400/60"
            }`}
            style={{
              left: `${style.positionX}%`,
              top: `${style.positionY}%`,
              transform: "translate(-50%, -50%)",
              maxWidth: aspectRatio === "9:16" ? "88%" : "82%",
              backgroundColor: style.bgColor !== "transparent" ? style.bgColor : "transparent",
              padding: style.bgColor !== "transparent" ? "8px 16px" : "0",
              borderRadius: "12px",
            }}
            onMouseDown={handleCaptionMouseDown}
            onDoubleClick={handleStartInlineEdit}
            title="Drag to reposition | Double click to edit text"
          >
            {/* Inline Quick Text Editor */}
            {isEditingInline ? (
              <div
                className="flex items-center gap-1.5 bg-slate-900/95 p-1.5 rounded-lg border border-indigo-500 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={inlineEditText}
                  onChange={(e) => setInlineEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveInlineEdit();
                    if (e.key === "Escape") setIsEditingInline(false);
                  }}
                  autoFocus
                  className="bg-slate-800 text-white text-xs px-2 py-1 rounded outline-none border border-slate-700 w-64"
                />
                <button
                  onClick={handleSaveInlineEdit}
                  className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{
                  fontSize: `${style.fontSize}px`,
                  lineHeight: 1.25,
                  letterSpacing: "0.02em",
                  userSelect: "none",
                }}
              >
                {/* Line 1 */}
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                  {line1Words.map((w, idx) => renderWord(w, idx))}
                </div>

                {/* Line 2 (Strictly max 2 lines!) */}
                {line2Words.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-0.5">
                    {line2Words.map((w, idx) => renderWord(w, line1Words.length + idx))}
                  </div>
                )}
              </div>
            )}

            {/* Hover Indicator Icon */}
            <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-indigo-600/90 text-white rounded-full shadow pointer-events-none">
              <Move className="w-2.5 h-2.5" />
            </div>
          </div>
        )}

        {/* Big Center Play Icon when Paused */}
        {!isPlaying && (
          <div
            onClick={onPlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Video Controls Bar */}
      <div className="w-full max-w-2xl mt-3 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-xl">
        {/* Play/Pause & Frame Steppers */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 5))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Rewind 5s (J)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStepFrame(-1)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Step 1 Frame Back (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
          </button>

          <button
            onClick={() => onStepFrame(1)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Step 1 Frame Forward (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 5))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Forward 5s (L)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timecode Readout */}
        <div className="flex items-center space-x-1 font-mono text-xs text-slate-300">
          <span className="font-semibold text-white">{formatTimecode(currentTime)}</span>
          <span className="text-slate-500">/</span>
          <span>{formatTimecode(duration)}</span>
        </div>

        {/* Speed, Volume & Fullscreen */}
        <div className="flex items-center space-x-3">
          {/* Playback Rate Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => onSetPlaybackRate(rate)}
                className={`px-1.5 py-0.5 rounded font-mono font-medium transition-colors cursor-pointer ${
                  playbackRate === rate ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
