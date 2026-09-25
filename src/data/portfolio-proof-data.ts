// Source: Google Search Console, clicks per month, sites owned and run by the site
// owner. Pulled 2026-09-25. September is partial (1-22 Sep only).
export type MonthlyClicks = { label: string; clicks: number; partial?: boolean };
export type ProofSeries = { sector: string; takeaway: string; months: MonthlyClicks[] };

export const PORTFOLIO_PROOF: ProofSeries[] = [
  {
    sector: "EV charging directory",
    takeaway: "8 clicks in April to 2,236 in August.",
    months: [
      { label: "Apr", clicks: 8 },
      { label: "May", clicks: 188 },
      { label: "Jun", clicks: 622 },
      { label: "Jul", clicks: 1495 },
      { label: "Aug", clicks: 2236 },
      { label: "Sep (to 22nd)", clicks: 2025, partial: true },
    ],
  },
  {
    sector: "Home and water information site",
    takeaway: "1,045 in April to a 2,336 July peak, then 1,868 in August.",
    months: [
      { label: "Apr", clicks: 1045 },
      { label: "May", clicks: 981 },
      { label: "Jun", clicks: 1405 },
      { label: "Jul", clicks: 2336 },
      { label: "Aug", clicks: 1868 },
      { label: "Sep (to 22nd)", clicks: 1324, partial: true },
    ],
  },
];
