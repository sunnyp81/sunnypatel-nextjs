import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutTimeline } from "@/components/about/about-timeline";
import { AboutValues } from "@/components/about/about-values";
import { AboutFaq } from "@/components/about/about-faq";
import { Cta } from "@/components/sections/cta";

export function generateMetadata() {
  return buildMetadata({
    title: "About Sunny Patel | SEO Consultant & AI Strategist | Berkshire",
    description:
      "Sunny Patel is a Berkshire-based SEO consultant specialising in semantic SEO, topical authority, and AI search optimisation. 15+ years delivering measurable traffic growth.",
    path: "/about",
  });
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <AboutHero />
      <AboutStory />
      <AboutTimeline />
      <AboutValues />
      <AboutFaq />
      <Cta />
      <Footer />
    </main>
  );
}
