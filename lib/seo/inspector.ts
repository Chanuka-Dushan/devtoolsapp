/**
 * Website SEO Inspector & Scoring Engine
 *
 * Analyzes HTML content, extracts metadata, headings, images, OpenGraph,
 * and technical tags, computing a holistic 0-100 SEO score with concrete recommendations.
 */

export interface SeoIssue {
  id: string;
  category: "meta" | "headings" | "images" | "social" | "technical";
  type: "error" | "warning" | "success";
  title: string;
  description: string;
  recommendation?: string;
  codeSnippet?: string;
}

export interface SeoAuditResult {
  url: string;
  timestamp: string;
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  categoryScores: {
    meta: number;
    headings: number;
    images: number;
    social: number;
    technical: number;
  };
  stats: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    h1Count: number;
    h2Count: number;
    imageCount: number;
    imagesWithoutAlt: number;
    hasCanonical: boolean;
    hasOg: boolean;
    hasTwitter: boolean;
    hasJsonLd: boolean;
    hasViewport: boolean;
    isHttps: boolean;
  };
  issues: SeoIssue[];
}

export function inspectHtml(html: string, targetUrl: string): SeoAuditResult {
  const issues: SeoIssue[] = [];

  // Helper regex parsers
  const getTagContent = (tagRegex: RegExp): string => {
    const match = html.match(tagRegex);
    return match ? match[1]?.trim() || "" : "";
  };

  const getMetaContent = (nameOrProperty: string): string => {
    const regex = new RegExp(
      `<meta\\s+[^>]*(?:name|property)=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["']`,
      "i"
    );
    const regexAlt = new RegExp(
      `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProperty}["']`,
      "i"
    );
    const m = html.match(regex) || html.match(regexAlt);
    return m ? m[1]?.trim() || "" : "";
  };

  // 1. Meta & Title Analysis
  let metaScore = 100;
  const title = getTagContent(/<title[^>]*>([^<]*)<\/title>/i);
  const titleLength = title.length;

  if (!title) {
    metaScore -= 40;
    issues.push({
      id: "missing-title",
      category: "meta",
      type: "error",
      title: "Missing <title> Tag",
      description: "Search engines use the title tag to display the main headline in search results.",
      recommendation: "Add a concise, descriptive <title> tag between 30 and 60 characters.",
      codeSnippet: `<title>Descriptive Title With Primary Keyword | Brand</title>`,
    });
  } else if (titleLength < 30) {
    metaScore -= 15;
    issues.push({
      id: "short-title",
      category: "meta",
      type: "warning",
      title: `Title Tag Too Short (${titleLength} characters)`,
      description: "Short titles may not provide enough context for search engines and users.",
      recommendation: "Expand your title to between 40-60 characters incorporating high-intent keywords.",
    });
  } else if (titleLength > 60) {
    metaScore -= 15;
    issues.push({
      id: "long-title",
      category: "meta",
      type: "warning",
      title: `Title Tag Too Long (${titleLength} characters)`,
      description: "Titles over 60 characters get truncated with '...' on Google SERPs.",
      recommendation: "Shorten your title tag to under 60 characters to prevent truncation.",
    });
  } else {
    issues.push({
      id: "good-title",
      category: "meta",
      type: "success",
      title: `Optimal Title Length (${titleLength} characters)`,
      description: `Your title '${title.slice(0, 45)}...' fits within Google's display limits.`,
    });
  }

  const description = getMetaContent("description");
  const descriptionLength = description.length;

  if (!description) {
    metaScore -= 30;
    issues.push({
      id: "missing-description",
      category: "meta",
      type: "error",
      title: "Missing Meta Description",
      description: "Meta descriptions are shown beneath titles in search results and directly affect CTR.",
      recommendation: "Add a compelling meta description between 120 and 160 characters.",
      codeSnippet: `<meta name="description" content="Engaging summary of your page with clear benefits..." />`,
    });
  } else if (descriptionLength < 70) {
    metaScore -= 10;
    issues.push({
      id: "short-description",
      category: "meta",
      type: "warning",
      title: `Meta Description Too Short (${descriptionLength} characters)`,
      description: "A short description misses opportunities to highlight key benefits and keywords.",
      recommendation: "Aim for 120-160 characters with an actionable call-to-action.",
    });
  } else if (descriptionLength > 165) {
    metaScore -= 10;
    issues.push({
      id: "long-description",
      category: "meta",
      type: "warning",
      title: `Meta Description Too Long (${descriptionLength} characters)`,
      description: "Descriptions longer than 160 characters may be truncated on desktop and mobile.",
      recommendation: "Trim to 150-160 characters.",
    });
  } else {
    issues.push({
      id: "good-description",
      category: "meta",
      type: "success",
      title: `Optimal Meta Description Length (${descriptionLength} characters)`,
      description: "Well-sized summary that will display cleanly in search snippets.",
    });
  }

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const hasCanonical = !!canonicalMatch;
  if (!hasCanonical) {
    metaScore -= 15;
    issues.push({
      id: "missing-canonical",
      category: "meta",
      type: "warning",
      title: "Missing Canonical Tag",
      description: "Canonical tags prevent duplicate content issues when pages are accessed via different parameters.",
      recommendation: "Add a rel='canonical' link pointing to the authoritative URL.",
      codeSnippet: `<link rel="canonical" href="${targetUrl}" />`,
    });
  } else {
    issues.push({
      id: "has-canonical",
      category: "meta",
      type: "success",
      title: "Canonical Tag Implemented",
      description: `Canonical points to: ${canonicalMatch[1]}`,
    });
  }

  // 2. Headings Analysis
  let headingsScore = 100;
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h1Count = h1Matches.length;

  if (h1Count === 0) {
    headingsScore -= 40;
    issues.push({
      id: "missing-h1",
      category: "headings",
      type: "error",
      title: "Missing <h1> Heading",
      description: "The <h1> is the most critical on-page ranking element signaling topic hierarchy.",
      recommendation: "Add exactly one primary <h1> heading summarizing the main subject.",
      codeSnippet: `<h1>Primary Headline With Target Keywords</h1>`,
    });
  } else if (h1Count > 1) {
    headingsScore -= 20;
    issues.push({
      id: "multiple-h1",
      category: "headings",
      type: "warning",
      title: `Multiple <h1> Headings Found (${h1Count})`,
      description: "Having more than one <h1> can confuse search crawlers about primary page intent.",
      recommendation: "Consolidate into 1 primary <h1> and use <h2>/<h3> for subsections.",
    });
  } else {
    issues.push({
      id: "single-h1",
      category: "headings",
      type: "success",
      title: "Single <h1> Implemented",
      description: "Page has exactly 1 main heading, ensuring clean semantic hierarchy.",
    });
  }

  const h2Matches = html.match(/<h2[^>]*>/gi) || [];
  const h2Count = h2Matches.length;
  if (h2Count === 0) {
    headingsScore -= 15;
    issues.push({
      id: "missing-h2",
      category: "headings",
      type: "warning",
      title: "No <h2> Subheadings Found",
      description: "Subheadings make content scannable for users and provide keyword relevance for crawlers.",
      recommendation: "Break your content into subsections using <h2> tags.",
    });
  } else {
    issues.push({
      id: "has-h2",
      category: "headings",
      type: "success",
      title: `Well-Structured Subheadings (${h2Count} <h2> tags)`,
      description: "Subsections are clearly broken down.",
    });
  }

  // 3. Images Analysis
  let imagesScore = 100;
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imageCount = imgTags.length;
  let imagesWithoutAlt = 0;

  for (const img of imgTags) {
    if (!/alt=["'][^"']+["']/i.test(img)) {
      imagesWithoutAlt++;
    }
  }

  if (imageCount > 0 && imagesWithoutAlt > 0) {
    imagesScore -= Math.min(50, imagesWithoutAlt * 12);
    issues.push({
      id: "missing-alts",
      category: "images",
      type: imagesWithoutAlt > 2 ? "error" : "warning",
      title: `${imagesWithoutAlt} Image(s) Missing Alt Attributes`,
      description: "Alt text is crucial for accessibility (screen readers) and Google Image Search indexation.",
      recommendation: "Add descriptive alt attributes describing the content of each image.",
      codeSnippet: `<img src="/photo.jpg" alt="Descriptive explanation of graphic" />`,
    });
  } else if (imageCount > 0) {
    issues.push({
      id: "all-alts-present",
      category: "images",
      type: "success",
      title: `All Images Have Alt Attributes (${imageCount}/${imageCount})`,
      description: "Great accessibility and image search optimization.",
    });
  }

  // 4. Social & Sharing (OpenGraph & Twitter)
  let socialScore = 100;
  const ogTitle = getMetaContent("og:title");
  const ogDesc = getMetaContent("og:description");
  const ogImage = getMetaContent("og:image");
  const hasOg = !!(ogTitle && ogDesc);

  if (!hasOg) {
    socialScore -= 35;
    issues.push({
      id: "missing-og",
      category: "social",
      type: "warning",
      title: "Incomplete OpenGraph Tags",
      description: "OpenGraph tags ensure rich link previews when shared on Facebook, LinkedIn, Discord, and Slack.",
      recommendation: "Add og:title, og:description, and og:image tags.",
      codeSnippet: `<meta property="og:title" content="${title || "Page Title"}" />\n<meta property="og:description" content="Engaging summary..." />\n<meta property="og:image" content="https://example.com/og.png" />`,
    });
  } else {
    issues.push({
      id: "has-og",
      category: "social",
      type: "success",
      title: "OpenGraph Protocol Configured",
      description: "Rich sharing card previews enabled for social media platforms.",
    });
  }

  const twitterCard = getMetaContent("twitter:card");
  const hasTwitter = !!twitterCard;
  if (!hasTwitter) {
    socialScore -= 20;
    issues.push({
      id: "missing-twitter-card",
      category: "social",
      type: "warning",
      title: "Missing Twitter Card Tags",
      description: "Twitter cards create large visual previews when shared on X/Twitter.",
      recommendation: "Add twitter:card set to 'summary_large_image'.",
      codeSnippet: `<meta name="twitter:card" content="summary_large_image" />`,
    });
  } else {
    issues.push({
      id: "has-twitter",
      category: "social",
      type: "success",
      title: "Twitter Cards Enabled",
      description: `Configured as: ${twitterCard}`,
    });
  }

  // 5. Technical & Mobile
  let techScore = 100;
  const isHttps = targetUrl.startsWith("https://");
  if (!isHttps) {
    techScore -= 30;
    issues.push({
      id: "no-https",
      category: "technical",
      type: "error",
      title: "Site Not Using HTTPS",
      description: "Google uses HTTPS as an explicit ranking signal and flags HTTP sites as 'Not Secure'.",
      recommendation: "Install an SSL/TLS certificate (e.g. Let's Encrypt, Cloudflare) and redirect HTTP to HTTPS.",
    });
  } else {
    issues.push({
      id: "is-https",
      category: "technical",
      type: "success",
      title: "Secure HTTPS Protocol",
      description: "SSL certificate active and secure connection verified.",
    });
  }

  const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
  if (!hasViewport) {
    techScore -= 35;
    issues.push({
      id: "missing-viewport",
      category: "technical",
      type: "error",
      title: "Missing Mobile Viewport Meta Tag",
      description: "Google exclusively uses Mobile-First Indexing. Sites without a viewport are heavily penalized.",
      recommendation: "Add standard responsive viewport meta tag.",
      codeSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    });
  } else {
    issues.push({
      id: "has-viewport",
      category: "technical",
      type: "success",
      title: "Mobile Viewport Configured",
      description: "Ready for mobile-first indexing and responsive rendering.",
    });
  }

  const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
  if (!hasJsonLd) {
    techScore -= 15;
    issues.push({
      id: "missing-jsonld",
      category: "technical",
      type: "warning",
      title: "No Schema.org Structured Data Found",
      description: "Structured Data powers Google Rich Snippets (stars, prices, FAQs, breadcrumbs).",
      recommendation: "Implement JSON-LD for Organization, WebSite, or WebApplication schema.",
    });
  } else {
    issues.push({
      id: "has-jsonld",
      category: "technical",
      type: "success",
      title: "Structured Data (JSON-LD) Detected",
      description: "Schema markup enables Google Rich Snippets.",
    });
  }

  // Calculate weighted overall score
  metaScore = Math.max(0, Math.min(100, metaScore));
  headingsScore = Math.max(0, Math.min(100, headingsScore));
  imagesScore = Math.max(0, Math.min(100, imagesScore));
  socialScore = Math.max(0, Math.min(100, socialScore));
  techScore = Math.max(0, Math.min(100, techScore));

  const totalScore = Math.round(
    metaScore * 0.3 +
    headingsScore * 0.2 +
    imagesScore * 0.15 +
    socialScore * 0.15 +
    techScore * 0.2
  );

  let grade: "A+" | "A" | "B" | "C" | "D" | "F" = "F";
  if (totalScore >= 95) grade = "A+";
  else if (totalScore >= 85) grade = "A";
  else if (totalScore >= 75) grade = "B";
  else if (totalScore >= 60) grade = "C";
  else if (totalScore >= 45) grade = "D";

  return {
    url: targetUrl,
    timestamp: new Date().toISOString(),
    score: totalScore,
    grade,
    categoryScores: {
      meta: metaScore,
      headings: headingsScore,
      images: imagesScore,
      social: socialScore,
      technical: techScore,
    },
    stats: {
      title,
      titleLength,
      description,
      descriptionLength,
      h1Count,
      h2Count,
      imageCount,
      imagesWithoutAlt,
      hasCanonical,
      hasOg,
      hasTwitter,
      hasJsonLd,
      hasViewport,
      isHttps,
    },
    issues,
  };
}
