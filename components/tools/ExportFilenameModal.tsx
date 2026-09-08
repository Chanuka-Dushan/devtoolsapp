"use client";

import { useState, useEffect, useRef } from "react";
import { Download, FileCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ExportFilenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
  defaultFilename: string;
  extension: string; // e.g. ".pdf", ".docx", ".png", ".zip"
  title?: string;
  description?: string;
  isProcessing?: boolean;
}

export function ExportFilenameModal({
  isOpen,
  onClose,
  onConfirm,
  defaultFilename,
  extension,
  title = "Export Document",
  description = "Choose a filename for your converted file before downloading.",
  isProcessing = false,
}: ExportFilenameModalProps) {
  // Strip extension if it was passed in defaultFilename
  const cleanExt = extension.startsWith(".") ? extension : `.${extension}`;
  const initialBaseName = defaultFilename.replace(
    new RegExp(`\\${cleanExt}$`, "i"),
    ""
  );

  const [filename, setFilename] = useState(initialBaseName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const base = defaultFilename.replace(
        new RegExp(`\\${cleanExt}$`, "i"),
        ""
      );
      setFilename(base || "document");
      setError(null);
      // Focus and select text when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, defaultFilename, cleanExt]);

  if (!isOpen) return null;

  const handleSanitizeAndConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = filename.trim();
    if (!trimmed) {
      setError("Please enter a valid filename.");
      return;
    }

    // Check for invalid filesystem characters: / \ : * ? " < > |
    const invalidChars = /[\/\\:*?"<>|]/;
    if (invalidChars.test(trimmed)) {
      setError('Filename cannot contain: / \\ : * ? " < > |');
      return;
    }

    const fullFilename = `${trimmed}${cleanExt}`;
    onConfirm(fullFilename);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted mt-0.5">{description}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSanitizeAndConfirm}>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Export Filename
            </label>
            <div className="flex items-stretch rounded-xl border border-input focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 overflow-hidden bg-background shadow-inner">
              <input
                ref={inputRef}
                type="text"
                value={filename}
                onChange={(e) => {
                  setFilename(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isProcessing}
                placeholder="document-name"
                className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted outline-none disabled:opacity-50"
              />
              <span className="flex items-center px-3 text-xs font-mono font-semibold bg-muted/60 text-muted-foreground border-l border-border select-none">
                {cleanExt}
              </span>
            </div>

            {error ? (
              <p className="mt-1.5 text-xs text-error font-medium">{error}</p>
            ) : (
              <p className="mt-1.5 text-[11px] text-muted flex items-center gap-1">
                <FileCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                Will be saved as:{" "}
                <span className="font-mono text-foreground font-semibold">
                  {filename.trim() || "document"}
                  {cleanExt}
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download {cleanExt.toUpperCase().replace(".", "")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
