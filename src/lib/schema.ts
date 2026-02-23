const SITE_URL = "https://sunnypatel.co.uk";

// =============================================================================
// SEMANTIC ENTITY DEFINITIONS
// =============================================================================
// Each topic entity is a node in the site's knowledge graph.
// Schema.org triples: Subject (@type + @id) -> Predicate (property) -> Object.
// These DefinedTerm entities are referenced via @id by Person (knowsAbout),
// Service pages (about/mentions), and Blog posts (about/mentions).

interface TopicDef {
  name: string;
  description: string;
  url: string;
}

const TOPICS: Record<string, TopicDef> = {
  "semantic-seo": {
    name: "Semantic SEO",
    description:
      "SEO methodology building topical authority through entity relationships, comprehensive topic coverage, and contextual relevance signals",
    url: `${SITE_URL}/services/semantic-seo/`,
  },
  "entity-seo": {
    name: "Entity SEO",
    description:
      "Building digital entity identity and knowledge graph presence so search engines understand who you are, not just what you publish",
    url: `${SITE_URL}/blog/what-is-entity-seo/`,
  },
  "topical-authority": {
    name: "Topical Authority",
    description:
      "Establishing a website as the definitive source on a topic through comprehensive, interconnected content coverage",
    url: `${SITE_URL}/services/topical-authority/`,
  },
  "ai-search-optimisation": {
    name: "AI Search Optimisation",
    description:
      "Optimising content for visibility and citation in AI-powered search engines including ChatGPT, Perplexity, Bing Copilot, and Google AI Overviews",
    url: `${SITE_URL}/services/ai-search-optimisation/`,
  },
  "technical-seo": {
    name: "Technical SEO",
    description:
      "Optimising website infrastructure for crawlability, indexation, site speed, Core Web Vitals, and structured data implementation",
    url: `${SITE_URL}/services/technical-seo-audit/`,
  },
  "local-seo": {
    name: "Local SEO",
    description:
      "Optimising for location-based search results including Google Maps, local pack, Google Business Profile, and geo-targeted queries",
    url: `${SITE_URL}/services/local-seo/`,
  },
  "content-strategy": {
    name: "Content Strategy",
    description:
      "Strategic planning of content creation aligned with search intent, topical maps, semantic coverage gaps, and business objectives",
    url: `${SITE_URL}/services/content-briefs/`,
  },
  eeat: {
    name: "E-E-A-T",
    description:
      "Google's Experience, Expertise, Authoritativeness, and Trustworthiness quality framework for evaluating content and creator credibility",
    url: `${SITE_URL}/blog/what-is-eeat-seo/`,
  },
  "keyword-research": {
    name: "Keyword Research",
    description:
      "Systematic analysis of search terms to identify opportunities based on volume, search intent, competition, and semantic relationships",
    url: `${SITE_URL}/services/keyword-research/`,
  },
  "internal-linking": {
    name: "Internal Linking",
    description:
      "Strategic linking between pages to distribute authority, define topic clusters, signal content hierarchy, and guide search engine crawlers",
    url: `${SITE_URL}/services/internal-linking/`,
  },
  "on-page-seo": {
    name: "On-Page SEO",
    description:
      "Optimisation of individual page elements including meta tags, headings, content structure, semantic HTML, and keyword placement",
    url: `${SITE_URL}/services/on-page-seo/`,
  },
  "llm-optimisation": {
    name: "LLM Optimisation",
    description:
      "Optimising content to be retrieved, cited, and recommended by large language models powering AI search experiences",
    url: `${SITE_URL}/blog/what-is-llm-optimisation/`,
  },
};

function topicId(key: string) {
  return `${SITE_URL}/#topic-${key}`;
}

// =============================================================================
// PAGE-TO-TOPIC MAPPINGS
// =============================================================================
// Maps each page slug to its semantic relationships:
//   about  = what the page IS about (primary topic entities)
//   mentions = what the page REFERENCES (secondary topic entities)
// These resolve to Schema.org about/mentions properties with @id references.

interface TopicMapping {
  about: string[];
  mentions: string[];
}

export const SERVICE_TOPICS: Record<string, TopicMapping> = {
  "semantic-seo": {
    about: ["semantic-seo"],
    mentions: ["entity-seo", "topical-authority"],
  },
  "topical-authority": {
    about: ["topical-authority"],
    mentions: ["semantic-seo", "content-strategy"],
  },
  "topical-maps": {
    about: ["topical-authority", "content-strategy"],
    mentions: ["semantic-seo", "keyword-research"],
  },
  "content-briefs": {
    about: ["content-strategy"],
    mentions: ["keyword-research", "semantic-seo"],
  },
  "on-page-seo": {
    about: ["on-page-seo"],
    mentions: ["keyword-research", "technical-seo"],
  },
  "internal-linking": {
    about: ["internal-linking"],
    mentions: ["topical-authority", "semantic-seo"],
  },
  "keyword-research": {
    about: ["keyword-research"],
    mentions: ["content-strategy", "on-page-seo"],
  },
  seo: {
    about: ["semantic-seo"],
    mentions: ["technical-seo", "content-strategy", "entity-seo"],
  },
  "seo-consulting": {
    about: ["semantic-seo"],
    mentions: ["topical-authority", "entity-seo"],
  },
  "technical-seo-audit": {
    about: ["technical-seo"],
    mentions: ["on-page-seo"],
  },
  "technical-seo-services": {
    about: ["technical-seo"],
    mentions: ["on-page-seo", "internal-linking"],
  },
  "local-seo": {
    about: ["local-seo"],
    mentions: ["technical-seo", "content-strategy"],
  },
  "local-seo-agency": {
    about: ["local-seo"],
    mentions: ["technical-seo", "content-strategy"],
  },
  "generative-engine-optimisation": {
    about: ["ai-search-optimisation"],
    mentions: ["llm-optimisation", "entity-seo"],
  },
  "ai-search-optimisation": {
    about: ["ai-search-optimisation"],
    mentions: ["llm-optimisation", "entity-seo", "semantic-seo"],
  },
  "b2b-seo": {
    about: ["semantic-seo", "content-strategy"],
    mentions: ["keyword-research", "topical-authority"],
  },
  "b2b-content-marketing-services": {
    about: ["content-strategy"],
    mentions: ["semantic-seo", "keyword-research"],
  },
  "saas-seo": {
    about: ["semantic-seo", "content-strategy"],
    mentions: ["keyword-research", "technical-seo"],
  },
  "dental-seo": {
    about: ["local-seo"],
    mentions: ["content-strategy", "eeat"],
  },
  "professional-seo-services": {
    about: ["semantic-seo"],
    mentions: ["technical-seo", "content-strategy", "eeat"],
  },
  "digital-marketing-reading": {
    about: ["local-seo"],
    mentions: ["semantic-seo", "content-strategy"],
  },
  "how-much-does-seo-cost": {
    about: ["semantic-seo"],
    mentions: ["content-strategy", "technical-seo"],
  },
  "google-algorithm-update-recovery": {
    about: ["technical-seo"],
    mentions: ["eeat", "on-page-seo"],
  },
  "seo-strategy-consulting-expert-guidance-for-in-house-teams": {
    about: ["semantic-seo", "content-strategy"],
    mentions: ["topical-authority"],
  },
  "mayfair-luxury-brand-seo": {
    about: ["semantic-seo", "local-seo"],
    mentions: ["eeat", "entity-seo"],
  },
  "legal-seo-magic-circle-firms-2": {
    about: ["semantic-seo", "eeat"],
    mentions: ["content-strategy", "entity-seo"],
  },
  "seo-consultant-reading": {
    about: ["local-seo", "semantic-seo"],
    mentions: ["entity-seo"],
  },
  "seo-berkshire": {
    about: ["local-seo"],
    mentions: ["semantic-seo"],
  },
  "seo-bracknell": {
    about: ["local-seo"],
    mentions: ["semantic-seo"],
  },
  "seo-slough": {
    about: ["local-seo"],
    mentions: ["semantic-seo"],
  },
  "seo-maidenhead": {
    about: ["local-seo"],
    mentions: ["semantic-seo"],
  },
  "seo-wokingham": {
    about: ["local-seo"],
    mentions: ["semantic-seo"],
  },
  "seo-windsor": {
    about: ["local-seo"],
    mentions: ["semantic-seo"],
  },
};

const BLOG_TOPICS: Record<string, TopicMapping> = {
  "what-is-entity-seo": {
    about: ["entity-seo"],
    mentions: ["semantic-seo", "eeat"],
  },
  "what-is-eeat-seo": {
    about: ["eeat"],
    mentions: ["entity-seo", "semantic-seo"],
  },
  "how-to-build-topical-authority": {
    about: ["topical-authority"],
    mentions: ["semantic-seo", "content-strategy", "internal-linking"],
  },
  "topical-authority-vs-domain-authority": {
    about: ["topical-authority"],
    mentions: ["semantic-seo"],
  },
  "how-long-does-seo-take": {
    about: ["semantic-seo"],
    mentions: ["content-strategy", "technical-seo"],
  },
  "how-to-choose-seo-consultant": {
    about: ["semantic-seo"],
    mentions: ["eeat"],
  },
  "seo-mistakes": {
    about: ["semantic-seo", "technical-seo"],
    mentions: ["on-page-seo", "content-strategy"],
  },
  "increase-organic-traffic": {
    about: ["content-strategy", "semantic-seo"],
    mentions: ["keyword-research", "on-page-seo"],
  },
  "what-is-llm-optimisation": {
    about: ["llm-optimisation"],
    mentions: ["ai-search-optimisation", "entity-seo", "semantic-seo"],
  },
  "optimise-content-for-ai-search": {
    about: ["ai-search-optimisation"],
    mentions: ["llm-optimisation", "entity-seo", "semantic-seo"],
  },
  "local-seo-berkshire-guide": {
    about: ["local-seo"],
    mentions: ["technical-seo", "content-strategy"],
  },
  "what-is-a-content-brief": {
    about: ["content-strategy"],
    mentions: ["keyword-research", "semantic-seo"],
  },
  "technical-seo-vs-on-page-seo": {
    about: ["technical-seo", "on-page-seo"],
    mentions: ["semantic-seo"],
  },
  "how-many-keywords": {
    about: ["keyword-research"],
    mentions: ["content-strategy", "on-page-seo"],
  },
  "optimise-multiple-keywords": {
    about: ["keyword-research", "on-page-seo"],
    mentions: ["semantic-seo"],
  },
  "intent-competition-data": {
    about: ["keyword-research"],
    mentions: ["content-strategy"],
  },
  "how-to-be-an-seo": {
    about: ["semantic-seo"],
    mentions: ["eeat", "content-strategy"],
  },
  "wordpress-vs-webflow": {
    about: ["technical-seo"],
    mentions: ["on-page-seo"],
  },
  "freelance-seo-consultant-uk": {
    about: ["semantic-seo"],
    mentions: ["eeat", "content-strategy"],
  },
  "best-seo-companies-uk": {
    about: ["semantic-seo"],
    mentions: ["eeat", "topical-authority"],
  },
  "seo-semantic-markup-guide": {
    about: ["semantic-seo", "technical-seo"],
    mentions: ["entity-seo", "eeat"],
  },
  "eeat-checker-audit-guide": {
    about: ["eeat"],
    mentions: ["entity-seo", "semantic-seo", "topical-authority"],
  },
  "seo-statistics-uk": {
    about: ["semantic-seo"],
    mentions: ["technical-seo", "content-strategy", "local-seo", "ai-search-optimisation"],
  },
  "ai-search-statistics": {
    about: ["ai-search-optimisation"],
    mentions: ["llm-optimisation", "entity-seo", "semantic-seo"],
  },
  "local-seo-statistics": {
    about: ["local-seo"],
    mentions: ["technical-seo", "content-strategy"],
  },
  "content-marketing-statistics": {
    about: ["content-strategy"],
    mentions: ["semantic-seo", "topical-authority", "keyword-research"],
  },
  "chatgpt-ads": {
    about: ["ai-search-optimisation"],
    mentions: ["llm-optimisation", "semantic-seo", "content-strategy"],
  },
};

// =============================================================================
// HELPERS
// =============================================================================

/** Resolve topic keys to @id references for about/mentions properties */
function resolveRefs(keys: string[]) {
  return keys
    .filter((k) => k in TOPICS)
    .map((k) => ({ "@id": topicId(k) }));
}

// =============================================================================
// GLOBAL SCHEMAS (injected on every page via layout.tsx)
// =============================================================================

/**
 * Semantic triples expressed:
 *   Sunny Patel -> @type -> Person
 *   Sunny Patel -> hasOccupation -> SEO Consultant (Occupation)
 *   Sunny Patel -> knowsAbout -> [Semantic SEO, Entity SEO, ...] (DefinedTerm)
 *   Sunny Patel -> makesOffer -> [Semantic SEO Service, ...] (Offer -> Service)
 *   Sunny Patel -> workLocation -> Reading, Berkshire (Place)
 */
export function personSchema() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: "Sunny Patel",
    description:
      "Sunny Patel is an SEO consultant and AI strategist based in Reading, Berkshire, specialising in semantic SEO, topical authority, and AI search optimisation for UK businesses. 15+ years of experience building and ranking content sites.",
    jobTitle: "SEO Consultant & AI Strategist",
    url: SITE_URL,
    sameAs: [
      "https://www.linkedin.com/in/sunny-patel-co-uk/",
      SITE_URL,
    ],
    worksFor: {
      "@type": "Organization",
      name: "Figment Agency",
      url: "https://figmentagency.co.uk",
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "SEO Consultant",
      description:
        "Search engine optimisation consultant specialising in semantic SEO, entity-based optimisation, and AI search visibility",
      occupationLocation: {
        "@type": "Country",
        name: "United Kingdom",
      },
      skills:
        "Semantic SEO, Entity SEO, Topical Authority, AI Search Optimisation, Technical SEO, Content Strategy, Local SEO",
    },
    knowsAbout: Object.entries(TOPICS).map(([key, t]) => ({
      "@type": "DefinedTerm",
      "@id": topicId(key),
      name: t.name,
    })),
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Semantic SEO",
          url: `${SITE_URL}/services/semantic-seo/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Topical Authority Building",
          url: `${SITE_URL}/services/topical-authority/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Technical SEO Audit",
          url: `${SITE_URL}/services/technical-seo-audit/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Local SEO",
          url: `${SITE_URL}/services/local-seo/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AI Search Optimisation",
          url: `${SITE_URL}/services/ai-search-optimisation/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Content Strategy",
          url: `${SITE_URL}/services/content-briefs/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Keyword Research",
          url: `${SITE_URL}/services/keyword-research/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "B2B SEO",
          url: `${SITE_URL}/services/b2b-seo/`,
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "SaaS SEO",
          url: `${SITE_URL}/services/saas-seo/`,
        },
      },
    ],
    workLocation: {
      "@type": "Place",
      name: "Reading, Berkshire",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Reading",
        addressRegion: "Berkshire",
        addressCountry: "GB",
      },
    },
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    image: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#photo`,
      url: `${SITE_URL}/images/sunny-patel-seo-consultant-reading-berkshire.png`,
      contentUrl: `${SITE_URL}/images/sunny-patel-seo-consultant-reading-berkshire.png`,
      description: "Sunny Patel, SEO Consultant and AI Strategist based in Reading, Berkshire, United Kingdom",
      caption: "Sunny Patel — SEO Consultant & AI Strategist, Reading, Berkshire",
      representativeOfPage: true,
      creator: { "@id": `${SITE_URL}/#person` },
    },
  };
}

/**
 * Semantic triples expressed:
 *   Sunny Patel SEO -> @type -> Organization
 *   Sunny Patel SEO -> founder -> Sunny Patel (Person via @id)
 *   Sunny Patel SEO -> makesOffer -> [services] (Offer -> Service)
 *   Sunny Patel SEO -> hasOfferCatalog -> SEO Services (OfferCatalog)
 *   Sunny Patel SEO -> knowsAbout -> [topic entities] (DefinedTerm via @id)
 */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Sunny Patel SEO",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    founder: { "@id": `${SITE_URL}/#person` },
    sameAs: [
      "https://www.linkedin.com/in/sunny-patel-co-uk/",
      `${SITE_URL}/#localbusiness`,
    ],
    knowsAbout: Object.entries(TOPICS).map(([key, t]) => ({
      "@type": "DefinedTerm",
      "@id": topicId(key),
      name: t.name,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "SEO Services",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Methodology Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Semantic SEO", url: `${SITE_URL}/services/semantic-seo/` } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Topical Authority", url: `${SITE_URL}/services/topical-authority/` } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Content Briefs", url: `${SITE_URL}/services/content-briefs/` } },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Technical Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technical SEO Audit", url: `${SITE_URL}/services/technical-seo-audit/` } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "On-Page SEO", url: `${SITE_URL}/services/on-page-seo/` } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Internal Linking", url: `${SITE_URL}/services/internal-linking/` } },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Industry Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "B2B SEO", url: `${SITE_URL}/services/b2b-seo/` } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "SaaS SEO", url: `${SITE_URL}/services/saas-seo/` } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Local SEO", url: `${SITE_URL}/services/local-seo/` } },
          ],
        },
      ],
    },
  };
}

/**
 * Semantic triples expressed:
 *   Sunny Patel SEO -> @type -> LocalBusiness
 *   Sunny Patel SEO -> address -> Reading, Berkshire (PostalAddress)
 *   Sunny Patel SEO -> geo -> 51.4543, -0.9781 (GeoCoordinates)
 *   Sunny Patel SEO -> founder -> Sunny Patel (Person via @id)
 *   Sunny Patel SEO -> makesOffer -> [services] (Offer -> Service)
 */
export function localBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "Sunny Patel SEO",
    url: SITE_URL,
    email: "hello@sunnypatel.co.uk",
    sameAs: [
      "https://www.linkedin.com/in/sunny-patel-co-uk/",
      `${SITE_URL}/#organization`,
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Reading",
      addressRegion: "Berkshire",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.4543,
      longitude: -0.9781,
    },
    areaServed: [
      { "@type": "Country", name: "United Kingdom" },
      {
        "@type": "AdministrativeArea",
        name: "Berkshire",
        containedIn: { "@type": "Country", name: "United Kingdom" },
      },
      { "@type": "City", name: "Reading" },
    ],
    founder: { "@id": `${SITE_URL}/#person` },
    priceRange: "$$",
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Semantic SEO", url: `${SITE_URL}/services/semantic-seo/` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Local SEO", url: `${SITE_URL}/services/local-seo/` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technical SEO Audit", url: `${SITE_URL}/services/technical-seo-audit/` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Search Optimisation", url: `${SITE_URL}/services/ai-search-optimisation/` } },
    ],
  };
}

/**
 * Semantic triples expressed:
 *   sunnypatel.co.uk -> @type -> WebSite
 *   sunnypatel.co.uk -> publisher -> Sunny Patel SEO (Organization via @id)
 *   sunnypatel.co.uk -> author -> Sunny Patel (Person via @id)
 *   sunnypatel.co.uk -> about -> [topic entities] (DefinedTerm via @id)
 */
export function webSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Sunny Patel SEO",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    author: { "@id": `${SITE_URL}/#person` },
    about: [
      { "@id": topicId("semantic-seo") },
      { "@id": topicId("entity-seo") },
      { "@id": topicId("topical-authority") },
      { "@id": topicId("ai-search-optimisation") },
    ],
    inLanguage: "en-GB",
  };
}

/**
 * Returns all topic entities as full DefinedTerm objects for the global graph.
 * These are the canonical definitions that @id references across the site resolve to.
 *
 * Semantic triples expressed per entity:
 *   [Topic] -> @type -> DefinedTerm
 *   [Topic] -> name -> "Topic Name"
 *   [Topic] -> description -> "..."
 *   [Topic] -> url -> canonical page URL
 *   [Topic] -> inDefinedTermSet -> "SEO Methodology" (DefinedTermSet)
 */
export function topicEntitySchemas(): Record<string, unknown>[] {
  return Object.entries(TOPICS).map(([key, t]) => ({
    "@type": "DefinedTerm",
    "@id": topicId(key),
    name: t.name,
    description: t.description,
    url: t.url,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": `${SITE_URL}/#methodology`,
      name: "SEO Methodology",
    },
  }));
}

// =============================================================================
// PAGE-LEVEL SCHEMAS (injected on specific page types)
// =============================================================================

/**
 * Semantic triples expressed:
 *   [Article] -> @type -> BlogPosting
 *   [Article] -> about -> [primary topic entities] (DefinedTerm via @id)
 *   [Article] -> mentions -> [secondary topic entities] (DefinedTerm via @id)
 *   [Article] -> author -> Sunny Patel (Person via @id)
 *   [Article] -> publisher -> Sunny Patel SEO (Organization via @id)
 *   [Article] -> isPartOf -> sunnypatel.co.uk (WebSite via @id)
 */
export function articleSchema({
  title,
  description,
  slug,
  date,
  lastUpdated,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  date?: string;
  lastUpdated?: string;
  image?: string;
}) {
  const topics = BLOG_TOPICS[slug];
  const aboutRefs = topics ? resolveRefs(topics.about) : [];
  const mentionRefs = topics ? resolveRefs(topics.mentions) : [];

  return {
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${SITE_URL}/blog/${slug}`,
    ...(date && { datePublished: date, dateModified: lastUpdated || date }),
    ...(image && { image: `${SITE_URL}${image}` }),
    author: { "@id": `${SITE_URL}/#person` },
    editor: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(aboutRefs.length > 0 && { about: aboutRefs }),
    ...(mentionRefs.length > 0 && { mentions: mentionRefs }),
    inLanguage: "en-GB",
  };
}

/**
 * Semantic triples expressed:
 *   [Service] -> @type -> ProfessionalService
 *   [Service] -> about -> [primary topic entities] (DefinedTerm via @id)
 *   [Service] -> mentions -> [secondary topic entities] (DefinedTerm via @id)
 *   [Service] -> provider -> Sunny Patel (Person via @id)
 *   [Service] -> offeredBy -> Sunny Patel SEO (Organization via @id)
 *   [Service] -> areaServed -> United Kingdom (Country)
 */
export function serviceSchema({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  const topics = SERVICE_TOPICS[slug];
  const aboutRefs = topics ? resolveRefs(topics.about) : [];
  const mentionRefs = topics ? resolveRefs(topics.mentions) : [];

  return {
    "@type": "ProfessionalService",
    name,
    description,
    url: `${SITE_URL}/services/${slug}`,
    provider: { "@id": `${SITE_URL}/#person` },
    editor: { "@id": `${SITE_URL}/#person` },
    offeredBy: { "@id": `${SITE_URL}/#organization` },
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    ...(aboutRefs.length > 0 && { about: aboutRefs }),
    ...(mentionRefs.length > 0 && { mentions: mentionRefs }),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function portfolioSchema({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  return {
    "@type": "CreativeWork",
    headline: title,
    description,
    url: `${SITE_URL}/portfolio/${slug}`,
    author: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

/**
 * Standalone ImageObject for Sunny Patel's profile photo.
 * Injected on the /about page so Google can index it in Google Images
 * and associate it with the Person entity via the @id reference.
 *
 * Semantic triples expressed:
 *   [Photo] -> @type -> ImageObject
 *   [Photo] -> creator -> Sunny Patel (Person via @id)
 *   [Photo] -> representativeOfPage -> true
 */
export function profileImageSchema() {
  return {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#photo`,
    url: `${SITE_URL}/images/sunny-patel-seo-consultant-reading-berkshire.png`,
    contentUrl: `${SITE_URL}/images/sunny-patel-seo-consultant-reading-berkshire.png`,
    description: "Sunny Patel, SEO Consultant and AI Strategist based in Reading, Berkshire, United Kingdom",
    caption: "Sunny Patel — SEO Consultant & AI Strategist, Reading, Berkshire",
    representativeOfPage: true,
    creator: { "@id": `${SITE_URL}/#person` },
    inLanguage: "en-GB",
  };
}

export function reviewSchema(
  reviews: readonly { text: string; author: string; role: string }[]
) {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    review: reviews.map((r) => ({
      "@type": "Review",
      reviewBody: r.text,
      author: {
        "@type": "Person",
        name: r.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: 5,
        bestRating: 5,
      },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: reviews.length,
      bestRating: 5,
    },
  };
}

export function schemaGraph(...schemas: Record<string, unknown>[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas,
  });
}
