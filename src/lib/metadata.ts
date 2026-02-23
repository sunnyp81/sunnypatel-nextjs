import type { Metadata } from "next";

const SITE_URL = "https://sunnypatel.co.uk";
const DEFAULT_TITLE = "Sunny Patel | SEO & AI Consultant | Reading, Berkshire";
const DEFAULT_DESCRIPTION =
  "SEO consultant and AI strategist helping UK businesses grow through entity-based content networks. Based in Reading, Berkshire.";

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
