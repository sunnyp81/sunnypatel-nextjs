import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";
import SeoPrompts from "./SeoPrompts";
import { PROMPTS } from "./prompts-data";

export function generateMetadata() {
  return {
    title: `SEO Prompt Library | ${PROMPTS.length} Free Customisable AI Prompts`,
    description:
      "Choose from 20 free SEO prompts, add your inputs and copy a personalised prompt. Includes fictional examples, evidence requirements and output checks. No signup.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/seo-prompts/" },
  };
}

const faqs = [
  {
    q: "What are SEO prompts?",
    a: "SEO prompts are instructions for AI tools that help draft keyword classifications, content briefs, outlines, structured data and internal linking suggestions. They need relevant inputs and human review; a prompt is not evidence that a recommendation is correct.",
  },
  {
    q: "How do I use these SEO prompts?",
    a: "Open Personalise this prompt, fill in the labelled inputs and check the preview. Copy the personalised prompt into your chosen AI tool. You can also copy the template and replace the bracketed fields manually. Example inputs are fictional demonstrations.",
  },
  {
    q: "Are AI-generated SEO outputs good enough to publish?",
    a: "Review drafts before publishing. Verify facts and sources, check proposed links and add your own experience where relevant. A model can invent details or miss context. A generated checklist also does not prove that the checks were performed.",
  },
  {
    q: "Does this tool send my inputs to an AI provider?",
    a: "No. The library prepares prompts in your browser. It does not make AI requests, store your inputs on the server or include them in usage analytics. You choose whether to copy the prompt into another service. Reloading the page clears entered inputs.",
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
      <RelatedTools currentHref="/tools/seo-prompts/" />
      <Footer />
    </main>
  );
}
