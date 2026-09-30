"use client";
import { useState } from "react";
import { downloadText, fetchPage } from "@/lib/fetch-page-client";
type Item = { title: string; url: string; note: string };
type Section = { heading: string; links: Item[] };
const clean = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
const safeUrl = (value: string) => { try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch { return ""; } };
function render(name: string, summary: string, details: string, sections: Section[], optional: Item[]) {
  const links = (items: Item[]) => items.filter(item => item.title.trim() && safeUrl(item.url)).map(item => `- [${clean(item.title).replace(/[\[\]]/g, "")}](${safeUrl(item.url)})${item.note.trim() ? `: ${clean(item.note)}` : ""}`).join("\n");
  return [`# ${clean(name)}`, `> ${clean(summary)}`, details.trim() ? clean(details) : "", ...sections.filter(s => links(s.links)).map(s => `## ${clean(s.heading) || "Links"}\n\n${links(s.links)}`), optional.length && links(optional) ? `## Optional\n\n${links(optional)}` : ""].filter(Boolean).join("\n\n") + "\n";
}
export default function LlmsTxtGenerator() {
  const [name, setName] = useState(""); const [summary, setSummary] = useState(""); const [details, setDetails] = useState(""); const [site, setSite] = useState("");
  const [sections, setSections] = useState<Section[]>([{ heading: "Key pages", links: [{ title: "", url: "", note: "" }] }]);
  const [optional, setOptional] = useState<Item[]>([]); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const output = name.trim() && summary.trim() ? render(name, summary, details, sections, optional) : "";
  function editSection(index: number, section: Section) { setSections(sections.map((s, i) => i === index ? section : s)); }
  async function prefill() {
    setBusy(true); setMessage("");
    try {
      const homeUrl = new URL(site.trim());
      const home = await fetchPage(homeUrl.href);
      if (!/html/i.test(home.contentType)) throw new Error("The homepage did not return HTML.");
      const doc = new DOMParser().parseFromString(home.text, "text/html");
      setName(doc.querySelector("title")?.textContent?.trim().split(/[|:]/)[0].trim() || homeUrl.hostname);
      setSummary(doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || "A guide to the main pages on this site.");
      const items: Item[] = []; const seen = new Set<string>();
      try {
        const sitemap = await fetchPage(new URL("/sitemap.xml", homeUrl).href);
        const xml = new DOMParser().parseFromString(sitemap.text, "application/xml");
        for (const loc of xml.getElementsByTagName("loc")) {
          const address = safeUrl(loc.textContent || ""); if (!address || new URL(address).host !== homeUrl.host || seen.has(address)) continue;
          seen.add(address); items.push({ title: new URL(address).pathname === "/" ? "Homepage" : new URL(address).pathname.split("/").filter(Boolean).pop()!.replaceAll("-", " "), url: address, note: "" });
          if (items.length >= 20) break;
        }
      } catch { /* Homepage links remain available. */ }
      if (!items.length) for (const anchor of doc.querySelectorAll("a[href]")) {
        const address = safeUrl(new URL(anchor.getAttribute("href")!, homeUrl).href);
        if (!address || new URL(address).host !== homeUrl.host || seen.has(address)) continue;
        seen.add(address); items.push({ title: anchor.textContent?.trim() || new URL(address).pathname, url: address, note: "" });
        if (items.length >= 20) break;
      }
      setSections([{ heading: "Key pages", links: items.length ? items : [{ title: "Homepage", url: homeUrl.href, note: "" }] }]);
      setMessage(`Prefilled ${items.length} links. Review the title, summary and each link before publishing.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Prefill failed."); }
    finally { setBusy(false); }
  }
  return <section className="rounded-xl border border-hairline bg-wash p-5 dark:bg-white/[0.02] sm:p-7">
    <div className="mb-5 rounded-lg border border-hairline p-4"><label className="block text-sm font-medium text-foreground">Site URL for optional prefill<input type="url" value={site} onChange={e => setSite(e.target.value)} placeholder="https://example.com/" className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label><button disabled={!site.trim() || busy} onClick={prefill} className="mt-3 rounded-lg border border-hairline px-4 py-2 text-sm text-foreground disabled:opacity-50">{busy ? "Fetching..." : "Prefill from site"}</button>{message && <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">{message}</p>}</div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-foreground">Site name<input value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label><label className="text-sm font-medium text-foreground">One-paragraph summary<textarea value={summary} onChange={e => setSummary(e.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label></div>
    <label className="mt-4 block text-sm font-medium text-foreground">Optional details<textarea value={details} onChange={e => setDetails(e.target.value)} className="mt-2 min-h-20 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label>
    {sections.map((section, i) => <div key={i} className="mt-5 rounded-lg border border-hairline p-4"><label className="text-sm font-medium text-foreground">Section heading<input value={section.heading} onChange={e => editSection(i, { ...section, heading: e.target.value })} className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label>{section.links.map((item, j) => <div key={j} className="mt-3 grid gap-2 sm:grid-cols-3"><input aria-label={`Link ${j + 1} title`} placeholder="Link title" value={item.title} onChange={e => editSection(i, { ...section, links: section.links.map((x, k) => k === j ? { ...x, title: e.target.value } : x) })} className="min-w-0 rounded-lg border border-hairline bg-background p-3 text-foreground" /><input aria-label={`Link ${j + 1} URL`} type="url" placeholder="https://example.com/page/" value={item.url} onChange={e => editSection(i, { ...section, links: section.links.map((x, k) => k === j ? { ...x, url: e.target.value } : x) })} className="min-w-0 rounded-lg border border-hairline bg-background p-3 text-foreground" /><input aria-label={`Link ${j + 1} note`} placeholder="Short note" value={item.note} onChange={e => editSection(i, { ...section, links: section.links.map((x, k) => k === j ? { ...x, note: e.target.value } : x) })} className="min-w-0 rounded-lg border border-hairline bg-background p-3 text-foreground" /></div>)}<button onClick={() => editSection(i, { ...section, links: [...section.links, { title: "", url: "", note: "" }] })} className="mt-3 text-sm text-brand underline">Add link</button></div>)}
    <button onClick={() => setSections([...sections, { heading: "Resources", links: [{ title: "", url: "", note: "" }] }])} className="mt-4 rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">Add section</button><button onClick={() => setOptional([...optional, { title: "", url: "", note: "" }])} className="ml-2 mt-4 rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">Add optional link</button>
    {optional.map((item, i) => <div key={i} className="mt-3 grid gap-2 sm:grid-cols-3">{(["title", "url", "note"] as const).map(field => <input key={field} aria-label={`Optional link ${i + 1} ${field}`} placeholder={field} value={item[field]} onChange={e => setOptional(optional.map((x, j) => j === i ? { ...x, [field]: e.target.value } : x))} className="min-w-0 rounded-lg border border-hairline bg-background p-3 text-foreground" />)}</div>)}
    {output && <div className="mt-6"><label className="text-sm font-semibold text-foreground">llms.txt draft<textarea readOnly value={output} className="mt-2 h-64 w-full rounded-lg border border-hairline bg-background p-3 font-mono text-xs text-foreground" /></label><div className="mt-3 flex gap-3"><button onClick={() => navigator.clipboard.writeText(output)} className="rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">Copy text</button><button onClick={() => downloadText("llms.txt", output)} className="rounded-lg border border-hairline px-4 py-2 text-sm text-foreground">Download llms.txt</button></div></div>}
  </section>;
}
