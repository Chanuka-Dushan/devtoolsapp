"use client";

import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { validateJSON } from "@/lib/tools/json";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("json-validator")!;

export default function JSONValidatorTool() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<{
    type: "error" | "success" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleValidate = useCallback(() => {
    const result = validateJSON(input);
    if (result.success) {
      setStatus({ type: "success", message: "✓ Valid JSON — no syntax errors found." });
    } else {
      setStatus({ type: "error", message: result.error ?? "Invalid JSON." });
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setStatus({ type: null, message: "" });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <ToolActions>
          <Button
            id="btn-validate"
            variant="primary"
            size="sm"
            onClick={handleValidate}
            disabled={!input.trim()}
          >
            Validate JSON
          </Button>
          <Button
            id="btn-clear"
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={handleClear}
            disabled={!input}
          >
            Clear
          </Button>
          <div className="ml-auto">
            <CopyButton text={input} label="Copy input" />
          </div>
        </ToolActions>

        {status.type && (
          <StatusMessage type={status.type} message={status.message} />
        )}

        <ToolPanel label="JSON Input">
          <Textarea
            id="json-input"
            aria-label="JSON input to validate"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste your JSON to validate...\n\n{"key": "value"}'}
            mono
            className="min-h-[400px] text-xs"
          />
        </ToolPanel>
      </ToolLayout>
    </div>
  );
}
