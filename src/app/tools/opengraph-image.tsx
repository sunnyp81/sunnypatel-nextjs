import { renderToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-template";
import { TOOLS_INDEX_OG } from "@/lib/tools-og-data";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OGImage() {
  return renderToolOgImage({
    eyebrow: "FREE SEO TOOL",
    title: TOOLS_INDEX_OG.headline,
    description: TOOLS_INDEX_OG.description,
  });
}
