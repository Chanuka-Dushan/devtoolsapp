import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Tag, Newspaper } from "lucide-react";
import { NEWS_ITEMS } from "@/lib/content/data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return NEWS_ITEMS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = NEWS_ITEMS.find((n) => n.slug === slug);
  if (!item) return { title: "News Item Not Found" };
  return {
    title: `${item.title} | DevTools News`,
    description: item.summary,
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = NEWS_ITEMS.find((n) => n.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/news"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to tech news
      </Link>

      <header className="pb-8 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={item.category === "AI" ? "primary" : "secondary"}>
            {item.category}
          </Badge>
          <span className="text-xs text-muted flex items-center gap-1 font-medium ml-2">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(item.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {item.title}
        </h1>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted">
            Reported by DevTools Editorial
          </span>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
          >
            Original source: {item.sourceName} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <div className="py-10 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">Executive Summary</h2>
          <p className="text-base text-muted leading-relaxed">{item.summary}</p>
        </div>

        <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6">
          <h2 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
            Engineering Architectural Commentary
          </h2>
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
            {item.commentary}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-elevated text-muted border border-border"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
