"use client";

import { Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  placement?: "banner" | "sidebar" | "inline";
  className?: string;
}

/**
 * Clean monetization slot placeholder designed according to architecture spec.
 * Never degrades UX or distracts from developer tool workflows.
 */
export function AdSlot({ placement = "inline", className }: AdSlotProps) {
  if (placement === "banner") {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-dashed border-border/80 bg-surface-elevated/40 p-4 text-center my-6",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border">
              Developer Partner
            </span>
            <span>Reliable cloud infrastructure & modern developer tooling</span>
          </div>
          <a
            href="/dashboard"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Explore Developer Plans <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/70 bg-surface/50 p-4 text-center text-xs text-muted",
        className
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
          Sponsor / Partner Space
        </span>
        <Sparkles className="h-3 w-3 text-brand-500" />
      </div>
      <p className="text-muted leading-relaxed">
        Support free open-source developer tooling. Contact us for partner sponsorships.
      </p>
    </div>
  );
}
