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
    body: "Builds an FAQPage block from question and answer pairs visible on your page. FAQPage describes those answers in structured data; it does not establish that an AI assistant will retrieve or cite them. Check Google's current feature guidance before expecting a search enhancement.",
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
    body: "Outputs Product markup with price, currency, availability, brand, SKU, and an optional aggregate rating. Product snippets can use offers, reviews or aggregate ratings under Google's requirements. Add ratings only when genuine, visible ratings exist; prices and stars are different enhancements, and neither is guaranteed.",
  },
  {
    name: "Breadcrumb schema generator",
    href: "/tools/schema-generator/breadcrumb/",
    body: "Builds a BreadcrumbList describing the page's place in your site hierarchy. Google can use eligible breadcrumb markup for a readable page trail in search; adding the markup does not guarantee that presentation.",
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
    body: "Generates Person markup for a founder, author, or team member, with job title, employer, photo, and social profile links. Describe verified identity and role details; Person markup alone is not proof of expertise or a promise of a Google rich result.",
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
    a: "Schema markup describes page content in a machine-readable format. Eligible types that meet Google's requirements can qualify for rich results, but correct markup does not guarantee a rich result, higher rankings or an AI citation. Google does not require special schema for AI Overviews or AI Mode.",
  },
  {
    q: "How do I validate the generated schema?",
    a: "Copy the generated markup, open Google's Rich Results Test, choose Code, and paste it. Use the Schema Markup Validator for a separate check against the broader schema.org vocabulary. Passing either test does not guarantee a Google rich result.",
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
      "Free JSON-LD and Microdata schema markup generator for 16 schema types, from FAQ and Article to JobPosting and Event, with links to Google's and Schema.org's validators.",
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
                basic template fields as you type, and gives you a copy-paste script tag plus
                a clear copy, open and paste workflow for Google&apos;s Rich Results Test. Read the{" "}
                <Link
                  href="/blog/seo-semantic-markup-guide/"
                  className="text-brand underline underline-offset-2 hover:opacity-80"
                >
                  semantic markup guide
                </Link>{" "}
                for the semantic SEO thinking behind structured data.
              </p>
            </div>
          </section>

          <section aria-labelledby="schema-page-choice" className="max-w-3xl">
            <h2 id="schema-page-choice" className="text-xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Which schema type belongs on your page?
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                A schema markup generator turns facts from a page into structured data. Choose
                the type that describes the page&apos;s actual subject: Article for an editorial
                article, Product for a specific product, and LocalBusiness for a business with
                relevant location details. Describe the content visitors can read; do not add
                a product, review or rating just to pursue a search feature.
              </p>
              <p>
                WebPage describes an individual page; WebSite describes the site as a whole.
                This generator has a WebSite template but no dedicated WebPage template. Use
                a matching specific template where appropriate, or build a WebPage block using
                the <a href="https://schema.org/WebPage" className="text-brand underline underline-offset-2 hover:opacity-80">Schema.org WebPage reference</a>.
                A generic WebPage declaration alone does not qualify a page for every Google rich result.
              </p>
            </div>
          </section>

          <section aria-labelledby="schema-product-check" className="max-w-3xl">
            <h2 id="schema-product-check" className="text-xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              What should you check before publishing Product schema?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Product schema should describe the specific product shown on the page. Check its
              name, image, price, currency and availability against the visible product details.
              If you include an aggregate rating, verify the rating value and count against
              genuine ratings shown to visitors. This generator&apos;s field checks do not verify
              those facts or assess every Google eligibility rule. Follow the
              {" "}<a href="https://developers.google.com/search/docs/appearance/structured-data/product-snippet" className="text-brand underline underline-offset-2 hover:opacity-80">Google Product snippet requirements</a>,
              then test both the generated code and the published URL.
            </p>
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
                  className="group rounded-xl border border-hairline bg-wash dark:bg-white/[0.02] p-5 transition-colors hover:border-brand/30 hover:bg-brand/[0.04]"
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
                Pick a schema type above, fill in the fields, and fix any template issues the tool shows.
                Required properties are marked with an asterisk.
              </li>
              <li className="text-sm text-muted-foreground leading-relaxed">
                Copy the script tag and paste it into the page&apos;s HTML. Head or body both work.
                Platform-specific steps are in{" "}
                <Link
                  href="/blog/how-to-add-schema-markup/"
                  className="text-brand underline underline-offset-2 hover:opacity-80"
                >
                  how to add schema markup to your website
                </Link>
                .
              </li>
              <li className="text-sm text-muted-foreground leading-relaxed">
                Copy the markup, open the relevant validator, choose its code option where shown,
                and paste. After publishing, test the live URL and monitor any supported enhancement
                report available in Search Console.
              </li>
            </ol>
            <p className="mt-4 max-w-3xl text-sm text-muted-foreground leading-relaxed">
              Google&apos;s Rich Results Test checks supported Google search features; the Schema
              Markup Validator checks the broader Schema.org vocabulary. Passing a validator is
              a code check, not proof of search visibility. Google&apos;s
              {" "}<a href="https://developers.google.com/search/docs/appearance/ai-features" className="text-brand underline underline-offset-2 hover:opacity-80">AI feature guidance</a>
              {" "}requires no special schema for AI Overviews or AI Mode. Keep structured data
              consistent with the visible page and retain useful explanations in the page text.
            </p>
          </section>

          <section className="rounded-xl border border-hairline bg-wash dark:bg-white/[0.02] p-6">
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
              Want your structured data reviewed and validated by a human? The{" "}
              <Link
                href="/services/technical-seo-audit/"
                className="text-brand underline underline-offset-2 hover:opacity-80"
              >
                technical SEO audit
              </Link>{" "}
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
