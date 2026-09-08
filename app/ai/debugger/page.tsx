"use client";

import { useState, useCallback } from "react";
import { Bug, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { getToolBySlug } from "@/lib/tools/registry";
import { CopyButton } from "@/components/tools/CopyButton";
import { recordToolUsage } from "@/lib/analytics/tracker";

const tool = getToolBySlug("debugger")!;

const LANGUAGES = [
  "Auto-detect", "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#",
  "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "Bash", "Other",
];

export default function AIDebuggerTool() {
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState("Auto-detect");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDebug = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalysis("");

    try {
      const response = await fetch("/api/ai/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: language === "Auto-detect" ? "auto" : language.toLowerCase(),
          errorMessage: errorMsg,
          context,
        }),
      });

      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "AI service error."); return; }
      setAnalysis(data.analysis ?? "");
      recordToolUsage("debugger", "AI Debugger", `Analyzed ${language} bug`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [code, errorMsg, context, language]);

  const handleClear = useCallback(() => {
    setCode(""); setErrorMsg(""); setContext(""); setAnalysis(""); setError(null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <div className="flex items-center gap-2">
          <label htmlFor="debug-lang-select" className="text-sm text-muted">Language:</label>
          <select
            id="debug-lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <ToolActions>
          <Button
            id="btn-debug"
            variant="primary"
            size="sm"
            leftIcon={<Bug className="h-3.5 w-3.5" />}
            onClick={handleDebug}
            isLoading={isLoading}
            disabled={!code.trim()}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isLoading ? "Analyzing..." : "Debug Code"}
          </Button>
          <Button id="btn-clear" variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClear}>Clear</Button>
        </ToolActions>

        {error && <StatusMessage type="error" message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <ToolPanel label="Code with Bug">
              <Textarea
                id="debug-code-input"
                aria-label="Code to debug"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste the code that has a bug..."
                mono
                className="min-h-[300px] text-xs"
              />
            </ToolPanel>
            <ToolPanel label="Error Message (optional)">
              <Textarea
                id="debug-error-input"
                aria-label="Error message"
                value={errorMsg}
                onChange={(e) => setErrorMsg(e.target.value)}
                placeholder="Paste the error message or stack trace here..."
                mono
                className="min-h-[120px] text-xs"
              />
            </ToolPanel>
            <ToolPanel label="Additional Context (optional)">
              <Textarea
                id="debug-context-input"
                aria-label="Additional context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What were you trying to do? Any relevant environment details?"
                className="min-h-[80px] text-sm"
              />
            </ToolPanel>
          </div>

          <ToolPanel label="AI Analysis" actions={analysis ? <CopyButton text={analysis} size="sm" /> : undefined}>
            {isLoading ? (
              <div className="flex flex-col gap-3 min-h-[400px] justify-center items-center text-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                <span className="text-sm animate-pulse-gentle">Analyzing your code...</span>
              </div>
            ) : analysis ? (
              <div className="prose-tool text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[400px]">
                {analysis}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-muted text-sm text-center gap-2 px-4">
                <Bug className="h-8 w-8 text-rose-400 mb-1" />
                <p>Paste your buggy code and click <strong>Debug Code</strong>.</p>
                <p className="text-xs">Adding the error message gives much better results.</p>
              </div>
            )}
          </ToolPanel>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          <strong>AI Disclaimer:</strong> Debugging suggestions are AI-generated and should always be verified by testing. 
          AI cannot guarantee the suggested fix is correct in all cases.
        </div>
      </ToolLayout>
    </div>
  );
}
