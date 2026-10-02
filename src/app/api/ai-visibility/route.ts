import { NextRequest, NextResponse } from "next/server";
import { safePublicFetch } from "@/lib/safe-public-fetch";

export const runtime = "nodejs";

interface Check {
  check: string;
  passed: boolean | null;
  optional?: boolean;
  value: string;
  recommendation: string;
}

interface Pillar {
  name: string;
  score: number | null;
  max: number;
  checks: Check[];
}

const UA =
  "Mozilla/5.0 (compatible; AIVisibilityChecker/1.0; +https://sunnypatel.co.uk/tools/ai-visibility-checker/)";

async function fetchText(url: string, timeoutMs = 10000): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const res = await safePublicFetch(url, {
      redirect: "follow",
      timeoutMs,
      headers: { "User-Agent": UA, Accept: "text/html,text/plain,application/json" },
    });
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

// Evaluate the requested path, including grouped agents, wildcard fallback and
// longest matching Allow/Disallow. This describes directives, not network access.
function botRule(robots: string, bot: string, path: string): "allowed" | "blocked" | null {
  if (robots.length > 65536 || path.length > 2048) return null;
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[]; directivesSeen: boolean }[] = [];
  let group: typeof groups[number] | null = null;
  let directiveCount = 0;
  for (const line of robots.split(/\r?\n/)) {
    const clean = line.replace(/#.*$/, "").trim();
    const colon = clean.indexOf(":");
    if (colon < 0) continue;
    const field = clean.slice(0, colon).trim().toLowerCase();
    const value = clean.slice(colon + 1).trim();
    if (++directiveCount > 2000 || value.length > 512) return null;
    if (field === "user-agent") {
      if (!group || group.directivesSeen) { group = { agents: [], rules: [], directivesSeen: false }; groups.push(group); }
      group.agents.push(value.toLowerCase());
    } else if (group && (field === "allow" || field === "disallow")) {
      group.directivesSeen = true;
      if (value) group.rules.push({ allow: field === "allow", path: value });
    }
  }
  const agent = bot.toLowerCase();
  const specificity = (g: typeof groups[number]) => Math.max(-1, ...g.agents.map(a => a === "*" ? 0 : a && agent.includes(a) ? a.length : -1));
  const best = Math.max(-1, ...groups.map(specificity));
  const rules = groups.filter(g => specificity(g) === best && best >= 0).flatMap(g => g.rules);
  let workLeft = 1000000;
  const matching: typeof rules = [];
  for (const rule of rules) {
    const anchored = rule.path.endsWith("$");
    const pattern = anchored ? rule.path.slice(0, -1) : rule.path;
    // Bounded dynamic wildcard matching avoids regular-expression backtracking.
    workLeft -= pattern.length * (path.length + 1);
    if (workLeft < 0) return null;
    let previous = new Uint8Array(path.length + 1);
    previous[0] = 1;
    for (const char of pattern) {
      const next = new Uint8Array(path.length + 1);
      if (char === "*") next[0] = previous[0];
      for (let i = 1; i <= path.length; i++) {
        next[i] = char === "*" ? (previous[i] || next[i - 1]) : Number(!!previous[i - 1] && char === path[i - 1]);
      }
      previous = next;
    }
    if (anchored ? previous[path.length] : previous.some(Boolean)) matching.push(rule);
  }
  matching.sort((a, b) => b.path.replace(/[\*$]/g, "").length - a.path.replace(/[\*$]/g, "").length || Number(b.allow) - Number(a.allow));
  return matching[0]?.allow === false ? "blocked" : "allowed";
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

  function lookupMatch(response: { ok: boolean; text: string }, type: "wiki" | "wikidata"): boolean | null {
    if (!response.ok) return null;
    try {
      const parsed = JSON.parse(response.text);
      const entries: unknown = type === "wiki" ? parsed?.[1] : parsed?.search;
      if (!Array.isArray(entries)) return null;
      return entries.some(entry => {
        const label = type === "wiki" ? entry : entry?.label;
        return typeof label === "string" && label.toLowerCase() === brand.toLowerCase();
      });
    } catch { return null; }
  }
  const wikiHit = lookupMatch(wiki, "wiki");
  const wikidataHit = lookupMatch(wikidata, "wikidata");

  const parsedUrl = new URL(finalUrl);
  const path = parsedUrl.pathname + parsedUrl.search;
  const robotsKnown = robots.ok || robots.status === 404 || robots.status === 410;
  const bots = ["OAI-SearchBot", "PerplexityBot", "Googlebot"];
  const crawlChecks: Check[] = bots.map(bot => {
    const rule = robotsKnown ? botRule(robots.ok ? robots.text : "", bot, path) : null;
    return {
      check: `${bot} robots directive for this URL`,
      passed: rule === null ? null : rule === "allowed",
      value: rule === null ? "unavailable" : robots.ok ? rule : "no robots file (no restriction found)",
      recommendation: rule === "blocked" ? `Review this rule if you want ${bot} to crawl this URL. Robots permission alone does not prove access, indexing or inclusion.` : rule === null ? "Robots directives were unavailable or exceeded this diagnostic's complexity limits. Review the file manually before changing crawler settings." : "This checks robots directives only; firewalls and product source selection are not tested.",
    };
  });
  crawlChecks.push({
    check: "llms.txt (optional information)", optional: true, passed: null,
    value: llms.ok ? "found" : llms.status === 404 || llms.status === 410 ? "not found" : "unavailable",
    recommendation: "This optional file does not contribute to the score and is not required for Google AI features.",
  });
  const crawlScore = crawlChecks.slice(0, 3).some(c => c.passed === null) ? null : Math.round(crawlChecks.slice(0, 3).filter(c => c.passed).length / 3 * 25);

  const blocks = extractJsonLd(html);
  const types = typesOf(blocks);
  const identityBlock = blocks.find(b => typesOf([b]).some(t => ["Organization", "Person", "LocalBusiness", "ProfessionalService"].includes(t)));
  const sameAs = identityBlock && Array.isArray(identityBlock.sameAs) ? identityBlock.sameAs.filter((v): v is string => typeof v === "string") : [];
  const idChecks: Check[] = [
    { check: "Parseable JSON-LD", passed: blocks.length > 0, value: `${blocks.length} block(s)`, recommendation: "Describe visible page facts with an appropriate schema type where useful. Syntax checks do not verify claims or AI eligibility." },
    { check: "Organization or Person identity", passed: !!identityBlock, value: identityBlock ? typesOf([identityBlock]).join(", ") : "not detected", recommendation: "Use truthful identity markup where it fits the page; it is not a citation requirement." },
    { check: "Identity name", passed: typeof identityBlock?.name === "string" && !!identityBlock.name.trim(), value: typeof identityBlock?.name === "string" ? identityBlock.name : "not detected", recommendation: "Check the declared name against the visible author or organisation." },
    { check: "Identity URL", passed: typeof identityBlock?.url === "string" && /^https?:\/\//i.test(identityBlock.url), value: typeof identityBlock?.url === "string" ? identityBlock.url : "not detected", recommendation: "Use the actual identity's public URL where relevant." },
    { check: "FAQ or Article markup (optional)", passed: null, optional: true, value: types.filter(t => ["FAQPage", "Article", "BlogPosting"].includes(t)).join(", ") || "not detected", recommendation: "Choose schema that describes the content. FAQ markup is neither required nor a proven AI citation boost and does not contribute to the score." },
  ];
  const idScore = Math.round(idChecks.slice(0, 4).filter(c => c.passed).length / 4 * 25);

  const entityChecks: Check[] = [
    { check: "Wikipedia exact-label search candidate", passed: null, optional: true, value: wikiHit === null ? "lookup unavailable" : wikiHit ? "candidate found, unverified" : "no exact-label candidate", recommendation: "A name match does not verify this entity. Absence is not a defect or citation barrier; do not create entries just to raise a tool score." },
    { check: "Wikidata exact-label search candidate", passed: null, optional: true, value: wikidataHit === null ? "lookup unavailable" : wikidataHit ? "candidate found, unverified" : "no exact-label candidate", recommendation: "Confirm identity, references and notability independently. This lookup does not contribute to the score." },
    { check: "sameAs links", passed: null, optional: true, value: `${sameAs.length} declared link(s)`, recommendation: "Confirm that each link identifies the same entity. The number of links is not a validated visibility signal." },
  ];

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const metaDesc = /name\s*=\s*["']description["']/i.test(html);
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const ansChecks: Check[] = [
    { check: "One H1", passed: h1Count === 1, value: `${h1Count} detected`, recommendation: "Use one clear page heading. This automated count does not assess the answer's relevance." },
    { check: "Page title", passed: !!title, value: title || "not detected", recommendation: "Give the page a descriptive title that matches its purpose." },
    { check: "Meta description", passed: metaDesc, value: metaDesc ? "detected" : "not detected", recommendation: "Describe the page accurately; a description does not guarantee an AI citation." },
    { check: "Section headings", passed: h2Count > 0, value: `${h2Count} H2s detected`, recommendation: "Use headings where the content needs sections, rather than adding a fixed number to chase this score." },
  ];
  const ansScore = Math.round(ansChecks.filter(c => c.passed).length / 4 * 25);
  const pillars: Pillar[] = [
    { name: "Search crawler directives", score: crawlScore, max: 25, checks: crawlChecks },
    { name: "Structured identity checks", score: idScore, max: 25, checks: idChecks },
    { name: "Optional entity lookups", score: null, max: 0, checks: entityChecks },
    { name: "Page structure checks", score: ansScore, max: 25, checks: ansChecks },
  ];
  const incomplete = crawlScore === null;
  const totalScore = incomplete ? null : Math.round(((crawlScore ?? 0) + idScore + ansScore) / 75 * 100);
  return NextResponse.json({
    url: finalUrl, brand, totalScore, incomplete, pillars,
    verdict: incomplete ? "Robots directives were unavailable, so no overall score is shown. Other observed checks remain available." : "This is an editorial technical diagnostic, not an AI visibility measurement. Review the findings in context; no score establishes retrieval, trust or citations.",
  });
}
