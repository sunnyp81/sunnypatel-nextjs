import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";
import AiVisibilityChecker from "./AiVisibilityChecker";

export function generateMetadata() {
  return {
    title: "AI Visibility Checker | Technical Readiness Diagnostic",
    description:
      "Inspect crawl directives, structured data and page structure with a free technical diagnostic. Its heuristic score does not measure AI retrieval or citations.",
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
      <RelatedTools currentHref="/tools/ai-visibility-checker/" />
      <Footer />
    </main>
  );
}
