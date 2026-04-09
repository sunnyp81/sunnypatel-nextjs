import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import TextDiff from "./TextDiff";

export function generateMetadata() {
  return {
    title: "Text Diff Checker | Compare Two Texts Side by Side | Sunny Patel",
    description: "Compare two pieces of text and see exactly what changed. Highlight additions, deletions, and modifications. Perfect for reviewing content updates and SEO changes.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/text-diff/" },
  };
}

export default function TextDiffPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <TextDiff />
      </div>
      <Footer />
    </main>
  );
}
