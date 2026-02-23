import type { MetadataRoute } from "next";
import { reader } from "@/lib/content";
import { slugifyTag } from "@/lib/utils";

const SITE_URL = "https://sunnypatel.co.uk";

// Static routes with their change frequency and priority
const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
  { url: `${SITE_URL}/about`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/services`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
  { url: `${SITE_URL}/portfolio`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/blog`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
  { url: `${SITE_URL}/contact`,      lastModified: new Date(), changeFrequency: "yearly",  priority: 0.7 },
  { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${SITE_URL}/terms-of-use`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Blog posts
  const blogSlugs = await reader.collections.blog.list();
  const blogEntries = await Promise.all(
    blogSlugs.map(async (slug) => {
      const post = await reader.collections.blog.read(slug);
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: post?.date ? new Date(post.date) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    })
  );

  // Service pages
  const serviceSlugs = await reader.collections.services.list();
  const serviceEntries = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Portfolio pages
  const portfolioSlugs = await reader.collections.portfolio.list();
  const portfolioEntries = portfolioSlugs.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Tag pages
  const allTags = new Set<string>();
  for (const slug of blogSlugs) {
    const p = await reader.collections.blog.read(slug);
    for (const tag of p?.tags ?? []) {
      allTags.add(slugifyTag(tag));
    }
  }
  const tagEntries = Array.from(allTags).map((tag) => ({
    url: `${SITE_URL}/blog/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Author page
  const authorEntry = {
    url: `${SITE_URL}/author/sunny-patel`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  };

  return [...staticRoutes, authorEntry, ...blogEntries, ...serviceEntries, ...portfolioEntries, ...tagEntries];
}
