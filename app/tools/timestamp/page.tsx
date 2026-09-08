"use client";

import { useState, useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { unixToDate, dateToUnix, getCurrentTimestamp } from "@/lib/tools/timestamp";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("timestamp")!;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <code className="text-xs font-mono text-foreground text-right break-all">{value}</code>
        <CopyButton text={value} size="sm" label="Copy" />
      </div>
    </div>
  );
}

export default function TimestampTool() {
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [tsResult, setTsResult] = useState<ReturnType<typeof unixToDate> | null>(null);
  const [dateResult, setDateResult] = useState<ReturnType<typeof dateToUnix> | null>(null);
  const [now, setNow] = useState(getCurrentTimestamp());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(getCurrentTimestamp()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConvertTimestamp = useCallback(() => {
    setTsResult(unixToDate(tsInput));
  }, [tsInput]);

  const handleConvertDate = useCallback(() => {
    setDateResult(dateToUnix(dateInput));
  }, [dateInput]);

  const handleUseNow = useCallback(() => {
    setTsInput(String(now.unix));
    setTsResult(unixToDate(now.unix));
  }, [now.unix]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        {/* Live now panel */}
        <ToolPanel label="Current Time" actions={<Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={handleUseNow}>Use now</Button>}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Unix (seconds)", value: String(now.unix) },
              { label: "Unix (ms)", value: String(now.unixMs) },
              { label: "ISO 8601", value: now.iso },
              { label: "UTC", value: now.utc },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">{label}</span>
                <div className="flex items-center gap-1">
                  <code className="text-xs font-mono text-foreground truncate flex-1">{value}</code>
                  <CopyButton text={value} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </ToolPanel>

        {/* Unix → Date */}
        <ToolPanel label="Unix Timestamp → Date">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="ts-input"
                aria-label="Unix timestamp"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                placeholder="e.g. 1700000000 or 1700000000000"
                mono
                className="flex-1"
              />
              <Button id="btn-convert-ts" variant="primary" size="md" onClick={handleConvertTimestamp} disabled={!tsInput.trim()}>
                Convert
              </Button>
            </div>
            {tsResult && !tsResult.success && <StatusMessage type="error" message={tsResult.error ?? "Conversion failed."} />}
            {tsResult?.success && tsResult.info && (
              <div className="rounded-lg border border-border bg-surface-elevated px-4 py-1">
                <InfoRow label="Local" value={tsResult.info.local} />
                <InfoRow label="UTC" value={tsResult.info.utc} />
                <InfoRow label="ISO 8601" value={tsResult.info.iso} />
                <InfoRow label="Relative" value={tsResult.info.relative} />
              </div>
            )}
          </div>
        </ToolPanel>

        {/* Date → Unix */}
        <ToolPanel label="Date → Unix Timestamp">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="date-input"
                aria-label="Date string"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder='e.g. "2024-01-15", "January 15 2024", or ISO 8601'
                className="flex-1"
              />
              <Button id="btn-convert-date" variant="primary" size="md" onClick={handleConvertDate} disabled={!dateInput.trim()}>
                Convert
              </Button>
            </div>
            {dateResult && !dateResult.success && <StatusMessage type="error" message={dateResult.error ?? "Conversion failed."} />}
            {dateResult?.success && dateResult.info && (
              <div className="rounded-lg border border-border bg-surface-elevated px-4 py-1">
                <InfoRow label="Unix (seconds)" value={String(dateResult.info.unix)} />
                <InfoRow label="Unix (ms)" value={String(dateResult.info.unixMs)} />
                <InfoRow label="ISO 8601" value={dateResult.info.iso} />
                <InfoRow label="Relative" value={dateResult.info.relative} />
              </div>
            )}
          </div>
        </ToolPanel>
      </ToolLayout>
    </div>
  );
}
