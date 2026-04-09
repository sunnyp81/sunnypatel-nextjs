import { NextRequest, NextResponse } from "next/server";

interface LinkResult {
  url: string;
  status: number;
  ok: boolean;
  internal: boolean;
  responseTime: number;
}

async function checkLink(
  linkUrl: string,
  baseHost: string
): Promise<LinkResult> {
  const start = Date.now();
  let internal = false;

  try {
    const parsed = new URL(linkUrl);
    internal = parsed.hostname === baseHost;
  } catch {
    return {
      url: linkUrl,
      status: 0,
      ok: false,
      internal: false,
      responseTime: Date.now() - start,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(linkUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BrokenLinkChecker/1.0; +https://sunnypatel.co.uk/tools/broken-links/)",
      },
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - start;

    // Some servers reject HEAD — fall back to GET
    if (res.status === 405 || res.status === 403) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 5000);

      const res2 = await fetch(linkUrl, {
        method: "GET",
        redirect: "follow",
        signal: controller2.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; BrokenLinkChecker/1.0; +https://sunnypatel.co.uk/tools/broken-links/)",
        },
      });

      clearTimeout(timeout2);
      const elapsed2 = Date.now() - start;

      return {
        url: linkUrl,
        status: res2.status,
        ok: res2.status >= 200 && res2.status < 400,
        internal,
        responseTime: elapsed2,
      };
    }

    return {
      url: linkUrl,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      internal,
      responseTime: elapsed,
    };
  } catch (err: unknown) {
    const elapsed = Date.now() - start;
    const message = err instanceof Error ? err.message : "";
    const isTimeout = message.includes("abort");

    return {
      url: linkUrl,
      status: isTimeout ? 408 : 0,
      ok: false,
      internal,
      responseTime: elapsed,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    // Fetch the page HTML
    let html: string;
    let baseHost: string;

    try {
      const parsed = new URL(url);
      baseHost = parsed.hostname;
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const pageRes = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; BrokenLinkChecker/1.0; +https://sunnypatel.co.uk/tools/broken-links/)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      clearTimeout(timeout);

      if (!pageRes.ok) {
        return NextResponse.json(
          { error: `Failed to fetch page: HTTP ${pageRes.status}` },
          { status: 400 }
        );
      }

      html = await pageRes.text();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        {
          error: message.includes("abort")
            ? "Page fetch timed out (10s)"
            : `Failed to fetch page: ${message}`,
        },
        { status: 400 }
      );
    }

    // Extract all <a href="..."> links
    const hrefRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const rawLinks = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = hrefRegex.exec(html)) !== null) {
      rawLinks.add(match[1]);
    }

    // Resolve and filter links
    const resolvedLinks: string[] = [];
    const seen = new Set<string>();

    for (const href of rawLinks) {
      // Skip non-http links
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href === "#" ||
        href.startsWith("#")
      ) {
        continue;
      }

      // Resolve relative URLs
      let absolute: string;
      try {
        absolute = new URL(href, url).href;
      } catch {
        continue;
      }

      // Skip non-http protocols
      if (!absolute.startsWith("http://") && !absolute.startsWith("https://")) {
        continue;
      }

      // Deduplicate
      if (seen.has(absolute)) continue;
      seen.add(absolute);

      resolvedLinks.push(absolute);

      // Cap at 100 links
      if (resolvedLinks.length >= 100) break;
    }

    // Check links in parallel batches of 10
    const results: LinkResult[] = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < resolvedLinks.length; i += BATCH_SIZE) {
      const batch = resolvedLinks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((link) => checkLink(link, baseHost))
      );
      results.push(...batchResults);
    }

    return NextResponse.json({
      pageUrl: url,
      totalLinks: results.length,
      results,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
