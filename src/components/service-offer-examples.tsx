import Link from "next/link";
import { AlertTriangle, ArrowRight, Download, FileSearch, ListChecks } from "lucide-react";

type ExampleKind = "technical-audit" | "content-brief";

const EXAMPLES = {
  "technical-audit": {
    eyebrow: "Demonstration audit finding",
    title: "One finding from a fictional ecommerce site",
    description:
      "This worked example shows the level of evidence and direction a finding can contain. Northstar Garden Supply is fictional. The example is not a client result.",
    icon: FileSearch,
    downloadHref: "/downloads/technical-seo-audit-finding-demonstration.txt",
    downloadLabel: "Download the demonstration finding",
    report: {
      siteName: "Northstar Garden Supply",
      docTitle: "Technical SEO Audit",
      findingId: "F-07",
      severity: "High impact",
      finding: "Filtered category URLs are crawlable and internally linked",
      evidence:
        "The fictional crawl found 184 filter URLs and 62 conflicting canonical targets in the pots category.",
      evidenceSnippet: [
        "https://northstargardensupply.example/pots?colour=terracotta&size=large",
        "https://northstargardensupply.example/pots?colour=terracotta&sort=price",
        "https://northstargardensupply.example/pots?in-stock=true&size=large",
        "canonical: https://northstargardensupply.example/pots",
      ],
      whyItMatters: "Search engines receive mixed signals about which category URL should be indexed",
      recommendedAction:
        "Choose indexable filter combinations. Remove links to the rest and align canonical rules",
      acceptanceCheck:
        "Re-crawl the affected directory and check whether unapproved filter combinations are still discovered through internal links in the scoped crawl",
      footerNote: "Example finding · fictional site · not a client result",
    },
  },
  "content-brief": {
    eyebrow: "Demonstration content brief",
    title: "A writer-ready extract for a fictional office-plant shop",
    description:
      "This worked example uses the fictional business Northstar Office Plants. It demonstrates the format of a brief and is not a client case study or ranking claim.",
    icon: ListChecks,
    downloadHref: "/downloads/content-brief-demonstration.txt",
    downloadLabel: "Download the demonstration brief",
    rows: [
      ["Target query", "best office plants for low light"],
      ["Search task", "Compare suitable plants and choose one for a low-light workspace"],
      ["Page structure", "Direct answer, comparison criteria, plant options, care limits and buying checklist"],
      ["Evidence needed", "Light tolerance, watering guidance and pet-safety status from named reliable sources"],
      ["Writer check", "Every recommendation states the room condition, practical limit and source requirement"],
    ],
  },
} as const;

export function ServiceOfferExamples({ kind }: { kind: ExampleKind }) {
  const example = EXAMPLES[kind];
  const Icon = example.icon;

  return (
    <section
      aria-labelledby={`${kind}-example-title`}
      className="overflow-hidden border-y border-hairline-strong dark:border-white/[0.10] bg-surface-2 dark:bg-white/[0.025]"
    >
      <div className="grid min-w-0 lg:grid-cols-[0.85fr_1.5fr]">
        <div className="min-w-0 border-b border-hairline-strong dark:border-white/[0.08] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div className="mb-5 flex h-10 w-10 items-center justify-center border border-brand/25 bg-brand/[0.08] text-brand-ink">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink">
            {example.eyebrow}
          </p>
          <h3
            id={`${kind}-example-title`}
            className="mt-3 text-xl font-semibold leading-snug text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {example.title}
          </h3>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {example.description}
          </p>
          <a
            href={example.downloadHref}
            download
            className="mt-6 inline-flex min-h-11 items-center gap-2 border border-brand/35 px-4 py-2.5 text-sm font-semibold text-brand-ink transition-[background-color,border-color,color] duration-200 hover:border-brand/60 hover:bg-brand/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {example.downloadLabel}
          </a>
        </div>

        <div className="min-w-0">
          {"report" in example ? (
            <div className="min-w-0 px-6 pt-6 lg:px-8 lg:pt-8">
              <div className="min-w-0 border border-hairline-strong dark:border-white/[0.12] bg-white dark:bg-[#0a0a0f] shadow-[var(--elev)] dark:shadow-none p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline-strong dark:border-white/[0.10] pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {example.report.siteName} · {example.report.docTitle}
                    </p>
                    <p className="mt-1.5 font-mono text-xs text-brand-ink">{example.report.findingId}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/[0.10] px-2.5 py-1 text-xs font-semibold text-gold-ink">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    {example.report.severity}
                  </span>
                </div>

                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
                      Finding
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-foreground">{example.report.finding}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
                      Evidence
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">{example.report.evidence}</dd>
                    <pre className="mt-2 overflow-x-auto border border-hairline-strong dark:border-white/[0.10] bg-surface-2 dark:bg-black/40 p-3 font-mono text-[11.5px] leading-5 text-foreground/80">
                      <code>{example.report.evidenceSnippet.join("\n")}</code>
                    </pre>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
                      Why it matters
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">{example.report.whyItMatters}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
                      Recommended action
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                      {example.report.recommendedAction}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
                      Acceptance check
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                      {example.report.acceptanceCheck}
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 border-t border-hairline-strong dark:border-white/[0.10] pt-3 text-xs italic text-muted-foreground">
                  {example.report.footerNote}
                </p>
              </div>
            </div>
          ) : (
            <dl className="divide-y divide-hairline dark:divide-white/[0.07]">
              {example.rows.map(([term, detail]) => (
                <div key={term} className="grid gap-1 px-6 py-4 sm:grid-cols-[9rem_1fr] sm:gap-5 lg:px-8">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
                    {term}
                  </dt>
                  <dd className="text-sm leading-6 text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="px-6 py-5 lg:px-8">
            <Link
              href="#enquire"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-brand/60 underline-offset-4 transition-colors duration-200 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              data-cta-location={`${kind}_demonstration`}
              data-cta-offer={kind === "technical-audit" ? "technical_seo_audit_495" : "content_brief_150"}
            >
              {kind === "technical-audit" ? "Request the £495 audit" : "Enquire about one £150 brief"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
