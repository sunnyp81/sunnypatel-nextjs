import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import TitleChecker from "./TitleChecker";

export function generateMetadata() {
  return {
    title: "Bulk Title Tag Checker | SEO Title Length Analyser | Sunny Patel",
    description: "Check multiple title tags at once. See character counts, pixel widths, and Google truncation warnings. Paste your titles and get instant SEO feedback.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/title-checker/" },
  };
}

export default function TitleCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <TitleChecker />
      </div>
      <Footer />
    </main>
  );
}
