"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Sparkles,
  Clock,
  Star,
  Key,
  Shield,
  Trash2,
  ArrowUpRight,
  ExternalLink,
  Cpu,
  Database,
  Braces,
  Check,
  Copy,
  Cloud,
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getFavorites, toggleFavorite } from "@/lib/tools/favorites";
import { getLocalToolHistory, clearLocalToolHistory, ToolHistoryItem } from "@/lib/analytics/tracker";
import { TOOLS, AI_TOOLS } from "@/lib/tools/registry";

export default function DashboardPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<ToolHistoryItem[]>([]);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setHistory(getLocalToolHistory());

    const handleUpdate = () => {
      setFavorites(getFavorites());
    };
    window.addEventListener("favorites-changed", handleUpdate);
    return () => window.removeEventListener("favorites-changed", handleUpdate);
  }, []);

  const handleClearHistory = () => {
    clearLocalToolHistory();
    setHistory([]);
  };

  const handleRemoveFav = (slug: string) => {
    toggleFavorite(slug);
    setFavorites(getFavorites());
  };

  const copyDevKey = () => {
    navigator.clipboard.writeText("dev_live_99a84f32bc771092e01a88");
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail.trim()) {
      setWaitlistSubmitted(true);
    }
  };

  const allToolsMap = new Map([...TOOLS, ...AI_TOOLS].map((t) => [t.slug, t]));
  const favoriteTools = favorites.map((slug) => allToolsMap.get(slug)).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Developer Dashboard
            </h1>
            <Badge variant="warning" className="font-semibold text-xs py-0.5 px-2.5">
              Coming Soon • Preview Mode
            </Badge>
            <Badge variant="outline" className="text-xs">
              Early Access v1.0
            </Badge>
          </div>
          <p className="text-sm text-muted">
            Interactive preview of upcoming developer cloud synchronization, usage telemetry, and API tokens.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tools">
            <Button variant="outline" size="sm">
              Explore All Tools
            </Button>
          </Link>
          <Link href="/ai">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Launch AI Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* Coming Soon & Interactive Feature Preview Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-brand-500/5 to-violet-500/10 p-6 sm:p-8 mt-8 shadow-md">
        {/* Glow blur effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="warning" className="px-2.5 py-1 text-xs font-semibold gap-1.5">
                  <Clock className="h-3 w-3" />
                  Feature In Development
                </Badge>
                <span className="text-xs text-muted font-mono">Q2 Roadmap Update</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Cloud Developer Dashboard & Workspace Sync
              </h2>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                The persistent cloud dashboard backend is currently under construction. You are previewing the upcoming interface layout. Once launched, your custom settings, favorites, and execution analytics will automatically sync across devices with team collaboration and headless CLI API keys.
              </p>

              {/* Upcoming Highlights Roadmap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/60 border border-border/70 backdrop-blur-sm">
                  <Cloud className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      Cloud Sync & Multi-Device
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-medium">In Progress</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      Sync favorites, history, and tool presets across your phone, tablet, and workstation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/60 border border-border/70 backdrop-blur-sm">
                  <Key className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      Headless CLI & API Keys
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-medium">In Progress</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      Execute any formatting, image transformation, or AI tool via cURL and terminal scripts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/60 border border-border/70 backdrop-blur-sm">
                  <Shield className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      Team Workspaces
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary text-muted font-mono font-medium">Planned</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      Share custom schemas, snippet libraries, and SEO auditing reports with your team.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/60 border border-border/70 backdrop-blur-sm">
                  <Cpu className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      Usage Quotas & Webhooks
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary text-muted font-mono font-medium">Planned</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      Monitor token throughput, set team budget caps, and trigger CI/CD webhooks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Waitlist Box */}
            <div className="lg:w-80 shrink-0 p-5 rounded-xl bg-background/85 border border-amber-500/30 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-amber-500 animate-bounce" />
                <h3 className="text-sm font-bold text-foreground">Get Early Access</h3>
              </div>
              <p className="text-xs text-muted mb-4">
                Be notified the moment cloud synchronization and production API keys launch.
              </p>

              {waitlistSubmitted ? (
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>You&apos;re on the priority waitlist!</span>
                  </div>
                  <p className="text-[11px] opacity-90 pl-5">
                    We&apos;ll send an invite to <span className="font-mono font-semibold">{waitlistEmail}</span> as soon as Cloud Dashboard enters Public Beta.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-2.5">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your work email..."
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="w-full font-semibold bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-white border-0 text-xs py-2 shadow-sm"
                  >
                    Notify Me on Launch
                  </Button>
                  <p className="text-[10px] text-muted text-center">
                    Zero spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row (Interactive Preview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card className="p-5 border-border bg-surface relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Saved Tools (Preview)
            </span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{favorites.length}</div>
          <p className="text-xs text-muted mt-1">Local browser cache preview</p>
        </Card>

        <Card className="p-5 border-border bg-surface relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Recent Executions
            </span>
            <Clock className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{history.length}</div>
          <p className="text-xs text-muted mt-1">Recorded in your local session</p>
        </Card>

        <Card className="p-5 border-border bg-surface relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              AI Requests
            </span>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">Unlimited</div>
          <p className="text-xs text-muted mt-1">Powered by OpenRouter</p>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">
              Cloud Status
            </span>
            <Shield className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            Coming Soon
          </div>
          <p className="text-xs text-muted mt-1">Cloud sync in active development</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Left 2 Cols: Saved Tools & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Tools */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  Pinned & Saved Tools
                </h2>
                <Badge variant="outline" className="text-[10px]">Session Preview</Badge>
              </div>
              <span className="text-xs text-muted">Click to launch</span>
            </div>

            {favoriteTools.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                No pinned tools yet. Browse the{" "}
                <Link href="/tools" className="text-brand-500 underline">
                  tools directory
                </Link>{" "}
                to save favorites.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteTools.map((tool) => (
                  <div
                    key={tool?.slug}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-elevated hover:border-brand-500/50 transition-all group"
                  >
                    <Link
                      href={tool?.isAI ? `/ai/${tool.slug}` : `/tools/${tool?.slug}`}
                      className="flex items-center gap-3 min-w-0"
                    >
                      <div className="h-8 w-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                        {tool?.isAI ? (
                          <Sparkles className="h-4 w-4 text-violet-500" />
                        ) : (
                          <Code2 className="h-4 w-4 text-brand-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate group-hover:text-brand-500 transition-colors">
                          {tool?.name}
                        </div>
                        <div className="text-xs text-muted truncate">{tool?.category}</div>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemoveFav(tool!.slug)}
                      className="text-muted hover:text-rose-500 p-1 rounded-md transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage History */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-500" />
                  Recent Tool Activity
                </h2>
                <Badge variant="outline" className="text-[10px]">Local Preview</Badge>
              </div>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-muted hover:text-rose-500 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                No tool activity recorded yet. Run any formatter, generator, or AI tool to see live history here.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {item.toolName}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {item.summary || "Completed operation"}
                      </div>
                    </div>
                    <Link
                      href={item.toolSlug.startsWith("ai-") || item.toolSlug.includes("explainer") || item.toolSlug.includes("debugger") || item.toolSlug.includes("sql") ? `/ai/${item.toolSlug}` : `/tools/${item.toolSlug}`}
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Open <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Developer API & Plan Info */}
        <div className="space-y-8">
          {/* Developer API Key Preview */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-brand-500" />
                <h3 className="text-base font-bold text-foreground">Developer API Key</h3>
              </div>
              <Badge variant="warning" className="text-[10px]">Mock Preview</Badge>
            </div>
            <p className="text-xs text-muted mb-4">
              Preview of the upcoming CLI & API token system. Production keys with rate-limiting and webhook alerts will be issued upon release.
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface-elevated font-mono text-xs text-muted">
              <span className="truncate flex-1">dev_live_99a84f32bc771092e01a88</span>
              <button
                onClick={copyDevKey}
                className="p-1 rounded-md hover:bg-surface text-foreground transition-colors"
                title="Copy API key"
              >
                {apiKeyCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Sample cURL Request
              </span>
              <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-200 text-xs overflow-x-auto font-mono">
                {`curl -X POST https://api.devtools.dev/v1/tools/format \\
  -H "Authorization: Bearer dev_live_..." \\
  -d '{"json": "{\\"hello\\":\\"world\\"}"}'`}
              </pre>
            </div>
          </div>

          {/* Pro Upgrade Preview */}
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-surface to-brand-500/5 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <Badge variant="primary">
                Pro Plan Preview
              </Badge>
              <Badge variant="outline" className="text-[10px]">Upcoming</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Supercharge your workflow
            </h3>
            <ul className="space-y-2 text-xs text-muted mb-5">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Unlimited priority AI completions
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> High-throughput programmatic API
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Team workspaces and shared snippet library
              </li>
            </ul>
            <Button
              variant="primary"
              className="w-full text-xs font-semibold"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Join Pro Early Access
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
