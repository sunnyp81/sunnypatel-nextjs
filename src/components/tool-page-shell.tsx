import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";

export type ToolPageInfo = {
  slug: string; title: string; description: string; intro: string;
  steps: string[]; checks: string[]; limits: string;
  faqs: { q: string; a: string }[]; service: { href: string; label: string; lead: string };
};

export const newToolPages: Record<string, ToolPageInfo> = {
  "schema-validator": {
    slug: "schema-validator", title: "Schema Validator", description: "Check JSON-LD syntax and structured data properties from code or a URL.",
    intro: "Paste JSON-LD or fetch a page to find syntax errors and missing structured data properties.",
    steps: ["Paste a JSON-LD script or enter a public page URL.", "Run the check and inspect each graph node.", "Use the linked generator to repair a supported type, then test the published page with Google."],
    checks: ["JSON syntax, including an approximate line number", "Missing @context and @type, including graph nodes", "Selected required and recommended Google Search properties"],
    limits: "This is a first pass. It cannot assess whether claims match visible page content or guarantee a rich result. Google may apply additional type and page rules.",
    faqs: [
      { q: "Can I test several JSON-LD blocks?", a: "Yes. URL mode checks each application/ld+json block it finds in the returned HTML." },
      { q: "Does a warning make my markup invalid?", a: "No. Recommended properties and unsupported rich result types can still be valid schema.org markup." },
      { q: "Can this check rendered JavaScript?", a: "It checks the HTML returned by the server. Structured data added later by JavaScript may be missed." },
      { q: "Does passing guarantee a rich result?", a: "No. Google applies content, eligibility and quality rules beyond these property checks." },
    ],
    service: { href: "/services/technical-seo-audit/", label: "technical SEO audit", lead: "For a review of the published markup and page context, see my" },
  },
  "sitemap-generator": {
    slug: "sitemap-generator", title: "XML Sitemap Generator", description: "Crawl internal HTML links and download a sitemap draft.",
    intro: "Build a draft XML sitemap from links found in a public website's HTML.",
    steps: ["Enter the site URL and choose a page limit.", "Start the crawl and watch the discovered page count.", "Review, copy or download the XML before submitting it."],
    checks: ["Same-host HTML links", "Robots.txt Disallow rules for the wildcard user agent", "Noindex and canonical signals in returned HTML"],
    limits: "The crawl stops at 500 URLs. JavaScript-rendered links are not discovered. Robots rules, redirects and canonicals can be more complex than this lightweight crawler can resolve. Review the output before publishing.",
    faqs: [
      { q: "Will it find every page?", a: "No. It follows links in returned HTML only and cannot discover orphan pages or links added by JavaScript." },
      { q: "Does it respect robots.txt?", a: "It applies wildcard Disallow rules found in robots.txt before fetching pages. Review complex rule sets separately." },
      { q: "Where does lastmod come from?", a: "A valid Last-Modified response header is used where available. Otherwise the entry has no lastmod." },
      { q: "Can I stop a crawl?", a: "Yes. Stop prevents the queue from starting more pages and preserves results already collected." },
    ],
    service: { href: "/services/technical-seo-audit/", label: "technical SEO audit", lead: "For a full crawl and indexability review, see my" },
  },
  "llms-txt-generator": {
    slug: "llms-txt-generator", title: "llms.txt Generator", description: "Draft a proposed llms.txt file for your website.",
    intro: "Create a concise Markdown guide to your site's most useful pages. llms.txt is a proposed convention, not an official standard.",
    steps: ["Add your site name and a short summary.", "Add sections with useful links and optional notes, or prefill from your public site.", "Review the draft, then copy or download llms.txt."],
    checks: ["H1 title and blockquote summary", "H2 link sections and optional detail", "Markdown links with short notes"],
    limits: "Publishing llms.txt does not improve rankings or guarantee AI citations. Prefill is a starting point from the homepage and sitemap, so check every link and summary.",
    faqs: [
      { q: "Is llms.txt an official standard?", a: "No. It is a proposal described at llmstxt.org." },
      { q: "Will AI systems read the file?", a: "Some systems may choose to read it. Adoption and behaviour vary, so check your own server logs and results." },
      { q: "Does it replace a sitemap?", a: "No. Keep an XML sitemap for search crawling and use llms.txt only as an optional human-reviewed guide." },
      { q: "Where should I upload it?", a: "Place the reviewed text file at the root path /llms.txt of your site." },
    ],
    service: { href: "/services/ai-search-optimisation/", label: "AI search optimisation service", lead: "For a broader review of how your site is represented in AI search, see my" },
  },
  "meta-description-generator": {
    slug: "meta-description-generator", title: "Meta Description Generator", description: "Create six search descriptions and compare estimated pixel widths.",
    intro: "Draft six British English meta descriptions from your own page facts, without an AI API.",
    steps: ["Enter the page topic, keyword and any relevant audience, benefit and call to action.", "Generate six varied drafts and compare their estimated widths.", "Edit the chosen text for accuracy, then copy it into your page metadata."],
    checks: ["Character count and approximate desktop and mobile pixel width", "Keyword placement in each draft", "Six deterministic wording patterns"],
    limits: "Pixel guides are approximate. Google may rewrite a snippet and display length varies by device, query and typography. Only include benefits you can substantiate.",
    faqs: [
      { q: "Does Google always show my description?", a: "No. Google can choose a different snippet from the page for a particular search." },
      { q: "Are the pixel limits exact?", a: "No. The desktop and mobile guides are estimates based on browser text measurement." },
      { q: "Is this generated by AI?", a: "No. The six variations use fixed templates and only the details you enter." },
      { q: "Should I use the primary keyword every time?", a: "Use it naturally when it accurately describes the page. Edit any draft that feels repetitive." },
    ],
    service: { href: "/services/technical-seo-audit/", label: "technical SEO audit", lead: "For a broader review of snippets and on-page signals, see my" },
  },
};

export function ToolPageShell({ info, children }: { info: ToolPageInfo; children: ReactNode }) {
  const url = `https://sunnypatel.co.uk/tools/${info.slug}/`;
  const software = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: info.title, applicationCategory: "SEOApplication", operatingSystem: "Web", url, description: info.description, offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }, author: { "@type": "Person", name: "Sunny Patel", url: "https://sunnypatel.co.uk/" } };
  return <main className="relative min-h-screen bg-background">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }} />
    <Navbar /><div id="main-content" tabIndex={-1} />
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Free SEO tool</p><h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>{info.title}</h1><p className="mt-4 max-w-3xl text-base text-muted-foreground">{info.intro}</p></div>
      {children}
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <section><h2 className="mb-3 text-xl font-bold text-foreground">How to use it</h2><ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">{info.steps.map(s => <li key={s}>{s}</li>)}</ol></section>
        <section><h2 className="mb-3 text-xl font-bold text-foreground">What it checks</h2><ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">{info.checks.map(s => <li key={s}>{s}</li>)}</ul></section>
        <section><h2 className="mb-3 text-xl font-bold text-foreground">Limits</h2><p className="text-sm leading-relaxed text-muted-foreground">{info.limits}</p></section>
        <section><h2 className="mb-3 text-xl font-bold text-foreground">Frequently asked questions</h2><div className="space-y-4">{info.faqs.map(f => <div key={f.q}><h3 className="font-semibold text-foreground">{f.q}</h3><p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p></div>)}</div></section>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">{info.service.lead} <Link className="text-brand underline underline-offset-2" href={info.service.href}>{info.service.label}</Link>.</p>
    </div><RelatedTools currentHref={`/tools/${info.slug}/`} /><Footer />
  </main>;
}
