import Link from "next/link";
import { TrendingUp } from "lucide-react";

const PROOF_POINTS = [
  {
    sector: "Health & wellness",
    stat: "1,357",
    unit: "AI-attributed sessions / May-Aug 2026",
    detail:
      "34.4% of the 3,948 published assistant-attributed sessions in this six-site historical sample, the largest count in the group.",
  },
  {
    sector: "Education & local services",
    stat: "993",
    unit: "AI-attributed sessions / May-Aug 2026",
    detail:
      "25.2% of the published assistant-attributed sessions in this six-site historical sample, the second-largest count in the group.",
  },
  {
    sector: "Templates & productivity",
    stat: "593",
    unit: "AI-attributed sessions / May-Aug 2026",
    detail:
      "15.0% of the published assistant-attributed sessions in this six-site historical sample came from this templates and productivity site.",
  },
  {
    sector: "EV charging directory",
    stat: "570",
    unit: "AI-attributed sessions / May-Aug 2026",
    detail:
      "14.4% of the published assistant-attributed sessions in this six-site historical sample came from the EV charging directory.",
  },
  {
    sector: "Property investment tools",
    stat: "259",
    unit: "AI-attributed sessions / May-Aug 2026",
    detail:
      "6.6% of the published assistant-attributed sessions in this six-site historical sample came from the property investment tools site.",
  },
  {
    sector: "Utility checker tool",
    stat: "176",
    unit: "AI-attributed sessions / May-Aug 2026",
    detail:
      "4.5% of the published assistant-attributed sessions in this six-site historical sample came from the utility checker.",
  },
] as const;

export function AiVisibilityProof() {
  return (
    <section className="mb-16">
      <h2
        className="mb-4 text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
      >
        What this actually looks like, on real sites
      </h2>
      <p className="mb-6 text-base leading-relaxed text-muted-foreground">
        These are 6 of my own portfolio sites, labelled by sector rather than name since
        most are not client work. Figures are the historical GA4 assistant-source session counts published for
        the 28 May to 26 August 2026 extract. They are attributed visits, not citation
        counts or proof of a ranking mechanism. Source matching can miss referrers
        and does not authenticate each visit as human. Shares are calculated from these published totals and rounded to one decimal place. See the{" "}
        <Link className="underline underline-offset-4" href="/blog/ai-referral-traffic-study/">
          referral study and its historical-window limitations
        </Link>.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {PROOF_POINTS.map(({ sector, stat, unit, detail }) => (
          <div
            key={sector}
            className="rounded-xl border border-hairline bg-wash p-5"
          >
            <TrendingUp className="mb-3 h-5 w-5 text-brand" />
            <p
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {stat}
            </p>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
              {unit} &middot; {sector}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
