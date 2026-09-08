import { NextRequest, NextResponse } from "next/server";
import { TOOLS, AI_TOOLS } from "@/lib/tools/registry";
import { TUTORIALS, ARTICLES, NEWS_ITEMS } from "@/lib/content/data";
import { getFreeUdemyCourses } from "@/lib/courses/feed";

export interface SearchResult {
  title: string;
  description: string;
  href: string;
  type: "tool" | "ai" | "tutorial" | "blog" | "news" | "course";
  badge: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results: SearchResult[] = [];

  // 1. Search Developer Tools
  for (const tool of TOOLS) {
    if (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      (tool.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false)
    ) {
      results.push({
        title: tool.name,
        description: tool.description,
        href: `/tools/${tool.slug}`,
        type: "tool",
        badge: "Developer Tool",
      });
    }
  }

  // 2. Search AI Tools
  for (const tool of AI_TOOLS) {
    if (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      (tool.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false)
    ) {
      results.push({
        title: tool.name,
        description: tool.description,
        href: `/ai/${tool.slug}`,
        type: "ai",
        badge: "AI Tool",
      });
    }
  }

  // 3. Search Tutorials
  for (const tutorial of TUTORIALS) {
    if (
      tutorial.title.toLowerCase().includes(q) ||
      tutorial.excerpt.toLowerCase().includes(q) ||
      tutorial.category.toLowerCase().includes(q)
    ) {
      results.push({
        title: tutorial.title,
        description: tutorial.excerpt,
        href: `/tutorials/${tutorial.slug}`,
        type: "tutorial",
        badge: "Tutorial",
      });
    }
  }

  // 4. Search Blog Articles
  for (const article of ARTICLES) {
    if (
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q) ||
      article.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      results.push({
        title: article.title,
        description: article.excerpt,
        href: `/blog/${article.slug}`,
        type: "blog",
        badge: "Blog",
      });
    }
  }

  // 5. Search News
  for (const item of NEWS_ITEMS) {
    if (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      results.push({
        title: item.title,
        description: item.summary,
        href: `/news/${item.slug}`,
        type: "news",
        badge: "News",
      });
    }
  }

  // 6. Search Free Udemy Courses
  try {
    const courses = await getFreeUdemyCourses();
    for (const course of courses) {
      if (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q)
      ) {
        results.push({
          title: course.title,
          description: `${course.discount} • ${course.category} • ${course.description}`,
          href: `/courses`,
          type: "course",
          badge: "Free Udemy Course",
        });
      }
    }
  } catch {}

  return NextResponse.json({ results: results.slice(0, 15) });
}
