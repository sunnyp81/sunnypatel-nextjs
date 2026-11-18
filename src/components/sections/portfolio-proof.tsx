import portfolioProof from "@/data/portfolio-proof.json";
import { PortfolioPeak } from "@/components/sections/portfolio-peak";

const monthYear = (ym: string) =>
  new Date(`${ym}-01T12:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", month: "long", year: "numeric" });

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
      className="overflow-x-clip bg-gradient-to-b from-background to-surface-1 py-24 md:py-32 dark:bg-none dark:bg-[#050507]"
    >
      <div className="mx-auto max-w-5xl px-6">
      <PortfolioPeak series={portfolioProof.series}>
          <div className="mb-8">
            <p className="mb-2 text-[13.5px] font-semibold text-brand-ink">
              Proof from my own portfolio
            </p>
            <h2
              id="portfolio-proof-heading"
              className="text-balance text-2xl font-bold text-foreground md:text-3xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Real Search Console data, not <span className="whitespace-nowrap">case-study claims</span>
            </h2>
            </div>
        </PortfolioPeak>

        <p className="mt-10 text-xs leading-5 text-muted-foreground dark:text-white/70">
          Source: Google Search Console, clicks per completed month, to {monthYear(lastMonth)}. Last checked {checked}. Sites I own and run, labelled by sector. Not client results. Results vary by niche and starting point.
        </p>
      </div>
    </section>
  );
}
