import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | DevTools Platform",
  description: "DevTools Platform Privacy Policy - Client-side execution and strict data privacy commitments.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted">Effective Date: January 1, 2025</p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-foreground mb-2">
            1. Client-Side Data Execution
          </h2>
          <p>
            Standard developer utilities (JSON Formatter, Minifier, Validator, Base64 Encoder, JWT Decoder, UUID Generator, Regex Tester, Timestamp Converter, Hash Generator) run exclusively inside your browser memory using JavaScript and the Web Cryptography API. We do not store, view, or transmit your formatted or transformed data to any server.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-foreground mb-2">
            2. AI Tools Usage
          </h2>
          <p>
            When utilizing AI features (Code Explainer, AI Debugger, SQL Generator), code snippets and error contexts are securely routed via HTTPS to our AI provider layer (OpenRouter) exclusively for generating the requested output. Code snippets are not used to train models or retained in persistent storage.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-foreground mb-2">
            3. Analytics & Usage Logs
          </h2>
          <p>
            We collect non-identifiable, aggregate operational metrics (e.g., tool execution counts and page views) to evaluate feature popularity and infrastructure capacity. We never record input payloads, tokens, or confidential developer secrets.
          </p>
        </section>
      </div>
    </div>
  );
}
