"use client";

import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { encodeURL, decodeURL } from "@/lib/tools/url";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("url-encoder")!;

export default function URLEncoderTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success" | null; message: string }>({ type: null, message: "" });

  const handleEncode = useCallback(() => {
    const result = encodeURL(input);
    if (result.success) { setOutput(result.output); setStatus({ type: "success", message: "Encoded successfully." }); }
    else { setOutput(""); setStatus({ type: "error", message: result.error ?? "Encoding failed." }); }
  }, [input]);

  const handleDecode = useCallback(() => {
    const result = decodeURL(input);
    if (result.success) { setOutput(result.output); setStatus({ type: "success", message: "Decoded successfully." }); }
    else { setOutput(""); setStatus({ type: "error", message: result.error ?? "Decoding failed." }); }
  }, [input]);

  const handleClear = useCallback(() => { setInput(""); setOutput(""); setStatus({ type: null, message: "" }); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <ToolActions>
          <Button id="btn-encode" variant="primary" size="sm" onClick={handleEncode} disabled={!input.trim()}>Encode URL</Button>
          <Button id="btn-decode" variant="secondary" size="sm" onClick={handleDecode} disabled={!input.trim()}>Decode URL</Button>
          <Button id="btn-clear" variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClear} disabled={!input && !output}>Clear</Button>
        </ToolActions>
        {status.type && <StatusMessage type={status.type} message={status.message} />}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ToolPanel label="Input" actions={<CopyButton text={input} size="sm" />}>
            <Textarea id="url-input" aria-label="URL input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter a URL or URL component to encode/decode..." mono className="min-h-[280px] text-xs" />
          </ToolPanel>
          <ToolPanel label="Output" actions={output ? <CopyButton text={output} size="sm" /> : undefined}>
            <Textarea id="url-output" aria-label="URL output" value={output} readOnly placeholder="Output will appear here..." mono className="min-h-[280px] text-xs bg-surface-elevated" />
          </ToolPanel>
        </div>
      </ToolLayout>
    </div>
  );
}
