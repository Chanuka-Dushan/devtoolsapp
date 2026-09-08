"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Megaphone } from "lucide-react";

interface AdUnitProps {
  slotId?: string;
  format?: "horizontal" | "rectangle" | "auto";
  className?: string;
  label?: string;
}

export function AdUnit({
  slotId,
  format = "horizontal",
  className = "",
  label = "Sponsored",
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const isInitialized = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isAdSenseActive = !!clientId && clientId !== "ca-pub-placeholder";

  useEffect(() => {
    if (!isAdSenseActive || isInitialized.current) return;

    try {
      if (typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isInitialized.current = true;
        setAdLoaded(true);
      }
    } catch (err) {
      console.warn("AdSense push error (usually blocked by adblocker):", err);
    }
  }, [isAdSenseActive]);

  // If live AdSense is active and configured
  if (isAdSenseActive && slotId) {
    return (
      <div className={`my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <span className="text-[10px] uppercase font-mono tracking-wider text-muted/60 mb-1">
          {label}
        </span>
        <div ref={adRef} className="w-full flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format={format === "auto" ? "auto" : format === "rectangle" ? "rectangle" : "horizontal"}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Fallback / Development Sponsor Unit
  return (
    <div
      className={`my-6 w-full rounded-xl border border-dashed border-border/80 bg-surface/40 p-4 text-center transition-all ${
        format === "rectangle" ? "max-w-[320px] mx-auto min-h-[220px]" : "max-w-4xl mx-auto min-h-[90px]"
      } flex flex-col items-center justify-center gap-1.5 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Megaphone className="h-3.5 w-3.5 text-brand-500" />
        <span>Partner Sponsorship / Advertisement Slot</span>
      </div>
      <p className="text-[11px] text-muted max-w-md">
        Support free developer tools • Contact us for developer-focused sponsorship opportunities.
      </p>
      <span className="text-[9px] uppercase tracking-widest font-mono text-muted/50 mt-1">
        AdSense Ready: Set NEXT_PUBLIC_ADSENSE_CLIENT_ID
      </span>
    </div>
  );
}
