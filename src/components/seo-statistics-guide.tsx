import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import data from "@/data/seo-statistics.json";
import { StatisticsLibrary } from "./seo-statistics-tools";
import styles from "./seo-companies-guide.module.css";
import stats from "./seo-statistics.module.css";

const navigation = [["statistics", "Find a statistic"], ["uk-search-market", "UK market and spending"], ["compare-ctr", "Use CTR benchmarks"], ["ai-and-zero-click", "AI and zero-click search"], ["seo-roi", "Build an SEO business case"], ["methodology", "Method and corrections"], ["reuse", "Cite and download"], ["faq", "Common questions"]];

export function SeoStatisticsGuide({title, faqs, children}: {title: string; faqs: readonly {question: string; answer: string}[]; children: ReactNode}) {
  return <div className={styles.guide}><Navbar /><main id="main-content" tabIndex={-1}>
    <header className={`${styles.hero} ${stats.hero}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog/">Blog</Link><span>/</span><span aria-current="page">UK SEO statistics</span></nav>
      <div className={styles.heroGrid}><div>
        <p className={styles.eyebrow}>September 2026 evidence update</p><h1>{title}</h1>
        <p className={styles.dek}>18 statistics, with sources and dates.</p>
        <p>Compare UK search behaviour, AI adoption and advertising spend. Each figure includes its sample and limitation. US comparisons and my portfolio observations are labelled.</p>
        <div className={styles.actions}><a className={styles.primary} href="#statistics">Find a statistic <span aria-hidden="true">↓</span></a><a className={styles.textLink} href="/downloads/seo-statistics-uk-2026.csv" download>Download all 18 (CSV)</a></div>
      </div><figure className={stats.chart}>
        <figcaption>Google searches ending without a click<span className={stats.chartMeta}>Published June 2026 · Browser-based search · Scale: 0–100%</span></figcaption>
        {data.zeroClickChart.values.map(item => <div className={stats.barRow} key={item.country}><div className={stats.barLabel}><span>{item.country}</span><strong>{item.value.toFixed(1)}%</strong></div><div className={stats.track} aria-hidden="true"><div className={`${stats.fill} ${item.country === "United Kingdom" ? stats.uk : ""}`} style={{width: `${item.value}%`}} /></div></div>)}
        <p className={stats.chartFoot}>Source: <a href={data.zeroClickChart.sourceUrl}>SparkToro</a> / <a href="https://www.similarweb.com/">Similarweb</a>. Google mobile-app searches excluded. Panel sizes not disclosed. <a href="#ai-and-zero-click">Read the period caveat</a> or <a href="#reuse">download this chart</a>.</p>
      </figure></div>
      <div className={stats.quickLinks}><a href="#google-referral-share">Google referral share: 91.75%</a><a href="#uk-search-ad-spend">UK search ads: £17.9bn</a><a href="#portfolio-position-one">My CTR sample: inspect the denominator</a></div>
      <div className={styles.byline}><Link href="/author/sunny-patel/">Compiled by Sunny Patel</Link><span>First published 7 March 2026</span><span>Sources checked 12 September 2026</span></div>
      <p className={styles.disclosure}>This is a sourced compilation with four author-owned portfolio figures. A 2026 review date does not turn older fieldwork into 2026 data. Use each entry&apos;s measurement period when citing it.</p>
    </header>
    <div className={styles.layout}><aside className={styles.contents}><nav aria-label="On this page"><p>On this page</p><ol>{navigation.map(([id,label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav></aside>
      <div className={styles.body}>
        <section id="statistics" className={styles.section}><h2>Which SEO statistics can you cite?</h2><p>Compare 11 UK findings, three US comparisons and four portfolio observations. Copy a citation with its original source and limitation, or use the permanent link to reference one entry.</p><StatisticsLibrary /></section>
        <div className={styles.article}>{children}</div>
        <section id="reuse" className={`${styles.section} ${stats.reuse}`}><h2>How can you cite or download the data?</h2><p>Cite the original researcher for the finding. Link to the individual entry here when this compilation or its explanation helped your work. Keep the geography, measurement period and denominator in your sentence.</p>
          <p className={styles.small}>Suggested page citation: Sunny Patel, <cite>SEO Statistics UK</cite>, sources checked 12 September 2026, {data.pageUrl}</p>
          <ul><li><a href="/downloads/seo-statistics-uk-2026.csv" download>Download the 18-statistic CSV</a> with sources, dates, samples and limitations.</li><li><a href="/downloads/seo-statistics-uk-2026.json" download>Download the same data as JSON</a>, including the six-country chart values.</li><li><a href="/images/stats/uk-zero-click-2026.png" download>Download the zero-click chart as PNG</a> or <a href="/images/stats/uk-zero-click-2026.svg" download>editable SVG</a>.</li></ul>
          <p className={styles.small}>Our chart is available to reuse with linked credit to Sunny Patel, SparkToro and Similarweb. The underlying research remains subject to its original publisher&apos;s terms. Downloads are ungated. Send corrections through the <Link href="/contact/">contact page</Link> with the entry link and supporting source.</p>
        </section>
        <section id="faq" className={`${styles.section} ${styles.faq}`}><h2>Common questions about UK SEO statistics</h2>{faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
        <div className={styles.finish}><p>Benchmark your own website against the right query and audience mix.</p><Link className={styles.primary} href="/tools/website-grader/" data-cta-location="seo_statistics_uk">Run the free website grader</Link><span>For business planning, use your own traffic, costs and qualified outcomes alongside these research findings.</span></div>
      </div>
    </div>
  </main><Footer /></div>;
}
