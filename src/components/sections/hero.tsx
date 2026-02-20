"use client";

import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GradientButton } from "@/components/ui/gradient-button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <HeroGeometric
      badge="SEO & AI Consultant"
      title1="Building Topical Authority"
      title2="Through Entity-Based Networks"
    >
      <p className="text-base sm:text-lg md:text-xl text-white/40 mb-10 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
        15+ years helping UK businesses in medical aesthetics, professional
        services, and local markets achieve measurable organic growth.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <GradientButton asChild>
          <a href="#contact" className="gap-2">
            Book Free Consultation
            <ArrowRight className="h-4 w-4" />
          </a>
        </GradientButton>
        <GradientButton variant="variant" asChild>
          <a href="#portfolio">View Case Studies</a>
        </GradientButton>
      </div>

      <div className="mt-16 mx-auto grid max-w-lg grid-cols-3 gap-8">
        {[
          { value: "100+", label: "Clients", color: "#d79f1e" },
          { value: "15+", label: "Years", color: "#5B8AEF" },
          { value: "150%", label: "Avg Growth", color: "#5a922c" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`relative text-center ${i === 1 ? "border-x border-white/10" : ""}`}
          >
            {/* Subtle glow behind the number */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-12 rounded-full opacity-20 blur-2xl"
              style={{ background: stat.color }}
            />
            <div
              className="relative text-2xl font-bold md:text-3xl"
              style={{ fontFamily: "var(--font-heading)", color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-white/40">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </HeroGeometric>
  );
}
