export interface Tutorial {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMins: number;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  steps: {
    title: string;
    content: string;
    code?: string;
    language?: string;
  }[];
  relatedTools: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTimeMins: number;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  contentSections: {
    heading: string;
    body: string;
    codeSnippet?: string;
  }[];
  tags: string[];
  relatedTools: string[];
}

export interface NewsItem {
  slug: string;
  title: string;
  summary: string;
  commentary: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  category: "AI" | "Web" | "DevOps" | "Database";
  tags: string[];
}

export const TUTORIALS: Tutorial[] = [
  {
    slug: "building-type-safe-rest-apis",
    title: "Building End-to-End Type-Safe REST APIs with Next.js & Zod",
    excerpt: "Learn how to validate request payloads at runtime with Zod while maintaining compile-time TypeScript guarantees.",
    category: "Full-Stack",
    difficulty: "Beginner",
    estimatedMins: 12,
    publishedAt: "2025-01-15",
    author: {
      name: "Alex Rivera",
      role: "Principal Systems Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    },
    relatedTools: ["json-formatter", "json-validator"],
    steps: [
      {
        title: "1. The Challenge of Runtime Boundaries",
        content: "TypeScript compiles down to vanilla JavaScript. At runtime in your HTTP handlers, `request.json()` returns `any` or `unknown`. If a client sends malformed data, your backend may fail with cryptic runtime errors. Zod fixes this by acting as a runtime validator and TypeScript type inferrer simultaneously.",
      },
      {
        title: "2. Defining Your Schema",
        content: "Start by defining the exact schema you want to accept. Always sanitize strings with .trim() and enforce sensible minimum/maximum length constraints.",
        language: "typescript",
        code: `import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3).max(30),
  role: z.enum(["developer", "architect", "admin"]).default("developer"),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;`,
      },
      {
        title: "3. Validating In Route Handlers",
        content: "In Next.js App Router route handlers, parse incoming requests using `safeParse()` to avoid unhandled try/catch crashes.",
        language: "typescript",
        code: `import { NextRequest, NextResponse } from "next/server";
import { CreateUserSchema } from "./schema";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const result = CreateUserSchema.safeParse(raw);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const validData = result.data; // Fully typed as CreateUserInput
    return NextResponse.json({ success: true, user: validData });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}`,
      },
      {
        title: "4. Testing With JSON Tools",
        content: "Use our JSON Formatter and JSON Validator to test your schemas with valid and edge-case payloads before deploying to staging.",
      },
    ],
  },
  {
    slug: "mastering-regular-expressions",
    title: "Mastering Regular Expressions for Input Validation & Parsing",
    excerpt: "Demystify lookaheads, non-capturing groups, and boundary assertions with practical real-world patterns.",
    category: "Security & Algorithms",
    difficulty: "Intermediate",
    estimatedMins: 15,
    publishedAt: "2025-01-20",
    author: {
      name: "Marcus Vance",
      role: "Security Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    },
    relatedTools: ["regex-tester"],
    steps: [
      {
        title: "1. The Building Blocks of Regex",
        content: "Regular expressions are finite-state automata that match string patterns. Characters like `^` and `$` represent anchors (start and end of input), which prevent partial matching vulnerabilities.",
      },
      {
        title: "2. Positive & Negative Lookaheads",
        content: "Lookaheads allow checking conditions ahead without consuming characters in the match. Essential for strong password enforcement rules.",
        language: "javascript",
        code: `// Enforces: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;

console.log(strongPasswordRegex.test("DevTools#2025")); // true
console.log(strongPasswordRegex.test("weakpass"));      // false`,
      },
      {
        title: "3. Safe Regex Usage & ReDoS Prevention",
        content: "Never nest open-ended quantifiers like `(a+)+` against user input, as malicious input will trigger exponential backtracking (Regular Expression Denial of Service).",
      },
    ],
  },
  {
    slug: "understanding-jwt-and-security",
    title: "Deep Dive into JSON Web Tokens (JWT) and Signature Verification",
    excerpt: "Understand header, payload, signature mechanics and how to safely verify claims without leaking secrets.",
    category: "Security",
    difficulty: "Advanced",
    estimatedMins: 18,
    publishedAt: "2025-02-01",
    author: {
      name: "Sarah Chen",
      role: "Lead Infrastructure Engineer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    },
    relatedTools: ["jwt-decoder", "base64"],
    steps: [
      {
        title: "1. Anatomy of a Token",
        content: "A JWT consists of three Base64URL-encoded strings separated by dots: Header.Payload.Signature. The payload is not encrypted—it is merely encoded and readable by anyone.",
      },
      {
        title: "2. Decoding vs Verifying",
        content: "Decoding extracts the claims (user ID, expiration, roles) for client-side display. Verifying mathematically checks that the cryptographic signature matches the signing key.",
        language: "typescript",
        code: `// Decoded Header sample
{
  "alg": "HS256",
  "typ": "JWT"
}

// Decoded Payload sample
{
  "sub": "usr_9981248",
  "role": "engineer",
  "iat": 1735689600,
  "exp": 1735776000
}`,
      },
      {
        title: "3. Preventing the 'none' Algorithm Exploit",
        content: "Never trust the algorithm specified in the unverified token header. Hard-code your server verification logic to expect only the specific algorithm you configure.",
      },
    ],
  },
];

export const ARTICLES: Article[] = [
  {
    slug: "scalable-developer-tools-architecture",
    title: "Architecting Ultra-Fast Developer Tools: Zero Latency & Client-Side Execution",
    excerpt: "Why running formatting, encoding, and parsing directly in the browser delivers superior developer experience, absolute privacy, and zero server costs.",
    category: "Architecture",
    readTimeMins: 7,
    publishedAt: "2025-01-28",
    author: {
      name: "Alex Rivera",
      role: "Principal Systems Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    },
    tags: ["Performance", "Architecture", "WebAssembly", "TypeScript"],
    relatedTools: ["json-formatter", "base64", "uuid"],
    contentSections: [
      {
        heading: "The Problem with Server-Side Tooling",
        body: "Many older developer utilities send code, JSON, and keys to a backend server for processing. This introduces network latency, creates security liabilities when engineers paste production tokens, and incurs heavy server costs during viral traffic spikes.",
      },
      {
        heading: "The Zero-Latency Browser Advantage",
        body: "Modern browser JavaScript engines (V8, SpiderMonkey, JavaScriptCore) execute string transformations, regex parsing, and cryptographic hashing in single-digit milliseconds. By keeping execution client-side, user code never leaves their device.",
        codeSnippet: `// Instant, client-side Web Crypto API hashing without any backend call
async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}`,
      },
      {
        heading: "When to Bridge to the Cloud: AI Providers",
        body: "For AI code analysis, debugging, and SQL generation, lightweight server-side API routes act as secure proxies to providers like OpenRouter and Gemini, shielding API keys from public clients while streaming responses back in real-time.",
      },
    ],
  },
  {
    slug: "why-base64-increases-size-by-33-percent",
    title: "The Mathematics of Base64: Why It Increases Data Size by Exactly 33%",
    excerpt: "An in-depth mechanical explanation of 6-bit grouping, binary-to-ASCII translation, and padding bytes.",
    category: "Computer Science",
    readTimeMins: 5,
    publishedAt: "2025-02-04",
    author: {
      name: "Sarah Chen",
      role: "Lead Infrastructure Engineer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    },
    tags: ["Algorithms", "Binary", "Networking", "Base64"],
    relatedTools: ["base64"],
    contentSections: [
      {
        heading: "The Binary Constraint of Legacy Protocols",
        body: "Early internet communication protocols (such as SMTP for email) were designed to transmit 7-bit ASCII characters. Sending raw 8-bit binary data (like images or compiled binaries) often caused characters to be stripped or corrupted.",
      },
      {
        heading: "Converting 8-bit Bytes to 6-bit Indices",
        body: "Base64 takes three 8-bit bytes (24 bits in total) and partitions them into four 6-bit chunks (also 24 bits). Each 6-bit chunk has 2^6 = 64 possible combinations, matching the 64 characters of the Base64 alphabet: A-Z, a-z, 0-9, +, and /.",
        codeSnippet: `Original:  [ 8 bits ] [ 8 bits ] [ 8 bits ] = 24 bits
Base64:    [ 6 bits ] [ 6 bits ] [ 6 bits ] [ 6 bits ] = 24 bits
Ratio: 4 / 3 = 1.333... (exactly a 33.3% size expansion)`,
      },
      {
        heading: "Handling Padding Characters (=)",
        body: "When input length is not divisible by 3, one or two '=' padding characters are appended so the total encoded length remains a multiple of 4.",
      },
    ],
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    slug: "openrouter-unifies-frontier-models",
    title: "OpenRouter Expands Unified Developer Gateway for Next-Gen LLMs",
    summary: "The multi-provider routing platform achieves sub-100ms latency routing across Claude, Llama 3, Gemini, and DeepSeek models with standardized API interfaces.",
    commentary: "For developer platforms, OpenRouter eliminates single-vendor lock-in. When upstream providers experience downtime or rate limiting, traffic routes seamlessly to fallback providers.",
    sourceName: "AI Infrastructure Digest",
    sourceUrl: "https://openrouter.ai",
    publishedAt: "2025-02-12",
    category: "AI",
    tags: ["LLM", "OpenRouter", "AI Gateway", "APIs"],
  },
  {
    slug: "typescript-5-8-release-announcement",
    title: "TypeScript 5.8 Introduces Granular Return Type Checks and Faster Compilation",
    summary: "The latest TypeScript iteration brings conditional return assertions and performance optimizations for large monorepos.",
    commentary: "Developers building large-scale utility suites benefit directly from compiler optimizations, reducing continuous integration build cycles by up to 22%.",
    sourceName: "TypeScript Official",
    sourceUrl: "https://devblogs.microsoft.com/typescript",
    publishedAt: "2025-02-08",
    category: "Web",
    tags: ["TypeScript", "JavaScript", "Developer Experience"],
  },
  {
    slug: "postgres-17-query-optimization-breakthroughs",
    title: "PostgreSQL 17 Delivers Significant Memory Optimization for JSONB Queries",
    summary: "New vectorized execution paths dramatically accelerate queries searching structured JSON payloads.",
    commentary: "For developer tools storing structured execution logs and schema snapshots, JSONB operations consume up to 40% less memory.",
    sourceName: "Postgres Weekly",
    sourceUrl: "https://www.postgresql.org",
    publishedAt: "2025-01-30",
    category: "Database",
    tags: ["PostgreSQL", "Database", "JSONB", "Performance"],
  },
];
