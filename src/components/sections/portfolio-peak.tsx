"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PeakChart } from "@/components/ui/peak-chart";

type MonthlyClicks = { ym: string; clicks: number };
export type ProofSeries = { sector: string; note?: string; months: MonthlyClicks[] };

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

function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, Math.min(400, Math.floor(el.clientWidth / 10) * 10)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

export function PortfolioPeak({ series, children }: { series: ProofSeries[]; children?: ReactNode }) {
  const [active, setActive] = useState(0);
  const { ref, width } = useChartWidth();
  const current = series[active];
  const months = current.months;
  const latest = months[months.length - 1];
  const previous = months[months.length - 2];

  return (
    <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_400px] md:gap-16">
      <div className="min-w-0">
        {children}
        <p className="mb-4 text-sm text-muted-foreground dark:text-white/70">
          Two sites I own and run. Pick one to draw its line on the chart.
        </p>
        <ul className="space-y-3">
          {series.map((s, i) => {
            const first = s.months[0];
            const last = s.months[s.months.length - 1];
            const selected = i === active;

            return (
              <li key={s.sector}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActive(i)}
                  className={`group w-full rounded-xl border p-5 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink sm:p-6 ${
                    selected
                      ? "border-brand-ink/50 bg-brand-wash dark:border-brand/50"
                      : "border-hairline bg-surface-2 hover:border-hairline-strong dark:border-white/[0.08] dark:bg-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-semibold text-foreground">{s.sector}</span>
                    <span
                      className={`shrink-0 text-xs font-medium ${selected ? "text-brand-ink" : "text-muted-foreground dark:text-white/60"}`}
                    >
                      {selected ? "Showing" : "Show"}
                    </span>
                  </span>
                  {s.note && (
                    <span className="mt-1 block text-xs text-muted-foreground dark:text-white/60">{s.note}</span>
                  )}
                  <span
                    className="mt-4 flex items-baseline gap-3 text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    <span className="text-xl tabular-nums text-muted-foreground dark:text-white/60">{count(first.clicks)}</span>
                    <span aria-hidden="true" className="text-muted-foreground dark:text-white/50">to</span>
                    <span className="text-3xl font-bold tabular-nums" style={{ letterSpacing: "-0.03em" }}>
                      {count(last.clicks)}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-white/60">
                      clicks a month, {shortMonth(first.ym)} to {shortMonth(last.ym)}
                    </span>
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-muted-foreground dark:text-white/70">
                    {takeaway(s.months)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <figure className="mx-auto w-full max-w-[400px]">
        <div ref={ref} className="relative w-full" style={{ aspectRatio: "540 / 696" }}>
          {width ? (
            <PeakChart
              width={width}
              accent="#5b8aef"
              data={months.map((m) => m.clicks)}
              labels={months.map((m) => monthName(m.ym, { month: "short", year: "numeric" }))}
              value={latest.clicks}
              valueSuffix=""
              title={`Clicks in ${monthYear(latest.ym)}`}
              caption={`${latest.clicks >= previous.clicks ? "Up" : "Down"} from ${count(previous.clicks)} in ${longMonth(previous.ym)}`}
              trend={latest.clicks >= previous.clicks ? "up" : "down"}
              updatedText="Google Search Console"
              periods={[]}
              anchor="last"
              zeroBased
              axisLabels={[monthName(months[0].ym, { month: "short", year: "numeric" }), monthName(latest.ym, { month: "short", year: "numeric" })]}
              snapToPoints
              formatValue={(v) => `${count(Math.round(v))} clicks`}
              font="var(--font-heading), system-ui, sans-serif"
              className="absolute left-0 top-0"
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 rounded-[10%/8%] bg-[#04070d]" />
          )}
        </div>
        <figcaption className="sr-only">
          {current.sector}, Google clicks per month:{" "}
          {months.map((m) => `${monthYear(m.ym)} ${count(m.clicks)}`).join(", ")}.
        </figcaption>
      </figure>
    </div>
  );
}
