import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { GradientButton } from "@/components/ui/gradient-button";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import {
  BOOK,
  BOOK_PARTS,
  BOOK_SOURCE_COUNT,
  LINKS_LAST_CHECKED,
  type BookSource,
} from "@/data/book-sources";

const SITE_URL = "https://sunnypatel.co.uk";
const PAGE_URL = `${SITE_URL}/book/sources/`;

export function generateMetadata() {
  return buildMetadata({
    title: "Book Sources and Links | Get Your Business Seen Online",
    description:
      "Every source cited in Get Your Business Seen Online by Sunny Patel, grouped by part and chapter, with each link checked and kept up to date.",
    path: "/book/sources",
  });
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function hostOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

const allSources = Array.from(
  new Map(
    BOOK_PARTS.flatMap((p) => p.chapters.flatMap((c) => c.sources)).map((s) => [s.url, s])
  ).values()
);

const PAGE_SCHEMA = schemaGraph(
  {
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: `Sources and links: ${BOOK.title}`,
    description:
      "The public sources cited in Get Your Business Seen Online, grouped by part and chapter and kept up to date.",
    inLanguage: "en-GB",
    dateModified: LINKS_LAST_CHECKED,
    author: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${PAGE_URL}#book` },
  },
  {
    "@type": "Book",
    "@id": `${PAGE_URL}#book`,
    name: BOOK.title,
    alternativeHeadline: BOOK.subtitle,
    author: { "@id": `${SITE_URL}/#person` },
    bookFormat: "https://schema.org/Paperback",
    inLanguage: "en-GB",
    citation: allSources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
  },
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Book sources", url: PAGE_URL },
  ])
);

function SourceItem({ source }: { source: BookSource }) {
  return (
    <li className="border-t border-hairline py-5 first:border-t-0 first:pt-0">
      <a
        href={source.url}
        rel="noopener"
        className="group text-base font-semibold text-foreground underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-brand-ink hover:decoration-current focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
      >
        {source.title}
        <ArrowUpRight aria-hidden="true" className="ml-1 inline h-4 w-4 align-[-0.15em] opacity-60 group-hover:opacity-100" />
      </a>
      <p className="mt-1 text-xs text-muted-foreground">
        {source.publisher} <span aria-hidden="true">·</span>{" "}
        <span className="font-mono">{hostOf(source.url)}</span>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{source.note}</p>
      <p className="mt-2 text-xs text-muted-foreground/80">
        Link checked <time dateTime={source.checked}>{formatDate(source.checked)}</time>
        {source.printedUrl && (
          <>
            . The address printed in the book now redirects here:{" "}
            <span className="break-all font-mono">{source.printedUrl.replace(/^https:\/\//, "")}</span>
          </>
        )}
      </p>
    </li>
  );
}

export default function BookSourcesPage() {
  const checked = formatDate(LINKS_LAST_CHECKED);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_SCHEMA }} />

      <main className="relative min-h-screen bg-background">
        <Navbar />
        <div id="main-content" tabIndex={-1} />

        <div className="relative pb-10 pt-32">
          <div className="mx-auto max-w-3xl px-6">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Book sources" }]} />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand-ink">
              Companion page to the book
            </p>
            <h1
              className="text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Sources and links from <cite className="not-italic">{BOOK.title}</cite>
            </h1>
            <div className="mt-5 max-w-2xl space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                <cite className="not-italic text-foreground">
                  {BOOK.title}: {BOOK.subtitle}
                </cite>{" "}
                is my practical guide for UK business owners and the people who build and market
                their websites. The book prints its web addresses in full. This page lists the same
                sources so you can open them with one tap.
              </p>
              <p className="text-base">
                Search engines and regulators move and rewrite their guidance. I check every link
                here and update it when a page moves or changes. If something in the book no longer
                matches its source, the version on this page is the one to trust.
              </p>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-hairline bg-hairline text-sm">
              <div className="bg-background p-4">
                <dt className="text-xs text-muted-foreground">Sources</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {BOOK_SOURCE_COUNT}
                </dd>
              </div>
              <div className="bg-background p-4">
                <dt className="text-xs text-muted-foreground">Parts covered</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {BOOK_PARTS.filter((p) => p.id.startsWith("part-")).length}
                </dd>
              </div>
              <div className="bg-background p-4">
                <dt className="text-xs text-muted-foreground">Links last checked</dt>
                <dd className="mt-1 font-semibold text-foreground">
                  <time dateTime={LINKS_LAST_CHECKED}>{checked}</time>
                </dd>
              </div>
            </dl>

            <nav aria-label="Jump to a part of the book" className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Jump to
              </p>
              <ol className="flex flex-wrap gap-2">
                {BOOK_PARTS.map((part) => (
                  <li key={part.id}>
                    <a
                      href={`#${part.id}`}
                      className="inline-flex min-h-11 items-center rounded-md border border-hairline-strong px-3 text-sm text-foreground transition-colors hover:border-brand-ink hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                      {part.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-12">
          {BOOK_PARTS.map((part) => (
            <section key={part.id} id={part.id} aria-labelledby={`${part.id}-title`} className="mb-16 scroll-mt-28">
              <h2
                id={`${part.id}-title`}
                className="text-2xl font-bold text-foreground md:text-3xl"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
              >
                <span className="block text-sm font-semibold uppercase tracking-widest text-brand-ink">
                  {part.label}
                </span>
                {part.title}
              </h2>

              <div className="mt-8 space-y-10">
                {part.chapters.map((chapter) => (
                  <div key={chapter.label} className="grid gap-4 md:grid-cols-[9rem_1fr] md:gap-8">
                    <h3 className="text-base font-semibold text-foreground md:sticky md:top-28 md:self-start md:pt-0.5">
                      <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {chapter.label}
                      </span>
                      <span className="mt-1 block leading-snug">{chapter.title}</span>
                    </h3>
                    <ul className="border-l border-hairline-strong pl-5 md:pl-8">
                      {chapter.sources.map((source) => (
                        <SourceItem key={source.url} source={source} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <p className="mb-16 text-sm leading-relaxed text-muted-foreground">
            Chapters not listed above don&apos;t link to outside web pages.
          </p>

          <section aria-labelledby="about-book" className="mb-12 rounded-md border border-hairline bg-wash p-6 md:p-8">
            <h2
              id="about-book"
              className="text-xl font-bold text-foreground md:text-2xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              About the book
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              <cite className="not-italic text-foreground">{BOOK.title}</cite> covers how buyers
              search now, what a website needs to be found and trusted, local and AI search, and how
              to test changes without fooling yourself. Parts 1 to 5 are for owners and buyers of
              website and SEO work. Part 6 sets out the methods I use in depth, for marketers and
              in-house teams.
            </p>
          </section>

          <section aria-labelledby="work-with-me" className="mb-8">
            <h2
              id="work-with-me"
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
