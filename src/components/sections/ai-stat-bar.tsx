import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { aiSummary } from "@/components/live/live-stats";

export function AiStatBar() {
  return (
    <section className="relative py-6">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/ai-visibility-results/"
          className="group flex flex-wrap items-center justify-center gap-2 text-center text-sm text-muted-foreground"
        >
          <span>
            <strong className="font-semibold text-foreground">{aiSummary.ai} AI-assistant sessions</strong>{" "}
            across {aiSummary.sites} of my portfolio sites in the 28 days to {aiSummary.end}. Attributed visits, not citation counts.
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
