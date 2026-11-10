import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import TextDiff from "./TextDiff";

export function generateMetadata() {
  return {
    title: "Text Diff Checker | Compare Two Texts Side by Side",
    description: "Compare two pieces of text and see exactly what changed. Highlight additions, deletions, and modifications. Perfect for reviewing content updates and SEO changes.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/text-diff/" },
  };
}

export default function TextDiffPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <TextDiff />
        <ToolNextStep lead="Want a second pair of eyes on the changes? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/text-diff/" />
      <Footer />
    </main>
  );
}
