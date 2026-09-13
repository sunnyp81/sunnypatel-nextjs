import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";
import KeywordScraper from "./KeywordScraper";

export function generateMetadata() {
  return {
    title: "Free Keyword Suggestions Tool | Google Autocomplete",
    description:
      "Collect Google Autocomplete keyword suggestions across the UK, US, France, and five other regions. Free SEO research tool with CSV export.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/keyword-scraper/" },
  };
}

export default function KeywordScraperPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} className="pt-24 pb-16">
        <KeywordScraper />
      </div>
      <RelatedTools currentHref="/tools/keyword-scraper/" />
      <Footer />
    </main>
  );
}
