import Link from "next/link";
import { ArrowRight, Search, Zap } from "lucide-react";

type OfferVariant = "ai-search";

const OFFERS: Record<
  OfferVariant,
  { eyebrow: string; heading: string; body: string }
> = {
  "ai-search": {
    eyebrow: "AI Visibility",
    heading: "Is AI search sending customers to you, or your competitors?",
    body: "You have just read the data: ChatGPT, Perplexity and Google AI Overviews are already answering your customers' questions. The audit shows exactly where your brand appears in AI answers, where it is missing, and the fixes that get you cited.",
  },
};

const OFFER_SLUGS: Record<string, OfferVariant> = {
  "google-open-knowledge-format": "ai-search",
  "ai-search-statistics": "ai-search",
};

export function offerVariantForSlug(slug: string): OfferVariant | null {
  return OFFER_SLUGS[slug] ?? null;
}

export function BlogContextualOffer({ variant }: { variant: OfferVariant }) {
  const offer = OFFERS[variant];

  return (
    <div className="my-12 overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] to-brand-deep/[0.04]">
      <div className="p-6 md:p-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">
          {offer.eyebrow}
        </span>
        <h3
          className="mb-2 mt-3 text-lg font-bold text-foreground md:text-xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          {offer.heading}
        </h3>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {offer.body}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Paid audit */}
          <Link
            href="/services/paid-seo-audit/"
            className="group flex flex-col rounded-xl border border-brand/25 bg-brand/[0.07] p-5 transition-colors hover:border-brand/50"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10">
                <Search className="h-4 w-4 text-brand" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                AI Visibility and SEO Audit
              </span>
            </div>
            <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
              Full technical, content and AI-visibility audit with a prioritised, revenue-first action plan and a 45-minute walkthrough call. Delivered in 5 working days.
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Get the £495 Audit
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Free grader */}
          <Link
            href="/tools/website-grader/"
            className="group flex flex-col rounded-xl border border-border bg-background/40 p-5 transition-colors hover:border-brand/40"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40">
                <Zap className="h-4 w-4 text-brand" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Not ready to spend? Start free
              </span>
            </div>
            <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
              Run your site through the free Website Grader for an instant SEO score: speed, meta, schema and content checks in about 30 seconds, no sign-up.
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Run Free Website Grader
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
