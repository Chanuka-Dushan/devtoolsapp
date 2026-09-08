/**
 * Tool Registry
 *
 * Central configuration for all developer tools.
 * Adding a new tool = adding an entry here.
 */

export type ToolCategory = "developer" | "ai" | "encoding" | "generators" | "pdf" | "images";

export interface ToolConfig {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: ToolCategory;
  tags: string[];
  icon: string; // Lucide icon name
  isAI: boolean;
  isFree: boolean;
  isPro?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  path: string;
  keywords?: string[];
}

export const TOOLS: ToolConfig[] = [
  // ── Developer Tools ───────────────────────────────────────
  {
    slug: "seo-checker",
    name: "Website SEO Checker",
    description: "Audit on-page SEO, detect title & meta issues, and export PDF reports.",
    longDescription:
      "Comprehensive website SEO audit tool that analyzes meta tags, headings, image alt attributes, OpenGraph tags, and mobile viewport with actionable recommendations and PDF export.",
    category: "developer",
    tags: ["seo", "audit", "meta tags", "headings", "checker", "pdf export"],
    icon: "Search",
    isAI: false,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/tools/seo-checker",
    keywords: ["seo checker", "website seo audit", "meta tag checker", "seo analyzer"],
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON with syntax highlighting.",
    longDescription:
      "A professional JSON formatter that validates your JSON, pretty-prints it with proper indentation, and can minify it for production use. Detailed error messages help you locate syntax problems instantly.",
    category: "developer",
    tags: ["json", "formatter", "validator", "minifier"],
    icon: "Braces",
    isAI: false,
    isFree: true,
    isPopular: true,
    path: "/tools/json-formatter",
    keywords: ["json format", "json beautify", "json lint", "json validator"],
  },
  {
    slug: "json-validator",
    name: "JSON Validator",
    description: "Validate JSON syntax with clear error location messages.",
    longDescription:
      "Strict JSON syntax validation with precise error location reporting. Quickly identify and fix malformed JSON before it causes runtime errors.",
    category: "developer",
    tags: ["json", "validator", "syntax"],
    icon: "CheckCircle",
    isAI: false,
    isFree: true,
    path: "/tools/json-validator",
    keywords: ["json validate", "json check", "json syntax"],
  },
  {
    slug: "json-minifier",
    name: "JSON Minifier",
    description: "Remove whitespace from JSON to reduce payload size.",
    longDescription:
      "Compress JSON by removing all unnecessary whitespace and formatting. Ideal for optimizing API payloads and reducing bandwidth.",
    category: "developer",
    tags: ["json", "minifier", "compress"],
    icon: "Minimize2",
    isAI: false,
    isFree: true,
    path: "/tools/json-minifier",
    keywords: ["json minify", "json compress", "json compact"],
  },
  {
    slug: "base64",
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings with Unicode support.",
    longDescription:
      "Encode any text or binary data to Base64, or decode Base64 strings back to plaintext. Handles Unicode characters correctly.",
    category: "encoding",
    tags: ["base64", "encode", "decode", "encoding"],
    icon: "ArrowLeftRight",
    isAI: false,
    isFree: true,
    isPopular: true,
    path: "/tools/base64",
    keywords: ["base64 encode", "base64 decode", "base64 converter"],
  },
  {
    slug: "url-encoder",
    name: "URL Encoder/Decoder",
    description: "Encode and decode URL components and query strings.",
    longDescription:
      "Properly encode URLs for safe transmission and decode percent-encoded URLs back to readable form. Handles all special characters.",
    category: "encoding",
    tags: ["url", "encode", "decode", "percent-encoding"],
    icon: "Link",
    isAI: false,
    isFree: true,
    path: "/tools/url-encoder",
    keywords: ["url encode", "url decode", "percent encoding"],
  },
  {
    slug: "uuid",
    name: "UUID Generator",
    description: "Generate UUID v4 identifiers — single or in bulk.",
    longDescription:
      "Generate cryptographically random UUID v4 identifiers. Create single UUIDs or generate them in bulk for database seeding and testing.",
    category: "generators",
    tags: ["uuid", "guid", "generator", "random"],
    icon: "Fingerprint",
    isAI: false,
    isFree: true,
    isPopular: true,
    path: "/tools/uuid",
    keywords: ["uuid generate", "guid generator", "unique id"],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode JWT tokens and inspect header, payload, and claims.",
    longDescription:
      "Decode JSON Web Tokens to inspect their header and payload. View expiration times, issued-at dates, and all claims. Note: this tool decodes only — it does NOT verify the token signature.",
    category: "developer",
    tags: ["jwt", "token", "decode", "auth"],
    icon: "KeyRound",
    isAI: false,
    isFree: true,
    isPopular: true,
    path: "/tools/jwt-decoder",
    keywords: ["jwt decode", "json web token", "token inspector"],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with live match highlighting.",
    longDescription:
      "Test and debug regular expressions with real-time match highlighting. Supports all JavaScript regex flags and displays all match groups.",
    category: "developer",
    tags: ["regex", "regexp", "tester", "pattern"],
    icon: "Search",
    isAI: false,
    isFree: true,
    isPopular: true,
    path: "/tools/regex-tester",
    keywords: ["regex test", "regular expression", "regexp tester"],
  },
  {
    slug: "timestamp",
    name: "Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates.",
    longDescription:
      "Convert Unix timestamps to human-readable dates and vice versa. Supports both seconds and milliseconds precision. Shows timezone information.",
    category: "developer",
    tags: ["timestamp", "unix", "date", "converter"],
    icon: "Clock",
    isAI: false,
    isFree: true,
    isPopular: true,
    path: "/tools/timestamp",
    keywords: ["unix timestamp", "epoch converter", "date timestamp"],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate SHA-256, SHA-512, and MD5 hashes from any text.",
    longDescription:
      "Generate cryptographic hashes using industry-standard algorithms. Supports SHA-256, SHA-512, SHA-1, and MD5. All computation happens in your browser.",
    category: "developer",
    tags: ["hash", "sha256", "sha512", "md5", "crypto"],
    icon: "Hash",
    isAI: false,
    isFree: true,
    path: "/tools/hash-generator",
    keywords: ["hash generator", "sha256 hash", "md5 hash", "crypto hash"],
  },

  // ── AI Tools ──────────────────────────────────────────────
  {
    slug: "code-explainer",
    name: "AI Code Explainer",
    description: "Get plain-English explanations of any code snippet.",
    longDescription:
      "Paste any code and get a clear, plain-English explanation. Understand what it does, identify potential issues, and learn about complexity — powered by AI.",
    category: "ai",
    tags: ["ai", "code", "explain", "learn"],
    icon: "BookOpen",
    isAI: true,
    isFree: true,
    isNew: true,
    path: "/ai/code-explainer",
    keywords: ["explain code", "code explanation", "understand code"],
  },
  {
    slug: "debugger",
    name: "AI Debugger",
    description: "Diagnose bugs and get suggested fixes for your code.",
    longDescription:
      "Paste your code and error message to get AI-powered diagnosis. Understand the probable cause, see an explanation, and get a suggested fix.",
    category: "ai",
    tags: ["ai", "debug", "error", "fix"],
    icon: "Bug",
    isAI: true,
    isFree: true,
    isNew: true,
    path: "/ai/debugger",
    keywords: ["debug code", "fix error", "ai debugger"],
  },
  {
    slug: "sql-generator",
    name: "AI SQL Generator",
    description:
      "Generate SQL queries from natural language for any dialect.",
    longDescription:
      "Describe what you want in plain English and get production-quality SQL. Supports PostgreSQL, MySQL, SQLite, and more. Includes explanations and safety warnings.",
    category: "ai",
    tags: ["ai", "sql", "database", "query", "generator"],
    icon: "Database",
    isAI: true,
    isFree: true,
    isNew: true,
    path: "/ai/sql-generator",
    keywords: ["sql generator", "natural language sql", "ai sql"],
  },
  {
    slug: "cover-letter-writer",
    name: "AI Cover Letter Writer",
    description: "Generate tailored, ATS-optimized cover letters from any job description.",
    longDescription:
      "Paste any job description to generate a personalized, high-converting cover letter with tone customization, ATS keyword matching, and Word/PDF export.",
    category: "ai",
    tags: ["ai", "cover letter", "job", "career", "resume", "writer"],
    icon: "FileText",
    isAI: true,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/ai/cover-letter-writer",
    keywords: ["cover letter generator", "ai cover letter", "job application", "resume writer"],
  },
  // ── PDF & Document Tools ──────────────────────────────────
  {
    slug: "images-to-pdf",
    name: "Images to PDF Converter",
    description: "Convert JPG, PNG, and WebP images to a combined PDF document.",
    longDescription:
      "Combine single or multiple images into a custom PDF document. Customize orientation, margins, page sizing, and name your file before downloading.",
    category: "pdf",
    tags: ["pdf", "image", "jpg", "png", "converter"],
    icon: "FileImage",
    isAI: false,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/tools/images-to-pdf",
    keywords: ["image to pdf", "images to pdf", "jpg to pdf", "png to pdf", "pdf convert"],
  },
  {
    slug: "pdf-to-image",
    name: "PDF to Image Converter",
    description: "Convert PDF pages to high-resolution PNG or JPG images.",
    longDescription:
      "Extract and render individual or all PDF pages into crystal-clear PNG or JPG images with selectable DPI and custom export filename.",
    category: "pdf",
    tags: ["pdf", "image", "png", "jpg", "extractor"],
    icon: "FileText",
    isAI: false,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/tools/pdf-to-image",
    keywords: ["pdf to image", "pdf to png", "pdf to jpg", "pdf render"],
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word Converter",
    description: "Convert PDF documents to editable Microsoft Word (.docx) format.",
    longDescription:
      "Extract text and layout from PDF files and convert them into genuine Microsoft Word (.docx) files with live editing and custom filename naming.",
    category: "pdf",
    tags: ["pdf", "word", "docx", "converter", "document"],
    icon: "FileCode",
    isAI: false,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/tools/pdf-to-word",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to docx", "pdf text"],
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF Converter",
    description: "Convert Microsoft Word (.docx) documents to crisp PDF files.",
    longDescription:
      "Convert your .docx documents into formatted PDF files in seconds with document preview and custom export filename.",
    category: "pdf",
    tags: ["word", "pdf", "docx", "converter", "document"],
    icon: "FileCheck",
    isAI: false,
    isFree: true,
    isNew: true,
    path: "/tools/word-to-pdf",
    keywords: ["word to pdf", "docx to pdf", "convert docx to pdf"],
  },
  // ── Image Processing & Converters ─────────────────────────
  {
    slug: "image-converter",
    name: "Image Format Converter",
    description: "Convert across WebP, PNG, JPG, BMP, ICO, and SVG vector formats.",
    longDescription:
      "All-in-one image converter supporting all format transitions (PNG to WebP, WebP to PNG, JPG to WebP, Image to SVG, Image to Favicon ICO) with quality and scaling options.",
    category: "images",
    tags: ["image", "webp", "png", "jpg", "converter", "ico", "bmp"],
    icon: "Image",
    isAI: false,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/tools/image-converter",
    keywords: ["image to webp", "webp to png", "png to jpg", "image converter", "image to ico"],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer & Size Reducer",
    description: "Resize image dimensions and reduce file size by up to 90%.",
    longDescription:
      "Compress and resize images by exact pixel dimensions, percentage scaling, or social media presets with aspect ratio lock and custom filename export.",
    category: "images",
    tags: ["image", "resize", "compress", "optimizer", "scale"],
    icon: "Scaling",
    isAI: false,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/tools/image-resizer",
    keywords: ["image resizer", "reduce image size", "compress image", "image dimensions"],
  },
  {
    slug: "image-to-svg",
    name: "Image to SVG Vectorizer",
    description: "Trace bitmap images (PNG, JPG) into scalable SVG vector graphics.",
    longDescription:
      "Mathematical vector contour tracer that turns raster images and logos into clean SVG code with color clustering and polygon paths.",
    category: "images",
    tags: ["image", "svg", "vector", "tracer", "vectorizer"],
    icon: "FileCode",
    isAI: false,
    isFree: true,
    isNew: true,
    path: "/tools/image-to-svg",
    keywords: ["image to svg", "png to svg", "jpg to svg", "vectorize image"],
  },
  {
    slug: "gemini-watermark-remover",
    name: "Gemini & AI Watermark Remover",
    description: "Remove Google Gemini sparkle watermarks and AI badges automatically.",
    longDescription:
      "Content-aware inpainting tool that automatically detects and seamlessly erases Google Gemini 4-point sparkle watermarks and AI badges.",
    category: "images",
    tags: ["gemini", "watermark", "ai", "remover", "inpaint"],
    icon: "Sparkles",
    isAI: false,
    isFree: true,
    isNew: true,
    isPopular: true,
    path: "/tools/gemini-watermark-remover",
    keywords: ["gemini watermark remover", "remove gemini watermark", "remove ai watermark", "watermark remover"],
  },
];

/**
 * Get all non-AI developer tools.
 */
export const DEVELOPER_TOOLS = TOOLS.filter((t) => !t.isAI);

/**
 * Get all AI tools.
 */
export const AI_TOOLS = TOOLS.filter((t) => t.isAI);

/**
 * Get popular tools for the homepage.
 */
export const POPULAR_TOOLS = TOOLS.filter((t) => t.isPopular && !t.isAI);

/**
 * Find a tool by its slug.
 */
export function getToolBySlug(slug: string): ToolConfig | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/**
 * Get all tools in a specific category.
 */
export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
  return TOOLS.filter((t) => t.category === category);
}

/**
 * Search tools by query string.
 */
export function searchTools(query: string): ToolConfig[] {
  const q = query.toLowerCase().trim();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)) ||
      t.keywords?.some((kw) => kw.includes(q))
  );
}
