"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    setTheme(stored ?? "system");
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // System
      localStorage.removeItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme, mounted]);

  const cycleTheme = () => {
    setTheme((current) => {
      if (current === "system") return "light";
      if (current === "light") return "dark";
      return "system";
    });
  };

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg bg-surface-elevated animate-pulse" />
    );
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label =
    theme === "dark"
      ? "Switch to light mode"
      : theme === "light"
        ? "Switch to system theme"
        : "Switch to dark mode";

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "h-9 w-9 flex items-center justify-center rounded-lg",
        "text-muted hover:text-foreground hover:bg-surface-elevated",
        "transition-colors duration-150"
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/**
 * Inline script to set theme before React hydrates (avoids flash).
 * Add this to the <head> in layout.tsx.
 */
export const ThemeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;
