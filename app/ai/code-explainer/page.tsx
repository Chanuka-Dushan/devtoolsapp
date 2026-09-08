"use client";

import { useState, useCallback } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { getToolBySlug } from "@/lib/tools/registry";
import { CopyButton } from "@/components/tools/CopyButton";
import { recordToolUsage } from "@/lib/analytics/tracker";

const tool = getToolBySlug("code-explainer")!;

const LANGUAGES = [
  "Auto-detect", "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#",
  "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "Bash", "HTML", "CSS", "Other",
];

const STYLES = [
  { value: "detailed", label: "Detailed" },
  { value: "concise", label: "Concise" },
  { value: "beginner", label: "Beginner-friendly" },
];

export default function CodeExplainerTool() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Auto-detect");
  const [style, setStyle] = useState("detailed");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    setExplanation("");

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: language === "Auto-detect" ? "auto" : language.toLowerCase(),
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "AI service error. Please try again.");
        return;
      }

      setExplanation(data.explanation ?? "");
      recordToolUsage("code-explainer", "AI Code Explainer", `Explained ${language} snippet`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [code, language, style]);

  const handleClear = useCallback(() => {
    setCode("");
    setExplanation("");
    setError(null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        {/* Options */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="lang-select" className="text-sm text-muted">Language:</label>
            <select
              id="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                aria-pressed={style === s.value}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  style === s.value
                    ? "bg-violet-600 text-white"
                    : "bg-surface-elevated text-muted hover:text-foreground border border-border"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <ToolActions>
          <Button
            id="btn-explain"
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={handleExplain}
            isLoading={isLoading}
            disabled={!code.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isLoading ? "Explaining..." : "Explain Code"}
          </Button>
          <Button
            id="btn-clear"
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={handleClear}
            disabled={!code && !explanation}
          >
            Clear
          </Button>
        </ToolActions>

        {error && <StatusMessage type="error" message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ToolPanel label="Your Code">
            <Textarea
              id="code-input"
              aria-label="Code to explain"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Paste any code here...\n\nExample:\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}`}
              mono
              className="min-h-[400px] text-xs"
            />
          </ToolPanel>

          <ToolPanel
            label="AI Explanation"
            actions={explanation ? <CopyButton text={explanation} size="sm" /> : undefined}
          >
            {isLoading ? (
              <div className="flex flex-col gap-3 min-h-[400px] justify-center items-center text-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                <span className="text-sm animate-pulse-gentle">AI is analyzing your code...</span>
              </div>
            ) : explanation ? (
              <div className="prose-tool text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[400px]">
                {explanation}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-muted text-sm text-center gap-2 px-4">
                <Sparkles className="h-8 w-8 text-violet-400 mb-1" aria-hidden="true" />
                <p>Paste your code on the left and click <strong>Explain Code</strong>.</p>
                <p className="text-xs">Supports all major programming languages.</p>
              </div>
            )}
          </ToolPanel>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          <strong>AI Disclaimer:</strong> Explanations are AI-generated and may contain inaccuracies. 
          Always verify important code behavior by testing it directly.
        </div>
      </ToolLayout>
    </div>
  );
}
