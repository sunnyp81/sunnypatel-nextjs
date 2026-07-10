import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import proof from "@/data/proof.json";
import iterations from "@/data/proof-iterations.json";

export const metadata = buildMetadata({
  title: "Proof: My Live SEO Numbers | Sunny Patel",
  description:
    "Most consultants show you logos. This page shows my own live Google Search Console data, current rankings, and the experiment log for this site, updated from the API.",
  path: "/proof",
});

function WeeklyClicksChart() {
  const weeks = proof.weeklyClicks;
  const max = Math.max(...weeks.map((w) => w.clicks));
  const chartH = 140;
  const barW = 28;
  const gap = 14;
  const width = weeks.length * (barW + gap) - gap;

  return (
    <svg
      viewBox={`0 0 ${width} ${chartH + 24}`}
      className="w-full max-w-lg"
      role="img"
      aria-label={`Weekly clicks from Google, last ${weeks.length} weeks: ${weeks.map((w) => w.clicks).join(", ")}`}
    >
      {weeks.map((w, i) => {
        const h = Math.max(4, Math.round((w.clicks / max) * chartH));
        const x = i * (barW + gap);
        const y = chartH - h;
        const isLast = i === weeks.length - 1;
        return (
          <g key={w.weekStart} className="transition-opacity hover:opacity-80">
            <title>{`Week of ${new Date(w.weekStart).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${w.clicks} clicks`}</title>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={4}
              fill="#5B8AEF"
              opacity={isLast ? 1 : 0.55}
            />
            {(isLast || i === 0) && (
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="12"
                fontWeight="600"
              >
                {w.clicks}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ProofPage() {
  const updated = new Date(proof.updatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">
        Radical transparency
      </p>
      <h1
        className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        Most consultants show you logos. Here are my live numbers.
      </h1>
      <p className="mb-12 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Everything below comes straight from my own Google Search Console via the API, last updated {updated}. Small site, real data, nothing cherry-picked: you can watch it grow (or not) over time. If I can do this for my own site, imagine what I would do with yours.
      </p>

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          { value: "#2", label: 'Google rank, "seo consultant reading"' },
          { value: proof.summary28d.impressions.toLocaleString("en-GB"), label: "Impressions, last 28 days" },
          { value: String(proof.summary28d.clicks), label: "Clicks, last 28 days" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border p-5">
            <div
              className="text-2xl font-bold text-brand"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {s.value}
            </div>
            <div className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
        Weekly clicks from Google
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Honest scale: this is a consultant portfolio site in a 200-searches-a-month niche, not an e-commerce store. The direction is what matters.
      </p>
      <div className="mb-12 rounded-2xl border border-border p-6">
        <WeeklyClicksChart />
      </div>

      <h2 className="mb-4 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
        Where this site ranks right now
      </h2>
      <div className="mb-12 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Query</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg position</th>
            </tr>
          </thead>
          <tbody>
            {proof.rankings.map((r) => (
              <tr key={r.query} className="border-b border-border/50 last:border-0">
                <td className="px-5 py-3 text-foreground">{r.query}</td>
                <td className="px-5 py-3 text-right font-semibold text-brand">{r.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
        The experiment log
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        This site is improved in measured iterations: hypothesis, change, verdict from Search Console data 1-2 weeks later. An autonomous agent runs the loop,{" "}
        <Link href="/blog/autonomous-seo-agent/" className="text-brand hover:underline">
          here is how it works
        </Link>
        . This is the exact process clients get.
      </p>
      <div className="mb-12 space-y-4">
        {iterations.map((it) => (
          <div key={it.n} className="rounded-2xl border border-border p-5">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                Iteration {it.n}
              </span>
              <span className="text-xs text-muted-foreground">{it.date}</span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  it.verdict === "pending"
                    ? "border-border text-muted-foreground"
                    : "border-success/30 bg-success/10 text-success"
                }`}
              >
                {it.verdict}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{it.change}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Prediction: {it.prediction}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/[0.08] to-brand-deep/[0.04] p-6 md:p-8">
        <h2 className="mb-3 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Want this level of honesty on your SEO?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Every client gets the same treatment: real Search Console data, monthly, tied to enquiries rather than vanity metrics. Start with the fixed-fee £495 audit or a free 30-minute call.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/services/paid-seo-audit/"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
            style={{
              fontFamily: "var(--font-heading)",
              background: "linear-gradient(135deg, #5B8AEF 0%, #3d6fe8 100%)",
              boxShadow: "0 0 20px rgba(91,138,239,0.25)",
            }}
          >
            Get the £495 Audit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact/"
            className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Book a free call
          </Link>
        </div>
      </div>
    </main>
  );
}
