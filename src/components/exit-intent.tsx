"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, Sparkles } from "lucide-react";

export function ExitIntent() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Only trigger when cursor moves toward top of viewport (leaving page)
      if (e.clientY <= 5 && !dismissed) {
        setShow(true);
      }
    },
    [dismissed]
  );

  useEffect(() => {
    // Don't show on mobile (no mouse leave event) or if already dismissed this session
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("exit_dismissed")) {
      setDismissed(true);
      return;
    }

    // Delay activation — don't trigger on immediate bounces
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 8000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  function dismiss() {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("exit_dismissed", "1");
  }

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a10] shadow-2xl shadow-[#5B8AEF]/10">
          {/* Top glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full opacity-20 blur-[60px]"
            style={{ background: "linear-gradient(135deg, #5B8AEF, #7B5AEF)" }}
          />

          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative px-8 pb-8 pt-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#5B8AEF]/20 bg-[#5B8AEF]/10">
              <Sparkles className="h-5 w-5 text-[#5B8AEF]" />
            </div>

            <h2
              className="mb-2 text-xl font-bold text-foreground md:text-2xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Before you go...
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Get a free 30-minute SEO audit of your website. I&apos;ll show you
              exactly where you&apos;re losing rankings and what to fix first.
            </p>

            {/* Benefits */}
            <div className="mb-6 space-y-2 text-left">
              {[
                "See your top quick-win opportunities",
                "Identify technical issues hurting your rankings",
                "Get a prioritised 90-day action plan",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#5a922c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {point}
                </div>
              ))}
            </div>

            <a
              href="/contact/"
              onClick={() => {
                if (typeof window !== "undefined" && typeof window.gtag === "function") {
                  window.gtag("event", "cta_click", {
                    event_category: "exit_intent",
                    event_label: "exit_intent_cta",
                  });
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(91,138,239,0.45)] active:scale-[0.98]"
              style={{
                fontFamily: "var(--font-heading)",
                background: "linear-gradient(135deg, #5B8AEF 0%, #7B5AEF 100%)",
                boxShadow: "0 0 20px rgba(91,138,239,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              Book Free SEO Audit
              <ArrowRight className="h-4 w-4" />
            </a>

            <p className="mt-3 text-xs text-muted-foreground/30">
              No obligation · Usually responds same day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
