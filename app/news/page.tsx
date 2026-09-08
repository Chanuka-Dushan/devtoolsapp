import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, ExternalLink, ArrowRight, Sparkles, Flame } from "lucide-react";
import { NEWS_ITEMS } from "@/lib/content/data";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Developer & AI Tech News | DevTools Platform",
  description:
    "Curated software engineering and artificial intelligence developments, releases, and architectural analysis.",
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 mb-4">
          <Newspaper className="h-3.5 w-3.5" />
          Industry Briefings
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Tech & AI Developer News
        </h1>
        <p className="mt-3 text-base text-muted leading-relaxed">
          Curated software engineering updates, LLM breakthroughs, open-source releases, and architectural commentary.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {NEWS_ITEMS.map((item) => (
          <Card
            key={item.slug}
            className="p-6 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={item.category === "AI" ? "primary" : "secondary"}>
                  {item.category}
                </Badge>
                <span className="text-xs text-muted">
                  {new Date(item.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
              >
                Source: {item.sourceName} <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <Link href={`/news/${item.slug}`}>
              <h2 className="text-xl font-bold text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors mt-2">
                {item.title}
              </h2>
            </Link>

            <p className="mt-3 text-sm text-muted leading-relaxed">
              {item.summary}
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-surface-elevated border border-border">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
                Developer Takeaway
              </span>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {item.commentary}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-border">
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface text-muted border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/news/${item.slug}`}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:translate-x-0.5 transition-transform"
              >
                Full Story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
