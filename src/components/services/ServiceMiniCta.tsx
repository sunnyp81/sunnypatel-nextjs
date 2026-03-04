import Link from "next/link";
import { ArrowRight, CalendarDays, Shield } from "lucide-react";

export function ServiceMiniCta({
  heading = "Ready to Improve Your Rankings?",
  text = "Book a free 30-minute consultation — honest advice on where you stand and what to do next.",
}: {
  heading?: string;
  text?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#5B8AEF]/15 bg-[#0c0c14]">
      {/* Animated glow ring */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-30"
        style={{
          background:
            "conic-gradient(from var(--cta-angle) at 50% 50%, transparent 0deg, #5B8AEF 60deg, transparent 120deg, #7B5AEF 240deg, transparent 360deg)",
          animation: "cta-border-spin 6s linear infinite",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          borderRadius: "1rem",
        }}
      />
      {/* Corner accent */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-24 w-24 rounded-tl-2xl opacity-[0.10]"
        style={{ background: "radial-gradient(circle at 0% 0%, #5B8AEF, transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center gap-5 px-8 py-10 text-center">
        <h3
          className="text-xl font-bold text-foreground md:text-2xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
        >
          {heading}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">{text}</p>

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(91,138,239,0.45)] active:scale-[0.98]"
          style={{
            fontFamily: "var(--font-heading)",
            background: "linear-gradient(135deg, #5B8AEF 0%, #7B5AEF 100%)",
            boxShadow: "0 0 20px rgba(91,138,239,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          Book Free Consultation
          <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="flex flex-wrap justify-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <CalendarDays className="h-3 w-3 text-[#5B8AEF]/50" />
            Free 30 minutes
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <Shield className="h-3 w-3 text-[#5B8AEF]/50" />
            No obligation
          </span>
        </div>
      </div>
    </div>
  );
}
