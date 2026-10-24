// Index for /statistics/. Each headline figure is already published, with its source, on the page named by `slug`.
// Update dates are read from the blog entry itself, never typed here, so they cannot drift from the page.
// To change a figure: edit the page first, then copy the figure and its source here.

export type StatDownload = { label: string; href: string };

export type StatPage = {
  slug: string;
  shortTitle: string;
  summary: string;
  figure: { value: string; label: string; source: string };
  downloads?: StatDownload[];
};

export type StatGroup = { id: string; title: string; blurb: string; pages: StatPage[] };

export const STAT_GROUPS: StatGroup[] = [
  {
    id: "search-ai",
    title: "Search and AI",
    blurb: "Who gets the clicks, and how AI answers are changing that.",
    pages: [
      {
        slug: "seo-statistics-uk",
        shortTitle: "UK SEO statistics",
        summary: "Search engine share, click-through rates, agency numbers and AI referral data for the UK.",
        figure: {
          value: "91.35%",
          label: "of UK search referrals came from Google",
          source: "Statcounter, September 2026",
        },
        downloads: [
          { label: "CSV", href: "/downloads/seo-statistics-uk-2026.csv" },
          { label: "JSON", href: "/downloads/seo-statistics-uk-2026.json" },
        ],
      },
      {
        slug: "ai-search-statistics",
        shortTitle: "AI search statistics",
        summary: "Platform usage, AI Overviews, citations and AI referral traffic, with the sample behind each number.",
        figure: {
          value: "1.2bn+",
          label: "people use ChatGPT each week",
          source: "OpenAI, 21 October 2026",
        },
      },
      {
        slug: "ai-referral-traffic-study",
        shortTitle: "AI referral traffic study",
        summary: "First-party GA4 data: how much traffic AI assistants send across 104 sites, by assistant and sector.",
        figure: {
          value: "1.84%",
          label: "of sessions came from AI assistants across 104 sites",
          source: "Author's own portfolio data, GA4, 90 days to 21 September 2026",
        },
      },
      {
        slug: "uk-ai-overviews-by-industry",
        shortTitle: "UK AI Overviews by industry",
        summary: "How often Google shows an AI Overview across 10 UK sectors, and which kinds of source it cites.",
        figure: {
          value: "47.8%",
          label: "of 393 usable UK queries showed an AI Overview",
          source: "Ahrefs GB SERP data, 25 September 2026",
        },
      },
      {
        slug: "google-ctr-study",
        shortTitle: "Google CTR by position",
        summary: "What published studies report for click-through rate by position, with this site's own benchmark withdrawn and explained.",
        figure: {
          value: "7.1% to 28.5%",
          label: "range of position-one organic CTR across three published studies",
          source: "First Page Sage, Advanced Web Ranking and Sistrix, 2026",
        },
      },
      {
        slug: "content-marketing-statistics",
        shortTitle: "Content marketing statistics",
        summary: "What content programmes cost, where they pay back, and what being cited in AI answers is worth.",
        figure: {
          value: "+120%",
          label: "organic clicks per impression when a brand is cited in the AI Overview",
          source: "Seer Interactive, 2026 update",
        },
      },
    ],
  },
  {
    id: "local",
    title: "Local and sector",
    blurb: "Reviews, the Local Pack and one sector worked through in detail.",
    pages: [
      {
        slug: "local-seo-statistics",
        shortTitle: "Local SEO statistics",
        summary: "Reviews, Local Pack behaviour and AI Overviews on local searches, with US and UK scope marked.",
        figure: {
          value: "80%",
          label: "of consumers likely to use a business that replies to all reviews",
          source: "BrightLocal, 2026 survey of US adults",
        },
      },
      {
        slug: "uk-dental-marketing-statistics",
        shortTitle: "UK dental marketing statistics",
        summary: "Sourced figures for dental practices, with the gaps where no UK dental data exists stated outright.",
        figure: {
          value: "49%",
          label: "trust online reviews from strangers about as much as personal recommendations",
          source: "BrightLocal, 2026 survey of US adults",
        },
      },
    ],
  },
  {
    id: "web-commerce",
    title: "Web and commerce",
    blurb: "The size of the web and how much UK buying has moved online.",
    pages: [
      {
        slug: "how-many-websites-are-there",
        shortTitle: "How many websites are there",
        summary: "Domains, active sites, CMS share and UK registrations, each from the registry or survey that counts them.",
        figure: {
          value: "411.6m",
          label: "domain name registrations across all top-level domains",
          source: "Verisign, Q3 2026",
        },
      },
      {
        slug: "uk-ecommerce-seo-statistics",
        shortTitle: "UK ecommerce SEO statistics",
        summary: "Online share of sales, conversion rates, device split and Core Web Vitals for ecommerce sites.",
        figure: {
          value: "28.8%",
          label: "of Great Britain retail sales made online",
          source: "ONS, September 2026",
        },
      },
    ],
  },
  {
    id: "pay-links",
    title: "Pay and links",
    blurb: "What marketing roles and SEO consultants cost, and which pages earn links.",
    pages: [
      {
        slug: "uk-marketing-salary-statistics",
        shortTitle: "UK marketing salary statistics",
        summary: "Median pay by marketing role from the ONS survey, with margins of error and downloads.",
        figure: {
          value: "£55,215",
          label: "median pay for marketing and commercial managers",
          source: "ONS ASHE 2026 provisional",
        },
        downloads: [
          { label: "CSV", href: "/downloads/uk-marketing-salaries-2026.csv" },
          { label: "JSON", href: "/downloads/uk-marketing-salaries-2026.json" },
        ],
      },
      {
        slug: "how-much-does-an-seo-consultant-charge-uk",
        shortTitle: "UK SEO consultant pricing",
        summary: "Published monthly prices from UK agencies and freelancers, with the inclusion rules for each.",
        figure: {
          value: "£497",
          label: "median entry-level monthly retainer across 61 UK providers with a published price",
          source: "Provider websites checked 24 to 25 September 2026",
        },
      },
      {
        slug: "link-building-statistics",
        shortTitle: "Link building statistics",
        summary: "First-party data: which page types on this site earn referring domains, and which do not.",
        figure: {
          value: "31",
          label: "referring domains held by five statistics pages on this site",
          source: "Ahrefs, checked 24 September 2026",
        },
        downloads: [
          { label: "CSV", href: "/downloads/link-building-statistics-2026.csv" },
          { label: "JSON", href: "/downloads/link-building-statistics-2026.json" },
        ],
      },
    ],
  },
];

export const STAT_PAGE_COUNT = STAT_GROUPS.reduce((n, g) => n + g.pages.length, 0);
