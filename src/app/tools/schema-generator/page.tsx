import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import SchemaGenerator from "./SchemaGenerator";

export function generateMetadata() {
  return {
    title: "Free Schema Markup Generator | JSON-LD Structured Data",
    description:
      "Free JSON-LD schema generator for FAQ, Article, LocalBusiness, Product, BreadcrumbList, and HowTo markup. Fill in the fields, copy the script tag, and validate it in Google's Rich Results Test.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/schema-generator/" },
  };
}

const schemaTypes = [
  {
    name: "FAQ schema generator",
    body: "Builds an FAQPage block from question and answer pairs. Google now limits FAQ rich results to a small set of authoritative sites. The markup still helps search engines and AI assistants extract your answers for AI Overviews and chat citations.",
  },
  {
    name: "Article schema generator",
    body: "Creates Article markup with headline, author, publisher, and published and modified dates. Authorship and freshness are two signals Google reads when presenting blog posts and news content.",
  },
  {
    name: "Local business schema generator",
    body: "Generates LocalBusiness markup with a specific business type (29 options from Plumber to Dentist), full postal address, opening hours, geo coordinates, and price range. This corroborates your Google Business Profile details.",
  },
  {
    name: "Product schema generator",
    body: "Outputs Product markup with price, currency, availability, brand, SKU, and aggregate rating. Valid Product markup is what makes star ratings and prices eligible to appear under your listing in search results.",
  },
  {
    name: "Breadcrumb schema generator",
    body: "Builds a BreadcrumbList so Google can replace the raw URL in your search snippet with a readable page trail. Breadcrumb rich results are among the simplest to earn because eligibility is broad.",
  },
  {
    name: "HowTo schema generator",
    body: "Creates HowTo markup with named steps, total time, and estimated cost. Google retired HowTo rich results in 2023. The markup remains valid structured data for machines and AI assistants.",
  },
];

const faqs = [
  {
    q: "Is this schema markup generator free?",
    a: "Yes. All six schema types are free to generate with no signup, no watermark, and no usage limit. The output is plain JSON-LD you can paste straight into your site.",
  },
  {
    q: "What is a JSON-LD schema generator?",
    a: "A JSON-LD schema generator turns form fields into a valid script tag of structured data using the JSON-LD format (JavaScript Object Notation for Linked Data). JSON-LD is the format Google recommends because it sits in one self-contained block rather than being woven through your HTML like microdata.",
  },
  {
    q: "Where do I paste the generated schema markup?",
    a: "Anywhere in the page's HTML, in the head or the body. Google parses the script tag either way. The exact steps differ by platform. See the how to add schema markup guide for WordPress, Shopify, Wix, and custom sites.",
  },
  {
    q: "Does schema markup improve rankings?",
    a: "No. Schema markup is not a direct ranking factor. Schema markup makes your page eligible for rich results such as stars, prices, and breadcrumbs. It also gives search engines and AI systems an unambiguous machine-readable statement of the page topic.",
  },
  {
    q: "How do I validate the generated schema?",
    a: "Use the Test in Google button above to open your code in Google's Rich Results Test. Paste the same code into the validator at validator.schema.org for a stricter syntax check against the full schema.org vocabulary.",
  },
  {
    q: "Can I use more than one schema type on the same page?",
    a: "Yes. One page can hold multiple JSON-LD script blocks, for example Article plus FAQPage plus BreadcrumbList. Generate each type separately in this tool and paste each script tag into the page.",
  },
];

export default function SchemaGeneratorPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Schema Markup Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: "https://sunnypatel.co.uk/tools/schema-generator/",
    description:
      "Free JSON-LD schema markup generator for FAQ, Article, LocalBusiness, Product, BreadcrumbList, and HowTo structured data, with one-click validation in Google's Rich Results Test.",
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
        <SchemaGenerator />

        <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
          <section>
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What is a JSON-LD schema generator?
            </h2>
            <div className="space-y-4 max-w-3xl">
              <p className="text-sm text-muted-foreground leading-relaxed">
                JSON-LD (JavaScript Object Notation for Linked Data) is the structured data format
                Google recommends for schema markup. JSON-LD sits in a single{" "}
                <code className="text-foreground/80">{'<script type="application/ld+json">'}</code>{" "}
                block that describes the page: what it is, who wrote it, what it costs, where the
                business is. Microdata scatters the same attributes through your HTML and is harder
                to maintain.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Writing that JSON by hand invites syntax errors. One missing comma invalidates the
                whole block. This generator builds the code from plain form fields, flags missing
                required properties as you type, and gives you a copy-paste script tag plus a
                one-click check in Google&apos;s Rich Results Test. Read the{" "}
                <a
                  href="/blog/seo-semantic-markup-guide/"
                  className="text-brand underline underline-offset-2 hover:opacity-80"
                >
                  semantic markup guide
                </a>{" "}
                for the semantic SEO thinking behind structured data.
              </p>
            </div>
          </section>

          <section>
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Schema types this generator supports
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {schemaTypes.map((t) => (
                <div key={t.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{t.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How to use the generated code
            </h2>
            <ol className="space-y-3 max-w-3xl list-decimal pl-5">
              <li className="text-sm text-muted-foreground leading-relaxed">
                Pick a schema type above, fill in the fields, and fix any warnings the tool shows.
                Required properties are marked with an asterisk.
              </li>
              <li className="text-sm text-muted-foreground leading-relaxed">
                Copy the script tag and paste it into the page&apos;s HTML. Head or body both work.
                Platform-specific steps are in{" "}
                <a
                  href="/blog/how-to-add-schema-markup/"
                  className="text-brand underline underline-offset-2 hover:opacity-80"
                >
                  how to add schema markup to your website
                </a>
                .
              </li>
              <li className="text-sm text-muted-foreground leading-relaxed">
                Validate with the Test in Google button, publish, then confirm the page&apos;s rich
                result eligibility in Search Console&apos;s Enhancements reports after the next
                crawl.
              </li>
            </ol>
          </section>

          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
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
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Want structured data implemented, validated, and monitored for you? The{" "}
              <a
                href="/services/paid-seo-audit/"
                className="text-brand underline underline-offset-2 hover:opacity-80"
              >
                fixed-fee SEO audit
              </a>{" "}
              includes a full schema markup review.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
