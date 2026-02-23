import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/services/generative-engine-optimisation",
        destination: "/services/ai-search-optimisation",
        permanent: true,
      },
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
