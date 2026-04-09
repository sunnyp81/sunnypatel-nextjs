import { NextRequest, NextResponse } from "next/server";

interface RedirectStep {
  url: string;
  status: number;
  headers: Record<string, string>;
  responseTime: number;
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

    const chain: RedirectStep[] = [];
    let currentUrl = url;
    const visitedUrls = new Set<string>();
    const MAX_REDIRECTS = 10;
    let loopDetected = false;

    for (let i = 0; i < MAX_REDIRECTS + 1; i++) {
      if (visitedUrls.has(currentUrl)) {
        loopDetected = true;
        break;
      }
      visitedUrls.add(currentUrl);

      const start = Date.now();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(currentUrl, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; RedirectChecker/1.0; +https://sunnypatel.co.uk/tools/redirect-checker/)",
          },
        });

        clearTimeout(timeout);

        const elapsed = Date.now() - start;

        const headersObj: Record<string, string> = {};
        res.headers.forEach((value, key) => {
          headersObj[key] = value;
        });

        chain.push({
          url: currentUrl,
          status: res.status,
          headers: headersObj,
          responseTime: elapsed,
        });

        // If it's a redirect, follow the Location header
        if ([301, 302, 303, 307, 308].includes(res.status)) {
          const location = res.headers.get("location");
          if (!location) break;

          // Handle relative redirects
          try {
            currentUrl = new URL(location, currentUrl).href;
          } catch {
            break;
          }
        } else {
          // Final destination reached
          break;
        }
      } catch (err: unknown) {
        const elapsed = Date.now() - start;
        const message =
          err instanceof Error ? err.message : "Unknown error";

        chain.push({
          url: currentUrl,
          status: 0,
          headers: {},
          responseTime: elapsed,
        });

        return NextResponse.json({
          chain,
          loopDetected: false,
          error: message.includes("abort")
            ? "Request timed out (10s)"
            : `Connection failed: ${message}`,
        });
      }
    }

    return NextResponse.json({ chain, loopDetected });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
