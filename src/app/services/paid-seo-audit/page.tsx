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
  CalendarDays,
  Shield,
  Sparkles,
  Clock,
} from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "Paid SEO Audit | £495 Fixed Fee | Sunny Patel SEO Consultant",
    description:
      "Full technical, content, and AI-visibility audit with a prioritised revenue-first action plan and 45-minute walkthrough call. Fixed fee £495, delivered in 5 working days.",
    path: "/services/paid-seo-audit",
  });
}

const FAQS = [
  {
    q: "What exactly do I receive?",
    a: "A written audit report (typically 15-25 pages covering technical SEO, content, and AI-search visibility), a prioritised recommendations spreadsheet with effort and impact scores, and a 45-minute walkthrough call. All documents are yours to keep and share with your team.",
  },
  {
    q: "How does the credit work if we go on to work together?",
    a: "If you start a retainer within 60 days of audit delivery, the £495 fee is deducted from your first month's invoice. There is no obligation to proceed and no minimum contract on any retainer.",
  },
  {
    q: "How is this different from the free consultation?",
    a: "The free consultation is a 30-minute call covering a quick assessment of your most visible issues. The paid audit is a documented investigation of your site that typically uncovers 15-30 specific issues the free call would not surface. It produces written deliverables you can act on independently.",
  },
  {
    q: "Can I share the report with my development team?",
    a: "Yes. The recommendations spreadsheet is specifically formatted for developer handoff: each technical item includes the affected URLs, the issue description, the recommended fix, and an effort estimate.",
  },
  {
    q: "What if the audit reveals problems I cannot afford to fix right now?",
    a: "The prioritisation matrix is designed for this situation. You will know exactly which two or three items have the highest revenue impact for the lowest implementation effort. You do not need to fix everything at once.",
  },
];

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://sunnypatel.co.uk/services/paid-seo-audit/#service",
      name: "Paid SEO Audit",
      description:
        "A full technical, content, and AI-visibility audit with a prioritised revenue-first action plan and 45-minute walkthrough call. Fixed fee £495, delivered in 5 working days.",
      url: "https://sunnypatel.co.uk/services/paid-seo-audit/",
      provider: { "@id": "https://sunnypatel.co.uk/#person" },
      areaServed: { "@type": "Country", name: "United Kingdom" },
      offers: {
        "@type": "Offer",
        price: "495",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: "https://sunnypatel.co.uk/services/paid-seo-audit/",
        description:
          "Fixed-fee SEO audit covering technical SEO, content quality, and AI-search visibility. Delivered in 5 working days with a 45-minute walkthrough call.",
        seller: { "@id": "https://sunnypatel.co.uk/#person" },
      },
      serviceType: "SEO Audit",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "SEO Audit Deliverables",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technical SEO Audit Report" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Content and Topical Authority Analysis" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI-Search Visibility Assessment" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Prioritised Recommendations Spreadsheet" } },
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
          { name: "Paid SEO Audit", url: "https://sunnypatel.co.uk/services/paid-seo-audit/" },
        ])
      )
    )["@graph"],
  ],
};

const TRUST_BADGES = [
  { icon: CalendarDays, label: "15+ years experience" },
  { icon: Sparkles, label: "£495 fixed fee" },
  { icon: Shield, label: "Fee credited to retainer" },
  { icon: Clock, label: "5 working days" },
] as const;

const WHAT_YOU_GET = [
  "Technical SEO audit across 40+ ranking factors",
  "Content and topical authority gap analysis",
  "AI-search visibility assessment (ChatGPT, Copilot, AI Overviews, Perplexity)",
  "Prioritised action plan scored by revenue impact vs. effort",
  "45-minute walkthrough call with screen-share review",
  "Developer-ready recommendations spreadsheet",
];

const YES_FOR = [
  "Existing sites with at least 10 pages of content",
  "Businesses generating some organic traffic but not enough",
  "Sites with previous SEO work that did not deliver results",
  "In-house teams who need a documented starting point",
  "Businesses evaluating whether an ongoing retainer is the right next step",
];

const NO_FOR = [
  "Brand new sites with fewer than 10 pages",
  "Businesses needing content writing or link building (this is a diagnostic)",
  "Sites with more than 500 indexed pages without a scoped conversation first",
];

export default function PaidSeoAuditPage() {
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
                { label: "Paid SEO Audit" },
              ]}
            />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand">
              Services
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Paid SEO Audit: Full Diagnosis, Prioritised Action Plan
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Technical, content, and AI-search visibility covered in one fixed-fee audit.
              Delivered in 5 working days. The fee is credited against your first month if
              you go on to work together.
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
                  Book the Audit — £495
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

          {/* The gap section */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              The gap between a free consultation and a retainer
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                A free consultation tells you where the problems are. A retainer fixes them
                over time. But many businesses want to see the full picture before committing
                to ongoing work. That is exactly what this audit delivers.
              </p>
              <p>
                You get a thorough, documented diagnosis of your site across technical SEO,
                content quality, and AI search visibility. Everything is prioritised by
                revenue impact, not technical complexity. You leave with a clear plan and the
                confidence to act on it.
              </p>
              <p className="font-medium text-foreground">
                Fixed fee: £495. Delivered in 5 working days. If you go on to work together,
                the audit fee is credited against your first month.
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
                <h3 className="mb-2 text-base font-semibold text-foreground">Technical SEO</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Crawlability and indexation errors, Core Web Vitals across device types, site
                  architecture and internal linking, structured data validity, canonical
                  configuration, mobile usability, and redirect chains. Identified against a
                  40-point checklist, scored by ranking impact.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">Content and topical authority</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Content gap analysis against your top three organic competitors. Which pages
                  have the content depth to rank, which are thin, and which are cannibalising
                  each other. Topical coverage map showing where your site has authority and
                  where it is absent.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">AI-search visibility</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Assessment of your current citation profile across ChatGPT, Bing Copilot,
                  Google AI Overviews, and Perplexity for your five most commercially important
                  queries. Entity coverage, schema quality, and Speakable implementation
                  reviewed. Clients have found us through AI search, so this section reflects
                  real-world methodology.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">Prioritised action plan</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Every finding is scored on a two-axis matrix: effort to implement versus
                  expected revenue impact. The output is a ranked action list you can hand
                  directly to a developer or work through yourself. The walkthrough call covers
                  the top ten items in detail.
                </p>
              </div>
              <div className="rounded-xl border border-brand/20 bg-brand/[0.04] p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">The 45-minute walkthrough call</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Scheduled after delivery. I run through findings live on screen, answer
                  questions, and confirm implementation priorities. You leave with a clear first
                  30 days of work.
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
                The audit is a diagnostic, not an implementation. It identifies and prioritises
                the issues. Fixing them is separate work. The walkthrough call will clarify
                what requires a developer, what you can handle yourself, and what an ongoing
                retainer would cover.
              </p>
              <p>
                The audit does not include content writing, link building, or ongoing
                monitoring. If the action plan reveals issues that need sustained attention,
                that conversation begins at the end of the walkthrough call.
              </p>
              <p>
                For sites with more than 500 indexed pages, please{" "}
                <Link href="/contact/" className="text-brand hover:underline">
                  get in touch before booking
                </Link>
                . Complex enterprise architectures may need a scoped discussion before the
                standard £495 fee applies.
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
                { label: "SEO Consulting", href: "/services/seo-consulting/" },
                { label: "Technical SEO Audit", href: "/services/technical-seo-audit/" },
                { label: "AI Search Optimisation", href: "/services/ai-search-optimisation/" },
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
          ctaTitle="Book Your Paid SEO Audit"
          ctaSubtitle="Tell me your site URL and your biggest organic traffic concern. I will come prepared with an initial view before we start."
        />

        <Footer />
      </main>
    </>
  );
}
