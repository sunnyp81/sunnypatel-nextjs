"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { HowIWorkSteps } from "./HowIWorkSteps";

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
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-ink">
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
                My documented <Link href="/portfolio/niche-affiliate-seo-portfolio-45-sites/" className="text-brand-ink underline underline-offset-4">45-site portfolio case study</Link> informs my consulting
                work. It describes that portfolio cohort, not a current count of every site I manage.
                I use the experience alongside the evidence and priorities for each client.
              </p>
              <p>
                I combine semantic SEO with AI-assisted analysis to plan
                content around entities, user questions and supporting evidence.
                Human review checks the facts, business context and usefulness of the resulting recommendations.
              </p>
              <p>
                My services cover B2B SEO consulting, AI search optimisation, strategic portfolio management and web development.
              </p>
            </div>

            <div className="mb-8 rounded-2xl border border-hairline dark:border-white/[0.06] bg-surface-1 dark:bg-white/[0.02] p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                See the real data
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/portfolio/"
                  className="rounded-lg border border-hairline-strong dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:border-brand/30 hover:text-brand-ink"
                >
                  Case studies
                </Link>
                <Link
                  href="/portfolio/ai-search-optimisation-copilot-citations/"
                  className="rounded-lg border border-hairline-strong dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:border-brand/30 hover:text-brand-ink"
                >
                  120K Bing Copilot citations study
                </Link>
                <Link
                  href="/blog/ai-referral-traffic-study/"
                  className="rounded-lg border border-hairline-strong dark:border-white/[0.08] bg-surface-2 dark:bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:border-brand/30 hover:text-brand-ink"
                >
                  AI referral traffic study
                </Link>
              </div>
            </div>

            <HowIWorkSteps />

            {/* 60/40 framework card */}
            <div className="overflow-hidden rounded-2xl border border-hairline dark:border-white/[0.06] bg-surface-1 dark:bg-white/[0.02]">
              <div className="border-b border-hairline dark:border-white/[0.06] px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  The Human-First Framework
                </p>
              </div>
              <div className="p-6">
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  My 60/40 framework illustrates the balance between semantic planning and human expertise. These percentages are a working philosophy, not measured ranking weights.
                </p>
                <div className="mb-6 flex h-3 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-brand to-teal transition-all duration-1000"
                    style={{ width: "60%" }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-success to-gold"
                    style={{ width: "40%" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                    <div
                      className="mb-1 text-2xl font-bold text-brand-ink"
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
                  <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                    <div
                      className="mb-1 text-2xl font-bold text-success-ink"
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
            className="relative overflow-hidden rounded-2xl border border-hairline-strong dark:border-white/[0.08]"
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
