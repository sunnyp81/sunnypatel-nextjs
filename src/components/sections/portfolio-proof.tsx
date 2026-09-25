import { PORTFOLIO_PROOF, type ProofSeries } from "@/data/portfolio-proof-data";

function MonthlyChart({ series }: { series: ProofSeries }) {
  const max = Math.max(...series.months.map((month) => month.clicks));

  return (
    <figure className="mt-6">
      <figcaption className="mb-3 text-xs text-muted-foreground dark:text-white/70">Clicks per month</figcaption>
      <div className="grid grid-cols-6 gap-1 border-b border-hairline pt-8 dark:border-transparent" aria-hidden="true">
        {series.months.map((month) => {
          const height = `${(month.clicks / max) * 100}%`;

          return (
            <div key={month.label} className="min-w-0 text-center">
              <div className="relative h-44">
                <span
                  className="absolute inset-x-0 text-xs font-semibold tabular-nums text-foreground dark:text-white"
                  style={{ bottom: `calc(${height} + 0.5rem)` }}
                >
                  {month.clicks.toLocaleString("en-GB")}
                </span>
                <div
                  className={`absolute bottom-0 left-1/2 w-3/4 max-w-10 -translate-x-1/2 ${
                    month.partial
                      ? "border-2 border-dashed border-gold"
                      : "bg-brand"
                  }`}
                  style={{ height }}
                />
              </div>
              <p className="mt-3 min-h-12 text-xs leading-4 text-muted-foreground dark:text-white/70">
                {month.label}
              </p>
            </div>
          );
        })}
      </div>
      <ul className="sr-only">
        {series.months.map((month) => (
          <li key={month.label}>
            {month.label}: {month.clicks.toLocaleString("en-GB")} clicks
            {month.partial ? " (partial month)" : ""}.
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function PortfolioProof() {
  return (
    <section
      aria-labelledby="portfolio-proof-heading"
      className="border-t border-hairline bg-surface-1 py-24 md:py-32 dark:border-white/[0.05] dark:bg-[#050507]"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-ink">
            PROOF FROM MY OWN PORTFOLIO
          </p>
          <h2
            id="portfolio-proof-heading"
            className="text-2xl font-bold text-foreground md:text-3xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Real Search Console data, not case-study claims
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {PORTFOLIO_PROOF.map((series) => (
            <article
              key={series.sector}
              className="min-w-0 rounded-2xl border border-hairline bg-surface-2 p-6 shadow-[var(--elev)] sm:p-8 dark:border-white/[0.08] dark:bg-black/20 dark:shadow-none"
            >
              <h3 className="text-sm font-semibold leading-6 text-foreground md:min-h-18">
                {series.sector}
                {series.sector === "EV charging directory" && (
                  <span className="font-normal text-muted-foreground dark:text-white/70">
                    {" (new site, first search impressions late March 2026)"}
                  </span>
                )}
              </h3>
              <MonthlyChart series={series} />
              <p className="mt-4 text-sm leading-6 text-muted-foreground dark:text-white/70">{series.takeaway}</p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs leading-5 text-muted-foreground dark:text-white/70">
          Source: Google Search Console, clicks per month, April to 22 September 2026. Sites I own and run, labelled by sector. Not client results. Results vary by niche and starting point.
        </p>
      </div>
    </section>
  );
}
