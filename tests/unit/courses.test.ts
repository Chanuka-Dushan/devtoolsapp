import { describe, it, expect } from "vitest";
import { getFreeUdemyCourses } from "@/lib/courses/feed";

describe("Free Udemy Courses Service", () => {
  it(
    "fetches a list of free courses with required metadata",
    async () => {
      const courses = await getFreeUdemyCourses();
    expect(courses).toBeDefined();
    expect(Array.isArray(courses)).toBe(true);
    expect(courses.length).toBeGreaterThan(0);

    const first = courses[0];
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("link");
    expect(first).toHaveProperty("image");
    expect(first).toHaveProperty("category");
    expect(first).toHaveProperty("discount");
    expect(first.discount).toBe("100% OFF");
  }, 15000);
});
