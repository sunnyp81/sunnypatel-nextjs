import portfolioProof from "@/data/portfolio-proof.json";

const CHART_MONTHS = 6;

type MonthlyClicks = { ym: string; clicks: number };

const monthName = (ym: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${ym}-01T12:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", ...options });
const shortMonth = (ym: string) => monthName(ym, { month: "short" }).slice(0, 3);
const longMonth = (ym: string) => monthName(ym, { month: "long" });
const monthYear = (ym: string) => monthName(ym, { month: "long", year: "numeric" });
const count = (n: number) => n.toLocaleString("en-GB");

function takeaway(months: MonthlyClicks[]) {
  const first = months[0];
  const latest = months[months.length - 1];
  const peak = months.reduce((best, month) => (month.clicks > best.clicks ? month : best), first);

  if (peak.ym === latest.ym) {
    return `${count(first.clicks)} clicks in ${monthYear(first.ym)} to ${count(latest.clicks)} in ${longMonth(latest.ym)}, the highest month so far.`;
  }
  return `${count(first.clicks)} clicks in ${monthYear(first.ym)} to a ${count(peak.clicks)} peak in ${longMonth(peak.ym)}, then ${count(latest.clicks)} in ${longMonth(latest.ym)}.`;
}

function MonthlyChart({ months }: { months: MonthlyClicks[] }) {
  const max = Math.max(...months.map((month) => month.clicks));

  return (
    <figure className="mt-6">
      <figcaption className="mb-3 text-xs text-muted-foreground dark:text-white/70">Clicks per month</figcaption>
      <div className="grid grid-cols-6 gap-1 border-b border-hairline pt-8 dark:border-transparent" aria-hidden="true">
        {months.map((month) => {
          const height = `${(month.clicks / max) * 100}%`;

          return (
            <div key={month.ym} className="min-w-0 text-center">
              <div className="relative h-44">
                <span
                  className="absolute inset-x-0 text-xs font-semibold tabular-nums text-foreground dark:text-white"
                  style={{ bottom: `calc(${height} + 0.5rem)` }}
                >
                  {count(month.clicks)}
                </span>
                <div
                  className="absolute bottom-0 left-1/2 w-3/4 max-w-10 -translate-x-1/2 bg-brand"
                  style={{ height }}
                />
              </div>
              <p className="mt-3 min-h-12 text-xs leading-4 text-muted-foreground dark:text-white/70">
                {shortMonth(month.ym)}
              </p>
            </div>
          );
        })}
      </div>
      <ul className="sr-only">
        {months.map((month) => (
          <li key={month.ym}>
            {monthYear(month.ym)}: {count(month.clicks)} clicks.
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function PortfolioProof() {
  const lastMonth = portfolioProof.series[0].months.at(-1)!.ym;
  const checked = new Date(`${portfolioProof.updatedAt}T12:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      aria-labelledby="portfolio-proof-heading"
      className="bg-gradient-to-b from-background to-surface-1 py-24 md:py-32 dark:bg-none dark:bg-[#050507]"
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
          {portfolioProof.series.map((series) => (
            <article
              key={series.sector}
              className="min-w-0 rounded-2xl border border-hairline bg-surface-2 p-6 shadow-[var(--elev)] sm:p-8 dark:border-white/[0.08] dark:bg-black/20 dark:shadow-none"
            >
              <h3 className="text-sm font-semibold leading-6 text-foreground md:min-h-18">
                {series.sector}
                {series.note && (
                  <span className="font-normal text-muted-foreground dark:text-white/70">
                    {` (${series.note})`}
                  </span>
                )}
              </h3>
              <MonthlyChart months={series.months.slice(-CHART_MONTHS)} />
              <p className="mt-4 text-sm leading-6 text-muted-foreground dark:text-white/70">{takeaway(series.months)}</p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs leading-5 text-muted-foreground dark:text-white/70">
          Source: Google Search Console, clicks per completed month, to {monthYear(lastMonth)}. Last checked {checked}. Sites I own and run, labelled by sector. Not client results. Results vary by niche and starting point.
        </p>
      </div>
    </section>
  );
}
