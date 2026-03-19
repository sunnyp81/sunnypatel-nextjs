import type { Metadata } from "next";

const SITE_URL = "https://sunnypatel.co.uk";
const DEFAULT_TITLE = "Sunny Patel | Topical Authority & Entity SEO Consultant | 150%+ Growth";
const DEFAULT_DESCRIPTION =
  "Independent SEO consultant specialising in topical authority and entity-based search. 15+ years delivering 150-280% organic traffic growth for UK businesses. Free consultation.";
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
      images: [{ url: ogImage || DEFAULT_OG_IMAGE }],
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
