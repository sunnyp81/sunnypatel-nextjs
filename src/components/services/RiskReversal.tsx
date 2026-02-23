import { Shield } from "lucide-react";

export function RiskReversal({
  heading = "Zero-Risk Engagement",
  points,
  accentColor,
}: {
  heading?: string;
  points: string[];
  accentColor: string;
}) {
  return (
    <div
      className="rounded-2xl border border-[#5B8AEF]/20 bg-white/[0.02] p-6 shadow-[0_0_24px_rgba(91,138,239,0.10)]"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Shield className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <h3
          className="text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {heading}
        </h3>
      </div>

      <ul className="space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span style={{ color: accentColor }} className="mt-0.5 shrink-0 font-bold">
              ✓
            </span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
