import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import data from "@/data/ctr-study.json";
import method from "@/data/ctr-study-method.json";
import styles from "./seo-companies-guide.module.css";
import ctr from "./ctr-study.module.css";

const navigation = [["ctr-table", "Inspect the table"], ["findings", "What the sample shows"], ["methodology", "Collection method"], ["calculation", "Position and CTR"], ["limitations", "Limits of the evidence"], ["use-the-data", "Use the figures"], ["next-edition", "A stronger repeat study"], ["corrections", "Correction history"], ["cite-this-study", "Cite and download"]];
const number = (n: number) => n.toLocaleString("en-GB");
const totals = data.table.reduce((a, row) => ({clicks: a.clicks + row.clicks, impressions: a.impressions + row.impressions, queries: a.queries + row.queries}), {clicks: 0, impressions: 0, queries: 0});

export function CtrStudyGuide({title, faqs, children}: {title: string; faqs: readonly {question: string; answer: string}[]; children: ReactNode}) {
  return <div className={styles.guide}><Navbar /><main id="main-content" tabIndex={-1}>
    <header className={`${styles.hero} ${ctr.hero}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog/">Blog</Link><span>/</span><span aria-current="page">Google CTR study</span></nav>
      <p className={styles.eyebrow}>Original portfolio research · Corrected September 2026</p>
      <h1>{title}</h1>
      <p className={styles.dek}>A portfolio study with the sample behind every percentage.</p>
      <p>Explore 2,615 retained query rows from 53 qualifying Search Console properties. Every position bucket includes its clicks, impressions and row count.</p>
      <div className={styles.actions}><a className={styles.primary} href="#ctr-table">Inspect the data <span aria-hidden="true">↓</span></a><a className={styles.textLink} href="/downloads/google-ctr-study-2026-07.csv" download>Download CSV</a></div>
      <div className={styles.byline}><Link href="/author/sunny-patel/">Research by Sunny Patel</Link><span>Measured 9 April–7 July 2026</span><span>Published 10 July 2026</span></div>
      <p className={styles.disclosure}><strong>Scope correction · 12 September 2026.</strong> This collection had no country filter or explicit brand exclusion. Earlier UK-only descriptions and causal ranking claims have been withdrawn. The historical totals are unchanged. <a href="#corrections">Read the correction</a>.</p>
    </header>
    <div className={styles.layout}><aside className={styles.contents}><nav aria-label="On this page"><p>On this page</p><ol>{navigation.map(([id,label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav></aside>
      <div className={styles.body}>
        <section id="ctr-table" className={styles.section}><h2>What is the CTR for each position bucket?</h2>
          <p>The table contains all 12 retained bucket totals. CTR is calculated from each bucket&apos;s clicks and impressions. The query-row column shows how much evidence sits behind the percentage.</p>
          <p className={ctr.scrollHint} id="ctr-scroll-hint">On a narrow screen, scroll the table horizontally to see every column.</p>
          <div className={ctr.tableScroll} role="region" aria-label="CTR by rounded average-position bucket" aria-describedby="ctr-scroll-hint" tabIndex={0}>
            <table className={ctr.table}><caption>9 April–7 July 2026 · Unfiltered portfolio sample</caption><colgroup><col style={{width:124}}/><col style={{width:80}}/><col style={{width:120}}/><col style={{width:105}}/><col style={{width:151}}/></colgroup><thead><tr><th scope="col">Bucket</th><th scope="col">CTR</th><th scope="col">Query rows</th><th scope="col">Clicks</th><th scope="col">Impressions</th></tr></thead>
              <tbody>{data.table.map(row => <tr key={row.position}><th scope="row">{row.position}</th><td><span className={ctr.miniBar} aria-hidden="true" style={{width: `${row.ctr * 10}%`}} />{row.ctr.toFixed(2)}%</td><td>{number(row.queries)}</td><td>{number(row.clicks)}</td><td>{number(row.impressions)}</td></tr>)}</tbody>
              <tfoot><tr><th scope="row">Retained total</th><td>{(totals.clicks / totals.impressions * 100).toFixed(2)}%</td><td>{number(totals.queries)}</td><td>{number(totals.clicks)}</td><td>{number(totals.impressions)}</td></tr></tfoot>
            </table>
          </div>
          <p className={styles.small}>Position one contains five query rows. Row counts are query-property observations, not necessarily distinct queries. The bars use a common 0–10% CTR scale. <a href="#calculation">Read the exact bucket boundaries</a>.</p>
        </section>
        <div className={styles.article}>{children}</div>
        <section id="cite-this-study" className={styles.section}><h2>How can you cite and download this study?</h2><p>Use a citation that preserves the sample and dates. Download the aggregate data and method together. The measurement period remains April–July 2026 despite the September correction.</p>
          <blockquote className={ctr.citation}>{method.citation}</blockquote>
          <ul className={ctr.downloads}><li><a href="/downloads/google-ctr-study-2026-07.csv" download>Download the 12-row CSV with method notes</a></li><li><a href="/downloads/google-ctr-study-2026-07.json" download>Download the data and methodology as JSON</a></li><li><a href="/images/stats/portfolio-ctr-study-2026.png" download>Download the chart as PNG</a> or <a href="/images/stats/portfolio-ctr-study-2026.svg" download>editable SVG</a></li></ul>
          <p className={styles.small}>{method.reuse} The downloads contain aggregate totals only. No domains or query strings are published.</p>
        </section>
        <section id="faq" className={`${styles.section} ${styles.faq}`}><h2>Common questions about the CTR study</h2>{faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
        <div className={styles.finish}><p>Need a statistic with a different audience or measurement period?</p><Link className={styles.primary} href="/blog/seo-statistics-uk/">Explore the sourced SEO statistics</Link><span>Check the geography, denominator and collection method before using a benchmark.</span></div>
      </div>
    </div>
  </main><Footer /></div>;
}
