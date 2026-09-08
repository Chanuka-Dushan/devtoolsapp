"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ToolConfig } from "@/lib/tools/registry";
import { isFavorite, toggleFavorite } from "@/lib/tools/favorites";

interface ToolLayoutProps {
  tool: ToolConfig;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared layout wrapper for all developer tools.
 * Provides consistent header, spacing, and max-width.
 */
export function ToolLayout({ tool, children, className }: ToolLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6 max-w-6xl mx-auto w-full", className)}>
      <ToolHeader tool={tool} />
      {children}
    </div>
  );
}

interface ToolHeaderProps {
  tool: ToolConfig;
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(tool.slug));
  }, [tool.slug]);

  const handleToggle = () => {
    const next = toggleFavorite(tool.slug);
    setFav(next);
  };

  return (
    <div className="border-b border-border pb-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {tool.name}
            </h1>
            <button
              onClick={handleToggle}
              className={cn(
                "p-1.5 rounded-lg border transition-all",
                fav
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                  : "border-border text-muted hover:text-foreground hover:bg-surface-elevated"
              )}
              title={fav ? "Remove from saved tools" : "Save tool to dashboard"}
            >
              <Star className={cn("h-4 w-4", fav && "fill-amber-500")} />
            </button>
          </div>
          <p className="text-sm text-muted mt-1 max-w-xl leading-relaxed">
            {tool.longDescription ?? tool.description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ToolPanelProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

/**
 * Panel container for input/output sections within a tool.
 */
export function ToolPanel({ label, children, className, actions }: ToolPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface overflow-hidden",
        className
      )}
    >
      {(label || actions) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-elevated">
          {label && (
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              {label}
            </span>
          )}
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

interface ToolActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Action bar for tool buttons (Format, Validate, Clear, etc.)
 */
export function ToolActions({ children, className }: ToolActionsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {children}
    </div>
  );
}
