"use client";

import { ArrowRight } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

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
            "radial-gradient(ellipse at 30% 50%, #dd7bbb, transparent 50%)",
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dd7bbb]/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dd7bbb]/15 to-transparent" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2
          className="mb-6 text-3xl font-bold text-foreground md:text-5xl"
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.03em",
            textShadow: "0 0 60px rgba(221,123,187,0.15)",
          }}
        >
          Ready to grow your organic traffic?
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          Book a free 30-minute consultation. No obligation. Just honest advice
          on where your SEO stands and what to do next.
        </p>

        {/* CTA button with glowing effect */}
        <div className="inline-block">
          <div className="relative rounded-2xl p-[2px]">
            <GlowingEffect
              spread={60}
              glow={true}
              disabled={false}
              proximity={100}
              inactiveZone={0.01}
              borderWidth={2}
              movementDuration={1}
            />
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-foreground px-10 py-5 font-semibold text-background transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Book Free Consultation
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
