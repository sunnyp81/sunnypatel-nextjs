"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function BlogStickyCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollY / (docHeight - winHeight);

      // Show after scrolling 30% of the page, hide near footer (95%)
      setVisible(scrollPercent > 0.3 && scrollPercent < 0.95);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/95 px-5 py-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* Subtle blue glow behind */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.06]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, #5B8AEF, transparent 70%)",
          }}
        />

        <p className="relative text-sm text-muted-foreground">
          <span className="hidden sm:inline">Need help with your SEO? </span>
          <span className="font-medium text-foreground">Free 30-min consultation</span>
        </p>

        <Link
          href="/contact"
          className="relative inline-flex items-center gap-1.5 rounded-lg bg-[#5B8AEF] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#4a79de] hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Book Now
          <ArrowRight className="h-3 w-3" />
        </Link>

        <button
          onClick={() => setDismissed(true)}
          className="relative rounded-md p-1 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
