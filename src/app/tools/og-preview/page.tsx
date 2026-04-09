import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import OgPreview from "./OgPreview";

export function generateMetadata() {
  return {
    title: "Open Graph Preview Tool | See How Links Look on Social Media | Sunny Patel",
    description: "Preview how your URL appears when shared on Facebook, Twitter/X, and LinkedIn. Check Open Graph tags, Twitter Cards, and fix social sharing issues.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/og-preview/" },
  };
}

export default function OgPreviewPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <OgPreview />
      </div>
      <Footer />
    </main>
  );
}
