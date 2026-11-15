"use client";

import React, { useState } from "react";
import {
  X,
  Globe,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { captionFetch } from "./api";
import { CaptionSegment } from "./types";

const SUPPORTED_LANGUAGES = [
  { code: "si", name: "Sinhala (සිංහල)", flag: "🇱🇰", popular: true },
  { code: "en", name: "English", flag: "🇺🇸", popular: true },
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸", popular: true },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵", popular: true },
  { code: "zh", name: "Chinese (中文)", flag: "🇨🇳" },
  { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳", popular: true },
  { code: "ta", name: "Tamil (தமிழ்)", flag: "🇮🇳" },
  { code: "ar", name: "Arabic (العربية)", flag: "🇸🇦" },
  { code: "ru", name: "Russian (Русский)", flag: "🇷🇺" },
  { code: "pt", name: "Portuguese (Português)", flag: "🇵🇹" },
  { code: "it", name: "Italian (Italiano)", flag: "🇮🇹" },
  { code: "ko", name: "Korean (한국어)", flag: "🇰🇷" },
];

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  captions: CaptionSegment[];
  onApplyTranslations: (
    translations: Array<{ id: number | string; translatedText: string }>,
    targetLang: string,
    autoSwitchSinhalaStyle: boolean
  ) => void;
}

export function TranslationModal({
  isOpen,
  onClose,
  captions,
  onApplyTranslations,
}: TranslationModalProps) {
  const [targetLang, setTargetLang] = useState("si");
  const [autoSwitchSinhalaStyle, setAutoSwitchSinhalaStyle] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    if (!captions || captions.length === 0) {
      setErrorMsg("No captions available to translate.");
      return;
    }

    setIsTranslating(true);
    setErrorMsg(null);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
    setProgressMsg(`Translating ${captions.length} subtitle frames into ${langObj?.name || targetLang}...`);

    try {
      const payload = {
        targetLanguage: targetLang,
        sourceLanguage: "auto",
        captions: captions.map((c) => ({
          id: c.id,
          text: c.text,
        })),
      };

      const res = await captionFetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Translation request failed");
      }

      const data = await res.json();
      if (data.translations && data.translations.length > 0) {
        onApplyTranslations(data.translations, targetLang, autoSwitchSinhalaStyle);
        onClose();
      } else {
        throw new Error("No translations received.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Translation failed");
    } finally {
      setIsTranslating(false);
      setProgressMsg("");
    }
  };

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Translate Subtitles</h3>
              <p className="text-[11px] text-slate-400">
                Preserve voice sync while converting to Sinhala, English, or 14+ languages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Target Language
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = targetLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setTargetLang(lang.code)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sinhala-specific Auto-Typography Option */}
          {targetLang === "si" && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="sinhala-style-opt"
                  checked={autoSwitchSinhalaStyle}
                  onChange={(e) => setAutoSwitchSinhalaStyle(e.target.checked)}
                  className="mt-0.5 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="sinhala-style-opt" className="text-xs text-amber-200 cursor-pointer">
                  <span className="font-semibold block text-amber-300">
                    Auto-switch to Sinhala Typography
                  </span>
                  Applies <span className="font-mono">Noto Sans Sinhala / Iskoola Pota</span> font and Sinhala
                  Golden Heritage styling for crisp rendering.
                </label>
              </div>
            </div>
          )}

          {/* Current Frame Preview Info */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Frames to translate</span>
              <span className="font-mono text-indigo-400 font-semibold">{captions.length} Frames</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Selected Target</span>
              <span className="text-slate-200 font-medium">
                {selectedLang?.flag} {selectedLang?.name}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
              * Word timings and millisecond start/end timestamps will be automatically recalculated to match
              voice cadence.
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isTranslating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{progressMsg || "Translating subtitles..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Translate to {selectedLang?.name || targetLang}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
