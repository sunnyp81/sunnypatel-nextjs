import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import ReadabilityScore from "./ReadabilityScore";

export function generateMetadata() {
  return {
    title: "Free Readability Score Calculator | Flesch-Kincaid Analyser | Sunny Patel",
    description: "Check the readability of your content with Flesch Reading Ease, Flesch-Kincaid Grade Level, and Gunning Fog Index scores. Free content analysis tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/readability-score/" },
  };
}

export default function ReadabilityScorePage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <ReadabilityScore />
      </div>
      <Footer />
    </main>
  );
}
