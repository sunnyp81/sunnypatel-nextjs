"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function BlogStickyCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollY / (docHeight - winHeight);

      setVisible(scrollPercent > 0.3 && scrollPercent < 0.95);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Outer wrapper for GlowingEffect border */}
      <div className="relative rounded-2xl border-[0.75px] border-border p-px">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={80}
          inactiveZone={0.01}
          borderWidth={2}
          blur={4}
        />

        {/* Inner card */}
        <Link
          href="/contact"
          className="group relative flex items-center gap-4 rounded-[calc(1rem-1px)] bg-[#0a0a0f]/95 px-5 py-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          {/* Subtle blue underglow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.06]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, #5B8AEF, transparent 70%)",
            }}
          />

          {/* Branding */}
          <span className="relative text-xs font-semibold tracking-wide text-[#5B8AEF]" style={{ fontFamily: "var(--font-heading)" }}>
            SunnyPatel
          </span>

          {/* Divider */}
          <div className="relative h-4 w-px bg-white/[0.1]" />

          {/* Text */}
          <p className="relative text-sm font-medium text-foreground">
            Free 30-min consultation
          </p>

          {/* Button */}
          <span
            className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.3)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(91,138,239,0.5)]"
            style={{
              fontFamily: "var(--font-heading)",
              background: "linear-gradient(135deg, #5B8AEF 0%, #7B5AEF 100%)",
            }}
          >
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "linear-gradient(135deg, #6B9AFF 0%, #8B6AFF 100%)" }} />
            <span className="relative">Book Now</span>
            <ArrowRight className="relative h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>

          {/* Dismiss */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDismissed(true);
            }}
            className="relative rounded-md p-1 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
