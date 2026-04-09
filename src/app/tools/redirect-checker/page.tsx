import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import RedirectChecker from "./RedirectChecker";

export function generateMetadata() {
  return {
    title: "Free Redirect Chain Checker | HTTP Status Code Tool | Sunny Patel",
    description: "Check redirect chains and HTTP status codes for any URL. Detect 301, 302, and redirect loops. Visualise the full redirect path. Free technical SEO tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/redirect-checker/" },
  };
}

export default function RedirectCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <RedirectChecker />
      </div>
      <Footer />
    </main>
  );
}
