import { NextRequest, NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Check {
  check: string;
  passed: boolean;
  value: string;
  recommendation: string;
}

interface GradeResponse {
  seoChecks: Check[];
  securityChecks: Check[];
  contentStats: {
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    images: number;
    imagesWithAlt: number;
    headings: { h1: number; h2: number; h3: number };
  };
  seoScore: number;
  securityScore: number;
  contentScore: number;
  url: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function extractTag(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractMetaContent(html: string, nameOrProperty: string): string | null {
  // Match both name="..." and property="..."
  const re = new RegExp(
    `<meta\\s+(?:[^>]*?(?:name|property)\\s*=\\s*["']${nameOrProperty}["'][^>]*?content\\s*=\\s*["']([^"']*)["']|[^>]*?content\\s*=\\s*["']([^"']*)["'][^>]*?(?:name|property)\\s*=\\s*["']${nameOrProperty}["'])`,
    "i"
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

function countMatches(html: string, pattern: RegExp): number {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

function stripHtml(html: string): string {
  // Remove script/style blocks, then tags, then collapse whitespace
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&[a-z]+;/gi, " ");
  text = text.replace(/\s+/g, " ");
  return text.trim();
}

/* ------------------------------------------------------------------ */
/*  SEO analysis                                                       */
/* ------------------------------------------------------------------ */
function analyseSeo(html: string, finalUrl: string): { checks: Check[]; score: number } {
  const checks: Check[] = [];
  let points = 0;
  let maxPoints = 0;

  // 1. Title tag
  maxPoints += 10;
  const title = extractTag(html, "title");
  if (title) {
    const len = title.length;
    if (len >= 30 && len <= 60) {
      checks.push({ check: "Title tag", passed: true, value: `${len} characters`, recommendation: "" });
      points += 10;
    } else {
      checks.push({
        check: "Title tag",
        passed: false,
        value: `${len} characters`,
        recommendation: len < 30 ? "Title is too short. Aim for 30-60 characters." : "Title is too long. Aim for 30-60 characters to avoid truncation in SERPs.",
      });
      points += 5; // partial
    }
  } else {
    checks.push({ check: "Title tag", passed: false, value: "Missing", recommendation: "Add a <title> tag. This is critical for SEO and click-through rates." });
  }

  // 2. Meta description
  maxPoints += 10;
  const metaDesc = extractMetaContent(html, "description");
  if (metaDesc) {
    const len = metaDesc.length;
    if (len >= 120 && len <= 160) {
      checks.push({ check: "Meta description", passed: true, value: `${len} characters`, recommendation: "" });
      points += 10;
    } else {
      checks.push({
        check: "Meta description",
        passed: false,
        value: `${len} characters`,
        recommendation: len < 120 ? "Meta description is too short. Aim for 120-160 characters." : "Meta description is too long. It may be truncated in search results.",
      });
      points += 5;
    }
  } else {
    checks.push({ check: "Meta description", passed: false, value: "Missing", recommendation: "Add a meta description. Google uses this for the snippet in search results." });
  }

  // 3. H1 tag — exactly one
  maxPoints += 10;
  const h1Count = countMatches(html, /<h1[\s>]/gi);
  if (h1Count === 1) {
    checks.push({ check: "H1 tag", passed: true, value: "1 found", recommendation: "" });
    points += 10;
  } else if (h1Count === 0) {
    checks.push({ check: "H1 tag", passed: false, value: "None found", recommendation: "Add exactly one <h1> tag as the main heading of the page." });
  } else {
    checks.push({ check: "H1 tag", passed: false, value: `${h1Count} found`, recommendation: "Use only one <h1> tag per page. Multiple H1s dilute heading importance." });
    points += 4;
  }

  // 4. H2 tags (content structure)
  maxPoints += 10;
  const h2Count = countMatches(html, /<h2[\s>]/gi);
  if (h2Count >= 2) {
    checks.push({ check: "Content structure (H2s)", passed: true, value: `${h2Count} H2 tags`, recommendation: "" });
    points += 10;
  } else if (h2Count === 1) {
    checks.push({ check: "Content structure (H2s)", passed: false, value: "1 H2 tag", recommendation: "Add more H2 subheadings to break up content and improve readability." });
    points += 5;
  } else {
    checks.push({ check: "Content structure (H2s)", passed: false, value: "None found", recommendation: "Add H2 subheadings to structure your content. This helps both users and search engines." });
  }

  // 5. Canonical link
  maxPoints += 10;
  const hasCanonical = /<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i.test(html);
  if (hasCanonical) {
    checks.push({ check: "Canonical tag", passed: true, value: "Present", recommendation: "" });
    points += 10;
  } else {
    checks.push({ check: "Canonical tag", passed: false, value: "Missing", recommendation: "Add a canonical tag to prevent duplicate content issues." });
  }

  // 6. Meta robots (not noindex)
  maxPoints += 10;
  const robots = extractMetaContent(html, "robots");
  if (robots && /noindex/i.test(robots)) {
    checks.push({ check: "Meta robots", passed: false, value: "noindex detected", recommendation: "This page is set to noindex and will not appear in search results." });
  } else {
    checks.push({ check: "Meta robots", passed: true, value: robots || "Not set (defaults to index)", recommendation: "" });
    points += 10;
  }

  // 7. Image alt attributes
  maxPoints += 10;
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imgTotal = imgTags.length;
  const imgWithAlt = imgTags.filter((t) => /alt\s*=\s*["'][^"']+["']/i.test(t)).length;
  if (imgTotal === 0) {
    checks.push({ check: "Image alt attributes", passed: true, value: "No images found", recommendation: "" });
    points += 10;
  } else {
    const ratio = imgWithAlt / imgTotal;
    if (ratio >= 0.9) {
      checks.push({ check: "Image alt attributes", passed: true, value: `${imgWithAlt}/${imgTotal} images have alt text`, recommendation: "" });
      points += 10;
    } else {
      checks.push({
        check: "Image alt attributes",
        passed: false,
        value: `${imgWithAlt}/${imgTotal} images have alt text`,
        recommendation: "Add descriptive alt text to all images for accessibility and image search SEO.",
      });
      points += Math.round(ratio * 10);
    }
  }

  // 8. Open Graph tags
  maxPoints += 10;
  const ogTitle = extractMetaContent(html, "og:title");
  const ogDesc = extractMetaContent(html, "og:description");
  const ogImage = extractMetaContent(html, "og:image");
  const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
  if (ogCount === 3) {
    checks.push({ check: "Open Graph tags", passed: true, value: "og:title, og:description, og:image present", recommendation: "" });
    points += 10;
  } else {
    const missing = [];
    if (!ogTitle) missing.push("og:title");
    if (!ogDesc) missing.push("og:description");
    if (!ogImage) missing.push("og:image");
    checks.push({
      check: "Open Graph tags",
      passed: false,
      value: `Missing: ${missing.join(", ")}`,
      recommendation: "Add Open Graph meta tags so your pages look great when shared on social media.",
    });
    points += Math.round((ogCount / 3) * 10);
  }

  // 9. Structured data (JSON-LD)
  maxPoints += 10;
  const hasJsonLd = /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(html);
  if (hasJsonLd) {
    checks.push({ check: "Structured data (JSON-LD)", passed: true, value: "Present", recommendation: "" });
    points += 10;
  } else {
    checks.push({ check: "Structured data (JSON-LD)", passed: false, value: "Not found", recommendation: "Add JSON-LD structured data to help search engines understand your content and enable rich results." });
  }

  // 10. Hreflang tags (bonus)
  maxPoints += 10;
  const hasHreflang = /<link[^>]+hreflang\s*=\s*["'][^"']+["'][^>]*>/i.test(html);
  if (hasHreflang) {
    checks.push({ check: "Hreflang tags", passed: true, value: "Present", recommendation: "" });
    points += 10;
  } else {
    checks.push({ check: "Hreflang tags", passed: false, value: "Not found", recommendation: "If you serve content in multiple languages or regions, add hreflang tags." });
    points += 5; // Not critical for single-language sites
  }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
  return { checks, score };
}

/* ------------------------------------------------------------------ */
/*  Security analysis                                                  */
/* ------------------------------------------------------------------ */
function analyseSecurity(
  headers: Record<string, string>,
  finalUrl: string
): { checks: Check[]; score: number } {
  const checks: Check[] = [];
  let points = 0;
  let maxPoints = 0;

  // 1. HTTPS
  maxPoints += 30;
  const isHttps = finalUrl.startsWith("https://");
  if (isHttps) {
    checks.push({ check: "HTTPS", passed: true, value: "Enabled", recommendation: "" });
    points += 30;
  } else {
    checks.push({ check: "HTTPS", passed: false, value: "Not enabled", recommendation: "Switch to HTTPS. It's a Google ranking factor and essential for user trust." });
  }

  // 2. Content-Security-Policy
  maxPoints += 20;
  const csp = headers["content-security-policy"];
  if (csp) {
    checks.push({ check: "Content-Security-Policy", passed: true, value: "Present", recommendation: "" });
    points += 20;
  } else {
    checks.push({ check: "Content-Security-Policy", passed: false, value: "Missing", recommendation: "Add a Content-Security-Policy header to prevent XSS and injection attacks." });
  }

  // 3. X-Frame-Options
  maxPoints += 15;
  const xfo = headers["x-frame-options"];
  if (xfo) {
    checks.push({ check: "X-Frame-Options", passed: true, value: xfo, recommendation: "" });
    points += 15;
  } else {
    checks.push({ check: "X-Frame-Options", passed: false, value: "Missing", recommendation: "Add X-Frame-Options header (DENY or SAMEORIGIN) to prevent clickjacking." });
  }

  // 4. X-Content-Type-Options
  maxPoints += 15;
  const xcto = headers["x-content-type-options"];
  if (xcto) {
    checks.push({ check: "X-Content-Type-Options", passed: true, value: xcto, recommendation: "" });
    points += 15;
  } else {
    checks.push({ check: "X-Content-Type-Options", passed: false, value: "Missing", recommendation: "Add X-Content-Type-Options: nosniff to prevent MIME type sniffing." });
  }

  // 5. Strict-Transport-Security
  maxPoints += 20;
  const hsts = headers["strict-transport-security"];
  if (hsts) {
    checks.push({ check: "Strict-Transport-Security", passed: true, value: hsts, recommendation: "" });
    points += 20;
  } else {
    checks.push({ check: "Strict-Transport-Security", passed: false, value: "Missing", recommendation: "Add a Strict-Transport-Security header to enforce HTTPS connections." });
  }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
  return { checks, score };
}

/* ------------------------------------------------------------------ */
/*  Content analysis                                                   */
/* ------------------------------------------------------------------ */
function analyseContent(html: string, finalUrl: string): { stats: GradeResponse["contentStats"]; score: number } {
  const plainText = stripHtml(html);
  const words = plainText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Count links
  const linkTags = html.match(/<a[^>]+href\s*=\s*["']([^"']*)["'][^>]*>/gi) || [];
  let internalLinks = 0;
  let externalLinks = 0;

  let hostname = "";
  try {
    hostname = new URL(finalUrl).hostname;
  } catch {
    // ignore
  }

  for (const tag of linkTags) {
    const hrefMatch = tag.match(/href\s*=\s*["']([^"']*)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];

    if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }

    try {
      const linkUrl = new URL(href, finalUrl);
      if (linkUrl.hostname === hostname) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      internalLinks++; // Relative URLs are internal
    }
  }

  // Count images
  const images = countMatches(html, /<img[\s>]/gi);
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = imgTags.filter((t) => /alt\s*=\s*["'][^"']+["']/i.test(t)).length;

  // Count headings
  const h1Count = countMatches(html, /<h1[\s>]/gi);
  const h2Count = countMatches(html, /<h2[\s>]/gi);
  const h3Count = countMatches(html, /<h3[\s>]/gi);

  // Score content (0-100)
  let score = 0;

  // Word count scoring (40 points max)
  if (wordCount >= 300) score += 40;
  else if (wordCount >= 150) score += 25;
  else if (wordCount >= 50) score += 10;

  // Internal links (20 points max)
  if (internalLinks >= 5) score += 20;
  else if (internalLinks >= 2) score += 12;
  else if (internalLinks >= 1) score += 5;

  // External links (15 points max)
  if (externalLinks >= 2) score += 15;
  else if (externalLinks >= 1) score += 8;

  // Images (15 points max)
  if (images >= 2) score += 15;
  else if (images >= 1) score += 8;

  // Heading diversity (10 points max)
  if (h1Count === 1 && h2Count >= 2) score += 10;
  else if (h1Count >= 1) score += 5;

  return {
    stats: { wordCount, internalLinks, externalLinks, images, imagesWithAlt, headings: { h1: h1Count, h2: h2Count, h3: h3Count } },
    score: Math.min(100, score),
  };
}

/* ------------------------------------------------------------------ */
/*  Route handler                                                      */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalise URL
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    // Validate URL
    try {
      new URL(finalUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Fetch the page
    let html = "";
    let responseHeaders: Record<string, string> = {};

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(finalUrl, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebsiteGrader/1.0; +https://sunnypatel.co.uk/tools/website-grader/)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      clearTimeout(timeout);

      // Capture response headers (lowercase keys)
      res.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });

      // Update final URL after redirects
      if (res.url) {
        finalUrl = res.url;
      }

      html = await res.text();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: message.includes("abort") ? "Request timed out (10s). The site may be slow or blocking requests." : `Could not fetch the page: ${message}` },
        { status: 502 }
      );
    }

    // Run analysis
    const seo = analyseSeo(html, finalUrl);
    const security = analyseSecurity(responseHeaders, finalUrl);
    const content = analyseContent(html, finalUrl);

    const response: GradeResponse = {
      seoChecks: seo.checks,
      securityChecks: security.checks,
      contentStats: content.stats,
      seoScore: seo.score,
      securityScore: security.score,
      contentScore: content.score,
      url: finalUrl,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
