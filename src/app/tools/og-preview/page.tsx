import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import OgPreview from "./OgPreview";

export function generateMetadata() {
  return {
    title: "Open Graph Preview Tool | See How Links Look on Social Media",
    description: "Preview how your URL appears when shared on Facebook, Twitter/X, and LinkedIn. Check Open Graph tags, Twitter Cards, and fix social sharing issues.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/og-preview/" },
  };
}

export default function OgPreviewPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <OgPreview />
        <ToolNextStep lead="Want a second pair of eyes on how your pages look when shared? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/og-preview/" />
      <Footer />
    </main>
  );
}
