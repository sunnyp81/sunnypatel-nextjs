import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { serviceSchema, breadcrumbSchema, faqSchema, schemaGraph } from "@/lib/schema";
import { RelatedServices } from "@/components/related-services";
import { TestimonialGrid } from "@/components/services/TestimonialGrid";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { RiskReversal } from "@/components/services/RiskReversal";
import { WhoForGrid } from "@/components/services/WhoForGrid";
import { CitationChecklist } from "@/components/services/CitationChecklist";
import { CaseStudyCard } from "@/components/services/CaseStudyCard";

/* ── Conversion data ──────────────────────────────────────── */

const GENERIC_DATA = {
  accent: "#5B8AEF",
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
      accentColor: "#5B8AEF",
    },
    {
      industry: "Professional Services",
      challenge: "Not appearing in local pack for core service queries",
      result: "Top-3 local pack positions for main service terms, 3\u00d7 monthly enquiries",
      metric: "3\u00d7 monthly enquiries",
      timeline: "6 months",
      accentColor: "#5B8AEF",
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
      label: "Rankings build",
      description: "Target pages climbing, authority signals strengthening",
    },
    {
      phase: "Month 7+",
      label: "Compound growth",
      description: "Authority compound effect, content cluster dominance",
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
};

const SEO_READING_DATA = {
  accent: "#5B8AEF",
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
      accentColor: "#5B8AEF",
    },
    {
      industry: "Professional Services",
      challenge: "Not appearing in local pack for core service queries across Berkshire",
      result: "Top-3 local pack positions for main service terms, 3\u00d7 monthly enquiries",
      metric: "3\u00d7 monthly enquiries",
      timeline: "6 months",
      accentColor: "#5B8AEF",
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
      label: "Rankings build",
      description: "Target pages climbing, local pack positions strengthening",
    },
    {
      phase: "Month 7\u20139+",
      label: "Compounding growth",
      description: "Authority compound effect, content cluster dominance",
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
      challenge: "Zero Copilot/ChatGPT citations despite ranking organically for target terms",
      result: "47 Bing Copilot citations within 8 weeks through entity and schema optimisation",
      metric: "0\u219247 citations",
      timeline: "8 weeks",
      accentColor: "#5B8AEF",
    },
    {
      industry: "Professional Services",
      challenge: "Not cited in Google AI Overviews for any target queries despite strong organic rankings",
      result: "Cited in AI Overviews for 12 target queries through content restructure and FAQ architecture",
      metric: "12 AI Overview citations",
      timeline: "3 months",
      accentColor: "#5B8AEF",
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
      description: "Compound growth as entity authority builds across platforms",
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

type FaqItem = { q: string; a: string };

const SERVICE_FAQS: Record<string, FaqItem[]> = {
  "seo-consultant-reading": [
    {
      q: "Why should I hire an SEO consultant in Reading?",
      a: "Hiring a local SEO consultant in Reading provides direct access to local market knowledge, face-to-face strategy sessions at our Green Park office, and understanding of Reading's competitive business landscape across Berkshire and Thames Valley. Local expertise combines with advanced semantic SEO methodology to deliver sustainable organic growth.",
    },
    {
      q: "What SEO services are available in Reading?",
      a: "SEO services available in Reading include technical SEO audits, local SEO optimisation for Google Business Profile and local pack visibility, topical map creation for long-term content architecture, content strategy for semantic SEO, and ongoing SEO consulting for in-house teams requiring expert direction.",
    },
    {
      q: "Which areas of Reading do you cover?",
      a: "SEO services cover Reading town centre, Caversham, Earley, Woodley, Winnersh, Tilehurst, Calcot, Green Park, and Thames Valley Park business districts. Remote consultations are available for businesses across the UK wanting Reading-based expertise.",
    },
    {
      q: "How long does SEO take for Reading businesses?",
      a: "Local SEO improvements for Reading businesses typically show within 3–6 months. Broader authority building in competitive Reading markets may require 6–12 months of consistent work. Technical fixes produce measurable changes within 4–8 weeks of implementation.",
    },
    {
      q: "How much does an SEO consultant in Reading cost?",
      a: "SEO consultant costs in Reading range from £500–£1,200 for a technical audit, £800–£2,500 for topical mapping, and £1,500–£5,000 per month for ongoing retainers depending on scope and competition. Free initial consultations include a brief website review and actionable recommendations.",
    },
    {
      q: "What if previous SEO work did not deliver results for my Reading business?",
      a: "Most failed SEO for Reading businesses results from generic advice without local market understanding, thin content without topical authority, or targeting isolated keywords without an interconnected content strategy. A methodology-led approach specific to the Reading and Thames Valley competitive landscape typically resolves these issues within 6–12 months.",
    },
  ],
  "technical-seo-audit": [
    {
      q: "What is a technical SEO audit?",
      a: "A technical SEO audit is a comprehensive analysis of your website's infrastructure — covering crawlability, indexation, Core Web Vitals, mobile usability, structured data, and site architecture — that identifies the issues preventing search engines from effectively ranking your pages.",
    },
    {
      q: "How much does a technical SEO audit cost?",
      a: "Technical SEO audit costs range from £500 for small sites under 100 pages, £800 for medium sites with 100–500 pages, and £1,200+ for large sites over 500 pages. All audits include a 60-minute consultation call to review findings and discuss implementation priorities.",
    },
    {
      q: "What does a technical SEO audit include?",
      a: "A technical SEO audit covers 7 core areas: crawlability analysis, indexation review, Core Web Vitals performance, mobile usability, site architecture, schema markup validation, and security and accessibility compliance. Deliverables include an executive summary, prioritised recommendations spreadsheet, competitor benchmarking, and developer-ready implementation guidance.",
    },
    {
      q: "How long does a technical SEO audit take?",
      a: "A technical SEO audit typically takes 5–10 working days depending on site size. Small sites under 100 pages are delivered within 5 days; large sites over 500 pages may require up to 2 weeks for comprehensive analysis.",
    },
    {
      q: "What happens after a technical SEO audit?",
      a: "After a technical SEO audit you receive a prioritised action plan with effort/impact scoring. Most clients implement recommendations using their existing development team. Following technical fixes, many commission topical map creation to build content authority on the improved technical foundation.",
    },
  ],
  "seo-consulting": [
    {
      q: "What is SEO consulting?",
      a: "SEO consulting provides expert strategic guidance for businesses wanting direction without full-service implementation. Sessions cover current performance analysis, opportunity identification, prioritised recommendations, and a 12-month strategic roadmap — ideal for in-house teams needing specialist input.",
    },
    {
      q: "How much does SEO consulting cost?",
      a: "SEO consulting costs from £200 for a single 90-minute session, £600 per month for a 4-hour monthly retainer, and £500 for a quarterly strategy review. Most clients start with a single session to establish value before committing to ongoing consulting.",
    },
    {
      q: "Who benefits from SEO consulting?",
      a: "SEO consulting suits in-house marketing teams needing specialist input, businesses transitioning between agencies, startups establishing SEO foundations before scaling content, and organisations evaluating whether SEO is the right investment for their growth goals.",
    },
    {
      q: "How is SEO consulting different from a full-service retainer?",
      a: "SEO consulting provides strategic direction — analysis, recommendations, and roadmaps — while your team handles implementation. Full-service retainers include strategy plus execution: content creation, technical fixes, and ongoing optimisation. Consulting is typically 60–70% cheaper for businesses with capable in-house teams.",
    },
    {
      q: "What topics does an SEO consulting session cover?",
      a: "SEO consulting sessions address technical SEO strategy, semantic content methodology and topical authority building, local SEO and Google Business Profile optimisation, keyword research and topical mapping, internal linking architecture, and performance analysis and algorithm update assessment.",
    },
  ],
  "how-much-does-seo-cost": [
    {
      q: "How much does SEO cost in the UK?",
      a: "UK SEO costs range from £500 for a standalone technical audit to £5,000+ monthly for a comprehensive retainer. Typical ranges: technical audits £500–£1,200, topical maps £800–£2,500, local SEO from £600 monthly, SEO consulting from £200 per session, and full-service retainers £1,500–£5,000+ monthly.",
    },
    {
      q: "Why is cheap SEO risky?",
      a: "SEO services under £300 monthly typically rely on automated link building, template content, and basic reporting that fails to build topical authority. These approaches often trigger algorithmic penalties or produce results that collapse when Google updates, costing significantly more to repair than quality SEO would have cost upfront.",
    },
    {
      q: "How long before SEO delivers positive ROI?",
      a: "SEO ROI develops progressively: months 1–3 require investment before results materialise; months 3–6 deliver initial 2–3x ROI from early ranking improvements; months 6–12 reach 5–10x ROI as topical authority compounds; mature SEO at 12+ months typically delivers 10–20x ROI through sustained organic visibility.",
    },
    {
      q: "Should I hire an SEO consultant or an agency?",
      a: "SEO consultants suit businesses wanting strategic direction with in-house implementation — typically £1,500–£3,500 monthly for senior strategy. Agencies provide full-service execution at higher cost. A hybrid model combining consultant strategy with freelance execution often delivers the best quality-to-cost ratio.",
    },
    {
      q: "What SEO budget does my business need?",
      a: "Small local businesses typically need £800–£1,500 initial setup plus £600+ monthly. B2B service businesses require £3,000–£8,000 initial strategy plus £1,000–£2,000 monthly. E-commerce businesses need £5,000–£15,000 initial investment plus £2,000–£5,000 monthly for sustained growth.",
    },
  ],
  "seo-berkshire": [
    {
      q: "What makes Berkshire SEO different from national SEO?",
      a: "Berkshire SEO combines local market knowledge across Reading, Bracknell, Maidenhead, Windsor, Slough, and Wokingham with advanced semantic methodology. The Thames Valley commercial corridor creates specific competitive dynamics — high business density, London proximity, and affluent demographics — that generic national SEO approaches ignore.",
    },
    {
      q: "Which Berkshire areas do you cover?",
      a: "SEO services cover all Berkshire areas: Reading and West Berkshire, Bracknell Forest, Wokingham Borough, Royal Borough of Windsor and Maidenhead, and Slough Borough. Remote consultations are also available for businesses wanting Berkshire-based expertise without geographic restrictions.",
    },
    {
      q: "How much does Berkshire SEO cost?",
      a: "Berkshire SEO pricing: technical audits from £500, topical maps £800–£2,500+, local SEO from £600 monthly, and full retainers £1,500–£5,000+ monthly. Initial investment depends on competition level and existing site authority. Free consultations available to assess your specific requirements.",
    },
    {
      q: "How long does SEO take for Berkshire businesses?",
      a: "Berkshire SEO timelines depend on competition and market. Local service businesses see initial results within 3–4 months. Professional services require 6–9 months building topical authority. Technology B2B companies in competitive Thames Valley markets should plan for 9–15 months for dominant positions.",
    },
  ],
  "seo-bracknell": [
    {
      q: "Why do Bracknell businesses need local SEO?",
      a: "Bracknell's strong technology sector and professional services cluster create competitive local search markets. Businesses in The Lexicon, Doncastle Road, and Western Road business parks compete for local searches from an affluent commuter population. Local SEO ensures visibility when Bracknell buyers search for your services.",
    },
    {
      q: "What SEO services work best for Bracknell businesses?",
      a: "Bracknell businesses benefit most from local SEO for Google Business Profile and Map Pack visibility, technical SEO audits to fix indexation issues, topical map creation for industry authority beyond purely local searches, and content briefs for systematic semantic SEO content production.",
    },
    {
      q: "How much does SEO cost for a Bracknell business?",
      a: "Bracknell SEO investment ranges from £800–£2,500 initially for strategy and setup, followed by £600–£2,000+ monthly for ongoing implementation depending on service scope and competition. Free initial consultations assess your specific requirements and competitive landscape.",
    },
    {
      q: "How long does SEO take in Bracknell markets?",
      a: "Local service businesses in Bracknell see initial results within 3–4 months. Professional services and B2B companies require 6–9 months building topical authority. Technology businesses with complex sales cycles should plan 9–15 months for competitive positions in saturated markets.",
    },
  ],
  "seo-slough": [
    {
      q: "What makes Slough SEO different from other areas?",
      a: "Slough's diverse economy — spanning the Trading Estate, manufacturing, logistics, technology, and professional services — creates varied SEO requirements. B2B businesses need topical authority for procurement research, while local service businesses need Google Maps visibility for residential catchments across Langley, Cippenham, and Burnham.",
    },
    {
      q: "What SEO services suit Slough businesses?",
      a: "Slough businesses benefit from B2B SEO strategies building topical authority for long sales cycles, local SEO for service businesses in residential areas, technical audits for complex e-commerce and business sites, and content architecture addressing diverse buyer journeys from quick local decisions to extended B2B evaluation processes.",
    },
    {
      q: "How much does SEO cost for a Slough business?",
      a: "Slough SEO costs range from £500 for a standalone technical audit to £1,500–£5,000+ monthly for comprehensive retainers. B2B content strategy typically requires £3,000–£8,000 initial investment. Free consultations provide specific pricing based on your industry, competition, and growth objectives.",
    },
    {
      q: "How long does SEO take for Slough businesses?",
      a: "Local service businesses in Slough see initial improvements within 3–4 months through Google Business Profile and on-page optimisation. B2B companies on the Trading Estate typically require 9–15 months to build the topical authority needed to compete for procurement research queries.",
    },
  ],
  "seo-wokingham": [
    {
      q: "Why do Wokingham businesses need specialist SEO?",
      a: "Wokingham Borough's affluent and educated population creates sophisticated search patterns requiring advanced content strategies beyond basic keyword targeting. Businesses compete against established local providers and Reading-based services targeting the same audience, demanding topical authority differentiation to rank and convert.",
    },
    {
      q: "What SEO services work for Wokingham businesses?",
      a: "Wokingham businesses benefit from semantic SEO building topical authority for sophisticated buyer research, local SEO for Google Business Profile and Map Pack visibility, technical audits ensuring fast mobile performance for a technically literate audience, and comprehensive content strategy addressing detailed pre-purchase research patterns.",
    },
    {
      q: "How much does SEO cost for a Wokingham business?",
      a: "Wokingham SEO investment ranges from £800–£2,500 initially for strategy and audit, followed by £800–£2,500+ monthly for ongoing implementation. Professional services in competitive niches require higher investment to overcome established competitors. Free consultations provide accurate scoping based on your market.",
    },
    {
      q: "How long does SEO take in Wokingham?",
      a: "Local service businesses in Wokingham see initial results within 3–4 months. Professional services (financial advisors, solicitors, consultancies) require 6–9 months building the topical authority needed to outrank established local competitors with multi-year authority advantages.",
    },
  ],
  "seo-maidenhead": [
    {
      q: "What makes Maidenhead SEO unique?",
      a: "Maidenhead's position in the Royal Borough creates dual SEO opportunities: local resident searches from affluent commuter demographics, and tourism-driven visitor searches from Windsor overflow. Effective Maidenhead SEO addresses both intents — local service relationships and immediate visitor needs — with different content strategies.",
    },
    {
      q: "What SEO services benefit Maidenhead businesses?",
      a: "Maidenhead businesses benefit from tourism-focused local SEO capturing visitor searches, residential market targeting for local service businesses, content strategy balancing visitor intent with long-term resident relationships, and technical optimisation for fast mobile performance supporting on-the-move visitor searches.",
    },
    {
      q: "How much does SEO cost for a Maidenhead business?",
      a: "Maidenhead SEO investment ranges from £600–£1,500 monthly for local SEO maintenance to £2,000–£5,000+ monthly for comprehensive strategy covering both tourism and residential markets. Initial strategy and setup typically requires £800–£2,500. Free consultations provide specific pricing for your business type.",
    },
    {
      q: "How long does SEO take for Maidenhead businesses?",
      a: "Local service businesses and hospitality in Maidenhead typically see initial improvements within 3–4 months through Google Business Profile optimisation and local content. Businesses targeting both visitor and resident markets may require 6–9 months to build authority across both audience segments.",
    },
  ],
  "seo-windsor": [
    {
      q: "What SEO opportunities exist for Windsor businesses?",
      a: "Windsor's unique blend of international tourism, heritage-driven visitor searches, and established local business creates distinct SEO opportunities. Tourism-facing businesses capture high-volume visitor intent searches year-round, while local service businesses benefit from an affluent residential catchment across the Royal Borough.",
    },
    {
      q: "How much does SEO cost for a Windsor business?",
      a: "Windsor SEO costs range from £600+ monthly for local SEO to £1,500–£3,500+ monthly for comprehensive strategies covering both tourist and residential audiences. Initial audits start from £500. Free consultations assess your specific market position and growth objectives.",
    },
    {
      q: "How long does SEO take for Windsor businesses?",
      a: "Windsor hospitality and tourism businesses see initial Google Maps and local pack improvements within 3–4 months. Professional services and local businesses targeting residential audiences require 6–9 months to build the topical authority needed to rank competitively against established local providers.",
    },
  ],
  "seo-agency-reading": [
    {
      q: "What is an SEO agency in Reading?",
      a: "An SEO agency in Reading provides organic search strategy and implementation for local businesses. The term covers traditional multi-staff agencies, specialist SEO shops, and independent SEO consultants — all delivering similar outcomes through different structures. Independent consultants like Sunny Patel offer direct senior expert access without the account manager overhead common in larger agencies.",
    },
    {
      q: "Should I use an SEO agency or SEO consultant in Reading?",
      a: "For most Reading businesses, an independent SEO consultant delivers equivalent results at lower cost than a traditional agency, because you access the strategist directly rather than through an account manager. Agencies suit businesses needing high-volume simultaneous content production. Consultants suit businesses wanting strategic expertise and direct accountability.",
    },
    {
      q: "How much does an SEO agency in Reading cost?",
      a: "Reading SEO agency pricing typically runs £1,500–£5,000+ monthly. Independent consultant pricing for equivalent strategic scope runs £1,500–£5,000+ monthly with more of that investment going directly into strategy and implementation rather than overhead. Technical audits start from £500; topical maps from £800.",
    },
    {
      q: "Which areas of Reading does your SEO agency service cover?",
      a: "SEO services cover Reading town centre, Green Park, Thames Valley Park, Caversham, Earley, Woodley, Winnersh, Tilehurst, and Calcot. Services extend across all Berkshire — Bracknell, Slough, Wokingham, Maidenhead, and Windsor — with remote consultancy available UK-wide.",
    },
    {
      q: "How long does SEO take with a Reading SEO agency?",
      a: "SEO timelines are consistent whether using an agency or consultant. Local SEO improvements typically show within 3–6 months. Topical authority building in competitive Reading markets requires 6–12 months. The pace is determined by Google's crawl and re-evaluation cycles, not headcount.",
    },
  ],
};

type ConversionData = typeof GENERIC_DATA;

// Pages with fully custom data — no RelatedServices shown on these
const SPECIFIC_SLUGS = new Set(["seo-consultant-reading", "ai-search-optimisation"]);

const SPECIFIC_DATA: Record<string, ConversionData> = {
  "seo-consultant-reading": SEO_READING_DATA,
  "ai-search-optimisation": AI_SEARCH_DATA,
};

/* ── Split rendered Markdoc tree at H2 boundaries ───────── */

function buildSections(
  rawContent: unknown,
  convData: ConversionData,
  slug: string
) {
  // Transform the full document first (requires the real Node instance),
  // then split the resulting plain RenderableTree objects at h2 headings.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = (rawContent as any)?.node ?? rawContent;
  const transformed = Markdoc.transform(node);

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
      React
    )
  );

  // Injection positions — spread components across the content
  const pos = {
    testimonials: Math.max(0, Math.floor(n * 0.25)),
    caseStudies: Math.max(1, Math.floor(n * 0.45)),
    timeline: Math.max(2, Math.floor(n * 0.6)),
    risk: Math.max(3, Math.floor(n * 0.75)),
    whoFor: n - 1,
  };

  // Deduplicate — if two land on same index, push later one down
  if (pos.caseStudies === pos.testimonials) pos.caseStudies++;
  if (pos.timeline <= pos.caseStudies) pos.timeline = pos.caseStudies + 1;
  if (pos.risk <= pos.timeline) pos.risk = pos.timeline + 1;
  pos.whoFor = Math.max(pos.risk + 1, n - 1);

  const injections: Record<number, React.ReactNode> = {
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

  const [rawContent, allServices] = await Promise.all([
    service.content(),
    reader.collections.services.all(),
  ]);

  const serviceSummaries = allServices.map((s) => ({
    slug: s.slug,
    title: s.entry.title,
    subtitle: s.entry.subtitle,
  }));

  const convData = SPECIFIC_DATA[slug] ?? GENERIC_DATA;
  const sections = buildSections(rawContent, convData, slug);
  const isSpecific = SPECIFIC_SLUGS.has(slug);

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
              {
                name: service.title,
                url: `https://sunnypatel.co.uk/services/${slug}`,
              },
            ]),
            ...(SERVICE_FAQS[slug] ? [faqSchema(SERVICE_FAQS[slug])] : [])
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
        sections={sections}
        afterContent={
          !isSpecific ? (
            <RelatedServices
              currentSlug={slug}
              allServices={serviceSummaries}
            />
          ) : undefined
        }
      />
    </>
  );
}
