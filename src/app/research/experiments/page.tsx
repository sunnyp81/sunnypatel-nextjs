import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { GradientButton } from "@/components/ui/gradient-button";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { CiteBlock } from "@/components/live/live-stats";
import { NEW_RULES, PREREG_TEXT } from "@/data/experiment-method";
import { BUILD_DATE, StatusChips } from "@/components/research/experiment-bits";
import {
  CUT_TESTS,
  EXPERIMENTS,
  EXPERIMENTS_LAST_UPDATED,
  STATUS_LABELS,
  STATUS_ORDER,
  statusCounts,
  type Experiment,
} from "@/data/experiments";

const SITE_URL = "https://sunnypatel.co.uk";
const PAGE_URL = `${SITE_URL}/research/experiments/`;

export function generateMetadata() {
  return buildMetadata({
    title: "SEO Experiment Register: Dated Tests on My Own Sites",
    description:
      "A dated register of SEO experiments on my own sites. Each entry shows the hypothesis, the change, the comparison, the metric, the window and the outcome. Failures and inconclusive tests are included.",
    path: "/research/experiments",
  });
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const counts = statusCounts();
const CSV_URL = "/research/experiments.csv";
const total = EXPERIMENTS.length;

const PAGE_SCHEMA = schemaGraph(
  {
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "SEO experiment register",
    description:
      "A dated register of SEO experiments on Sunny Patel's own sites, with hypothesis, change, comparison, metric, window, outcome and status.",
    inLanguage: "en-GB",
    dateModified: EXPERIMENTS_LAST_UPDATED,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    mainEntity: { "@id": `${PAGE_URL}#entries` },
  },
  {
    "@type": "Dataset",
    "@id": `${PAGE_URL}#dataset`,
    name: "SEO experiment register",
    description: "Status, dates, metric, window, comparison and outcome for each dated SEO test on Sunny Patel's own sites.",
    url: PAGE_URL,
    creator: { "@id": `${SITE_URL}/#person` },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    dateModified: EXPERIMENTS_LAST_UPDATED,
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE_URL}${CSV_URL}` }],
  },
  {
    "@type": "ItemList",
    "@id": `${PAGE_URL}#entries`,
    name: "SEO experiments on my own sites",
    numberOfItems: total,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: EXPERIMENTS.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${e.id}: ${e.title}`,
      url: `${PAGE_URL}${e.slug}/`,
    })),
  },
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Research", url: `${SITE_URL}/research/` },
    { name: "SEO experiments", url: PAGE_URL },
  ])
);

function startOf(e: Experiment) {
  return e.registeredDate ?? e.changeDate ?? e.updates[0].date;
}

const TIMELINE = EXPERIMENTS.filter((e) => e.readbackDate)
  .map((e) => ({ id: e.id, slug: e.slug, start: startOf(e), date: e.readbackDate as string }))
  .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
const T_START_ISO = TIMELINE.reduce((m, t) => (t.start < m ? t.start : m), TIMELINE[0].start);
const T_END_ISO = TIMELINE.reduce((m, t) => (t.date > m ? t.date : m), TIMELINE[0].date);
const T_START = Date.parse(`${T_START_ISO}T00:00:00Z`);
const T_END = Date.parse(`${T_END_ISO}T00:00:00Z`);
const pctOf = (iso: string) => Math.min(100, Math.max(0, ((Date.parse(`${iso}T00:00:00Z`) - T_START) / (T_END - T_START)) * 100));

function ReadbackTimeline() {
  return (
    <figure className="mt-12">
      <figcaption className="text-lg font-bold text-foreground" style={headingStyle}>
        Registration to readback, {formatDate(T_START_ISO)} to {formatDate(T_END_ISO)}
      </figcaption>
      <ol className="mt-4 space-y-1.5">
        {TIMELINE.map((t) => {
          const left = pctOf(t.start);
          const right = pctOf(t.date);
          const overdue = t.date < BUILD_DATE;
          return (
            <li key={t.id} className="grid grid-cols-[4.5rem_1fr] items-center gap-3 text-sm sm:grid-cols-[4.5rem_1fr_11rem]">
              <Link href={`/research/experiments/${t.slug}/`} className="font-mono text-foreground underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink">
                {t.id}
              </Link>
              <span aria-hidden="true" className="relative block h-4 border-b border-hairline">
                <span className="absolute top-1/2 block border-t-2 border-hairline-strong" style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }} />
                <span
                  className="absolute top-1/2 block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-background"
                  style={{ left: `${left}%` }}
                />
                <span
                  className="absolute top-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-foreground bg-background"
                  style={{ left: `${right}%` }}
                />
              </span>
              <span className="col-span-2 text-muted-foreground sm:col-span-1">
                <time dateTime={t.date}>{formatDate(t.date)}</time>
                {overdue ? " (Readback overdue)" : ""}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">
        Left edge is {formatDate(T_START_ISO)}. Right edge is {formatDate(T_END_ISO)}. The small circle marks the
        registration or change date and the diamond marks the readback. Each ID links to its test page.
      </p>
    </figure>
  );
}

const headingStyle = { fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" } as const;

function firstSentence(text: string) {
  if (text.length <= 130) return text;
  const i = text.indexOf(". ");
  return i > 0 ? text.slice(0, i + 1) : text;
}

function IndexRow({ e }: { e: Experiment }) {
  const anchor = e.id.toLowerCase();
  return (
    <li id={anchor} className="scroll-mt-28">
      <Link
        href={`/research/experiments/${e.slug}/`}
        className="group flex h-full flex-col rounded-md border border-hairline-strong p-5 transition-colors hover:border-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
          <StatusChips e={e} />
        </span>
        <span className="mt-2 text-lg font-bold leading-snug text-foreground" style={headingStyle}>
          {e.title}
        </span>
        <span className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Site: </span>
          {e.site}
        </span>
        <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Primary metric: </span>
          {e.metric}
        </span>
        <span className="mt-2 text-sm leading-relaxed text-foreground">
          {e.readbackDate && (
            <>
              <span className="font-semibold">Next readback: </span>
              <time dateTime={e.readbackDate}>{formatDate(e.readbackDate)}</time>
              {". "}
            </>
          )}
          {firstSentence(e.outcome)}
        </span>
        <span className="mt-4 inline-flex items-center gap-2 pt-1 text-sm font-semibold text-brand-ink">
          Read the test page
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </Link>
    </li>
  );
}

export default function ExperimentsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_SCHEMA }} />

      <main className="relative min-h-screen bg-background">
        <Navbar />
        <div id="main-content" tabIndex={-1} />

        <div className="relative pb-10 pt-32">
          <div className="mx-auto max-w-5xl px-6">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Research", href: "/research/" }, { label: "SEO experiments" }]} />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand-ink">Research</p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              SEO experiment register
            </h1>
            <div className="mt-5 max-w-2xl space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                This register holds {total} dated SEO tests on my own sites. {counts.planned} are planned,{" "}
                {counts.running} are running, {counts.inconclusive} are inconclusive and {counts.failed} failed.
                None has a clean win yet.
              </p>
              <p className="text-base">
                I never log client sites here. Each test has its own page with what I changed, what I compare it
                with and how long I wait. Tests I wrote up after the fact are labelled that way. Tests I set up in
                advance are labelled as registered before the result.
              </p>
              <p className="text-base">
                Register opened 2 November 2026. Last updated {formatDate(EXPERIMENTS_LAST_UPDATED)}.
              </p>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hairline bg-hairline text-sm md:grid-cols-5">
              {STATUS_ORDER.map((s) => (
                <div key={s} className="bg-background p-4 last:col-span-2 md:last:col-span-1">
                  <dt className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</dt>
                  <dd
                    className="mt-1 text-2xl font-bold tabular-nums text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {counts[s]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12">
          <section id="entries" aria-labelledby="entries-title" className="mb-14 scroll-mt-28">
            <h2 id="entries-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
              The tests
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Oldest first. Each card opens the test page. A running test shows its next readback date and no
              outcome until the readback is done.
            </p>
            <ol className="mt-6 grid list-none gap-4 p-0 md:grid-cols-2">
              {EXPERIMENTS.map((e) => (
                <IndexRow key={e.id} e={e} />
              ))}
            </ol>

            <ReadbackTimeline />
          </section>

          <section id="cut" aria-labelledby="cut-title" className="mb-14 scroll-mt-28">
            <h2 id="cut-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
              Considered and not run
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A test I decided against is logged here with the reason, so the register shows what I left out.
            </p>
            <ul className="mt-5 max-w-3xl list-none space-y-4 p-0">
              {CUT_TESTS.map((c) => (
                <li key={c.title} className="rounded-md border border-hairline p-5">
                  <p className="text-base font-bold text-foreground" style={headingStyle}>
                    {c.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cut on <time dateTime={c.cut}>{formatDate(c.cut)}</time>
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-foreground">{c.reason}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="max-w-3xl">
            <section id="method" aria-labelledby="method-title" className="mb-14 scroll-mt-28">
              <h2 id="method-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
                How I run tests
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                I write the test down before the result, wait a fixed window and refuse to read small counts as trends.
              </p>
              <h3 className="mt-6 text-lg font-bold text-foreground" style={headingStyle}>
                Pre-registration
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Before a result exists, I note the hypothesis, the baseline, the metric and the readback date. {PREREG_TEXT} If I write a
                test up later, it carries the exploratory label and I treat it as a lead, not a finding.
              </p>
              <h3 className="mt-6 text-lg font-bold text-foreground" style={headingStyle}>
                Minimum window
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                I record a day-7 check but do not read results from it. Results come from a window of at least 14
                days. My standard window runs 14 to 28 days. I keep UK and worldwide data apart and I use full days
                only.
              </p>
              <h3 className="mt-6 text-lg font-bold text-foreground" style={headingStyle}>
                Small-n rule
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Under about 30 clicks in a group, I publish raw counts and no percentages. A result of not enough data
                is a valid outcome. I do not claim a cause when other changes overlap, and I say so in the entry.
              </p>
              <h3 className="mt-6 text-lg font-bold text-foreground" style={headingStyle}>
                Rules from EXP-012 onwards
              </h3>
              <ul className="mt-2 max-w-2xl list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
                {NEW_RULES.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <h3 className="mt-6 text-lg font-bold text-foreground" style={headingStyle}>
                Statuses
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Planned means the protocol is written and no change has been made yet. Running means the window is
                open. Concluded means the readback is done and the result is clear. Inconclusive means the data cannot
                separate the change from other causes. Failed means the metric went the wrong way, whether or not I can
                isolate the cause.
              </p>
            </section>

            <section id="cite" aria-labelledby="cite-title" className="mb-14 scroll-mt-28">
              <h2 id="cite-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
                How to cite a test
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Cite the test id, the page date and the status you saw. Running tests change when the readback lands.
              </p>
              <CiteBlock
                citation={`Sunny Patel, "SEO experiment register", sunnypatel.co.uk, updated ${formatDate(EXPERIMENTS_LAST_UPDATED)}. ${PAGE_URL}`}
              >
                <a className="inline-flex min-h-11 items-center text-brand-ink underline underline-offset-4" href={CSV_URL} download>
                  Download the register as CSV
                </a>
              </CiteBlock>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-hairline bg-muted/40 p-4 font-mono text-sm leading-relaxed text-foreground">
                {`Patel, S. (2026). SEO experiment register, EXP-005 (status: running). sunnypatel.co.uk. ${PAGE_URL}specific-redirects-old-recipe-urls/. Register version dated ${formatDate(EXPERIMENTS_LAST_UPDATED)}.`}
              </pre>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Every test has its own page, and the old anchors such as #exp-001 still land on this index. Describe an
                exploratory entry as exploratory.
              </p>
            </section>

            <section aria-labelledby="exp-cta" className="mb-8">
              <h2 id="exp-cta" className="text-xl font-bold text-foreground md:text-2xl" style={headingStyle}>
                Want a test like these on your site?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                The free 20-minute diagnosis is the place to start. I look at your site and tell you what is worth
                testing first.
              </p>
              <div className="mt-6">
                <GradientButton asChild>
                  <Link href="/contact/" className="gap-2">
                    Book the free diagnosis
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </GradientButton>
              </div>
            </section>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
