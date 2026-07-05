import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ServiceInlineForm } from "@/components/service-inline-form";
import { Breadcrumb } from "@/components/breadcrumb";
import { GradientButton } from "@/components/ui/gradient-button";
import { faqSchema, schemaGraph, breadcrumbSchema } from "@/lib/schema";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Shield,
  Sparkles,
  Clock,
} from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "AI Visibility Audit | £495 Fixed Fee",
    description:
      "Find out whether ChatGPT, Perplexity, Copilot, and Google AI Overviews recommend your business, who they recommend instead, and exactly what to change. Fixed fee £495, delivered in 5 working days.",
    path: "/services/ai-visibility-audit",
  });
}

const FAQS = [
  {
    q: "What exactly do I receive?",
    a: "A written report covering your citation baseline across ChatGPT, Perplexity, Copilot, Gemini, and Google AI Overviews for 20 commercially important queries, a competitor citation analysis, an entity and consistency audit, a technical extractability review, and a prioritised 90-day action plan. It comes with a 45-minute walkthrough call and GA4 tracking setup so you can measure AI referrals yourself from day one.",
  },
  {
    q: "How is this different from a normal SEO audit?",
    a: "A traditional SEO audit measures how Google ranks your pages. This audit measures whether AI assistants mention and recommend your business when buyers ask them for advice, which depends on different signals: entity clarity, consistency of facts about you across the web, content extractability, and third-party corroboration. My paid SEO audit includes a short AI-visibility section; this is the full investigation.",
  },
  {
    q: "Why should I trust your read on AI search?",
    a: "I track AI assistant referrals across a portfolio of more than 60 sites in Google Analytics. The best performer earns over 1,200 visits per quarter from AI assistants, more than 90% of them from ChatGPT. The audit methodology is the same one I use to win that traffic.",
  },
  {
    q: "How does the credit work if we go on to work together?",
    a: "Start a retainer within 60 days of delivery and the £495 is credited against your first month. No minimum contract applies.",
  },
  {
    q: "Do you fix the issues you find?",
    a: "The audit is a diagnostic with a prioritised plan your team can act on independently. If you want the issues fixed for you, that conversation starts at the end of the walkthrough call, and the audit fee is credited if you do.",
  },
  {
    q: "My site is large or has multiple locations. Is it still £495?",
    a: "£495 covers a single brand with up to 500 indexed pages and 20 tracked queries. Multi-location businesses, marketplaces, and enterprise sites need a scoping conversation first; those engagements are quoted individually, typically between £750 and £1,500.",
  },
];

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://sunnypatel.co.uk/services/ai-visibility-audit/#service",
      name: "AI Visibility Audit",
      description:
        "A fixed-fee audit of how ChatGPT, Perplexity, Copilot, Gemini, and Google AI Overviews describe and recommend your business, with a competitor citation analysis and a prioritised 90-day action plan. Fixed fee £495, delivered in 5 working days.",
      url: "https://sunnypatel.co.uk/services/ai-visibility-audit/",
      provider: { "@id": "https://sunnypatel.co.uk/#person" },
      areaServed: { "@type": "Country", name: "United Kingdom" },
      offers: {
        "@type": "Offer",
        price: "495",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: "https://sunnypatel.co.uk/services/ai-visibility-audit/",
        description:
          "Fixed-fee AI visibility audit covering citation baseline, competitor analysis, entity consistency, and content extractability. Delivered in 5 working days with a 45-minute walkthrough call.",
        seller: { "@id": "https://sunnypatel.co.uk/#person" },
      },
      serviceType: "AI Search Visibility Audit",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AI Visibility Audit Deliverables",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Citation Baseline Report (ChatGPT, Perplexity, Copilot, Gemini, AI Overviews)" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Competitor Citation Analysis" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Entity and Consistency Audit" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Content Extractability and Schema Review" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Prioritised 90-Day AI Visibility Plan" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "GA4 AI Referral Tracking Setup" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "45-Minute Walkthrough Call" } },
        ],
      },
    },
    ...JSON.parse(
      schemaGraph(
        faqSchema(FAQS),
        breadcrumbSchema([
          { name: "Home", url: "https://sunnypatel.co.uk/" },
          { name: "Services", url: "https://sunnypatel.co.uk/services/" },
          { name: "AI Visibility Audit", url: "https://sunnypatel.co.uk/services/ai-visibility-audit/" },
        ])
      )
    )["@graph"],
  ],
};

const TRUST_BADGES = [
  { icon: BarChart3, label: "60+ sites of AI referral data" },
  { icon: Sparkles, label: "£495 fixed fee" },
  { icon: Shield, label: "Fee credited to retainer" },
  { icon: Clock, label: "5 working days" },
] as const;

const WHAT_YOU_GET = [
  "AI citation baseline for 20 commercially important queries across ChatGPT, Perplexity, Copilot, Gemini, and Google AI Overviews",
  "Competitor citation analysis: who the assistants recommend instead, and why",
  "Entity and consistency audit of the facts published about your business across the web",
  "Content extractability review: structure, schema, and llms.txt readiness",
  "Prioritised 90-day action plan scored by revenue impact vs. effort",
  "GA4 tracking setup so AI referrals show up in your own analytics",
  "45-minute walkthrough call with screen-share review",
];

const YES_FOR = [
  "Businesses whose buyers research on ChatGPT, Perplexity, or Copilot before purchasing",
  "Brands that rank on Google but are invisible in AI answers",
  "Businesses being described inaccurately or confused with competitors by AI assistants",
  "Marketing teams asked to report on AI search and unsure where to start",
  "Agencies who need a white-label AI visibility assessment for a client",
];

const NO_FOR = [
  "Brand new sites with little existing content or third-party presence",
  "Businesses needing content writing, digital PR, or implementation (that comes after)",
  "Multi-location or enterprise brands (contact for scoping first, typically £750 to £1,500)",
];

export default function AiVisibilityAuditPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }}
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
                { label: "Services", href: "/services" },
                { label: "AI Visibility Audit" },
              ]}
            />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand">
              Services
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              AI Visibility Audit: Is ChatGPT Recommending You, or Your Competitor?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A fixed-fee audit of how ChatGPT, Perplexity, Copilot, and Google AI
              Overviews describe and recommend your business, who they send buyers to
              instead, and the exact changes that earn you the citation. Delivered in 5
              working days.
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
                <Link href="/contact/" className="gap-2">
                  Book the Audit: £495
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GradientButton>
              <span className="text-sm text-muted-foreground/70">
                5 working days · 45-min call included
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-3xl px-6 py-12">

          {/* Why this matters section */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Your buyers already ask AI for recommendations
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Ask ChatGPT for the best provider in your market and the answer names two
                or three businesses. Either you are one of them or a competitor is. There
                is no page two in an AI answer: businesses the assistant does not cite do
                not exist in that conversation.
              </p>
              <p>
                I measure this daily. Across the 60+ sites I track in Google Analytics,
                AI assistants now send four-figure quarterly traffic to the best
                performer, with more than 90% of it coming from ChatGPT. The sites that
                win those citations share specific, fixable traits: clear entity signals,
                consistent facts about the business everywhere they appear, and content
                structured so an AI can lift the answer cleanly.
              </p>
              <p className="font-medium text-foreground">
                Fixed fee: £495. Delivered in 5 working days. If you go on to work
                together, the audit fee is credited against your first month.
              </p>
            </div>
          </section>

          {/* What you get */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              What the audit covers
            </h2>
            <div className="space-y-6">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">Citation baseline</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your 20 most commercially important queries are run across ChatGPT,
                  Perplexity, Bing Copilot, Gemini, and Google AI Overviews. Each response
                  is recorded: whether you are cited, how you are described, which sources
                  the assistant relied on, and which competitors appear instead. This
                  becomes the benchmark every future improvement is measured against.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">Competitor citation analysis</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The audit traces why competitors win each query: the third-party pages
                  the assistant sourced, the review and directory presence backing them
                  up, and the content structures being quoted. You see the exact citation
                  gap you need to close, not a generic best-practice list.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">Entity and consistency audit</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  AI assistants cross-check facts about your business across the open web
                  before repeating them. Conflicting names, phone numbers, addresses,
                  service descriptions, or founding details make assistants hesitate or
                  blend you with a competitor. The audit maps every inconsistency
                  and ranks the corrections by impact.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">Content extractability and technical review</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The review checks whether your pages let an assistant lift a clean
                  quotable answer: heading hierarchy, direct answer placement, schema
                  markup quality, llms.txt, and crawler access for AI user agents. Each
                  issue comes with the specific fix.
                </p>
              </div>
              <div className="rounded-xl border border-brand/20 bg-brand/[0.04] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">90-day plan, tracking, and walkthrough call</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Every finding lands in a prioritised 90-day plan scored by revenue
                  impact against effort. I also set up the GA4 configuration that
                  separates AI assistant referrals from the rest of your traffic, so the
                  results are visible in your own analytics. We close with a 45-minute
                  walkthrough call to agree your first 30 days of work.
                </p>
              </div>
            </div>

            {/* Deliverables checklist */}
            <div className="mt-8 space-y-2.5">
              {WHAT_YOU_GET.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              The audit works best for businesses with an established site and some
              third-party presence. The section below clarifies fit.
            </p>
          </section>

          {/* Who it is for */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Who this is for
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">
                  Good fit
                </p>
                <div className="space-y-2.5">
                  {YES_FOR.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Not the right fit
                </p>
                <div className="space-y-2.5">
                  {NO_FOR.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      <span className="text-sm text-muted-foreground/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Honest scope limits */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Honest scope limits
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>
                The AI visibility audit is a diagnostic, not an implementation. It tells
                you exactly where you stand, why competitors are cited over you, and what
                to change, in priority order. Executing the plan is separate work: some of
                it your team can do the same week, some needs a developer, and earning
                third-party corroboration takes sustained effort over months.
              </p>
              <p>
                AI assistant behaviour also shifts as models update. The audit gives you a
                dated baseline and a measurement setup, so change is visible either way.
                It does not promise a specific citation outcome; nobody controls what an
                assistant says, and anyone claiming otherwise is guessing.
              </p>
              <p>
                Single brand, up to 500 indexed pages, 20 tracked queries: £495.
                Multi-location, marketplace, and enterprise sites are quoted after a
                scoping conversation, typically £750 to £1,500.{" "}
                <Link href="/contact/" className="text-brand hover:underline">
                  Get in touch
                </Link>{" "}
                to discuss. Common questions are answered below.
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

          {/* Related services links */}
          <section className="mb-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/65">
              Related services
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Paid SEO Audit", href: "/services/paid-seo-audit/" },
                { label: "AI Search Optimisation", href: "/services/ai-search-optimisation/" },
                { label: "SEO Consulting", href: "/services/seo-consulting/" },
                { label: "All Services", href: "/services/" },
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
        <ServiceInlineForm
          ctaTitle="Book Your AI Visibility Audit"
          ctaSubtitle="Tell me your site URL and the query you most want to be recommended for. I will check it before we speak."
        />

        <Footer />
      </main>
    </>
  );
}
