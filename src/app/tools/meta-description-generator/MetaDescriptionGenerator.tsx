"use client";
import { useState } from "react";
type Fields = { topic: string; keyword: string; audience: string; usp: string; cta: string };
const tidy = (value: string) => value.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
function drafts(f: Fields) {
  const topic = tidy(f.topic), keyword = tidy(f.keyword), audience = tidy(f.audience), usp = tidy(f.usp), cta = tidy(f.cta);
  const subject = topic.toLowerCase().includes(keyword.toLowerCase()) ? topic : `${topic} and ${keyword}`;
  const who = audience ? ` for ${audience}` : "";
  const benefit = usp ? `${usp.charAt(0).toUpperCase()}${usp.slice(1)}.` : "";
  const action = cta ? `${cta.charAt(0).toUpperCase()}${cta.slice(1)}.` : "";
  return [
    `${subject}${who}. ${benefit} ${action}`,
    `Explore ${subject}${who}. ${action} ${benefit}`,
    `Learn about ${subject}${who}. ${benefit} ${action}`,
    `A practical overview of ${subject}${who}. ${action} ${benefit}`,
    `Read the details on ${subject}${who}. ${benefit} ${action}`,
    `Find information about ${subject}${who}. ${action} ${benefit}`,
  ].map(s => s.replace(/\s+/g, " ").trim());
}
function width(text: string) { const canvas = document.createElement("canvas"); const context = canvas.getContext("2d"); if (!context) return text.length * 7; context.font = "14px Arial"; return Math.round(context.measureText(text).width); }
function highlight(text: string, keyword: string) { const at = text.toLowerCase().indexOf(keyword.toLowerCase()); if (!keyword || at < 0) return text; return <>{text.slice(0, at)}<mark className="rounded bg-brand/20 text-foreground">{text.slice(at, at + keyword.length)}</mark>{text.slice(at + keyword.length)}</>; }
export default function MetaDescriptionGenerator() {
  const [fields, setFields] = useState<Fields>({ topic: "", keyword: "", audience: "", usp: "", cta: "" }); const [results, setResults] = useState<string[]>([]);
  const labels: Record<keyof Fields, string> = { topic: "Page topic", keyword: "Primary keyword", audience: "Audience or location", usp: "Unique selling point", cta: "Call to action" };
  return <section className="rounded-xl border border-hairline bg-wash p-5 dark:bg-white/[0.02] sm:p-7">
    <div className="grid gap-4 sm:grid-cols-2">{(Object.keys(fields) as (keyof Fields)[]).map(key => <label key={key} className="text-sm font-medium text-foreground">{labels[key]}{key === "topic" || key === "keyword" ? " *" : ""}<input value={fields[key]} onChange={e => setFields({ ...fields, [key]: e.target.value })} className="mt-2 w-full rounded-lg border border-hairline bg-background p-3 text-foreground" /></label>)}</div>
    <button disabled={!fields.topic.trim() || !fields.keyword.trim()} onClick={() => setResults(drafts(fields))} className="mt-5 rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50">Generate six descriptions</button>
    {results.length > 0 && <div className="mt-7 space-y-3"><h2 className="text-xl font-bold text-foreground">Six drafts</h2><p className="text-sm text-muted-foreground">Desktop guide: around 920 px. Mobile guide: around 680 px. These are estimates, not fixed Google limits.</p>{results.map((text, i) => <div key={i} className="rounded-lg border border-hairline bg-background p-4"><p className="break-words text-sm leading-relaxed text-foreground">{highlight(text, tidy(fields.keyword))}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{text.length} characters · about {width(text)} px · {width(text) <= 680 ? "within mobile guide" : width(text) <= 920 ? "within desktop guide" : "over desktop guide"}</span><button onClick={() => navigator.clipboard.writeText(text)} className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-foreground">Copy</button></div></div>)}</div>}
  </section>;
}
