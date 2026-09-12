"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import data from "@/data/seo-statistics.json";
import styles from "./seo-companies-guide.module.css";
import stats from "./seo-statistics.module.css";

export function StatisticsLibrary() {
  const [scope, setScope] = useState("all");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");
  const [fallback, setFallback] = useState("");
  useEffect(() => {
    const reveal = () => {
      const id = window.location.hash.slice(1);
      if (data.statistics.some(stat => stat.id === id)) {
        flushSync(() => { setScope("all"); setQuery(""); });
        const target = document.getElementById(id);
        target?.scrollIntoView({behavior: "instant"});
        target?.focus({preventScroll: true});
      }
    };
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  const matches = data.statistics.filter(stat => (scope === "all" || stat.scope === scope) &&
    `${stat.label} ${stat.statement} ${stat.topic} ${stat.source}`.toLowerCase().includes(query.trim().toLowerCase()));
  async function copy(stat: typeof data.statistics[number]) {
    const text = `${stat.statement}\nScope: ${stat.scope}. Measured: ${stat.period}. Sample: ${stat.sample}\nLimitation: ${stat.caveat}\nPrimary source: ${stat.source} (${stat.sourceUrl})\nCompiled by Sunny Patel; checked 12 September 2026. ${data.pageUrl}#${stat.id}`;
    try { await navigator.clipboard.writeText(text); setCopied(stat.id); setFallback(""); }
    catch { setFallback(text); setCopied(""); }
  }
  return <>
    <div className={stats.filters}>
      <div><label htmlFor="stat-scope">Geography and ownership</label><select id="stat-scope" value={scope} onChange={event => setScope(event.target.value)}><option value="all">All 18 statistics</option><option value="UK">UK research (11)</option><option value="US">US comparisons (3)</option><option value="Portfolio">My portfolio (4)</option></select></div>
      <div><label htmlFor="stat-search">Find a statistic</label><input id="stat-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try Google, AI, clicks or Ofcom" /></div>
    </div>
    <p className={styles.small} role="status">Showing {matches.length} of {data.statistics.length} statistics{copied ? ". Citation copied, including the source and limitation." : ". Each entry has its own permanent link."}</p>
    {fallback && <div className={stats.fallback}><label htmlFor="citation-fallback">Clipboard unavailable. Select and copy this citation:</label><textarea id="citation-fallback" readOnly value={fallback} onFocus={event => event.target.select()} rows={7} /></div>}
    {matches.length === 0 && <div className={stats.empty}><p>No statistics match these filters.</p><button className={styles.secondary} onClick={() => {setScope("all"); setQuery("");}}>Clear filters</button></div>}
    <noscript>Filtering and copying need JavaScript. All statistics and file downloads are available below.</noscript>
    {matches.map(stat => <article id={stat.id} key={stat.id} tabIndex={-1} className={`${stats.stat} ${stat.scope === "Portfolio" ? stats.ownedStat : ""}`}>
      <div className={stats.value}><span>{stat.value}</span><small>{stat.scope === "Portfolio" ? "Author-owned data" : `${stat.scope} research`}</small></div>
      <div>
        <h3>{stat.label}</h3><p>{stat.statement}</p>
        <p className={stats.period}><strong>Measured:</strong> {stat.period}</p>
        <p className={stats.source}><a href={stat.sourceUrl}>{stat.source}</a> · {stat.sourceDateType} {stat.sourceDate} · Source checked {stat.checked}</p>
        <p className={stats.limit}><strong>Read with this limitation:</strong> {stat.caveat}</p>
        <details><summary>Sample and measurement notes</summary><p>{stat.sample}</p></details>
        <div className={stats.rowActions}><button className={styles.secondary} onClick={() => copy(stat)} aria-label={`Copy citation: ${stat.label}`}>{copied === stat.id ? "Citation copied" : "Copy citation"}</button><a href={`#${stat.id}`} aria-label={`Permanent link: ${stat.label}`}>Link to this statistic</a></div>
      </div>
    </article>)}
  </>;
}
