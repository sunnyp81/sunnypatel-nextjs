// Sources cited in "Get Your Business Seen Online". The printed QR code points at /book/sources/.
// To update: edit a link, set `checked` to the date you opened it, and bump LINKS_LAST_CHECKED.

export const BOOK = {
  title: "Get Your Business Seen Online",
  subtitle: "A practical guide to websites, SEO and AI search for UK businesses",
  author: "Sunny Patel",
} as const;

export const LINKS_LAST_CHECKED = "2026-10-05";

export type BookSource = {
  title: string;
  publisher: string;
  url: string;
  note: string;
  checked: string;
  /** Address printed in the book when it now redirects to `url`. */
  printedUrl?: string;
};

export type BookChapter = {
  label: string;
  title: string;
  sources: BookSource[];
};

export type BookPart = {
  id: string;
  label: string;
  title: string;
  chapters: BookChapter[];
};

const C = LINKS_LAST_CHECKED;

const S = {
  starterGuide: {
    title: "SEO Starter Guide",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
    note: "Google's own introduction to the basic search and page practices covered in chapters 2 to 4.",
    checked: C,
  },
  howSearchWorks: {
    title: "In-depth guide to how Google Search works",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/fundamentals/how-search-works",
    note: "Crawling, indexing and serving explained by Google.",
    checked: C,
  },
  sitemaps: {
    title: "What is a sitemap",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview",
    note: "What a sitemap does, and why it helps discovery without guaranteeing indexing.",
    checked: C,
  },
  robots: {
    title: "Robots.txt introduction and guide",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
    note: "What robots.txt controls, and what it does not.",
    checked: C,
  },
  noindex: {
    title: "Block search indexing with noindex",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing/block-indexing",
    note: "How the noindex rule keeps a page out of Google's results.",
    checked: C,
  },
  canonical: {
    title: "How to specify a canonical URL",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    note: "Choosing the preferred address when the same content appears at several URLs.",
    checked: C,
  },
  visualGallery: {
    title: "Visual elements gallery of Google Search",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/visual-elements-gallery",
    note: "The different kinds of result a search page can show.",
    checked: C,
  },
  rankingSystems: {
    title: "A guide to Google Search ranking systems",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/ranking-systems-guide",
    note: "Google's published list of ranking systems. There is no single checklist for a guaranteed position.",
    checked: C,
  },
  scPerformance: {
    title: "Performance report (search results)",
    publisher: "Search Console Help",
    url: "https://support.google.com/webmasters/answer/7576553?hl=en",
    note: "What the Search Console performance report counts, including query data omitted for privacy.",
    checked: C,
  },
  bingWebmaster: {
    title: "Bing Webmaster Tools",
    publisher: "Microsoft Bing",
    url: "https://www.bing.com/webmasters/about",
    note: "Bing's service for website owners: search reporting and site checks.",
    checked: C,
  },
  trends: {
    title: "FAQ about Google Trends data",
    publisher: "Trends Help",
    url: "https://support.google.com/trends/answer/4365533",
    note: "Why Trends shows relative interest rather than search counts.",
    checked: C,
  },
  keywordPlanner: {
    title: "About Keyword Planner forecasts",
    publisher: "Google Ads Help",
    url: "https://support.google.com/google-ads/answer/3022575?hl=en",
    note: "How Keyword Planner metrics are estimated, and their limits.",
    checked: C,
  },
  titleLink: {
    title: "Influencing title links in Google Search",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/title-link",
    note: "How the title you supply relates to the headline Google displays.",
    checked: C,
  },
  snippet: {
    title: "Control your snippets in search results",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/snippet",
    note: "Meta descriptions and the search-dependent summaries Google shows.",
    checked: C,
  },
  helpfulContent: {
    title: "Creating helpful, reliable, people-first content",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    note: "Google's questions for judging whether content is written for people.",
    checked: C,
  },
  w3cImages: {
    title: "Images tutorial",
    publisher: "W3C Web Accessibility Initiative",
    url: "https://www.w3.org/WAI/tutorials/images/",
    note: "Writing useful text alternatives for images.",
    checked: C,
  },
  coreWebVitals: {
    title: "Understanding Core Web Vitals and Google search results",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/core-web-vitals",
    note: "How Google describes Core Web Vitals in relation to search.",
    checked: C,
  },
  linksCrawlable: {
    title: "SEO link best practices for Google",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
    note: "Crawlable links and descriptive anchor text.",
    checked: C,
  },
  gbpPerformance: {
    title: "Understand your Business Profile performance and insights",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/9918094?hl=en",
    note: "Calls, direction requests and other profile actions that never appear as website clicks.",
    checked: C,
  },
  localRanking: {
    title: "Tips to improve your local ranking on Google",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/7091?hl=en",
    note: "Relevance, distance and prominence in local results.",
    checked: C,
  },
  gbpEligibility: {
    title: "Business eligibility and ownership guidelines",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/13763036?hl=en",
    note: "Which businesses qualify for a profile, and who should own and manage it.",
    checked: C,
  },
  serviceAreas: {
    title: "Manage your service areas",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/9157481?hl=en",
    note: "Service-area limits and when to hide a business address.",
    checked: C,
  },
  gbpGuidelines: {
    title: "Guidelines for representing your business on Google",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/3038177?hl=en",
    note: "Rules for names, addresses and other profile details.",
    checked: C,
  },
  gbpCategory: {
    title: "Manage your business category",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/7249669?hl=en",
    note: "Choosing primary and additional categories.",
    checked: C,
  },
  gbpHours: {
    title: "Edit your business hours",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/15300403?hl=en",
    note: "Regular, special and more hours on a profile.",
    checked: C,
  },
  reviewPolicy: {
    title: "Prohibited and restricted content",
    publisher: "Maps User Generated Content Policy Help",
    url: "https://support.google.com/contributionpolicy/answer/7400114?hl=en",
    note: "Google's rules on fake, incentivised and conflicted reviews.",
    checked: C,
  },
  reviewLink: {
    title: "Create a Google link or QR code to request reviews",
    publisher: "Google Business Profile Help",
    url: "https://support.google.com/business/answer/16816815?hl=en-GB",
    note: "Sharing a direct review link with real customers.",
    checked: C,
  },
  bingPlacesBlog: {
    title: "Introducing the new Bing Places for Business",
    publisher: "Bing Search Blog",
    url: "https://blogs.bing.com/search/2025/10/Introducing-the-New-Bing-Places-for-Business-Built-for-Business-Owners,-Powered-by-Research/",
    note: "Microsoft's October 2025 announcement of the rebuilt Bing Places.",
    checked: C,
  },
  bingPlaces: {
    title: "Bing Places business guidance",
    publisher: "Bing Places for Business",
    url: "https://www.bing.com/forbusiness/help/modernExperience?setlang=en",
    note: "UK availability, service-area eligibility and account guidance.",
    checked: C,
  },
  bingPlacesFaq: {
    title: "Bing Places verification FAQ",
    publisher: "Bing Places for Business",
    url: "https://www.bing.com/forbusiness/help/frequentlyAskedQuestions",
    note: "Verification, private addresses and authorised ownership.",
    checked: C,
  },
  spamPolicies: {
    title: "Spam policies for Google web search",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/essentials/spam-policies",
    note: "Google's policies on doorway pages, scaled content and link spam.",
    checked: C,
  },
  scMetrics: {
    title: "What are impressions, position and clicks?",
    publisher: "Search Console Help",
    url: "https://support.google.com/webmasters/answer/7042828?hl=en",
    note: "How Search Console defines each performance metric.",
    checked: C,
  },
  ga4Sessions: {
    title: "About Analytics sessions",
    publisher: "Analytics Help",
    url: "https://support.google.com/analytics/answer/9191807?hl=en",
    note: "How Google Analytics groups interactions into sessions.",
    checked: C,
  },
  ga4Events: {
    title: "About events",
    publisher: "Analytics Help",
    url: "https://support.google.com/analytics/answer/9322688?hl=en",
    note: "Events as measured interactions, which are not the same as received enquiries.",
    checked: C,
  },
  icoExceptions: {
    title: "Storage and access technologies: what are the exceptions?",
    publisher: "Information Commissioner's Office",
    url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/",
    note: "The statistical purposes exception for analytics and the limits of consent.",
    checked: C,
  },
  consentMode: {
    title: "Consent mode overview",
    publisher: "Google Tag Platform",
    url: "https://developers.google.com/tag-platform/security/concepts/consent-mode",
    note: "How Google tags behave when consent is granted or denied.",
    checked: C,
  },
  siteMove: {
    title: "Site moves and migrations",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes",
    note: "Planning redirects and checks when page addresses change.",
    checked: C,
  },
  webVitals: {
    title: "Web Vitals",
    publisher: "web.dev",
    url: "https://web.dev/articles/vitals",
    note: "The Core Web Vitals metrics and their thresholds.",
    checked: C,
  },
  lighthouse: {
    title: "Lighthouse performance scoring",
    publisher: "Chrome for Developers",
    url: "https://developer.chrome.com/docs/lighthouse/performance/performance-scoring",
    note: "How a lab performance score is calculated, and why it differs from field data.",
    checked: C,
  },
  pageExperience: {
    title: "Understanding Google page experience",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/page-experience",
    note: "Google's guidance on page experience and search.",
    checked: C,
  },
  wcag22: {
    title: "Web Content Accessibility Guidelines (WCAG) 2.2",
    publisher: "W3C",
    url: "https://www.w3.org/TR/WCAG22/",
    note: "The accessibility standard used as the design target in chapter 9.",
    checked: C,
  },
  wcagContrast: {
    title: "Understanding 1.4.3 Contrast (Minimum)",
    publisher: "W3C Web Accessibility Initiative",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
    note: "Minimum text contrast and how it is measured.",
    checked: C,
  },
  wcagFocus: {
    title: "Understanding 2.4.11 Focus Not Obscured (Minimum)",
    publisher: "W3C Web Accessibility Initiative",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html",
    note: "Keeping the keyboard focus visible behind sticky headers and banners.",
    checked: C,
  },
  wcagTarget: {
    title: "Understanding 2.5.8 Target Size (Minimum)",
    publisher: "W3C Web Accessibility Initiative",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
    note: "Minimum size and spacing for buttons and links.",
    checked: C,
  },
  w3cForms: {
    title: "Forms tutorial",
    publisher: "W3C Web Accessibility Initiative",
    url: "https://www.w3.org/WAI/tutorials/forms/",
    note: "Labels, instructions and error messages for accessible forms.",
    checked: C,
  },
  wcagReflow: {
    title: "Understanding 1.4.10 Reflow",
    publisher: "W3C Web Accessibility Initiative",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
    note: "Content that still works when zoomed or on a narrow screen.",
    checked: C,
  },
  wcagAnimation: {
    title: "Understanding 2.3.3 Animation from Interactions",
    publisher: "W3C Web Accessibility Initiative",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html",
    note: "Letting people turn off motion triggered by scrolling or clicking.",
    checked: C,
  },
  statusCodes: {
    title: "How HTTP status codes affect Google's crawlers",
    publisher: "Google Crawling Infrastructure",
    url: "https://developers.google.com/crawling/docs/troubleshooting/http-status-codes",
    note: "What 200, 301, 404, 410 and 5xx responses mean for crawling.",
    checked: C,
  },
  csp: {
    title: "Content Security Policy (CSP)",
    publisher: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP",
    note: "How a CSP header allows or blocks scripts, images and connections.",
    checked: C,
  },
  indexNow: {
    title: "IndexNow documentation",
    publisher: "IndexNow.org",
    url: "https://www.indexnow.org/documentation",
    note: "Notifying participating search engines when pages change.",
    checked: C,
  },
  indexingApi: {
    title: "How to use the Indexing API",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/apis/indexing-api/v3/using-api",
    note: "The API is limited to job-posting and livestream pages, not ordinary service pages.",
    checked: C,
  },
  sitemapPing: {
    title: "Sitemaps ping endpoint is going away",
    publisher: "Google Search Central Blog",
    url: "https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping",
    note: "Google's 2023 notice retiring the sitemap ping endpoint.",
    checked: C,
  },
  urlInspection: {
    title: "URL Inspection tool",
    publisher: "Search Console Help",
    url: "https://support.google.com/webmasters/answer/9012289?hl=en",
    note: "The difference between indexed information and a live test.",
    checked: C,
  },
  aiFeatures: {
    title: "AI features and your website",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
    note: "No special schema or technical requirement for AI Overviews or AI Mode, and how their traffic is reported.",
    checked: C,
  },
  googleCrawlers: {
    title: "Google's common crawlers",
    publisher: "Google Crawling Infrastructure",
    url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
    note: "Google's crawler names, including Google-Extended, for robots.txt decisions.",
    checked: C,
  },
  bingCrawlers: {
    title: "Which crawlers does Bing use?",
    publisher: "Bing Webmaster Tools Help",
    url: "https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0",
    note: "Bing's crawler names and user agents.",
    checked: C,
  },
  openaiCrawlers: {
    title: "Overview of OpenAI crawlers",
    publisher: "OpenAI",
    url: "https://developers.openai.com/api/docs/bots",
    note: "OpenAI's crawler names and what each one is used for.",
    checked: C,
  },
  bingAiPerformance: {
    title: "AI Performance report",
    publisher: "Bing Webmaster Tools Help",
    url: "https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c",
    note: "Page citations and grounding queries reported by Bing, where available.",
    checked: C,
  },
  kalicubeCorroboration: {
    title: "Entity corroboration",
    publisher: "Kalicube",
    url: "https://kalicube.com/entity/entity-corroboration/",
    note: "Jason Barnard's explanation of how independent sources confirm facts about an entity.",
    checked: C,
  },
  knowledgePanel: {
    title: "How Google's Knowledge Graph works",
    publisher: "Knowledge Panel Help",
    url: "https://support.google.com/knowledgepanel/answer/9787176",
    note: "Google's own description of the Knowledge Graph and knowledge panels.",
    checked: C,
  },
  sdIntro: {
    title: "Introduction to structured data markup",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
    note: "What structured data is and how Google uses it.",
    checked: C,
  },
  schemaService: {
    title: "Service",
    publisher: "Schema.org",
    url: "https://schema.org/Service",
    note: "The vocabulary definition for describing a service a business offers.",
    checked: C,
  },
  localBusiness: {
    title: "Local business structured data",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/structured-data/local-business",
    note: "Google's LocalBusiness markup guidance.",
    checked: C,
  },
  sdPolicies: {
    title: "General structured data guidelines",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
    note: "Markup must match visible facts; valid markup does not guarantee a rich result.",
    checked: C,
  },
  searchUpdates: {
    title: "Latest Google Search documentation updates",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/updates",
    note: "Dated changes, including the May and June 2026 entries retiring FAQ rich results and their documentation.",
    checked: C,
  },
  qualifyLinks: {
    title: "Qualify outbound links",
    publisher: "Google Search Central",
    url: "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
    note: "When to mark links as sponsored, user-generated or nofollow.",
    checked: C,
  },
  icoKeyConcepts: {
    title: "Key concepts for direct marketing using electronic mail",
    publisher: "Information Commissioner's Office",
    url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/key-concepts-for-direct-marketing-using-electronic-mail/",
    note: "Service messages, promotional content and subscriber types.",
    checked: C,
  },
  icoEmailRules: {
    title: "How do we comply with the PECR electronic mail marketing rules?",
    publisher: "Information Commissioner's Office",
    url: "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/",
    note: "Consent, the soft opt-in and opt-out requirements for marketing email.",
    checked: C,
  },
  holisticSeo: {
    title: "Holistic SEO",
    publisher: "Koray Tugberk Gubur",
    url: "https://www.holisticseo.digital/",
    note: "Koray Tugberk Gubur's semantic SEO and topical map work, which informs chapters 12, 13, 23 and 24.",
    checked: C,
  },
  kalicube: {
    title: "Kalicube",
    publisher: "Jason Barnard",
    url: "https://kalicube.com/",
    note: "Jason Barnard's entity and Entity Home work, which informs chapters 14 and 25.",
    checked: C,
  },
} satisfies Record<string, BookSource>;

export const BOOK_PARTS: BookPart[] = [
  {
    id: "part-1",
    label: "Part 1",
    title: "Understand how customers find you",
    chapters: [
      {
        label: "Chapter 2",
        title: "SEO basics: how search engines work",
        sources: [S.howSearchWorks, S.sitemaps, S.robots, S.noindex, S.canonical, S.visualGallery, S.rankingSystems],
      },
      {
        label: "Chapter 3",
        title: "SEO basics: keywords and intent",
        sources: [S.scPerformance, S.bingWebmaster, S.trends, S.keywordPlanner],
      },
      {
        label: "Chapter 4",
        title: "SEO basics: the page",
        sources: [S.titleLink, S.snippet, S.helpfulContent, S.w3cImages, S.coreWebVitals, S.linksCrawlable],
      },
      {
        label: "Chapter 5",
        title: "SEO basics: local SEO for UK businesses",
        sources: [
          S.gbpPerformance,
          S.localRanking,
          S.gbpEligibility,
          S.serviceAreas,
          S.gbpGuidelines,
          S.gbpCategory,
          S.gbpHours,
          S.reviewPolicy,
          S.reviewLink,
          S.bingPlacesBlog,
          S.bingPlaces,
          S.bingPlacesFaq,
          S.spamPolicies,
        ],
      },
      {
        label: "Chapter 6",
        title: "Measure visibility and enquiries honestly",
        sources: [S.scMetrics, S.ga4Sessions, S.scPerformance, S.ga4Events, S.icoExceptions, S.consentMode],
      },
    ],
  },
  {
    id: "part-2",
    label: "Part 2",
    title: "Build and design a website that gets seen and converts",
    chapters: [
      {
        label: "Chapter 7",
        title: "Choose the platform and plan the site",
        sources: [S.siteMove],
      },
      {
        label: "Chapter 9",
        title: "Make the website fast, mobile and accessible",
        sources: [
          S.webVitals,
          S.lighthouse,
          S.pageExperience,
          S.wcag22,
          S.wcagContrast,
          S.wcagFocus,
          S.wcagTarget,
          S.w3cForms,
          S.w3cImages,
          S.wcagReflow,
          S.wcagAnimation,
        ],
      },
      {
        label: "Chapter 10",
        title: "Launch, rebuild and check the live website",
        sources: [
          S.statusCodes,
          S.robots,
          S.noindex,
          S.canonical,
          S.csp,
          S.sitemaps,
          S.indexNow,
          S.indexingApi,
          S.sitemapPing,
          S.urlInspection,
        ],
      },
    ],
  },
  {
    id: "part-3",
    label: "Part 3",
    title: "Develop search coverage and credibility",
    chapters: [
      {
        label: "Chapter 11",
        title: "Google, Bing and AI assistants",
        sources: [S.aiFeatures, S.googleCrawlers, S.bingCrawlers, S.openaiCrawlers, S.bingAiPerformance],
      },
      { label: "Chapter 12", title: "Build a map of real demand", sources: [S.holisticSeo] },
      { label: "Chapter 13", title: "Semantic content that people can read", sources: [S.holisticSeo] },
      {
        label: "Chapter 14",
        title: "Make your business an identifiable entity",
        sources: [S.kalicube, S.kalicubeCorroboration, S.knowledgePanel],
      },
      {
        label: "Chapter 15",
        title: "Structured data, honestly",
        sources: [S.sdIntro, S.schemaService, S.localBusiness, S.sdPolicies, S.searchUpdates],
      },
      {
        label: "Chapter 16",
        title: "Internal links that help people move",
        sources: [S.linksCrawlable],
      },
      {
        label: "Chapter 17",
        title: "Earn links and mentions",
        sources: [S.spamPolicies, S.qualifyLinks],
      },
    ],
  },
  {
    id: "part-4",
    label: "Part 4",
    title: "Turn attention into an enquiry",
    chapters: [
      {
        label: "Chapter 18",
        title: "Receive and follow up the enquiry",
        sources: [S.icoKeyConcepts, S.icoEmailRules],
      },
    ],
  },
  {
    id: "part-5",
    label: "Part 5",
    title: "Grow, test and decide",
    chapters: [
      {
        label: "Chapter 19",
        title: "Improve, refresh and scale with restraint",
        sources: [S.titleLink, S.snippet, S.helpfulContent, S.spamPolicies],
      },
    ],
  },
  {
    id: "part-6",
    label: "Part 6",
    title: "How I do SEO: the methods in depth",
    chapters: [
      { label: "Chapter 23", title: "Topical maps and source context", sources: [S.holisticSeo] },
      { label: "Chapter 24", title: "Semantic writing and micro-semantic review", sources: [S.holisticSeo] },
      {
        label: "Chapter 25",
        title: "Entities, the Entity Home and brand consensus",
        sources: [S.kalicube],
      },
    ],
  },
  {
    id: "appendices",
    label: "Appendices",
    title: "Checklists, playbooks, glossary and worksheets",
    chapters: [
      {
        label: "Appendix D",
        title: "Worksheets and source notes",
        sources: [S.starterGuide],
      },
    ],
  },
];

export const BOOK_SOURCE_COUNT = new Set(
  BOOK_PARTS.flatMap((p) => p.chapters.flatMap((c) => c.sources.map((s) => s.url)))
).size;
