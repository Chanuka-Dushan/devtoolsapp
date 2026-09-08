"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  Send,
  Sliders,
  Briefcase,
  Building2,
  UserCheck,
  CheckCircle2,
  FileCode,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExportFilenameModal } from "@/components/tools/ExportFilenameModal";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";

const SAMPLE_JOB_DESCRIPTION = `Senior Full-Stack Engineer — NextGen Cloud Platform

About the Role:
We are seeking an exceptional Senior Full-Stack Engineer to architect, build, and scale our core cloud platform. You will lead technical design, deliver high-performance microservices, and build intuitive, lightning-fast web applications for hundreds of thousands of developers worldwide.

Key Responsibilities:
• Architect resilient, high-throughput distributed backends using TypeScript, Node.js, and PostgreSQL.
• Design responsive, modern client applications using Next.js, React, and Tailwind CSS.
• Optimize database queries, indexing, and API response latencies (<50ms).
• Collaborate cross-functionally with product managers and designers to drive new features from concept to production.
• Mentor junior and mid-level engineers through rigorous code reviews and architecture discussions.

Requirements:
• 5+ years of production experience with TypeScript/JavaScript, Node.js, and modern React/Next.js.
• Strong database design skills with SQL (PostgreSQL, MySQL) and ORMs (Prisma, Drizzle).
• Experience with cloud infrastructure (AWS/GCP), containerization (Docker), and CI/CD pipelines.
• Passion for developer tooling, clean code, and user experience.`;

const SAMPLE_EXPERIENCE = `5 years as a Senior Software Engineer. Proficient in TypeScript, Next.js, React, Node.js, PostgreSQL, and AWS. Built developer tools and analytics dashboards handling over 2M requests/month. Led team of 4 engineers and improved API latency by 45%.`;

export default function CoverLetterWriterPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [userExperience, setUserExperience] = useState("");
  const [tone, setTone] = useState<"modern" | "professional" | "enthusiastic" | "concise" | "executive">("modern");
  const [letterLength, setLetterLength] = useState<"standard" | "short" | "detailed">("standard");

  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"pdf" | "docx">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const handleLoadSample = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setJobTitle("Senior Full-Stack Engineer");
    setCompanyName("NextGen Cloud");
    setUserExperience(SAMPLE_EXPERIENCE);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          companyName,
          userExperience,
          tone,
          letterLength,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate cover letter.");
      }

      setCoverLetter(data.coverLetter);
    } catch (err: any) {
      console.error("Cover letter error:", err);
      setError(err?.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerExport = (type: "pdf" | "docx") => {
    setExportType(type);
    setExportModalOpen(true);
  };

  const handleExportConfirm = async (chosenFilename: string) => {
    if (!coverLetter) return;
    setIsExporting(true);

    try {
      if (exportType === "docx") {
        // Build DOCX document
        const paragraphs = coverLetter.split("\n").map((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("### ")) {
            return new Paragraph({
              children: [
                new TextRun({
                  text: trimmed.replace("### ", ""),
                  bold: true,
                  size: 26, // 13pt
                }),
              ],
              spacing: { before: 240, after: 120 },
            });
          }
          return new Paragraph({
            children: [
              new TextRun({
                text: trimmed,
                size: 22, // 11pt
              }),
            ],
            spacing: { after: 120, line: 276 },
          });
        });

        const doc = new Document({
          sections: [{ children: paragraphs }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = chosenFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Build PDF document
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const margin = 20;
        const pageWidth = 210;
        const pageHeight = 297;
        const usableWidth = pageWidth - margin * 2;
        let currentY = margin;

        const lines = coverLetter.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            currentY += 4;
            continue;
          }

          if (trimmed.startsWith("### ")) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(25, 25, 25);
            currentY += 2;
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);
            doc.setTextColor(45, 45, 45);
          }

          const wrapped = doc.splitTextToSize(
            trimmed.replace("### ", ""),
            usableWidth
          );

          if (currentY + wrapped.length * 5 > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }

          doc.text(wrapped, margin, currentY);
          currentY += wrapped.length * 5 + 1.5;
        }

        doc.save(chosenFilename);
      }

      setExportModalOpen(false);
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Failed to export: " + (err?.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const defaultExportBase = companyName
    ? `Cover-Letter-${companyName.replace(/\s+/g, "-")}`
    : "Tailored-Cover-Letter";

  const defaultExportName = `${defaultExportBase}.${exportType}`;
  const wordCount = coverLetter.trim()
    ? coverLetter.trim().split(/\s+/).length
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm">
            <Sparkles className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              AI Cover Letter Writer
            </h1>
            <p className="text-sm text-muted mt-1">
              Generate a tailored, ATS-optimized cover letter directly from any job description in seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form Inputs */}
        <div className="space-y-5">
          <Card className="p-6 border-border bg-card/60 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brand-500" />
                Job & Position Details
              </h2>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Load Sample Job
              </button>
            </div>

            {/* Target Job Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Job Title (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Company Name (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe, OpenAI, Google"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Paste Job Description <span className="text-error">*</span>
                </label>
                <span className="text-[10px] text-muted">
                  {jobDescription.length} characters
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description or requirements here..."
                rows={7}
                className="w-full rounded-xl border border-input bg-background p-3.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed resize-y font-mono"
              />
            </div>

            {/* Candidate Experience / Highlights */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Your Key Experience or Resume Bullets (Optional)
              </label>
              <textarea
                value={userExperience}
                onChange={(e) => setUserExperience(e.target.value)}
                placeholder="Mention your key accomplishments, tech stack, or years of experience to weave into the letter..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed resize-y"
              />
            </div>

            {/* Tone & Length Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              {/* Tone */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Writing Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
                >
                  <option value="modern">Modern & Confident (Recommended)</option>
                  <option value="professional">Formal & Professional</option>
                  <option value="enthusiastic">Enthusiastic & Proactive</option>
                  <option value="concise">Concise & Direct</option>
                  <option value="executive">Executive & Strategic</option>
                </select>
              </div>

              {/* Length */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Letter Length
                </label>
                <select
                  value={letterLength}
                  onChange={(e) => setLetterLength(e.target.value as any)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="standard">Standard (~350 words)</option>
                  <option value="short">Short & Punchy (~220 words)</option>
                  <option value="detailed">In-depth (~480 words)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-xs text-error">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              disabled={isLoading || !jobDescription.trim()}
              isLoading={isLoading}
              className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-brand-500/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Tailored Cover Letter</span>
            </Button>
          </Card>
        </div>

        {/* Right Column: Generated Letter Preview & Actions */}
        <div className="space-y-4">
          <Card className="p-6 border-border bg-card/60 flex flex-col h-full min-h-[560px] shadow-sm">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Generated Cover Letter
                </h3>
                {wordCount > 0 && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                    {wordCount} words
                  </span>
                )}
              </div>

              {coverLetter && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerExport("docx")}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                  >
                    Word
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerExport("pdf")}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                  >
                    PDF
                  </Button>
                </div>
              )}
            </div>

            {/* Content Area */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mb-3" />
                <p className="text-sm font-semibold text-foreground">
                  Analyzing job requirements & writing cover letter...
                </p>
                <p className="text-xs text-muted mt-1 max-w-sm">
                  Mapping key skills and formulating an ATS-aligned personalized introduction.
                </p>
              </div>
            ) : coverLetter ? (
              <div className="flex-1 flex flex-col space-y-3">
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={20}
                  className="w-full flex-1 rounded-xl border border-input bg-background/50 p-4 text-xs sm:text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans shadow-inner resize-y"
                />
                <div className="p-2.5 rounded-xl bg-muted/30 text-[11px] text-muted flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                  <span>
                    You can edit the text directly in the box above before copying or exporting. When downloading as Word or PDF, you will be prompted for your custom filename.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted">
                <FileCode className="h-12 w-12 text-muted/40 mb-3" />
                <p className="text-sm font-medium text-foreground">
                  No cover letter generated yet
                </p>
                <p className="text-xs text-muted mt-1 max-w-xs">
                  Paste a job description on the left and click Generate to produce a personalized, ATS-optimized cover letter.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Export Filename Modal */}
      <ExportFilenameModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        defaultFilename={defaultExportName}
        extension={exportType === "pdf" ? ".pdf" : ".docx"}
        title={`Export Cover Letter as ${exportType.toUpperCase()}`}
        description="Specify a custom filename for your generated cover letter before downloading."
        isProcessing={isExporting}
      />
    </div>
  );
}
