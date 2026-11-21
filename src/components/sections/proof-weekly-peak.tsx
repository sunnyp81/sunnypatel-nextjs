"use client";

import { useEffect, useRef, useState } from "react";
import { PeakChart } from "@/components/ui/peak-chart";

type Week = { weekStart: string; clicks: number };

const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" });
const count = (n: number) => n.toLocaleString("en-GB");

// Weekly Google clicks for /proof, drawn in the same Peak card as the homepage proof section.
export function ProofWeeklyPeak({ weeks }: { weeks: Week[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, Math.min(380, Math.floor(el.clientWidth / 10) * 10)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const latest = weeks[weeks.length - 1];
  const previous = weeks[weeks.length - 2];
  const up = latest.clicks >= previous.clicks;

  return (
    <figure className="mx-auto w-full max-w-[380px]">
      <div ref={ref} className="relative w-full" style={{ aspectRatio: "540 / 696" }}>
        {width ? (
          <PeakChart
            width={width}
            accent="#5b8aef"
            data={weeks.map((w) => w.clicks)}
            labels={weeks.map((w) => `Week of ${day(w.weekStart)}`)}
            value={latest.clicks}
            valueSuffix=""
            title={`Clicks, week of ${day(latest.weekStart)}`}
            caption={`${up ? "Up" : "Down"} from ${count(previous.clicks)} the week before`}
            trend={up ? "up" : "down"}
            updatedText="Google Search Console"
            periods={[]}
            anchor="last"
            zeroBased
            axisLabels={[day(weeks[0].weekStart), day(latest.weekStart)]}
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
        Weekly clicks from Google: {weeks.map((w) => `week of ${day(w.weekStart)} ${count(w.clicks)}`).join(", ")}.
      </figcaption>
    </figure>
  );
}
