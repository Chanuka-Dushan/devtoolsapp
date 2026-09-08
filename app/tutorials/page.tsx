import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Award, Code2 } from "lucide-react";
import { TUTORIALS } from "@/lib/content/data";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Programming Tutorials & Guides | DevTools Platform",
  description:
    "Master developer skills with step-by-step guides on TypeScript, REST APIs, regex, and cloud architecture.",
};

export default function TutorialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 mb-4">
          <BookOpen className="h-3.5 w-3.5" />
          Interactive Learning
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Developer Tutorials & Guides
        </h1>
        <p className="mt-3 text-base text-muted leading-relaxed">
          Comprehensive, production-tested walkthroughs designed to level up your engineering skills.
          Each tutorial includes runnable code examples and links to companion developer tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TUTORIALS.map((tutorial) => (
          <Link
            key={tutorial.slug}
            href={`/tutorials/${tutorial.slug}`}
            className="group flex flex-col h-full"
          >
            <Card className="flex flex-col justify-between h-full p-6 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="primary">{tutorial.category}</Badge>
                  <span className="text-xs text-muted flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {tutorial.estimatedMins} min read
                  </span>
                </div>

                <h2 className="text-lg font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                  {tutorial.title}
                </h2>

                <p className="mt-2 text-sm text-muted line-clamp-3 leading-relaxed">
                  {tutorial.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {tutorial.author.name}
                  </span>
                  <span>•</span>
                  <span className="text-brand-600 dark:text-brand-400 font-medium">
                    {tutorial.difficulty}
                  </span>
                </div>
                <span className="text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
