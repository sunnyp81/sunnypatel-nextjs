import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import KeywordScraper from "./KeywordScraper";

export function generateMetadata() {
  return {
    title: "Free Keyword Suggestions Tool | Google Autocomplete Scraper | Sunny Patel",
    description:
      "Scrape thousands of Google Autocomplete keyword suggestions across UK, US, and 6 other locales. Free SEO keyword research tool — no sign-up required.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/keyword-scraper/" },
  };
}

export default function KeywordScraperPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <KeywordScraper />
      </div>
      <Footer />
    </main>
  );
}
