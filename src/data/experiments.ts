export type ExperimentStatus = "running" | "concluded" | "inconclusive" | "failed";

export type RegistrationLabel =
  | "exploratory (logged after the fact)"
  | "registered before the result";

export interface ExperimentUpdate {
  /** ISO date. */
  date: string;
  note: string;
}

export interface ExperimentResult {
  metric: string;
  baseline: string;
  after: string;
  n: string;
  verdict: string;
}

export interface Experiment {
  id: string;
  title: string;
  /** Sector only, unless the site is sunnypatel.co.uk or already named in a public blog post (currently chargefinder.uk and catchment.school). */
  site: string;
  label: RegistrationLabel;
  status: ExperimentStatus;
  hypothesis: string;
  change: string;
  /** ISO date the change went live. */
  changeDate: string;
  baseline?: string;
  comparison: string;
  metric: string;
  window: string;
  /** ISO date of the next planned readback. Running entries only. */
  readbackDate?: string;
  outcome: string;
  note?: string;
  evidence?: { label: string; href: string };
  /** Dated log. The first line is the registration line. */
  updates: { date: string; note: string }[];
  /** Fixed results block. Added only when a readback is done. */
  result?: { metric: string; baseline: string; after: string; n: string; verdict: string };
}

export const STATUS_LABELS: Record<ExperimentStatus, string> = {
  running: "Running",
  concluded: "Concluded",
  inconclusive: "Inconclusive",
  failed: "Failed",
};

export const STATUS_ORDER: ExperimentStatus[] = ["running", "concluded", "inconclusive", "failed"];

const AFTER_THE_FACT: ExperimentUpdate[] = [
  { date: "2026-11-02", note: "Logged in this register after the fact. No readback is pending." },
];

export const EXPERIMENTS: Experiment[] = [
  {
    id: "EXP-001",
    title: "Bulk title rewrite on three sites",
    site: "Three of my own sites. Two were large programmatic sites of about 144,000 and 776 pages.",
    label: "exploratory (logged after the fact)",
    status: "failed",
    hypothesis:
      "I wanted a click-through lift from new titles and meta descriptions. I did not write a hypothesis down before the change.",
    change:
      "Title and meta description templates were rewritten on all three sites within about six minutes.",
    changeDate: "2026-04-10",
    comparison: "None. No control pages.",
    metric: "Search Console average position.",
    window: "The days after the change.",
    outcome:
      "Positions I had logged in the 7 to 60 range moved to 50 to 80 or worse on all three sites. A Google core update was running at the time. I cannot separate the title change from the update. I now cap bulk rewrites at 20 pages per site per session. These figures come from my notes. I have not re-checked them in Search Console.",
    updates: AFTER_THE_FACT,
  },
  {
    id: "EXP-002",
    title: "Query-matched titles on four pages",
    site: "sunnypatel.co.uk",
    label: "exploratory (logged after the fact)",
    status: "inconclusive",
    hypothesis:
      "A title that matches the real top queries of a page lifts its click-through rate.",
    change:
      "New titles and meta descriptions on four pages. The local agencies guide got affordability wording. The GEO agencies guide got AEO wording. The UK companies guide got a freshness signal. The technical audit page got word order matched to its top query. I retitled the UK companies guide again on 6 October.",
    changeDate: "2026-09-20",
    comparison: "The same pages before and after. No control.",
    metric: "Clicks and click-through rate per page in Search Console.",
    window: "Planned for 4 to 18 October 2026, which is 14 to 28 days after the change.",
    outcome:
      "I did not record a readback for the planned window. A later check compared two other windows: 2 to 29 September and 30 September to 27 October. GEO guide clicks fell from 7 to 3 between them. Whole-site clicks fell from 106 to 77. The first window contains the change date. This test cannot show whether the new titles helped or hurt. All figures are Search Console Web search for the whole domain, worldwide.",
    evidence: { label: "The GEO agencies guide", href: "/blog/top-geo-agencies/" },
    updates: AFTER_THE_FACT,
  },
  {
    id: "EXP-003",
    title: "Direct-answer passage rewrites",
    site: "sunnypatel.co.uk",
    label: "exploratory (logged after the fact)",
    status: "inconclusive",
    hypothesis:
      "Opening key passages with a direct answer makes pages easier for AI assistants to cite. Fixing weak proof claims should help in the same way.",
    change:
      "Reviewed edits to ten pages, 35 site files in all. Examples: a plainer homepage introduction, a disclosed comparison method on the GEO guide, and new sections on the prompts tool that say which template to choose.",
    changeDate: "2026-10-02",
    baseline:
      "Two matched windows of 27 days: 3 to 29 September against 7 August to 2 September. The source applies no country filter, so I treat these figures as worldwide.",
    comparison:
      "Matched windows before the change. No control pages. No window after the change was analysed.",
    metric:
      "GA4 sessions from AI assistants, Google AI impressions and Bing AI citations.",
    window: "Before the change only.",
    outcome:
      "All three measures were higher in the later window. Sessions were 41 against 28. Impressions were 4,428 against 3,308. Citations were 2,732 against 2,273. That rise came before the edits, so the edits cannot explain it. I have no post-change comparison and other site changes overlapped. No uplift is established.",
    updates: AFTER_THE_FACT,
  },
  {
    id: "EXP-004",
    title: "AEO buying-fit pilot",
    site: "sunnypatel.co.uk",
    label: "exploratory (logged after the fact)",
    status: "running",
    hypothesis:
      "I expect the practice to fit consultant and audit requests better in AI answers. I expect clearer independent delivery, prices, ownership and supported evidence to coincide with that better fit. Removing unsupported proof and absolute claims should also cut wrong descriptions of the business.",
    change:
      "Nine files across three pages, shared service data and public text summaries. Scope, fees and owners made explicit. Unverified proof cards, testimonials and citation deadlines removed. Claims about crawler access and schema corrected.",
    changeDate: "2026-10-03",
    baseline:
      "47 sessions from eight AI assistant sources, 27 of them engaged, from 5 September to 2 October 2026.",
    comparison:
      "The same pages before and after, plus six fixed buyer prompts. Two prompts are held out until day 28. No control. The package changed together, so no single edit can take the credit.",
    metric:
      "GA4 sessions from the eight AI sources, and captured answers to the six prompts.",
    window: "Reviews at day 7, 14 and 28. Completed-window analytics at day 32.",
    readbackDate: "2026-11-04",
    outcome:
      "No result yet. My first capture of ChatGPT answers stalled, so I have no baseline answers. A missing capture is not a zero. The protocol allows a descriptive comparison only.",
    note: "The frozen protocol file did not match its recorded hash. I kept the original and logged an erratum (v1.3). I do not claim verified pre-registration, so this entry is exploratory.",
    updates: [
      {
        date: "2026-11-02",
        note: "Logged in this register as exploratory. The protocol erratum says not to claim verified pre-registration.",
      },
    ],
  },
  {
    id: "EXP-005",
    title: "Specific redirects for old recipe URLs",
    site: "shecookssheeats.co.uk",
    label: "registered before the result",
    status: "running",
    hypothesis:
      "Sending old URLs to their matching pages, instead of a generic hub, recovers search clicks.",
    change:
      "A redirect map in the edge function. 90 of the top 150 URLs that went to a hub now go to a matching page, which covers 3,827 peak clicks. Nine redirects that led to a 404 were fixed and seven entries repointed. All 79 distinct targets returned 200 before the merge. It went live on 24 October 2026.",
    changeDate: "2026-10-24",
    baseline:
      "932 URLs from the peak window, worth 12,458 clicks or 83% of peak clicks, redirected to a generic hub.",
    comparison: "The same site before and after. No control.",
    metric: "Search Console clicks per day for the whole site.",
    window:
      "45 days, to 8 December 2026. My threshold: more than 15 clicks a day by then, or I stop work on the site.",
    readbackDate: "2026-12-08",
    outcome:
      "No result yet. A traffic fall in November 2025 came before the migration. I do not claim redirects will recover it.",
    updates: [{ date: "2026-10-24", note: "Registered with the change, before any result. Merged and live the same day." }],
  },
  {
    id: "EXP-006",
    title: "Berkshire hub de-target",
    site: "sunnypatel.co.uk",
    label: "registered before the result",
    status: "running",
    hypothesis:
      "Taking town names out of the Berkshire hub lets each town page own its own queries.",
    change:
      "Town lists removed from the hub description, subtitle and intro. Town links point to the owning page. A compact enquiry form added to four town pages. Hub title and H1 unchanged.",
    changeDate: "2026-10-26",
    baseline:
      "4 to 24 October, non-branded. Each figure is a share of impressions. Bracknell (530 impressions): town page 42%, hub 40%. Wokingham (335): town page 41%, hub 58%. Maidenhead (178): town page 52%, hub 46%. All these groups together earned 1 click.",
    comparison:
      "The same query groups before and after. No control. The merge of a small Reading local-SEO site on 27 October overlaps this window.",
    metric:
      "Share of impressions and average position per page for each town group. Submissions of the new town-page forms in GA4.",
    window: "9 to 23 November 2026, which is 14 to 28 days after release.",
    readbackDate: "2026-11-09",
    outcome:
      "No result yet. I count it a success if the town pages hold the majority share of impressions and their positions improve.",
    evidence: { label: "The Berkshire hub", href: "/services/seo-berkshire/" },
    updates: [{ date: "2026-10-26", note: "Registered with the change, before any result." }],
  },
  {
    id: "EXP-007",
    title: "Price-led title on one network page",
    site: "chargefinder.uk, a UK electric vehicle charging price site",
    label: "registered before the result",
    status: "running",
    hypothesis:
      "A title that leads with price lifts click-through rate on price queries.",
    change: "A new title on one operator page.",
    changeDate: "2026-10-26",
    baseline: "342 impressions at average position 5.09 and 0 clicks.",
    comparison:
      "Two operator pages with unchanged titles act as controls. They are not matched on traffic, so this is a rough comparison.",
    metric: "Query-level click-through rate, changed page against controls.",
    window: "A 14-day lag, then a readback around 16 November 2026.",
    readbackDate: "2026-11-16",
    outcome: "No result yet.",
    updates: [{ date: "2026-10-26", note: "Registered with the change, before any result." }],
  },
  {
    id: "EXP-008",
    title: "301 merge of a small Reading site",
    site: "A small Reading local-SEO site, merged into sunnypatel.co.uk",
    label: "registered before the result",
    status: "running",
    hypothesis:
      "Redirecting the old site into matching sunnypatel.co.uk pages costs no Reading visibility. I expect a small gain at most.",
    change:
      "Every checked old URL (22 in all) now returns one 301 to a live sunnypatel.co.uk page. No content moved. A change of address was started in Search Console.",
    changeDate: "2026-10-27",
    baseline:
      "The old site had 6 clicks in 90 days at average positions of 40 to 69.",
    comparison:
      "The same Reading queries before and after. No control. The hub change of 26 October overlaps, and the old areas page now redirects to the Berkshire hub.",
    metric:
      "Impressions, clicks and position for Reading queries on sunnypatel.co.uk.",
    window: "9 to 23 November 2026.",
    readbackDate: "2026-11-09",
    outcome:
      "No result yet. I expect cleanup, not a ranking change. The overlap means a movement cannot be pinned on the merge.",
    evidence: { label: "The Reading page", href: "/services/seo-consultant-reading/" },
    updates: [{ date: "2026-10-27", note: "Registered with the change, before any result." }],
  },
  {
    id: "EXP-009",
    title: "Evidence repair on a provider guide and a schema fix",
    site: "sunnypatel.co.uk",
    label: "registered before the result",
    status: "running",
    hypothesis:
      "Direct case-study links, split source and update dates, and a description that no longer over-promises keep the guide's UK exposure from sliding. The schema fix is a correctness repair, so I only track its position.",
    change:
      "Guide description cut back, byline dates split into sources checked and content updated, and 13 provider profiles linked to a case study on the provider's own site. The schema generator now emits a rating only when both value and count are present. Title, H1 and URL unchanged.",
    changeDate: "2026-10-30",
    baseline:
      "Guide: 80 impressions and 32 visible queries in the week of 21 to 27 October. Schema generator, UK desktop: position 12.6 for schema markup generator and 12.5 for schema generator.",
    comparison:
      "The same pages before and after. UK and worldwide data are kept apart. No control, and the guide was already losing exposure before the change.",
    metric: "UK impressions and visible query count for the guide. UK desktop position for the two schema queries.",
    window: "13 to 27 November 2026, after recrawl.",
    readbackDate: "2026-11-13",
    outcome: "No result yet. I do not claim this change caused the earlier decline.",
    evidence: { label: "The UK companies guide", href: "/blog/best-seo-companies-uk/" },
    updates: [{ date: "2026-10-30", note: "Registered with the change, before any result." }],
  },
  {
    id: "EXP-010",
    title: "Audit page retitle and niche service page offers",
    site: "sunnypatel.co.uk",
    label: "registered before the result",
    status: "running",
    hypothesis:
      "A clear price in the title and a first-screen offer on each niche service page lift visibility and enquiries for audit and niche queries.",
    change:
      "An old audit URL now 301s to the technical audit page, which has a new title with the fixed fee. Six niche service pages got first-screen offers, verified migration proof and buyer FAQs. Unsupported claims were removed.",
    changeDate: "2026-10-31",
    baseline:
      "The query technical seo audit service had 1,954 impressions at position 26.0 from August to October 2026. The page was already slipping before this change.",
    comparison:
      "The same pages before and after. No control. Counts are small, so I will report raw numbers.",
    metric:
      "Impressions and position for technical seo audit service and seo audit consultant. AI-assistant landings on the six niche pages. Enquiries in my ledger.",
    window: "14 to 28 November 2026.",
    readbackDate: "2026-11-14",
    outcome: "No result yet.",
    evidence: { label: "The technical SEO audit page", href: "/services/technical-seo-audit/" },
    updates: [{ date: "2026-10-31", note: "Registered with the change, before any result." }],
  },
  {
    id: "EXP-011",
    title: "Honest titles and DfE figures on 20 school pages",
    site: "catchment.school, a UK school admissions data site",
    label: "registered before the result",
    status: "running",
    hypothesis:
      "An honest title that says admissions should lift click-through and engagement. The school's own DfE first-preference and offer figures under the H1 should add to that. I expect no Bing loss.",
    change:
      "Title, meta description and a figures block rewritten on 20 school pages from each school's own DfE row. All other school pages keep their titles. The same release added a Googlebot-only noindex to independent school pages, which are in neither group.",
    changeDate: "2026-11-01",
    baseline:
      "A 28-day Search Console and Bing pull for all 40 URLs, due 3 November 2026. The release went live on 1 November. The pull itself is taken on 3 November, after release, and covers the 28 days before it.",
    comparison:
      "20 matched control pages on the same phase, matched on offers and share offered. The 21 best Bing pages are in neither group. I compare the change in each group, not the raw levels.",
    metric:
      "Bing clicks and click-through rate per URL. Google impressions and position. Groups with under about 30 clicks show raw counts and no percentages.",
    window:
      "Day 14 (15 November) and day 28 (29 November). I roll back early if cohort Bing clicks fall more than 30% against control at day 14 with at least 30 baseline clicks.",
    readbackDate: "2026-11-15",
    outcome: "No result yet.",
    updates: [{ date: "2026-11-01", note: "Registered with the release, before any result." }],
  },
];

/** Latest update date across all entries, falling back to the change date. */
export const EXPERIMENTS_LAST_UPDATED = EXPERIMENTS.reduce((latest, e) => {
  const dates = [e.changeDate, ...e.updates.map((u) => u.date)];
  for (const d of dates) if (d > latest) latest = d;
  return latest;
}, "0000-00-00");

export function statusCounts(): Record<ExperimentStatus, number> {
  const counts: Record<ExperimentStatus, number> = {
    running: 0,
    concluded: 0,
    inconclusive: 0,
    failed: 0,
  };
  for (const e of EXPERIMENTS) counts[e.status] += 1;
  return counts;
}
