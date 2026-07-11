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
  EyeOff,
  FileSearch,
  BarChart3,
} from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "AI Visibility Audit | Board-Ready, £1,500 Fixed Fee",
    description:
      "Find out exactly how your business appears to ChatGPT, Claude, Perplexity and Google's AI Overviews. Board-ready AI visibility audit with competitor benchmark and 90-day plan. Fixed fee £1,500, delivered in 2 weeks.",
    path: "/ai-visibility",
  });
}

const FAQS = [
  {
    q: "What exactly do I receive?",
    a: "A board-ready written report covering how your brand appears across ChatGPT, Claude, Perplexity, Copilot and Google's AI Overviews, a technical access audit (AI crawler permissions, structured data, entity signals), a benchmark against three competitors you choose, and a prioritised 90-day plan. It closes with a walkthrough call for you or your leadership team.",
  },
  {
    q: "How is this different from the AI visibility tools we have seen?",
    a: "Most tools quote a single-run score. AI answers change between runs, so a single-run number is noise. I measure across repeated runs and report the variance honestly, using measurement sources whose terms actually permit it. You get numbers you can defend in a board meeting.",
  },
  {
    q: "Why does AI visibility matter now?",
    a: "A growing share of buying research starts inside AI assistants and AI Overviews rather than a list of blue links. If your site blocks AI crawlers, lacks entity data, or is absent from cited sources, you are invisible in those answers while competitors are quoted. Many businesses are blocking AI systems by configuration without knowing it.",
  },
  {
    q: "Who is this for?",
    a: "Mid-size and large UK businesses in markets where buyers research before purchase: professional services, healthcare, finance, B2B and considered purchases. For smaller sites, the £495 SEO audit is usually the better fit.",
  },
  {
    q: "What happens after the audit?",
    a: "The plan is yours to implement with your own team. If you want ongoing help, I offer fractional support from £1,500 per month, and the audit fee is credited against your first month. No minimum contract.",
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
        "A board-ready audit of how a business appears to ChatGPT, Claude, Perplexity, Copilot and Google's AI Overviews, with a competitor benchmark and a prioritised 90-day plan. Fixed fee £1,500, delivered in 2 weeks.",
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
          "Fixed-fee AI visibility audit: engine-by-engine presence measurement, technical access audit, competitor benchmark and 90-day plan, delivered in 2 weeks with a leadership walkthrough call.",
        seller: { "@id": "https://sunnypatel.co.uk/#person" },
      },
      serviceType: "AI Search Visibility Audit",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AI Visibility Audit Deliverables",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Assistant Presence Measurement (repeated runs, variance reported)" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Crawler and Technical Access Audit" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Entity and Structured Data Review" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Competitor Benchmark (3 competitors)" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Prioritised 90-Day Plan" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Leadership Walkthrough Call" } },
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
  "Engine-by-engine presence measurement: ChatGPT, Claude, Perplexity, Copilot and Google's AI Overviews, measured across repeated runs with variance reported",
  "Technical access audit: whether your robots.txt, firewall or CDN is blocking AI crawlers, and what they can actually read",
  "Entity and structured data review: Organization schema, sameAs, knowledge graph and citation signals",
  "Source analysis: which publications and pages AI assistants cite in your market, and whether you appear in them",
  "Benchmark against three competitors you choose",
  "Prioritised 90-day plan, scored by impact against effort, ready to hand to your team",
  "Walkthrough call with you or your leadership team",
];

const WARNING_SIGNS = [
  {
    icon: EyeOff,
    title: "Blocked by configuration",
    detail:
      "Many businesses block GPTBot, ClaudeBot and other AI crawlers in robots.txt without anyone deciding to. If that is you, AI assistants cannot read or cite your site at all.",
  },
  {
    icon: FileSearch,
    title: "No entity signals",
    detail:
      "AI systems lean on structured data and consistent entity signals to confirm who a business is before citing it. Missing or broken schema means a confused or absent answer.",
  },
  {
    icon: BarChart3,
    title: "Falling organic clicks",
    detail:
      "Rankings holding but clicks sliding is the classic sign that AI answers are absorbing your queries. The fix is being in the answer, not just under it.",
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
              Your buyers now ask ChatGPT, Claude and Google before they ever see your
              website. The AI Visibility Audit shows you exactly how you appear in those
              answers, why, and what to fix first. Board-ready, evidence-led, delivered in
              2 weeks.
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
                2 weeks · leadership walkthrough included
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-3xl px-6 py-12">

          {/* Why now */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              The visibility shift your board is already asking about
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                A growing share of buying research now starts inside AI assistants and
                Google&apos;s AI Overviews. Those systems answer with a handful of cited
                sources. Either your business is one of them, or a competitor is.
              </p>
              <p>
                Most businesses have never checked. Some are actively blocking AI systems
                in their own configuration without anyone having decided to. Others rank
                well in classic search yet never get cited, because the signals AI systems
                rely on are missing.
              </p>
              <p className="font-medium text-foreground">
                This audit replaces guesswork with measured evidence: how you appear, why,
                and the shortest path to appearing more.
              </p>
            </div>
          </section>

          {/* Warning signs */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Three problems I find again and again
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {WARNING_SIGNS.map(({ icon: Icon, title, detail }) => (
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
              Measurement you can defend in a board meeting
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                AI answers change between runs. Ask the same question twice and you can get
                two different lists. That is why I measure across repeated runs and report
                the variance, rather than quoting a single-run score the way most tools do.
              </p>
              <p>
                I publish original research in this space, including an audit of 19 widely
                repeated AI-search statistics against their primary sources. Most did not
                survive the check. The same standard applies to every number in your
                report: verified, sourced, reproducible.
              </p>
              <p>
                I also run this playbook on my own portfolio of sites, several of which
                earn measurable referral traffic from AI assistants today. You are buying a
                method that is already working, not a theory.
              </p>
            </div>
          </section>

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
                { label: "Free AI Visibility Checker", href: "/tools/ai-visibility-checker/" },
                { label: "AI Search Optimisation", href: "/services/ai-search-optimisation/" },
                { label: "Paid SEO Audit (£495)", href: "/services/paid-seo-audit/" },
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
            ctaTitle="Book Your AI Visibility Audit"
            ctaSubtitle="Tell me your company website and the market you compete in. I will come prepared with an initial view of how you currently appear to AI assistants."
          />
        </div>

        <Footer />
      </main>
    </>
  );
}
