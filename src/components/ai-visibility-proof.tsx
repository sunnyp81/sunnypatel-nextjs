import { TrendingUp } from "lucide-react";

const PROOF_POINTS = [
  {
    sector: "Health & wellness",
    stat: "1,357",
    unit: "AI sessions / 90 days",
    detail:
      "Held steady through a Google core-update demotion that took organic clicks from around 40 a day to near zero. AI referral traffic did not move.",
  },
  {
    sector: "Education & local services",
    stat: "993",
    unit: "AI sessions / 90 days",
    detail:
      "Same pattern: Google clicks fell from 100 to 400 a day down to 0 to 2 a day after a core update. ChatGPT kept citing it regardless.",
  },
  {
    sector: "Templates & productivity",
    stat: "593",
    unit: "AI sessions / 90 days",
    detail:
      "Google clicks stayed at 0 to 2 a day for the full 6 months measured. Every one of these sessions came from a channel classic rank tracking would show as zero.",
  },
  {
    sector: "EV charging directory",
    stat: "570",
    unit: "AI sessions / 90 days",
    detail:
      "Here AI referral grew alongside real Google growth, clicks scaled from 0 to roughly 90 a day over the same period. The two channels compounded together.",
  },
  {
    sector: "Property investment tools",
    stat: "259",
    unit: "AI sessions / 90 days",
    detail:
      "Google ranks this one on page 2 to 3 for its core terms. ChatGPT cites it anyway, AI selection and SERP position are not the same signal.",
  },
  {
    sector: "Utility checker tool",
    stat: "176",
    unit: "AI sessions / 90 days",
    detail:
      "Google referral has been flat at 0 clicks a day for 6 straight months on this one. AI referral is the only channel bringing anyone in.",
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
        most are not client work. Figures are ChatGPT, Claude, Perplexity, Copilot and
        OpenAI referral sessions from a live GA4 pull, 90 days to 26 August 2026, cross
        checked against Search Console over the same window. Results vary by niche and
        starting point, this is what mine happen to show.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {PROOF_POINTS.map(({ sector, stat, unit, detail }) => (
          <div
            key={sector}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
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
