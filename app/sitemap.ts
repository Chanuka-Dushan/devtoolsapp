import { MetadataRoute } from "next";
import { TOOLS, AI_TOOLS } from "@/lib/tools/registry";
import { TUTORIALS, ARTICLES, NEWS_ITEMS } from "@/lib/content/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/ai`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/courses`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/tutorials`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/dashboard`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/auth/signin`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Tool pages
  const toolPages: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: tool.isPopular ? 0.85 : 0.75,
  }));

  // AI Tool pages
  const aiPages: MetadataRoute.Sitemap = AI_TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Tutorials
  const tutorialPages: MetadataRoute.Sitemap = TUTORIALS.map((t) => ({
    url: `${baseUrl}/tutorials/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Articles
  const articlePages: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${baseUrl}/blog/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // News
  const newsPages: MetadataRoute.Sitemap = NEWS_ITEMS.map((n) => ({
    url: `${baseUrl}/news/${n.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...toolPages,
    ...aiPages,
    ...tutorialPages,
    ...articlePages,
    ...newsPages,
  ];
}
