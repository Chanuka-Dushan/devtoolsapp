import Link from "next/link";
import { Code2, Rss } from "lucide-react";

const footerLinks = {
  Tools: [
    { href: "/tools/json-formatter", label: "JSON Formatter" },
    { href: "/tools/base64", label: "Base64" },
    { href: "/tools/jwt-decoder", label: "JWT Decoder" },
    { href: "/tools/uuid", label: "UUID Generator" },
    { href: "/tools/regex-tester", label: "Regex Tester" },
    { href: "/tools", label: "All Tools →" },
  ],
  "AI Tools": [
    { href: "/ai/code-explainer", label: "Code Explainer" },
    { href: "/ai/debugger", label: "AI Debugger" },
    { href: "/ai/sql-generator", label: "SQL Generator" },
  ],
  Resources: [
    { href: "/tutorials", label: "Tutorials" },
    { href: "/blog", label: "Blog" },
    { href: "/news", label: "Tech News" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top section */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6 mb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-3"
              aria-label="DevTools Platform - Home"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-sm shadow-brand-500/20">
                <Code2 className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-foreground">DevTools</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Fast, free developer tools and AI-powered utilities for engineers worldwide.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-muted hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="text-muted hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="/rss"
                aria-label="RSS Feed"
                className="text-muted hover:text-foreground transition-colors"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {year} DevTools Platform. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
