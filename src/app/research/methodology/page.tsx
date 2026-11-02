import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { ResearchShell, Section, NextStep, linkClass } from "@/components/research/shell";
import { RESEARCH_LAST_CHECKED, SITE_URL, formatDate } from "@/data/research-catalogue";

const PAGE_URL = `${SITE_URL}/research/methodology/`;

export function generateMetadata() {
  return buildMetadata({
    title: "Research Methodology: How I Collect and Check Data | Sunny Patel",
    description:
      "How I pull Search Console and GA4 data, define the sample, recompute every headline number, set small-sample limits and correct mistakes.",
    path: "/research/methodology",
  });
}

const SCHEMA = schemaGraph(
  {
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "Research methodology",
    description:
      "How I collect and check the data behind my studies: Search Console pulls, GA4 referral matching, the sample, independent recomputation, small-sample rules and corrections.",
    inLanguage: "en-GB",
    dateModified: RESEARCH_LAST_CHECKED,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    about: { "@id": `${SITE_URL}/#person` },
  },
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Research", url: `${SITE_URL}/research/` },
    { name: "Methodology", url: PAGE_URL },
  ])
);

const th = "border-b border-hairline-strong px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const td = "border-b border-hairline px-3 py-2 align-top text-sm text-foreground";

const MATCH_RULES = [
  { assistant: "ChatGPT", rule: "chatgpt or openai" },
  { assistant: "Microsoft Copilot", rule: "copilot (the source string in my data is copilot.com)" },
  { assistant: "Perplexity", rule: "perplexity" },
  { assistant: "Claude", rule: "claude" },
  { assistant: "Gemini", rule: "gemini" },
];

const CORRECTIONS = [
  {
    date: "2 November 2026",
    iso: "2026-11-02",
    page: "Google update tracker",
    href: "/blog/google-update-portfolio-impact/#may-core-update",
    change: "I restated the May 2026 core update row after switching from page-level to whole-property impressions.",
  },
  {
    date: "5 October 2026",
    iso: "2026-10-05",
    page: "AI traffic across 20 sites",
    href: "/blog/ai-search-traffic-portfolio-data/",
    change: "I corrected a line that said one site's AI referrals held steady after its Google decline. Later data showed a fall.",
  },
  {
    date: "25 September 2026",
    iso: "2026-09-25",
    page: "Google CTR by position",
    href: "/blog/google-ctr-study/#correction",
    change: "I withdrew the portfolio CTR figures and kept them online, marked, with the reasons.",
  },
];

export default function MethodologyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
      <ResearchShell
        current="/research/methodology/"
        crumbs={[{ label: "Research", href: "/research/" }, { label: "Methodology" }]}
        eyebrow="Research"
        title="How I collect and check my data"
        intro={
          <>
            <p>
              This page describes the practices I used on the studies in the hub. Steps not written here are not part
              of the method.
            </p>
            <p className="text-base">
              Last checked <time dateTime={RESEARCH_LAST_CHECKED}>{formatDate(RESEARCH_LAST_CHECKED)}</time>.
            </p>
          </>
        }
      >
        <Section id="search-console" title="How do I pull Search Console data?">
          <p>
            I pull it through the Search Console API, one property at a time, and I save the raw result before I
            analyse anything.
          </p>
          <p>
            The dimension depends on the question. The query studies use query. The update tracker uses date. The
            benchmarks use page by date. All of it is web search. The API holds about 16 months, caps the rows it returns
            each day and revises recent days. I stop at the last complete day.
          </p>
          <p>
            The{" "}
            <Link href="/blog/small-site-seo-benchmarks/" className={linkClass}>
              benchmarks study
            </Link>{" "}
            lists these limits in full.
          </p>
        </Section>

        <Section id="impressions" title="What is the difference between whole-property and page-level impressions?">
          <p>
            Whole-property impressions count a site once when it appears on a results page. Page-level impressions count
            it once for each page that appears, so the page rows add up to more.
          </p>
          <p>
            This caused a restatement on 2 November 2026. My first cut of the May 2026 core update summed page-level
            impressions. For one large site, the page rows gave 100,189 impressions for 9 to 22 June 2026. Its
            whole-property total was 33,513. That site helped produce a pooled change of +0.3%. On whole-property data
            the pooled change is -18.6%.
          </p>
          <p>
            Two things changed in that restatement. I also moved from 28-day to 14-day windows, and the panel went from
            46 sites to 44. The old 28-day windows on whole-property data, with 47 sites, give a median of +28.1% and a
            pooled change of -15.6%. The update tracker now uses whole-property totals for every row. The full
            before-and-after is under{" "}
            <Link href="/blog/google-update-portfolio-impact/#may-core-update" className={linkClass}>
              May 2026 core update, restated
            </Link>
            .
          </p>
        </Section>

        <Section id="ga4" title="How do I match AI referrals in GA4?">
          <p>
            I match the session source text against five assistant names. One script does it, on one stored raw pull per
            property, and it ignores how GA4 labels the channel.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse">
              <caption className="sr-only">Source text matched for each AI assistant</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>
                    Assistant
                  </th>
                  <th scope="col" className={th}>
                    Source contains, any case
                  </th>
                </tr>
              </thead>
              <tbody>
                {MATCH_RULES.map((r) => (
                  <tr key={r.assistant}>
                    <th scope="row" className={`${td} font-semibold`}>
                      {r.assistant}
                    </th>
                    <td className={td}>{r.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Of 6,165 matched sessions in edition 2, 5,770 already carried GA4&apos;s own AI Assistant label. The other
              395 only matched my rule.
            </li>
            <li>Organic sessions are rows where the default channel group is exactly Organic Search.</li>
            <li>Dates use each property&apos;s own GA4 reporting time zone.</li>
            <li>A plain bing source counts as Bing organic, so a Copilot click that arrives as bing is not visible.</li>
            <li>
              Google AI Overviews and AI Mode cannot be separated from Google organic sessions. That traffic is hidden,
              not zero.
            </li>
            <li>Unclicked citations never reach GA4. The method counts sessions, not citations or people.</li>
          </ul>
          <p>
            A public Python script recomputes the headline table from the anonymised JSON. It is in the{" "}
            <Link href="/research/data/#tpl-verify-script" className={linkClass}>
              data catalogue
            </Link>
            .
          </p>
        </Section>

        <Section id="sample" title="What is the sample?">
          <p>The benchmarks, query length and update tracker studies use sites from one panel of 100 that I own. No client site is in those three.</p>
          <p>I built that sample from 183 Search Console property rows, and I recorded a reason for every row. I excluded:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>client sites, leads and family sites</li>
            <li>properties where I could not confirm ownership</li>
            <li>duplicate properties</li>
            <li>two accounts I do not publish from</li>
            <li>sunnypatel.co.uk, in the new-page timing study, because its migration distorts that measure</li>
          </ul>
          <p>
            The GA4 study uses its own frame. It covers 108 properties in accounts where I am the sole or majority owner.
            Before publication an ownership review removed 7 more properties, 2 clients and 5 I could not confirm. I made
            that cut on ownership only, and not on any property&apos;s numbers. Each study page states its own frame.
          </p>
          <p>
            The sites are mostly UK affiliate and programmatic sites. A few large ones dominate pooled totals, so I show
            site medians next to pooled figures. Dead, deindexed and sold sites are missing, so the sample leans towards
            survivors. It describes my sites and does not describe the web.
          </p>
        </Section>

        <Section id="recomputation" title="How do I check my own numbers?">
          <p>
            I write a second script, separately from the first, and compare every headline number with the first
            script&apos;s output.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>The benchmarks used separate pulls, and all 5 headline numbers matched exactly.</li>
            <li>The query length study used an independent rewrite, and every headline number matched.</li>
            <li>The update tracker uses two scripts. All nine rows match on n, counts, median, pooled change and both sums.</li>
          </ul>
          <p>
            One check caught a rounding error. A pooled zero-click share first read 89.2% and was 89.1% after a
            double-rounding fix (104,089 of 116,760 pages).
          </p>
          <p>
            Both scripts use the same API. The check covers my arithmetic and does not cover Google&apos;s own sampling.
            Some studies have no second script. The data catalogue says which.
          </p>
        </Section>

        <Section id="small-n" title="What counts as too small to report?">
          <p>Each study sets its own floor, and none of them reports a figure that sits below it.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              In the update tracker, a group with fewer than 30 eligible sites gets counts only, with no median and no
              pooled change.
            </li>
            <li>A sector in the AI referral study needs at least 3 active properties. A sector with 2 is left out.</li>
            <li>A fee bucket in the pricing study needs 8 providers before it gets a median.</li>
            <li>Query length medians per site need 100 or more query rows, or 30 or more clicks for click share.</li>
            <li>Spreads are shown as the 25th to 75th percentile, and every figure keeps its denominator.</li>
          </ul>
          <p>
            You can see the tracker rule at work in the{" "}
            <Link href="/blog/google-update-portfolio-impact/#update-tracker" className={linkClass}>
              update tracker
            </Link>
            , where the early rows show counts only.
          </p>
        </Section>

        <Section id="anonymised-queries" title="How do I handle anonymised queries?">
          <p>Google withholds rare and anonymised queries, so my query studies cover visible queries only.</p>
          <p>
            The hidden queries skew long, so every query length figure describes the visible ones. The same gap helped
            end the CTR study. Query-level rows covered a median of about 19% of each property&apos;s clicks, which is too
            little for a defensible curve.
          </p>
          <p>None of my public data files lists search queries. They hold pooled counts and shares.</p>
        </Section>

        <Section id="corrections" title="How do corrections work?">
          <p>I correct the page itself, with a dated note, and I leave the old figure visible next to the new one.</p>
          <p>
            Each correction sits on the page it changes. These
            are the ones so far.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse">
              <caption className="sr-only">Corrections made to research pages</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>
                    Date
                  </th>
                  <th scope="col" className={th}>
                    Page
                  </th>
                  <th scope="col" className={th}>
                    What changed
                  </th>
                </tr>
              </thead>
              <tbody>
                {CORRECTIONS.map((c) => (
                  <tr key={c.iso}>
                    <td className={td}>
                      <time dateTime={c.iso}>{c.date}</time>
                    </td>
                    <td className={td}>
                      <Link href={c.href} className={linkClass}>
                        {c.page}
                      </Link>
                    </td>
                    <td className={td}>{c.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            The wider rules are in the{" "}
            <Link href="/research/editorial-policy/" className={linkClass}>
              editorial policy
            </Link>
            .
          </p>
        </Section>

        <Section id="limits" title="What do these studies not show?">
          <p>They show what happened on my own sites. They do not show why.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Before-and-after windows do not isolate a cause, and I do not remove seasonality.</li>
            <li>Young properties that are still growing can push the up counts higher.</li>
            <li>The convenience sample has survivorship bias and a narrow niche mix.</li>
            <li>No study here is a forecast for another site.</li>
          </ul>
        </Section>

        <NextStep />
      </ResearchShell>
    </>
  );
}
