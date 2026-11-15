"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Scissors,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Clock,
  Mic,
  Video,
} from "lucide-react";
import { formatTimecode } from "./utils/time";
import { CaptionSegment } from "./types";

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  captions: CaptionSegment[];
  selectedCaptionId: number | string | null;
  onSelectCaption: (id: number | string | null) => void;
  onUpdateCaptionTime: (id: number | string, start: number, end: number) => void;
  onSplitCaption: (time: number) => void;
  onDeleteCaption: (id: number | string) => void;
  onAddCaptionAtPlayhead: () => void;
  trimStart: number;
  trimEnd: number;
  onUpdateTrim: (start: number, end: number) => void;
}

export function Timeline({
  currentTime,
  duration,
  onSeek,
  captions,
  selectedCaptionId,
  onSelectCaption,
  onUpdateCaptionTime,
  onSplitCaption,
  onDeleteCaption,
  onAddCaptionAtPlayhead,
  trimStart,
  trimEnd,
  onUpdateTrim,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(40); // pixels per second
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingHandle, setDraggingHandle] = useState<{
    id?: number | string;
    type: "start" | "end" | "trimStart" | "trimEnd";
    caption?: CaptionSegment;
    initialStart?: number;
    initialEnd?: number;
    initialVal?: number;
    mouseX: number;
  } | null>(null);

  const totalWidth = Math.max(800, duration * zoom);

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current ? containerRef.current.scrollLeft : 0;
    const clickX = e.clientX - rect.left + scrollLeft;
    const newTime = Math.max(0, Math.min(duration, clickX / zoom));
    onSeek(newTime);
    setIsScrubbing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing && trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current ? containerRef.current.scrollLeft : 0;
        const clickX = e.clientX - rect.left + scrollLeft;
        const newTime = Math.max(0, Math.min(duration, clickX / zoom));
        onSeek(newTime);
      } else if (draggingHandle) {
        const deltaSec = (e.clientX - draggingHandle.mouseX) / zoom;
        if (draggingHandle.type === "start" && draggingHandle.caption) {
          const newStart = Math.max(
            0,
            Math.min(draggingHandle.caption.end - 0.2, (draggingHandle.initialStart ?? 0) + deltaSec)
          );
          onUpdateCaptionTime(draggingHandle.caption.id, newStart, draggingHandle.caption.end);
        } else if (draggingHandle.type === "end" && draggingHandle.caption) {
          const newEnd = Math.max(
            draggingHandle.caption.start + 0.2,
            Math.min(duration, (draggingHandle.initialEnd ?? 0) + deltaSec)
          );
          onUpdateCaptionTime(draggingHandle.caption.id, draggingHandle.caption.start, newEnd);
        } else if (draggingHandle.type === "trimStart") {
          const newTrim = Math.max(0, Math.min(trimEnd - 0.5, (draggingHandle.initialVal ?? 0) + deltaSec));
          onUpdateTrim(newTrim, trimEnd);
        } else if (draggingHandle.type === "trimEnd") {
          const newTrim = Math.max(trimStart + 0.5, Math.min(duration, (draggingHandle.initialVal ?? 0) + deltaSec));
          onUpdateTrim(trimStart, newTrim);
        }
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingHandle(null);
    };

    if (isScrubbing || draggingHandle) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isScrubbing, draggingHandle, zoom, duration, onSeek, onUpdateCaptionTime, onUpdateTrim, trimStart, trimEnd]);

  const renderRulerTicks = () => {
    const ticks = [];
    const step = zoom > 60 ? 1 : zoom > 30 ? 2 : 5;
    for (let sec = 0; sec <= Math.ceil(duration); sec += step) {
      const left = sec * zoom;
      ticks.push(
        <div key={sec} className="absolute top-0 flex flex-col items-start select-none pointer-events-none" style={{ left: `${left}px` }}>
          <div className="h-2 w-px bg-slate-700" />
          <span className="text-[9px] font-mono text-slate-500 pl-1">{formatTimecode(sec)}</span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="h-48 border-t border-slate-800 bg-slate-900/95 flex flex-col shrink-0 select-none z-10">
      {/* Timeline Controls Header Bar */}
      <div className="h-9 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSplitCaption(currentTime)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700 cursor-pointer"
            title="Split subtitle at playhead position (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>Split (S)</span>
          </button>

          <button
            onClick={onAddCaptionAtPlayhead}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700 cursor-pointer"
            title="Add new subtitle frame at current time"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Frame</span>
          </button>

          {selectedCaptionId && (
            <button
              onClick={() => onDeleteCaption(selectedCaptionId)}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 rounded-md transition-colors border border-red-800/40 cursor-pointer"
              title="Delete selected subtitle (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Zoom & Track info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoom(Math.max(15, zoom - 10))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 w-10 text-center">{zoom}px/s</span>
            <button
              onClick={() => setZoom(Math.min(120, zoom + 10))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-1 text-xs font-mono text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatTimecode(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Timeline Scrollable Viewport */}
      <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-hidden relative bg-slate-950/50">
        <div
          ref={trackRef}
          className="h-full relative cursor-pointer"
          style={{ width: `${totalWidth}px` }}
          onMouseDown={handleTimelineMouseDown}
        >
          {/* Time Ruler Bar */}
          <div className="h-6 border-b border-slate-800/80 bg-slate-950/90 relative">
            {renderRulerTicks()}
          </div>

          {/* Video Track (Trimming Handles) */}
          <div className="h-10 border-b border-slate-800/50 relative flex items-center bg-slate-900/40">
            <div className="absolute left-2 flex items-center space-x-1 text-[10px] text-slate-500 font-medium z-10 pointer-events-none">
              <Video className="w-3 h-3" />
              <span>Video</span>
            </div>

            {/* Video Active Range Bar */}
            <div
              className="absolute top-1 bottom-1 bg-slate-800/80 border border-slate-700 rounded-md overflow-hidden"
              style={{
                left: `${trimStart * zoom}px`,
                width: `${Math.max(10, (trimEnd - trimStart) * zoom)}px`,
              }}
            >
              {/* Left Trim Handle */}
              <div
                className="absolute top-0 bottom-0 left-0 w-2 bg-indigo-500 hover:w-3 cursor-ew-resize transition-all z-20"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingHandle({
                    type: "trimStart",
                    initialVal: trimStart,
                    mouseX: e.clientX,
                  });
                }}
              />
              {/* Right Trim Handle */}
              <div
                className="absolute top-0 bottom-0 right-0 w-2 bg-indigo-500 hover:w-3 cursor-ew-resize transition-all z-20"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingHandle({
                    type: "trimEnd",
                    initialVal: trimEnd,
                    mouseX: e.clientX,
                  });
                }}
              />
            </div>
          </div>

          {/* Subtitle Captions Track */}
          <div className="h-16 relative flex items-center bg-slate-950/40">
            <div className="absolute left-2 flex items-center space-x-1 text-[10px] text-slate-500 font-medium z-10 pointer-events-none">
              <Mic className="w-3 h-3 text-purple-400" />
              <span>Captions</span>
            </div>

            {/* Caption Blocks */}
            {captions.map((cap) => {
              const isSelected = selectedCaptionId === cap.id;
              const isActive = currentTime >= cap.start && currentTime <= cap.end;
              const blockLeft = cap.start * zoom;
              const blockWidth = Math.max(16, (cap.end - cap.start) * zoom);

              return (
                <div
                  key={cap.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCaption(cap.id);
                  }}
                  className={`absolute top-2 bottom-2 rounded-lg border text-xs px-2 flex items-center justify-between group transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/90 border-indigo-300 text-white shadow-lg shadow-indigo-600/30 z-20"
                      : isActive
                      ? "bg-purple-600/80 border-purple-400 text-white z-10"
                      : "bg-slate-800/90 border-slate-700/80 text-slate-200 hover:border-slate-500 hover:bg-slate-700/90"
                  }`}
                  style={{
                    left: `${blockLeft}px`,
                    width: `${blockWidth}px`,
                  }}
                  title={`${cap.text} (${formatTimecode(cap.start)} - ${formatTimecode(cap.end)})`}
                >
                  {/* Left Resizer Handle */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-2 opacity-0 group-hover:opacity-100 bg-white/40 hover:bg-white rounded-l cursor-ew-resize transition-opacity"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingHandle({
                        id: cap.id,
                        type: "start",
                        caption: cap,
                        initialStart: cap.start,
                        mouseX: e.clientX,
                      });
                    }}
                  />

                  {/* Caption Text Label */}
                  <span className="truncate text-[11px] font-medium pointer-events-none pr-1">
                    {cap.text}
                  </span>

                  {/* Right Resizer Handle */}
                  <div
                    className="absolute top-0 bottom-0 right-0 w-2 opacity-0 group-hover:opacity-100 bg-white/40 hover:bg-white rounded-r cursor-ew-resize transition-opacity"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingHandle({
                        id: cap.id,
                        type: "end",
                        caption: cap,
                        initialEnd: cap.end,
                        mouseX: e.clientX,
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Global Playhead Scrubber Needle */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-30 flex flex-col items-center"
            style={{ left: `${currentTime * zoom}px` }}
          >
            {/* Playhead Head Needle */}
            <div className="w-3.5 h-3.5 bg-red-500 rotate-45 -mt-1.5 shadow-md flex items-center justify-center pointer-events-auto cursor-ew-resize">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
            <div className="w-px flex-1 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
