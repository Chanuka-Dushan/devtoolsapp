"use client";

import { useState, useCallback } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { formatJSON, validateJSON, minifyJSON } from "@/lib/tools/json";
import { downloadFile } from "@/lib/utils";
import { getToolBySlug } from "@/lib/tools/registry";
import { recordToolUsage } from "@/lib/analytics/tracker";

const tool = getToolBySlug("json-formatter")!;

export default function JSONFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<{
    type: "error" | "success" | "warning" | null;
    message: string;
  }>({ type: null, message: "" });
  const [indent, setIndent] = useState<2 | 4>(2);

  const handleFormat = useCallback(() => {
    const result = formatJSON(input, indent);
    if (result.success) {
      setOutput(result.output);
      setStatus({ type: "success", message: "JSON formatted successfully." });
      recordToolUsage("json-formatter", "JSON Formatter", "Formatted JSON payload");
    } else {
      setOutput("");
      setStatus({ type: "error", message: result.error ?? "Invalid JSON." });
    }
  }, [input, indent]);

  const handleValidate = useCallback(() => {
    const result = validateJSON(input);
    if (result.success) {
      setStatus({ type: "success", message: "✓ Valid JSON — no syntax errors found." });
    } else {
      setStatus({ type: "error", message: result.error ?? "Invalid JSON." });
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    const result = minifyJSON(input);
    if (result.success) {
      setOutput(result.output);
      setStatus({ type: "success", message: "JSON minified successfully." });
    } else {
      setOutput("");
      setStatus({ type: "error", message: result.error ?? "Invalid JSON." });
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setStatus({ type: null, message: "" });
  }, []);

  const handleDownload = useCallback(() => {
    if (output) {
      downloadFile(output, "formatted.json", "application/json");
    }
  }, [output]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        {/* Actions bar */}
        <ToolActions>
          <Button
            id="btn-format"
            variant="primary"
            size="sm"
            onClick={handleFormat}
            disabled={!input.trim()}
          >
            Format
          </Button>
          <Button
            id="btn-validate"
            variant="secondary"
            size="sm"
            onClick={handleValidate}
            disabled={!input.trim()}
          >
            Validate
          </Button>
          <Button
            id="btn-minify"
            variant="secondary"
            size="sm"
            onClick={handleMinify}
            disabled={!input.trim()}
          >
            Minify
          </Button>

          {/* Indent selector */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-muted">Indent:</span>
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  indent === n
                    ? "bg-brand-600 text-white"
                    : "bg-surface-elevated text-muted hover:text-foreground"
                }`}
                aria-pressed={indent === n}
                aria-label={`${n} spaces indentation`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {output && <CopyButton text={output} label="Copy output" />}
            {output && (
              <Button
                id="btn-download"
                variant="ghost"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={handleDownload}
              >
                Download
              </Button>
            )}
            <Button
              id="btn-clear"
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={handleClear}
              disabled={!input && !output}
            >
              Clear
            </Button>
          </div>
        </ToolActions>

        {/* Status message */}
        {status.type && (
          <StatusMessage type={status.type} message={status.message} />
        )}

        {/* Editor panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ToolPanel
            label="Input JSON"
            actions={<CopyButton text={input} size="sm" label="Copy input" />}
          >
            <Textarea
              id="json-input"
              aria-label="JSON input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your JSON here...\n\nFor example:\n{\n  "name": "Alice",\n  "age": 30\n}`}
              mono
              className="min-h-[400px] text-xs"
            />
          </ToolPanel>

          <ToolPanel
            label="Output"
            actions={
              output ? (
                <CopyButton text={output} size="sm" label="Copy output" />
              ) : undefined
            }
          >
            <Textarea
              id="json-output"
              aria-label="Formatted JSON output"
              value={output}
              readOnly
              placeholder="Formatted output will appear here..."
              mono
              className="min-h-[400px] text-xs bg-surface-elevated"
            />
          </ToolPanel>
        </div>

        {/* Info card */}
        <div className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-xs text-muted">
          <strong className="text-foreground">Tips:</strong> Press{" "}
          <kbd className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">Format</kbd>{" "}
          to pretty-print JSON with indentation.{" "}
          <kbd className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">Validate</kbd>{" "}
          to check for syntax errors.{" "}
          <kbd className="px-1 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">Minify</kbd>{" "}
          to remove all whitespace for production payloads.
        </div>
      </ToolLayout>
    </div>
  );
}
