import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/services/ai-visibility-audit", destination: "/services/paid-seo-audit/", permanent: true },
      { source: "/services/ai-visibility-audit/", destination: "/services/paid-seo-audit/", permanent: true },
      {
        source: "/services/generative-engine-optimisation",
        destination: "/services/ai-search-optimisation/",
        permanent: true,
      },
      {
        source: "/services/mayfair-luxury-brand-seo",
        destination: "/",
        permanent: true,
      },
      {
        source: "/services/mayfair-luxury-brand-seo/",
        destination: "/",
        permanent: true,
      },
      // Local cluster consolidation: /services/seo-consultant-reading/ merged into
      // the homepage, which now targets "SEO Consultant Reading" as its money term.
      { source: "/services/seo-consultant-reading", destination: "/", permanent: true },
      { source: "/services/seo-consultant-reading/", destination: "/", permanent: true },
      // National location pages pruned (doorway/thin-page risk, outside the Berkshire
      // beachhead). 301 to the homepage to consolidate brand equity.
      { source: "/services/seo-consultant-london", destination: "/", permanent: true },
      { source: "/services/seo-consultant-london/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-manchester", destination: "/", permanent: true },
      { source: "/services/seo-consultant-manchester/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-kent", destination: "/", permanent: true },
      { source: "/services/seo-consultant-kent/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-oxford", destination: "/", permanent: true },
      { source: "/services/seo-consultant-oxford/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-surrey", destination: "/", permanent: true },
      { source: "/services/seo-consultant-surrey/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-southampton", destination: "/", permanent: true },
      { source: "/services/seo-consultant-southampton/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-nottingham", destination: "/", permanent: true },
      { source: "/services/seo-consultant-nottingham/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-preston", destination: "/", permanent: true },
      { source: "/services/seo-consultant-preston/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-sheffield", destination: "/", permanent: true },
      { source: "/services/seo-consultant-sheffield/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-bradford", destination: "/", permanent: true },
      { source: "/services/seo-consultant-bradford/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-york", destination: "/", permanent: true },
      { source: "/services/seo-consultant-york/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-birmingham", destination: "/", permanent: true },
      { source: "/services/seo-consultant-birmingham/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-cardiff", destination: "/", permanent: true },
      { source: "/services/seo-consultant-cardiff/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-glasgow", destination: "/", permanent: true },
      { source: "/services/seo-consultant-glasgow/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-brighton", destination: "/", permanent: true },
      { source: "/services/seo-consultant-brighton/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-harrogate", destination: "/", permanent: true },
      { source: "/services/seo-consultant-harrogate/", destination: "/", permanent: true },
      { source: "/services/seo-consultant-essex", destination: "/", permanent: true },
      { source: "/services/seo-consultant-essex/", destination: "/", permanent: true },
      // Old root-level location pages migrated to /services/
      { source: "/seo-berkshire", destination: "/services/seo-berkshire/", permanent: true },
      { source: "/seo-berkshire/", destination: "/services/seo-berkshire/", permanent: true },
      { source: "/seo-consultant-berkshire", destination: "/services/seo-berkshire/", permanent: true },
      { source: "/seo-consultant-berkshire/", destination: "/services/seo-berkshire/", permanent: true },
      { source: "/seo-bracknell", destination: "/services/seo-bracknell/", permanent: true },
      { source: "/seo-bracknell/", destination: "/services/seo-bracknell/", permanent: true },
      { source: "/seo-slough", destination: "/services/seo-slough/", permanent: true },
      { source: "/seo-slough/", destination: "/services/seo-slough/", permanent: true },
      { source: "/seo-maidenhead", destination: "/services/seo-maidenhead/", permanent: true },
      { source: "/seo-maidenhead/", destination: "/services/seo-maidenhead/", permanent: true },
      { source: "/seo-wokingham", destination: "/services/seo-wokingham/", permanent: true },
      { source: "/seo-wokingham/", destination: "/services/seo-wokingham/", permanent: true },
      { source: "/seo-windsor", destination: "/services/seo-windsor/", permanent: true },
      { source: "/seo-windsor/", destination: "/services/seo-windsor/", permanent: true },
      { source: "/seo-consultant-reading", destination: "/", permanent: true },
      { source: "/seo-consultant-reading/", destination: "/", permanent: true },
      { source: "/technical-seo-audit", destination: "/services/technical-seo-audit/", permanent: true },
      { source: "/technical-seo-audit/", destination: "/services/technical-seo-audit/", permanent: true },
      // Old root-level service pages still indexed by Google
      { source: "/local-seo", destination: "/services/local-seo/", permanent: true },
      { source: "/local-seo/", destination: "/services/local-seo/", permanent: true },
      // Old category/tag/author pages from previous WordPress site
      { source: "/category/:slug", destination: "/blog/", permanent: true },
      { source: "/category/:slug/", destination: "/blog/", permanent: true },
      // Redirect old WordPress author pages, but NOT the real /author/sunny-patel/ profile page
      { source: "/author/:slug((?!sunny-patel$).*)", destination: "/about/", permanent: true },
      { source: "/author/:slug((?!sunny-patel$).*)/", destination: "/about/", permanent: true },
      // Old root-level service pages still showing in GSC
      { source: "/b2b-content-marketing-services", destination: "/services/b2b-seo/", permanent: true },
      { source: "/b2b-content-marketing-services/", destination: "/services/b2b-seo/", permanent: true },
      // Consolidate agency page into consultant page — agency page has zero GSC data
      { source: "/services/seo-agency-reading", destination: "/", permanent: true },
      { source: "/services/seo-agency-reading/", destination: "/", permanent: true },
      // Blog posts cannibalizing service pages — consolidate signals
      { source: "/blog/seo-reading-guide", destination: "/", permanent: true },
      { source: "/blog/seo-reading-guide/", destination: "/", permanent: true },
      // Old service pages from previous site — redirect to nearest equivalent
      { source: "/seo-consulting-london", destination: "/services/seo-consulting/", permanent: true },
      { source: "/seo-consulting-london/", destination: "/services/seo-consulting/", permanent: true },
      { source: "/board-level-seo-reporting", destination: "/services/seo-strategy-consulting-expert-guidance-for-in-house-teams/", permanent: true },
      { source: "/board-level-seo-reporting/", destination: "/services/seo-strategy-consulting-expert-guidance-for-in-house-teams/", permanent: true },
      { source: "/pre-acquisition-seo-due-diligence", destination: "/services/technical-seo-audit/", permanent: true },
      { source: "/pre-acquisition-seo-due-diligence/", destination: "/services/technical-seo-audit/", permanent: true },
      // Dev/staging pages that leaked into Bing index
      { source: "/main-home-pattern-1", destination: "/", permanent: true },
      { source: "/homepage-content-for-sunnypatel-co-uk", destination: "/", permanent: true },
      // Old WordPress root-level blog posts still indexed — redirect to /blog/ equivalents
      { source: "/chatgpt-ads", destination: "/blog/chatgpt-ads/", permanent: true },
      { source: "/chatgpt-ads/", destination: "/blog/chatgpt-ads/", permanent: true },
      { source: "/legal-seo-magic-circle-firms", destination: "/services/legal-seo-magic-circle-firms-2/", permanent: true },
      { source: "/legal-seo-magic-circle-firms/", destination: "/services/legal-seo-magic-circle-firms-2/", permanent: true },
      { source: "/about-2", destination: "/about/", permanent: true },
      { source: "/about-2/", destination: "/about/", permanent: true },
      { source: "/how-many-keywords", destination: "/blog/how-many-keywords/", permanent: true },
      { source: "/how-many-keywords/", destination: "/blog/how-many-keywords/", permanent: true },
      { source: "/how-long-does-seo-take", destination: "/blog/how-long-does-seo-take/", permanent: true },
      { source: "/how-long-does-seo-take/", destination: "/blog/how-long-does-seo-take/", permanent: true },
      // Slug cleanup: drop duplicate "uk" (already in TLD) and the year so the post is evergreen
      { source: "/blog/best-aeo-agencies-uk-2026", destination: "/blog/best-aeo-agencies/", permanent: true },
      { source: "/blog/best-aeo-agencies-uk-2026/", destination: "/blog/best-aeo-agencies/", permanent: true },
      // Old root-level URLs still in Bing index returning 404
      { source: "/seo-cost", destination: "/services/how-much-does-seo-cost/", permanent: true },
      { source: "/seo-cost/", destination: "/services/how-much-does-seo-cost/", permanent: true },
      { source: "/ai-automation", destination: "/services/ai-search-optimisation/", permanent: true },
      { source: "/ai-automation/", destination: "/services/ai-search-optimisation/", permanent: true },
      // Legacy WordPress root-level pages still 404ing in Bing/Google (found via crawl probe)
      { source: "/home", destination: "/", permanent: true },
      { source: "/home/", destination: "/", permanent: true },
      { source: "/seo", destination: "/services/seo/", permanent: true },
      { source: "/seo/", destination: "/services/seo/", permanent: true },
      { source: "/seo-services", destination: "/services/", permanent: true },
      { source: "/seo-services/", destination: "/services/", permanent: true },
      { source: "/seo-reading", destination: "/", permanent: true },
      { source: "/seo-reading/", destination: "/", permanent: true },
      { source: "/seo-consultant", destination: "/", permanent: true },
      { source: "/seo-consultant/", destination: "/", permanent: true },
      { source: "/seo-audit", destination: "/services/technical-seo-audit/", permanent: true },
      { source: "/seo-audit/", destination: "/services/technical-seo-audit/", permanent: true },
      { source: "/free-seo-audit", destination: "/contact/", permanent: true },
      { source: "/free-seo-audit/", destination: "/contact/", permanent: true },
      { source: "/digital-marketing", destination: "/services/", permanent: true },
      { source: "/digital-marketing/", destination: "/services/", permanent: true },
      { source: "/web-design", destination: "/website-design/", permanent: true },
      { source: "/web-design/", destination: "/website-design/", permanent: true },
      { source: "/case-studies", destination: "/portfolio/", permanent: true },
      { source: "/case-studies/", destination: "/portfolio/", permanent: true },
      { source: "/testimonials", destination: "/portfolio/", permanent: true },
      { source: "/testimonials/", destination: "/portfolio/", permanent: true },
      { source: "/seo-packages", destination: "/services/seo-retainer/", permanent: true },
      { source: "/seo-packages/", destination: "/services/seo-retainer/", permanent: true },
      { source: "/contact-us", destination: "/contact/", permanent: true },
      { source: "/contact-us/", destination: "/contact/", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/cv", destination: "/cv.pdf" },
      { source: "/cv/", destination: "/cv.pdf" },
    ];
  },
  experimental: {
    optimizeCss: true,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
