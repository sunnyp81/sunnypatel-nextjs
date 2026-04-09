import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import HreflangGenerator from "./HreflangGenerator";

export function generateMetadata() {
  return {
    title: "Free Hreflang Tag Generator | International SEO Tool | Sunny Patel",
    description: "Generate correct hreflang tags for multilingual and multi-regional websites. Supports HTML link tags and XML sitemap format. Free international SEO tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/hreflang-generator/" },
  };
}

export default function HreflangGeneratorPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <HreflangGenerator />
      </div>
      <Footer />
    </main>
  );
}
