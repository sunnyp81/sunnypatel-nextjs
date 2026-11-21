import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import proof from "@/data/proof.json";
import { ProofWeeklyPeak } from "@/components/sections/proof-weekly-peak";
import iterations from "@/data/proof-iterations.json";
import { AGENCY_EXAMPLES, AGENCY_RESULTS_PULLED, AGENCY_TOTALS } from "@/data/agency-results";

export const metadata = buildMetadata({
  title: "Proof: My Live SEO Numbers | Sunny Patel",
  description:
    "Most consultants show you logos. This page shows my own live Google Search Console data, current rankings, and the experiment log for this site, updated from the API.",
  path: "/proof",
});


const seoConsultantReading = proof.rankings.find((r) => r.query === "seo consultant reading");

const LIVE_DATA = [
  {
    href: "/blog/ai-referral-traffic-study/#live-tracker",
    title: "Live AI referral tracker",
    text: "Weekly sessions attributed to AI assistants across my owned sites, with the denominator and a dated CSV snapshot.",
  },
  {
    href: "/blog/google-update-portfolio-impact/#update-tracker",
    title: "Google update tracker",
    text: "How many of my sites rose or fell after each confirmed core and spam update, with the method and data files.",
  },
  {
    href: "/research/experiments/",
    title: "SEO experiment register",
    text: "Every dated test on my own sites with its status, including the ones that failed or told me nothing.",
  },
];

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
          {
            value: seoConsultantReading ? seoConsultantReading.position.toFixed(1) : String(proof.summary28d.avgPosition),
            label: seoConsultantReading ? 'Average Google position, "seo consultant reading"' : "Average Google position, last 28 days",
          },
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
      <div className="mb-12 overflow-x-clip py-8">
        <ProofWeeklyPeak weeks={proof.weeklyClicks} />
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
                className={it.verdict === "pending" ? "tag-plain" : "lit-label lit-label--gold lit-label--sm"}
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

      <section id="agency-results" aria-labelledby="agency-results-title" className="mb-12 scroll-mt-28">
        <h2 id="agency-results-title" className="mb-4 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Client work I led at an agency, 2024 to 2026
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          I led SEO for 16 client sites at a UK agency with a team from May 2024 to October 2026. The clients stay unnamed. Numbers come from each site&apos;s Google Analytics 4 and Search Console data pulled on{" "}
          {new Date(`${AGENCY_RESULTS_PULLED}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}.
        </p>
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          {AGENCY_TOTALS.map((t) => (
            <div key={t.label} className="rounded-2xl border border-border p-5">
              <div className="text-2xl font-bold text-brand" style={{ fontFamily: "var(--font-heading)" }}>
                {t.before.toLocaleString("en-GB")} <span className="text-muted-foreground">to</span> {t.after.toLocaleString("en-GB")}
              </div>
              <div className="mt-1 text-xs font-semibold leading-snug text-foreground">{t.label}, {t.sites}</div>
              <div className="mt-1 text-xs leading-snug text-muted-foreground">{t.window}</div>
            </div>
          ))}
        </div>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Each total adds up only the sites where that measure grew. Each card shows the number of sites. Several sites fell on clicks or organic visits over the same period. These totals do not claim that every client grew. AI assistant visits started near zero in 2024. The cards show counts instead of a percentage. A few sites have shorter windows because tracking started later or the contract ended.
        </p>
        <div className="space-y-4">
          {AGENCY_EXAMPLES.map((ex) => (
            <div key={ex.sector} className="rounded-2xl border border-border p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">{ex.sector}</p>
              <ul className="space-y-1 text-sm leading-relaxed text-foreground">
                {ex.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <h2 className="mb-4 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
        Live portfolio data you can cite
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Each one has its own link, a method, a licence and files to download. All of it comes from sites I own.
      </p>
      <div className="mb-12 space-y-4">
        {LIVE_DATA.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-2xl border border-border p-5 transition-colors hover:border-brand/40">
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/[0.08] to-brand-deep/[0.04] p-6 md:p-8">
        <h2 className="mb-3 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Want this level of honesty on your SEO?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Every client gets the same treatment: real Search Console data, tied to enquiries rather than vanity metrics. Start with the fixed-fee £495 audit or a free 20-minute SEO diagnosis.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/services/technical-seo-audit/"
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
            Get in touch
          </Link>
        </div>
      </div>
    </main>
  );
}
