import { Shield } from "lucide-react";

export function RiskReversal({
  heading = "Zero-Risk Guarantee",
  points,
  accentColor,
}: {
  heading?: string;
  points: string[];
  accentColor: string;
}) {
  return (
    <div
      className="my-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      <div className="mb-4 flex items-center gap-3">
        <Shield className="h-6 w-6" style={{ color: accentColor }} />
        <h3
          className="text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {heading}
        </h3>
      </div>

      <ul className="space-y-2.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span style={{ color: accentColor }} className="mt-0.5 shrink-0">
              ✓
            </span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
