import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Share2, Tag, BookOpen, Sparkles } from "lucide-react";
import { ARTICLES } from "@/lib/content/data";
import { TOOLS } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/Badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: `${article.title} | DevTools Blog`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedTools = TOOLS.filter((tool) =>
    article.relatedTools.includes(tool.slug)
  );

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to all articles
      </Link>

      <header className="pb-8 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="primary">{article.category}</Badge>
          <span className="text-xs text-muted flex items-center gap-1 font-medium ml-2">
            <Clock className="h-3.5 w-3.5" /> {article.readTimeMins} min read
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {article.title}
        </h1>

        <p className="mt-4 text-base text-muted leading-relaxed">
          {article.excerpt}
        </p>

        {/* Author info */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm">
              {article.author.name[0]}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {article.author.name}
              </div>
              <div className="text-xs text-muted">{article.author.role}</div>
            </div>
          </div>
          <span className="text-xs text-muted">
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* Content sections */}
      <div className="py-10 space-y-8">
        {article.contentSections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {section.heading}
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {section.body}
            </p>

            {section.codeSnippet && (
              <div className="rounded-xl overflow-hidden border border-border bg-slate-950 text-slate-100 shadow-md">
                <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
                  <code>{section.codeSnippet}</code>
                </pre>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Tags */}
      <div className="pt-6 border-t border-border flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-elevated text-muted border border-border"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Companion tools */}
      {relatedTools.length > 0 && (
        <div className="mt-12 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            Related Developer Tools
          </h3>
          <p className="text-xs text-muted mb-4">
            Put this theory into practice using our free companion tools:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-elevated hover:border-brand-500 transition-colors group"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-xs text-muted">{tool.category}</div>
                </div>
                <span className="text-xs font-medium text-brand-500">Launch →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
