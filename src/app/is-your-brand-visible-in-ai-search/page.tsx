import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ServiceInlineForm } from "@/components/service-inline-form";
import { Breadcrumb } from "@/components/breadcrumb";
import { faqSchema, schemaGraph, breadcrumbSchema } from "@/lib/schema";
import AiVisibilityChecker from "@/app/tools/ai-visibility-checker/AiVisibilityChecker";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  EyeOff,
  FileSearch,
  BarChart3,
} from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "Is Your Brand Visible in AI Search? Free Check",
    description:
      "Find out in seconds whether ChatGPT, Perplexity and Google's AI Overviews can find, verify and cite your website. Free scored check, no signup required.",
    path: "/is-your-brand-visible-in-ai-search",
  });
}

const FAQS = [
  {
    q: "What does the free AI visibility check actually test?",
    a: "It checks four things: whether AI crawlers such as GPTBot, ClaudeBot and PerplexityBot can access your site, whether you have machine-readable identity data (structured data, entity markup), whether independent entity sources like Wikipedia or Wikidata recognise your brand, and whether your content is structured so an AI system can extract a clean answer from it.",
  },
  {
    q: "Is the free check the same as the paid audit?",
    a: "No. The free check reads publicly available signals in seconds: crawl access, schema, entity presence and page structure. The paid audit goes further by querying ChatGPT, Perplexity and Google's AI Overviews directly for your actual buying questions, measuring across repeated runs, and benchmarking you against named competitors.",
  },
  {
    q: "Why would my business be invisible to AI search even if it ranks well on Google?",
    a: "Ranking and being cited by AI systems are not the same thing. AI systems draw on a narrower set of sources than the full search results page, and lean heavily on structured data, entity signals and clean answer structure to decide what to cite. A site can rank on page one and still never appear in an AI answer if those signals are missing.",
  },
  {
    q: "What happens after I run the check?",
    a: "You get an instant scored report broken down by the four checks above, with specific recommendations for anything that failed. If you want the deeper version, book a free consultation and the paid audit or ongoing engagement will be discussed only if it fits.",
  },
];

const PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": JSON.parse(
    schemaGraph(
      faqSchema(FAQS),
      breadcrumbSchema([
        { name: "Home", url: "https://sunnypatel.co.uk/" },
        { name: "Is Your Brand Visible in AI Search", url: "https://sunnypatel.co.uk/is-your-brand-visible-in-ai-search/" },
      ])
    )
  )["@graph"],
};

const WARNING_SIGNS = [
  {
    icon: EyeOff,
    title: "Blocked by configuration",
    detail:
      "robots.txt often blocks GPTBot, ClaudeBot or other AI crawlers by default configuration, not by anyone's decision. If that is you, AI assistants cannot read your site at all.",
  },
  {
    icon: FileSearch,
    title: "No entity signals",
    detail:
      "AI systems lean on structured data to confirm who a business is before citing it. Missing or broken schema usually means a missing or wrong answer.",
  },
  {
    icon: BarChart3,
    title: "Ranking but not cited",
    detail:
      "Holding rankings while AI answers absorb the same queries is the clearest sign that being on page one no longer means being in the answer.",
  },
] as const;

export default function IsYourBrandVisiblePage() {
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
        <div className="relative overflow-hidden pb-8 pt-32">
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
                { label: "Is Your Brand Visible in AI Search" },
              ]}
            />

            <p className="mb-3 mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand">
              <Zap className="h-3 w-3" />
              Free, instant, no signup
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Is your brand visible in AI search?
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Enter your website below for a free, scored check of whether ChatGPT,
              Perplexity and Google&apos;s AI Overviews can find, verify and cite it.
              Results in seconds, no email required.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Free checker — primary CTA */}
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2 sm:p-4">
            <AiVisibilityChecker />
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-3xl px-6 py-12">

          {/* Why this matters */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Why AI visibility is a different question from ranking
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                A growing share of buying research starts inside AI assistants rather
                than a page of blue links. Those systems answer with a small number of
                cited sources, not the full results page you are used to competing on.
                Ranking well on Google does not guarantee you are one of the sources an
                AI system chooses to cite.
              </p>
              <p className="font-medium text-foreground">
                The check above tells you, in seconds, whether the basic technical and
                entity signals AI systems rely on are actually in place.
              </p>
            </div>
          </section>

          {/* Warning signs */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Three problems that show up again and again
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

          {/* What the free check covers */}
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              What the free check covers
            </h2>
            <ul className="space-y-3">
              {[
                "AI crawler access: whether GPTBot, ClaudeBot, PerplexityBot and Google-Extended can actually reach your pages",
                "Machine-readable identity: structured data, entity markup and sameAs corroboration links",
                "Entity presence: whether independent sources like Wikipedia or Wikidata recognise your brand",
                "Answerability: whether your content is structured so an AI system can extract a clean answer",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span className="text-base leading-relaxed text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Paid path, mentioned second */}
          <section className="mb-16">
            <h2
              className="mb-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              If you want to go further
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                The free check reads publicly available signals. It does not query
                ChatGPT, Perplexity or Google&apos;s AI Overviews with your actual buying
                questions, and it does not benchmark you against named competitors. That
                deeper work is what the{" "}
                <Link href="/ai-visibility/" className="text-brand hover:underline">
                  paid AI Visibility Audit
                </Link>{" "}
                covers, measured across repeated runs with the variance reported honestly
                rather than a single-run score. There is no pressure to move from the free
                check to the paid audit. Most businesses run the check first and decide
                from there.
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

        {/* Secondary CTA form, compact */}
        <div id="book" className="mx-auto max-w-lg px-6 pb-20">
          <ServiceInlineForm
            ctaTitle="Prefer to talk it through?"
            ctaSubtitle="Tell me your website and I will come back with an initial view before we speak."
            compact
          />
        </div>

        <Footer />
      </main>
    </>
  );
}
