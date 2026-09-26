import dynamic from "next/dynamic";
import Link from "next/link";
import styles from "@/components/glow/glow.module.css";

const GlowChartFigure = dynamic(
  () => import("@/components/glow/glow-blocks").then((mod) => mod.GlowChartFigure),
  {
    loading: () => <div className={styles.figure} style={{ minHeight: 360 }} aria-hidden="true" />,
  },
);

/**
 * Both charts and the source citations below come straight from the
 * fact-checked {% chart %} tags in src/content/blog/ai-search-statistics,
 * the same numbers rendered on that stats page (last checked Sept 2026).
 */
export function StatsChartsSection() {
  return (
    <section
      id="ai-search-charts"
      aria-labelledby="stats-charts-heading"
      className="bg-surface-1 py-24 md:py-32 dark:bg-[#050507]"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-ink">
            AI SEARCH DATA I TRACK FOR CLIENTS
          </p>
          <h2
            id="stats-charts-heading"
            className="text-2xl font-bold text-foreground md:text-3xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Why fewer of your rankings are turning into clicks
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-white/70">
            I keep these two charts updated because they explain the traffic drop most site owners
            ask me about: Google is answering more searches itself before anyone reaches a website.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-hairline bg-surface-2 p-6 shadow-[var(--elev)] sm:p-8 dark:border-white/[0.08] dark:bg-black/20 dark:shadow-none">
            {/* Server-rendered so the headline numbers are crawlable without JS. */}
            <figure>
              <figcaption className="text-sm font-semibold leading-6 text-foreground">
                Organic click-through rate fell 61% once Google showed an AI Overview
              </figcaption>
              <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/70">
                Organic CTR went from 1.76% (June 2024 baseline) to 0.61% on the same queries once an
                AI Overview appeared (September 2025); paid CTR fell from 19.70% to 6.34% over the
                same comparison.
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground dark:text-white/70">
                Source: Seer Interactive, 3,119 queries across 42 organisations, data to September 2025.
              </p>
            </figure>
            <div className="mt-4">
              <GlowChartFigure
                eyebrow="AI Overviews impact on CTR"
                title="Organic CTR fell 61% as AI Overviews took the click"
                series="Organic CTR;Paid CTR"
                data="June 2024 baseline:1.76;19.70|September 2025, AI Overviews present:0.61;6.34"
                suffix="%"
                source="Seer Interactive, 3,119 queries, 42 organisations, data to Sept 2025"
              />
            </div>
          </article>

          <article className="min-w-0 rounded-2xl border border-hairline bg-surface-2 p-6 shadow-[var(--elev)] sm:p-8 dark:border-white/[0.08] dark:bg-black/20 dark:shadow-none">
            <figure>
              <figcaption className="text-sm font-semibold leading-6 text-foreground">
                69.5% of UK Google searches now end without a click
              </figcaption>
              <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/70">
                Between January and April 2026, 69.5% of UK Google searches ended with no click to any
                website, the highest zero-click rate of the six countries SparkToro measured (US 68.0%, Canada
                63.8%, Germany 62.1%).
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground dark:text-white/70">
                Source: SparkToro, 17 June 2026, Similarweb clickstream data.
              </p>
            </figure>
            <div className="mt-4">
              <GlowChartFigure
                eyebrow="Zero-click by country"
                title="Google searches that ended without a click, January to April 2026"
                data="United Kingdom:69.5|United States:68.0|Canada:63.8|Germany:62.1"
                suffix="%"
                highlight="United Kingdom"
                source="SparkToro, 17 June 2026, Similarweb clickstream data"
              />
            </div>
          </article>
        </div>

        <p className="mt-6 text-sm leading-6 text-muted-foreground dark:text-white/70">
          Both charts are pulled from{" "}
          <Link
            href="/blog/ai-search-statistics/"
            className="text-brand-ink underline underline-offset-2 hover:text-foreground dark:hover:text-white"
          >
            my full AI search statistics page
          </Link>
          , where every figure is checked against its primary source. Use the download and citation
          buttons on each chart to reuse the numbers with attribution.
        </p>
      </div>
    </section>
  );
}
