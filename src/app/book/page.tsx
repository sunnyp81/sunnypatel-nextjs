import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { GradientButton } from "@/components/ui/gradient-button";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { BOOK, BOOK_SOURCE_COUNT } from "@/data/book-sources";

const SITE_URL = "https://sunnypatel.co.uk";
const PAGE_URL = `${SITE_URL}/book/`;
const KINDLE_URL = "https://www.amazon.co.uk/dp/B0HMPBBK3B";

export function generateMetadata() {
  return buildMetadata({
    title: "Get Your Business Seen Online: Book by Sunny Patel",
    description:
      "A practical guide to websites, SEO and AI search for UK business owners and marketing leads, by Sunny Patel. Kindle edition, with every source linked.",
    path: "/book",
    type: "website",
  });
}

const PAGE_SCHEMA = schemaGraph(
  {
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: `${BOOK.title} by ${BOOK.author}`,
    inLanguage: "en-GB",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${PAGE_URL}#book` },
  },
  {
    "@type": "Book",
    "@id": `${PAGE_URL}#book`,
    name: BOOK.title,
    alternativeHeadline: BOOK.subtitle,
    url: PAGE_URL,
    author: { "@id": `${SITE_URL}/#person` },
    inLanguage: "en-GB",
    sameAs: [KINDLE_URL],
    workExample: {
      "@type": "Book",
      "@id": `${PAGE_URL}#kindle`,
      bookFormat: "https://schema.org/EBook",
      url: KINDLE_URL,
    },
  },
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Book", url: PAGE_URL },
  ])
);

const AUDIENCE = [
  "Owners of service businesses who want to be found and contacted online.",
  "Marketing leads who brief developers, agencies or freelancers and want to judge the work.",
  "Anyone who has been told they need SEO and wants to know what that means.",
];

export default function BookPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_SCHEMA }} />

      <main className="relative min-h-screen bg-background">
        <Navbar />
        <div id="main-content" tabIndex={-1} />

        <div className="relative pb-12 pt-32">
          <div className="mx-auto max-w-3xl px-6">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Book" }]} />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand-ink">
              Book by Sunny Patel
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              {BOOK.title}
            </h1>
            <p className="mt-3 text-xl leading-snug text-muted-foreground">{BOOK.subtitle}</p>

            <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                A practical guide to websites, SEO, local search and AI search for UK business owners
                and marketing leads. It starts with the basics, so you don&apos;t need any SEO
                knowledge to read it.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <GradientButton asChild>
                <a href={KINDLE_URL} rel="noopener" className="gap-2">
                  Get the Kindle edition
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </GradientButton>
              <Link
                href="/book/sources/"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                See all {BOOK_SOURCE_COUNT} sources
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-12">
          <section aria-labelledby="who-for" className="mb-12">
            <h2
              id="who-for"
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Who it is for
            </h2>
            <ul className="mt-4 space-y-3 border-l border-hairline-strong pl-5 text-base leading-relaxed text-muted-foreground">
              {AUDIENCE.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="book-facts" className="mb-12">
            <h2
              id="book-facts"
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Book details
            </h2>
            <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-x-6 gap-y-3 text-base">
              <dt className="text-muted-foreground">Title</dt>
              <dd className="m-0 text-foreground">{BOOK.title}</dd>
              <dt className="text-muted-foreground">Subtitle</dt>
              <dd className="m-0 text-foreground">{BOOK.subtitle}</dd>
              <dt className="text-muted-foreground">Author</dt>
              <dd className="m-0 text-foreground">
                <Link href="/about/" className="underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink">
                  {BOOK.author}
                </Link>
              </dd>
              <dt className="text-muted-foreground">Format</dt>
              <dd className="m-0 text-foreground">Kindle edition</dd>
              <dt className="text-muted-foreground">Sources</dt>
              <dd className="m-0 text-foreground">
                <Link href="/book/sources/" className="underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink">
                  Every source, checked and kept up to date
                </Link>
              </dd>
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              These details are also on the{" "}
              <Link href="/facts/#book" className="underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink">
                facts page
              </Link>
              .
            </p>
          </section>

          <section aria-labelledby="book-help" className="mb-8">
            <h2
              id="book-help"
              className="text-xl font-bold text-foreground md:text-2xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Want help applying it to your website?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              If you&apos;ve read the book and want a second pair of eyes on your own site, tell me
              what you&apos;re working on.
            </p>
            <div className="mt-6">
              <GradientButton asChild>
                <Link href="/contact/" className="gap-2">
                  Work with me
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </GradientButton>
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </>
  );
}
