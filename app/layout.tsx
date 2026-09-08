import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeScript } from "@/components/layout/ThemeToggle";
import { GoogleAdSense } from "@/components/ads/GoogleAdSense";
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
    default: "DevTools Platform — Free Developer Tools & AI Utilities",
    template: "%s | DevTools Platform",
  },
  description:
    "Fast, free developer tools and AI-powered utilities. JSON formatter, Base64, JWT decoder, regex tester, UUID generator, and more — all in your browser.",
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
    title: "DevTools Platform — Free Developer Tools & AI Utilities",
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
    title: "DevTools Platform — Free Developer Tools & AI Utilities",
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
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <GoogleAdSense />
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
