import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PLATFORMS = [
  { name: "ChatGPT", prompt: "Test an agreed buyer question with search enabled. Record mentions, URL citations and recommendations separately." },
  { name: "Google AI Overviews", prompt: "Run an agreed query. Record whether an Overview appears and which URLs it cites." },
  { name: "Copilot", prompt: "Ask an agreed buyer question. Record the answer and linked sources." },
  { name: "Perplexity", prompt: "Use the same agreed question and mode. Record the answer and source URLs." },
  { name: "Claude", prompt: "Test an agreed buyer question with available search access. Label unavailable observations untested." },
];

export function CitationChecklist() {
  return (
    <div className="rounded-2xl border border-brand/20 bg-surface-1 dark:bg-white/[0.02] p-6 shadow-[var(--elev)] dark:shadow-[0_0_24px_rgba(91,138,239,0.10)]">
      <h3
        className="mb-6 text-xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        A starting point for manual checks
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div
            key={p.name}
            className={`flex items-start gap-3 rounded-xl border border-brand/10 bg-brand/[0.04] p-4 ${p.name === "Claude" ? "sm:col-span-2" : ""}`}
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-hairline-strong dark:border-white/[0.12] bg-surface-2 dark:bg-white/[0.04]">
              <span className="text-xs text-muted-foreground/70">?</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        Record dates, country, mode and exact questions. Repeat checks and retain misses.
        These checks are sampled observations. A free 20-minute diagnosis establishes fit;
        the full visibility audit is separate paid work.
      </p>

      <Link
        href="/contact/"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-[#7BA5F5] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.40)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(91,138,239,0.60)] hover:scale-[1.02] active:scale-[0.98]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Request a Free 20-Minute Diagnosis
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
