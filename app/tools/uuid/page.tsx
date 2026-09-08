"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { generateUUIDs } from "@/lib/tools/uuid";
import { getToolBySlug } from "@/lib/tools/registry";
import { copyToClipboard } from "@/lib/utils";

const tool = getToolBySlug("uuid")!;

export default function UUIDTool() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: "error" | "success" | null; message: string }>({ type: null, message: "" });
  const [allCopied, setAllCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const result = generateUUIDs(count);
    if (result.success) {
      setUuids(result.uuids);
      setStatus({ type: "success", message: `Generated ${result.uuids.length} UUID${result.uuids.length > 1 ? "s" : ""}.` });
    } else {
      setStatus({ type: "error", message: result.error ?? "Generation failed." });
    }
  }, [count]);

  const handleCopyAll = useCallback(async () => {
    if (!uuids.length) return;
    await copyToClipboard(uuids.join("\n"));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  }, [uuids]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <ToolActions>
          <div className="flex items-center gap-2">
            <label htmlFor="uuid-count" className="text-sm text-muted whitespace-nowrap">Count:</label>
            <input
              id="uuid-count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-20 h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Number of UUIDs to generate"
            />
          </div>
          <Button id="btn-generate" variant="primary" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={handleGenerate}>
            Generate
          </Button>
          {uuids.length > 0 && (
            <Button
              id="btn-copy-all"
              variant={allCopied ? "success" : "secondary"}
              size="sm"
              leftIcon={<Clipboard className="h-3.5 w-3.5" />}
              onClick={handleCopyAll}
            >
              {allCopied ? "Copied!" : "Copy All"}
            </Button>
          )}
        </ToolActions>

        {status.type && <StatusMessage type={status.type} message={status.message} />}

        {uuids.length > 0 && (
          <ToolPanel label={`Generated UUIDs (${uuids.length})`}>
            <div className="flex flex-col gap-2">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated px-3 py-2 group"
                >
                  <code className="font-mono text-sm text-foreground tracking-wide select-all flex-1">
                    {uuid}
                  </code>
                  <CopyButton text={uuid} size="sm" label="Copy" />
                </div>
              ))}
            </div>
          </ToolPanel>
        )}

        <div className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-xs text-muted">
          <strong className="text-foreground">UUID v4</strong> uses cryptographically random values (Web Crypto API).
          These are suitable for database primary keys, session IDs, and any use case requiring unique identifiers.
        </div>
      </ToolLayout>
    </div>
  );
}
