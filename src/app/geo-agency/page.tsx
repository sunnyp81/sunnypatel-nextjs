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
  CalendarDays,
  Shield,
  Sparkles,
  Clock,
  HelpCircle,
  Building2,
  UserCheck,
} from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "What Is a GEO Agency? AI Search Optimisation Explained",
    description:
      "What a GEO (Generative Engine Optimisation) agency actually does, what to ask before hiring one, and when a specialist consultant beats a generalist agency for AI search visibility.",
    path: "/geo-agency",
  });
}

const FAQS = [
  {
    q: "What is a GEO agency?",
    a: "GEO stands for Generative Engine Optimisation: the practice of making a website and brand more likely to be read, verified and cited by AI systems such as ChatGPT, Claude, Perplexity, Copilot and Google's AI Overviews. A GEO agency is a provider that runs this work, usually covering AI crawler access, structured data and entity signals, content restructuring for answer extraction, and measurement of citation frequency.",
  },
  {
    q: "Is GEO different from SEO?",
    a: "GEO builds on SEO rather than replacing it. Classic SEO still governs whether your pages get crawled and indexed at all. GEO adds the layer on top: whether AI systems, once they can read your content, choose to cite it. The technical foundations overlap heavily, but the content structure, entity signals and third-party citation work needed for GEO are a distinct skill set.",
  },
  {
    q: "What should I ask before hiring a GEO agency or consultant?",
    a: "Ask how they measure AI visibility (a single-run score is a red flag, since AI answers vary between runs), whether they can show their own results in this space rather than only client claims, what specifically they will change on your site and why, and whether their reporting distinguishes AI Overviews, ChatGPT, Perplexity and Copilot rather than lumping them into one number.",
  },
  {
    q: "Why would a specialist consultant beat a generalist agency for this work?",
    a: "GEO is new enough that most agencies are applying classic SEO reporting to it without adjusting the methodology. A specialist who has built and measured this work directly, on their own sites as well as client sites, is more likely to catch the details that decide whether AI systems cite you or a competitor. You also get the person doing the analysis on the call, not a summary relayed by an account manager.",
  },
  {
    q: "Do I need a full GEO agency retainer, or can I start smaller?",
    a: "Most businesses do not need an open-ended retainer to start. A fixed-fee audit that measures your current AI visibility, benchmarks you against competitors and hands over a prioritised plan is usually the better first step. You can then implement independently or bring in fractional support for execution.",
  },
];

const PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://sunnypatel.co.uk/geo-agency/#service",
      name: "GEO (Generative Engine Optimisation) Consulting",
      description:
        "Specialist Generative Engine Optimisation consulting for UK businesses: AI crawler access, structured data and entity signals, content restructuring, and citation measurement across ChatGPT, Claude, Perplexity, Copilot and Google AI Overviews.",
      url: "https://sunnypatel.co.uk/geo-agency/",
      provider: { "@id": "https://sunnypatel.co.uk/#person" },
      areaServed: { "@type": "Country", name: "United Kingdom" },
      serviceType: "Generative Engine Optimisation",
    },
    ...JSON.parse(
      schemaGraph(
        faqSchema(FAQS),
        breadcrumbSchema([
          { name: "Home", url: "https://sunnypatel.co.uk/" },
          { name: "GEO Agency", url: "https://sunnypatel.co.uk/geo-agency/" },
        ])
      )
    )["@graph"],
  ],
};

const TRUST_BADGES = [
  { icon: Sparkles, label: "Evidence-led methodology" },
  { icon: Shield, label: "No invented stats" },
  { icon: CalendarDays, label: "15+ years in search" },
  { icon: Clock, label: "Fixed-fee audit in 2 weeks" },
] as const;

const QUESTIONS_TO_ASK = [
  "How do you measure AI visibility, and do you report variance across repeated runs or just a single score?",
  "Can you show your own AI citation results, not only client claims I cannot verify?",
  "What specifically will you change on my site, and how does that map to how AI systems select sources?",
  "Do you report ChatGPT, Perplexity, Copilot and Google AI Overviews separately, or as one blended number?",
  "What happens to classic SEO rankings while this work is underway?",
] as const;

const AGENCY_VS_CONSULTANT = [
  {
    icon: Building2,
    title: "Generalist GEO agencies",
    detail:
      "Team capacity for high-volume work across many clients at once. Often applies existing SEO reporting frameworks to AI search with limited adjustment, and you work through an account manager rather than the person doing the analysis.",
  },
  {
    icon: UserCheck,
    title: "Specialist consultant",
    detail:
      "Direct access to the person measuring your AI visibility and writing your plan, with a methodology built specifically for how generative engines select and cite sources, not retrofitted from classic SEO.",
  },
] as const;

export default function GeoAgencyPage() {
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
                { label: "GEO Agency" },
              ]}
            />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand">
              GEO Explained
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              What is a GEO agency, and do you actually need one?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              GEO, Generative Engine Optimisation, is the work of making your business
              more likely to be read and cited by ChatGPT, Claude, Perplexity and
              Google&apos;s AI Overviews. Here is what the work actually involves, what
              to ask before hiring anyone, and how to decide between a generalist agency
              and a specialist consultant.
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
                <Link href="#book" className="gap-2">
                  Book a Consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GradientButton>
              <span className="text-sm text-muted-foreground/70">
                Free 30 minutes · no obligation
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-3xl px-6 py-12">

          {/* What a GEO agency does */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              What a GEO agency actually does
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                A GEO agency works on the same four things regardless of size: whether AI
                crawlers can technically access your site, whether your structured data
                and entity signals give AI systems enough to identify and verify who you
                are, whether your content is structured so an AI system can extract a
                clean answer from it, and which third-party sources these systems already
                cite in your market and whether you appear among them.
              </p>
              <p>
                The deliverable, whatever it is called, should be a measured baseline of
                your current AI visibility, a clear explanation of the gaps, and a
                prioritised plan. Anything that skips straight to a headline score without
                showing the underlying checks is not a full GEO audit.
              </p>
            </div>
          </section>

          {/* GEO vs SEO */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              GEO is not a replacement for SEO
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                GEO sits on top of SEO rather than instead of it. If Google or AI crawlers
                cannot index your pages in the first place, none of the entity and content
                work matters. Any agency or consultant proposing GEO work without first
                confirming your technical SEO foundation is skipping a step.
              </p>
              <p>
                Where GEO adds a genuinely separate layer is in content structure for
                answer extraction, entity and schema depth, and the third-party citation
                landscape AI systems draw from, none of which classic keyword-ranking SEO
                addresses directly.
              </p>
            </div>
          </section>

          {/* Questions to ask */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              What to ask before hiring a GEO agency
            </h2>
            <p className="mb-5 text-base leading-relaxed text-muted-foreground">
              These five questions separate providers who understand how generative
              engines actually select sources from providers repackaging SEO reporting
              under a new label.
            </p>
            <ul className="space-y-3">
              {QUESTIONS_TO_ASK.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span className="text-base leading-relaxed text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Agency vs consultant */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Specialist consultant or generalist agency?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {AGENCY_VS_CONSULTANT.map(({ icon: Icon, title, detail }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
                >
                  <Icon className="mb-3 h-5 w-5 text-brand" />
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Neither is automatically the right answer. A business needing high-volume
              content production across many markets may need agency capacity. A business
              needing a defensible, board-ready view of exactly where it stands and why
              usually gets there faster with a specialist who does the measurement
              personally.
            </p>
          </section>

          {/* Method */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              How this work is measured here
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                AI answers change between runs, so a single-run score is not a reliable
                basis for a business decision. Measurement in this work uses repeated
                runs and reports the variance, using sources whose terms actually permit
                that kind of measurement, rather than quoting one favourable result.
              </p>
              <p>
                Original research published in this space includes an audit of widely
                repeated AI-search statistics checked against their primary sources. Most
                did not hold up under that check. Every number used in client work is held
                to the same standard: sourced, dated and reproducible.
              </p>
            </div>
          </section>

          {/* Offer */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              The offer
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Most businesses start with the{" "}
                <Link href="/ai-visibility/" className="text-brand hover:underline">
                  AI Visibility Audit
                </Link>
                : fixed fee, measured across ChatGPT, Claude, Perplexity, Copilot and
                Google&apos;s AI Overviews, delivered in 2 weeks with a competitor
                benchmark and a plan you can implement yourself or hand to a fractional
                engagement. Read more about the consulting approach on the{" "}
                <Link href="/ai-visibility-consultant/" className="text-brand hover:underline">
                  AI visibility consultant
                </Link>{" "}
                page, or start with a{" "}
                <Link href="/is-your-brand-visible-in-ai-search/" className="text-brand hover:underline">
                  free AI visibility check
                </Link>{" "}
                if you are not ready to commit yet.
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
                { label: "AI Visibility Consultant", href: "/ai-visibility-consultant/" },
                { label: "AI Visibility Audit (£1,500)", href: "/ai-visibility/" },
                { label: "Free AI Visibility Check", href: "/is-your-brand-visible-in-ai-search/" },
                { label: "AI Search Optimisation", href: "/services/ai-search-optimisation/" },
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
            ctaTitle="Talk Through Your AI Visibility"
            ctaSubtitle="Tell me your company website and the market you compete in. I will come prepared with an initial view of how you currently appear to AI assistants."
          />
        </div>

        <Footer />
      </main>
    </>
  );
}
