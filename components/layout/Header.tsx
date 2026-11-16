"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  Film,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import { SearchModal } from "./SearchModal";
import { useUsage } from "@/components/auth/UsageContext";

const mediaNav = [
  { href: "/tools/video-caption-generator", label: "AI Video Captions", icon: Film },
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
  { href: "/tools/video-caption-generator", label: "AI Video Captions", icon: Film },
  { href: "/ai/cover-letter-writer", label: "Cover Letter Writer", icon: FileText },
  { href: "/ai/code-explainer", label: "Code Explainer", icon: Sparkles },
  { href: "/ai/debugger", label: "AI Debugger", icon: Cpu },
  { href: "/ai/sql-generator", label: "SQL Generator", icon: Code2 },
];

// Normal users do NOT have a dashboard link. Only Super Admin has access.
const mainNav = [
  { href: "/tools", label: "Tools" },
  { href: "/ai", label: "AI Tools" },
  { href: "/courses", label: "Courses" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const { data: session, status } = useSession();
  const { isPro, isSuperAdmin, usageCount, freeTierLimit, hasUsedFreeTier, triggerUpgradeModal } = useUsage();

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              </Link>
            ))}

            {/* Super Admin Dashboard Link - STRICTLY ONLY for Super Admins */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                  "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30",
                  "transition-all duration-150 shadow-sm shadow-amber-500/10",
                  pathname.startsWith("/admin") && "bg-amber-500/25 border-amber-500/50"
                )}
              >
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>Super Admin</span>
              </Link>
            )}
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

            {/* Authentication & User Profile */}
            {status === "authenticated" && session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-border hover:bg-surface-elevated transition-all"
                  aria-expanded={userMenuOpen}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-7 w-7 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="hidden sm:flex flex-col text-left mr-1">
                    <span className="text-xs font-semibold text-foreground max-w-[100px] truncate leading-tight">
                      {session.user.name || session.user.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted flex items-center gap-1 leading-tight">
                      {isSuperAdmin ? (
                        <span className="text-amber-500 font-bold">Super Admin</span>
                      ) : isPro ? (
                        <span className="text-brand-500 font-bold">Pro Member</span>
                      ) : (
                        <span>{hasUsedFreeTier ? "Free (Used)" : "Free (1 left)"}</span>
                      )}
                    </span>
                  </div>

                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20 p-3 z-50 animate-slide-in">
                    <div className="px-2 py-2 border-b border-border mb-2">
                      <p className="text-xs font-bold text-foreground truncate">
                        {session.user.name || "Developer"}
                      </p>
                      <p className="text-[11px] text-muted truncate">{session.user.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {isSuperAdmin ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Super Admin
                          </span>
                        ) : isPro ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Pro Unlimited
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            hasUsedFreeTier
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          }`}>
                            {hasUsedFreeTier ? "Free Tier: 1/1 Used" : "Free Tier: 0/1 Used"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Free tier upgrade nudge */}
                    {!isPro && !isSuperAdmin && (
                      <div className="px-2 py-2 mb-2 bg-gradient-to-r from-brand-500/10 to-indigo-500/10 rounded-xl border border-brand-500/20">
                        <p className="text-xs font-semibold text-foreground">
                          {hasUsedFreeTier ? "Trial completed" : "1 Free Tier usage"}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          Upgrade to Pro for unlimited AI and media processing.
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full mt-2 text-xs py-1.5"
                          onClick={() => {
                            setUserMenuOpen(false);
                            triggerUpgradeModal();
                          }}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    )}

                    {/* Super Admin specific entry */}
                    {isSuperAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Super Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin" className="hidden sm:block">
                <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In</span>
                </Button>
              </Link>
            )}

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
                </Link>
              ))}

              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Super Admin Dashboard</span>
                </Link>
              )}

              <div className="mt-3 pt-3 border-t border-border">
                {status === "authenticated" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-rose-500"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sign Out ({session?.user?.email})
                  </Button>
                ) : (
                  <Link href="/auth/signin">
                    <Button variant="primary" size="sm" className="w-full">
                      Sign In with Google
                    </Button>
                  </Link>
                )}
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
