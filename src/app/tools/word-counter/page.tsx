import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import WordCounter from "./WordCounter";

export function generateMetadata() {
  return {
    title: "Free Word Counter | Character, Sentence & Reading Time | Sunny Patel",
    description: "Count words, characters, sentences, and paragraphs instantly. See reading time, speaking time, and content length recommendations for SEO. Free online tool.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/word-counter/" },
  };
}

export default function WordCounterPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <WordCounter />
      </div>
      <Footer />
    </main>
  );
}
