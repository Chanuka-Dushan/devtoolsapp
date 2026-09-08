"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { decodeJWT } from "@/lib/tools/jwt";
import { getToolBySlug } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/Badge";

const tool = getToolBySlug("jwt-decoder")!;

function JsonDisplay({ data }: { data: unknown }) {
  return (
    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function JWTDecoderTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof decodeJWT> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = useCallback(() => {
    const r = decodeJWT(input);
    setResult(r);
    if (!r.success) {
      setError(r.error ?? "Failed to decode JWT.");
    } else {
      setError(null);
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        {/* Security warning */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Security Notice:</strong> This tool <em>decodes</em> JWT tokens (base64url decoding only).
            It does <strong>NOT</strong> verify the cryptographic signature.
            A decoded token is NOT a verified or trusted token. Never use decoded claims for authorization.
          </span>
        </div>

        <ToolActions>
          <Button id="btn-decode" variant="primary" size="sm" onClick={handleDecode} disabled={!input.trim()}>
            Decode JWT
          </Button>
          <Button id="btn-clear" variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClear} disabled={!input && !result}>
            Clear
          </Button>
        </ToolActions>

        {error && <StatusMessage type="error" message={error} />}

        <ToolPanel label="JWT Token" actions={<CopyButton text={input} size="sm" />}>
          <Textarea
            id="jwt-input"
            aria-label="JWT token input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here... (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            mono
            className="min-h-[120px] text-xs"
          />
        </ToolPanel>

        {result?.success && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Header */}
            <ToolPanel label="Header" actions={<CopyButton text={JSON.stringify(result.header, null, 2)} size="sm" />}>
              <JsonDisplay data={result.header} />
            </ToolPanel>

            {/* Payload */}
            <ToolPanel
              label="Payload"
              actions={
                <div className="flex items-center gap-2">
                  {result.isExpired !== undefined && (
                    <Badge variant={result.isExpired ? "error" : "success"}>
                      {result.isExpired ? "Expired" : "Not expired"}
                    </Badge>
                  )}
                  <CopyButton text={JSON.stringify(result.payload, null, 2)} size="sm" />
                </div>
              }
            >
              <JsonDisplay data={result.payload} />
              {result.expiresAt && (
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted">
                  <span className="font-medium text-foreground">Expires:</span>{" "}
                  {result.expiresAt.toLocaleString()}
                </div>
              )}
            </ToolPanel>

            {/* Signature */}
            <ToolPanel label="Signature">
              <code className="text-xs font-mono text-muted break-all">{result.signature}</code>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                ⚠ Signature displayed for reference only — NOT verified.
              </p>
            </ToolPanel>
          </div>
        )}
      </ToolLayout>
    </div>
  );
}
