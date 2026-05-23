import type { Metadata } from "next";

const SITE_URL = "https://sunnypatel.co.uk";
const DEFAULT_TITLE = "SEO Consultant UK: 150-280% Growth Specialist";
const DEFAULT_DESCRIPTION =
  "SEO Consultant UK — 150-280% organic growth, 15+ years experience. Book your free consultation with proven results-driven specialist.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/sunny-patel-seo-consultant.png`;

export function buildMetadata({
  title,
  description,
  ogImage,
  path = "",
  type = "website",
  articleMeta,
}: {
  title?: string;
  description?: string;
  ogImage?: string;
  path?: string;
  type?: "website" | "article";
  articleMeta?: { publishedTime?: string; authors?: string[] };
}): Metadata {
  const metaTitle = title || DEFAULT_TITLE;
  const metaDesc = description || DEFAULT_DESCRIPTION;
  // Ensure trailing slash on canonical to match sitemap and trailingSlash config
  const normalised = path && path !== "/" && !path.endsWith("/") ? `${path}/` : path;
  const url = `${SITE_URL}${normalised}`;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: { canonical: url },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url,
      siteName: "Sunny Patel",
      locale: "en_GB",
      type,
      ...(ogImage && !ogImage.endsWith(".svg") ? { images: [{ url: ogImage }] } : {}),
      ...(type === "article" && articleMeta && {
        publishedTime: articleMeta.publishedTime,
        authors: articleMeta.authors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
    },
  };
}
