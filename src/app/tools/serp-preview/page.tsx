import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import SerpPreview from "./SerpPreview";

export function generateMetadata() {
  return {
    title: "Free SERP Snippet Previewer | Google Search Result Preview",
    description: "Preview exactly how your page will appear in Google search results. Check title tag pixel width, meta description length, and URL display. Free SEO tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/serp-preview/" },
  };
}

export default function SerpPreviewPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <SerpPreview />
        <ToolNextStep lead="Want a second pair of eyes on your titles and snippets? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/serp-preview/" />
      <Footer />
    </main>
  );
}
