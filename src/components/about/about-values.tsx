"use client";

import { motion } from "motion/react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Brain, BarChart3, FileCheck } from "lucide-react";

const values = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Semantic SEO Methodology",
    description:
      "I build topical authority through comprehensive content architecture, not keyword stuffing. The Human-First approach creates sustainable rankings by covering every relevant query in your industry systematically.",
    color: "#5B8AEF",
    border: "border-[#5B8AEF]/20",
    bg: "bg-[#5B8AEF]/10",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Data-Led Decisions",
    description:
      "Every recommendation comes from Search Console data, competitor analysis, and search intent research. No guesswork. No vanity metrics. Clear monthly reporting shows exactly how SEO impacts your revenue.",
    color: "#4c7894",
    border: "border-[#4c7894]/20",
    bg: "bg-[#4c7894]/10",
  },
  {
    icon: <FileCheck className="h-5 w-5" />,
    title: "Transparent Process",
    description:
      "You receive full documentation of every strategy, topical map, and content brief. No black-box tactics. You own all deliverables and understand exactly what&apos;s being done and why.",
    color: "#5a922c",
    border: "border-[#5a922c]/20",
    bg: "bg-[#5a922c]/10",
  },
];

export function AboutValues() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5a922c]">
            Core Values
          </p>
          <h2
            className="text-3xl font-bold text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Why work with me
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-[1.25rem] border-[0.75px] border-border p-2"
            >
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <div className="relative flex h-full flex-col gap-4 rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                <div
                  className={`w-fit rounded-lg border ${v.border} ${v.bg} p-2.5`}
                  style={{ color: v.color }}
                >
                  {v.icon}
                </div>
                <div>
                  <h3
                    className="mb-2 text-lg font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {v.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
