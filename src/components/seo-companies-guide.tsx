import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { seoCompanies, seoCompaniesReviewed } from "@/data/seo-companies";
import { SeoCompanyFinder, SeoProposalScorecard } from "./seo-companies-tools";
import styles from "./seo-companies-guide.module.css";

const navigation = [
  ["compare", "Compare providers"], ["profiles", "Read the profiles"], ["sunny-patel", "My consultancy"],
  ["agency-or-consultant", "Agency or consultant?"], ["seo-cost", "Budget and costs"],
  ["check-the-evidence", "Check the evidence"], ["first-90-days", "The first 90 days"],
  ["ai-search", "Assess AI SEO"], ["before-you-sign", "Before you sign"],
  ["methodology", "Research and disclosure"], ["proposal-scorecard", "Score your proposals"], ["faq", "Common questions"],
];

export function SeoCompaniesGuide({ title, image, faqs, children }: {
  title: string; image: string;
  faqs: readonly { question: string; answer: string }[];
  children: ReactNode;
}) {
  return (
    <div className={styles.guide}>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <header className={styles.hero}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog/">Blog</Link><span>/</span><span aria-current="page">UK SEO companies</span></nav>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>2026 buyer&apos;s guide</p>
              <h1>{title}</h1>
              <p className={styles.dek}>Choose the right SEO partner for the work you actually need.</p>
              <p>For ecommerce, start with NOVOS or Distinctly. For complex technical work, compare SALT.agency and Screaming Frog. For integrated marketing, consider Aira or Impression.</p>
              <div className={styles.actions}><a className={styles.primary} href="#compare">Find your shortlist <span aria-hidden="true">↓</span></a><a className={styles.textLink} href="/downloads/seo-provider-brief.txt" download>Download the briefing template</a></div>
            </div>
            <figure className={styles.heroFigure}>
              <Image src={image} width={1600} height={900} sizes="(max-width: 800px) 100vw, 480px" alt="Agency proposal shortlist with a blue magnifying glass and a paper map of Britain and Ireland." priority />
              <figcaption>Match the evidence, scope and delivery team to your business.</figcaption>
            </figure>
          </div>
          <div className={styles.byline}>
            <Link href="/author/sunny-patel/">By Sunny Patel, SEO consultant</Link>
            <span>Published <time dateTime="2026-02-05">5 February 2026</time></span>
            <span>Content and sources updated <time dateTime={seoCompaniesReviewed}>12 September 2026</time></span>
          </div>
          <p className={styles.disclosure}><strong>How to use this guide:</strong> compare 15 external providers, then read <a href="#sunny-patel">my own consultancy separately</a>. This is an editorial shortlist, not a tested ranking. I sell SEO services and disclose relevant connections. <a href="#methodology">Read the research method.</a></p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.contents}>
            <nav aria-label="On this page"><p>On this page</p><ol>{navigation.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav>
          </aside>
          <div className={styles.body}>
            <section id="compare" className={styles.section} aria-labelledby="compare-title">
              <p className={styles.eyebrow}>Start with your business need</p>
              <h2 id="compare-title">UK SEO companies at a glance</h2>
              <p>Use the filter to narrow the conversation. These fit assessments come from each provider&apos;s public services and work. The list is alphabetical; appearing first doesn&apos;t mean being best.</p>
              <SeoCompanyFinder companies={seoCompanies} />
              <p className={styles.small}>Fees and availability: request a current written quote. No like-for-like quotes have been obtained for this comparison. <a href="#seo-cost">See how to compare the full cost.</a></p>
            </section>

            <section id="profiles" className={styles.section} aria-labelledby="profiles-title">
              <p className={styles.eyebrow}>Look beyond the pitch</p>
              <h2 id="profiles-title">The shortlist: strengths and questions to ask</h2>
              <p>Each profile links to the provider&apos;s own evidence. Public case studies are self-reported, not independently audited results. The question in each profile helps you test suitability for your business.</p>
              <div className={styles.profiles}>
                {seoCompanies.map((company) => <article key={company.id} id={company.id} className={styles.profile}>
                  <div><h3>{company.name}</h3><p className={styles.fit}>{company.fit}</p><p className={styles.checked}>Sources checked<br /><time dateTime={company.checked}>12 September 2026</time></p></div>
                  <div>
                    <p>{company.summary}</p>
                    <details><summary>Evidence, scope and what to ask</summary>
                      <div className={styles.profileDetail}>
                        <p><strong>Published evidence:</strong> {company.evidence}</p>
                        <p><strong>Ask before hiring:</strong> {company.question}</p>
                        <p><strong>Scope to confirm:</strong> {company.scope}</p>
                        <ul className={styles.sourceLinks}>{company.sources.map((source) => <li key={source.url}><a href={source.url}>{source.label} <span aria-hidden="true">↗</span></a></li>)}</ul>
                      </div>
                    </details>
                    {company.disclosure && <p className={styles.relationship}><strong>Connection disclosed:</strong> {company.disclosure}</p>}
                  </div>
                </article>)}
              </div>
            </section>

            <section id="sunny-patel" className={`${styles.section} ${styles.owned}`} aria-labelledby="own-title">
              <p className={styles.eyebrow}>The author&apos;s own consultancy</p>
              <h2 id="own-title">Prefer to work directly with me?</h2>
              <p>I&apos;m Sunny Patel, an independent SEO consultant based in Reading. I work on technical SEO, content strategy and AI-search visibility. This is my business, so it sits outside the external provider comparison.</p>
              <p><strong>Consider me if:</strong> you want a named consultant involved in the strategy and practical work. Confirm my capacity and the implementation scope against your needs, especially if you need a large production team.</p>
              <p>Start with my <Link href="/portfolio/">published case studies</Link> and <Link href="/ai-visibility-results/">AI-referral evidence and limitations</Link>. Ask me the same questions you would ask anyone above.</p>
              <p className={styles.mention}>Also featured in Tom Riley&apos;s UK <a href="https://tom-riley.co.uk/best-geo-consultants-uk-2026/">GEO consultant guide</a> and <a href="https://tom-riley.co.uk/best-ai-seo-consultants-uk-2026/">AI SEO consultant guide</a>. These are practitioner roundups, not independent audits of my results.</p>
              <Link className={styles.primary} href="/contact/" data-cta-location="seo_companies_guide" data-cta-offer="free_20_minute_seo_diagnosis">Discuss your SEO brief</Link>
              <p className={styles.small}>Free 20-minute diagnosis. Send your website and the main problem through the enquiry form.</p>
            </section>

            <div className={styles.article}>{children}</div>
            <SeoProposalScorecard />

            <section id="faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
              <h2 id="faq-title">Common questions about UK SEO companies</h2>
              {faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
            </section>
            <div className={styles.finish}><p>Ready to request proposals? Give each provider the same starting point.</p><a href="/downloads/seo-provider-brief.txt" download>Download the SEO provider brief (.txt)</a><span>No email address required.</span></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
