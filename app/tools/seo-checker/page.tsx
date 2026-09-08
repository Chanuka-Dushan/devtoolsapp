"use client";

import { useState } from "react";
import {
  Search,
  Globe,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Share2,
  ImageIcon,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import { SeoAuditResult, SeoIssue } from "@/lib/seo/inspector";
import { jsPDF } from "jspdf";

const SAMPLES = [
  "https://github.com",
  "https://nextjs.org",
  "https://vercel.com",
];

interface AuditStep {
  label: string;
  detail: string;
  targetProgress: number;
}

const AUDIT_STEPS: AuditStep[] = [
  {
    label: "Connecting to server & resolving DNS...",
    detail: "Validating SSL certificate, HTTP headers, and protocol security",
    targetProgress: 15,
  },
  {
    label: "Crawling HTML document & assets...",
    detail: "Fetching raw DOM, stylesheet dependencies, and script tags",
    targetProgress: 32,
  },
  {
    label: "Inspecting <title>, meta & canonical tags...",
    detail: "Analyzing character limits and Google SERP snippet display",
    targetProgress: 48,
  },
  {
    label: "Analyzing semantic headings & readability...",
    detail: "Checking <h1> hierarchy and keyword distributions",
    targetProgress: 65,
  },
  {
    label: "Scanning image alt attributes & media tags...",
    detail: "Verifying accessibility and image search optimization",
    targetProgress: 78,
  },
  {
    label: "Validating OpenGraph, Twitter Cards & JSON-LD...",
    detail: "Testing social sharing previews and rich snippet schema",
    targetProgress: 90,
  },
  {
    label: "Calculating SEO health score & compiling audit report...",
    detail: "Aggregating rankings signals and synthesizing recommendations",
    targetProgress: 98,
  },
];

export default function SeoCheckerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SeoAuditResult | null>(null);

  // 10-second audit animation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Filters
  const [activeFilter, setActiveFilter] = useState<"all" | "error" | "warning" | "success">("all");
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});

  // Export modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleAudit = async (targetUrl?: string) => {
    const inputUrl = (targetUrl || url).trim();
    if (!inputUrl) {
      setError("Please enter a website URL.");
      return;
    }

    if (targetUrl) setUrl(targetUrl);
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(5);
    setCurrentStepIndex(0);

    // Start background network fetch
    const fetchPromise = fetch("/api/tools/seo-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: inputUrl }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to inspect website SEO.");
      }
      return data.result as SeoAuditResult;
    });

    // 10-second realistic progress simulation (~10,000ms total)
    const stepDurationMs = 1400; // ~1.4s per step across 7 steps = 9.8s
    const progressIntervalMs = 80;
    const totalDurationMs = 9800;
    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(98, Math.round((elapsed / totalDurationMs) * 100));
      setProgress(pct);

      const stepIdx = Math.min(
        AUDIT_STEPS.length - 1,
        Math.floor(elapsed / stepDurationMs)
      );
      setCurrentStepIndex(stepIdx);
    }, progressIntervalMs);

    try {
      // Concurrently wait for BOTH the network fetch and the 10-second trust duration
      const [fetchedResult] = await Promise.all([
        fetchPromise,
        new Promise((resolve) => setTimeout(resolve, totalDurationMs)),
      ]);

      clearInterval(progressTimer);
      setProgress(100);

      // Brief finish pause
      await new Promise((resolve) => setTimeout(resolve, 300));

      setResult(fetchedResult);

      // Auto-expand all errors by default
      const initialExp: Record<string, boolean> = {};
      fetchedResult.issues.forEach((issue: SeoIssue) => {
        if (issue.type === "error") initialExp[issue.id] = true;
      });
      setExpandedIssues(initialExp);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error("SEO Audit Error:", err);
      setError(err?.message || "Failed to complete SEO check. Please check the URL.");
    } finally {
      clearInterval(progressTimer);
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportPdf = async (chosenFilename: string) => {
    if (!result) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const usableWidth = pageWidth - margin * 2;
      let currentY = margin;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 42, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("Website SEO Audit Report", margin, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text(`Target URL: ${result.url}`, margin, 28);
      doc.text(`Generated on: ${new Date(result.timestamp).toLocaleDateString()}`, margin, 35);

      currentY = 54;

      // Score Summary Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(`Overall SEO Health Score: ${result.score}/100 (Grade ${result.grade})`, margin, currentY);

      currentY += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);

      // Category Scores
      const catText = [
        `Meta Tags: ${result.categoryScores.meta}/100`,
        `Headings Structure: ${result.categoryScores.headings}/100`,
        `Image Optimization: ${result.categoryScores.images}/100`,
        `Social Sharing: ${result.categoryScores.social}/100`,
        `Technical & Mobile: ${result.categoryScores.technical}/100`,
      ];
      doc.text(catText.join("  |  "), margin, currentY);

      currentY += 14;

      // Issues & Recommendations
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Audit Findings & Actionable Remediation:", margin, currentY);
      currentY += 8;

      for (const issue of result.issues) {
        // Page break check
        if (currentY > pageHeight - 35) {
          doc.addPage();
          currentY = margin;
        }

        // Issue status prefix
        let prefix = "[PASS] ";
        doc.setTextColor(16, 185, 129); // emerald
        if (issue.type === "error") {
          prefix = "[CRITICAL] ";
          doc.setTextColor(239, 68, 68); // red
        } else if (issue.type === "warning") {
          prefix = "[WARNING] ";
          doc.setTextColor(245, 158, 11); // amber
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${prefix}${issue.title}`, margin, currentY);
        currentY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const descLines = doc.splitTextToSize(issue.description, usableWidth);
        doc.text(descLines, margin + 2, currentY);
        currentY += descLines.length * 4.5 + 1;

        if (issue.recommendation) {
          doc.setFont("helvetica", "italic");
          doc.setTextColor(30, 41, 59);
          const recLines = doc.splitTextToSize(`How to fix: ${issue.recommendation}`, usableWidth);
          doc.text(recLines, margin + 2, currentY);
          currentY += recLines.length * 4.5 + 2;
        }

        currentY += 4; // spacing between issues
      }

      doc.save(chosenFilename);
      setIsExportModalOpen(false);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert("Failed to create PDF report: " + (err?.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const filteredIssues = result?.issues.filter((i) => {
    if (activeFilter === "all") return true;
    return i.type === activeFilter;
  }) || [];

  const errorCount = result?.issues.filter((i) => i.type === "error").length || 0;
  const warningCount = result?.issues.filter((i) => i.type === "warning").length || 0;
  const passedCount = result?.issues.filter((i) => i.type === "success").length || 0;

  const defaultExportName = result
    ? `${new URL(result.url).hostname.replace(/\./g, "-")}-seo-report.pdf`
    : "seo-audit-report.pdf";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Website SEO Checker & Auditor
            </h1>
            <p className="text-sm text-muted mt-1">
              Inspect on-page SEO, detect title & meta issues, heading tags, image alts, OpenGraph, and export PDF reports.
            </p>
          </div>
        </div>
      </div>

      {/* URL Input Form */}
      <Card className="p-6 border-border bg-card/70 mb-8 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAudit();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL to audit (e.g. https://yourdomain.com)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            isLoading={loading}
            leftIcon={<Search className="h-4 w-4" />}
            className="sm:w-44 font-semibold shrink-0"
          >
            {loading ? "Analyzing..." : "Audit SEO"}
          </Button>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="font-medium text-foreground">Quick Examples:</span>
          {SAMPLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAudit(s)}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline bg-brand-500/5 border border-brand-500/20 rounded-md px-2 py-0.5"
            >
              {s.replace("https://", "")}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* 10-Second Realistic Crawling & Data Gathering Progress */}
      {loading && (
        <Card className="p-6 sm:p-8 border-border bg-card/90 shadow-lg mb-8 overflow-hidden relative">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Deep SEO Crawl & Signal Analysis In Progress
                </h3>
                <p className="text-xs text-muted font-mono truncate max-w-md">
                  Target: <span className="text-foreground font-semibold">{url}</span>
                </p>
              </div>
            </div>

            {/* Progress Percentage Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-brand-500/10 border border-brand-500/20 px-3.5 py-1.5 rounded-full">
              <span className="text-xs text-muted font-medium">Gathering data:</span>
              <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">
                {progress}%
              </span>
            </div>
          </div>

          {/* Animated Gradient Progress Bar */}
          <div className="w-full bg-secondary/60 rounded-full h-3 overflow-hidden border border-border/60 p-0.5 mb-6">
            <div
              className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Active Highlight Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-brand-500/5 via-transparent to-emerald-500/5 border border-brand-500/20 mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-brand-500 shrink-0 animate-pulse" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {AUDIT_STEPS[currentStepIndex]?.label}
              </p>
              <p className="text-xs text-muted truncate">
                {AUDIT_STEPS[currentStepIndex]?.detail}
              </p>
            </div>
          </div>

          {/* Multi-Step Checklist of Crawl Milestones */}
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2">
              Audit Pipeline Checklist ({currentStepIndex + 1} of {AUDIT_STEPS.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AUDIT_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isPending = idx > currentStepIndex;

                return (
                  <div
                    key={step.label}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-all ${
                      isCurrent
                        ? "bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400 font-semibold shadow-sm"
                        : isCompleted
                        ? "bg-card border-border/60 text-foreground/80"
                        : "bg-card/40 border-border/30 text-muted/50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : isCurrent ? (
                        <RefreshCw className="h-4 w-4 text-brand-500 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted/40 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate leading-snug ${isCurrent ? "font-bold" : ""}`}>
                        {step.label}
                      </p>
                      <p className={`text-[11px] truncate mt-0.5 ${isCurrent ? "text-muted font-normal" : "text-muted/60"}`}>
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Banner */}
          <p className="text-center text-[11px] text-muted mt-6 border-t border-border/50 pt-4 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Simulating headless search bot crawl, Core Web Vitals readiness, and semantic schema compliance.</span>
          </p>
        </Card>
      )}

      {/* Audit Results */}
      {result && !loading && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Hero Score Summary Card */}
          <Card className="p-6 sm:p-8 border-border bg-card/80">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Score Display */}
              <div className="flex items-center gap-6">
                <div
                  className={`h-24 w-24 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-xl ${
                    result.score >= 85
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                      : result.score >= 65
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                      : "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20"
                  }`}
                >
                  <span className="text-3xl leading-none">{result.score}</span>
                  <span className="text-[11px] opacity-80 uppercase font-mono mt-0.5">/ 100</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
                      Grade: {result.grade}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        result.score >= 85
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : result.score >= 65
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {result.score >= 85 ? "Well Optimized" : result.score >= 65 ? "Needs Improvement" : "Critical Issues"}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mt-1 truncate max-w-[320px] sm:max-w-md">
                    {result.url}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Found {errorCount} critical issues, {warningCount} warnings, and {passedCount} passed audits.
                  </p>
                </div>
              </div>

              {/* Action Button: Export PDF */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsExportModalOpen(true)}
                  leftIcon={<Download className="h-4 w-4" />}
                  className="shadow-md shadow-brand-500/20 w-full sm:w-auto"
                >
                  Export PDF Report
                </Button>
              </div>
            </div>

            {/* Category Score Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-border">
              {[
                { label: "Meta Tags", score: result.categoryScores.meta, icon: FileCode },
                { label: "Headings", score: result.categoryScores.headings, icon: Layers },
                { label: "Images", score: result.categoryScores.images, icon: ImageIcon },
                { label: "Social", score: result.categoryScores.social, icon: Share2 },
                { label: "Technical", score: result.categoryScores.technical, icon: ShieldCheck },
              ].map((cat) => (
                <div key={cat.label} className="p-3 rounded-xl bg-background/60 border border-border/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-muted truncate">{cat.label}</span>
                    <span className="font-mono font-bold text-foreground">{cat.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.score >= 80
                          ? "bg-emerald-500"
                          : cat.score >= 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === "all" ? "bg-brand-500 text-white shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                All Checks ({result.issues.length})
              </button>
              <button
                onClick={() => setActiveFilter("error")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === "error" ? "bg-rose-600 text-white shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                Errors ({errorCount})
              </button>
              <button
                onClick={() => setActiveFilter("warning")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === "warning" ? "bg-amber-600 text-white shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                Warnings ({warningCount})
              </button>
              <button
                onClick={() => setActiveFilter("success")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === "success" ? "bg-emerald-600 text-white shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                Passed ({passedCount})
              </button>
            </div>
          </div>

          {/* Issue Cards */}
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const isExpanded = !!expandedIssues[issue.id];

              return (
                <Card
                  key={issue.id}
                  className={`p-4 sm:p-5 border transition-all ${
                    issue.type === "error"
                      ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                      : issue.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                      : "border-border bg-card/60"
                  }`}
                >
                  <div
                    className="flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => toggleExpand(issue.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {issue.type === "error" ? (
                          <AlertCircle className="h-5 w-5 text-rose-500" />
                        ) : issue.type === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            {issue.title}
                          </h3>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-semibold">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded text-muted hover:text-foreground"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Expandable Remediation / How to Fix */}
                  {isExpanded && (issue.recommendation || issue.codeSnippet) && (
                    <div className="mt-4 pt-3.5 border-t border-border/60 pl-8 space-y-2.5 animate-in fade-in">
                      {issue.recommendation && (
                        <div>
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 block mb-0.5">
                            💡 Recommended Action:
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            {issue.recommendation}
                          </p>
                        </div>
                      )}

                      {issue.codeSnippet && (
                        <div>
                          <span className="text-[11px] font-mono text-muted uppercase tracking-wider block mb-1">
                            Example Code Fix:
                          </span>
                          <pre className="p-3 rounded-lg bg-black/90 text-emerald-400 text-xs font-mono overflow-x-auto border border-border/80">
                            <code>{issue.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Filename Modal */}
      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportPdf}
        defaultFilename={defaultExportName}
        extension=".pdf"
        title="Export SEO Audit Report as PDF"
        description="Choose a filename for your SEO report before downloading."
        isProcessing={isExporting}
      />
    </div>
  );
}
