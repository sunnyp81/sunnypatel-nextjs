import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ServiceInlineForm } from "@/components/service-inline-form";
import KeywordScraper from "./KeywordScraper";

export function generateMetadata() {
  return {
    title: "Free Keyword Suggestions Tool | Google Autocomplete Scraper",
    description:
      "Scrape thousands of Google Autocomplete keyword suggestions across UK, US, and 6 other locales. Free SEO keyword research tool, no sign-up required.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/keyword-scraper/" },
  };
}

export default function KeywordScraperPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <KeywordScraper />
      </div>
      <ServiceInlineForm
        ctaTitle="Want These Keywords Turned Into a Content Plan?"
        ctaSubtitle="Tell me your site and market. I will map the keywords that actually convert in your niche and come back with a prioritised plan, not a dump of suggestions."
      />
      <Footer />
    </main>
  );
}
