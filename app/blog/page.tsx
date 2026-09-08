import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Clock, ArrowRight, Sparkles } from "lucide-react";
import { ARTICLES } from "@/lib/content/data";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Engineering Blog & Technical Articles | DevTools Platform",
  description:
    "In-depth architectural write-ups, deep dives into browser execution, cryptography, and developer productivity.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 mb-4">
          <FileText className="h-3.5 w-3.5" />
          Technical Insights
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Engineering & Architecture Blog
        </h1>
        <p className="mt-3 text-base text-muted leading-relaxed">
          Deep dives into software architecture, systems engineering, cryptography, and modern web performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group flex flex-col h-full"
          >
            <Card className="flex flex-col justify-between h-full p-6 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="secondary">{article.category}</Badge>
                  <span className="text-xs text-muted flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTimeMins} min read
                  </span>
                </div>

                <h2 className="text-xl font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>

                <p className="mt-3 text-sm text-muted line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {article.author.name}
                  </span>
                  <span>•</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <span className="text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
