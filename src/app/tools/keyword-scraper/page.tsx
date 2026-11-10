import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import KeywordScraper from "./KeywordScraper";

export function generateMetadata() {
  return {
    title: "Free Keyword Scraper for Google Autocomplete",
    description:
      "Free keyword scraper that collects Google Autocomplete suggestions from up to eight regions, with a-z expansion, intent filters and CSV download.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/keyword-scraper/" },
  };
}

export default function KeywordScraperPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} className="pt-24 pb-16">
        <KeywordScraper />
        <ToolNextStep lead="If you want these keywords turned into a page plan, see my" href="/services/topical-maps/" label="topical map service" />
      </div>
      <RelatedTools currentHref="/tools/keyword-scraper/" />
      <Footer />
    </main>
  );
}
