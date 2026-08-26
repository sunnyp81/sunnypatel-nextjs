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
      "Real AI-assistant referral traffic from my own portfolio of sites, sector labelled, pulled live from GA4 and cross checked against Search Console. No client claims, no invented stats.",
    path: "/ai-visibility-results",
  });
}

const FAQS = [
  {
    q: "Whose sites are these results from?",
    a: "My own portfolio, not client work. Most are sites I own and operate myself, which is why they are labelled by sector rather than by name, and it is also why I can show the raw data honestly instead of a client-approved summary.",
  },
  {
    q: "Why does AI referral traffic keep going after a Google core update crashes clicks?",
    a: "Google ranking and AI citation are measured differently. A core update changes where a page sits in Google's results, but it does not remove the page from the sources ChatGPT, Perplexity or Copilot already cite. Two sites in this data set kept their AI referral sessions through a Google demotion that took their organic clicks to near zero.",
  },
  {
    q: "How current is this data?",
    a: "The session figures are a live GA4 pull, 90 days to 26 August 2026, cross checked against Google Search Console over the same window. This page gets refreshed rather than replaced when the numbers move.",
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
      name: "AI Assistant Referral Sessions, Portfolio Sample, 90 Days to 26 August 2026",
      description:
        "Sector labelled ChatGPT, Claude, Perplexity, Copilot and OpenAI referral session counts for 6 sites in Sunny Patel's own portfolio, measured over a 90 day window via GA4 and cross checked against Google Search Console.",
      url: "https://sunnypatel.co.uk/ai-visibility-results/",
      creator: { "@id": "https://sunnypatel.co.uk/#person" },
      temporalCoverage: "2026-05-28/2026-08-26",
      variableMeasured: "AI assistant referral sessions per site, 90 day window",
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
  { icon: Database, label: "Live GA4 pull" },
  { icon: Shield, label: "Own portfolio, not client claims" },
  { icon: Sparkles, label: "Cross checked against GSC" },
  { icon: CalendarDays, label: "Refreshed, not replaced" },
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
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
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
              sector labelled, pulled live and checked against Search Console rather than
              quoted from memory.
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
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
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
              Why Google ranking and AI citation move independently
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Two of the sites above lost most of their Google organic clicks to a core
                update during this measurement window. Their AI referral sessions did not
                fall with them. Google re-ranks a page against the current SERP. AI systems
                cite from a source list built up over time. Losing the first does not
                automatically remove a site from the second.
              </p>
              <p>
                The reverse pattern shows up too: 2 sites in the data set earn steady AI
                referral traffic while ranking on page 2 or 3 of Google for their core
                terms, or with organic clicks flat at zero for months. Citation and ranking
                are different signals. Treating them as one metric hides where the actual
                opportunity is.
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
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/20 hover:text-brand"
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
