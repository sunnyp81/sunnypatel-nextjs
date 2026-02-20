"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      {/* Aurora blobs */}
      <div
        className="animate-aurora-1 absolute -left-32 -top-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #dd7bbb, transparent 70%)",
        }}
      />
      <div
        className="animate-aurora-2 absolute -bottom-20 -right-40 h-[400px] w-[400px] rounded-full opacity-10 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #4c7894, transparent 70%)",
        }}
      />
      <div
        className="animate-aurora-3 absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full opacity-10 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, #5a922c, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 65%)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,7,0.8) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dd7bbb]/20 bg-[#dd7bbb]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#dd7bbb]">
          <Sparkles className="h-3.5 w-3.5" />
          SEO & AI Consultant
        </div>

        {/* Headline */}
        <h1
          className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-7xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          Building{" "}
          <span className="bg-gradient-to-r from-[#dd7bbb] via-[#d79f1e] to-[#4c7894] bg-clip-text text-transparent">
            topical authority
          </span>{" "}
          through entity-based content networks
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          15+ years helping businesses in medical aesthetics, professional
          services, and local markets achieve measurable organic growth. Based in
          Reading, Berkshire.
        </p>

        {/* CTAs */}
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Primary — wrapped in GlowingEffect container */}
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
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-foreground px-8 py-4 text-sm font-semibold text-background transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Book Free Consultation
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
          <a
            href="#portfolio"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            View Case Studies
          </a>
        </div>

        {/* Stats */}
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-8">
          {[
            { value: "100+", label: "Clients" },
            { value: "15+", label: "Years" },
            { value: "150%", label: "Avg Growth" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i === 1 ? "border-x border-white/10" : ""}`}
            >
              <div
                className="text-2xl font-bold text-foreground md:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
