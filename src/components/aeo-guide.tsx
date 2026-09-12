import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { aeoProviders, aeoNeeds, aeoReviewed, aeoProposalCriteria } from "@/data/aeo-providers";
import { SeoCompanyFinder, SeoProposalScorecard } from "./seo-companies-tools";
import styles from "./seo-companies-guide.module.css";
import aeo from "./aeo-guide.module.css";

const navigation = [
  ["compare", "Compare AEO providers"], ["profiles", "Read the profiles"], ["sunny-patel", "My AI visibility audit"],
  ["evidence", "Understand the evidence"], ["aeo-scope", "AEO, GEO and SEO"], ["aeo-deliverables", "What should be included?"],
  ["aeo-measurement", "Measure AI visibility"], ["aeo-cost", "Prices and scope"], ["first-90-days", "The first 90 days"],
  ["aeo-red-flags", "Claims to question"], ["agency-or-consultant", "Choose your delivery model"],
  ["methodology", "Research and disclosure"], ["proposal-scorecard", "Score your proposals"], ["faq", "Common questions"],
];

export function AeoGuide({ title, image, faqs, children }: {
  title: string; image: string; faqs: readonly { question: string; answer: string }[]; children: ReactNode;
}) {
  return <div className={styles.guide}>
    <Navbar />
    <main id="main-content" tabIndex={-1}>
      <header className={styles.hero}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog/">Blog</Link><span>/</span><span aria-current="page">AEO agencies</span></nav>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>2026 answer engine optimisation guide</p>
            <h1>{title}</h1>
            <p className={styles.dek}>Compare AEO providers by evidence and scope.</p>
            <p>For a fixed-fee audit with direct consultant access, consider <a href="#sunny-patel">Sunny Patel (my consultancy)</a>. Compare the providers below by their actual delivery scope, evidence and reporting.</p>
            <div className={styles.actions}><a className={styles.primary} href="#compare">Find your AEO shortlist <span aria-hidden="true">↓</span></a><a className={styles.textLink} href="/downloads/aeo-provider-brief.txt" download>Download the AEO brief</a></div>
          </div>
          <figure className={styles.heroFigure}>
            <Image src={image} width={1600} height={900} sizes="(max-width: 800px) 100vw, 480px" alt="A paper answer shape connected by blue threads to three source cards with London landmarks." priority />
            <figcaption>Ask for the sources and measurements behind an answer-engine claim.</figcaption>
          </figure>
        </div>
        <div className={styles.byline}><Link href="/author/sunny-patel/">By Sunny Patel, SEO consultant</Link><span>Published <time dateTime="2026-06-09">9 June 2026</time></span><span>Content and sources updated <time dateTime={aeoReviewed}>12 September 2026</time></span></div>
        <p className={styles.disclosure}><strong>How to use this guide:</strong> compare {aeoProviders.length} providers, including my clearly labelled consultancy and {aeoProviders.length - 1} external options. The list is alphabetical. These are editorial fit assessments, not independently tested rankings. <a href="#methodology">Read the research method and disclosures.</a></p>
      </header>
      <div className={styles.layout}>
        <aside className={styles.contents}><nav aria-label="On this page"><p>On this page</p><ol>{navigation.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav></aside>
        <div className={styles.body}>
          <section id="compare" className={styles.section} aria-labelledby="compare-title">
            <p className={styles.eyebrow}>Start with the work you need</p>
            <h2 id="compare-title">Which AEO agencies and consultants should you compare?</h2>
            <p>Filter by your delivery gap. An audit, a digital PR campaign and an ongoing technical programme solve different problems. The suggested fits come from each provider&apos;s published services.</p>
            <SeoCompanyFinder companies={aeoProviders} needs={aeoNeeds} caption="UK AEO providers: delivery fit and quote checkpoints" />
            <p className={styles.small}>Aira&apos;s entry covers the off-site PR part of GEO. Confirm broader delivery separately. Published prices and quote conditions appear in the profiles below.</p>
          </section>
          <section id="profiles" className={styles.section} aria-labelledby="profiles-title">
            <p className={styles.eyebrow}>Read the evidence in context</p>
            <h2 id="profiles-title">What does each AEO provider offer?</h2>
            <p>These profiles distinguish service promises from public case studies. Provider-reported results have different samples, periods and definitions; they are not a like-for-like performance ranking.</p>
            <div className={styles.profiles}>{aeoProviders.map(provider => <article id={provider.id} key={provider.id} className={`${styles.profile}${provider.owned ? ` ${styles.owned}` : ""}`}>
              <div>{provider.owned && <p className={styles.eyebrow}>The author&apos;s own consultancy</p>}<h3>{provider.name}</h3><p className={styles.fit}>{provider.fit}</p><p className={styles.checked}>Sources checked<br /><time dateTime={provider.checked}>12 September 2026</time></p></div>
              <div><p>{provider.summary}</p><p className={aeo.price}><strong>Pricing:</strong> {provider.price}</p>
                <details><summary>Evidence, scope and what to ask</summary><div className={styles.profileDetail}>
                  <p><strong>Published evidence:</strong> {provider.evidence}</p><p><strong>Ask before hiring:</strong> {provider.question}</p><p><strong>Scope to confirm:</strong> {provider.scope}</p>
                  <ul className={styles.sourceLinks}>{provider.sources.map(source => <li key={source.url}><a href={source.url}>{source.label} <span aria-hidden="true">↗</span></a></li>)}</ul>
                </div></details>
                {provider.disclosure && <p className={styles.relationship}><strong>Connection disclosed:</strong> {provider.disclosure}</p>}
                {provider.owned && <><Link className={styles.primary} href="/ai-visibility/" data-cta-location="aeo_agencies_guide" data-cta-offer="ai_visibility_audit">See my AI visibility audit</Link><p className={styles.small}>£1,500 fixed fee. Review the scope and enquire about your market before booking.</p></>}
              </div>
            </article>)}</div>
          </section>
          <section id="evidence" className={styles.section} aria-labelledby="evidence-title">
            <p className={styles.eyebrow}>Know what the result actually measures</p>
            <h2 id="evidence-title">A mention, a citation and a customer are different results</h2>
            <dl className={aeo.evidence}>
              <div><dt>Brand mention</dt><dd>The answer names your business. It may have no link, and the surrounding information can still be wrong. Record the context.</dd></div>
              <div><dt>Linked citation</dt><dd>The answer links to a source. Record whether that source is your website or a third-party page about you. A link does not establish a visit.</dd></div>
              <div><dt>Referral visit</dt><dd>Analytics records a visit from an identifiable assistant source. Some journeys lose attribution, and referral visits do not count every AI appearance.</dd></div>
              <div><dt>Qualified enquiry or sale</dt><dd>A relevant visitor takes a business action. Connect the enquiry or transaction to your attribution evidence and record any uncertainty.</dd></div>
            </dl>
            <div className={aeo.example}><p><strong>Illustrative measurement example, not campaign results:</strong> ten prompts tested three times produce 30 observed answers. Twelve brand mentions give a 40% mention rate in that sample. Six answers linking to your site give a 20% linked-citation rate.</p><p>Neither percentage is market-wide share of voice or proof of revenue. <a href="#aeo-measurement">Agree the measurement method before work starts.</a></p></div>
          </section>
          <div className={styles.article}>{children}</div>
          <SeoProposalScorecard criteria={aeoProposalCriteria} pageUrl="https://sunnypatel.co.uk/blog/best-aeo-agencies/" title="How do your AEO proposals compare?" downloadTitle="AEO PROPOSAL COMPARISON" downloadFilename="aeo-proposal-comparison.txt" />
          <section id="faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title"><h2 id="faq-title">Common questions about AEO agencies</h2>{faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
          <div className={styles.finish}><p>Give each shortlisted provider the same market, prompt examples and objectives.</p><a href="/downloads/aeo-provider-brief.txt" download>Download the AEO provider brief (.txt)</a><span>No email address required.</span></div>
        </div>
      </div>
    </main><Footer />
  </div>;
}
