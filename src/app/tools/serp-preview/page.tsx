import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import SerpPreview from "./SerpPreview";

export function generateMetadata() {
  return {
    title: "Free SERP Snippet Previewer | Google Search Result Preview | Sunny Patel",
    description: "Preview exactly how your page will appear in Google search results. Check title tag pixel width, meta description length, and URL display. Free SEO tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/serp-preview/" },
  };
}

export default function SerpPreviewPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <SerpPreview />
      </div>
      <Footer />
    </main>
  );
}
