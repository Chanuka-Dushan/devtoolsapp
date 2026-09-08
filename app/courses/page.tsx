"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  ExternalLink,
  Search,
  RefreshCw,
  Flame,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { UdemyCourse } from "@/lib/courses/feed";

const CATEGORIES = [
  "All",
  "AI & Machine Learning",
  "Programming",
  "Web Development",
  "Data & Databases",
  "Office Productivity",
  "Marketing & Business",
  "Cybersecurity",
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<UdemyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(3); // initially pages 1-3 loaded
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadInitialCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/courses?page=${nextPage}`);
      const data = await res.json();
      if (data.courses && data.courses.length > 0) {
        setCourses((prev) => {
          const existingIds = new Set(prev.map((c) => c.link));
          const newUnique = data.courses.filter((c: UdemyCourse) => !existingIds.has(c.link));
          return [...prev, ...newUnique];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more courses:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesCat =
      selectedCategory === "All" ||
      course.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor &&
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Banner */}
      <div className="max-w-4xl mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-4">
          <Flame className="h-3.5 w-3.5 text-emerald-500" />
          Live Verified 100% OFF Coupons • Updated Daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Free Premium Udemy Courses & Coupons
        </h1>
        <p className="mt-3 text-base text-muted leading-relaxed">
          Access high-rated development, AI, cloud certification, and programming courses for $0.
          All promo codes are verified working with distinct course covers and direct redemption links.
        </p>
      </div>

      {/* Control Bar: Search + Stats + Refresh */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-8 border-b border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search 45+ free courses (AI, Python, SQL, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Count & Refresh button */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-medium hidden sm:inline">
            Showing <strong className="text-foreground">{filteredCourses.length}</strong> deals
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadInitialCourses}
            disabled={loading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Deals
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && courses.length === 0 && (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent" />
          <p className="mt-4 text-sm text-muted">Fetching live 100% OFF coupons and course covers...</p>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="flex flex-col justify-between overflow-hidden group hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-200"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.image}
                  alt={course.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // If CDN image fails, ensure valid fallback
                    if (!target.src.includes("placeholder")) {
                      target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=270&fit=crop";
                    }
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[11px] shadow-sm uppercase tracking-wide">
                    100% OFF
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-slate-200 font-medium text-[11px]">
                    English
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {course.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="line-through text-muted-foreground">
                      {course.originalPrice}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      $0 Free
                    </span>
                  </div>
                </div>

                <a
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h2 className="text-base font-bold text-foreground group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                    {course.title}
                  </h2>
                </a>

                <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {course.instructor && (
                  <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{course.instructor}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-5 pt-0">
              <a
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button
                  variant="primary"
                  className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm whitespace-nowrap flex-nowrap"
                >
                  <span className="whitespace-nowrap">Claim 100% Free Course</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {!loading && filteredCourses.length > 0 && hasMore && selectedCategory === "All" && !searchQuery && (
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 font-semibold"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading more courses...
              </span>
            ) : (
              "Load More Free Courses (Page " + (page + 1) + ") →"
            )}
          </Button>
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border p-8">
          <p className="text-base font-semibold text-foreground">
            No courses found matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <p className="text-xs text-muted mt-1">
            Try clearing your search query or selecting &ldquo;All&rdquo; categories.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
