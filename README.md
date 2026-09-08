# devtoolsapp (MagicTools.tech)

> **MagicTools.tech** — Modern Developer Utilities, Media Converters, AI Code Assistants, and SEO Audit Platform.

Live URL: **[https://magictools.tech](https://magictools.tech)**

---

## Features

### 🛠️ Developer Utilities
- **JSON Formatter & Validator**: Format, validate, and minify JSON with syntax highlighting.
- **Base64 Encoder / Decoder**: Zero-latency binary and text Base64 processing.
- **JWT Decoder**: Inspect JSON Web Token headers, claims, and expiration times.
- **Regex Tester**: Real-time JavaScript regular expression matching and group capture.
- **UUID / Hash Generators**: Cryptographically secure UUIDs and SHA-256/MD5 hashes.

### 🖼️ Media & PDF Processing
- **Image Converter**: Multi-format transition across WebP, PNG, JPEG, GIF, and AVIF.
- **Image Resizer**: Dimension scaling with aspect ratio locking and quality tuning.
- **Gemini Watermark Remover**: Remove SynthID / Gemini visual watermarks using smart inpainting.
- **Image to SVG**: Vectorize raster graphics directly in the browser.
- **PDF Suite**: Images to PDF, PDF to Image, PDF to Word, and Word to PDF converters with custom file export prompts.

### 🤖 AI Utilities (OpenRouter Powered)
- **AI Cover Letter Writer**: Personalized cover letters generated from job descriptions and resumes.
- **AI Code Explainer**: Line-by-line algorithm analysis and breakdown.
- **AI Debugger**: Stack trace and syntax bug analyzer with fix recommendations.
- **AI SQL Generator**: Natural language query to production PostgreSQL / MySQL syntax.

### 🔍 Website SEO Checker & Reporter
- Comprehensive on-page audit (meta tags, headings, canonicals, image alts, social cards, Core Web Vitals readiness).
- Realistic multi-step crawling experience (~10s trust pipeline).
- Downloadable PDF audit reports with custom filename prompt.

### 🎓 Free Tech Courses & Content
- Live updated free Udemy tech courses scraped and cached daily.
- Developer tutorials, engineering blog, and tech news architecture.

---

## Tech Stack
- **Framework**: Next.js 16 (App Router & Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **AI Provider**: OpenRouter API (`openai/gpt-4o-mini`)
- **PDF & Canvas**: `jspdf`, HTML5 Canvas API

---

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Chanuka-Dushan/devtoolsapp.git
cd devtoolsapp
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your OpenRouter API key:
```env
OPENROUTER_API_KEY=your-openrouter-key
AI_PROVIDER=openrouter
NEXT_PUBLIC_SITE_URL=https://magictools.tech
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment & Hosting (`magictools.tech`)

### Recommended: Vercel (1-Click, Free & Full API Support)
Because MagicTools uses serverless API routes (`/api/ai/*`, `/api/courses`, `/api/tools/seo-check`), deploying to **Vercel** is the gold standard:
1. Connect your GitHub repository `Chanuka-Dushan/devtoolsapp` at [vercel.com/new](https://vercel.com/new).
2. Add your environment variables (`OPENROUTER_API_KEY`, etc.).
3. In **Settings → Domains**, add `magictools.tech`.
4. Point your DNS records (A record `@` to `76.76.21.21` or CNAME `www` to `cname.vercel-dns.com`).

### GitHub Pages (Static Hosting)
If you prefer hosting strictly via GitHub Pages:
- A `CNAME` file pointing to `magictools.tech` is included in `public/CNAME`.
- Set your DNS records in your domain registrar:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- *Note: On pure static hosts like GitHub Pages, client-side tools run in-browser, while serverless API routes (like `/api/ai/*`) require an active server or serverless backend.*
