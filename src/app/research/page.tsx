import Link from "next/link";
import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { ResearchShell, NextStep, headingStyle, linkClass } from "@/components/research/shell";
import {
  CATALOGUE,
  FILE_COUNT,
  RESEARCH_LAST_CHECKED,
  SITE_URL,
  STUDIES,
  formatDate,
  type Study,
} from "@/data/research-catalogue";

const PAGE_URL = `${SITE_URL}/research/`;

export function generateMetadata() {
  return buildMetadata({
    title: "Original SEO Research and Data | Sunny Patel",
    description:
      "Every original study from Sunny Patel with its sample, window, headline figure and download, plus the data catalogue, methodology and editorial policy.",
    path: "/research",
  });
}

const recurring = STUDIES.filter((s) => s.status === "recurring");
const current = STUDIES.filter((s) => !s.status).sort((a, b) => b.date.localeCompare(a.date));
const withdrawn = STUDIES.filter((s) => s.status === "withdrawn");

const SCHEMA = schemaGraph(
  {
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "Original SEO research and data",
    description:
      "Studies built on data I collected myself, each with its sample, window, headline figure and download.",
    inLanguage: "en-GB",
    dateModified: RESEARCH_LAST_CHECKED,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    about: { "@id": `${SITE_URL}/#person` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: STUDIES.length,
      itemListElement: STUDIES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${s.href}`,
        name: s.title,
      })),
    },
  },
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Research", url: PAGE_URL },
  ])
);

function StudyCard({ s }: { s: Study }) {
  const dt = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  return (
    <li id={s.id} className="scroll-mt-28 border-t border-hairline py-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-semibold text-foreground" style={headingStyle}>
          <Link href={s.href} className={linkClass}>
            {s.title}
          </Link>
        </h3>
        {s.status === "withdrawn" && (
          <span className="rounded-sm border border-hairline-strong px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Withdrawn
          </span>
        )}
        {s.status === "recurring" && (
          <span className="rounded-sm border border-brand-ink px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-ink">
            Recurring
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(12rem,15rem)_1fr]">
        <div>
          <p className={dt}>Headline figure</p>
          <p className="mt-1 text-3xl font-bold leading-none tabular-nums text-foreground" style={headingStyle}>
            {s.figure.value}
          </p>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">{s.figure.label}</p>
        </div>
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div>
            <dt className={dt}>Date</dt>
            <dd className="mt-1 text-foreground">
              <time dateTime={s.date}>{formatDate(s.date)}</time>
              {s.updated && (
                <>
                  , updated <time dateTime={s.updated}>{formatDate(s.updated)}</time>
                </>
              )}
              {s.dateNote && <span className="block text-muted-foreground">{s.dateNote}</span>}
            </dd>
          </div>
          <div>
            <dt className={dt}>Window</dt>
            <dd className="mt-1 text-foreground">{s.window}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className={dt}>Sample</dt>
            <dd className="mt-1 text-foreground">{s.sample}</dd>
          </div>
          {s.note && (
            <div className="sm:col-span-2">
              <dt className={dt}>Note</dt>
              <dd className="mt-1 text-muted-foreground">{s.note}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className={dt}>Download</dt>
            <dd className="mt-1">
              {s.downloads ? (
                <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <ArrowDownToLine aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                  {s.downloads.map((d) => (
                    <a key={d.href} href={d.href} download className={`${linkClass} inline-flex min-h-11 items-center`}>
                      {d.label}
                      <span className="sr-only">, {s.title}</span>
                    </a>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">No file. The tables are on the study page.</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

function StudyGroup({ id, title, blurb, items }: { id: string; title: string; blurb: string; items: Study[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mb-14 scroll-mt-28">
      <h2 id={`${id}-title`} className="text-2xl font-bold text-foreground md:text-3xl" style={headingStyle}>
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      <ul className="mt-4">
        {items.map((s) => (
          <StudyCard key={s.id} s={s} />
        ))}
      </ul>
    </section>
  );
}

const PAGES = [
  {
    href: "/research/experiments/",
    title: "SEO experiments",
    text: "A dated register of tests on my own sites, with what I changed and when I check.",
  },
  {
    href: "/research/data/",
    title: "Data catalogue",
    text: `${FILE_COUNT} files with window, sample, exclusions, licence and citation text.`,
  },
  {
    href: "/research/methodology/",
    title: "Methodology",
    text: "How I pull, check and restate the numbers.",
  },
  {
    href: "/research/editorial-policy/",
    title: "Editorial policy",
    text: "Who writes, what is mine, and how I correct mistakes.",
  },
];

export default function ResearchHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
      <ResearchShell
        wide
        current="/research/"
        crumbs={[{ label: "Research" }]}
        eyebrow="Research"
        title="Original SEO research from my own sites"
        intro={
          <p>
            Every study here uses data I collected myself, and each one shows its sample, window and headline
            figure up front.
          </p>
        }
      >
        <dl className="mb-12 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-md border border-hairline bg-hairline text-sm">
          <div className="bg-background p-4">
            <dt className="text-xs text-muted-foreground">Studies</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={headingStyle}>
              {STUDIES.length}
            </dd>
          </div>
          <div className="bg-background p-4">
            <dt className="text-xs text-muted-foreground">Catalogued items</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={headingStyle}>
              {CATALOGUE.length}
            </dd>
          </div>
          <div className="bg-background p-4">
            <dt className="text-xs text-muted-foreground">Last checked</dt>
            <dd className="mt-1 font-semibold text-foreground">
              <time dateTime={RESEARCH_LAST_CHECKED}>{formatDate(RESEARCH_LAST_CHECKED)}</time>
            </dd>
          </div>
        </dl>

        <ul className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="group flex h-full flex-col rounded-md border border-hairline-strong p-5 transition-colors hover:border-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                <span className="text-lg font-semibold text-foreground" style={headingStyle}>
                  {p.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-auto h-4 w-4 pt-4 text-brand-ink transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
            </li>
          ))}
        </ul>

        <StudyGroup
          id="recurring"
          title="Recurring study"
          blurb="I add a row each time Google confirms a core or spam update."
          items={recurring}
        />
        <StudyGroup
          id="studies"
          title="Original studies"
          blurb="Newest first. Each describes my own sites or my own pulls, and none describes the web."
          items={current}
        />
        <StudyGroup
          id="withdrawn"
          title="Withdrawn"
          blurb="I keep withdrawn work online, marked, so you can see what changed."
          items={withdrawn}
        />

        <section id="reference" aria-labelledby="reference-title" className="mb-14 scroll-mt-28 border-t border-hairline-strong pt-12">
          <h2 id="reference-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
            Reference lists
          </h2>
          <div className="mt-3 max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>A reference list is a working tool I version and publish. It is not a study and has no headline figure.</p>
            <p>
              The{" "}
              <Link href="/blog/ai-referral-sources-ga4/" className={linkClass}>
                AI referral sources list for GA4
              </Link>{" "}
              is version 1.0, dated 2 November 2026, and its JSON file is in the data catalogue.
            </p>
          </div>
        </section>

        <section id="roundups" aria-labelledby="roundups-title" className="mb-4 scroll-mt-28 border-t border-hairline-strong pt-12">
          <h2 id="roundups-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
            Where are the statistics roundups?
          </h2>
          <div className="mt-3 max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>They are in the statistics library, whose figures mostly come from other organisations. That library also lists several of my own studies.</p>
            <p>
              The{" "}
              <Link href="/statistics/" className={linkClass}>
                statistics hub
              </Link>{" "}
              lists them with the source and date of each figure.
            </p>
          </div>
        </section>

        <NextStep />
      </ResearchShell>
    </>
  );
}
