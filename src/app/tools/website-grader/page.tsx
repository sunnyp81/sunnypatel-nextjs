import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";
import WebsiteGrader from "./WebsiteGrader";
import { schemaGraph, websiteGraderPageSchema, websiteGraderSchema } from "@/lib/schema";

export function generateMetadata() {
  return {
    title: "Free Website Grader | SEO Page Grader, A to F",
    description: "Free website grader for one URL: 10 SEO checks, 5 security checks, content stats and a mobile PageSpeed lab score, graded A to F when PageSpeed responds.",
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
