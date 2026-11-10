import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import TitleChecker from "./TitleChecker";

export function generateMetadata() {
  return {
    title: "Bulk Title Tag Checker | SEO Title Length Analyser",
    description: "Check multiple title tags at once. See character counts, pixel widths, and Google truncation warnings. Paste your titles and get instant SEO feedback.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/title-checker/" },
  };
}

export default function TitleCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <TitleChecker />
        <ToolNextStep lead="Want a second pair of eyes on your page titles? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/title-checker/" />
      <Footer />
    </main>
  );
}
