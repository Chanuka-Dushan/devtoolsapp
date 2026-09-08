"use client";

import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { testRegex, type RegexFlag } from "@/lib/tools/regex";
import { getToolBySlug } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/Badge";

const tool = getToolBySlug("regex-tester")!;

const FLAGS: { flag: RegexFlag; label: string; description: string }[] = [
  { flag: "g", label: "g", description: "Global — find all matches" },
  { flag: "i", label: "i", description: "Case insensitive" },
  { flag: "m", label: "m", description: "Multiline — ^ and $ match line boundaries" },
  { flag: "s", label: "s", description: "Dotall — . matches newlines" },
  { flag: "u", label: "u", description: "Unicode — treat pattern as Unicode" },
];

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [testInput, setTestInput] = useState("");
  const [flags, setFlags] = useState<Set<RegexFlag>>(new Set(["g"]));
  const [result, setResult] = useState<ReturnType<typeof testRegex> | null>(null);

  const toggleFlag = useCallback((flag: RegexFlag) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }, []);

  const handleTest = useCallback(() => {
    const r = testRegex(pattern, testInput, [...flags]);
    setResult(r);
  }, [pattern, testInput, flags]);

  const handleClear = useCallback(() => {
    setPattern("");
    setTestInput("");
    setFlags(new Set(["g"]));
    setResult(null);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <div className="grid grid-cols-1 gap-4">
          {/* Pattern input */}
          <ToolPanel label="Pattern">
            <div className="space-y-3">
              <Input
                id="regex-pattern"
                aria-label="Regular expression pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern, e.g. \b\w+@\w+\.\w+\b"
                mono
                leftElement={<span className="text-muted font-mono">/</span>}
                rightElement={<span className="text-muted font-mono">/{[...flags].join("")}</span>}
              />
              {/* Flags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">Flags:</span>
                {FLAGS.map(({ flag, label, description }) => (
                  <button
                    key={flag}
                    onClick={() => toggleFlag(flag)}
                    title={description}
                    aria-pressed={flags.has(flag)}
                    className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors border ${
                      flags.has(flag)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-surface border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </ToolPanel>

          {/* Test string */}
          <ToolPanel label="Test String">
            <Textarea
              id="regex-test-input"
              aria-label="Test string"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter the text to test your pattern against..."
              className="min-h-[200px] text-sm"
            />
          </ToolPanel>

          <ToolActions>
            <Button
              id="btn-test"
              variant="primary"
              size="sm"
              onClick={handleTest}
              disabled={!pattern}
            >
              Test Regex
            </Button>
            <Button
              id="btn-clear"
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={handleClear}
            >
              Clear
            </Button>
          </ToolActions>

          {/* Results */}
          {result && (
            <>
              {!result.success ? (
                <StatusMessage type="error" message={result.error ?? "Invalid regex."} />
              ) : (
                <ToolPanel
                  label="Matches"
                  actions={
                    <Badge variant={result.matchCount > 0 ? "success" : "default"}>
                      {result.matchCount} match{result.matchCount !== 1 ? "es" : ""}
                    </Badge>
                  }
                >
                  {result.matchCount === 0 ? (
                    <p className="text-sm text-muted">No matches found.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {result.matches.map((match, i) => (
                        <div key={i} className="rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-xs font-mono">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-muted">Match {i + 1}</span>
                            <span className="text-muted">at index {match.index}</span>
                          </div>
                          <div className="text-foreground font-semibold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded inline-block">
                            {match.fullMatch || <em className="font-normal opacity-60">(empty match)</em>}
                          </div>
                          {(match.captureGroups?.filter(Boolean).length ?? 0) > 0 && (
                            <div className="mt-1.5 text-muted">
                              Groups: {match.captureGroups?.map((g, gi) => (
                                <span key={gi} className="ml-1 text-foreground">[{gi + 1}] {g ?? "undefined"}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ToolPanel>
              )}
            </>
          )}
        </div>
      </ToolLayout>
    </div>
  );
}
