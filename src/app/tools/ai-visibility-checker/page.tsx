import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import AiVisibilityChecker from "./AiVisibilityChecker";

export function generateMetadata() {
  return {
    title: "Free AI Visibility Checker | Can ChatGPT Cite Your Site?",
    description:
      "Check whether AI search engines like ChatGPT, Perplexity and Google AI Overviews can crawl, verify and cite your website. Free scored report in 20 seconds.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/ai-visibility-checker/" },
  };
}

export default function AiVisibilityCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <AiVisibilityChecker />
      </div>
      <Footer />
    </main>
  );
}
