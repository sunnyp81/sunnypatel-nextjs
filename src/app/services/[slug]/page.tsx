import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";
import { serviceSchema, breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { RelatedServices } from "@/components/related-services";
import { TestimonialGrid } from "@/components/services/TestimonialGrid";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { RiskReversal } from "@/components/services/RiskReversal";
import { WhoForGrid } from "@/components/services/WhoForGrid";
import { CitationChecklist } from "@/components/services/CitationChecklist";
import { CaseStudyCard } from "@/components/services/CaseStudyCard";

/* ── Per-slug conversion data ─────────────────────────────── */

const SEO_READING_DATA = {
  accent: "#5B8AEF",
  testimonials: [
    {
      quote:
        "Before working with Sunny, we were getting around 180 organic visits a month. Nine months later we're at 620 and enquiries from organic have tripled.",
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
      challenge:
        "180 organic visits/mo, no topical authority in a competitive Reading market",
      result:
        "620 visits/mo with 3\u00d7 enquiry rate through topical map and content strategy",
      metric: "+244% organic traffic",
      timeline: "9 months",
      accentColor: "#5B8AEF",
    },
    {
      industry: "Professional Services",
      challenge:
        "Not appearing in local pack for core service queries across Berkshire",
      result:
        "Top-3 local pack positions for main service terms, 3\u00d7 monthly enquiries",
      metric: "3\u00d7 monthly enquiries",
      timeline: "6 months",
      accentColor: "#5B8AEF",
    },
  ],
  timeline: [
    {
      phase: "Week 1",
      label: "Technical audit + discovery",
      description:
        "Site health, competitor map, keyword opportunity sizing",
    },
    {
      phase: "Weeks 2\u20134",
      label: "Technical fixes + content plan",
      description:
        "Prioritised fixes live, 12-month topical map drafted",
    },
    {
      phase: "Month 2\u20133",
      label: "Topical content live",
      description:
        "Cornerstone pages and supporting content published",
    },
    {
      phase: "Month 4\u20136",
      label: "Rankings build",
      description:
        "Target pages climbing, local pack positions strengthening",
    },
    {
      phase: "Month 7\u20139+",
      label: "Compounding growth",
      description:
        "Authority compound effect, content cluster dominance",
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
};

const AI_SEARCH_DATA = {
  accent: "#5B8AEF",
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
      challenge:
        "Zero Copilot/ChatGPT citations despite ranking organically for target terms",
      result:
        "47 Bing Copilot citations within 8 weeks through entity and schema optimisation",
      metric: "0\u219247 citations",
      timeline: "8 weeks",
      accentColor: "#5B8AEF",
    },
    {
      industry: "Professional Services",
      challenge:
        "Not cited in Google AI Overviews for any target queries despite strong organic rankings",
      result:
        "Cited in AI Overviews for 12 target queries through content restructure and FAQ architecture",
      metric: "12 AI Overview citations",
      timeline: "3 months",
      accentColor: "#5B8AEF",
    },
  ],
  timeline: [
    {
      phase: "Week 1",
      label: "Citation baseline audit",
      description:
        "Map current AI visibility across 4 platforms, identify entity gaps",
    },
    {
      phase: "Weeks 2\u20133",
      label: "Entity + schema",
      description:
        "Structured data, Knowledge Panel signals, author entity markup",
    },
    {
      phase: "Weeks 4\u20136",
      label: "Content restructure",
      description:
        "FAQ architecture, factual density, source-citability improvements",
    },
    {
      phase: "Weeks 6\u20138",
      label: "First citations appear",
      description:
        "Monitoring confirms initial citation wins across platforms",
    },
    {
      phase: "Month 3+",
      label: "Citation velocity",
      description:
        "Compound growth as entity authority builds across platforms",
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
};

type ConversionData = typeof SEO_READING_DATA;

const CONVERSION_DATA: Record<string, ConversionData> = {
  "seo-consultant-reading": SEO_READING_DATA,
  "ai-search-optimisation": AI_SEARCH_DATA,
};

/* ── Page ──────────────────────────────────────────────────── */

export async function generateStaticParams() {
  const slugs = await reader.collections.services.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await reader.collections.services.read(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.metaTitle || service.title,
    description: service.description,
    ogImage: service.ogImage,
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await reader.collections.services.read(slug);
  if (!service) notFound();

  const [content, allServices] = await Promise.all([
    service.content(),
    reader.collections.services.all(),
  ]);
  const rendered = renderMarkdoc(content);

  const serviceSummaries = allServices.map((s) => ({
    slug: s.slug,
    title: s.entry.title,
    subtitle: s.entry.subtitle,
  }));

  const convData = CONVERSION_DATA[slug] ?? null;

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
              { name: "Home", url: "https://sunnypatel.co.uk" },
              { name: "Services", url: "https://sunnypatel.co.uk/services" },
              { name: service.title, url: `https://sunnypatel.co.uk/services/${slug}` },
            ])
          ),
        }}
      />
      <ContentPage
        h1={service.h1 || service.title}
        subtitle={service.subtitle}
        badge="Services"
        backHref="/services"
        backLabel="All Services"
        showCta={true}
        afterContent={
          <>
            {convData && (
              <>
                <div className="mx-auto max-w-5xl px-6">
                  <TestimonialGrid testimonials={convData.testimonials} />
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {convData.caseStudies.map((cs) => (
                      <CaseStudyCard key={cs.industry} {...cs} />
                    ))}
                  </div>
                  <ProcessTimeline
                    steps={convData.timeline}
                    accentColor={convData.accent}
                  />
                  <RiskReversal
                    points={convData.riskPoints}
                    accentColor={convData.accent}
                  />
                  {slug === "ai-search-optimisation" && <CitationChecklist />}
                  <WhoForGrid
                    yesItems={convData.yesFor}
                    noItems={convData.noFor}
                  />
                </div>
              </>
            )}
            {!convData && (
              <RelatedServices
                currentSlug={slug}
                allServices={serviceSummaries}
              />
            )}
          </>
        }
      >
        {rendered}
      </ContentPage>
    </>
  );
}
