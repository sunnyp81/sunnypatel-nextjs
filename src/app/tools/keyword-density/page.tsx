import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import KeywordDensity from "./KeywordDensity";

export function generateMetadata() {
  return {
    title: "Free Keyword Density Checker | Content SEO Analyser | Sunny Patel",
    description: "Analyse keyword density and frequency in your content. See word counts, 1-word, 2-word, and 3-word phrase frequency. Free on-page SEO tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/keyword-density/" },
  };
}

export default function KeywordDensityPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <KeywordDensity />
      </div>
      <Footer />
    </main>
  );
}
