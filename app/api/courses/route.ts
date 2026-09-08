import { NextRequest, NextResponse } from "next/server";
import { getFreeUdemyCourses, fetchCoursePage } from "@/lib/courses/feed";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const category = (searchParams.get("category") || "").toLowerCase().trim();
    const pageParam = searchParams.get("page");

    let allCourses;
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10) || 1;
      allCourses = await fetchCoursePage(pageNum);
    } else {
      // Default: fetch 45+ courses across 3 pages
      allCourses = await getFreeUdemyCourses(3);
    }

    let filtered = allCourses;

    if (q) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.instructor && c.instructor.toLowerCase().includes(q))
      );
    }

    if (category && category !== "all") {
      filtered = filtered.filter((c) => c.category.toLowerCase().includes(category));
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      courses: filtered,
    });
  } catch (err) {
    console.error("[Courses API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
