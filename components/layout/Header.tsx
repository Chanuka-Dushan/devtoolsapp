"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  Braces,
  Cpu,
  BookOpen,
  Newspaper,
  FileText,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Search,
  FileImage,
  Image as ImageIcon,
  Scaling,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import { SearchModal } from "./SearchModal";

const mediaNav = [
  { href: "/tools/image-converter", label: "Image Converter", icon: ImageIcon },
  { href: "/tools/image-resizer", label: "Image Resizer", icon: Scaling },
  { href: "/tools/gemini-watermark-remover", label: "Gemini Watermark", icon: Wand2 },
  { href: "/tools/image-to-svg", label: "Image to SVG", icon: FileText },
  { href: "/tools/images-to-pdf", label: "Images to PDF", icon: FileImage },
  { href: "/tools/pdf-to-image", label: "PDF to Image", icon: FileText },
  { href: "/tools/pdf-to-word", label: "PDF to Word", icon: FileText },
  { href: "/tools/word-to-pdf", label: "Word to PDF", icon: FileText },
];

const devToolsNav = [
  { href: "/tools/seo-checker", label: "Website SEO Checker", icon: Search },
  { href: "/tools/json-formatter", label: "JSON Formatter", icon: Braces },
  { href: "/tools/base64", label: "Base64", icon: Code2 },
  { href: "/tools/jwt-decoder", label: "JWT Decoder", icon: Code2 },
  { href: "/tools/uuid", label: "UUID Generator", icon: Code2 },
  { href: "/tools/regex-tester", label: "Regex Tester", icon: Code2 },
  { href: "/tools/hash-generator", label: "Hash Generator", icon: Code2 },
];

const toolsNav = [...mediaNav, ...devToolsNav];

const aiNav = [
  { href: "/ai/cover-letter-writer", label: "Cover Letter Writer", icon: FileText },
  { href: "/ai/code-explainer", label: "Code Explainer", icon: Sparkles },
  { href: "/ai/debugger", label: "AI Debugger", icon: Cpu },
  { href: "/ai/sql-generator", label: "SQL Generator", icon: Code2 },
];

const mainNav = [
  { href: "/tools", label: "Tools" },
  { href: "/ai", label: "AI Tools" },
  { href: "/courses", label: "Courses" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
  { href: "/dashboard", label: "Dashboard", badge: "Soon" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const toolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToolsEnter = () => {
    if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
    setToolsOpen(true);
  };

  const handleToolsLeave = () => {
    if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
    toolsTimeoutRef.current = setTimeout(() => {
      setToolsOpen(false);
    }, 280);
  };

  const handleAiEnter = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setAiOpen(true);
  };

  const handleAiLeave = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    aiTimeoutRef.current = setTimeout(() => {
      setAiOpen(false);
    }, 280);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        "nav-glass border-b",
        scrolled ? "border-border shadow-sm shadow-black/5" : "border-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            aria-label="DevTools Platform - Home"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md shadow-brand-500/30">
              <Code2 className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-foreground text-base tracking-tight">
              DevTools
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {/* Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleToolsEnter}
              onMouseLeave={handleToolsLeave}
            >
              <button
                onClick={() => setToolsOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium",
                  "text-muted hover:text-foreground hover:bg-surface-elevated",
                  "transition-colors duration-150",
                  pathname.startsWith("/tools") && "text-foreground bg-surface-elevated"
                )}
                aria-expanded={toolsOpen}
                aria-haspopup="true"
              >
                Tools
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    toolsOpen && "rotate-180"
                  )}
                />
              </button>

              {toolsOpen && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-[460px] rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20 p-4 animate-slide-in before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] z-50"
                  onMouseEnter={handleToolsEnter}
                  onMouseLeave={handleToolsLeave}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Media & PDF Tools */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1.5 block">
                        Media & Document Tools
                      </span>
                      <div className="space-y-0.5">
                        {mediaNav.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setToolsOpen(false)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                          >
                            <item.icon className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Developer Utilities */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1.5 block">
                        Developer Utilities
                      </span>
                      <div className="space-y-0.5">
                        {devToolsNav.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setToolsOpen(false)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                          >
                            <item.icon className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted">14 free browser tools</span>
                    <Link
                      href="/tools"
                      onClick={() => setToolsOpen(false)}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      View all tools →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* AI Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleAiEnter}
              onMouseLeave={handleAiLeave}
            >
              <button
                onClick={() => setAiOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium",
                  "text-muted hover:text-foreground hover:bg-surface-elevated",
                  "transition-colors duration-150",
                  pathname.startsWith("/ai") && "text-foreground bg-surface-elevated"
                )}
                aria-expanded={aiOpen}
                aria-haspopup="true"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                AI Tools
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    aiOpen && "rotate-180"
                  )}
                />
              </button>

              {aiOpen && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-border bg-surface shadow-xl shadow-black/10 py-2 animate-slide-in before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] z-50"
                  onMouseEnter={handleAiEnter}
                  onMouseLeave={handleAiLeave}
                >
                  {aiNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAiOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {[
              { href: "/courses", label: "Courses" },
              { href: "/tutorials", label: "Tutorials" },
              { href: "/blog", label: "Blog" },
              { href: "/news", label: "News" },
              { href: "/dashboard", label: "Dashboard", badge: "Soon" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5",
                  "text-muted hover:text-foreground hover:bg-surface-elevated",
                  "transition-colors duration-150",
                  pathname.startsWith(item.href) && "text-foreground bg-surface-elevated"
                )}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 leading-tight">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              aria-label="Search (Cmd+K)"
              title="Search (Ctrl+K or Cmd+K)"
            >
              <Search className="h-4 w-4" />
            </button>

            <ThemeToggle />

            <Link href="/auth/signin" className="hidden sm:block">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav
            className="md:hidden border-t border-border py-4 animate-slide-in"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium",
                    "text-muted hover:text-foreground hover:bg-surface-elevated transition-colors",
                    pathname.startsWith(item.href) && "text-foreground bg-surface-elevated"
                  )}
                >
                  <span>{item.label}</span>
                  {(item as any).badge && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-border">
                <Link href="/auth/signin">
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Global Search Dialog */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
