import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import SeoPrompts from "./SeoPrompts";

export function generateMetadata() {
  return {
    title: "SEO Prompt Library | 20 Free ChatGPT & AI Prompts for SEO",
    description:
      "20 free copy-paste SEO prompts for ChatGPT, Claude, and Gemini. Demand mapping, topical maps, content briefs, schema, internal linking, and AI search optimisation, built on semantic SEO method.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/seo-prompts/" },
  };
}

const faqs = [
  {
    q: "What are SEO prompts?",
    a: "SEO prompts are pre-written instructions for AI tools like ChatGPT, Claude, and Gemini that produce SEO outputs: keyword intent classification, topical maps, content briefs, schema markup, meta tags, and internal link plans. Good prompts encode a method, so the output follows a proven SEO framework instead of generic advice.",
  },
  {
    q: "How do I use these SEO prompts?",
    a: "Copy a prompt, replace the bracketed placeholders with your own keyword, URL, topic, or content, then paste it into ChatGPT, Claude, or Gemini. Chain them in order, intent and demand first, then topical map, brief, writing, and schema, so each output feeds the next.",
  },
  {
    q: "Are AI-generated SEO outputs good enough to publish?",
    a: "Treat AI output as a first draft, not a finished page. AI accelerates research, briefs, and structure, but rankings come from your own expertise, real data, and editing. Always verify factual claims before publishing, especially in Your Money or Your Life niches where accuracy is critical.",
  },
  {
    q: "Which AI model is best for SEO tasks?",
    a: "Any capable model works for these prompts. Claude and ChatGPT handle long content briefs and rewrites well, and Gemini is convenient when you want results tied to Google data. The prompt quality matters more than the model, which is why each prompt here encodes a specific SEO method.",
  },
];

export default function SeoPromptsPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SEO Prompt Library",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://sunnypatel.co.uk/tools/seo-prompts/",
    description:
      "Free copy-paste SEO prompt library for ChatGPT, Claude, and Gemini, covering demand mapping, topical authority, content briefs, schema, internal linking, and AI search optimisation.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    author: { "@type": "Person", name: "Sunny Patel", url: "https://sunnypatel.co.uk/" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <SeoPrompts />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{f.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
