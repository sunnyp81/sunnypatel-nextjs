import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import UtmBuilder from "./UtmBuilder";

export function generateMetadata() {
  return {
    title: "Free UTM Link Builder | Campaign URL Generator",
    description: "Build UTM-tagged campaign URLs in seconds. Add source, medium, campaign, term, and content parameters. Copy or shorten your tracking links instantly.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/utm-builder/" },
  };
}

export default function UtmBuilderPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <UtmBuilder />
        <ToolNextStep lead="Want help making sense of your campaign tracking? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/utm-builder/" />
      <Footer />
    </main>
  );
}
