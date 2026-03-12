import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
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
      {
        source: "/services/generative-engine-optimisation",
        destination: "/services/ai-search-optimisation",
        permanent: true,
      },
      // Old root-level location pages migrated to /services/
      // Both trailing-slash and non-trailing-slash variants — Google indexed both
      { source: "/seo-berkshire", destination: "/services/seo-berkshire", permanent: true },
      { source: "/seo-berkshire/", destination: "/services/seo-berkshire", permanent: true },
      { source: "/seo-bracknell", destination: "/services/seo-bracknell", permanent: true },
      { source: "/seo-bracknell/", destination: "/services/seo-bracknell", permanent: true },
      { source: "/seo-slough", destination: "/services/seo-slough", permanent: true },
      { source: "/seo-slough/", destination: "/services/seo-slough", permanent: true },
      { source: "/seo-maidenhead", destination: "/services/seo-maidenhead", permanent: true },
      { source: "/seo-maidenhead/", destination: "/services/seo-maidenhead", permanent: true },
      { source: "/seo-wokingham", destination: "/services/seo-wokingham", permanent: true },
      { source: "/seo-wokingham/", destination: "/services/seo-wokingham", permanent: true },
      { source: "/seo-windsor", destination: "/services/seo-windsor", permanent: true },
      { source: "/seo-windsor/", destination: "/services/seo-windsor", permanent: true },
      { source: "/seo-consultant-reading", destination: "/services/seo-consultant-reading", permanent: true },
      { source: "/seo-consultant-reading/", destination: "/services/seo-consultant-reading", permanent: true },
      { source: "/technical-seo-audit", destination: "/services/technical-seo-audit", permanent: true },
      { source: "/technical-seo-audit/", destination: "/services/technical-seo-audit", permanent: true },
      // Old root-level service pages still indexed by Google
      { source: "/local-seo", destination: "/services/local-seo", permanent: true },
      { source: "/local-seo/", destination: "/services/local-seo", permanent: true },
      // Old category/tag pages from previous WordPress site
      { source: "/category/:slug", destination: "/services", permanent: true },
      { source: "/category/:slug/", destination: "/services", permanent: true },
      // Consolidate agency page into consultant page — agency page has zero GSC data
      { source: "/services/seo-agency-reading", destination: "/services/seo-consultant-reading", permanent: true },
      // Blog posts cannibalizing service pages — consolidate signals
      { source: "/blog/seo-reading-guide", destination: "/services/seo-consultant-reading", permanent: true },
      { source: "/blog/seo-reading-guide/", destination: "/services/seo-consultant-reading", permanent: true },
      // Old service pages from previous site — redirect to nearest equivalent
      { source: "/seo-consulting-london", destination: "/services/seo-consulting", permanent: true },
      { source: "/seo-consulting-london/", destination: "/services/seo-consulting", permanent: true },
      { source: "/board-level-seo-reporting", destination: "/services/seo-strategy-consulting-expert-guidance-for-in-house-teams", permanent: true },
      { source: "/board-level-seo-reporting/", destination: "/services/seo-strategy-consulting-expert-guidance-for-in-house-teams", permanent: true },
      { source: "/pre-acquisition-seo-due-diligence", destination: "/services/technical-seo-audit", permanent: true },
      { source: "/pre-acquisition-seo-due-diligence/", destination: "/services/technical-seo-audit", permanent: true },
      // Dev/staging pages that leaked into Bing index
      { source: "/main-home-pattern-1", destination: "/", permanent: true },
      { source: "/homepage-content-for-sunnypatel-co-uk", destination: "/", permanent: true },
      // Explicit trailing-slash → non-trailing-slash 301s
      // Next.js trailingSlash:false sends 308, but Google indexed both variants
      // splitting authority on the money page. Explicit 301 reinforces the signal.
      { source: "/services/:slug/", destination: "/services/:slug", permanent: true },
      { source: "/blog/:slug/", destination: "/blog/:slug", permanent: true },
      // Old WordPress root-level blog posts still indexed — redirect to /blog/ equivalents
      { source: "/chatgpt-ads", destination: "/blog/chatgpt-ads", permanent: true },
      { source: "/chatgpt-ads/", destination: "/blog/chatgpt-ads", permanent: true },
      { source: "/legal-seo-magic-circle-firms", destination: "/services/legal-seo-magic-circle-firms-2", permanent: true },
      { source: "/legal-seo-magic-circle-firms/", destination: "/services/legal-seo-magic-circle-firms-2", permanent: true },
      { source: "/about-2", destination: "/about", permanent: true },
      { source: "/about-2/", destination: "/about", permanent: true },
      { source: "/how-many-keywords", destination: "/blog/how-many-keywords", permanent: true },
      { source: "/how-many-keywords/", destination: "/blog/how-many-keywords", permanent: true },
      { source: "/how-long-does-seo-take", destination: "/blog/how-long-does-seo-take", permanent: true },
      { source: "/how-long-does-seo-take/", destination: "/blog/how-long-does-seo-take", permanent: true },
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
