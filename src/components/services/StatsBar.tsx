import { TrendingUp, Users, Clock, Award } from "lucide-react";

const STATS = [
  { icon: Clock, value: "15+", label: "Years Experience", color: "#5B8AEF" },
  { icon: TrendingUp, value: "150–280%", label: "Avg Traffic Growth", color: "#7B5AEF" },
  { icon: Users, value: "50+", label: "UK Businesses", color: "#5B8AEF" },
  { icon: Award, value: "Free", label: "Initial Consultation", color: "#7B5AEF" },
] as const;

export function StatsBar() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14]">
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
              i < STATS.length - 1 ? "border-r border-white/[0.04]" : ""
            } ${i < 2 ? "border-b border-white/[0.04] lg:border-b-0" : ""}`}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}
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
    </div>
  );
}
