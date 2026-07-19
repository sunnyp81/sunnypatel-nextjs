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
  Users,
  Target,
  ScrollText,
} from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "AI Visibility Consultant UK | Evidence-Led AI Search Strategy",
    description:
      "Independent AI visibility consultant for UK businesses. Evidence-led AI search strategy, honest measurement across ChatGPT, Perplexity and Google AI Overviews, no invented stats. Fixed-fee audit or fractional support.",
    path: "/ai-visibility-consultant",
  });
}

const FAQS = [
  {
    q: "What does an AI visibility consultant actually do?",
    a: "An AI visibility consultant measures how a business currently appears when people ask ChatGPT, Claude, Perplexity or Google's AI Overviews questions in its market, identifies the technical and entity gaps stopping it being cited, and builds a plan to close them. That covers AI crawler access, structured data, entity signals and the third-party sources these systems actually cite from.",
  },
  {
    q: "Who is this for?",
    a: "Marketing leads and founders at mid-size and large UK businesses in markets where buyers research before they purchase: professional services, B2B, SaaS, finance and healthcare. If you run a small local business, the £495 SEO audit is usually the better starting point.",
  },
  {
    q: "How is this different from an AI visibility tool or checker?",
    a: "Free and low-cost checkers return a single-run score. AI answers vary between runs, so a single number is noise dressed up as a metric. Consulting engagements here measure across repeated runs and report the variance honestly, and go further than any automated tool by reviewing the technical access, entity data and citation sources behind the numbers.",
  },
  {
    q: "What do I get that a generalist SEO agency does not offer?",
    a: "Direct senior access with no account management layer, and a methodology built specifically around how AI systems select and cite sources, not classic ranking factors alone. Every claim in a report is sourced and reproducible. If a project needs software or agent implementation rather than visibility and search strategy, that gets said plainly rather than sold.",
  },
  {
    q: "What does an engagement look like?",
    a: "Most businesses start with the fixed-fee AI Visibility Audit: a board-ready measurement of current AI presence, a technical and entity review, a competitor benchmark, and a prioritised plan, delivered in 2 weeks. From there, some businesses implement independently and some move to fractional support to execute the plan.",
  },
  {
    q: "Do you work with agencies or as a sub-contractor?",
    a: "Yes. Some engagements come through agencies that need specialist AI search expertise for a client without building the capability in-house. Get in touch to discuss scope.",
  },
];

const PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://sunnypatel.co.uk/ai-visibility-consultant/#service",
      name: "AI Visibility Consulting",
      description:
        "Independent AI visibility consulting for UK businesses: evidence-led measurement of AI search presence across ChatGPT, Claude, Perplexity and Google AI Overviews, technical and entity review, and a prioritised plan.",
      url: "https://sunnypatel.co.uk/ai-visibility-consultant/",
      provider: { "@id": "https://sunnypatel.co.uk/#person" },
      areaServed: { "@type": "Country", name: "United Kingdom" },
      serviceType: "AI Search Visibility Consulting",
    },
    ...JSON.parse(
      schemaGraph(
        faqSchema(FAQS),
        breadcrumbSchema([
          { name: "Home", url: "https://sunnypatel.co.uk/" },
          { name: "AI Visibility Consultant", url: "https://sunnypatel.co.uk/ai-visibility-consultant/" },
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

const WHO_FOR = [
  "Marketing leads at mid-size and large UK businesses who need a defensible answer on AI search presence, not a vibe",
  "Founders in considered-purchase markets, professional services, B2B, SaaS, finance and healthcare, where buyers research before they contact you",
  "In-house teams who already run SEO and want a specialist to extend that work into AI search without hiring full time",
  "Agencies that need AI visibility expertise for a client engagement without building the capability internally",
] as const;

const DIFFERENTIATORS = [
  {
    icon: Target,
    title: "Versus DIY tools",
    detail:
      "Free checkers give you a single-run score and stop there. This work measures across repeated runs, reports the variance, and explains why a result changed, then fixes the technical and entity gaps causing it.",
  },
  {
    icon: Users,
    title: "Versus a generalist agency",
    detail:
      "Most agencies retrofit classic SEO reporting onto AI search and call it done. This is a specialist methodology built around how AI systems select and cite sources, delivered by the person doing the work, not relayed through an account manager.",
  },
  {
    icon: ScrollText,
    title: "Versus consultants who quote AI stats you can't verify",
    detail:
      "Every number in a report is sourced and reproducible. If a claim would not survive a primary-source check, it does not appear. This is a documented standard, applied consistently, not a promise.",
  },
] as const;

export default function AiVisibilityConsultantPage() {
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
                { label: "AI Visibility Consultant" },
              ]}
            />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand">
              AI Visibility Consulting
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              An AI visibility consultant who shows you the evidence, not a score
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Independent AI search consulting for UK businesses: how you appear to
              ChatGPT, Claude, Perplexity and Google&apos;s AI Overviews, measured
              honestly and explained clearly, with a plan you can hand to your own team
              or have built for you.
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

          {/* What this is */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              What an AI visibility consultant does
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                An AI visibility consultant measures how your business currently appears
                when people ask ChatGPT, Claude, Perplexity or Google&apos;s AI Overviews
                questions in your market, then works out why. That means checking whether
                AI crawlers can actually read your site, whether your structured data and
                entity signals give AI systems enough to verify who you are, and which
                third-party sources these systems cite from in your category.
              </p>
              <p>
                The output is not a single score. It is a documented, evidence-based view
                of where you stand and a prioritised path to appearing more often, built
                by someone who does the measurement and the fix, not a team relaying it
                through account management layers.
              </p>
            </div>
          </section>

          {/* Who it's for */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Who this is for
            </h2>
            <p className="mb-5 text-base leading-relaxed text-muted-foreground">
              This work suits businesses where the buying journey involves research, not
              impulse purchase, and where being absent from an AI answer means a
              competitor gets the enquiry instead.
            </p>
            <ul className="space-y-3">
              {WHO_FOR.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span className="text-base leading-relaxed text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Differentiation */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              How this is different
            </h2>
            <div className="grid gap-4 sm:grid-cols-1">
              {DIFFERENTIATORS.map(({ icon: Icon, title, detail }) => (
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
          </section>

          {/* Method */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Measurement built to be checked, not taken on trust
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                AI answers are not fixed. Ask the same question of the same assistant
                twice and the cited sources can change. Treating one run as a fact is the
                single biggest mistake in this category, and it is how most AI visibility
                tools present their scores. Measurement here uses repeated runs and
                reports the variance, so any number you see reflects what actually
                happens, not a lucky screenshot.
              </p>
              <p>
                Original research published on this methodology includes an audit of
                widely repeated AI-search statistics checked against their primary
                sources, most of which did not hold up. The same bar applies to every
                figure used in client work: sourced, dated, and reproducible, or it does
                not appear in the report.
              </p>
            </div>
          </section>

          {/* Path / offer */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              How to start
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Most engagements start with the{" "}
                <Link href="/ai-visibility/" className="text-brand hover:underline">
                  AI Visibility Audit
                </Link>
                : a fixed-fee, board-ready measurement of your current AI search
                presence, delivered in 2 weeks with a leadership walkthrough call. From
                there, the plan is yours to implement, or fractional support is available
                to carry it out.
              </p>
              <p>
                Not sure an audit is the right first step? The{" "}
                <Link href="/is-your-brand-visible-in-ai-search/" className="text-brand hover:underline">
                  free AI visibility check
                </Link>{" "}
                is a lower-commitment starting point, and running a smaller business, the{" "}
                <Link href="/services/paid-seo-audit/" className="text-brand hover:underline">
                  £495 SEO audit
                </Link>{" "}
                is usually the better fit than a full AI visibility engagement.
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
                { label: "Free AI Visibility Check", href: "/is-your-brand-visible-in-ai-search/" },
                { label: "What Is a GEO Agency?", href: "/geo-agency/" },
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
            ctaTitle="Book Your AI Visibility Consultation"
            ctaSubtitle="Tell me your company website and the market you compete in. I will come prepared with an initial view of how you currently appear to AI assistants."
          />
        </div>

        <Footer />
      </main>
    </>
  );
}
