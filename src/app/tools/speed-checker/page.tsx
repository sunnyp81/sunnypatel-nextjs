import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import SpeedChecker from "./SpeedChecker";

export function generateMetadata() {
  return {
    title: "Website Speed Checker | Core Web Vitals Test | Sunny Patel",
    description: "Test your website speed and Core Web Vitals scores. Check LCP, FID, CLS, and get actionable recommendations to improve page performance and SEO rankings.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/speed-checker/" },
  };
}

export default function SpeedCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <SpeedChecker />
      </div>
      <Footer />
    </main>
  );
}
