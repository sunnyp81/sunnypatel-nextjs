import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PLATFORMS = [
  {
    name: "ChatGPT",
    prompt: "Search for [your brand/service] — do you appear?",
  },
  {
    name: "Google AI Overviews",
    prompt: "Search your main keywords — are you cited in the AI summary?",
  },
  {
    name: "Bing Copilot",
    prompt: "Ask Copilot about your industry — does it reference your site?",
  },
  {
    name: "Perplexity",
    prompt: "Research your topic area — are you listed as a source?",
  },
];

export function CitationChecklist() {
  return (
    <div className="my-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <h3
        className="mb-6 text-xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        Are You Being Cited Right Now?
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div
            key={p.name}
            className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/[0.12] bg-white/[0.04]">
              <span className="text-xs text-muted-foreground/40">?</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.prompt}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        Most businesses answer no to 3 of 4. Book a free audit to find out
        where you stand.
      </p>

      <Link
        href="/contact"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5B8AEF] px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Book Free AI Citation Audit
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
