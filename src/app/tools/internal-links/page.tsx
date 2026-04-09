import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import InternalLinks from "./InternalLinks";

export function generateMetadata() {
  return {
    title: "Internal Link Opportunity Finder | SEO Linking Tool | Sunny Patel",
    description: "Find internal linking opportunities between your pages. Paste two pieces of content and discover natural anchor text matches. Free SEO link building tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/internal-links/" },
  };
}

export default function InternalLinksPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <InternalLinks />
      </div>
      <Footer />
    </main>
  );
}
