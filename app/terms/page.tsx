import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | DevTools Platform",
  description: "DevTools Platform Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-xs text-muted mb-8">Effective Date: January 1, 2025</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing and using DevTools Platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-foreground mb-2">2. Acceptable Use</h2>
          <p>
            You agree to use our developer tools and AI utilities for lawful programming, testing, and engineering activities. You agree not to abuse rate limits or attempt to compromise server infrastructure.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-bold text-foreground mb-2">3. Disclaimer of Warranties</h2>
          <p>
            All tools, code explanations, and SQL queries are provided &ldquo;as is&rdquo; without warranties of any kind. Developers are solely responsible for verifying generated code and SQL queries prior to running them against production databases.
          </p>
        </section>
      </div>
    </div>
  );
}
