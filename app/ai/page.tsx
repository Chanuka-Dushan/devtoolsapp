import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { AI_TOOLS } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "AI Developer Tools",
  description:
    "AI-powered developer tools — code explainer, AI debugger, SQL generator, and more. Free to use.",
};

export default function AIToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-violet-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">AI-Powered</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">AI Developer Tools</h1>
        <p className="text-muted mt-2 text-sm max-w-xl">
          AI-assisted utilities that help you understand, debug, and write code faster.
          Requires an AI API key configured in your environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {AI_TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.path}
            id={`ai-tool-${tool.slug}`}
            className="group rounded-xl border border-border bg-surface p-6 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 flex flex-col"
          >
            <h2 className="font-bold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {tool.name}
            </h2>
            <p className="text-sm text-muted mt-2 leading-relaxed flex-1">{tool.longDescription}</p>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="primary" className="text-[10px]">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                AI Powered
              </Badge>
              {tool.isNew && <Badge variant="warning" className="text-[10px]">New</Badge>}
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted group-hover:text-violet-500 transition-colors font-medium">
              Try it free <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
