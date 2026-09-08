import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Award, Code2, Sparkles, Share2 } from "lucide-react";
import { TUTORIALS } from "@/lib/content/data";
import { TOOLS } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TUTORIALS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = TUTORIALS.find((t) => t.slug === slug);
  if (!tutorial) return { title: "Tutorial Not Found" };
  return {
    title: `${tutorial.title} | DevTools Tutorials`,
    description: tutorial.excerpt,
  };
}

export default async function TutorialDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tutorial = TUTORIALS.find((t) => t.slug === slug);

  if (!tutorial) {
    notFound();
  }

  const relatedTools = TOOLS.filter((tool) =>
    tutorial.relatedTools.includes(tool.slug)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <Link
        href="/tutorials"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to all tutorials
      </Link>

      {/* Header */}
      <header className="pb-8 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="primary">{tutorial.category}</Badge>
          <Badge variant="secondary">{tutorial.difficulty}</Badge>
          <span className="text-xs text-muted flex items-center gap-1 font-medium ml-2">
            <Clock className="h-3.5 w-3.5" /> {tutorial.estimatedMins} min read
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
          {tutorial.title}
        </h1>

        <p className="mt-4 text-base text-muted leading-relaxed">
          {tutorial.excerpt}
        </p>

        {/* Author info */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm">
              {tutorial.author.name[0]}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {tutorial.author.name}
              </div>
              <div className="text-xs text-muted">{tutorial.author.role}</div>
            </div>
          </div>
          <span className="text-xs text-muted">
            Published {new Date(tutorial.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </header>

      {/* Tutorial Steps */}
      <div className="py-10 space-y-10">
        {tutorial.steps.map((step, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {step.title}
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {step.content}
            </p>

            {step.code && (
              <div className="rounded-xl overflow-hidden border border-border bg-slate-950 text-slate-100 shadow-md">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-xs font-mono text-slate-400">
                  <span>{step.language || "code"}</span>
                </div>
                <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
                  <code>{step.code}</code>
                </pre>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Related Interactive Tools */}
      {relatedTools.length > 0 && (
        <div className="mt-12 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-brand-500" />
            Interactive Tools Used in This Guide
          </h3>
          <p className="text-xs text-muted mb-4">
            Try your queries, payloads, or patterns directly in our free browser developer tools:
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
    </div>
  );
}
