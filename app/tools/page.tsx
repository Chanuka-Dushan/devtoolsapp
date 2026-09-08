import type { Metadata } from "next";
import Link from "next/link";
import {
  Braces,
  ArrowLeftRight,
  Link as LinkIcon,
  Fingerprint,
  KeyRound,
  Search,
  Clock,
  Hash,
  CheckCircle,
  Minimize2,
  FileImage,
  FileText,
  FileCode,
  Image as ImageIcon,
  Scaling,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DEVELOPER_TOOLS } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Free online developer, PDF & Image tools — Image converter, resizer, SVG vectorizer, watermark remover, PDF converters, and more.",
};

const iconMap: Record<string, React.ElementType> = {
  Braces,
  CheckCircle,
  Minimize2,
  ArrowLeftRight,
  Link: LinkIcon,
  Fingerprint,
  KeyRound,
  Search,
  Clock,
  Hash,
  FileImage,
  FileText,
  FileCode,
  FileCheck: CheckCircle,
  Image: ImageIcon,
  Scaling,
  Sparkles,
};

const categoryLabels: Record<string, string> = {
  developer: "Developer",
  encoding: "Encoding",
  generators: "Generators",
  pdf: "PDF & Document Converters",
  images: "Image Processing & Converters",
};

export default function ToolsPage() {
  const categories = [...new Set(DEVELOPER_TOOLS.map((t) => t.category))];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Developer Tools
        </h1>
        <p className="text-muted mt-2 text-sm max-w-xl">
          {DEVELOPER_TOOLS.length} free tools — all run in your browser.
          No sign-up, no data storage.
        </p>
      </div>

      {/* Tools by category */}
      <div className="flex flex-col gap-12">
        {categories.map((category) => {
          const tools = DEVELOPER_TOOLS.filter((t) => t.category === category);
          return (
            <section key={category} aria-labelledby={`category-${category}`}>
              <h2
                id={`category-${category}`}
                className="text-xs font-semibold uppercase tracking-wider text-muted mb-5"
              >
                {categoryLabels[category] ?? category}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => {
                  const Icon = iconMap[tool.icon] ?? Braces;
                  return (
                    <Link
                      key={tool.slug}
                      href={tool.path}
                      id={`tool-${tool.slug}`}
                      className={cn(
                        "group flex items-start gap-4 rounded-xl border border-border bg-surface p-5",
                        "hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/5",
                        "transition-all duration-200"
                      )}
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
                        <Icon
                          className="h-5 w-5 text-brand-600 dark:text-brand-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {tool.name}
                          </h3>
                          {tool.isPopular && (
                            <Badge variant="primary" className="text-[10px]">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
