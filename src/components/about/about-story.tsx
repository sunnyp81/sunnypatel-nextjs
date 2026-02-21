"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function AboutStory() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-center">
          {/* Left — text + framework card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
              My Approach
            </p>
            <h2
              className="mb-6 text-3xl font-bold text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Driven by data.
              <br />
              Powered by innovation.
            </h2>
            <div className="mb-8 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                My hands-on experience across 40+ sites informs every consulting
                engagement. I&apos;ve tested strategies on real businesses facing
                competitive markets — not theoretical frameworks.
              </p>
              <p>
                My approach combines a semantic SEO foundation with AI-enhanced
                analysis tools, creating a methodology that balances algorithmic
                understanding with authentic, trust-building content.
              </p>
            </div>

            {/* 60/40 framework card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="border-b border-white/[0.06] px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  The Human-First Framework
                </p>
              </div>
              <div className="p-6">
                <div className="mb-6 flex h-3 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-[#5B8AEF] to-[#4c7894] transition-all duration-1000"
                    style={{ width: "60%" }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-[#5a922c] to-[#d79f1e]"
                    style={{ width: "40%" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#5B8AEF]/20 bg-[#5B8AEF]/5 p-4">
                    <div
                      className="mb-1 text-2xl font-bold text-[#5B8AEF]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      60%
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      Semantic Foundation
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Entity relationships, topical architecture, algorithmic signals
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#5a922c]/20 bg-[#5a922c]/5 p-4">
                    <div
                      className="mb-1 text-2xl font-bold text-[#5a922c]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      40%
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      Human Authenticity
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Trust signals, conversion copy, genuine expertise
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — whiteboard photo */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-white/[0.08]"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Image
              src="/images/sunny-patel-seo-consultant-teaching.png"
              alt="Sunny Patel explaining SEO strategy on a whiteboard"
              width={600}
              height={500}
              className="w-full object-cover"
              priority
            />
            {/* Dark overlay to match site tone */}
            <div className="pointer-events-none absolute inset-0 bg-black/30" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
