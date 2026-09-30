import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import SitemapGenerator from "./SitemapGenerator";
export function generateMetadata() {
  const info = newToolPages["sitemap-generator"];
  return {
    title: `Free ${info.title} | Crawl and Download XML`,
    description: info.description,
    alternates: { canonical: `https://sunnypatel.co.uk/tools/${info.slug}/` },
  };
}
export default function Page() {
  return (
    <ToolPageShell info={newToolPages["sitemap-generator"]}>
      <SitemapGenerator />
    </ToolPageShell>
  );
}
