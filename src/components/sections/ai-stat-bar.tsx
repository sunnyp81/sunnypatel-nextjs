import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function AiStatBar() {
  return (
    <section className="relative py-6">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/ai-visibility-results/"
          className="group flex flex-wrap items-center justify-center gap-2 rounded-full border border-brand/15 bg-brand/[0.04] px-5 py-2.5 text-center text-sm text-muted-foreground transition-colors hover:border-brand/30 hover:bg-brand/[0.08]"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand" />
          <span>
            <strong className="font-semibold text-foreground">3,948 AI-assistant sessions</strong>{" "}
            across 6 of my own portfolio sites in 90 days, real GA4 data, sector labelled
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
