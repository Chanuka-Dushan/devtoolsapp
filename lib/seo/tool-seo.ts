import type { Metadata } from "next";
import { getToolBySlug, ToolConfig } from "@/lib/tools/registry";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://devtools-platform.com";

/**
 * Generates tailored SEO metadata for any tool by slug.
 */
export function generateToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Developer Tool | DevTools Platform",
      description: "Free online developer tool. Runs securely in your browser.",
    };
  }

  const title = `${tool.name} — Free Online Tool | DevTools Platform`;
  const description =
    tool.longDescription ||
    `${tool.description} Free, instant, and private. 100% runs directly in your browser.`;

  const canonical = `${BASE_URL}${tool.path}`;
  const keywords = [
    ...(tool.keywords || []),
    ...(tool.tags || []),
    "free online tool",
    "developer tools",
    "browser utility",
    "no signup",
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "DevTools Platform",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
  };
}

/**
 * Generates Google-compliant JSON-LD WebApplication schema for any tool.
 */
export function generateToolJsonLd(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const categoryMap: Record<string, string> = {
    developer: "DeveloperApplication",
    ai: "BusinessApplication",
    pdf: "UtilitiesApplication",
    images: "DesignApplication",
    encoding: "UtilitiesApplication",
    generators: "DeveloperApplication",
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${BASE_URL}${tool.path}`,
    applicationCategory: categoryMap[tool.category] || "UtilitiesApplication",
    operatingSystem: "All, Web Browser",
    browserRequirements: "Requires HTML5 compatible web browser with JavaScript enabled",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: tool.tags,
    keywords: tool.keywords?.join(", "),
  };
}
