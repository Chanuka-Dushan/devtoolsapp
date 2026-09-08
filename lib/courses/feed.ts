/**
 * Free Udemy Courses Service
 *
 * Scrapes and aggregates live 100% OFF courses from CouponAmI / DiscUdemy.
 * Rewrites deprecated udemy-images.udemy.com to img-c.udemycdn.com to ensure 100% image load success.
 * Fetches multiple pages in parallel to deliver 50+ unique courses.
 */

export interface UdemyCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  link: string;
  image: string;
  publishedAt: string;
  instructor?: string;
  category: string;
  originalPrice: string;
  discount: string;
}

// In-memory cache keyed by page number
const cache = new Map<number, { courses: UdemyCourse[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function sanitizeImageUrl(rawUrl: string): string {
  if (!rawUrl) return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=270&fit=crop";
  // Fix 403 Forbidden caused by deprecated udemy-images hostname
  return rawUrl.replace("udemy-images.udemy.com", "img-c.udemycdn.com");
}

function formatCategory(rawCat: string): string {
  const cat = (rawCat || "").toLowerCase().trim();
  if (cat.includes("machine") || cat.includes("ai") || cat.includes("learning")) {
    return "AI & Machine Learning";
  }
  if (cat.includes("python") || cat.includes("java") || cat.includes("programming")) {
    return "Programming";
  }
  if (cat.includes("web") || cat.includes("php") || cat.includes("javascript")) {
    return "Web Development";
  }
  if (cat.includes("sql") || cat.includes("database") || cat.includes("data")) {
    return "Data & Databases";
  }
  if (cat.includes("office") || cat.includes("productivity") || cat.includes("word") || cat.includes("excel")) {
    return "Office Productivity";
  }
  if (cat.includes("marketing") || cat.includes("business")) {
    return "Marketing & Business";
  }
  if (cat.includes("security") || cat.includes("ethical")) {
    return "Cybersecurity";
  }
  return rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
}

/**
 * Scrape a specific page of English 100% OFF courses from CouponAmI.
 */
export async function fetchCoursePage(pageNumber: number = 1): Promise<UdemyCourse[]> {
  const now = Date.now();
  const cached = cache.get(pageNumber);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.courses;
  }

  const url = `https://www.couponami.com/language/english/${pageNumber}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      console.warn(`[Courses Feed] Page ${pageNumber} returned status ${res.status}`);
      return cached?.courses || [];
    }

    const html = await res.text();
    const courses: UdemyCourse[] = [];
    const cardRegex = /<section class=["']card["']>([\s\S]*?)<\/section>/g;
    let match: RegExpExecArray | null;

    while ((match = cardRegex.exec(html)) !== null) {
      const block = match[1];
      if (block.includes("adsbygoogle") || !block.includes("card-header")) {
        continue;
      }

      // Title & Link
      const linkMatch = block.match(
        /<a class=["']card-header["'] href=["']([^"']+)["']>([\s\S]*?)<\/a>/i
      );
      if (!linkMatch) continue;

      const rawTitle = linkMatch[2].replace(/<[^>]+>/g, "").trim();
      const courseUrl = linkMatch[1].trim();

      // Image
      const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      const rawImage = imgMatch ? imgMatch[1] : "";
      const image = sanitizeImageUrl(rawImage);

      // Description
      const descMatch = block.match(/<div class=["']description["']>([\s\S]*?)<\/div>/i);
      const description = descMatch
        ? descMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").replace(/Total:?$/i, "").trim()
        : "Complete 100% OFF premium Udemy course deal.";

      // Category
      const catMatch = block.match(/<span class=["']catSpan["']>([^<]+)<\/span>/i);
      const rawCategory = catMatch ? catMatch[1].trim() : "Technology";
      const category = formatCategory(rawCategory);

      // Original Price
      const origPriceMatch = block.match(/line-through[^>]*>\$?([0-9]+)</i);
      const originalPrice = origPriceMatch ? `$${origPriceMatch[1]}.00` : "$49.99";

      // Slug / ID
      const slug = courseUrl.replace(/^https?:\/\/[^\/]+\/+/, "").replace(/\/+$/, "");
      const id = slug || `course-${pageNumber}-${courses.length}`;

      courses.push({
        id,
        title: rawTitle,
        slug,
        description,
        link: courseUrl,
        image,
        publishedAt: new Date().toISOString(),
        category,
        originalPrice,
        discount: "100% OFF",
      });
    }

    if (courses.length > 0) {
      cache.set(pageNumber, { courses, timestamp: now });
    }

    return courses;
  } catch (err) {
    console.error(`[Courses Feed] Error fetching page ${pageNumber}:`, err);
    return cached?.courses || [];
  }
}

/**
 * Fetch top courses across multiple pages (e.g. pages 1, 2, 3 -> 45+ unique courses).
 */
export async function getFreeUdemyCourses(limitPages: number = 3): Promise<UdemyCourse[]> {
  const pagePromises: Promise<UdemyCourse[]>[] = [];
  for (let i = 1; i <= limitPages; i++) {
    pagePromises.push(fetchCoursePage(i));
  }

  const results = await Promise.all(pagePromises);
  const combined = results.flat();

  // Deduplicate by link/slug
  const seen = new Set<string>();
  const uniqueCourses: UdemyCourse[] = [];
  for (const c of combined) {
    if (!seen.has(c.link)) {
      seen.add(c.link);
      uniqueCourses.push(c);
    }
  }

  return uniqueCourses;
}
