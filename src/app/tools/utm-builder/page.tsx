import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import UtmBuilder from "./UtmBuilder";

export function generateMetadata() {
  return {
    title: "Free UTM Link Builder | Campaign URL Generator | Sunny Patel",
    description: "Build UTM-tagged campaign URLs in seconds. Add source, medium, campaign, term, and content parameters. Copy or shorten your tracking links instantly.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/utm-builder/" },
  };
}

export default function UtmBuilderPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <UtmBuilder />
      </div>
      <Footer />
    </main>
  );
}
