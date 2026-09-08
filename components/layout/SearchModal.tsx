"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Code2, Sparkles, BookOpen, FileText, Newspaper, ArrowRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/app/api/search/route";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].href);
    }
  };

  if (!open) return null;

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "ai":
        return <Sparkles className="h-4 w-4 text-violet-500" />;
      case "tutorial":
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case "course":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "blog":
        return <FileText className="h-4 w-4 text-amber-500" />;
      case "news":
        return <Newspaper className="h-4 w-4 text-blue-500" />;
      default:
        return <Code2 className="h-4 w-4 text-brand-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="h-5 w-5 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent px-3 py-4 text-foreground placeholder:text-muted outline-none text-base"
            placeholder="Search tools, AI assistants, guides, articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-border text-muted ml-2">
            ESC
          </span>
        </div>

        {/* Results area */}
        <div className="overflow-y-auto p-2 divide-y divide-border/50">
          {loading && (
            <div className="py-8 text-center text-xs text-muted">Searching...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-12 text-center text-sm text-muted">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {!query && (
            <div className="py-8 px-4 text-center">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
                Quick Shortcuts
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { name: "Free Courses", href: "/courses" },
                  { name: "JSON Formatter", href: "/tools/json-formatter" },
                  { name: "Base64", href: "/tools/base64" },
                  { name: "Code Explainer", href: "/ai/code-explainer" },
                  { name: "AI Debugger", href: "/ai/debugger" },
                  { name: "Tutorials", href: "/tutorials" },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-foreground hover:border-brand-500 transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((result, idx) => (
            <div
              key={result.href + idx}
              onClick={() => handleSelect(result.href)}
              className={cn(
                "p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors",
                idx === selectedIndex
                  ? "bg-brand-500/10 border border-brand-500/30"
                  : "hover:bg-surface-elevated"
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 p-1.5 rounded-lg bg-surface-elevated border border-border flex-shrink-0">
                  {getIcon(result.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {result.title}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface border border-border text-muted">
                      {result.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {result.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted flex-shrink-0 ml-2" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-surface-elevated border-t border-border flex items-center justify-between text-[11px] text-muted font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>DevTools Global Search</span>
        </div>
      </div>
    </div>
  );
}
