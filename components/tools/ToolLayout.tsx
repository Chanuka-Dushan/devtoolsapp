"use client";

import { useState, useEffect } from "react";
import { Star, Lock, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ToolConfig } from "@/lib/tools/registry";
import { isFavorite, toggleFavorite } from "@/lib/tools/favorites";
import { useUsage } from "@/components/auth/UsageContext";
import { Button } from "@/components/ui/Button";

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
  const { hasUsedFreeTier, isPro, isSuperAdmin, triggerUpgradeModal } = useUsage();
  const isSubtitleTool = tool.slug === "video-caption-generator" || tool.slug === "caption-studio";

  return (
    <div className={cn("flex flex-col gap-6 max-w-6xl mx-auto w-full", className)}>
      <ToolHeader tool={tool} />

      {/* Free tier exhausted banner - ONLY for subtitle / video caption tool */}
      {isSubtitleTool && hasUsedFreeTier && !isPro && !isSuperAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-brand-500/10 border border-amber-500/30 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                1/1 Free Subtitle Credit Consumed
              </p>
              <p className="text-xs text-muted">
                You have reached your free subtitle generation limit. Upgrade to Pro for unlimited subtitle generation, high-speed rendering, and premium exports.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 shrink-0"
            onClick={() =>
              triggerUpgradeModal(
                `You have consumed your 1 free subtitle generation credit. Upgrade to Pro for unlimited subtitle generation.`
              )
            }
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade to Pro
          </Button>
        </div>
      )}

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
