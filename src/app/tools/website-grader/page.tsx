import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import WebsiteGrader from "./WebsiteGrader";

export function generateMetadata() {
  return {
    title: "Free Website Grader | SEO, Speed & Security Score | Sunny Patel",
    description: "Get an instant A-F grade for your website covering SEO, page speed, mobile-friendliness, and security. Free website audit with actionable recommendations.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/website-grader/" },
  };
}

export default function WebsiteGraderPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <WebsiteGrader />
      </div>
      <Footer />
    </main>
  );
}
