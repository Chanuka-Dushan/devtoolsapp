"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "./Header";
import { VideoPlayer } from "./VideoPlayer";
import { Timeline } from "./Timeline";
import { Sidebar } from "./Sidebar";
import { ExportModal } from "./ExportModal";
import { ShortcutsModal } from "./ShortcutsModal";
import { TranslationModal } from "./TranslationModal";
import { STYLE_PRESETS, INITIAL_CAPTIONS, SINHALA_DEMO_CAPTIONS } from "./presets";
import {
  rechunkCaptionsToTwoLinesMax,
  formatToMaxTwoLines,
  convertToSingleLineRapidFrames,
} from "./utils/text";
import { detectAspectRatio } from "./utils/resolution";
import { captionFetch } from "./api";
import { getPendingVideo } from "@/lib/utils/pendingVideo";
import { CaptionSegment, StylePreset, VideoFilters, VideoResolution } from "./types";
import { Film, Type, Palette, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaptionStudioProps {
  initialVideoFile?: File | null;
  initialMode?: "default" | "sinhala";
  onBackToLanding?: () => void;
  isFullTab?: boolean;
}

export function CaptionStudio({
  initialVideoFile,
  initialMode,
  onBackToLanding,
  isFullTab = false,
}: CaptionStudioProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Video State
  const [videoSrc, setVideoSrc] = useState<string>("/samples/sample.mp4");
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(23.6);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [videoResolution, setVideoResolution] = useState<VideoResolution>({
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    label: "1280 × 720 (16:9)",
    category: "16:9 (Widescreen HD)",
    quality: "720p HD",
  });

  // Mobile View Navigation: 'player' | 'captions' | 'styles' | 'timeline'
  const [mobileTab, setMobileTab] = useState<"player" | "captions" | "styles" | "timeline">("player");

  // Video Filters
  const [videoFilters, setVideoFilters] = useState<VideoFilters>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    blur: 0,
  });

  // Trimming State
  const [trimStart, setTrimStart] = useState<number>(0.0);
  const [trimEnd, setTrimEnd] = useState<number>(23.6);

  // Captions & Styling
  const [captions, setCaptions] = useState<CaptionSegment[]>(INITIAL_CAPTIONS);
  const [selectedCaptionId, setSelectedCaptionId] = useState<number | string | null>(1);
  const [style, setStyle] = useState<StylePreset>(STYLE_PRESETS[0]);

  // Transcribing Status
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [whisperProgress, setWhisperProgress] = useState<string>("");
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState<boolean>(false);

  // Check backend health on mount
  useEffect(() => {
    captionFetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setBackendOnline(data.status === "ok");
      })
      .catch(() => setBackendOnline(false));
  }, []);

  // Handle Initial Props or Pending Uploads (e.g. from Landing Page upload or Sinhala preset)
  useEffect(() => {
    if (initialVideoFile) {
      handleProcessVideoFile(initialVideoFile);
    } else {
      getPendingVideo().then((pending) => {
        if (pending) {
          handleProcessVideoFile(pending);
        } else if (initialMode === "sinhala") {
          handleLoadSinhalaDemo();
        }
      });
    }
  }, [initialVideoFile, initialMode]);

  // Sync video time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (trimEnd && video.currentTime >= trimEnd && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (!trimEnd || trimEnd === 23.6) {
        setTrimEnd(video.duration);
      }
      if (video.videoWidth && video.videoHeight) {
        const detected = detectAspectRatio(video.videoWidth, video.videoHeight);
        setVideoResolution(detected);
        setAspectRatio(detected.aspectRatio);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [trimEnd]);

  // Play / Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (currentTime >= trimEnd) {
        video.currentTime = trimStart;
      }
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Seek video
  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(duration, newTime));
    video.currentTime = clamped;
    setCurrentTime(clamped);
  };

  // Frame stepping (25 fps = 0.04s per frame)
  const handleStepFrame = (deltaFrames: number) => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      setIsPlaying(false);
    }
    const newTime = Math.max(0, Math.min(duration, video.currentTime + deltaFrames * 0.04));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Speed rate change
  const handleSetPlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Volume change
  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Caption CRUD operations
  const handleUpdateCaptionText = (id: number | string, newText: string) => {
    setCaptions((prev) => prev.map((c) => (c.id === id ? { ...c, text: newText } : c)));
  };

  const handleUpdateCaptionTime = (id: number | string, newStart: number, newEnd: number) => {
    setCaptions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              start: Math.round(newStart * 100) / 100,
              end: Math.round(newEnd * 100) / 100,
            }
          : c
      )
    );
  };

  const handleAddCaption = (start: number, end: number, text = "New Subtitle") => {
    const newId = Date.now();
    const newCap: CaptionSegment = {
      id: newId,
      start: Math.round(start * 100) / 100,
      end: Math.round(end * 100) / 100,
      text: text,
      words: text.split(" ").map((w, i) => ({
        word: w,
        start: start + i * 0.3,
        end: start + (i + 1) * 0.3,
      })),
    };
    const updated = [...captions, newCap].sort((a, b) => a.start - b.start);
    setCaptions(updated);
    setSelectedCaptionId(newId);
  };

  const handleDeleteCaption = (id: number | string) => {
    setCaptions((prev) => prev.filter((c) => c.id !== id));
    if (selectedCaptionId === id) {
      setSelectedCaptionId(null);
    }
  };

  const handleSplitCaption = (splitTime: number) => {
    const target = captions.find((c) => splitTime > c.start + 0.3 && splitTime < c.end - 0.3);
    if (!target) return;

    const words = target.text.split(" ");
    const half = Math.max(1, Math.floor(words.length / 2));
    const text1 = words.slice(0, half).join(" ");
    const text2 = words.slice(half).join(" ");

    const newCap1: CaptionSegment = { ...target, end: Math.round(splitTime * 100) / 100, text: text1 };
    const newCap2: CaptionSegment = {
      id: Date.now(),
      start: Math.round(splitTime * 100) / 100,
      end: target.end,
      text: text2,
    };

    setCaptions((prev) =>
      prev
        .map((c) => (c.id === target.id ? newCap1 : c))
        .concat(newCap2)
        .sort((a, b) => a.start - b.start)
    );
    setSelectedCaptionId(newCap2.id);
  };

  // Core Video Processing Function (supports File input and Drag-and-Drop)
  const handleProcessVideoFile = async (file: File) => {
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploadedFile(file);

    // 1. Instantly load local video into player (zero latency)
    const localBlobUrl = URL.createObjectURL(file);
    setVideoSrc(localBlobUrl);
    setVideoPath(null);
    setCaptions([]);
    setCurrentTime(0);
    handleSeek(0);

    // Switch mobile view to player so user immediately sees video
    setMobileTab("player");

    // 2. Start upload and Whisper transcription
    setIsTranscribing(true);
    setWhisperProgress("Uploading video & detecting audio...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await captionFetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.path) {
            setVideoPath(data.path);
          }
          if (data.width && data.height) {
            const detected = detectAspectRatio(data.width, data.height);
            setVideoResolution(detected);
            setAspectRatio(detected.aspectRatio);
          }
          setWhisperProgress("Transcribing audio with Whisper AI...");
          await triggerAutoTranscribe("tiny", "auto", data.path, file);
          return;
        }
      }
    } catch (err) {
      console.warn("Upload endpoint notice:", err);
    }

    // Direct Whisper transcription fallback using file
    try {
      setWhisperProgress("Transcribing audio with Whisper AI...");
      await triggerAutoTranscribe("tiny", "auto", null, file);
    } catch (txErr) {
      console.warn("Transcription fallback:", txErr);
    } finally {
      setIsTranscribing(false);
      setWhisperProgress("");
    }
  };

  // Upload handler for file input
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessVideoFile(file);
    }
  };

  // Load sample demo video
  const handleLoadDemo = () => {
    setVideoSrc("/samples/sample.mp4");
    setVideoPath(null);
    setUploadedFile(null);
    setVideoResolution({
      width: 1280,
      height: 720,
      aspectRatio: "16:9",
      label: "1280 × 720 (16:9)",
      category: "16:9 (Widescreen HD)",
      quality: "720p HD",
    });
    setAspectRatio("16:9");
    setCaptions(INITIAL_CAPTIONS);
    setTrimStart(0.0);
    setTrimEnd(23.6);
    handleSeek(0);
    setMobileTab("player");
  };

  // Load Sinhala demo captions (සිංහල උපසිරැසි)
  const handleLoadSinhalaDemo = () => {
    setVideoSrc("/samples/sample.mp4");
    setVideoPath(null);
    setUploadedFile(null);
    setVideoResolution({
      width: 1280,
      height: 720,
      aspectRatio: "16:9",
      label: "1280 × 720 (16:9)",
      category: "16:9 (Widescreen HD)",
      quality: "720p HD",
    });
    setAspectRatio("16:9");
    setCaptions(SINHALA_DEMO_CAPTIONS);
    const sinhalaPreset = STYLE_PRESETS.find((p) => p.id === "sinhala-modern") || STYLE_PRESETS[3];
    setStyle(sinhalaPreset);
    setTrimStart(0.0);
    setTrimEnd(23.6);
    handleSeek(0);
    setMobileTab("player");
  };

  // Convert captions to dynamic 1-line rapid voice sync frames
  const handleConvertToRapidOneLine = () => {
    const rapidCaptions = convertToSingleLineRapidFrames(captions, 4);
    setCaptions(rapidCaptions);
  };

  // Re-chunk and enforce max 2 lines across all captions
  const handleEnforceTwoLines = () => {
    const rechunked = rechunkCaptionsToTwoLinesMax(captions, 8);
    setCaptions(rechunked);
  };

  // Auto split a single caption if it exceeds 2 lines
  const handleAutoSplitCaption = (id: number | string) => {
    setCaptions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, text: formatToMaxTwoLines(c.text) };
        }
        return c;
      })
    );
  };

  // Apply Subtitle Translations
  const handleApplyTranslations = (
    translations: Array<{ id: number | string; translatedText: string }>,
    targetLang: string,
    autoSwitchSinhalaStyle: boolean
  ) => {
    const transMap = new Map();
    translations.forEach((t) => transMap.set(String(t.id), t.translatedText));

    setCaptions((prev) =>
      prev.map((c) => {
        const translated = transMap.get(String(c.id));
        if (!translated) return c;

        const rawWords = translated.trim().replace(/\n/g, " ").split(/\s+/).filter(Boolean);
        const totalChars = rawWords.reduce((sum: number, w: string) => sum + w.length, 0);
        const totalDur = Math.max(0.4, c.end - c.start);
        let accTime = c.start;

        const words = rawWords.map((w: string) => {
          const fraction = w.length / Math.max(1, totalChars);
          const wDur = Math.max(0.12, fraction * totalDur);
          const ws = accTime;
          const we = Math.min(c.end, ws + wDur);
          accTime = we;
          return {
            word: w,
            start: Math.round(ws * 100) / 100,
            end: Math.round(we * 100) / 100,
          };
        });

        return {
          ...c,
          text: translated,
          words: words,
        };
      })
    );

    if (targetLang === "si" && autoSwitchSinhalaStyle) {
      const sinhalaPreset = STYLE_PRESETS.find((p) => p.id === "sinhala-modern") || STYLE_PRESETS[3];
      setStyle(sinhalaPreset);
    }
  };

  // Auto transcribe with Whisper
  const triggerAutoTranscribe = async (
    modelName = "tiny",
    language = "auto",
    customPath: string | null = null,
    fileOverride: File | null = null
  ) => {
    setIsTranscribing(true);
    setWhisperProgress("Extracting speech & generating synchronized captions...");

    const fileToUse = fileOverride || uploadedFile;
    const pathToUse = customPath || videoPath;

    const formData = new FormData();
    formData.append("model_name", modelName);
    if (language !== "auto") {
      formData.append("language", language);
    }
    if (pathToUse) {
      formData.append("video_path", pathToUse);
    } else if (fileToUse) {
      formData.append("file", fileToUse);
    }

    try {
      const res = await captionFetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Transcription status: ${res.status}`);
      }

      const data = await res.json();
      if (data.width && data.height) {
        const detected = detectAspectRatio(data.width, data.height);
        setVideoResolution(detected);
        setAspectRatio(detected.aspectRatio);
      }
      if (data.segments && data.segments.length > 0) {
        setCaptions(data.segments);
        if (data.duration) {
          setDuration(data.duration);
          setTrimEnd(data.duration);
        }
      }
    } catch (e: any) {
      console.warn("Transcription note:", e.message);
    } finally {
      setIsTranscribing(false);
      setWhisperProgress("");
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleStepFrame(-1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleStepFrame(1);
      } else if (e.key === "j" || e.key === "J") {
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.key === "l" || e.key === "L") {
        handleSeek(Math.min(duration, currentTime + 5));
      } else if (e.key === "s" || e.key === "S") {
        handleSplitCaption(currentTime);
      } else if (e.code === "Delete" || e.code === "Backspace") {
        if (selectedCaptionId) {
          handleDeleteCaption(selectedCaptionId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentTime, duration, selectedCaptionId, trimEnd, trimStart]);

  const activeCaption = captions.find((c) => currentTime >= c.start && currentTime <= c.end);

  return (
    <div
      className={cn(
        "flex flex-col w-full bg-slate-950 text-slate-100 font-sans select-none",
        isFullTab
          ? "min-h-screen h-screen rounded-none border-none overflow-hidden"
          : "min-h-[780px] md:h-[850px] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
      )}
    >
      {/* Top Header */}
      <Header
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        videoResolution={videoResolution}
        onLoadDemo={handleLoadDemo}
        onLoadSinhalaDemo={handleLoadSinhalaDemo}
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenTranslate={() => setIsTranslateOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isTranscribing={isTranscribing}
        backendOnline={backendOnline}
        onBackToLanding={onBackToLanding}
      />

      {/* Hidden File Input for Video Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
        onChange={handleUploadFile}
        className="hidden"
      />

      {/* ── Main Workspace ───────────────────────────────── */}
      {/* Desktop: Side-by-Side 3 Pane Studio | Mobile: Tab-Switchable Views */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Video Player Section (Always visible on Desktop, or when mobileTab === 'player') */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden",
            mobileTab === "player" ? "flex" : "hidden md:flex"
          )}
        >
          <VideoPlayer
            videoRef={videoRef}
            videoSrc={videoSrc}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onSeek={handleSeek}
            onStepFrame={handleStepFrame}
            captions={captions}
            activeCaption={activeCaption}
            style={style}
            onUpdateStyle={setStyle}
            onEditCaptionText={handleUpdateCaptionText}
            aspectRatio={aspectRatio}
            videoResolution={videoResolution}
            videoFilters={videoFilters}
            playbackRate={playbackRate}
            onSetPlaybackRate={handleSetPlaybackRate}
            volume={volume}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onVolumeChange={handleVolumeChange}
            onDropVideo={handleProcessVideoFile}
            isTranscribing={isTranscribing}
            whisperProgress={whisperProgress}
          />
        </div>

        {/* Sidebar Section (Captions, Styles, Filters) */}
        <div
          className={cn(
            "w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/95 flex flex-col h-full shrink-0",
            mobileTab === "captions" || mobileTab === "styles" ? "flex" : "hidden md:flex"
          )}
        >
          <Sidebar
            captions={captions}
            selectedCaptionId={selectedCaptionId}
            onSelectCaption={setSelectedCaptionId}
            onUpdateCaptionText={handleUpdateCaptionText}
            onUpdateCaptionTime={handleUpdateCaptionTime}
            onAddCaption={handleAddCaption}
            onDeleteCaption={handleDeleteCaption}
            onSplitCaption={handleSplitCaption}
            onConvertToRapidOneLine={handleConvertToRapidOneLine}
            onEnforceTwoLines={handleEnforceTwoLines}
            onAutoSplitCaption={handleAutoSplitCaption}
            onOpenTranslate={() => setIsTranslateOpen(true)}
            onSeek={handleSeek}
            currentTime={currentTime}
            style={style}
            onUpdateStyle={setStyle}
            onSelectPreset={setStyle}
            videoFilters={videoFilters}
            onUpdateFilters={setVideoFilters}
            onAutoTranscribe={(model, lang) => triggerAutoTranscribe(model, lang)}
            isTranscribing={isTranscribing}
            whisperProgress={whisperProgress}
          />
        </div>

        {/* Timeline on Mobile when mobileTab === 'timeline' */}
        <div
          className={cn(
            "w-full flex-1 flex flex-col bg-slate-950 p-2 md:hidden",
            mobileTab === "timeline" ? "flex" : "hidden"
          )}
        >
          <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Timeline Editor</span>
          </div>
          <Timeline
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            captions={captions}
            selectedCaptionId={selectedCaptionId}
            onSelectCaption={setSelectedCaptionId}
            onUpdateCaptionTime={handleUpdateCaptionTime}
            onSplitCaption={handleSplitCaption}
            onDeleteCaption={handleDeleteCaption}
            onAddCaptionAtPlayhead={() =>
              handleAddCaption(currentTime, Math.min(duration, currentTime + 2.5), "New Caption")
            }
            trimStart={trimStart}
            trimEnd={trimEnd}
            onUpdateTrim={(start, end) => {
              setTrimStart(start);
              setTrimEnd(end);
            }}
          />
        </div>
      </div>

      {/* Bottom Timeline on Desktop */}
      <div className="hidden md:block">
        <Timeline
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          captions={captions}
          selectedCaptionId={selectedCaptionId}
          onSelectCaption={setSelectedCaptionId}
          onUpdateCaptionTime={handleUpdateCaptionTime}
          onSplitCaption={handleSplitCaption}
          onDeleteCaption={handleDeleteCaption}
          onAddCaptionAtPlayhead={() =>
            handleAddCaption(currentTime, Math.min(duration, currentTime + 2.5), "New Caption")
          }
          trimStart={trimStart}
          trimEnd={trimEnd}
          onUpdateTrim={(start, end) => {
            setTrimStart(start);
            setTrimEnd(end);
          }}
        />
      </div>

      {/* Mobile Navigation Tab Bar (Shown ONLY on mobile < 768px) */}
      <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around z-30 shrink-0">
        <button
          onClick={() => setMobileTab("player")}
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer",
            mobileTab === "player" ? "text-indigo-400 bg-slate-800" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Film className="w-4 h-4" />
          <span>Player</span>
        </button>

        <button
          onClick={() => setMobileTab("captions")}
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer",
            mobileTab === "captions" ? "text-indigo-400 bg-slate-800" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Type className="w-4 h-4" />
          <span>Captions ({captions.length})</span>
        </button>

        <button
          onClick={() => setMobileTab("styles")}
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer",
            mobileTab === "styles" ? "text-indigo-400 bg-slate-800" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Palette className="w-4 h-4" />
          <span>Styles</span>
        </button>

        <button
          onClick={() => setMobileTab("timeline")}
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer",
            mobileTab === "timeline" ? "text-indigo-400 bg-slate-800" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline</span>
        </button>
      </div>

      {/* Export & Render Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        captions={captions}
        style={style}
        trimStart={trimStart}
        trimEnd={trimEnd}
        aspectRatio={aspectRatio}
        videoResolution={videoResolution}
        videoSrc={videoSrc}
        videoPath={videoPath}
      />

      {/* Multilingual Subtitle Translation Modal */}
      <TranslationModal
        isOpen={isTranslateOpen}
        onClose={() => setIsTranslateOpen(false)}
        captions={captions}
        onApplyTranslations={handleApplyTranslations}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
