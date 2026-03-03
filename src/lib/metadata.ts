import type { Metadata } from "next";

const SITE_URL = "https://sunnypatel.co.uk";
const DEFAULT_TITLE = "SEO Consultant Reading | 150%+ Avg Traffic Growth | Sunny Patel";
const DEFAULT_DESCRIPTION =
  "Reading-based SEO consultant with 15+ years experience. Clients see 150-280% organic traffic growth. Free 30-min consultation, no contracts. Book today.";

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
  const url = `${SITE_URL}${path}`;

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
      ...(ogImage && { images: [{ url: ogImage }] }),
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
