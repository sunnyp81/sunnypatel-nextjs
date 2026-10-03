import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ServiceInlineForm } from "@/components/service-inline-form";
import { Breadcrumb } from "@/components/breadcrumb";
import { AiVisibilityProof } from "@/components/ai-visibility-proof";
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
  EyeOff,
  FileSearch,
  BarChart3,
} from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "AI Visibility Audit | £1,500 Fixed Fee",
    description:
      "Measure your business in sampled AI answers. AI visibility audit with competitor benchmark and 90-day plan. Fixed fee £1,500, delivered in 2 weeks.",
    path: "/ai-visibility",
  });
}

const FAQS = [
  {
    q: "What exactly do I receive?",
    a: "A written report covering agreed questions across available ChatGPT, Claude, Perplexity, Copilot and Google AI Overviews modes, a review of search access and business information, a benchmark against three agreed competitors, and a prioritised 90-day plan. Unavailable observations are labelled untested. A walkthrough call closes the audit.",
  },
  {
    q: "How is this different from the AI visibility tools we have seen?",
    a: "AI answers can change between runs. I use repeated observations and report their variation with the prompt set, dates and testing conditions. The technical findings and prioritised plan explain what the observations can and cannot establish. Measurement uses sources whose terms permit the agreed collection method.",
  },
  {
    q: "Why does AI visibility matter now?",
    a: "AI assistants can be part of a buyer's research. The audit checks whether your business is mentioned, whether a URL is cited and whether you are recommended for the agreed buyer questions. Those are separate observations. Search access problems can limit eligibility; a missing citation alone does not establish why a platform omitted you.",
  },
  {
    q: "Who is this for?",
    a: "Mid-size and large UK businesses in markets where buyers research before purchase: professional services, healthcare, finance, B2B and considered purchases. For smaller sites, the £495 SEO audit is usually the better fit.",
  },
  {
    q: "What happens after the audit?",
    a: "The £1,500 audit delivers the report, prioritised plan and walkthrough; implementation is a separate scope. Your team can carry out the plan. Fractional support starts from £1,500 per month with the audit fee credited against your first month and no minimum contract. Before starting, we agree the monthly delivery allowance, named tasks, content and development responsibilities, tool costs and approval process in writing. External coverage depends on editors and is not guaranteed.",
  },
  {
    q: "Can you build AI agents or automation for us?",
    a: "No. This service covers visibility, measurement and search strategy. If your project needs software implementation, I will say so plainly and point you to people who build that.",
  },
];

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://sunnypatel.co.uk/ai-visibility/#service",
      name: "AI Visibility Audit",
      description:
        "An audit of agreed buyer questions across available AI search modes, with search-access and business-information review, competitor benchmark and prioritised 90-day plan. Untested observations are labelled. Fixed fee £1,500, delivered in 2 weeks.",
      url: "https://sunnypatel.co.uk/ai-visibility/",
      provider: { "@id": "https://sunnypatel.co.uk/#person" },
      areaServed: { "@type": "Country", name: "United Kingdom" },
      offers: {
        "@type": "Offer",
        price: "1500",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: "https://sunnypatel.co.uk/ai-visibility/",
        description:
          "Fixed-fee AI visibility audit: agreed sampled observations across available AI search modes, search-access review, competitor benchmark and 90-day plan, delivered in 2 weeks with a walkthrough call.",
        seller: { "@id": "https://sunnypatel.co.uk/#person" },
      },
      serviceType: "AI Search Visibility Audit",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AI Visibility Audit Deliverables",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Agreed AI Search Observations (available modes, repeats and variation reported)" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Search Access and Technical Review" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Business Information and Matching Structured Data Review" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Competitor Benchmark (3 competitors)" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Prioritised 90-Day Plan" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Walkthrough Call" } },
        ],
      },
    },
    ...JSON.parse(
      schemaGraph(
        faqSchema(FAQS),
        breadcrumbSchema([
          { name: "Home", url: "https://sunnypatel.co.uk/" },
          { name: "AI Visibility Audit", url: "https://sunnypatel.co.uk/ai-visibility/" },
        ])
      )
    )["@graph"],
  ],
};

const TRUST_BADGES = [
  { icon: Sparkles, label: "£1,500 fixed fee" },
  { icon: Clock, label: "Delivered in 2 weeks" },
  { icon: Shield, label: "Fee credited to retainer" },
  { icon: CalendarDays, label: "15+ years in search" },
] as const;

const WHAT_YOU_GET = [
  "Agreed questions across available ChatGPT, Claude, Perplexity, Copilot and Google AI Overviews modes: repeated observations with dates and variation; unavailable observations labelled untested",
  "Search access review: relevant search crawler directives, indexation, firewall and CDN controls; training permissions checked separately",
  "Business information review: visible identity and supporting links, with any structured data checked against the page; no special AI schema required by Google",
  "Source analysis: which publications and pages AI assistants cite in your market, and whether you appear in them",
  "Benchmark against three competitors you choose",
  "Prioritised 90-day plan, scored by impact against effort, ready to hand to your team",
  "Walkthrough call to discuss the findings and plan",
];

const WARNING_SIGNS = [
  {
    icon: EyeOff,
    title: "Blocked by configuration",
    detail:
      "Search access and training permissions are different. OpenAI uses OAI-SearchBot for search and GPTBot for training. Blocking GPTBot alone does not opt a site out of ChatGPT search. I check the relevant search crawler, CDN and indexation controls for each platform.",
  },
  {
    icon: FileSearch,
    title: "Inconsistent business information",
    detail:
      "Conflicting business descriptions make your offer harder to verify. Structured data should match visible information. Google requires no special AI schema for AI Overviews or AI Mode; missing schema alone does not establish why an answer omitted your business.",
  },
  {
    icon: BarChart3,
    title: "Falling organic clicks",
    detail:
      "Stable rankings with falling clicks are a reason to investigate. AI answers are one possible explanation alongside demand, seasonality, query mix and other search-result changes. I compare matched periods and available evidence before assigning a cause.",
  },
];

export default function AiVisibilityPage() {
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
                { label: "AI Visibility Audit" },
              ]}
            />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand">
              AI Visibility
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              When AI answers questions in your market, is your business in the answer?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              AI assistants can be part of your buyers&apos; research. The AI Visibility
              Audit records how you appear in a defined sample of answers, investigates
              gaps, and prioritises what to test first. Evidence-led,
              delivered in 2 weeks.
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
                  Book the Audit: £1,500
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </GradientButton>
              <span className="text-sm text-muted-foreground/70">
                2 weeks · walkthrough included
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hairline dark:via-white/[0.08] to-transparent" />
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-3xl px-6 py-12">

          {/* Why now */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Questions to investigate before changing your strategy
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                A buyer may discover your page, see it cited as a source, or receive a
                recommendation of your business. Each is a different outcome. The audit
                records them separately for an agreed set of questions and markets.
              </p>
              <p>
                Search access, useful answers and verifiable business information are
                areas we can inspect. An assistant&apos;s selection process is not fully
                observable, so an omission cannot always be explained from your page alone.
              </p>
              <p className="font-medium text-foreground">
                The report separates observed results, technical findings and hypotheses
                that need testing. It does not promise recommendations or citations.
              </p>
            </div>
          </section>

          {/* Warning signs */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Three checks before assigning a cause
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {WARNING_SIGNS.map(({ icon: Icon, title, detail }) => (
                <div
                  key={title}
                  className="rounded-xl border border-hairline bg-wash dark:border-white/[0.08] dark:bg-white/[0.02] p-5"
                >
                  <Icon className="mb-3 h-5 w-5 text-brand" />
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Access guidance: <a href="https://developers.openai.com/api/docs/bots" className="text-brand underline">OpenAI crawler controls</a> and{" "}
              <a href="https://developers.google.com/search/docs/appearance/ai-features" className="text-brand underline">Google AI feature requirements</a>.
            </p>
          </section>

          {/* What you get */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              What the audit covers
            </h2>
            <ul className="space-y-3">
              {WHAT_YOU_GET.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span className="text-base leading-relaxed text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Method / credibility */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Measurement with clear methods and limitations
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                AI answers change between runs. Ask the same question twice and you can get
                two different lists. That is why I measure across repeated runs and report
                the variance alongside the questions, dates and testing conditions.
              </p>
              <p>
                I publish original research in this space, including an audit of 19 widely
                repeated AI-search statistics against their primary sources. Most did not
                survive the check. The same standard applies to every number in your
                report: verified, sourced, reproducible.
              </p>
              <p>
                I also run this playbook on my own portfolio of sites, several of which
                record assistant-attributed referral visits. The published research shows
                the sample, dates and limitations. It demonstrates measurement work;
                referral totals alone do not establish an intervention&apos;s effect on citations.
              </p>
            </div>
          </section>

          <AiVisibilityProof />

          {/* Price and path */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Simple pricing, no lock-in
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">
                AI Visibility Audit: £1,500 fixed fee, delivered in 2 weeks.
              </p>
              <p>
                The plan is yours to implement independently. If you want ongoing help,
                fractional support starts from £1,500 per month and the audit fee is
                credited against your first month. Running a smaller site? The{" "}
                <Link href="/services/paid-seo-audit/" className="text-brand hover:underline">
                  £495 SEO audit
                </Link>{" "}
                is probably the better fit.
              </p>
              <p>
                The audit includes the report, plan and walkthrough. Website changes,
                content production and external coverage are separate scopes. Before
                fractional work starts, we agree the delivery allowance, tasks, owners,
                additional costs and approval process in writing. Neither fee guarantees
                that an assistant will cite or recommend your business.
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
                { label: "AI Visibility Results", href: "/ai-visibility-results/" },
                { label: "Free AI Visibility Checker", href: "/tools/ai-visibility-checker/" },
                { label: "AI Search Optimisation", href: "/services/ai-search-optimisation/" },
                { label: "Paid SEO Audit (£495)", href: "/services/paid-seo-audit/" },
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
            ctaTitle="Book Your AI Visibility Audit"
            ctaSubtitle="Tell me your company website and the market you compete in. I will come prepared with an initial view of how you currently appear to AI assistants."
          />
        </div>

        <Footer />
      </main>
    </>
  );
}
