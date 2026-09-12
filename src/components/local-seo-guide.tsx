import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { localSeoProviders, localSeoNeeds, localSeoReviewed, localProposalCriteria } from "@/data/local-seo-providers";
import { SeoCompanyFinder, SeoProposalScorecard } from "./seo-companies-tools";
import styles from "./seo-companies-guide.module.css";
import local from "./local-seo-guide.module.css";

const navigation = [
  ["compare", "Compare local providers"], ["profiles", "Read the profiles"], ["sunny-patel", "My local SEO service"],
  ["local-seo-scope", "What should be included?"], ["business-model", "Match your business model"],
  ["local-seo-cost", "Prices and scope"], ["measure-results", "Measure enquiries"], ["first-90-days", "The first 90 days"],
  ["profile-rules", "Profile rules and ownership"], ["agency-or-consultant", "Agency, consultant or DIY?"],
  ["methodology", "Research and disclosure"], ["proposal-scorecard", "Score your proposals"], ["faq", "Common questions"],
];

export function LocalSeoGuide({ title, image, faqs, children }: {
  title: string; image: string; faqs: readonly { question: string; answer: string }[]; children: ReactNode;
}) {
  return <div className={styles.guide}>
    <Navbar />
    <main id="main-content" tabIndex={-1}>
      <header className={styles.hero}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog/">Blog</Link><span>/</span><span aria-current="page">Local SEO agencies</span></nav>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>2026 local search buyer&apos;s guide</p>
            <h1>{title}</h1>
            <p className={styles.dek}>Choose local SEO support that fits your business.</p>
            <p>For direct local SEO support, consider <a href="#sunny-patel">Sunny Patel (my consultancy)</a>. For several locations, consider Hallam or Impression. For a wider marketing programme, look at LOCALiQ.</p>
            <div className={styles.actions}><a className={styles.primary} href="#compare">Find your local SEO shortlist <span aria-hidden="true">↓</span></a><a className={styles.textLink} href="/downloads/local-seo-provider-brief.txt" download>Download the local SEO brief</a></div>
          </div>
          <figure className={styles.heroFigure}>
            <Image src={image} width={1600} height={900} sizes="(max-width: 800px) 100vw, 480px" alt="Three miniature high-street shops on a folded street map, with a blue location pin above the central shop." priority />
            <figcaption>Choose around your real premises, service area and customer journey.</figcaption>
          </figure>
        </div>
        <div className={styles.byline}><Link href="/author/sunny-patel/">By Sunny Patel, SEO consultant</Link><span>Published <time dateTime="2026-06-14">14 June 2026</time></span><span>Content and sources updated <time dateTime={localSeoReviewed}>12 September 2026</time></span></div>
        <p className={styles.disclosure}><strong>How to use this guide:</strong> compare {localSeoProviders.length} providers, including my clearly labelled consultancy and {localSeoProviders.length - 1} external options. The list is alphabetical. Fit assessments are editorial judgements, not tested rankings. <a href="#methodology">Read the research method and disclosures.</a></p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.contents}><nav aria-label="On this page"><p>On this page</p><ol>{navigation.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav></aside>
        <div className={styles.body}>
          <section id="compare" className={styles.section} aria-labelledby="compare-title">
            <p className={styles.eyebrow}>Start with your business model</p>
            <h2 id="compare-title">Which local SEO providers should you compare?</h2>
            <p>Filter by the support you need. These suggested fits come from each provider&apos;s published local services. Ask each shortlisted business to confirm the scope for your premises or service area.</p>
            <SeoCompanyFinder companies={localSeoProviders} needs={localSeoNeeds} caption="UK local SEO providers: business fit and quote checkpoints" />
            <p className={styles.small}>Published starting prices and quote conditions appear in the profiles below. They cover different scopes. <a href="#local-seo-cost">Compare the full cost before deciding.</a></p>
          </section>

          <section id="profiles" className={styles.section} aria-labelledby="profiles-title">
            <p className={styles.eyebrow}>Inspect the actual local offer</p>
            <h2 id="profiles-title">What does each provider offer?</h2>
            <p>Each profile links to current service information and relevant public work. Case studies are provider-reported. A published result is a starting point for questions, rather than an independent audit.</p>
            <div className={styles.profiles}>
              {localSeoProviders.map(provider => <article id={provider.id} key={provider.id} className={`${styles.profile}${provider.owned ? ` ${styles.owned}` : ""}`}>
                <div>{provider.owned && <p className={styles.eyebrow}>The author&apos;s own consultancy</p>}<h3>{provider.name}</h3><p className={styles.fit}>{provider.fit}</p><p className={styles.checked}>Sources checked<br /><time dateTime={provider.checked}>12 September 2026</time></p></div>
                <div>
                  <p>{provider.summary}</p>
                  <p className={local.price}><strong>Pricing:</strong> {provider.price}</p>
                  <details><summary>Evidence, scope and what to ask</summary><div className={styles.profileDetail}>
                    <p><strong>Published evidence:</strong> {provider.evidence}</p><p><strong>Ask before hiring:</strong> {provider.question}</p><p><strong>Scope to confirm:</strong> {provider.scope}</p>
                    <ul className={styles.sourceLinks}>{provider.sources.map(source => <li key={source.url}><a href={source.url}>{source.label} <span aria-hidden="true">↗</span></a></li>)}</ul>
                  </div></details>
                  {provider.disclosure && <p className={styles.relationship}><strong>Connection disclosed:</strong> {provider.disclosure}</p>}
                  {provider.owned && <>
                    <p className={styles.mention}>Also included in Tom Riley&apos;s <a href="https://tom-riley.co.uk/best-geo-consultants-uk-2026/">GEO</a> and <a href="https://tom-riley.co.uk/best-ai-seo-consultants-uk-2026/">AI SEO consultant guides</a>. These are practitioner mentions, not independent audits of local SEO results.</p>
                    <Link className={styles.primary} href="/contact/" data-cta-location="local_seo_agencies_guide" data-cta-offer="free_20_minute_seo_diagnosis">Discuss your local SEO brief</Link>
                    <p className={styles.small}>Free 20-minute diagnosis. Send your website, business location and main local-search problem through the enquiry form.</p>
                  </>}
                </div>
              </article>)}
            </div>
          </section>

          <aside className={local.pathway} aria-label="Local SEO measurement stages">
            <p className={styles.eyebrow}>Follow the enquiry from search to sale</p>
            <ol>
              <li><strong>Search visibility</strong><span>Where and for which service were you found?</span></li>
              <li><strong>Profile or website action</strong><span>Did someone click, call or start a booking?</span></li>
              <li><strong>Qualified enquiry</strong><span>Was the job genuine, relevant and in your area?</span></li>
              <li><strong>Won work</strong><span>Did the enquiry become an appointment or sale?</span></li>
            </ol>
            <p className={styles.small}>Agree how the stages connect. A click on a call button does not prove a completed call. <a href="#measure-results">Check the reporting definitions.</a></p>
          </aside>
          <div className={styles.article}>{children}</div>
          <SeoProposalScorecard criteria={localProposalCriteria} pageUrl="https://sunnypatel.co.uk/blog/best-local-seo-agencies/" title="How do your local SEO proposals compare?" downloadTitle="LOCAL SEO PROPOSAL COMPARISON" downloadFilename="local-seo-proposal-comparison.txt" />
          <section id="faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title"><h2 id="faq-title">Common questions about local SEO agencies</h2>{faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
          <div className={styles.finish}><p>Give each shortlisted provider the same business details and objectives.</p><a href="/downloads/local-seo-provider-brief.txt" download>Download the local SEO provider brief (.txt)</a><span>No email address required.</span></div>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
