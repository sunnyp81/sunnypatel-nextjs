"use client";

import { ArrowRight } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

export function Cta() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, #5B8AEF, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, #4c7894, transparent 50%)",
        }}
      />

      {/* Noise overlay */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain-cta">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-cta)" />
      </svg>

      {/* Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5B8AEF]/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5B8AEF]/15 to-transparent" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2
          className="mb-6 text-3xl font-bold text-foreground md:text-5xl"
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.03em",
            textShadow: "0 0 60px rgba(91,138,239,0.15)",
          }}
        >
          Ready to grow your organic traffic?
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          Book a free 30-minute consultation. No obligation. Just honest advice
          on where your SEO stands and what to do next.
        </p>

        <GradientButton asChild>
          <a href="#contact" className="gap-2">
            Book Free Consultation
            <ArrowRight className="h-5 w-5" />
          </a>
        </GradientButton>
      </div>
    </section>
  );
}
