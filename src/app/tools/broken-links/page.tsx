import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import BrokenLinks from "./BrokenLinks";

export function generateMetadata() {
  return {
    title: "Broken Link Checker | Find 404 Errors on Your Website | Sunny Patel",
    description: "Scan any webpage for broken links and 404 errors. Fix dead links to improve user experience and preserve your SEO link equity. Free technical SEO tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/broken-links/" },
  };
}

export default function BrokenLinksPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <BrokenLinks />
      </div>
      <Footer />
    </main>
  );
}
