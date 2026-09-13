import Link from "next/link";
import { ArrowRight, Download, FileSearch, ListChecks } from "lucide-react";

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
    rows: [
      ["Finding", "Filtered category URLs are crawlable and internally linked"],
      ["Evidence", "The fictional crawl found 184 filter URLs and 62 conflicting canonical targets"],
      ["Why it matters", "Search engines receive mixed signals about which category URL should be indexed"],
      ["Recommended action", "Choose indexable filter combinations. Remove links to the rest and align canonical rules"],
      ["Acceptance check", "Re-crawl the affected directory and check whether unapproved filter combinations are still discovered through internal links in the scoped crawl"],
    ],
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
      className="overflow-hidden border-y border-white/[0.10] bg-white/[0.025]"
    >
      <div className="grid lg:grid-cols-[0.85fr_1.5fr]">
        <div className="border-b border-white/[0.08] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div className="mb-5 flex h-10 w-10 items-center justify-center border border-brand/25 bg-brand/[0.08] text-brand">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
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
            className="mt-6 inline-flex min-h-11 items-center gap-2 border border-brand/35 px-4 py-2.5 text-sm font-semibold text-brand transition-[background-color,border-color,color] duration-200 hover:border-brand/60 hover:bg-brand/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {example.downloadLabel}
          </a>
        </div>

        <div>
          <dl className="divide-y divide-white/[0.07]">
            {example.rows.map(([term, detail]) => (
              <div key={term} className="grid gap-1 px-6 py-4 sm:grid-cols-[9rem_1fr] sm:gap-5 lg:px-8">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
                  {term}
                </dt>
                <dd className="text-sm leading-6 text-muted-foreground">{detail}</dd>
              </div>
            ))}
          </dl>
          <div className="px-6 py-5 lg:px-8">
            <Link
              href="#enquire"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline decoration-brand/60 underline-offset-4 transition-colors duration-200 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
