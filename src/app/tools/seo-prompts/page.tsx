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
          <section aria-labelledby="seo-prompt-selection" className="mb-10 max-w-3xl">
            <h2 id="seo-prompt-selection" className="text-xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Which SEO prompt template should you use?
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Choose an SEO prompt template for the decision you need to make and the evidence
                you have. Each template is a reusable instruction for a specific task. Use keyword
                classification for a supplied query list, a content brief for supplied search results,
                or internal linking analysis for a list of real pages. The library prepares the
                instruction; your chosen AI tool produces a draft that still needs review.
              </p>
              <p>
                For example, a fictional bakery planning a location page could supply verified
                opening hours, service area, available products and customer questions to the
                location-page template. The resulting outline should distinguish supplied facts
                from missing details. Do not publish invented delivery areas, reviews or local
                credentials to fill the gaps. The bakery is an example, not a tested SEO result.
              </p>
            </div>
          </section>
          <section aria-labelledby="seo-prompt-evidence" className="mb-10 max-w-3xl">
            <h2 id="seo-prompt-evidence" className="text-xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              What makes an SEO prompt output usable?
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                A usable SEO prompt output answers the requested task using evidence that you can
                check. Supply the page URL and text, target audience, relevant query data and
                constraints. If the AI tool cannot access a URL or report, paste the necessary
                extract and include its source and date. Ask the model to label unavailable evidence
                rather than assume it has inspected your site.
              </p>
              <p>
                Check proposed facts against their sources, test suggested links, and compare
                structured data with the visible page before publishing. For AI visibility work,
                review each proposed answer on its own: does it name the subject, retain the source
                and qualification, and make sense outside the full page? Clearer passages are an
                editorial improvement; a prompt response does not demonstrate retrieval, an AI
                citation or higher rankings. Measure those outcomes separately after publication.
              </p>
            </div>
          </section>
          <div className="rounded-xl border border-hairline bg-wash dark:bg-white/[0.02] p-6">
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
