import { renderToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-template";
import { TOOLS_OG_DATA } from "@/lib/tools-og-data";
import { SCHEMA_TYPE_ENTRIES, getEntry } from "../type-content";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export function generateStaticParams() {
  return SCHEMA_TYPE_ENTRIES.map((entry) => ({ type: entry.slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const entry = getEntry(type);
  const fallback = TOOLS_OG_DATA["schema-generator"];

  return renderToolOgImage({
    eyebrow: "FREE SEO TOOL",
    title: entry ? `${entry.label} Schema Generator` : fallback.headline,
    description: entry ? entry.metaDescription : fallback.description,
  });
}
