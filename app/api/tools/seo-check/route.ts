import { NextRequest, NextResponse } from "next/server";
import { inspectHtml } from "@/lib/seo/inspector";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let rawUrl = body?.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "Website URL is required." }, { status: 400 });
  }

  // Prepend https:// if protocol is missing
  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      { error: "Please enter a valid website URL (e.g. https://example.com)." },
      { status: 422 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DevTools-SEO-Bot/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Website responded with HTTP ${response.status} (${response.statusText}).`,
        },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json(
        {
          error: `Target URL returned ${contentType} instead of HTML content.`,
        },
        { status: 422 }
      );
    }

    const html = await response.text();
    const auditResult = inspectHtml(html, parsedUrl.toString());

    return NextResponse.json({
      success: true,
      result: auditResult,
    });
  } catch (err: any) {
    console.error("SEO Audit fetch error:", err);
    if (err?.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out while trying to reach the website." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Could not connect to the specified website. Please ensure the domain is online and publicly reachable.",
      },
      { status: 502 }
    );
  }
}
