export type Tool = {
  name: string;
  description: string;
  href: string;
  category: string;
};

export const tools: Tool[] = [
  {
    name: "Keyword Suggestions",
    description: "Scrape Google Autocomplete suggestions across 8 regions with a-z expansion.",
    href: "/tools/keyword-scraper/",
    category: "Keyword Research",
  },
  {
    name: "SERP Snippet Previewer",
    description: "See exactly how your page will appear in Google search results before publishing.",
    href: "/tools/serp-preview/",
    category: "On-Page SEO",
  },
  {
    name: "Bulk Title Tag Checker",
    description: "Check multiple title tags at once for character count, pixel width, and truncation.",
    href: "/tools/title-checker/",
    category: "On-Page SEO",
  },
  {
    name: "Schema Markup Generator",
    description: "Generate valid JSON-LD structured data for FAQ, Article, LocalBusiness, Product, and more.",
    href: "/tools/schema-generator/",
    category: "Technical SEO",
  },
  {
    name: "Robots.txt Generator",
    description: "Build a valid robots.txt with a visual editor. Includes AI crawler blocking presets.",
    href: "/tools/robots-generator/",
    category: "Technical SEO",
  },
  {
    name: "Hreflang Tag Generator",
    description: "Generate correct hreflang tags for multilingual sites in HTML or XML sitemap format.",
    href: "/tools/hreflang-generator/",
    category: "Technical SEO",
  },
  {
    name: "Redirect Chain Checker",
    description: "Follow and visualise the full redirect chain for any URL. Detect loops and 302s.",
    href: "/tools/redirect-checker/",
    category: "Technical SEO",
  },
  {
    name: "UTM Link Builder",
    description: "Build UTM-tagged campaign URLs with presets for common sources and mediums.",
    href: "/tools/utm-builder/",
    category: "Analytics",
  },
  {
    name: "SEO ROI Calculator",
    description: "Forecast clicks, leads, revenue, payback, and first-year ROI from a keyword's volume and target ranking.",
    href: "/tools/seo-roi-calculator/",
    category: "Analytics",
  },
  {
    name: "SEO Prompt Library",
    description: "22 copy-paste ChatGPT, Claude, and Gemini prompts for demand mapping, topical maps, briefs, schema, and AI search.",
    href: "/tools/seo-prompts/",
    category: "AI & Prompts",
  },
  {
    name: "Keyword Density Checker",
    description: "Analyse word frequency, 2-word and 3-word phrase density in your content.",
    href: "/tools/keyword-density/",
    category: "Content",
  },
  {
    name: "Readability Score Calculator",
    description: "Check Flesch Reading Ease, Flesch-Kincaid Grade Level, and Gunning Fog Index.",
    href: "/tools/readability-score/",
    category: "Content",
  },
  {
    name: "Internal Link Suggester",
    description: "Find internal linking opportunities between two pages by matching anchor text phrases.",
    href: "/tools/internal-links/",
    category: "Content",
  },
  {
    name: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs. See reading time and top keywords.",
    href: "/tools/word-counter/",
    category: "Content",
  },
  {
    name: "Text Diff Checker",
    description: "Compare two texts side by side. Highlight additions, deletions, and modifications.",
    href: "/tools/text-diff/",
    category: "Content",
  },
  {
    name: "AI Visibility Checker",
    description: "Can ChatGPT, Perplexity and AI Overviews cite your site? Scored report across crawl access, schema, entities, and answerability.",
    href: "/tools/ai-visibility-checker/",
    category: "Website Audit",
  },
  {
    name: "Website Grader",
    description: "Get an instant A-F grade covering SEO, page speed, security, and content quality.",
    href: "/tools/website-grader/",
    category: "Website Audit",
  },
  {
    name: "Website Speed Checker",
    description: "Test Core Web Vitals - LCP, CLS, and more - with actionable speed recommendations.",
    href: "/tools/speed-checker/",
    category: "Website Audit",
  },
  {
    name: "Broken Link Checker",
    description: "Scan any page for broken links and 404 errors. Export results as CSV.",
    href: "/tools/broken-links/",
    category: "Website Audit",
  },
  {
    name: "SSL Certificate Checker",
    description: "Check SSL expiry, issuer, and chain validity. HTTPS is a Google ranking signal.",
    href: "/tools/ssl-checker/",
    category: "Website Audit",
  },
  {
    name: "Open Graph Preview",
    description: "See how your URL looks when shared on Facebook, Twitter/X, and LinkedIn.",
    href: "/tools/og-preview/",
    category: "Social & Sharing",
  },
  {
    name: "Google Review Link Generator",
    description: "Generate a direct link for customers to leave a Google review. Boost local SEO.",
    href: "/tools/review-link/",
    category: "Local SEO",
  },
  {
    name: "Image Compressor",
    description: "Compress images in-browser to improve page speed. No upload - 100% private.",
    href: "/tools/image-compressor/",
    category: "Page Speed",
  },
];

export const categories = [...new Set(tools.map((t) => t.category))];
