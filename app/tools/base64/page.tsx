"use client";

import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { encodeBase64, decodeBase64 } from "@/lib/tools/base64";
import { getToolBySlug } from "@/lib/tools/registry";
import { recordToolUsage } from "@/lib/analytics/tracker";

const tool = getToolBySlug("base64")!;

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<{
    type: "error" | "success" | null;
    message: string;
  }>({ type: null, message: "" });
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleEncode = useCallback(() => {
    setMode("encode");
    const result = encodeBase64(input);
    if (result.success) {
      setOutput(result.output);
      setStatus({ type: "success", message: "Encoded to Base64 successfully." });
      recordToolUsage("base64", "Base64 Encoder/Decoder", "Encoded text to Base64");
    } else {
      setOutput("");
      setStatus({ type: "error", message: result.error ?? "Encoding failed." });
    }
  }, [input]);

  const handleDecode = useCallback(() => {
    setMode("decode");
    const result = decodeBase64(input);
    if (result.success) {
      setOutput(result.output);
      setStatus({ type: "success", message: "Decoded from Base64 successfully." });
      recordToolUsage("base64", "Base64 Encoder/Decoder", "Decoded Base64 string");
    } else {
      setOutput("");
      setStatus({ type: "error", message: result.error ?? "Decoding failed." });
    }
  }, [input]);

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output);
      setOutput("");
      setStatus({ type: null, message: "" });
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setStatus({ type: null, message: "" });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <ToolActions>
          <Button id="btn-encode" variant="primary" size="sm" onClick={handleEncode} disabled={!input.trim()}>
            Encode to Base64
          </Button>
          <Button id="btn-decode" variant="secondary" size="sm" onClick={handleDecode} disabled={!input.trim()}>
            Decode from Base64
          </Button>
          {output && (
            <Button id="btn-swap" variant="ghost" size="sm" onClick={handleSwap}>
              ↕ Swap
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
        </ToolActions>

        {status.type && <StatusMessage type={status.type} message={status.message} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ToolPanel label="Input" actions={<CopyButton text={input} size="sm" label="Copy" />}>
            <Textarea
              id="base64-input"
              aria-label="Input text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode, or Base64 to decode..."
              mono
              className="min-h-[320px] text-xs"
            />
          </ToolPanel>
          <ToolPanel
            label={mode === "encode" ? "Base64 Output" : "Decoded Output"}
            actions={output ? <CopyButton text={output} size="sm" /> : undefined}
          >
            <Textarea
              id="base64-output"
              aria-label="Output"
              value={output}
              readOnly
              placeholder="Output will appear here..."
              mono
              className="min-h-[320px] text-xs bg-surface-elevated"
            />
          </ToolPanel>
        </div>

        <div className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-xs text-muted">
          <strong className="text-foreground">Note:</strong> This tool handles Unicode characters correctly using UTF-8 encoding. 
          Standard Base64 uses only A–Z, a–z, 0–9, +, /, and = padding characters.
        </div>
      </ToolLayout>
    </div>
  );
}
