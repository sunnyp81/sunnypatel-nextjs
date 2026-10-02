import Link from "next/link";
import { TrendingUp, Users, Clock, Award } from "lucide-react";

const STATS = [
  { icon: Clock, value: "15+", label: "Years Experience", color: "var(--brand-ink)" },
  { icon: TrendingUp, value: "+340%", label: "Aatma Organic Traffic YoY (Case Study)", color: "var(--teal-ink)" },
  { icon: Users, value: "45", label: "Historical Portfolio Case Study", color: "var(--brand-ink)" },
  { icon: Award, value: "Free", label: "20-Minute Diagnosis", color: "var(--teal-ink)" },
] as const;

export function StatsBar() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline dark:border-white/[0.06] bg-surface-1 dark:bg-[#0c0c14]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-full w-[600px] -translate-x-1/2 opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse at center top, #5B8AEF, transparent 70%)" }}
      />
      <div className="relative grid grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, value, label, color }, i) => (
          <div
            key={label}
            className={`flex flex-col items-center gap-2 px-6 py-7 text-center ${
              i < STATS.length - 1 ? "border-r border-hairline dark:border-white/[0.04]" : ""
            } ${i < 2 ? "border-b border-hairline dark:border-white/[0.04] lg:border-b-0" : ""}`}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 20%, transparent)` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <p className="relative px-6 pb-5 text-center text-xs text-muted-foreground">
        Historical examples: <Link className="underline underline-offset-4" href="/portfolio/aatma-aesthetics-website-design-development-seo/">Aatma case study</Link> and <Link className="underline underline-offset-4" href="/portfolio/niche-affiliate-seo-portfolio-45-sites/">45-site portfolio case study</Link>. These are separate examples, not current portfolio totals or forecasts.
      </p>
    </div>
  );
}
