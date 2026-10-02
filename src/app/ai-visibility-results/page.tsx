import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ServiceInlineForm } from "@/components/service-inline-form";
import { AiVisibilityProof } from "@/components/ai-visibility-proof";
import { Breadcrumb } from "@/components/breadcrumb";
import { GradientButton } from "@/components/ui/gradient-button";
import { faqSchema, schemaGraph, breadcrumbSchema } from "@/lib/schema";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, CalendarDays, Database } from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "AI Visibility Results: Real ChatGPT & AI Referral Data",
    description:
      "Historical GA4 assistant-attributed sessions from six owned portfolio sites, 28 May to 26 August 2026. Referral visits and citations are measured separately.",
    path: "/ai-visibility-results",
  });
}

const FAQS = [
  {
    q: "Whose sites are these results from?",
    a: "My own portfolio, not client work. Most are sites I own and operate myself, which is why they are labelled by sector rather than by name, and it is also why I can show the raw data honestly instead of a client-approved summary.",
  },
  {
    q: "Does AI referral traffic prove that a page is cited?",
    a: "No. These are recorded sessions with assistant-matched source labels. They do not count citations or identify why an assistant chose a page. Google clicks, assistant-attributed visits and observed citations need separate measurements.",
  },
  {
    q: "How current is this data?",
    a: "The six-site figures are the published historical extract for 28 May to 26 August 2026, 91 inclusive days. They are not a live dashboard. The linked referral study contains a later, different portfolio cohort and explains the overlapping windows and source-matching limitations.",
  },
  {
    q: "Can you get results like this for my business?",
    a: "Results vary by niche, starting point and how much of the technical and entity groundwork is already in place. The AI Visibility Audit measures where your business currently stands and what is realistic to fix first.",
  },
];

const PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      "@id": "https://sunnypatel.co.uk/ai-visibility-results/#dataset",
      name: "AI Assistant-Attributed Sessions, Six-Site Historical Sample, 28 May to 26 August 2026",
      description:
        "Published GA4 assistant-source session counts for six sites in Sunny Patel's own portfolio, 28 May to 26 August 2026, 91 inclusive days. These historical attributed visits are not citation counts or verified human visits.",
      url: "https://sunnypatel.co.uk/ai-visibility-results/",
      creator: { "@id": "https://sunnypatel.co.uk/#person" },
      temporalCoverage: "2026-05-28/2026-08-26",
      variableMeasured: "Assistant-source attributed sessions per site, 91-day historical window",
      isAccessibleForFree: true,
    },
    ...JSON.parse(
      schemaGraph(
        faqSchema(FAQS),
        breadcrumbSchema([
          { name: "Home", url: "https://sunnypatel.co.uk/" },
          { name: "AI Visibility Results", url: "https://sunnypatel.co.uk/ai-visibility-results/" },
        ])
      )
    )["@graph"],
  ],
};

const TRUST_BADGES = [
  { icon: Database, label: "Historical GA4 extract" },
  { icon: Shield, label: "Own portfolio, not client claims" },
  { icon: Sparkles, label: "Visits measured separately from citations" },
  { icon: CalendarDays, label: "28 May to 26 August 2026" },
] as const;

export default function AiVisibilityResultsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PAGE_SCHEMA) }}
      />

      <main className="relative min-h-screen bg-background">
        <Navbar />
        <div id="main-content" tabIndex={-1} />

        {/* Page header */}
        <div className="relative overflow-hidden pb-12 pt-32">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
            style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0 hidden opacity-[0.06] dark:block"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 block dark:hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--grid-line) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-3xl px-6">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "AI Visibility Results" },
              ]}
            />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand">
              AI Visibility Results
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              What AI referral traffic actually looks like, with the real numbers
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Most AI visibility claims arrive without evidence. This page shows the raw
              ChatGPT, Claude, Perplexity and Copilot referral data from my own portfolio,
              labelled by sector, for 28 May to 26 August 2026. The published figures are
              historical attributed visits, not current citation counts.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/[0.07] px-3 py-1.5 text-xs font-medium text-brand"
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <GradientButton asChild>
                <Link href="/ai-visibility/" className="gap-2">
                  See the AI Visibility Audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GradientButton>
              <span className="text-sm text-muted-foreground/70">
                £1,500 fixed fee · delivered in 2 weeks
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hairline dark:via-white/[0.08] to-transparent" />
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-3xl px-6 py-12">
          <AiVisibilityProof />

          {/* Method */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Why referral visits, search clicks and citations need separate measurements
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                A GA4 assistant-source session records a visit attributed to a matching
                source label. Search Console records Google search activity. A citation
                test records whether a particular answer links to a URL. A site can show
                different results across those measurements because they observe
                different events. These totals do not establish a source-selection mechanism.
              </p>
              <p>
                The six-site extract is a historical sample from my owned portfolio.
                It does not represent all websites or forecast results for a client.
                Source matching can miss lost referrers and cannot verify that each
                session came from a person. The linked referral study provides the
                wider cohort, dates and limitations for its later edition.
              </p>
              <p>
                Full methodology, including how repeated-run variance is measured for
                client engagements, is on the{" "}
                <Link href="/ai-visibility/" className="text-brand hover:underline">
                  AI Visibility Audit
                </Link>{" "}
                page.
              </p>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-hairline bg-wash dark:border-white/[0.08] dark:bg-white/[0.02] p-5"
                >
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{faq.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mb-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/65">
              Related
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "AI Visibility Audit (£1,500)", href: "/ai-visibility/" },
                { label: "AI Visibility Consultant", href: "/ai-visibility-consultant/" },
                { label: "What Is a GEO Agency?", href: "/geo-agency/" },
                { label: "AI Referral Traffic Study", href: "/blog/ai-referral-traffic-study/" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-wash dark:border-white/[0.08] dark:bg-white/[0.02] px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/20 hover:text-brand"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* CTA form */}
        <div id="book">
          <ServiceInlineForm
            ctaTitle="Want This Measured for Your Business?"
            ctaSubtitle="Tell me your company website and the market you compete in. I will come prepared with an initial view of how you currently appear to AI assistants."
          />
        </div>

        <Footer />
      </main>
    </>
  );
}
