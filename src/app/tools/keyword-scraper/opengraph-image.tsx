import { renderToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-template";
import { TOOLS_OG_DATA } from "@/lib/tools-og-data";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OGImage() {
  const entry = TOOLS_OG_DATA["keyword-scraper"];
  return renderToolOgImage({
    eyebrow: "FREE SEO TOOL",
    title: entry.headline,
    description: entry.description,
  });
}
