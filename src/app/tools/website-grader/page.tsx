import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";
import WebsiteGrader from "./WebsiteGrader";
import { schemaGraph, websiteGraderPageSchema, websiteGraderSchema } from "@/lib/schema";

export function generateMetadata() {
  return {
    title: "Free Website Grader | SEO Page Grader, Speed & Security",
    description: "Get an instant A-F grade for your website with this free SEO page grader covering page speed, mobile-friendliness, and security. Actionable recommendations included.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/website-grader/" },
  };
}

export default function WebsiteGraderPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaGraph(websiteGraderPageSchema(), websiteGraderSchema()) }}
      />
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <WebsiteGrader />
      </div>
      <RelatedTools currentHref="/tools/website-grader/" />
      <Footer />
    </main>
  );
}
