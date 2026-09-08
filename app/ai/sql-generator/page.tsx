"use client";

import { useState, useCallback } from "react";
import { Database, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { getToolBySlug } from "@/lib/tools/registry";
import { CopyButton } from "@/components/tools/CopyButton";
import { recordToolUsage } from "@/lib/analytics/tracker";

const tool = getToolBySlug("sql-generator")!;

const DIALECTS = ["PostgreSQL", "MySQL", "SQLite", "SQL Server", "Oracle", "Generic SQL"];

export default function SQLGeneratorTool() {
  const [request, setRequest] = useState("");
  const [schema, setSchema] = useState("");
  const [dialect, setDialect] = useState("PostgreSQL");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!request.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await fetch("/api/ai/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request, dialect, schemaContext: schema }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "AI service error."); return; }
      setResult(data.result ?? "");
      recordToolUsage("sql-generator", "AI SQL Generator", `Generated ${dialect} query`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [request, schema, dialect]);

  const handleClear = useCallback(() => {
    setRequest(""); setSchema(""); setResult(""); setError(null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        {/* Safety warning */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Safety Warning:</strong> This tool generates SQL for reference. Always review generated SQL before executing it.
            Never run AI-generated SQL directly on a production database. The platform does NOT execute SQL.
          </span>
        </div>

        {/* Dialect selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">SQL Dialect:</span>
          <div className="flex flex-wrap gap-1">
            {DIALECTS.map((d) => (
              <button
                key={d}
                onClick={() => setDialect(d)}
                aria-pressed={dialect === d}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  dialect === d
                    ? "bg-cyan-600 text-white"
                    : "bg-surface-elevated text-muted hover:text-foreground border border-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <ToolActions>
          <Button
            id="btn-generate-sql"
            variant="primary"
            size="sm"
            leftIcon={<Database className="h-3.5 w-3.5" />}
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={!request.trim()}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isLoading ? "Generating..." : "Generate SQL"}
          </Button>
          <Button id="btn-clear" variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClear}>Clear</Button>
        </ToolActions>

        {error && <StatusMessage type="error" message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <ToolPanel label="What do you need? (in plain English)">
              <Textarea
                id="sql-request-input"
                aria-label="SQL request in plain English"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder={'Example: "Get all users who signed up in the last 30 days and have placed at least one order"'}
                className="min-h-[180px] text-sm"
              />
            </ToolPanel>
            <ToolPanel label="Database Schema / Context (optional)">
              <Textarea
                id="sql-schema-input"
                aria-label="Database schema context"
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder={"Describe your tables and columns:\n\nusers (id, email, name, created_at)\norders (id, user_id, total, created_at)\norder_items (id, order_id, product_id, quantity)"}
                mono
                className="min-h-[200px] text-xs"
              />
            </ToolPanel>
          </div>

          <ToolPanel
            label={`Generated ${dialect} SQL`}
            actions={result ? <CopyButton text={result} size="sm" /> : undefined}
          >
            {isLoading ? (
              <div className="flex flex-col gap-3 min-h-[400px] justify-center items-center text-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                <span className="text-sm animate-pulse-gentle">Generating SQL...</span>
              </div>
            ) : result ? (
              <div className="prose-tool text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[400px]">
                {result}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-muted text-sm text-center gap-2 px-4">
                <Database className="h-8 w-8 text-cyan-400 mb-1" />
                <p>Describe what you need in plain English.</p>
                <p className="text-xs">Adding schema context produces more accurate queries.</p>
              </div>
            )}
          </ToolPanel>
        </div>
      </ToolLayout>
    </div>
  );
}
