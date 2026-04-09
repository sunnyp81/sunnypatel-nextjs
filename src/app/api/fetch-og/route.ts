import { NextRequest, NextResponse } from "next/server";

interface OgData {
  url: string;
  title: string | null;
  metaDescription: string | null;
  favicon: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
}

function extractMetaContent(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  if (!match) return null;
  const raw = match[1] || match[2] || "";
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .trim();
}

function extractAllOg(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const regex = /<meta\s+[^>]*(?:property|name)\s*=\s*["'](og:[^"']+)["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*\/?>/gi;
  const regex2 = /<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*(?:property|name)\s*=\s*["'](og:[^"']+)["'][^>]*\/?>/gi;

  let m;
  while ((m = regex.exec(html)) !== null) {
    tags[m[1]] = m[2].trim();
  }
  while ((m = regex2.exec(html)) !== null) {
    tags[m[2]] = m[1].trim();
  }
  return tags;
}

function extractAllTwitter(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const regex = /<meta\s+[^>]*(?:property|name)\s*=\s*["'](twitter:[^"']+)["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*\/?>/gi;
  const regex2 = /<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*(?:property|name)\s*=\s*["'](twitter:[^"']+)["'][^>]*\/?>/gi;

  let m;
  while ((m = regex.exec(html)) !== null) {
    tags[m[1]] = m[2].trim();
  }
  while ((m = regex2.exec(html)) !== null) {
    tags[m[2]] = m[1].trim();
  }
  return tags;
}

function extractFavicon(html: string, baseUrl: string): string | null {
  // Try link rel="icon" or rel="shortcut icon"
  const iconMatch = html.match(
    /<link\s+[^>]*rel\s*=\s*["'](?:shortcut\s+)?icon["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i
  );
  const iconMatch2 = html.match(
    /<link\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["'](?:shortcut\s+)?icon["'][^>]*\/?>/i
  );

  const href = iconMatch?.[1] || iconMatch2?.[1];
  if (href) {
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }

  // Default to /favicon.ico
  try {
    const u = new URL(baseUrl);
    return `${u.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json(
        { error: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; OGPreviewBot/1.0; +https://sunnypatel.co.uk/tools/og-preview/)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out after 10 seconds" },
          { status: 504 }
        );
      }
      const message =
        err instanceof Error ? err.message : "Failed to fetch URL";
      return NextResponse.json({ error: message }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Remote server returned ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json(
        { error: "URL did not return HTML content" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract <title>
    const title = extractMetaContent(
      html,
      /<title[^>]*>([^<]*)<\/title>/i
    );

    // Extract <meta name="description">
    const metaDescription =
      extractMetaContent(
        html,
        /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*\/?>/i
      ) ||
      extractMetaContent(
        html,
        /<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["'][^>]*\/?>/i
      );

    const og = extractAllOg(html);
    const twitter = extractAllTwitter(html);
    const favicon = extractFavicon(html, parsedUrl.href);

    const data: OgData = {
      url: parsedUrl.href,
      title,
      metaDescription,
      favicon,
      og,
      twitter,
    };

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
