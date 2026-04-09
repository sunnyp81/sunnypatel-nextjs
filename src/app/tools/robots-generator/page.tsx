import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import RobotsGenerator from "./RobotsGenerator";

export function generateMetadata() {
  return {
    title: "Free Robots.txt Generator | Create Robot Exclusion Rules | Sunny Patel",
    description: "Generate a valid robots.txt file with an easy visual builder. Add user-agent rules, allow/disallow paths, crawl-delay, and sitemap references.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/robots-generator/" },
  };
}

export default function RobotsGeneratorPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <RobotsGenerator />
      </div>
      <Footer />
    </main>
  );
}
