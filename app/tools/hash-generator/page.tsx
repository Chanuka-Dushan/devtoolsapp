"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { CopyButton } from "@/components/tools/CopyButton";
import { StatusMessage } from "@/components/tools/StatusMessage";
import { ToolLayout, ToolPanel, ToolActions } from "@/components/tools/ToolLayout";
import { generateHash, generateAllHashes, type HashAlgorithm } from "@/lib/tools/hash";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("hash-generator")!;

const ALGORITHMS: { value: HashAlgorithm; label: string; bits: number; note?: string }[] = [
  { value: "SHA-256", label: "SHA-256", bits: 256 },
  { value: "SHA-512", label: "SHA-512", bits: 512 },
  { value: "SHA-1", label: "SHA-1", bits: 160, note: "Not recommended for security" },
  { value: "MD5", label: "MD5", bits: 128, note: "Not cryptographically secure" },
];

export default function HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [hash, setHash] = useState("");
  const [allHashes, setAllHashes] = useState<Record<HashAlgorithm, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!input) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateHash(input, algorithm);
      if (result.success) setHash(result.hash!);
      else setError(result.error ?? "Hash generation failed.");
    } finally {
      setIsLoading(false);
    }
  }, [input, algorithm]);

  const handleGenerateAll = useCallback(async () => {
    if (!input) return;
    setIsLoading(true);
    setShowAll(true);
    setError(null);
    try {
      const results = await generateAllHashes(input);
      const hashes: Record<HashAlgorithm, string> = {} as Record<HashAlgorithm, string>;
      for (const [alg, result] of Object.entries(results) as [HashAlgorithm, typeof results[HashAlgorithm]][]) {
        if (result.success) hashes[alg] = result.hash!;
      }
      setAllHashes(hashes);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <ToolLayout tool={tool}>
        <ToolActions>
          {/* Algorithm selector */}
          <div className="flex items-center gap-1">
            {ALGORITHMS.map((alg) => (
              <button
                key={alg.value}
                onClick={() => setAlgorithm(alg.value)}
                aria-pressed={algorithm === alg.value}
                title={alg.note}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  algorithm === alg.value
                    ? "bg-brand-600 text-white"
                    : "bg-surface-elevated text-muted hover:text-foreground border border-border"
                }`}
              >
                {alg.label}
              </button>
            ))}
          </div>
          <Button id="btn-generate" variant="primary" size="sm" onClick={handleGenerate} isLoading={isLoading && !showAll} disabled={!input.trim()}>
            Generate Hash
          </Button>
          <Button id="btn-generate-all" variant="secondary" size="sm" onClick={handleGenerateAll} isLoading={isLoading && showAll} disabled={!input.trim()}>
            All Algorithms
          </Button>
        </ToolActions>

        {error && <StatusMessage type="error" message={error} />}

        <ToolPanel label="Input Text">
          <Textarea
            id="hash-input"
            aria-label="Text to hash"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            className="min-h-[160px]"
          />
        </ToolPanel>

        {/* Single hash output */}
        {hash && !showAll && (
          <ToolPanel label={`${algorithm} Hash`} actions={<CopyButton text={hash} size="sm" />}>
            <code className="block text-xs font-mono text-foreground break-all leading-relaxed bg-surface-elevated rounded-lg px-3 py-2.5 border border-border">
              {hash}
            </code>
          </ToolPanel>
        )}

        {/* All hashes */}
        {allHashes && showAll && (
          <ToolPanel label="All Algorithms">
            <div className="flex flex-col gap-3">
              {ALGORITHMS.map((alg) => {
                const h = allHashes[alg.value];
                if (!h) return null;
                return (
                  <div key={alg.value}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-foreground">{alg.label}</span>
                      {alg.note && <span className="text-[10px] text-amber-600 dark:text-amber-400">{alg.note}</span>}
                      <CopyButton text={h} size="sm" label="Copy" />
                    </div>
                    <code className="block text-xs font-mono text-muted break-all bg-surface-elevated rounded-lg px-3 py-2 border border-border">
                      {h}
                    </code>
                  </div>
                );
              })}
            </div>
          </ToolPanel>
        )}

        <div className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-xs text-muted">
          <strong className="text-foreground">Security note:</strong> SHA-256 and SHA-512 are recommended for security purposes.
          SHA-1 and MD5 have known vulnerabilities and should not be used for password hashing or digital signatures.
          All computation happens in your browser — nothing is sent to a server.
        </div>
      </ToolLayout>
    </div>
  );
}
