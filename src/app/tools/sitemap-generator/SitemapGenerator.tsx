"use client";
import { useRef, useState } from "react";
import { downloadText, fetchPage } from "@/lib/fetch-page-client";

type Entry = { url: string; lastmod?: string };
function escapeXml(value: string) { return value.replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] || c); }
function xmlFor(entries: Entry[]) { return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(e => `  <url><loc>${escapeXml(e.url)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`; }
function robotRules(text: string): string[] {
  let agents: string[] = []; const rules: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#")[0].trim(); const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) { if (!line) agents = []; continue; }
    const key = match[1].trim().toLowerCase(), value = match[2].trim();
    if (key === "user-agent") agents.push(value.toLowerCase());
    else if (key === "disallow" && agents.includes("*") && value) rules.push(value);
  }
  return rules;
}
function blocked(path: string, rules: string[]) { return rules.some(rule => { const pattern = rule.split("*").map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*"); return new RegExp(`^${pattern}`).test(path); }); }

export default function SitemapGenerator() {
  const [url, setUrl] = useState(""); const [limit, setLimit] = useState(30); const [entries, setEntries] = useState<Entry[]>([]);
  const [checked, setChecked] = useState(0); const [queued, setQueued] = useState(0); const [running, setRunning] = useState(false); const [error, setError] = useState("");
  const stopRef = useRef(false); const xml = xmlFor(entries);
  async function crawl() {
    setEntries([]); setChecked(0); setQueued(0); setError(""); setRunning(true); stopRef.current = false;
    try {
      const root = new URL(url.trim()); if (!/^https?:$/.test(root.protocol)) throw new Error("Enter an http or https site URL.");
      root.hash = ""; root.search = "";
      let rules: string[] = [];
      try { const robots = await fetchPage(new URL("/robots.txt", root).href); rules = robotRules(robots.text); } catch { /* A missing robots file has no wildcard rules. */ }
      const seen = new Set<string>([root.href]); const queue = [root.href]; const found: Entry[] = [];
      let active = 0; let count = 0;
      await new Promise<void>(resolve => {
        const pump = () => {
          while (!stopRef.current && active < 4 && queue.length && count + active < limit) {
            const current = queue.shift()!; active++;
            (async () => {
              try {
                const address = new URL(current);
                if (blocked(address.pathname + address.search, rules)) return;
                const page = await fetchPage(current);
                if (!/text\/html|application\/xhtml\+xml/i.test(page.contentType)) return;
                const doc = new DOMParser().parseFromString(page.text, "text/html");
                const noindex = [...doc.querySelectorAll("meta[name]")].some(el => /^(robots|googlebot)$/i.test(el.getAttribute("name") || "") && /\bnoindex\b/i.test(el.getAttribute("content") || ""));
                const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
                if (noindex || canonical && new URL(canonical, current).href !== current) return;
                const date = page.lastModified ? new Date(page.lastModified) : null;
                found.push({ url: current, lastmod: date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined }); setEntries([...found]);
                for (const anchor of doc.querySelectorAll("a[href]")) {
                  try {
                    const next = new URL(anchor.getAttribute("href")!, current);
                    next.hash = "";
                    if (next.protocol !== root.protocol || next.host !== root.host || seen.has(next.href) || /\.(?:pdf|jpg|jpeg|png|webp|gif|svg|zip|xml|txt|css|js)$/i.test(next.pathname)) continue;
                    if (seen.size >= limit) break;
                    seen.add(next.href); queue.push(next.href);
                  } catch { /* Skip malformed links. */ }
                }
                setQueued(queue.length);
              } catch (e) { if (current === root.href) setError(e instanceof Error ? e.message : "Homepage fetch failed."); }
              finally { active--; count++; setChecked(count); if ((!queue.length || stopRef.current || count >= limit) && active === 0) resolve(); else pump(); }
            })();
          }
          if (active === 0 && (!queue.length || stopRef.current || count >= limit)) resolve();
        }; pump();
      });
    } catch (e) { setError(e instanceof Error ? e.message : "Crawl failed."); }
    finally { setRunning(false); }
  }
  return <section className="rounded-xl border border-hairline bg-wash p-5 dark:bg-white/[0.02] sm:p-7">
    <div className="grid gap-4 sm:grid-cols-[1fr_9rem]"><label className="text-sm font-medium text-foreground">Site URL<input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/" className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label><label className="text-sm font-medium text-foreground">Maximum URLs<input type="number" min="1" max="500" value={limit} onChange={e => setLimit(Math.min(500, Math.max(1, Number(e.target.value) || 1)))} className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label></div>
    <div className="mt-4 flex gap-3"><button onClick={crawl} disabled={running || !url.trim()} className="rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50">{running ? "Crawling..." : "Generate sitemap"}</button>{running && <button onClick={() => { stopRef.current = true; }} className="rounded-lg border border-hairline px-5 py-3 text-foreground">Stop crawl</button>}</div>
    <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">Checked {checked} URLs. Found {entries.length} indexable HTML pages. Queue: {queued}.</p>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {entries.length > 0 && <div className="mt-5"><label className="text-sm font-semibold text-foreground">XML sitemap<textarea readOnly value={xml} className="mt-2 h-64 w-full rounded-lg border border-hairline bg-background p-3 font-mono text-xs text-foreground" /></label><div className="mt-3 flex gap-3"><button onClick={() => navigator.clipboard.writeText(xml)} className="rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">Copy XML</button><button onClick={() => downloadText("sitemap.xml", xml, "application/xml")} className="rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">Download XML</button></div></div>}
  </section>;
}
