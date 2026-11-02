import Link from "next/link";
import { ArrowDownToLine } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { ResearchShell, NextStep, headingStyle, linkClass } from "@/components/research/shell";
import {
  CATALOGUE,
  CATALOGUE_GROUPS,
  DATASET_ENTRIES,
  FILE_COUNT,
  LICENCE_NAME,
  LICENCE_URL,
  fileSha256,
  RESEARCH_LAST_CHECKED,
  SITE_URL,
  citationFor,
  formatDate,
  type CatalogueEntry,
} from "@/data/research-catalogue";

const PAGE_URL = `${SITE_URL}/research/data/`;
const CATALOG_ID = `${PAGE_URL}#catalog`;

export function generateMetadata() {
  return buildMetadata({
    title: "Research Data Catalogue: Files, Windows and Licences | Sunny Patel",
    description:
      "Every data file on sunnypatel.co.uk with its window, sample, exclusions, anonymisation rule, verification, licence and citation text.",
    path: "/research/data",
  });
}

const CREATOR = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Sunny Patel",
  url: `${SITE_URL}/about/`,
};

function datasetNode(e: CatalogueEntry) {
  const caveat = e.group === "compiled"
    ? " The figures belong to their sources. The licence covers my selection and wording."
    : "";
  return {
    "@type": "Dataset",
    "@id": `${PAGE_URL}#${e.id}`,
    name: e.title,
    description: `${e.contains} Sample: ${e.sample}${caveat}`,
    url: `${PAGE_URL}#${e.id}`,
    inLanguage: "en-GB",
    creator: CREATOR,
    license: e.extraLicence ? [e.licenceUrl ?? LICENCE_URL, e.extraLicence.url] : (e.licenceUrl ?? LICENCE_URL),
    isAccessibleForFree: true,
    ...(e.date ? { datePublished: e.date } : {}),
    ...(e.version ? { version: e.version } : {}),
    ...(e.uk ? { spatialCoverage: "GB" } : {}),
    ...(e.temporalCoverage ? { temporalCoverage: e.temporalCoverage } : {}),
    ...(e.basedOn ? { isBasedOn: e.basedOn } : {}),
    includedInDataCatalog: { "@id": CATALOG_ID },
    distribution: e.files.map((f) => ({
      "@type": "DataDownload",
      name: f.name,
      encodingFormat: f.mime,
      contentUrl: `${SITE_URL}${f.href}`,
      sha256: fileSha256(f.href),
    })),
  };
}

const SCHEMA = schemaGraph(
  {
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "Research data catalogue",
    description:
      "Every data file on sunnypatel.co.uk with its window, sample, exclusions, anonymisation rule, verification, licence and citation text.",
    inLanguage: "en-GB",
    dateModified: RESEARCH_LAST_CHECKED,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": CATALOG_ID },
    author: { "@id": `${SITE_URL}/#person` },
  },
  {
    "@type": "DataCatalog",
    "@id": CATALOG_ID,
    name: "Sunny Patel research data catalogue",
    url: PAGE_URL,
    description: "Datasets from SEO studies on Search Console, GA4, Ahrefs and published sources.",
    creator: { "@id": `${SITE_URL}/#person` },
    license: LICENCE_URL,
    inLanguage: "en-GB",
    dataset: DATASET_ENTRIES.map((e) => ({ "@id": `${PAGE_URL}#${e.id}` })),
  },
  ...DATASET_ENTRIES.map(datasetNode),
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Research", url: `${SITE_URL}/research/` },
    { name: "Data catalogue", url: PAGE_URL },
  ])
);

const dt = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className={dt}>{label}</dt>
      <dd className="mt-1 text-foreground">{children}</dd>
    </div>
  );
}

function Entry({ e }: { e: CatalogueEntry }) {
  return (
    <li id={e.id} className="scroll-mt-28 border-t border-hairline py-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-semibold text-foreground" style={headingStyle}>
          {e.title}
        </h3>
        {e.status === "withdrawn" && (
          <span className="rounded-sm border border-hairline-strong px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Withdrawn
          </span>
        )}
      </div>

      {e.files.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {e.files.map((f) => (
            <li key={f.href} className="inline-flex flex-wrap items-center gap-1.5">
              <ArrowDownToLine aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
              <a href={f.href} download className={`${linkClass} inline-flex min-h-11 items-center break-all`}>
                {f.name}
              </a>
              <span className="text-muted-foreground">({f.format})</span>
              <span className="basis-full break-all font-mono text-xs text-muted-foreground">
                SHA-256 {fileSha256(f.href)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          File: none yet.{" "}
          {e.studyHref && (
            <>
              The tables are on{" "}
              <Link href={e.studyHref} className={linkClass}>
                the study page
              </Link>
              .
            </>
          )}
        </p>
      )}

      <dl className="mt-5 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
        <Field label="What it contains" wide>
          {e.contains}
        </Field>
        <Field label="Window">{e.window}</Field>
        <Field label="Study page">
          {e.studyHref ? (
            <Link href={e.studyHref} className={linkClass}>
              {e.studyTitle}
            </Link>
          ) : (
            "None. It is a standalone download."
          )}
          {e.date && (
            <span className="block text-muted-foreground">
              Dated <time dateTime={e.date}>{formatDate(e.date)}</time>
            </span>
          )}
        </Field>
        <Field label="Sample" wide>
          {e.sample}
        </Field>
        <Field label="Exclusions" wide>
          {e.exclusions}
        </Field>
        <Field label="Anonymisation rule">{e.anonymisation}</Field>
        <Field label="Site names in the file">{e.siteNames}</Field>
        <Field label="How it was verified" wide>
          {e.verification}
        </Field>
        <Field label="Licence">
          {e.licence}{" "}
          <a href={e.licenceUrl ?? LICENCE_URL} rel="noopener" className={linkClass}>
            Licence text
          </a>
          {e.extraLicence && (
            <>
              {" "}
              <a href={e.extraLicence.url} rel="noopener" className={linkClass}>
                {e.extraLicence.name}
              </a>
            </>
          )}
        </Field>
        <Field label="DOI">
          <span className="font-mono text-xs">No DOI yet</span>
        </Field>
        <Field label="Suggested citation" wide>
          <span className="block select-all rounded-sm border border-hairline bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
            {citationFor(e)}
          </span>
        </Field>
      </dl>
    </li>
  );
}

export default function ResearchDataPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
      <ResearchShell
        wide
        current="/research/data/"
        crumbs={[{ label: "Research", href: "/research/" }, { label: "Data catalogue" }]}
        eyebrow="Research"
        title="Research data catalogue"
        intro={
          <p>
            Every file I publish, with what it holds, the window and sample behind it, what I left out, how I checked
            it and how to cite it.
          </p>
        }
      >
        <dl className="mb-10 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-md border border-hairline bg-hairline text-sm">
          <div className="bg-background p-4">
            <dt className="text-xs text-muted-foreground">Catalogue entries</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={headingStyle}>
              {CATALOGUE.length}
            </dd>
          </div>
          <div className="bg-background p-4">
            <dt className="text-xs text-muted-foreground">Downloadable files</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={headingStyle}>
              {FILE_COUNT}
            </dd>
          </div>
          <div className="bg-background p-4">
            <dt className="text-xs text-muted-foreground">Last checked</dt>
            <dd className="mt-1 font-semibold text-foreground">
              <time dateTime={RESEARCH_LAST_CHECKED}>{formatDate(RESEARCH_LAST_CHECKED)}</time>
            </dd>
          </div>
        </dl>

        <nav aria-label="Jump to a group" className="mb-12">
          <ul className="flex flex-wrap gap-2">
            {CATALOGUE_GROUPS.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex min-h-11 items-center rounded-md border border-hairline-strong px-3 text-sm text-foreground transition-colors hover:border-brand-ink hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="rules" aria-labelledby="rules-title" className="mb-14 scroll-mt-28 grid gap-10 md:grid-cols-2">
          <div>
            <h2 id="rules-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
              What licence applies?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              I license every file on this page under {LICENCE_NAME}, except the script (MIT) and the third-party figures
              in compiled sets, which belong to their sources. Reuse the data with credit to Sunny Patel and keep the
              window and sample with each figure.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              On compiled files the licence covers my selection and wording. The figures stay with the source named on
              each row.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={headingStyle}>
              Do the files name any sites?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              No file names a site that I own, apart from this one. On 2 November 2026 I checked the public files
              for site names.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The link building file names sunnypatel.co.uk. The AI Overviews JSON names third-party sites that
              Google cited. Both are marked on their entries. One table inside a study, not a file, names my own sites. It is marked too.
            </p>
          </div>
        </section>

        {CATALOGUE_GROUPS.map((g) => {
          const items = CATALOGUE.filter((e) => e.group === g.id);
          return (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="mb-14 scroll-mt-28">
              <h2 id={`${g.id}-title`} className="text-2xl font-bold text-foreground md:text-3xl" style={headingStyle}>
                {g.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{g.blurb}</p>
              <ul className="mt-4">
                {items.map((e) => (
                  <Entry key={e.id} e={e} />
                ))}
              </ul>
            </section>
          );
        })}

        <section id="doi" aria-labelledby="doi-title" className="mb-4 scroll-mt-28 border-t border-hairline-strong pt-12">
          <h2 id="doi-title" className="text-2xl font-bold text-foreground" style={headingStyle}>
            When do the files get a DOI?
          </h2>
          <div className="mt-3 max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Each entry says No DOI yet. I plan to add a Zenodo record, and I will put the DOI here when it exists.
            </p>
            <p>
              Until then, cite the study page and the date. The{" "}
              <Link href="/research/methodology/" className={linkClass}>
                methodology
              </Link>{" "}
              explains how each file was built.
            </p>
          </div>
        </section>

        <NextStep />
      </ResearchShell>
    </>
  );
}
