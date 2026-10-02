import { NextRequest, NextResponse } from "next/server";
import { safePublicFetch } from "@/lib/safe-public-fetch";

export const runtime = "nodejs";

interface RedirectStep {
  url: string;
  status: number;
  headers: Record<string, string>;
  responseTime: number;
}

export async function POST(req: NextRequest) {
  const deadline = Date.now() + 15_000;
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
      if (Date.now() >= deadline) {
        return NextResponse.json({ chain, loopDetected: false, error: "Redirect check timed out (15s)" });
      }
      if (visitedUrls.has(currentUrl)) {
        loopDetected = true;
        break;
      }
      visitedUrls.add(currentUrl);

      const start = Date.now();

      try {
        const res = await safePublicFetch(currentUrl, {
          method: "GET",
          redirect: "manual",
          timeoutMs: Math.min(10000, Math.max(1, deadline - Date.now())),
          headersOnly: true,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; RedirectChecker/1.0; +https://sunnypatel.co.uk/tools/redirect-checker/)",
          },
        });

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
          if (i === MAX_REDIRECTS) {
            return NextResponse.json({ chain, loopDetected: false, error: "Maximum of 10 redirects reached." });
          }

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
          error: /abort|timed out/i.test(message)
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
