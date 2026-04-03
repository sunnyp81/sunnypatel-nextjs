import type { MetadataRoute } from "next";
import { reader } from "@/lib/content";


const SITE_URL = "https://sunnypatel.co.uk";

// Static routes — use a fixed date rather than new Date() to avoid
// telling Google every page changed on every build
const LAST_DEPLOY = new Date("2026-04-03");

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`,                   lastModified: LAST_DEPLOY, changeFrequency: "weekly",  priority: 1.0 },
  { url: `${SITE_URL}/about/`,             lastModified: LAST_DEPLOY, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/services/`,          lastModified: LAST_DEPLOY, changeFrequency: "weekly",  priority: 0.9 },
  { url: `${SITE_URL}/portfolio/`,         lastModified: LAST_DEPLOY, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/blog/`,              lastModified: LAST_DEPLOY, changeFrequency: "daily",   priority: 0.9 },
  { url: `${SITE_URL}/contact/`,           lastModified: LAST_DEPLOY, changeFrequency: "yearly",  priority: 0.7 },
  // privacy-policy and terms-of-use excluded — low crawl-priority, waste crawl budget
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Blog posts — use lastUpdated if available, else published date
  const blogSlugs = await reader.collections.blog.list();
  const blogEntries = await Promise.all(
    blogSlugs.map(async (slug) => {
      const post = await reader.collections.blog.read(slug);
      const date = post?.lastUpdated || post?.date;
      return {
        url: `${SITE_URL}/blog/${slug}/`,
        lastModified: date ? new Date(date) : LAST_DEPLOY,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    })
  );

  // Service pages
  const NOINDEX_SERVICE_SLUGS = new Set([
    "seo-consultant-birmingham",
    "seo-consultant-bradford",
    "seo-consultant-brighton",
    "seo-consultant-cardiff",
    "seo-consultant-devon",
    "seo-consultant-edinburgh",
    "seo-consultant-essex",
    "seo-consultant-glasgow",
    "seo-consultant-harrogate",
    "seo-consultant-leeds",
    "seo-consultant-manchester",
    "seo-consultant-nottingham",
    "seo-consultant-oxford",
    "seo-consultant-preston",
    "seo-consultant-sheffield",
    "seo-consultant-southampton",
    "seo-consultant-surrey",
    "seo-consultant-york",
  ]);

  // Pages with canonicalOverride pointing to another page — exclude from sitemap
  // to avoid diluting the canonical target's authority
  const CANONICAL_OVERRIDE_SLUGS = new Set([
    "seo-strategy-reading",
    "digital-marketing-reading",
    "seo-agency-reading",
  ]);

  const serviceSlugs = await reader.collections.services.list();
  const serviceEntries = serviceSlugs
    .filter((slug) => !NOINDEX_SERVICE_SLUGS.has(slug) && !CANONICAL_OVERRIDE_SLUGS.has(slug))
    .map((slug) => ({
      url: `${SITE_URL}/services/${slug}/`,
      lastModified: LAST_DEPLOY,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Portfolio pages
  const portfolioSlugs = await reader.collections.portfolio.list();
  const portfolioEntries = portfolioSlugs.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}/`,
    lastModified: LAST_DEPLOY,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogEntries, ...serviceEntries, ...portfolioEntries];
}
