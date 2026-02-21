"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { GradientButton } from "@/components/ui/gradient-button";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "15+", label: "Years SEO" },
  { value: "1,000+", label: "Hours Automated" },
  { value: "50+", label: "LLM Prompts" },
  { value: "150%", label: "Avg Growth" },
];

export function AboutHero() {
  return (
    <div className="relative overflow-hidden pb-0 pt-32">
      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[140px]"
        style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Portrait */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-36 w-36 overflow-hidden rounded-full ring-2 ring-[#5B8AEF]/30 ring-offset-4 ring-offset-background">
              <Image
                src="/images/sunny-patel-seo-consultant-reading-berkshire.png"
                alt="Sunny Patel, SEO Consultant based in Reading, Berkshire"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5B8AEF]/20 bg-[#5B8AEF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
            SEO & AI Consultant
          </span>

          <h1
            className="mb-6 text-4xl font-bold text-foreground md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.04em", lineHeight: 1.1 }}
          >
            Sunny Patel
            <br />
            <span className="bg-gradient-to-r from-[#5B8AEF] via-[#4c7894] to-[#5a922c] bg-clip-text text-transparent">
              SEO Consultant & AI Strategist
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            I help businesses grow organic traffic through semantic SEO, topical
            authority, and AI-powered search strategies. Based in Reading,
            Berkshire with 15+ years of hands-on experience.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GradientButton asChild>
              <a href="/contact" className="gap-2">
                Book Free Consultation
                <ArrowRight className="h-4 w-4" />
              </a>
            </GradientButton>
            <GradientButton variant="variant" asChild>
              <a href="/portfolio">View My Work</a>
            </GradientButton>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center bg-background px-6 py-6"
            >
              <span
                className="text-2xl font-bold text-foreground md:text-3xl"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div className="mt-16 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
}
