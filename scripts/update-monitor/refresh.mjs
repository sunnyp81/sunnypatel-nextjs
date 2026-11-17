#!/usr/bin/env node
// Refreshes src/data/live/update-monitor.json from Google's Search Status Dashboard,
// SEO news RSS feeds and an allowlist of SEO practitioners on Bluesky.
// Fails closed: if Google's feed fails or the result does not validate, the file is left untouched.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "src/data/live/update-monitor.json");
const RANKING = "rGHU1u87FJnkP6W2GwMi";
const UA = "Mozilla/5.0 (compatible; sunnypatel-update-monitor/1.0; +https://sunnypatel.co.uk/blog/google-update-portfolio-impact/)";
const DAY = 86400000;
const PRE_DAYS = 3;
const POST_DAYS = 21;
const KEEP = 8;

export const NEWS_FEEDS = [
  { source: "Search Engine Roundtable", url: "https://www.seroundtable.com/index.xml" },
  { source: "Search Engine Journal", url: "https://www.searchenginejournal.com/feed/" },
  { source: "Search Engine Land", url: "https://searchengineland.com/feed" },
  { source: "Google Search Central Blog", url: "https://developers.google.com/search/blog/feed.xml" },
  { source: "GSQi (Glenn Gabe)", url: "https://www.gsqi.com/marketing-blog/feed/" },
];

export const BLUESKY = [
  "rustybrick.com",
  "lilyray.nyc",
  "johnmu.com",
  "glenngabe.bsky.social",
  "aleyda.bsky.social",
  "brodieclark.bsky.social",
  "dannysullivan.bsky.social",
  "searchliaison.bsky.social",
];

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "-", ndash: "-", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"' };

export function clean(s = "") {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(s, max = 200) {
  const t = clean(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 120 ? cut.lastIndexOf(" ") : max).replace(/[,;:.\s]+$/, "")}…`;
}

export function typeOf(name) {
  const n = name.toLowerCase();
  if (n.includes("core update")) return "core";
  if (n.includes("spam update")) return "spam";
  if (n.includes("discover")) return "discover";
  if (n.includes("helpful content")) return "helpful-content";
  if (n.includes("review")) return "reviews";
  return "other";
}

const isoDate = (s) => (s ? new Date(s).toISOString().slice(0, 10) : null);

export function normaliseIncident(i) {
  const updates = [...(i.updates ?? [])].sort((a, b) => a.when.localeCompare(b.when));
  return {
    id: i.id,
    name: clean(i.external_desc),
    type: typeOf(i.external_desc),
    start: i.begin,
    end: i.end ?? null,
    status: i.end ? "complete" : "rolling-out",
    url: `https://status.search.google.com/${i.uri}`,
    googleNotes: updates.map((u) => ({ when: u.when, text: clean(u.text).replace(/\s*https?:\/\/\S+/g, "").replace(/\s+([.,])/g, "$1") })),
  };
}

function parseRss(xml, source) {
  const items = [];
  for (const block of xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/g) ?? []) {
    const tag = (t) => block.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))?.[1];
    const link = clean(tag("link") ?? "") || block.match(/<link[^>]*href="([^"]+)"/)?.[1] || "";
    const date = tag("pubDate") ?? tag("published") ?? tag("updated") ?? tag("dc:date");
    items.push({ kind: "news", source, title: clean(tag("title")).replace(/\s+via @\S+(,\s*@\S+)*$/, ""), url: link.trim(), date: date ? new Date(clean(date)).toISOString() : null, text: tag("description") ?? tag("summary") ?? "" });
  }
  return items;
}

const LOOSE = /\b(core|spam|ranking|algorithm) update\b|\branking (volatility|flux|chatter|turbulence)\b/i;
const kindOf = (u) => (u.type === "core" ? "core update" : u.type === "spam" ? "spam update" : `${u.type} update`);

// An item belongs to an update when its date falls in that update's window and it names that kind of update.
// Only news headlines may match on looser volatility wording, and only when one update is in the window.
export function matchUpdate(item, updates, now = Date.now()) {
  if (!item.date) return null;
  const t = Date.parse(item.date);
  const title = item.title ?? "";
  const hay = `${title} ${clean(item.text ?? "")}`;
  if (!/google/i.test(hay)) return null;
  const inWindow = updates.filter((u) => {
    const s = Date.parse(u.start) - PRE_DAYS * DAY;
    const e = (u.end ? Date.parse(u.end) : now) + POST_DAYS * DAY;
    return t >= s && t <= e;
  });
  const named = inWindow.find((u) => new RegExp(kindOf(u), "i").test(hay));
  if (named) return named.id;
  if (item.kind === "news" && inWindow.length === 1 && LOOSE.test(title)) return inWindow[0].id;
  return null;
}

async function get(url, as = "text") {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: as === "json" ? "application/json" : "application/rss+xml, application/xml, text/xml" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return as === "json" ? res.json() : res.text();
}

async function fetchNews(log) {
  const out = [];
  for (const f of NEWS_FEEDS) {
    try {
      const items = parseRss(await get(f.url), f.source);
      log.push(`${f.source}: ${items.length} items`);
      out.push(...items);
    } catch (e) {
      log.push(`${f.source}: skipped (${e.message})`);
    }
  }
  return out;
}

async function fetchBluesky(log) {
  const out = [];
  for (const actor of BLUESKY) {
    try {
      const j = await get(`https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${actor}&limit=50&filter=posts_no_replies`, "json");
      for (const { post, reason } of j.feed ?? []) {
        if (reason || post.author.handle !== actor) continue;
        if ((post.labels ?? []).length || (post.author.labels ?? []).some((l) => l.val !== "!no-unauthenticated")) continue;
        const rkey = post.uri.split("/").pop();
        out.push({ kind: "community", source: "Bluesky", author: clean(post.author.displayName || actor).replace(/[^\p{L}\p{N}\s.'-]/gu, "").trim() || actor, handle: actor, title: "", text: post.record?.text ?? "", url: `https://bsky.app/profile/${actor}/post/${rkey}`, date: post.record?.createdAt ?? post.indexedAt, likes: post.likeCount ?? 0 });
      }
      log.push(`Bluesky ${actor}: ok`);
    } catch (e) {
      log.push(`Bluesky ${actor}: skipped (${e.message})`);
    }
  }
  return out;
}

const shape = (i) =>
  i.kind === "news"
    ? { source: i.source, title: excerpt(i.title, 160), url: i.url, date: isoDate(i.date), summary: excerpt(clean(i.text).replace(/\s*The post .* appeared first on .*$/, ""), 200) }
    : { source: i.source, author: i.author, handle: i.handle, url: i.url, date: isoDate(i.date), text: excerpt(clean(i.text).replace(/(https?:\/\/)?\b[\w-]+(\.[\w-]+)+\/\S*/g, "").replace(/\*\*/g, ""), 220), likes: i.likes };

export function validate(data) {
  const errors = [];
  const walk = (v, p) => {
    if (typeof v === "string") {
      if (v.includes("�")) errors.push(`${p}: replacement character`);
      if (/<\/?[a-z][^>]*>|&[a-z]+;/i.test(v)) errors.push(`${p}: unescaped markup`);
    } else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${p}.${k}`);
  };
  walk(data, "$");
  if (!data.updates?.length) errors.push("no updates");
  for (const u of data.updates ?? []) {
    if (!u.name || !u.start || !/^https:\/\/status\.search\.google\.com\//.test(u.url)) errors.push(`${u.id}: bad update`);
    for (const i of [...(u.news ?? []), ...(u.community ?? [])]) {
      if (!/^https:\/\//.test(i.url) || /news\.google\.com/.test(i.url)) errors.push(`${u.id}: bad link ${i.url}`);
      if (!i.date || !(i.title || i.text)) errors.push(`${u.id}: empty item ${i.url}`);
    }
  }
  return errors;
}

const contentKey = (d) => JSON.stringify({ ...d, checkedAt: undefined, changedAt: undefined });

async function main() {
  const log = [];
  const prev = JSON.parse(readFileSync(OUT, "utf8"));
  const blocked = new Set(prev.blocked ?? []);

  const incidents = await get("https://status.search.google.com/incidents.json", "json");
  const fresh = incidents.filter((i) => i.service_key === RANKING).map(normaliseIncident);
  if (!fresh.length) throw new Error("Google feed returned no ranking incidents");

  const byId = new Map(prev.updates.map((u) => [u.id, u]));
  for (const f of fresh) byId.set(f.id, { ...byId.get(f.id), ...f, news: byId.get(f.id)?.news ?? [], community: byId.get(f.id)?.community ?? [] });
  const updates = [...byId.values()].sort((a, b) => b.start.localeCompare(a.start));

  const items = [...(await fetchNews(log)), ...(await fetchBluesky(log))];
  const now = Date.now();
  for (const item of items) {
    if (!item.url.startsWith("https://") || blocked.has(item.url)) continue;
    const id = matchUpdate(item, updates.filter((u) => u.status === "rolling-out" || now - Date.parse(u.end) < (POST_DAYS + 7) * DAY), now);
    if (!id) continue;
    const u = updates.find((x) => x.id === id);
    const list = item.kind === "news" ? u.news : u.community;
    if (list.some((x) => x.url === item.url)) continue;
    list.push(shape(item));
  }
  for (const u of updates) {
    u.news = u.news.filter((x) => !blocked.has(x.url)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, KEEP);
    u.community = u.community.filter((x) => !blocked.has(x.url)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, KEEP);
  }

  const next = { ...prev, updates, checkedAt: new Date().toISOString() };
  const errors = validate(next);
  if (errors.length) throw new Error(`Validation failed, file left unchanged:\n${errors.join("\n")}`);

  const changed = contentKey(next) !== contentKey(prev);
  const statusChanged = JSON.stringify(prev.updates.map((u) => [u.id, u.status, u.end])) !== JSON.stringify(updates.map((u) => [u.id, u.status, u.end]));
  if (changed) {
    next.changedAt = next.checkedAt;
    if (statusChanged) next.statusChangedAt = next.checkedAt;
    writeFileSync(OUT, `${JSON.stringify(next, null, 2)}\n`);
  }
  console.log(log.join("\n"));
  console.log(changed ? `updated ${OUT}` : "no change");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
