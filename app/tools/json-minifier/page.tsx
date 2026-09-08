"use client";

import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { minifyJSON } from "@/lib/tools/json";
import { downloadFile } from "@/lib/utils";
import { getToolBySlug } from "@/lib/tools/registry";
import { Download } from "lucide-react";

const tool = getToolBySlug("json-minifier")!;

export default function JSONMinifierTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<{
    type: "error" | "success" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleMinify = useCallback(() => {
    const result = minifyJSON(input);
    if (result.success) {
      setOutput(result.output);
      const savings = input.length - result.output.length;
      const pct = ((savings / input.length) * 100).toFixed(1);
      setStatus({
        type: "success",
        message: `Minified! Saved ${savings} characters (${pct}% reduction).`,
      });
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <ToolActions>
          <Button
            id="btn-minify"
            variant="primary"
            size="sm"
            onClick={handleMinify}
            disabled={!input.trim()}
          >
            Minify
          </Button>
          {output && (
            <>
              <CopyButton text={output} label="Copy output" />
              <Button
                id="btn-download"
                variant="ghost"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={() => downloadFile(output, "minified.json", "application/json")}
              >
                Download
              </Button>
            </>
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
        </ToolActions>

        {status.type && (
          <StatusMessage type={status.type} message={status.message} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ToolPanel label="Input JSON">
            <Textarea
              id="json-input"
              aria-label="JSON input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste formatted JSON here to minify..."
              mono
              className="min-h-[400px] text-xs"
            />
          </ToolPanel>
          <ToolPanel label="Minified Output" actions={output ? <CopyButton text={output} size="sm" /> : undefined}>
            <Textarea
              id="json-output"
              aria-label="Minified JSON output"
              value={output}
              readOnly
              placeholder="Minified JSON will appear here..."
              mono
              className="min-h-[400px] text-xs bg-surface-elevated"
            />
          </ToolPanel>
        </div>
      </ToolLayout>
    </div>
  );
}
