import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";
import { ServiceInlineForm } from "@/components/service-inline-form";
import SchemaGenerator from "../SchemaGenerator";
import { SCHEMA_TYPE_ENTRIES, getEntry } from "../type-content";

export async function generateStaticParams() {
  return SCHEMA_TYPE_ENTRIES.map((e) => ({ type: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const entry = getEntry(type);
  if (!entry) return {};

  return {
    title: entry.title,
    description: entry.metaDescription,
    alternates: { canonical: `https://sunnypatel.co.uk/tools/schema-generator/${entry.slug}/` },
  };
}

export default async function SchemaTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const entry = getEntry(type);
  if (!entry) notFound();

  const otherTypes = SCHEMA_TYPE_ENTRIES.filter((e) => e.slug !== entry.slug);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <SchemaGenerator initialType={entry.schemaType} />

        <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
          <section>
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What is {entry.label} schema?
            </h2>
            <div className="space-y-4 max-w-3xl">
              {entry.intro.map((para, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {entry.faqs.map((f) => (
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
              includes a full schema markup review. Not sure where to paste the code above? Read{" "}
              <a
                href="/blog/how-to-add-schema-markup/"
                className="text-brand underline underline-offset-2 hover:opacity-80"
              >
                how to add schema markup to your website
              </a>
              .
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Other schema types
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tools/schema-generator/"
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors border-white/[0.08] text-muted-foreground hover:text-foreground"
              >
                All schema types
              </Link>
              {otherTypes.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/schema-generator/${t.slug}/`}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors border-white/[0.08] text-muted-foreground hover:text-foreground"
                >
                  {t.label}
                </Link>
              ))}
            </div>
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
