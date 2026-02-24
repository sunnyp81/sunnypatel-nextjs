import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/services/generative-engine-optimisation",
        destination: "/services/ai-search-optimisation",
        permanent: true,
      },
      // Old root-level location pages migrated to /services/
      { source: "/seo-berkshire", destination: "/services/seo-berkshire", permanent: true },
      { source: "/seo-bracknell", destination: "/services/seo-bracknell", permanent: true },
      { source: "/seo-slough", destination: "/services/seo-slough", permanent: true },
      { source: "/seo-maidenhead", destination: "/services/seo-maidenhead", permanent: true },
      { source: "/seo-wokingham", destination: "/services/seo-wokingham", permanent: true },
      { source: "/seo-windsor", destination: "/services/seo-windsor", permanent: true },
      { source: "/seo-consultant-reading", destination: "/services/seo-consultant-reading", permanent: true },
      { source: "/technical-seo-audit", destination: "/services/technical-seo-audit", permanent: true },
      // Dev/staging pages that leaked into Bing index
      { source: "/main-home-pattern-1", destination: "/", permanent: true },
      { source: "/homepage-content-for-sunnypatel-co-uk", destination: "/", permanent: true },
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
