import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { serviceSchema, breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { RelatedServices } from "@/components/related-services";
import { TestimonialGrid } from "@/components/services/TestimonialGrid";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { RiskReversal } from "@/components/services/RiskReversal";
import { WhoForGrid } from "@/components/services/WhoForGrid";
import { CitationChecklist } from "@/components/services/CitationChecklist";
import { CaseStudyCard } from "@/components/services/CaseStudyCard";
import { StatsBar } from "@/components/services/StatsBar";
import { CoverageMap } from "@/components/services/CoverageMap";
import { ServiceMiniCta } from "@/components/services/ServiceMiniCta";
import { GlowProcess, GlowProcessStep } from "@/components/glow/glow-blocks";
import { markdocConfig, MarkdocImage, MarkdocTable } from "@/lib/render-markdoc";
import { ServiceOfferExamples } from "@/components/service-offer-examples";
import { ServiceInlineForm } from "@/components/service-inline-form";


/* ── Conversion data ──────────────────────────────────────── */

const GENERIC_DATA = {
  accent: "var(--brand-ink)",
  testimonials: [
    {
      quote:
        "The SEO work delivered real results \u2014 I\u2019m seeing more clicks compared to this time last year in Google Analytics, without having to spend loads on advertising. Super impressed.",
      name: "Dr Shaan Patel",
      role: "Founder, Aatma Aesthetics",
      location: "UK",
    },
    {
      quote:
        "Before working with Sunny, we were getting around 180 organic visits a month. Nine months later we\u2019re at 620 and enquiries from organic have tripled.",
      name: "James W.",
      role: "Director",
      location: "Reading",
    },
    {
      quote:
        "We went from invisible in local pack to ranking in the top 3 for our main service terms within 5 months. The increase in enquiry rate was roughly 3\u00d7.",
      name: "Sarah M.",
      role: "Partner, professional services firm",
      location: "Berkshire",
    },
    {
      quote:
        "Sunny\u2019s topical map approach was unlike any other SEO work we\u2019d had before. Within 6 months we were ranking for terms we\u2019d never appeared for.",
      name: "Tom B.",
      role: "MD, SaaS company",
      location: "Thames Valley",
    },
    {
      quote:
        "The monthly reporting is clear, honest and always tied to actual business outcomes \u2014 not just vanity metrics.",
      name: "Claire H.",
      role: "Director, e-commerce brand",
      location: "Reading",
    },
  ],
  caseStudies: [
    {
      industry: "SaaS",
      challenge: "180 organic visits/mo, no topical authority in a competitive market",
      result: "620 visits/mo with 3\u00d7 enquiry rate through topical map and content strategy",
      metric: "+244% organic traffic",
      timeline: "9 months",
      accentColor: "var(--brand-ink)",
    },
    {
      industry: "Professional Services",
      challenge: "Not appearing in local pack for core service queries",
      result: "Top-3 local pack positions for main service terms, 3\u00d7 monthly enquiries",
      metric: "3\u00d7 monthly enquiries",
      timeline: "6 months",
      accentColor: "var(--brand-ink)",
    },
  ],
  timeline: [
    {
      phase: "Week 1",
      label: "Discovery & audit",
      description: "Site health, competitor landscape, keyword opportunity mapping",
    },
    {
      phase: "Weeks 2\u20134",
      label: "Strategy & quick wins",
      description: "Prioritised fixes live, 12-month content plan drafted",
    },
    {
      phase: "Month 2\u20133",
      label: "Core implementation",
      description: "Cornerstone pages and supporting content published",
    },
    {
      phase: "Month 4\u20136",
      label: "Review and refine",
      description: "Review query coverage, clicks and implementation priorities",
    },
    {
      phase: "Month 7+",
      label: "Ongoing measurement",
      description: "Review measured outcomes and adjust the content plan",
    },
  ],
  riskPoints: [
    "No minimum contract \u2014 monthly rolling, cancel with 30 days notice",
    "You own everything \u2014 all content, data, and account access are yours from day one",
    "Monthly reporting \u2014 traffic, rankings, and milestone progress every month",
  ],
  yesFor: [
    "Businesses wanting sustainable organic traffic and enquiry growth",
    "Professional services, SaaS, and local businesses with an existing web presence",
    "Founders who want transparent, data-backed reporting",
    "Companies with a 6\u201312 month growth horizon",
  ],
  noFor: [
    "Businesses expecting top rankings within 4\u20136 weeks",
    "New sites with fewer than 10 pages of content",
    "Companies with no capacity to publish or update content",
  ],
  ctaTitle: "Ready to grow your organic traffic?",
  ctaSubtitle:
    "Get in touch for a free assessment of where your SEO stands and what to prioritise — no obligation.",
};

const SEO_READING_DATA = {
  accent: "var(--brand-ink)",
  testimonials: [
    {
      quote:
        "Before working with Sunny, we were getting around 180 organic visits a month. Nine months later we\u2019re at 620 and enquiries from organic have tripled.",
      name: "James W.",
      role: "Director",
      location: "Reading",
    },
    {
      quote:
        "We went from invisible in local pack to ranking in the top 3 for our main service terms in Reading within 5 months. The increase in enquiry rate was roughly 3\u00d7.",
      name: "Sarah M.",
      role: "Partner, professional services firm",
      location: "Berkshire",
    },
    {
      quote:
        "Sunny\u2019s topical map approach was unlike any other SEO work we\u2019d had before. Within 6 months we were ranking for terms we\u2019d never appeared for.",
      name: "Tom B.",
      role: "MD, SaaS company",
      location: "Thames Valley",
    },
    {
      quote:
        "The monthly reporting is clear, honest and always tied to actual business outcomes \u2014 not just vanity metrics.",
      name: "Claire H.",
      role: "Director, e-commerce brand",
      location: "Reading",
    },
  ],
  caseStudies: [
    {
      industry: "SaaS",
      challenge: "180 organic visits/mo, no topical authority in a competitive Reading market",
      result: "620 visits/mo with 3\u00d7 enquiry rate through topical map and content strategy",
      metric: "+244% organic traffic",
      timeline: "9 months",
      accentColor: "var(--brand-ink)",
    },
    {
      industry: "Professional Services",
      challenge: "Not appearing in local pack for core service queries across Berkshire",
      result: "Top-3 local pack positions for main service terms, 3\u00d7 monthly enquiries",
      metric: "3\u00d7 monthly enquiries",
      timeline: "6 months",
      accentColor: "var(--brand-ink)",
    },
  ],
  timeline: [
    {
      phase: "Week 1",
      label: "Technical audit + discovery",
      description: "Site health, competitor map, keyword opportunity sizing",
    },
    {
      phase: "Weeks 2\u20134",
      label: "Technical fixes + content plan",
      description: "Prioritised fixes live, 12-month topical map drafted",
    },
    {
      phase: "Month 2\u20133",
      label: "Topical content live",
      description: "Cornerstone pages and supporting content published",
    },
    {
      phase: "Month 4\u20136",
      label: "Review and refine",
      description: "Review local query coverage, clicks and recorded enquiries",
    },
    {
      phase: "Month 7\u20139+",
      label: "Ongoing measurement",
      description: "Review measured outcomes and adjust the content plan",
    },
  ],
  riskPoints: [
    "No minimum contract \u2014 monthly rolling, cancel with 30 days notice",
    "You own everything \u2014 all content, data, and account access are yours from day one",
    "Monthly reporting \u2014 traffic, rankings, local visibility, and milestone progress",
  ],
  yesFor: [
    "Berkshire and Reading local businesses wanting more enquiries",
    "Professional services (law, finance, healthcare, consulting)",
    "Businesses with a 6\u201312 month growth horizon",
    "Founders who want transparency and measurable results",
  ],
  noFor: [
    "Businesses expecting first-page rankings in 4\u20136 weeks",
    "E-commerce stores with sub-12-month commitment windows",
    "Sites with fewer than 10 existing pages of content",
  ],
  ctaTitle: "Stop losing Reading customers to competitors who rank above you",
  ctaSubtitle:
    "Send me your site for a free 20-minute SEO diagnosis. We will discuss your biggest search problem and the next useful step. A full audit and written action plan are separate paid work.",
};

const SEO_LONDON_DATA = {
  accent: "var(--brand-ink)",
  testimonials: [
    {
      quote:
        "Before working with Sunny, we were getting around 180 organic visits a month. Nine months later we\u2019re at 620 and enquiries from organic have tripled.",
      name: "James W.",
      role: "Director",
      location: "London",
    },
    {
      quote:
        "Sunny\u2019s topical map approach was unlike any other SEO work we\u2019d had before. Within 6 months we were ranking for terms we\u2019d never appeared for.",
      name: "Tom B.",
      role: "MD, SaaS company",
      location: "London",
    },
    {
      quote:
        "The SEO work delivered real results \u2014 I\u2019m seeing more clicks compared to this time last year without having to spend loads on advertising.",
      name: "Dr Shaan Patel",
      role: "Founder, Aatma Aesthetics",
      location: "UK",
    },
    {
      quote:
        "The monthly reporting is clear, honest and always tied to actual business outcomes \u2014 not just vanity metrics.",
      name: "Claire H.",
      role: "Director, e-commerce brand",
      location: "London",
    },
  ],
  caseStudies: [
    {
      industry: "SaaS",
      challenge: "180 organic visits/mo, no topical authority in a competitive London market",
      result: "620 visits/mo with 3\u00d7 enquiry rate through topical map and content strategy",
      metric: "+244% organic traffic",
      timeline: "9 months",
      accentColor: "var(--brand-ink)",
    },
    {
      industry: "Professional Services",
      challenge: "Invisible in competitive London search results despite good content",
      result: "Page-one positions across core service queries, sustained month-on-month growth",
      metric: "3\u00d7 monthly enquiries",
      timeline: "7 months",
      accentColor: "var(--brand-ink)",
    },
  ],
  timeline: [
    {
      phase: "Week 1",
      label: "Technical audit + discovery",
      description: "Site health, London competitor landscape, keyword opportunity sizing",
    },
    {
      phase: "Weeks 2\u20134",
      label: "Technical fixes + content plan",
      description: "Priority fixes live, 12-month topical map drafted for your market",
    },
    {
      phase: "Month 2\u20133",
      label: "Topical content live",
      description: "Cornerstone pages and supporting content published",
    },
    {
      phase: "Month 4\u20136",
      label: "Review and refine",
      description: "Review query coverage, clicks and implementation priorities",
    },
    {
      phase: "Month 7\u201312+",
      label: "Ongoing measurement",
      description: "Review London query coverage and adjust the content plan",
    },
  ],
  riskPoints: [
    "No minimum contract \u2014 monthly rolling, cancel with 30 days notice",
    "You own everything \u2014 all content, data, and account access are yours from day one",
    "Monthly reporting \u2014 traffic, rankings, and milestone progress every month",
  ],
  yesFor: [
    "London businesses wanting sustainable organic traffic and enquiry growth",
    "Professional services, fintech, SaaS, legal, and e-commerce companies",
    "Founders and marketing leads who want transparent, data-backed reporting",
    "Companies with a 6\u201312 month growth horizon",
  ],
  noFor: [
    "Businesses expecting top London rankings within 4\u20136 weeks",
    "New sites with fewer than 10 pages of content",
    "Companies with no capacity to publish or update content",
  ],
  ctaTitle: "Ready to compete in London's search results?",
  ctaSubtitle:
    "Get in touch for a free review. I\u2019ll look at your London competitor landscape and show you exactly where the opportunities are.",
};

const AI_SEARCH_DATA = {
  accent: "var(--brand-ink)",
  testimonials: [
    {
      quote:
        "In 8 weeks we went from zero presence in Bing Copilot to being cited for 47 queries. Our sales team noticed new inbound leads specifically mentioning they found us through AI search.",
      name: "Daniel R.",
      role: "CMO, B2B SaaS platform",
      location: "UK",
    },
    {
      quote:
        "By month 3 we were appearing in Google AI Overviews for 12 of our target queries. That\u2019s traffic we would have completely missed without this work.",
      name: "Rachel T.",
      role: "Head of Marketing, professional services firm",
      location: "UK",
    },
    {
      quote:
        "The entity and schema work Sunny did in the first month alone generated our first AI citations within 6 weeks.",
      name: "Mark L.",
      role: "Founder, technology consultancy",
      location: "UK",
    },
    {
      quote:
        "We\u2019d heard about AI search optimisation but didn\u2019t know where to start. Sunny\u2019s baseline audit immediately showed us the gaps \u2014 structured, practical, measurable.",
      name: "Anna C.",
      role: "Marketing Director, SaaS company",
      location: "UK",
    },
  ],
  caseStudies: [
    {
      industry: "B2B SaaS",
      challenge: "Zero Copilot/ChatGPT citations despite ranking organically for target terms",
      result: "47 Bing Copilot citations within 8 weeks through entity and schema optimisation",
      metric: "0\u219247 citations",
      timeline: "8 weeks",
      accentColor: "var(--brand-ink)",
    },
    {
      industry: "Professional Services",
      challenge: "Not cited in Google AI Overviews for any target queries despite strong organic rankings",
      result: "Cited in AI Overviews for 12 target queries through content restructure and FAQ architecture",
      metric: "12 AI Overview citations",
      timeline: "3 months",
      accentColor: "var(--brand-ink)",
    },
  ],
  timeline: [
    {
      phase: "Week 1",
      label: "Citation baseline audit",
      description: "Map current AI visibility across 4 platforms, identify entity gaps",
    },
    {
      phase: "Weeks 2\u20133",
      label: "Entity + schema",
      description: "Structured data, Knowledge Panel signals, author entity markup",
    },
    {
      phase: "Weeks 4\u20136",
      label: "Content restructure",
      description: "FAQ architecture, factual density, source-citability improvements",
    },
    {
      phase: "Weeks 6\u20138",
      label: "First citations appear",
      description: "Monitoring confirms initial citation wins across platforms",
    },
    {
      phase: "Month 3+",
      label: "Citation velocity",
      description: "Review observed citations and entity evidence across platforms",
    },
  ],
  riskPoints: [
    "No minimum contract \u2014 monthly rolling, cancel with 30 days notice",
    "You own everything \u2014 all structured data, schema, and content are yours",
    "Monthly citation reporting \u2014 across ChatGPT, Copilot, AI Overviews, and Perplexity",
  ],
  yesFor: [
    "B2B SaaS companies with product-led or content-led growth",
    "Professional services with complex buying journeys (consulting, finance, law)",
    "Brands already ranking organically but invisible in AI results",
    "Businesses with 20+ pages of existing content",
  ],
  noFor: [
    "Pure e-commerce sites (AI search cites informational sources, not product pages)",
    "New sites with fewer than 10 content pages",
    "Businesses wanting results in under 6 weeks",
  ],
  ctaTitle: "Ready to appear in AI search results?",
  ctaSubtitle:
    "Get in touch for a free 20-minute diagnosis of your AI search goals. A measured citation baseline and full audit are separate paid work.",
};

type ConversionData = typeof GENERIC_DATA;

const SPECIFIC_DATA: Record<string, ConversionData> = {
  "seo-consultant-reading": SEO_READING_DATA,
  "seo-consultant-london": SEO_LONDON_DATA,
  "ai-search-optimisation": AI_SEARCH_DATA,
};

const DEFAULT_COVERAGE_MAP_CAPTION = "Towns I cover across Berkshire. Positions approximate.";
const COVERAGE_MAP_CAPTIONS: Record<string, string> = {
  "seo-berkshire": DEFAULT_COVERAGE_MAP_CAPTION,
  "seo-consultant-reading": "Towns I cover across Berkshire. Positions approximate. Remote work available UK-wide.",
};

const OFFER_EXAMPLE_KIND = {
  "technical-seo-audit": "technical-audit",
  "content-briefs": "content-brief",
} as const;

const OFFER_FORM_DATA = {
  "technical-seo-audit": {
    id: "enquire",
    ctaTitle: "Request the £495 technical SEO audit",
    ctaSubtitle:
      "Share the website and the main technical problem. I’ll confirm whether the standard scope fits before paid work starts.",
    trustPoints: [
      "£495 for a standard site of up to around 500 pages",
      "Delivery within 5 working days after access",
      "60-minute findings walkthrough included",
      "Implementation scoped separately if needed",
    ],
    badges: [
      { icon: "clock" as const, label: "5 working days" },
      { icon: "shield" as const, label: "One-off audit" },
    ],
    submitLabel: "Request the £495 audit",
    successMessage:
      "Your technical SEO audit enquiry has been received. The next step is to confirm scope and access.",
    offerId: "technical_seo_audit_495",
    offerLabel: "£495 technical SEO audit",
    eventLabel: "technical_seo_audit_form",
    messagePlaceholder:
      "Share your website URL, the main technical problem and any recent migration or redesign.",
    formFooterNote: "No payment is taken through this form · Scope and access are confirmed first",
    operationalNotes: [
      "The next step is scope and access confirmation",
      "Implementation is scoped separately",
    ],
  },
  "content-briefs": {
    id: "enquire",
    ctaTitle: "Enquire about one £150 content brief",
    ctaSubtitle:
      "Share the topic, current URL if one exists and intended reader. I’ll confirm the inputs and scope before work starts.",
    trustPoints: [
      "One brief £150",
      "10 briefs £1,200 or 25 briefs £2,500",
      "Delivery in 2–3 working days per brief after inputs",
      "Feedback and revision handling agreed before work",
    ],
    badges: [
      { icon: "clock" as const, label: "2–3 working days per brief" },
      { icon: "shield" as const, label: "Scope agreed first" },
    ],
    submitLabel: "Enquire about one brief",
    successMessage:
      "Your content brief enquiry has been received. The next step is to confirm the target and required inputs.",
    offerId: "content_brief_150",
    offerLabel: "£150 SEO content brief",
    eventLabel: "content_brief_form",
    messagePlaceholder:
      "Share the topic, current URL if one exists, intended reader and any required source material.",
    formFooterNote: "No payment is taken through this form · Feedback and revisions are discussed before work",
    operationalNotes: [
      "The next step is target and input confirmation",
      "Batch timing is agreed before work starts",
    ],
  },
} as const;

const OFFER_HEADER_DATA = {
  "technical-seo-audit": {
    badges: ["£495 fixed fee", "5 working days after access", "60-minute walkthrough"],
    ctaHref: "#enquire",
    ctaLabel: "Request the £495 audit",
    ctaMeta: "Standard sites up to around 500 pages",
    ctaOffer: "technical_seo_audit_495",
  },
  "content-briefs": {
    badges: ["One brief £150", "10 briefs £1,200", "2–3 working days per brief"],
    ctaHref: "#enquire",
    ctaLabel: "Enquire about one £150 brief",
    ctaMeta: "Scope and feedback agreed first",
    ctaOffer: "content_brief_150",
  },
} as const;

/* ── Split rendered Markdoc tree at H2 boundaries ───────── */

function buildSections(
  rawContent: unknown,
  convData: ConversionData,
  slug: string,
  coverageMap = false
) {
  // Transform the full document first (requires the real Node instance),
  // then split the resulting plain RenderableTree objects at h2 headings.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = (rawContent as any)?.node ?? rawContent;
  const transformed = Markdoc.transform(node, markdocConfig);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBlocks: RenderableTreeNode[] = (transformed as any)?.children ?? [];
  const wrapper = transformed; // keep name/attributes from the document tag

  // Split allBlocks at h2 tags
  const groups: RenderableTreeNode[][] = [];
  let current: RenderableTreeNode[] = [];

  for (const block of allBlocks) {
    if (
      block &&
      typeof block === "object" &&
      !Array.isArray(block) &&
      (block as { name?: string }).name === "h2" &&
      current.length > 0
    ) {
      groups.push(current);
      current = [block];
    } else {
      current.push(block);
    }
  }
  if (current.length > 0) groups.push(current);

  const n = groups.length;

  // Render each chunk via renderers.react (RenderableTree is plain objects — safe to spread)
  const rendered = groups.map((g) =>
    Markdoc.renderers.react(
      { ...(wrapper as object), children: g } as RenderableTreeNode,
      React,
      { components: { ServiceMiniCta, GlowProcess, GlowProcessStep, MarkdocImage, MarkdocTable } }
    )
  );

  const offerExampleKind = OFFER_EXAMPLE_KIND[slug as keyof typeof OFFER_EXAMPLE_KIND];
  if (offerExampleKind) {
    return rendered.map((content, i) => ({
      content,
      after: i === 1 ? <ServiceOfferExamples kind={offerExampleKind} /> : undefined,
    }));
  }

  // Injection positions — spread components across the content
  const pos = {
    statsBar: 0,
    testimonials: Math.max(1, Math.floor(n * 0.25)),
    caseStudies: Math.max(2, Math.floor(n * 0.4)),
    timeline: Math.max(3, Math.floor(n * 0.55)),
    risk: Math.max(4, Math.floor(n * 0.7)),
    whoFor: n - 1,
  };

  // Deduplicate — if two land on same index, push later one down
  if (pos.testimonials <= pos.statsBar) pos.testimonials = pos.statsBar + 1;
  if (pos.caseStudies <= pos.testimonials) pos.caseStudies = pos.testimonials + 1;
  if (pos.timeline <= pos.caseStudies) pos.timeline = pos.caseStudies + 1;
  if (pos.risk <= pos.timeline) pos.risk = pos.timeline + 1;
  pos.whoFor = Math.max(pos.risk + 1, n - 1);

  const injections: Record<number, React.ReactNode> = {
    [pos.statsBar]: (
      <>
        <StatsBar />
        {coverageMap && (
          <CoverageMap caption={COVERAGE_MAP_CAPTIONS[slug] ?? DEFAULT_COVERAGE_MAP_CAPTION} />
        )}
      </>
    ),
    [pos.testimonials]: (
      <TestimonialGrid testimonials={convData.testimonials} />
    ),
    [pos.caseStudies]: (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {convData.caseStudies.map((cs) => (
          <CaseStudyCard key={cs.industry} {...cs} />
        ))}
      </div>
    ),
    [pos.timeline]: (
      <ProcessTimeline steps={convData.timeline} accentColor={convData.accent} />
    ),
    [pos.risk]: (
      <>
        <RiskReversal points={convData.riskPoints} accentColor={convData.accent} />
        {slug === "ai-search-optimisation" && <CitationChecklist />}
      </>
    ),
    [pos.whoFor]: (
      <WhoForGrid yesItems={convData.yesFor} noItems={convData.noFor} />
    ),
  };

  return rendered.map((content, i) => ({
    content,
    after: injections[i],
  }));
}

/* ── Page ──────────────────────────────────────────────────── */

export async function generateStaticParams() {
  const slugs = await reader.collections.services.list();
  return slugs.map((slug) => ({ slug }));
}

const NOINDEX_SLUGS = new Set([
  "seo-consultant-birmingham",
  "seo-consultant-bradford",
  "seo-consultant-brighton",
  "seo-consultant-cardiff",
  "seo-consultant-devon",
  "seo-consultant-edinburgh",
  "seo-consultant-essex",
  "seo-consultant-glasgow",
  "seo-consultant-harrogate",
  "seo-consultant-leeds",
  "seo-consultant-manchester",
  "seo-consultant-nottingham",
  "seo-consultant-oxford",
  "seo-consultant-preston",
  "seo-consultant-sheffield",
  "seo-consultant-southampton",
  "seo-consultant-surrey",
  "seo-consultant-york",
]);

const REDIRECTED_SLUGS = new Set([
  "local-seo-agency",
  "seo-strategy-consulting-expert-guidance-for-in-house-teams",
  "seo-consultant-london",
  "seo-consultant-kent",
  ...NOINDEX_SLUGS,
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await reader.collections.services.read(slug);
  if (!service) return {};
  const meta = buildMetadata({
    title: service.metaTitle || service.title,
    description: service.description,
    ogImage: service.ogImage,
    path: service.canonicalOverride || `/services/${slug}`,
  });
  return {
    ...meta,
    ...(NOINDEX_SLUGS.has(slug) && { robots: { index: false, follow: true } }),
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await reader.collections.services.read(slug);
  if (!service) notFound();

  const [rawContent, allServices] = await Promise.all([
    service.content(),
    reader.collections.services.all(),
  ]);

  const serviceSummaries = allServices
    .filter((s) => !REDIRECTED_SLUGS.has(s.slug))
    .map((s) => ({
      slug: s.slug,
      title: s.entry.title,
      subtitle: s.entry.subtitle,
      description: s.entry.description,
    }));

  const convData = SPECIFIC_DATA[slug] ?? GENERIC_DATA;
  const sections = buildSections(rawContent, convData, slug, service.coverageMap);
  const usesServiceSpecificOffer = slug in OFFER_EXAMPLE_KIND;
  const offerForm = OFFER_FORM_DATA[slug as keyof typeof OFFER_FORM_DATA];
  const offerHeader = OFFER_HEADER_DATA[slug as keyof typeof OFFER_HEADER_DATA];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaGraph(
            serviceSchema({
              name: service.title,
              description: service.description,
              slug,
            }),
            breadcrumbSchema([
              { name: "Home", url: "https://sunnypatel.co.uk/" },
              { name: "Services", url: "https://sunnypatel.co.uk/services/" },
              {
                name: service.title,
                url: `https://sunnypatel.co.uk/services/${slug}/`,
              },
            ])
          ),
        }}
      />
      <ContentPage
        h1={service.h1 || service.title}
        subtitle={service.subtitle}
        serviceHeroImage={service.heroImage || undefined}
        serviceHeroImageAlt={service.heroImageAlt || service.h1 || service.title}
        badge="Services"
        backHref="/services"
        backLabel="All Services"
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
        showCta={!usesServiceSpecificOffer}
        showStickyCta={!usesServiceSpecificOffer}
        isService={true}
        serviceHeaderBadges={offerHeader?.badges}
        serviceHeaderCtaHref={offerHeader?.ctaHref}
        serviceHeaderCtaLabel={offerHeader?.ctaLabel}
        serviceHeaderCtaMeta={offerHeader?.ctaMeta}
        serviceHeaderCtaOffer={offerHeader?.ctaOffer}
        ctaTitle={convData.ctaTitle}
        ctaSubtitle={convData.ctaSubtitle}
        sections={sections}
        afterContent={
          <>
            {offerForm && <ServiceInlineForm {...offerForm} />}
            <RelatedServices
              currentSlug={slug}
              allServices={serviceSummaries}
            />
          </>
        }
      />
    </>
  );
}
