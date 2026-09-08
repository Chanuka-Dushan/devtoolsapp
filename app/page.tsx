import Link from "next/link";
import {
  ArrowRight,
  Braces,
  ArrowLeftRight,
  KeyRound,
  Search,
  Fingerprint,
  Clock,
  Sparkles,
  BookOpen,
  Bug,
  Database,
  ChevronRight,
  Hash,
  Zap,
  Shield,
  Globe,
  GraduationCap,
  Flame,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { POPULAR_TOOLS, AI_TOOLS } from "@/lib/tools/registry";
import { AdSlot } from "@/components/monetization/AdSlot";
import { getFreeUdemyCourses } from "@/lib/courses/feed";

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* Background grid */}
      <div className="absolute inset-0 hero-grid opacity-60" aria-hidden="true" />

      {/* Glow orbs */}
      <div
        className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="primary" className="text-xs font-medium px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1.5" aria-hidden="true" />
              Now with AI-powered tools
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Developer tools that{" "}
            <span className="gradient-text">make your work faster</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl leading-relaxed">
            A professional platform of free developer tools and AI-powered
            utilities. Format JSON, decode JWTs, generate UUIDs, explain code,
            and much more — all running in your browser, no sign-up required.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/tools" id="hero-explore-tools">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Explore Tools
              </Button>
            </Link>
            <Link href="/ai" id="hero-explore-ai">
              <Button variant="secondary" size="lg" leftIcon={<Sparkles className="h-4 w-4 text-violet-500" />}>
                Explore AI Tools
              </Button>
            </Link>
          </div>

          {/* Social proof stats */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>All tools free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>No sign-up needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brand-500" />
              <span>Runs in your browser</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Tool icon map ─────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  Braces,
  ArrowLeftRight,
  KeyRound,
  Search,
  Fingerprint,
  Clock,
  Hash,
  BookOpen,
  Bug,
  Database,
  Sparkles,
};

// ─── Popular Tools Section ────────────────────────────────────────────────────
function PopularToolsSection() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="popular-tools-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              id="popular-tools-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
            >
              Popular Developer Tools
            </h2>
            <p className="text-muted mt-1 text-sm">
              The tools developers use most — fast, free, no registration.
            </p>
          </div>
          <Link
            href="/tools"
            className="hidden sm:flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            View all tools
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon] ?? Braces;
            return (
              <Link
                key={tool.slug}
                href={tool.path}
                id={`tool-card-${tool.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/5 transition-all duration-200"
                aria-label={`${tool.name} — ${tool.description}`}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
                  <Icon
                    className="h-5 w-5 text-brand-600 dark:text-brand-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Badge variant="success" className="text-[10px]">
                      Free
                    </Badge>
                    {tool.isPopular && (
                      <Badge variant="primary" className="text-[10px]">
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
              </Link>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link href="/tools">
            <Button variant="outline" size="sm">
              View all tools →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── AI Tools Section ─────────────────────────────────────────────────────────
function AIToolsSection() {
  const aiColors = [
    "from-violet-500 to-purple-600",
    "from-indigo-500 to-brand-600",
    "from-cyan-500 to-blue-600",
  ];

  return (
    <section className="py-16 sm:py-20 bg-surface" aria-labelledby="ai-tools-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-violet-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                AI-Powered
              </span>
            </div>
            <h2
              id="ai-tools-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
            >
              AI Developer Tools
            </h2>
            <p className="text-muted mt-1 text-sm">
              Supercharge your workflow with AI-assisted tools.
            </p>
          </div>
          <Link
            href="/ai"
            className="hidden sm:flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline"
          >
            View all AI tools
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {AI_TOOLS.map((tool, index) => {
            const Icon = iconMap[tool.icon] ?? Sparkles;
            const gradient = aiColors[index % aiColors.length];
            return (
              <Link
                key={tool.slug}
                href={tool.path}
                id={`ai-tool-card-${tool.slug}`}
                className="group relative rounded-xl border border-border bg-surface p-5 overflow-hidden hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200"
                aria-label={`${tool.name} — ${tool.description}`}
              >
                {/* Subtle gradient corner */}
                <div
                  className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                  aria-hidden="true"
                />

                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md mb-4`}
                >
                  <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>

                <h3 className="font-semibold text-sm text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="primary" className="text-[10px]">
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    AI Powered
                  </Badge>
                  {tool.isNew && (
                    <Badge variant="warning" className="text-[10px]">
                      New
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-3 text-xs text-muted group-hover:text-violet-500 transition-colors font-medium">
                  Try it free
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Tutorials Section ────────────────────────────────────────────────────────
const sampleTutorials = [
  {
    slug: "getting-started-with-docker",
    title: "Getting Started with Docker for Developers",
    category: "DevOps",
    difficulty: "Beginner",
    mins: 15,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    slug: "jwt-authentication-nodejs",
    title: "JWT Authentication in Node.js — Complete Guide",
    category: "Backend",
    difficulty: "Intermediate",
    mins: 20,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    slug: "postgresql-indexing-performance",
    title: "PostgreSQL Indexing for Performance",
    category: "Database",
    difficulty: "Advanced",
    mins: 25,
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
];

function TutorialsSection() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="tutorials-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              id="tutorials-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
            >
              Tutorials
            </h2>
            <p className="text-muted mt-1 text-sm">
              Step-by-step guides for real developer problems.
            </p>
          </div>
          <Link
            href="/tutorials"
            className="hidden sm:flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            All tutorials
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleTutorials.map((tutorial) => (
            <Link
              key={tutorial.slug}
              href={`/tutorials/${tutorial.slug}`}
              className="group rounded-xl border border-border bg-surface p-5 hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/5 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tutorial.color}`}
                >
                  {tutorial.category}
                </span>
                <span className="text-xs text-muted">{tutorial.mins} min read</span>
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                {tutorial.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-3">
                <Badge variant="default" className="text-[10px]">
                  {tutorial.difficulty}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Articles Section ─────────────────────────────────────────────────────────
const sampleArticles = [
  {
    slug: "understanding-jwt-security",
    title: "Understanding JWT Security: What Developers Get Wrong",
    excerpt:
      "JWTs are everywhere, but they're often misused. Learn the common security pitfalls and how to avoid them.",
    date: "Sep 5, 2026",
    readMins: 8,
    tag: "Security",
  },
  {
    slug: "sql-query-optimization",
    title: "10 SQL Query Optimization Techniques You Should Know",
    excerpt:
      "Slow queries are costing you money. These proven techniques can reduce query time by 10x.",
    date: "Sep 3, 2026",
    readMins: 12,
    tag: "Database",
  },
  {
    slug: "regex-patterns-developers",
    title: "The Regex Patterns Every Developer Should Know",
    excerpt:
      "Regular expressions are powerful but confusing. Master these 20 patterns and you'll cover 90% of real use cases.",
    date: "Sep 1, 2026",
    readMins: 7,
    tag: "Tools",
  },
];

function ArticlesSection() {
  return (
    <section className="py-16 sm:py-20 bg-surface" aria-labelledby="articles-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              id="articles-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
            >
              Latest Articles
            </h2>
            <p className="text-muted mt-1 text-sm">
              Technical articles from the DevTools team.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            View blog
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-xl border border-border bg-background p-5 hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/5 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="text-[10px]">
                  {article.tag}
                </Badge>
                <span className="text-xs text-muted">{article.readMins} min</span>
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug flex-1">
                {article.title}
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
              <p className="text-xs text-muted-foreground mt-3">{article.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── News Section ─────────────────────────────────────────────────────────────
const sampleNews = [
  {
    slug: "openai-releases-o3",
    title: "OpenAI Releases o3 Model with Significantly Improved Reasoning",
    summary:
      "OpenAI's latest model shows major improvements in mathematical reasoning and coding tasks.",
    date: "Sep 8, 2026",
    source: "OpenAI Blog",
  },
  {
    slug: "github-copilot-workspace",
    title: "GitHub Copilot Workspace Now Generally Available",
    summary:
      "GitHub's AI-native developer environment moves out of technical preview with new collaboration features.",
    date: "Sep 7, 2026",
    source: "GitHub Blog",
  },
  {
    slug: "typescript-6-release",
    title: "TypeScript 6.0 Released with Major Performance Improvements",
    summary:
      "The new major version brings faster compilation, improved type inference, and new configuration options.",
    date: "Sep 6, 2026",
    source: "TypeScript Blog",
  },
];

function NewsSection() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="news-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              id="news-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
            >
              Latest Tech & AI News
            </h2>
            <p className="text-muted mt-1 text-sm">
              What's happening in the developer ecosystem.
            </p>
          </div>
          <Link
            href="/news"
            className="hidden sm:flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            All news
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {sampleNews.map((item, index) => (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-border bg-surface px-5 py-4 hover:border-brand-500/40 hover:shadow-sm hover:shadow-brand-500/5 transition-all duration-200"
            >
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-surface-elevated flex items-center justify-center text-xs font-bold text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-muted mt-1 line-clamp-1">
                  {item.summary}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{item.date}</span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">{item.source}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function CoursesSection() {
  const allCourses = await getFreeUdemyCourses();
  const topCourses = allCourses.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 bg-surface/50 border-t border-border" aria-labelledby="courses-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Flame className="h-3 w-3" /> 100% OFF Coupons
              </span>
              <span className="text-xs text-muted">Updated Daily</span>
            </div>
            <h2 id="courses-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
              Free Premium Developer Courses
            </h2>
            <p className="text-sm text-muted mt-1">
              Top-rated programming, AI, and cloud certification courses available for $0.
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Explore all free courses <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface overflow-hidden group hover:border-emerald-500/40 hover:shadow-lg transition-all"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[11px] uppercase">
                      100% OFF
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1 font-mono">
                      <span className="line-through text-muted-foreground">{course.originalPrice}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">$0 Free</span>
                    </div>
                  </div>

                  <a href={course.link} target="_blank" rel="noopener noreferrer">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                  </a>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a href={course.link} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                  >
                    <span>Claim Free Course</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  return (
    <>
      <Hero />
      <PopularToolsSection />
      <AIToolsSection />
      <CoursesSection />
      <TutorialsSection />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot placement="banner" />
      </div>
      <ArticlesSection />
      <NewsSection />
    </>
  );
}
