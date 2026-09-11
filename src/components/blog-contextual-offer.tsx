import Link from "next/link";
import {
  ArrowRight,
  Search,
  MapPin,
  Building2,
  Calculator,
  BarChart3,
  Sparkles,
} from "lucide-react";

type OfferVariant =
  | "ai-search"
  | "geo-evaluation"
  | "local-business"
  | "benchmark-yourself";

type OfferCard = {
  href: string;
  offerId: string;
  icon: typeof Search;
  title: string;
  body: string;
  cta: string;
  variant: "primary" | "secondary";
};

type Offer = {
  eyebrow: string;
  heading: string;
  body: string;
  cards: [OfferCard, OfferCard];
};

const OFFERS: Record<OfferVariant, Offer> = {
  "geo-evaluation": {
    eyebrow: "Choosing a GEO provider",
    heading:
      "See what a GEO specialist would change on your site before you shortlist anyone",
    body: "The £495 audit includes an AI-visibility assessment as one of its core sections, plus a 45-minute call to walk through the findings. The AI Visibility Results page shows the measured AI-referral data from my own portfolio.",
    cards: [
      {
        href: "/services/paid-seo-audit/#book",
        offerId: "geo_agency_evaluation_audit",
        icon: Search,
        title: "£495 SEO Audit",
        body: "Technical SEO, content and AI-visibility review, prioritised action plan, and a 45-minute walkthrough call. Delivered in 5 working days.",
        cta: "Get the £495 Audit",
        variant: "primary",
      },
      {
        href: "/ai-visibility-results/",
        offerId: "geo_agency_evaluation_proof",
        icon: BarChart3,
        title: "See the measured data first",
        body: "Real ChatGPT, Perplexity and Copilot referral sessions from my own portfolio, labelled by sector and cross-checked against Search Console.",
        cta: "View AI Visibility Results",
        variant: "secondary",
      },
    ],
  },
  "local-business": {
    eyebrow: "Local SEO",
    heading: "Turn these benchmarks into a plan for your business",
    body: "A Reading professional services firm went from 180 to 620 organic visits a month using the same approach, with enquiries from organic tripling in 9 months. Start with a free 20-minute diagnosis of your biggest local search problem, or see the full local SEO service.",
    cards: [
      {
        href: "/contact/",
        offerId: "local_seo_diagnosis",
        icon: MapPin,
        title: "Free 20-minute diagnosis",
        body: "Tell me your biggest local search problem and I'll focus the call on the most useful next step for your business.",
        cta: "Request Free Diagnosis",
        variant: "primary",
      },
      {
        href: "/services/local-seo/",
        offerId: "local_seo_service_page",
        icon: Building2,
        title: "See the local SEO service",
        body: "Google Business Profile optimisation, citation building and location page strategy for turning local visibility into enquiries.",
        cta: "View Local SEO Service",
        variant: "secondary",
      },
    ],
  },
  "benchmark-yourself": {
    eyebrow: "Benchmark your own numbers",
    heading: "Put your own numbers against these benchmarks",
    body: "These statistics show the market. The next step is checking where your own site sits against them. Run your numbers through the free ROI calculator, or get the £495 audit for a full diagnosis of what is holding you back.",
    cards: [
      {
        href: "/tools/seo-roi-calculator/",
        offerId: "uk_benchmark_roi_calculator",
        icon: Calculator,
        title: "Forecast your SEO returns",
        body: "Enter your search volume, current ranking and deal value to forecast clicks, leads, revenue and payback.",
        cta: "Run the ROI Calculator",
        variant: "primary",
      },
      {
        href: "/services/paid-seo-audit/#book",
        offerId: "uk_benchmark_audit",
        icon: Search,
        title: "£495 SEO Audit",
        body: "Full technical, content and AI-visibility audit with a prioritised action plan and a 45-minute walkthrough call.",
        cta: "Get the £495 Audit",
        variant: "secondary",
      },
    ],
  },
  "ai-search": {
    eyebrow: "AI Visibility",
    heading: "Is AI search sending customers to you, or your competitors?",
    body: "The £495 SEO audit includes an AI-visibility assessment as one of its core sections, alongside technical SEO and content. The £1,500 AI Visibility Audit is the deeper standalone product, measuring citation presence and entity coverage across ChatGPT, Copilot, AI Overviews and Perplexity in detail.",
    cards: [
      {
        href: "/services/paid-seo-audit/#book",
        offerId: "ai_search_stats_audit",
        icon: Search,
        title: "£495 SEO Audit",
        body: "Technical, content and AI-visibility review in one fixed-fee audit, with a prioritised action plan and a 45-minute walkthrough call.",
        cta: "Get the £495 Audit",
        variant: "primary",
      },
      {
        href: "/ai-visibility/",
        offerId: "ai_search_stats_deep_audit",
        icon: Sparkles,
        title: "Need the deeper AI Visibility Audit?",
        body: "A standalone £1,500 fixed-fee audit measuring citation presence, entity coverage and schema quality across ChatGPT, Copilot, AI Overviews and Perplexity.",
        cta: "See the AI Visibility Audit",
        variant: "secondary",
      },
    ],
  },
};

const OFFER_SLUGS: Record<string, OfferVariant> = {
  "google-open-knowledge-format": "ai-search",
  "ai-search-statistics": "ai-search",
  "top-geo-agencies": "geo-evaluation",
  "local-seo-statistics": "local-business",
  "seo-statistics-uk": "benchmark-yourself",
};

export function offerVariantForSlug(slug: string): OfferVariant | null {
  return OFFER_SLUGS[slug] ?? null;
}

export function BlogContextualOffer({ variant }: { variant: OfferVariant }) {
  const offer = OFFERS[variant];
  const [primary, secondary] = offer.cards;

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
          {[primary, secondary].map((card) => {
            const Icon = card.icon;
            const isPrimary = card.variant === "primary";
            return (
              <Link
                key={card.offerId}
                href={card.href}
                data-cta-offer={card.offerId}
                className={
                  isPrimary
                    ? "group flex flex-col rounded-xl border border-brand/25 bg-brand/[0.07] p-5 transition-colors hover:border-brand/50"
                    : "group flex flex-col rounded-xl border border-border bg-background/40 p-5 transition-colors hover:border-brand/40"
                }
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={
                      isPrimary
                        ? "flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10"
                        : "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40"
                    }
                  >
                    <Icon className="h-4 w-4 text-brand" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {card.title}
                  </span>
                </div>
                <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
                <span
                  className={
                    isPrimary
                      ? "inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
                      : "inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
                  }
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {card.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
