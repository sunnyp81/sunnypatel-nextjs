import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { GradientButton } from "@/components/ui/gradient-button";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import {
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

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const counts = statusCounts();
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
    "@type": "ItemList",
    "@id": `${PAGE_URL}#entries`,
    name: "SEO experiments on my own sites",
    numberOfItems: total,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: EXPERIMENTS.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${e.id}: ${e.title}`,
      url: `${PAGE_URL}#${e.id.toLowerCase()}`,
    })),
  },
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Research", url: `${SITE_URL}/research/` },
    { name: "SEO experiments", url: PAGE_URL },
  ])
);

const TIMELINE = EXPERIMENTS.filter((e) => e.readbackDate)
  .map((e) => ({ id: e.id, date: e.readbackDate as string }))
  .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
const T_START = Date.parse("2026-11-02T00:00:00Z");
const T_END = Date.parse("2026-12-08T00:00:00Z");

function ReadbackTimeline() {
  return (
    <figure className="mt-8">
      <figcaption className="text-sm font-semibold text-foreground">Readback dates, 2 November to 8 December 2026</figcaption>
      <ol className="mt-3 space-y-1.5">
        {TIMELINE.map((t) => {
          const pct = Math.min(100, Math.max(0, ((Date.parse(`${t.date}T00:00:00Z`) - T_START) / (T_END - T_START)) * 100));
          const overdue = t.date < BUILD_DATE;
          return (
            <li key={t.id} className="grid grid-cols-[4.5rem_1fr] items-center gap-3 text-sm sm:grid-cols-[4.5rem_1fr_9rem]">
              <a href={`#${t.id.toLowerCase()}`} className="font-mono text-foreground underline decoration-hairline-strong underline-offset-4">
                {t.id}
              </a>
              <span aria-hidden="true" className="relative block h-4 border-b border-hairline-strong">
                <span
                  className="absolute top-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-foreground bg-background"
                  style={{ left: `${pct}%` }}
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
      <p className="mt-2 text-xs text-muted-foreground">Left edge is 2 November. Right edge is 8 December. Each diamond marks one readback.</p>
    </figure>
  );
}

const headingStyle = { fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-hairline py-3 first:border-t-0 first:pt-0 md:grid-cols-[9rem_1fr] md:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground md:pt-1">{label}</dt>
      <dd className="m-0 text-base leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

function EntryCard({ e }: { e: Experiment }) {
  const anchor = e.id.toLowerCase();
  const overdue = e.status === "running" && !!e.readbackDate && e.readbackDate < BUILD_DATE;
  return (
    <article
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className="scroll-mt-28 rounded-md border border-hairline p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
        <span className="inline-flex items-center rounded-md border border-hairline-strong px-2 py-0.5 text-xs font-semibold text-foreground">
          {STATUS_LABELS[e.status]}
        </span>
        <span className="inline-flex items-center rounded-md border border-dashed border-hairline-strong px-2 py-0.5 text-xs font-semibold text-foreground">
          {e.label}
        </span>
        {overdue && (
          <span className="inline-flex items-center rounded-md border-2 border-foreground px-2 py-0.5 text-xs font-semibold text-foreground">
            Readback overdue
          </span>
        )}
      </div>
      <h3 id={`${anchor}-title`} className="mt-2 text-xl font-bold text-foreground" style={headingStyle}>
        {e.title}
      </h3>
      <dl className="mt-5">
        <Field label="Site">{e.site}</Field>
        <Field label="Hypothesis">{e.hypothesis}</Field>
        <Field label="Change made">
          {e.change}{" "}
          <span className="whitespace-nowrap text-muted-foreground">
            (<time dateTime={e.changeDate}>{formatDate(e.changeDate)}</time>)
          </span>
        </Field>
        {e.baseline && <Field label="Baseline">{e.baseline}</Field>}
        <Field label="Comparison">{e.comparison}</Field>
        <Field label="Metric">{e.metric}</Field>
        <Field label="Window">{e.window}</Field>
        {e.readbackDate && (
          <Field label="Next readback">
            <time dateTime={e.readbackDate}>{formatDate(e.readbackDate)}</time>
          </Field>
        )}
        <Field label="Outcome">{e.outcome}</Field>
        {e.result && (
          <Field label="Result">
            <dl className="grid gap-1 text-sm sm:grid-cols-[7rem_1fr]">
              <dt className="font-semibold">Metric</dt>
              <dd className="m-0">{e.result.metric}</dd>
              <dt className="font-semibold">Baseline</dt>
              <dd className="m-0">{e.result.baseline}</dd>
              <dt className="font-semibold">After</dt>
              <dd className="m-0">{e.result.after}</dd>
              <dt className="font-semibold">Sample</dt>
              <dd className="m-0">{e.result.n}</dd>
              <dt className="font-semibold">Verdict</dt>
              <dd className="m-0">{e.result.verdict}</dd>
            </dl>
          </Field>
        )}
        <Field label="Log">
          <ol className="m-0 list-none space-y-1 p-0 text-sm">
            {e.updates.map((u) => (
              <li key={u.date + u.note}>
                <time dateTime={u.date} className="font-mono text-muted-foreground">{formatDate(u.date)}</time>
                {": "}
                {u.note}
              </li>
            ))}
          </ol>
        </Field>
        {e.note && <Field label="Note">{e.note}</Field>}
        {e.evidence && (
          <Field label="Evidence">
            <Link
              href={e.evidence.href}
              className="underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              {e.evidence.label}
            </Link>
          </Field>
        )}
      </dl>
    </article>
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
          <div className="mx-auto max-w-3xl px-6">
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
                This register holds {total} dated SEO tests on my own sites. {counts.running} are still running,{" "}
                {counts.inconclusive} are inconclusive and {counts.failed} failed. None has a clean win yet.
              </p>
              <p className="text-base">
                I never log client sites here. Each entry states what I changed, what I compared it with and how
                long I waited. Tests I wrote up after the fact are labelled that way. Tests I set up in advance are
                labelled as registered before the result.
              </p>
              <p className="text-base">
                Register opened 2 November 2026. Last updated {formatDate(EXPERIMENTS_LAST_UPDATED)}.
              </p>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hairline bg-hairline text-sm md:grid-cols-4">
              {STATUS_ORDER.map((s) => (
                <div key={s} className="bg-background p-4">
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

            <ReadbackTimeline />

            <nav aria-label="Jump to an entry" className="mt-8">
              <ol className="flex flex-wrap gap-2">
                {EXPERIMENTS.map((e) => (
                  <li key={e.id}>
                    <a
                      href={`#${e.id.toLowerCase()}`}
                      className="inline-flex min-h-11 items-center rounded-md border border-hairline-strong px-3 font-mono text-sm text-foreground transition-colors hover:border-brand-ink hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                      {e.id}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-12">
          <section id="entries" aria-labelledby="entries-title" className="mb-14 scroll-mt-28">
            <h2 id="entries-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
              The entries
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Newest change last. A running entry shows its next readback date and no outcome.
            </p>
            <div className="mt-6 space-y-6">
              {EXPERIMENTS.map((e) => (
                <EntryCard key={e.id} e={e} />
              ))}
            </div>
          </section>

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
              Before a result exists, I note the hypothesis, the baseline, the metric and the readback date. The
              dates on this page come from my own working notes. No outside service timestamps them. If I write a
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
              Statuses
            </h3>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Running means the window is open. Concluded means the readback is done and the result is clear.
              Inconclusive means the data cannot separate the change from other causes. Failed means the metric went the wrong way,
              whether or not I can isolate the cause.
            </p>
          </section>

          <section id="cite" aria-labelledby="cite-title" className="mb-14 scroll-mt-28">
            <h2 id="cite-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
              How to cite an entry
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Cite the entry id, the page date and the status you saw. Running entries change when the readback
              lands.
            </p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-hairline bg-muted/40 p-4 font-mono text-sm leading-relaxed text-foreground">
              {`Patel, S. (2026). SEO experiment register, EXP-005 (status: running). sunnypatel.co.uk. ${PAGE_URL}#exp-005. Register version dated ${formatDate(EXPERIMENTS_LAST_UPDATED)}.`}
            </pre>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every entry has its own anchor, such as #exp-001. Describe an exploratory entry as exploratory.
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

        <Footer />
      </main>
    </>
  );
}
