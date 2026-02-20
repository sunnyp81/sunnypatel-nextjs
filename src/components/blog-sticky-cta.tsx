"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X, Sparkles } from "lucide-react";
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
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-3rem)] max-w-md -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Outer glow wrapper */}
      <div className="relative rounded-2xl border-[0.75px] border-border p-[2px]">
        <GlowingEffect
          spread={50}
          glow={true}
          disabled={false}
          proximity={100}
          inactiveZone={0.01}
          borderWidth={2}
          blur={6}
        />

        {/* Inner card */}
        <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[#08080d]/98 shadow-2xl shadow-black/50 backdrop-blur-2xl">
          {/* Ambient background effects */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, #5B8AEF, transparent 60%), radial-gradient(ellipse at 80% 50%, #7B5AEF, transparent 60%)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-30"
            style={{
              background:
                "linear-gradient(90deg, transparent, #5B8AEF, #7B5AEF, transparent)",
            }}
          />

          <Link
            href="/contact"
            className="group relative flex items-center justify-between gap-3 px-5 py-4 transition-transform duration-200 active:scale-[0.99] sm:gap-5"
          >
            {/* Left: icon + text */}
            <div className="relative flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#5B8AEF]/20 bg-[#5B8AEF]/10 text-[#5B8AEF] transition-colors duration-300 group-hover:border-[#5B8AEF]/40 group-hover:bg-[#5B8AEF]/20">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-medium text-foreground sm:text-[15px]">
                Free 30-min consultation
              </p>
            </div>

            {/* Right: button */}
            <span
              className="relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_24px_rgba(91,138,239,0.35)] transition-all duration-300 group-hover:shadow-[0_0_36px_rgba(91,138,239,0.55)] sm:px-5"
              style={{
                fontFamily: "var(--font-heading)",
                background: "linear-gradient(135deg, #5B8AEF 0%, #7B5AEF 100%)",
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(135deg, #6B9AFF 0%, #8B6AFF 100%)",
                }}
              />
              <span className="relative">Book Now</span>
              <ArrowRight className="relative h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 z-10 rounded-full p-1 text-muted-foreground/30 transition-colors hover:text-muted-foreground/70"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
