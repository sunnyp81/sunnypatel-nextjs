import type { Metadata } from "next";

const SITE_URL = "https://sunnypatel.co.uk";
const DEFAULT_TITLE = "SEO Consultant UK | 15+ Years | Free Diagnosis";
const DEFAULT_DESCRIPTION =
  "Independent SEO consultant with 15+ years of experience and a 45-site testing portfolio. Free 20-minute SEO diagnosis for UK businesses.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/sunny-patel-seo-consultant.png`;

export function buildMetadata({
  title,
  titleAbsolute,
  description,
  ogImage,
  path = "",
  type = "website",
  articleMeta,
}: {
  title?: string;
  titleAbsolute?: boolean;
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
    // Titles that already name the brand are complete strings. Marking them as
    // absolute prevents the root "%s | Sunny Patel" template duplicating it.
    title:
      (titleAbsolute ?? /\bSunny Patel\b/i.test(metaTitle))
        ? { absolute: metaTitle }
        : metaTitle,
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
