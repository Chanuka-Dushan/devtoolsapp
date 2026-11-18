import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeScript } from "@/components/layout/ThemeToggle";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// ─── Site Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "DevTools Platform - Free Developer Tools & AI Utilities",
    template: "%s | DevTools Platform",
  },
  description:
    "Fast, free developer tools and AI-powered utilities. JSON formatter, Base64, JWT decoder, regex tester, UUID generator, and more - all in your browser.",
  keywords: [
    "developer tools",
    "json formatter",
    "base64 encoder",
    "jwt decoder",
    "regex tester",
    "uuid generator",
    "ai code explainer",
    "sql generator",
    "free online tools",
  ],
  authors: [{ name: "DevTools Platform" }],
  creator: "DevTools Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DevTools Platform",
    title: "DevTools Platform - Free Developer Tools & AI Utilities",
    description:
      "Fast, free developer tools and AI-powered utilities for developers worldwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevTools Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevTools Platform - Free Developer Tools & AI Utilities",
    description:
      "Fast, free developer tools and AI-powered utilities for developers worldwide.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/tool.png" },
      { url: "/tool.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/tool.png",
    apple: "/tool.png",
  },
  manifest: "/manifest.json",
};

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline theme script to prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: ThemeScript }} />
        <link rel="icon" href="/tool.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/tool.png" />
        {/* Defensive guard for AdSense / Google Tag Measurement stubs */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.google_tag_data = window.google_tag_data || {}; window.google_tag_data.ics = window.google_tag_data.ics || {}; window.google_tag_data.ics.entries = window.google_tag_data.ics.entries || {}; window.dataLayer = window.dataLayer || [];`,
          }}
        />
        {/* Google AdSense - Safe non-blocking load */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8977352924106394"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
