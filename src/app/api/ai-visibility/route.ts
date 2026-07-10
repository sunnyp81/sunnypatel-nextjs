import { NextRequest, NextResponse } from "next/server";

interface Check {
  check: string;
  passed: boolean;
  value: string;
  recommendation: string;
}

interface Pillar {
  name: string;
  score: number;
  max: number;
  checks: Check[];
}

const UA =
  "Mozilla/5.0 (compatible; AIVisibilityChecker/1.0; +https://sunnypatel.co.uk/tools/ai-visibility-checker/)";

async function fetchText(url: string, timeoutMs = 10000): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html,text/plain,application/json" },
    });
    clearTimeout(timeout);
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  }
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1]);
      const items = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
      for (const item of items) if (item && typeof item === "object") blocks.push(item);
    } catch {
      /* invalid block, skip */
    }
  }
  return blocks;
}

function typesOf(blocks: Record<string, unknown>[]): string[] {
  return blocks.flatMap((b) => {
    const t = b["@type"];
    return Array.isArray(t) ? (t as string[]) : typeof t === "string" ? [t] : [];
  });
}

function botRule(robots: string, bot: string): "allowed" | "blocked" | "unlisted" {
  const sections = robots.split(/(?=user-agent:)/i);
  for (const s of sections) {
    const uaLine = s.match(/user-agent:\s*(.+)/i);
    if (!uaLine) continue;
    if (uaLine[1].trim().toLowerCase() === bot.toLowerCase()) {
      if (/disallow:\s*\/\s*$/im.test(s)) return "blocked";
      return "allowed";
    }
  }
  return "unlisted"; // falls through to * rules; treat as allowed unless * blocks all
}

export async function POST(req: NextRequest) {
  let url: string;
  try {
    const body = await req.json();
    url = body.url;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let finalUrl = url.trim();
  if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
  let origin: string;
  try {
    origin = new URL(finalUrl).origin;
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const [page, robots, llms] = await Promise.all([
    fetchText(finalUrl),
    fetchText(`${origin}/robots.txt`, 6000),
    fetchText(`${origin}/llms.txt`, 6000),
  ]);

  if (!page.ok || !page.text) {
    return NextResponse.json(
      { error: `Could not fetch the page (status ${page.status || "network error"})` },
      { status: 422 }
    );
  }

  const html = page.text;
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const siteName =
    html.match(/property\s*=\s*["']og:site_name["'][^>]*content\s*=\s*["']([^"']+)["']/i)?.[1] ||
    html.match(/content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:site_name["']/i)?.[1] ||
    "";
  const brand = (siteName || title.split(/[|\-–:]/)[0] || new URL(finalUrl).hostname.replace(/^www\./, "")).trim();

  // Entity lookups in parallel
  const [wiki, wikidata] = await Promise.all([
    fetchText(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(brand)}&limit=3&format=json`,
      6000
    ),
    fetchText(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(brand)}&language=en&limit=3&format=json`,
      6000
    ),
  ]);

  let wikiHit = false;
  try {
    const parsed = JSON.parse(wiki.text);
    wikiHit = Array.isArray(parsed?.[1]) && parsed[1].some((t: string) => t.toLowerCase().includes(brand.toLowerCase().slice(0, 12)));
  } catch { /* no wiki data */ }
  let wikidataHit = false;
  try {
    const parsed = JSON.parse(wikidata.text);
    wikidataHit = Array.isArray(parsed?.search) && parsed.search.length > 0 &&
      parsed.search.some((e: { label?: string }) => (e.label || "").toLowerCase() === brand.toLowerCase());
  } catch { /* no wikidata */ }

  /* Pillar 1: AI crawl access */
  const robotsTxt = robots.ok ? robots.text : "";
  const bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
  const crawlChecks: Check[] = bots.map((bot) => {
    const rule = robots.ok ? botRule(robotsTxt, bot) : "unlisted";
    const passed = rule !== "blocked";
    return {
      check: `${bot} can crawl`,
      passed,
      value: robots.ok ? rule : "no robots.txt",
      recommendation: passed
        ? ""
        : `robots.txt blocks ${bot}. AI assistants using this crawler cannot read or cite your site.`,
    };
  });
  crawlChecks.push({
    check: "llms.txt present",
    passed: llms.ok,
    value: llms.ok ? "found" : "missing",
    recommendation: llms.ok
      ? ""
      : "Add an llms.txt file describing your site for AI crawlers. Emerging standard, cheap to add, and signals AI-readiness.",
  });
  const crawlScore = crawlChecks.filter((c) => c.passed).length * 4 + (llms.ok ? 5 : 0);

  /* Pillar 2: machine-readable identity */
  const blocks = extractJsonLd(html);
  const types = typesOf(blocks);
  const identityBlock = blocks.find((b) => {
    const t = typesOf([b]);
    return t.some((x) => ["Organization", "Person", "LocalBusiness", "ProfessionalService"].includes(x));
  });
  const sameAs = identityBlock && Array.isArray(identityBlock.sameAs) ? (identityBlock.sameAs as string[]) : [];
  const idChecks: Check[] = [
    {
      check: "JSON-LD structured data",
      passed: blocks.length > 0,
      value: blocks.length ? `${blocks.length} block(s): ${[...new Set(types)].slice(0, 5).join(", ")}` : "none",
      recommendation: blocks.length ? "" : "Add JSON-LD schema. AI systems use it to understand who you are and what you offer.",
    },
    {
      check: "Organization or Person entity",
      passed: !!identityBlock,
      value: identityBlock ? typesOf([identityBlock]).join(", ") : "missing",
      recommendation: identityBlock ? "" : "Declare an Organization or Person entity with name, url and description.",
    },
    {
      check: "sameAs corroboration links",
      passed: sameAs.length >= 2,
      value: `${sameAs.length} link(s)`,
      recommendation:
        sameAs.length >= 2
          ? ""
          : "Add sameAs links (LinkedIn, Google Business Profile, directories). AI systems verify identity across sources.",
    },
    {
      check: "FAQ or Article markup",
      passed: types.some((t) => ["FAQPage", "Article", "BlogPosting"].includes(t)),
      value: types.filter((t) => ["FAQPage", "Article", "BlogPosting"].includes(t)).join(", ") || "none",
      recommendation: types.some((t) => ["FAQPage", "Article", "BlogPosting"].includes(t))
        ? ""
        : "Mark up answerable content with FAQPage or Article schema so AI systems can lift answers cleanly.",
    },
  ];
  const idScore = [blocks.length > 0, !!identityBlock, sameAs.length >= 2, idChecks[3].passed].filter(Boolean).length * 6 + (blocks.length > 0 ? 1 : 0);

  /* Pillar 3: entity presence */
  const entityChecks: Check[] = [
    {
      check: "Wikipedia presence",
      passed: wikiHit,
      value: wikiHit ? "found" : "not found",
      recommendation: wikiHit
        ? ""
        : "No Wikipedia match for your brand. Hard to earn, but third-party mentions (press, directories, reviews) are the realistic substitute.",
    },
    {
      check: "Wikidata entity",
      passed: wikidataHit,
      value: wikidataHit ? "found" : "not found",
      recommendation: wikidataHit
        ? ""
        : "No Wikidata entity. Creating one (with references) gives AI systems a canonical identity record.",
    },
    {
      check: "Knowledge graph links in schema",
      passed: sameAs.some((s) => /wikipedia\.org|wikidata\.org/.test(s)),
      value: sameAs.some((s) => /wikipedia\.org|wikidata\.org/.test(s)) ? "linked" : "not linked",
      recommendation: sameAs.some((s) => /wikipedia\.org|wikidata\.org/.test(s))
        ? ""
        : "If you have Wikipedia or Wikidata entries, reference them in sameAs.",
    },
  ];
  const entityScore = (wikiHit ? 10 : 0) + (wikidataHit ? 10 : 0) + (entityChecks[2].passed ? 5 : 0);

  /* Pillar 4: answerability */
  const h1 = /<h1[\s>]/i.test(html);
  const metaDesc = /name\s*=\s*["']description["']/i.test(html);
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const questionHeadings = (html.match(/<h[23][^>]*>[^<]*\?/gi) || []).length;
  const ansChecks: Check[] = [
    { check: "Single clear H1", passed: h1, value: h1 ? "present" : "missing", recommendation: h1 ? "" : "Add one H1 stating what the page is about." },
    { check: "Meta description", passed: metaDesc, value: metaDesc ? "present" : "missing", recommendation: metaDesc ? "" : "Add a meta description that answers the page's core query in one sentence." },
    {
      check: "Section structure (3+ H2s)",
      passed: h2Count >= 3,
      value: `${h2Count} H2s`,
      recommendation: h2Count >= 3 ? "" : "Break content into H2 sections. AI systems extract answers per section.",
    },
    {
      check: "Question-form headings",
      passed: questionHeadings > 0 || types.includes("FAQPage"),
      value: questionHeadings > 0 ? `${questionHeadings} found` : types.includes("FAQPage") ? "FAQ schema" : "none",
      recommendation:
        questionHeadings > 0 || types.includes("FAQPage")
          ? ""
          : "Phrase some headings as the questions users ask. AI answers map directly onto question-shaped sections.",
    },
  ];
  const ansScore = [h1, metaDesc, h2Count >= 3, ansChecks[3].passed].filter(Boolean).length * 6 + (h1 ? 1 : 0);

  const pillars: Pillar[] = [
    { name: "AI Crawl Access", score: Math.min(25, crawlScore), max: 25, checks: crawlChecks },
    { name: "Machine-Readable Identity", score: Math.min(25, idScore), max: 25, checks: idChecks },
    { name: "Entity Presence", score: Math.min(25, entityScore), max: 25, checks: entityChecks },
    { name: "Answerability", score: Math.min(25, ansScore), max: 25, checks: ansChecks },
  ];
  const totalScore = pillars.reduce((s, p) => s + p.score, 0);

  return NextResponse.json({
    url: finalUrl,
    brand,
    totalScore,
    pillars,
    verdict:
      totalScore >= 80
        ? "Strong: AI systems can find, verify and cite this site."
        : totalScore >= 55
          ? "Partial: AI systems can read the site but will struggle to verify or cite the brand."
          : "Weak: this site is close to invisible to AI search.",
  });
}
