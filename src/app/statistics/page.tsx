import Link from "next/link";
import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { NeonTrace } from "@/components/statistics/neon-trace";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { STAT_GROUPS, STAT_PAGE_COUNT, type StatPage } from "@/data/statistics-hub";

const SITE_URL = "https://sunnypatel.co.uk";
const PAGE_URL = `${SITE_URL}/statistics/`;

export function generateMetadata() {
  return buildMetadata({
    title: "UK SEO, AI Search and Marketing Statistics | Sunny Patel",
    description:
      "Thirteen statistics pages on UK search, AI answers, local SEO, ecommerce, SEO pricing and marketing pay. Every figure names its source, and each page shows when it was last re-checked.",
    path: "/statistics",
  });
}

type Row = StatPage & { title: string; updated: string | null };

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const gradientText = {
  backgroundImage: "linear-gradient(100deg, var(--brand-ink) 0%, var(--brand-ink) 48%, var(--gold-ink) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

export default async function StatisticsHub() {
  const groups = await Promise.all(
    STAT_GROUPS.map(async (g) => ({
      ...g,
      rows: await Promise.all(
        g.pages.map(async (p): Promise<Row> => {
          const entry = await reader.collections.blog.read(p.slug);
          return {
            ...p,
            title: entry?.title ?? p.shortTitle,
            updated: entry?.lastUpdated ?? entry?.date ?? null,
          };
        })
      ),
    }))
  );

  const all = groups.flatMap((g) => g.rows);
  const newest = all.map((r) => r.updated).filter(Boolean).sort().at(-1) ?? null;
  const datasets = all.filter((r) => r.downloads?.length).length;

  const schema = schemaGraph(
    {
      "@type": "CollectionPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "UK SEO, AI search and marketing statistics",
      inLanguage: "en-GB",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#person` },
      ...(newest ? { dateModified: newest } : {}),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: all.length,
        itemListElement: all.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/blog/${r.slug}/`,
          name: r.title,
        })),
      },
    },
    breadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Statistics", url: PAGE_URL },
    ])
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

      <main className="relative min-h-screen bg-background">
        <Navbar />
        <div id="main-content" tabIndex={-1} />

        <header className="relative overflow-hidden pb-6 pt-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-[420px] w-[720px] -translate-x-1/4 rounded-full opacity-[0.07] blur-[120px]"
            style={{ background: "radial-gradient(circle, var(--brand-ink), transparent 70%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-24 h-[360px] w-[560px] translate-x-1/4 rounded-full opacity-[0.06] blur-[120px]"
            style={{ background: "radial-gradient(circle, var(--gold-ink), transparent 70%)" }}
          />
          <div className="relative mx-auto max-w-5xl px-6">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Statistics" }]} />

            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand-ink">
              Statistics library
            </p>
            <h1
              className="max-w-4xl text-4xl font-bold text-foreground md:text-6xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.035em", lineHeight: 1.05 }}
            >
              UK search, AI and marketing numbers, checked at source
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {STAT_PAGE_COUNT} pages of statistics I keep up to date. Each figure names who measured it, when
              and on what sample, so you can cite the original rather than me.
            </p>

            <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-md border border-hairline bg-hairline text-sm">
              <div className="bg-background p-4">
                <dt className="text-xs text-muted-foreground">Pages</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {STAT_PAGE_COUNT}
                </dd>
              </div>
              <div className="bg-background p-4">
                <dt className="text-xs text-muted-foreground">Open datasets</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {datasets}
                </dd>
              </div>
              <div className="bg-background p-4">
                <dt className="text-xs text-muted-foreground">Newest update</dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {newest ? <time dateTime={newest}>{formatDate(newest)}</time> : "Not recorded"}
                </dd>
              </div>
            </dl>

            <div className="mt-10 md:mb-10 md:mt-16">
              <NeonTrace items={all.map((r) => ({ href: `#${r.slug}`, value: r.figure.value, name: r.shortTitle }))} />
            </div>
          </div>
        </header>

        <nav aria-label="Jump to a topic" className="mx-auto max-w-5xl px-6 pt-6">
          <ol className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex min-h-11 items-center rounded-md border border-hairline-strong px-3 text-sm text-foreground transition-colors hover:border-brand-ink hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mx-auto max-w-5xl px-6 py-12">
          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="mb-16 scroll-mt-28">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2
                  id={`${g.id}-title`}
                  className="text-2xl font-bold text-foreground md:text-3xl"
                  style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
                >
                  {g.title}
                </h2>
                <p className="text-sm text-muted-foreground">{g.blurb}</p>
              </div>

              <ul className="mt-4">
                {g.rows.map((r) => (
                  <li
                    key={r.slug}
                    id={r.slug}
                    className="group relative scroll-mt-28 grid gap-4 border-t border-hairline py-8 md:grid-cols-[minmax(12rem,16rem)_1fr_auto] md:gap-10"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-px left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
                      style={{ backgroundImage: "linear-gradient(90deg, var(--brand-ink), var(--gold-ink))" }}
                    />
                    <div>
                      <p
                        className="text-[2.5rem] font-bold leading-none tabular-nums md:text-[3.25rem]"
                        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", ...gradientText }}
                      >
                        {r.figure.value}
                      </p>
                      <p className="mt-3 text-sm leading-snug text-foreground">{r.figure.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.figure.source}</p>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.01em" }}>
                        <Link
                          href={`/blog/${r.slug}/`}
                          className="underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
                        >
                          {r.title}
                        </Link>
                      </h3>
                      <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">{r.summary}</p>
                      {r.downloads && (
                        <p className="relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <ArrowDownToLine aria-hidden="true" className="h-3.5 w-3.5" />
                            Data
                          </span>
                          {r.downloads.map((d) => (
                            <a
                              key={d.href}
                              href={d.href}
                              download
                              className="inline-flex min-h-11 items-center font-semibold text-foreground underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                            >
                              {d.label}
                              <span className="sr-only">, {r.shortTitle}</span>
                            </a>
                          ))}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 text-sm md:flex-col md:items-end md:text-right">
                      <p className="text-muted-foreground">
                        <span className="block text-xs uppercase tracking-wide">Updated</span>
                        {r.updated ? (
                          <time className="font-semibold text-foreground" dateTime={r.updated}>
                            {formatDate(r.updated)}
                          </time>
                        ) : (
                          <span className="font-semibold text-foreground">Not recorded</span>
                        )}
                      </p>
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-0.5 hidden h-5 w-5 text-brand-ink transition-transform group-hover:translate-x-1 motion-reduce:transition-none md:block"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section aria-labelledby="stats-method" className="grid gap-10 border-t border-hairline-strong pt-12 md:grid-cols-2">
            <div>
              <h2
                id="stats-method"
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
              >
                How the dates work
              </h2>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground">
                <li>A page&apos;s date moves only after its figures have been re-checked at the source. Anything not re-checked is said on that page.</li>
                <li>Figures I cannot trace to a source are removed, not rounded or softened.</li>
                <li>A weekly review lists any page not updated for 25 days, so none goes quiet unnoticed.</li>
              </ul>
            </div>
            <div>
              <h2
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
              >
                How to cite
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Link to the original source behind a figure, and to the page here if it helped you find it.
                The figures belong to the organisations named beside them, not to me.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Spotted something out of date?{" "}
                <Link href="/contact/" className="font-semibold text-foreground underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink">
                  Tell me
                </Link>{" "}
                and I will check it.
              </p>
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </>
  );
}
