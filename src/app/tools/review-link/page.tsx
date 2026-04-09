import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import ReviewLink from "./ReviewLink";

export function generateMetadata() {
  return {
    title: "Google Review Link Generator | Get More Customer Reviews | Sunny Patel",
    description: "Generate a direct link that takes customers straight to your Google review form. Boost your local SEO with more Google Business Profile reviews.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/review-link/" },
  };
}

export default function ReviewLinkPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <ReviewLink />
      </div>
      <Footer />
    </main>
  );
}
