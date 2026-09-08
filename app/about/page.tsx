import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About | DevTools Platform",
  description: "Learn about the mission, architecture, and technology behind DevTools Platform.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 items-center justify-center shadow-lg shadow-brand-500/25 mb-4">
          <Code2 className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          About DevTools Platform
        </h1>
        <p className="mt-3 text-base text-muted max-w-xl mx-auto leading-relaxed">
          High-performance developer utilities and AI intelligence engineered for privacy, speed, and reliability.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-8 text-foreground/90 leading-relaxed">
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-500" />
            Our Mission
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Developer tools should be instant, reliable, and accessible from anywhere without sign-up friction, intrusive popups, or server-side data leaks. We build modern browser-based utilities that process code locally whenever possible, coupled with enterprise-grade AI models for deep code debugging and query generation.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Privacy by Architecture
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Formatters, encoders, decoders, and validators run 100% locally in your browser memory. Your sensitive JSON, payloads, and tokens never touch our servers.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
              <Globe className="h-5 w-5 text-violet-500" />
              Unified AI Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Our AI architecture connects with top frontier models through an ultra-low-latency provider abstraction powered by OpenRouter.
            </p>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link href="/tools">
            <Button variant="primary" size="lg">
              Explore All Developer Tools
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
