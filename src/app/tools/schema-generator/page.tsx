import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";
import { ServiceInlineForm } from "@/components/service-inline-form";
import SchemaGenerator from "./SchemaGenerator";

export function generateMetadata() {
  return {
    title: "Free Schema Markup Generator | JSON-LD Structured Data",
    description:
      "Free JSON-LD and Microdata schema generator for 16 schema types, including FAQ, Article, LocalBusiness, Product, JobPosting, and Event. Fill in the fields, copy the code, and validate it in Google's Rich Results Test.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/schema-generator/" },
  };
}

const schemaTypes = [
  {
    name: "FAQ schema generator",
    href: "/tools/schema-generator/faq/",
    body: "Builds an FAQPage block from question and answer pairs. Google removed the FAQ rich result from Search in May 2026, so this markup no longer changes how a listing looks. It still helps AI assistants and other search engines read your Q&A content directly.",
  },
  {
    name: "Article schema generator",
    href: "/tools/schema-generator/article/",
    body: "Creates Article markup with headline, author, publisher, and published and modified dates. Google uses this to pull accurate title, image, and date information into Search, News, and Discover.",
  },
  {
    name: "Local business schema generator",
    href: "/tools/schema-generator/local-business/",
    body: "Generates LocalBusiness markup with a specific business type (29 options from Plumber to Dentist), full postal address, opening hours, geo coordinates, and price range. This corroborates your Google Business Profile details.",
  },
  {
    name: "Product schema generator",
    href: "/tools/schema-generator/product/",
    body: "Outputs Product markup with price, currency, availability, brand, SKU, and aggregate rating. Valid Product markup with a genuine rating is what makes stars and prices eligible to appear under your listing.",
  },
  {
    name: "Breadcrumb schema generator",
    href: "/tools/schema-generator/breadcrumb/",
    body: "Builds a BreadcrumbList so Google can replace the raw URL in your search snippet with a readable page trail. Breadcrumb rich results remain active and are among the simplest to earn.",
  },
  {
    name: "HowTo schema generator",
    href: "/tools/schema-generator/how-to/",
    body: "Creates HowTo markup with named steps, total time, and estimated cost. Google retired HowTo rich results in September 2023. The markup remains valid structured data for machines and AI assistants.",
  },
  {
    name: "Organization schema generator",
    href: "/tools/schema-generator/organization/",
    body: "Builds Organization markup with logo, address, contact details, and social profile links. Google uses this to help choose which logo shows in your knowledge panel and to disambiguate your brand.",
  },
  {
    name: "Person schema generator",
    href: "/tools/schema-generator/person/",
    body: "Generates Person markup for a founder, author, or team member, with job title, employer, photo, and social profile links. It has no dedicated Google rich result but supports the entity and authorship signals behind E-E-A-T.",
  },
  {
    name: "Service schema generator",
    href: "/tools/schema-generator/service/",
    body: "Outputs Service markup naming what you offer, who provides it, and the area you serve. There is no standalone Google rich result for Service, but it clarifies your offering for search engines and AI assistants.",
  },
  {
    name: "WebSite schema generator",
    href: "/tools/schema-generator/website/",
    body: "Builds WebSite markup with an optional SearchAction for your own site search. Google retired the sitelinks search box this powered in November 2024, so it stays valid structured data for site identity rather than a rich result trigger.",
  },
  {
    name: "Job posting schema generator",
    href: "/tools/schema-generator/job-posting/",
    body: "Generates JobPosting markup with title, description, dates, salary, and location. Google for Jobs reads this to list a vacancy in its job search experience once the required fields are present.",
  },
  {
    name: "Event schema generator",
    href: "/tools/schema-generator/event/",
    body: "Creates Event markup with dates, venue or online link, organiser, and ticket details. Google's event rich result can show the date and location directly in search.",
  },
  {
    name: "Video schema generator",
    href: "/tools/schema-generator/video/",
    body: "Outputs VideoObject markup with name, thumbnail, upload date, and duration. This is what makes a video eligible for a thumbnail and duration badge in Google's video results.",
  },
  {
    name: "Review schema generator",
    href: "/tools/schema-generator/review/",
    body: "Builds Review markup for a rating of a product or third party. Google does not show review snippets when a business reviews itself, so this is for genuine third-party reviews, not self-ratings.",
  },
  {
    name: "Item list schema generator",
    href: "/tools/schema-generator/item-list/",
    body: "Generates an ItemList of ranked or ordered items. Google's carousel rich result only applies to specific content types such as Recipe, Course, Restaurant, and Movie, so a general listicle gets structure from this schema without a guaranteed rich result.",
  },
  {
    name: "Software application schema generator",
    href: "/tools/schema-generator/software-application/",
    body: "Builds SoftwareApplication markup with price and, where a genuine rating exists, an aggregate rating. Google's software app rich result requires both a price and a real rating, so only add one if you have it.",
  },
];

const faqs = [
  {
    q: "Is this schema markup generator free?",
    a: "Yes. All 16 schema types are free to generate with no signup, no watermark, and no usage limit. The output is JSON-LD or Microdata you can paste straight into your site.",
  },
  {
    q: "What is a JSON-LD schema generator?",
    a: "A JSON-LD schema generator turns form fields into a valid script tag of structured data using the JSON-LD format (JavaScript Object Notation for Linked Data). JSON-LD is the format Google recommends because it sits in one self-contained block rather than being woven through your HTML like Microdata. This tool can produce either format from the same form.",
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
    a: "Use the Test in Google Rich Results button above to open your code in Google's Rich Results Test. Use the Schema Markup Validator button for a stricter syntax check against the full schema.org vocabulary at validator.schema.org.",
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
      "Free JSON-LD and Microdata schema markup generator for 16 schema types, from FAQ and Article to JobPosting and Event, with one-click validation in Google's Rich Results Test.",
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
                <Link
                  key={t.name}
                  href={t.href}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-brand/30 hover:bg-brand/[0.04]"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-brand transition-colors">{t.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                </Link>
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
                Validate with the Test in Google Rich Results and Schema Markup Validator buttons,
                publish, then confirm the page&apos;s rich result eligibility in Search
                Console&apos;s Enhancements reports after the next crawl.
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
                href="/services/technical-seo-audit/"
                className="text-brand underline underline-offset-2 hover:opacity-80"
              >
                technical SEO audit
              </a>{" "}
              includes a full schema markup review.
            </p>
          </section>
        </div>
      </div>
      <ServiceInlineForm
        ctaTitle="Want Your Schema Reviewed by a Human?"
        ctaSubtitle="Tell me your site and CMS. The £495 audit reviews and validates your existing structured data against Google's Rich Results Test and gives you developer-ready fixes. Implementation is quoted separately or covered in a retainer."
        eventLabel="schema_generator_form"
        offerId="schema_review_audit"
        offerLabel="Schema review (from schema generator)"
        leadValue={495}
        submitLabel="Request a schema review"
      />
      <RelatedTools currentHref="/tools/schema-generator/" />
      <Footer />
    </main>
  );
}
