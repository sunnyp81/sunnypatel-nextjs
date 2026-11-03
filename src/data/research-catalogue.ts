// Source of truth for /research/ (studies) and /research/data/ (catalogue).
// Every figure here is copied from the study page or its findings file. Do not add numbers that are not on the study page.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const SITE_URL = "https://sunnypatel.co.uk";
export const RESEARCH_LAST_CHECKED = "2026-11-02";
export const LICENCE_NAME = "CC BY 4.0";
export const LICENCE_URL = "https://creativecommons.org/licenses/by/4.0/";
export const MIT_URL = "https://opensource.org/license/mit";
export const OGL_NAME = "Open Government Licence v3.0";
export const OGL_URL = "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/";

/** SHA-256 of a file in public/, computed at build time so it cannot go stale. */
export function fileSha256(href: string) {
  return createHash("sha256").update(readFileSync(join(process.cwd(), "public", href))).digest("hex");
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ */
/* Studies (hub)                                                       */
/* ------------------------------------------------------------------ */

export type StudyDownload = { label: string; href: string };

export type Study = {
  id: string;
  title: string;
  href: string;
  date: string;
  updated?: string;
  dateNote?: string;
  sample: string;
  window: string;
  figure: { value: string; label: string };
  downloads?: StudyDownload[];
  status?: "recurring" | "withdrawn";
  note?: string;
};

export const STUDIES: Study[] = [
  {
    id: "update-tracker",
    title: "How my sites changed after each Google update",
    href: "/blog/google-update-portfolio-impact/#update-tracker",
    date: "2026-09-18",
    updated: "2026-11-02",
    status: "recurring",
    sample: "100 owned Search Console properties. Between 9 and 66 are eligible per update. Rows with fewer than 30 sites show counts only.",
    window: "Every confirmed core and spam update from June 2025 to September 2026. Each compares 14 days before with 14 days that start 7 days after the rollout ends.",
    figure: {
      value: "35 of 57",
      label: "eligible sites rose by 20% or more after the September 2026 spam update",
    },
    downloads: [
      { label: "Tracker CSV", href: "/downloads/live/google-update-tracker-latest.csv" },
      { label: "Tracker JSON", href: "/downloads/live/google-update-tracker-latest.json" },
    ],
    note: "I add a row about four weeks after Google marks an update complete. The same page holds a 21-site table of four unexplained drops between 20 June and 15 September 2026.",
  },
  {
    id: "query-length",
    title: "Search query length on 97 small sites",
    href: "/blog/search-query-length-study/",
    date: "2026-11-02",
    sample: "97 of 100 owned sites returned query rows. 223,218 query rows in total.",
    window: "30 October 2025 to 29 October 2026",
    figure: {
      value: "69.8%",
      label: "of clicks from visible queries came from queries of 4 words or more",
    },
  },
  {
    id: "small-site-benchmarks",
    title: "Small-site SEO benchmarks",
    href: "/blog/small-site-seo-benchmarks/",
    date: "2026-11-01",
    sample: "100 owned sites with Search Console data. Site medians use the 84 sites with 10 or more pages with impressions.",
    window: "30 October 2025 to 29 October 2026",
    figure: {
      value: "87.9%",
      label: "median share of pages with impressions that got zero clicks in 12 months",
    },
  },
  {
    id: "ai-referral",
    title: "AI referral traffic study",
    href: "/blog/ai-referral-traffic-study/",
    date: "2026-09-25",
    updated: "2026-10-02",
    dateNote: "Edition 2. Edition 1 came out on 2 August 2026.",
    sample: "108 owned GA4 properties. 104 recorded sessions in the window.",
    window: "24 June to 21 September 2026",
    figure: {
      value: "1.84%",
      label: "of sessions came from five AI assistants (6,165 of 334,744)",
    },
    downloads: [
      { label: "Live tracker CSV", href: "/downloads/live/ai-referrals-latest.csv" },
      { label: "Edition 2 CSV", href: "/downloads/ai-referral-traffic-study-2026-09-21-v2.csv" },
      { label: "Edition 2 JSON", href: "/downloads/ai-referral-traffic-study-2026-09-21-v2.json" },
      { label: "Edition 1 CSV", href: "/downloads/ai-referral-traffic-study-2026-08-26-v1.csv" },
      { label: "Verification script", href: "/downloads/verify-ai-referral-study-v2.py" },
    ],
  },
  {
    id: "ai-overviews",
    title: "UK AI Overviews by industry",
    href: "/blog/uk-ai-overviews-by-industry/",
    date: "2026-09-25",
    sample: "A locked panel of 399 UK queries across 10 sectors. 393 returned usable data.",
    window: "One snapshot, 25 September 2026",
    figure: {
      value: "47.8%",
      label: "of usable queries showed a Google AI Overview (188 of 393)",
    },
    downloads: [
      { label: "CSV", href: "/downloads/uk-ai-overviews-by-industry-2026.csv" },
      { label: "JSON", href: "/downloads/uk-ai-overviews-by-industry-2026.json" },
    ],
  },
  {
    id: "link-building",
    title: "Link building statistics: which pages earn links",
    href: "/blog/link-building-statistics/",
    date: "2026-09-24",
    sample: "Every page with a referring domain on sunnypatel.co.uk. A frozen panel of 28 owned sites for the anchor review.",
    window: "Snapshot on 24 September 2026. The anchor review covers the 12 months to that date.",
    figure: {
      value: "31",
      label: "unique referring domains held by 5 stats and data pages, against 24 across 21 other pages",
    },
    downloads: [
      { label: "CSV", href: "/downloads/link-building-statistics-2026.csv" },
      { label: "JSON", href: "/downloads/link-building-statistics-2026.json" },
    ],
  },
  {
    id: "multimodal",
    title: "Search Console multimodal filter: the first data",
    href: "/blog/search-console-multimodal-filter/",
    date: "2026-09-27",
    updated: "2026-10-02",
    sample: "46 accessible properties: 37 owned and 9 client. Client sites are anonymised and none is named.",
    window: "Launch-week check. The client comparison uses 10 to 25 September 2026.",
    figure: {
      value: "28 of 37",
      label: "owned properties had zero multimodal impressions",
    },
  },
  {
    id: "ai-search-traffic",
    title: "How much traffic comes from AI search: 20 sites",
    href: "/blog/ai-search-traffic-portfolio-data/",
    date: "2026-09-18",
    updated: "2026-10-10",
    sample: "20 owned GA4 sites out of around 115 properties, the figure the study page gives. Not a random sample.",
    window: "21 June to 18 September 2026",
    figure: {
      value: "2.1%",
      label: "of sessions came from AI assistants (3.4% without one site with anomalous traffic)",
    },
    note: "The AI referral traffic study above uses a larger frame and a fixed matching rule.",
  },
  {
    id: "seo-fees",
    title: "SEO consultant fees in the UK",
    href: "/blog/how-much-does-an-seo-consultant-charge-uk/",
    date: "2026-03-12",
    updated: "2026-09-25",
    sample: "75 UK providers that publish their own price, from 150 UK provider sites screened.",
    window: "24 to 25 September 2026",
    figure: {
      value: "£497 a month",
      label: "median entry-level retainer across 61 providers",
    },
    downloads: [
      { label: "CSV", href: "/downloads/uk-seo-pricing-2026.csv" },
      { label: "JSON", href: "/downloads/uk-seo-pricing-2026.json" },
    ],
  },
  {
    id: "vercel-cloudflare",
    title: "Vercel against Cloudflare Workers: a speed test",
    href: "/blog/vercel-vs-cloudflare-workers/",
    date: "2026-09-28",
    sample: "One site on two hosts. Five Lighthouse runs per host, device and page, and 30 timed requests per host and path.",
    window: "28 September 2026",
    figure: {
      value: "83 and 81",
      label: "mobile Lighthouse medians for Vercel and Workers on the homepage, with applied throttling",
    },
  },
  {
    id: "managing-44",
    title: "Managing 44 websites: what the Search Console data shows",
    href: "/blog/managing-44-websites-seo-data/",
    date: "2026-04-06",
    updated: "2026-09-18",
    sample: "44 owned sites audited. The traffic update covers about 100 properties.",
    window: "28-day Search Console pulls. The page dates each one.",
    figure: {
      value: "31 of 44",
      label: "audited sites had index bloat",
    },
  },
  {
    id: "ctr",
    title: "Google CTR by position",
    href: "/blog/google-ctr-study/#correction",
    date: "2026-07-10",
    updated: "2026-09-25",
    status: "withdrawn",
    sample: "53 Search Console properties in a convenience portfolio.",
    window: "9 April to 7 July 2026",
    figure: {
      value: "Withdrawn",
      label: "the portfolio CTR figures were withdrawn on 25 September 2026 and should not be cited",
    },
    downloads: [
      { label: "CSV (withdrawn)", href: "/downloads/google-ctr-study-2026-07.csv" },
      { label: "JSON (withdrawn)", href: "/downloads/google-ctr-study-2026-07.json" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Data catalogue                                                      */
/* ------------------------------------------------------------------ */

export type CatalogueFile = { name: string; href: string; format: string; mime: string };

export type CatalogueEntry = {
  id: string;
  group: "own" | "compiled" | "embedded" | "templates";
  title: string;
  studyHref?: string;
  studyTitle?: string;
  date?: string;
  files: CatalogueFile[];
  contains: string;
  window: string;
  temporalCoverage?: string;
  sample: string;
  exclusions: string;
  anonymisation: string;
  siteNames: string;
  verification: string;
  licence: string;
  licenceUrl?: string;
  extraLicence?: { name: string; url: string };
  version?: string;
  uk?: boolean;
  basedOn?: string[];
  doi: "pending";
  status?: "withdrawn";
  schema: boolean;
};

const csv = (name: string): CatalogueFile => ({ name, href: `/downloads/${name}`, format: "CSV", mime: "text/csv" });
const json = (name: string): CatalogueFile => ({ name, href: `/downloads/${name}`, format: "JSON", mime: "application/json" });

const BY = `${LICENCE_NAME}. Use it, share it and adapt it with credit.`;
const BY_COMPILED = `${LICENCE_NAME} for my selection and wording. Each figure belongs to the source named on its row.`;

export const CATALOGUE: CatalogueEntry[] = [
  {
    id: "ai-referral-live",
    group: "own",
    title: "Live AI referral tracker",
    studyHref: "/blog/ai-referral-traffic-study/#live-tracker",
    studyTitle: "AI referral traffic study",
    date: "2026-11-03",
    files: [csv("live/ai-referrals-latest.csv"), json("live/ai-referrals-latest.json")],
    contains:
      "One row per finished week: total sessions, sessions matching AI referral source list version 1.0, the AI share and sessions per assistant. Each refresh also writes a dated CSV snapshot of the series, named with the week's end date.",
    window: "From 29 June 2026, refreshed weekly, in each property's own GA4 time zone",
    sample: "The 108 owned GA4 properties from edition 2, frozen on 24 September 2026.",
    exclusions: "Client sites and properties with unconfirmed ownership. Sites added after the freeze.",
    anonymisation: "Portfolio totals, plus one sensitivity figure with the largest property removed. No per-site rows and no site names.",
    siteNames: "None.",
    verification:
      "The refresh stops without publishing if under 90% of properties respond, if a published week moves by more than 25%, or if a window has no AI sessions.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "experiment-register",
    group: "own",
    title: "SEO experiment register",
    studyHref: "/research/experiments/",
    studyTitle: "SEO experiment register",
    date: "2026-11-02",
    files: [],
    contains: "Status, change date, readback date, metric, window, comparison and outcome for each dated test. The CSV is at /research/experiments.csv and the page links to it.",
    window: "From the earliest logged test. Updated at each readback.",
    sample: "Tests on my own sites only.",
    exclusions: "Client sites.",
    anonymisation: "Sector labels, unless a site is already named in a public post.",
    siteNames: "Only sites already named in my public posts.",
    verification: "The CSV is generated from the same record as the page. The page shows some fields the CSV leaves out.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "ai-referral-edition-2",
    group: "own",
    title: "AI referral traffic, edition 2",
    studyHref: "/blog/ai-referral-traffic-study/",
    studyTitle: "AI referral traffic study",
    date: "2026-09-25",
    files: [
      csv("ai-referral-traffic-study-2026-09-21-v2.csv"),
      json("ai-referral-traffic-study-2026-09-21-v2.json"),
    ],
    contains:
      "One row per GA4 property: sector, anonymous site number, total sessions, organic sessions, sessions from ChatGPT, Copilot, Perplexity, Claude and Gemini, AI total and AI share. The JSON adds sector splits, panel totals and the sensitivity check.",
    window: "24 June to 21 September 2026, in each property's own GA4 time zone",
    temporalCoverage: "2026-06-24/2026-09-21",
    sample: "108 owned GA4 properties. 104 recorded sessions and form the analysis panel.",
    exclusions:
      "Client sites, 2 accounts I do not publish from, and 7 further properties removed in a 25 September ownership review (2 clients, 5 with ownership I could not confirm), chosen on ownership and not on their numbers. One duplicate property. Four properties with zero sessions stay in the file but not in the shares.",
    anonymisation: "Sector label and an anonymous site number such as S001. No site names.",
    siteNames: "None found.",
    verification:
      "One script applied the matching rule to one stored raw pull per property. A second, public Python script recomputes the headline table from the JSON offline and prints the file's SHA-256 hash.",
    licence: BY,
    version: "2",
    doi: "pending",
    schema: true,
  },
  {
    id: "ai-referral-edition-1",
    group: "own",
    title: "AI referral traffic, edition 1",
    studyHref: "/blog/ai-referral-traffic-study/",
    studyTitle: "AI referral traffic study",
    date: "2026-08-02",
    files: [csv("ai-referral-traffic-study-2026-08-26-v1.csv")],
    contains: "AI sessions by sector for 12 sites: total AI sessions and sessions from ChatGPT, Copilot, Perplexity, Claude and Gemini.",
    window: "28 May to 26 August 2026 (91 days)",
    temporalCoverage: "2026-05-28/2026-08-26",
    sample: "12 sites I already knew received the most AI traffic. This is a hand-picked panel and not a sample of the portfolio.",
    exclusions: "Every site outside the 12. No denominators are in this file, which is why edition 2 exists.",
    anonymisation: "Sector label only. No site names.",
    siteNames: "None found.",
    verification:
      "No script. Re-pulling the original window later gave 4,745 AI-matched sessions across the 12 properties, against 4,717 published. The mapping from old labels to current properties carries some uncertainty.",
    licence: BY,
    version: "1",
    doi: "pending",
    schema: true,
  },
  {
    id: "uk-ai-overviews",
    group: "own",
    title: "UK AI Overviews by industry",
    studyHref: "/blog/uk-ai-overviews-by-industry/",
    studyTitle: "UK AI Overviews by industry",
    date: "2026-09-25",
    files: [
      csv("uk-ai-overviews-by-industry-2026.csv"),
      json("uk-ai-overviews-by-industry-2026.json"),
    ],
    contains:
      "Per sector: panel size, usable queries, queries with an AI Overview, presence rate, citation counts by source type and the largest share supplied by one seed topic. The JSON adds overall totals, citation categories, the most-cited domains and seed concentration.",
    window: "One extraction on 25 September 2026",
    temporalCoverage: "2026-09-25",
    sample: "A locked panel of 399 UK queries across 10 sectors, built from 5 seed topics per sector. 393 returned usable data. A fixed random seed drew a 100-query citation sample, 10 per sector.",
    exclusions:
      "6 queries with an empty feature result, treated as missing. 17 redirect-labelled citation rows, left out of resolved totals. Google Shopping rows. Queries under 100 UK searches a month.",
    anonymisation: "The queries are not personal data. The JSON names the public websites that AI Overviews cited.",
    siteNames: "The JSON names third-party sites that AI Overviews cited, such as gov.uk. None of them is one of my sites.",
    verification:
      "The panel and the random seed were fixed before any data was pulled. I did not write a second script for this study.",
    licence: BY,
    uk: true,
    doi: "pending",
    schema: true,
  },
  {
    id: "uk-seo-pricing",
    group: "own",
    title: "UK SEO consultant fees",
    studyHref: "/blog/how-much-does-an-seo-consultant-charge-uk/",
    studyTitle: "SEO consultant fees in the UK",
    date: "2026-09-25",
    files: [csv("uk-seo-pricing-2026.csv"), json("uk-seo-pricing-2026.json")],
    contains:
      "Aggregate prices by bucket: number of providers, median, quartiles, minimum and maximum for monthly retainers, audits, local SEO and link building, nationally and by region group. The JSON also lists the raw low and high price points.",
    window: "24 to 25 September 2026",
    temporalCoverage: "2026-09-24/2026-09-25",
    sample: "75 UK providers that publish their own price, from 150 UK provider sites screened. 72 are agencies and 3 are freelancers.",
    exclusions:
      "12 non-UK domains, 17 pages that returned an access error, 75 UK sites with no qualifying own price, directories and roundups. My own pricing page is not in the panel. A bucket needs 8 providers before it gets a median.",
    anonymisation: "Aggregates and price points only. Provider names and URLs are not published.",
    siteNames: "None found.",
    verification:
      "The inclusion rules and the 8-provider minimum were set before the figures were calculated. The fetch ledger and compute script are kept on file. I did not write a second script for this study.",
    licence: BY,
    uk: true,
    doi: "pending",
    schema: true,
  },
  {
    id: "link-building",
    group: "own",
    title: "Link building statistics: referring domains by page type",
    studyHref: "/blog/link-building-statistics/",
    studyTitle: "Link building statistics",
    date: "2026-09-24",
    files: [
      csv("link-building-statistics-2026.csv"),
      json("link-building-statistics-2026.json"),
    ],
    contains: "16 statistics, each with its value, scope, wording, period, sample, source, caveat and a link to the section of the study it comes from.",
    window: "Snapshot on 24 September 2026",
    temporalCoverage: "2026-09-24",
    sample: "Every page with a referring domain on sunnypatel.co.uk, pulled from Ahrefs. The 28-site panel is in the study but not in this file.",
    exclusions: "Pages with no referring domain. The homepage is outside the page-type comparison. Ahrefs does not crawl the whole web, so unseen links are missing.",
    anonymisation: "The file describes this site only. No other site is named.",
    siteNames: "sunnypatel.co.uk, which is this site.",
    verification:
      "I compared two Ahrefs pull methods. One call for all pages returned fewer domains than per-page calls, so I used the per-page calls. I did not write a second script for this study.",
    licence: BY,
    version: "2026-09-24",
    doi: "pending",
    schema: true,
  },
  {
    id: "google-ctr-2026-07",
    group: "own",
    title: "Google CTR by position, July 2026 collection (withdrawn)",
    studyHref: "/blog/google-ctr-study/#correction",
    studyTitle: "Google CTR by position",
    date: "2026-07-10",
    status: "withdrawn",
    files: [csv("google-ctr-study-2026-07.csv"), json("google-ctr-study-2026-07.json")],
    contains: "CTR, clicks, impressions and query-row counts by position bucket, with the collection rules and limits repeated on every row.",
    window: "9 April to 7 July 2026",
    temporalCoverage: "2026-04-09/2026-07-07",
    sample: "53 qualifying Search Console properties in a convenience portfolio. 2,615 query rows.",
    exclusions: "Queries under 50 impressions. Only the top 5,000 rows per property, ordered by clicks. There was no country filter and no brand exclusion.",
    anonymisation: "Bucket totals only. No per-property rows and no site names.",
    siteNames: "None found.",
    verification:
      "Withdrawn on 25 September 2026. The position-one bucket held 5 query rows. A re-extraction with a UK filter and brand exclusion also failed to support a benchmark. The file stays online for the audit trail. Do not cite it as a benchmark.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "seo-statistics-uk",
    group: "compiled",
    title: "UK SEO statistics 2026",
    studyHref: "/blog/seo-statistics-uk/",
    studyTitle: "UK SEO statistics 2026",
    date: "2026-10-23",
    files: [csv("seo-statistics-uk-2026.csv"), json("seo-statistics-uk-2026.json")],
    contains: "18 sourced statistics: value, statement, period, source date, sample, source, source link and caveat. The JSON adds the zero-click chart data.",
    window: "Source dates run from 22 July 2025 to 23 October 2026. Every row was re-checked on 23 October 2026.",
    temporalCoverage: "2025-07-22/2026-10-23",
    sample: "Figures published by other organisations, such as the ONS and SparkToro. The sample behind each figure is stated on its row.",
    exclusions: "Any figure I could not trace to a source I opened.",
    anonymisation: "Not applicable. The rows are published statistics, with no site or client data.",
    siteNames: "None of my sites. The rows link to the publishers.",
    verification: "Each row was re-checked against its source on the date in the checked column.",
    licence: BY_COMPILED,
    version: "2026-10-23",
    uk: true,
    basedOn: [
      "https://assets.publishing.service.gov.uk/media/68e8b2eb187483de54d76711/Appendix_B_-_market_outcomes.pdf",
      "https://gs.statcounter.com/search-engine-market-share/all/united-kingdom",
      "https://sparktoro.com/blog/zero-click-searches-highest-in-the-uk-lowest-in-germany-and-france-has-the-most-efficient-searchers/",
      "https://www.brightlocal.com/research/consumer-search-behavior-decisions/",
      "https://www.iabuk.com/news-article/digital-adspend-2025-uks-digital-ad-market-reaches-ps405bn",
      "https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/media-literacy-research/adults/adults-media-use-and-attitudes-2026/adults-media-use-and-attitudes-2026-report.pdf",
      "https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/bulletins/ukbusinessactivitysizeandlocation/2026",
      "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/",
    ],
    doi: "pending",
    schema: true,
  },
  {
    id: "uk-marketing-salaries",
    group: "compiled",
    title: "UK marketing salaries 2026",
    studyHref: "/blog/uk-marketing-salary-statistics/",
    studyTitle: "UK marketing salary statistics",
    date: "2026-10-23",
    files: [csv("uk-marketing-salaries-2026.csv"), json("uk-marketing-salaries-2026.json")],
    contains: "ONS median and mean annual gross pay for marketing occupations, with year-on-year change and the ONS quality key. National and regional tables.",
    window: "ONS ASHE 2026 provisional, pay period that included 22 April 2026. The regional table is ASHE 2025 provisional.",
    temporalCoverage: "2025/2026",
    sample: "Full-time employees, from the ONS Annual Survey of Hours and Earnings. The sample belongs to the ONS.",
    exclusions: "Part-time employees. Northern Ireland in the regional table, which the ONS table does not cover.",
    anonymisation: "Not applicable. The file holds ONS aggregates.",
    siteNames: "None.",
    verification: "Checked against the ONS tables on 23 October 2026. The 2026 estimates are provisional.",
    licence: `${BY_COMPILED} The ONS figures are published under the ${OGL_NAME}.`,
    version: "2026-10-23",
    uk: true,
    extraLicence: { name: OGL_NAME, url: OGL_URL },
    basedOn: ["https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2026"],
    doi: "pending",
    schema: true,
  },
  {
    id: "embedded-update-tracker",
    group: "own",
    title: "Google update tracker table",
    studyHref: "/blog/google-update-portfolio-impact/#update-tracker",
    studyTitle: "How my sites changed after each Google update",
    date: "2026-11-02",
    files: [csv("live/google-update-tracker-latest.csv"), json("live/google-update-tracker-latest.json")],
    contains: "For each confirmed core and spam update: eligible sites, the number up or down by 20% and 50%, the median change and the pooled change.",
    window: "June 2025 to October 2026",
    sample: "100 owned Search Console properties. Eligible sites per update run from 0 to 66.",
    exclusions:
      "Sites without data before the before window, or with under 100 impressions in it. Client sites. Median and pooled change are hidden when fewer than 30 sites are eligible.",
    anonymisation: "Counts and percentages only. No site names.",
    siteNames: "None in the table.",
    verification: "A second script, written separately, recomputes every row. All nine rows match on n, counts, median, pooled change and both sums.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "embedded-query-length",
    group: "embedded",
    title: "Query length tables",
    studyHref: "/blog/search-query-length-study/",
    studyTitle: "Search query length on 97 small sites",
    date: "2026-11-02",
    files: [],
    contains: "Share of impressions, clicks and query rows by word count, CTR by word count, top-3 zero-click share and question-query share.",
    window: "30 October 2025 to 29 October 2026",
    sample: "97 of 100 owned sites. 223,218 query rows, 2,717,358 impressions and 12,551 clicks.",
    exclusions: "Queries Google withholds, which are rare and skew long. 3 sites returned no query rows. Client sites.",
    anonymisation: "Pooled counts and shares. No queries and no site names are published.",
    siteNames: "None in the tables.",
    verification: "A second script, written independently, matched every headline number exactly.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "embedded-small-site-benchmarks",
    group: "embedded",
    title: "Small-site benchmark tables",
    studyHref: "/blog/small-site-seo-benchmarks/",
    studyTitle: "Small-site SEO benchmarks",
    date: "2026-11-01",
    files: [],
    contains: "Pages with impressions per site, zero-click page share, click concentration, new-page timings to first click and size-band medians.",
    window: "30 October 2025 to 29 October 2026",
    sample: "100 owned sites out of 183 property rows. Site medians use 84 sites.",
    exclusions:
      "Client, lead and family sites, properties with unclear ownership, duplicate properties and sunnypatel.co.uk, whose migration distorts the new-page measure.",
    anonymisation: "Medians, quartiles and pooled counts. No site names.",
    siteNames: "None in the tables.",
    verification: "A second script, using separate pulls, matched all 5 headline numbers exactly. That checks the arithmetic and not Google's own sampling.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "embedded-ai-search-traffic",
    group: "embedded",
    title: "AI traffic across 20 sites",
    studyHref: "/blog/ai-search-traffic-portfolio-data/",
    studyTitle: "How much traffic comes from AI search: 20 sites",
    date: "2026-09-18",
    files: [],
    contains: "AI-referral sessions and share of sessions for a sample of owned sites, by assistant.",
    window: "21 June to 18 September 2026",
    sample: "20 owned GA4 sites out of around 115 properties, the figure the study page gives.",
    exclusions: "The other properties. One site is shown with and without its anomalous Direct traffic.",
    anonymisation: "The study table names owned sites. It holds no client data.",
    siteNames: "Yes. The study table names my own sites.",
    verification: "I did not recompute this table independently. The AI referral traffic study supersedes it for portfolio-wide shares.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "embedded-multimodal",
    group: "embedded",
    title: "Multimodal filter table",
    studyHref: "/blog/search-console-multimodal-filter/",
    studyTitle: "Search Console multimodal filter",
    date: "2026-09-27",
    files: [],
    contains: "Multimodal impressions, share of web impressions and CTR for three anonymised retailers.",
    window: "10 to 25 September 2026",
    sample: "Three client properties with meaningful volume, out of 46 accessible properties.",
    exclusions: "Properties with no multimodal impressions are counted in the text, not the table.",
    anonymisation: "Retailers are described by type. No names.",
    siteNames: "None in the table.",
    verification: "For one retailer, the interface view and the API returned the same Web rows, which confirms the API's Web figures exclude multimodal.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "ref-ai-referral-sources",
    group: "templates",
    title: "AI referral sources for GA4 (reference list, version 1.0)",
    studyHref: "/blog/ai-referral-sources-ga4/",
    studyTitle: "AI referral sources in GA4",
    date: "2026-11-02",
    files: [json("ai-referral-sources-v1.json")],
    contains: "The 15 referrer sources I count as AI assistant traffic in GA4, the sources I watch without counting, and the date each was added. It is a reference list, not a study.",
    window: "Not applicable. Version 1.0, 2 November 2026.",
    sample: "Not applicable",
    exclusions: "None",
    anonymisation: "No data.",
    siteNames: "None found.",
    verification: "Not applicable. The study page compares the list's total with GA4's AI Assistant channel.",
    version: "1.0",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "tpl-seo-workbook",
    group: "templates",
    title: "DIY SEO workbook",
    studyHref: "/blog/diy-seo-workbook/",
    studyTitle: "DIY SEO workbook",
        files: [{ name: "diy-seo-workbook.xlsx", href: "/downloads/diy-seo-workbook.xlsx", format: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }],
    contains: "A nine-tab spreadsheet for owners who run SEO themselves. It is a template, not research data.",
    window: "Not applicable",
    sample: "Not applicable",
    exclusions: "None",
    anonymisation: "Placeholder domains only.",
    siteNames: "Placeholders such as example.com and my own site.",
    verification: "Not applicable. It is a blank template.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "tpl-migration-kit",
    group: "templates",
    title: "Migration kit",
    studyHref: "/blog/website-redesign-seo-checklist/",
    studyTitle: "Website redesign SEO checklist",
        files: [{ name: "migration-kit.xlsx", href: "/downloads/migration-kit.xlsx", format: "XLSX", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }],
    contains: "A seven-tab spreadsheet: URL map, practice sheet, answer key, baseline, launch-day checks and a 30-60-90 day watch. It is a template, not research data.",
    window: "Not applicable",
    sample: "Not applicable",
    exclusions: "None",
    anonymisation: "Placeholder domains only.",
    siteNames: "Placeholders such as example-shop.co.uk.",
    verification: "Not applicable. It is a template with a worked example.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "tpl-progress-tracker",
    group: "templates",
    title: "SEO progress tracker",
    studyHref: "/blog/how-long-does-seo-take/",
    studyTitle: "How long does SEO take",
        files: [csv("seo-progress-tracker.csv")],
    contains: "A blank review schedule: baseline, first check, early signal check, with columns for impressions, clicks, enquiries, the change made and the next review date.",
    window: "Not applicable",
    sample: "Not applicable",
    exclusions: "None",
    anonymisation: "No data.",
    siteNames: "None.",
    verification: "Not applicable. It is a blank template.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "tpl-audit-checklist",
    group: "templates",
    title: "SEO audit checklist",
        files: [{ name: "seo-audit-checklist.pdf", href: "/downloads/seo-audit-checklist.pdf", format: "PDF", mime: "application/pdf" }],
    contains: "A PDF checklist for an SEO audit. It is a document, not research data.",
    window: "Not applicable",
    sample: "Not applicable",
    exclusions: "None",
    anonymisation: "No data.",
    siteNames: "sunnypatel.co.uk, which is this site, and example domains.",
    verification: "Not applicable.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "tpl-provider-briefs",
    group: "templates",
    title: "Provider brief templates",
    studyHref: "/blog/best-seo-companies-uk/",
    studyTitle: "Best SEO companies in the UK",
    files: [
      { name: "seo-provider-brief.txt", href: "/downloads/seo-provider-brief.txt", format: "TXT", mime: "text/plain" },
      { name: "local-seo-provider-brief.txt", href: "/downloads/local-seo-provider-brief.txt", format: "TXT", mime: "text/plain" },
      { name: "aeo-provider-brief.txt", href: "/downloads/aeo-provider-brief.txt", format: "TXT", mime: "text/plain" },
    ],
    contains: "Three fill-in briefs to send to every shortlisted provider. They are templates, not research data.",
    window: "Not applicable",
    sample: "Not applicable",
    exclusions: "None",
    anonymisation: "No data.",
    siteNames: "None found.",
    verification: "Not applicable.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "tpl-worked-examples",
    group: "templates",
    title: "Worked examples (fictional)",
    files: [
      { name: "content-brief-demonstration.txt", href: "/downloads/content-brief-demonstration.txt", format: "TXT", mime: "text/plain" },
      { name: "technical-seo-audit-finding-demonstration.txt", href: "/downloads/technical-seo-audit-finding-demonstration.txt", format: "TXT", mime: "text/plain" },
    ],
    contains: "A content brief extract and a technical audit finding. Both say at the top that they are fictional worked examples.",
    window: "Not applicable",
    sample: "Not applicable",
    exclusions: "None",
    anonymisation: "They use a fictional business, and not a real client.",
    siteNames: "Only the fictional business named in the example.",
    verification: "Not applicable. They are not real results.",
    licence: BY,
    doi: "pending",
    schema: false,
  },
  {
    id: "tpl-verify-script",
    group: "templates",
    title: "AI referral study verification script",
    studyHref: "/blog/ai-referral-traffic-study/",
    studyTitle: "AI referral traffic study",
        files: [{ name: "verify-ai-referral-study-v2.py", href: "/downloads/verify-ai-referral-study-v2.py", format: "Python", mime: "text/x-python" }],
    contains: "A Python script with no network calls and no extra packages. It recomputes the study's headline table from the public JSON.",
    window: "Runs on the edition 2 window, 24 June to 21 September 2026",
    sample: "The 108-property frame in the JSON",
    exclusions: "It does not pull fresh GA4 data, rerun source classification or verify the original extraction.",
    anonymisation: "It reads only the anonymised JSON.",
    siteNames: "None found.",
    verification: "It checks arithmetic only. Run it as: python verify-ai-referral-study-v2.py ai-referral-traffic-study-2026-09-21-v2.json",
    licence: "MIT. Use it, share it and adapt it, and keep the licence name with it.",
    licenceUrl: MIT_URL,
    doi: "pending",
    schema: false,
  },
];

export const CATALOGUE_GROUPS: { id: CatalogueEntry["group"]; title: string; blurb: string }[] = [
  {
    id: "own",
    title: "Data I collected",
    blurb: "Files from my own pulls, with a download for each.",
  },
  {
    id: "compiled",
    title: "Data I compiled from other sources",
    blurb: "Published statistics I checked and put in one file. The figures belong to their sources.",
  },
  {
    id: "embedded",
    title: "Tables inside studies, with no file yet",
    blurb: "These tables live on the study page. Cite the page until a file exists.",
  },
  {
    id: "templates",
    title: "Templates, briefs, scripts and reference lists",
    blurb: "Everything else in the downloads folder. None of it is research data.",
  },
];

export function citationFor(e: CatalogueEntry) {
  const kind = e.group === "templates" ? "Resource" : "Data set";
  const year = e.date ? ` (${e.date.slice(0, 4)})` : "";
  const where = e.studyHref ? `${SITE_URL}${e.studyHref}` : `${SITE_URL}/research/data/`;
  return `Sunny Patel${year}. ${e.title} [${kind}]. sunnypatel.co.uk. ${where} Licence ${e.licenceUrl === MIT_URL ? "MIT" : LICENCE_NAME}.`;
}

export const DATASET_ENTRIES = CATALOGUE.filter((e) => e.schema && e.files.length > 0);
export const FILE_COUNT = CATALOGUE.reduce((n, e) => n + e.files.length, 0);
