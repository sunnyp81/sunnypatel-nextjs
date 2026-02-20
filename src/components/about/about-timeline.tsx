"use client";

import { motion } from "motion/react";
import { Briefcase, Code2 } from "lucide-react";

const entries = [
  {
    icon: <Briefcase className="h-4 w-4" />,
    period: "Mar 2024 – Present",
    role: "SEO Growth Manager",
    company: "Figment Agency",
    description:
      "Managing 11+ client campaigns across diverse industries. Pioneered AI/LLM optimisation strategies and launched a YouTube SEO service line for scalable content growth.",
    color: "#5B8AEF",
    border: "border-[#5B8AEF]/20",
    bg: "bg-[#5B8AEF]/10",
  },
  {
    icon: <Code2 className="h-4 w-4" />,
    period: "2012 – Present",
    role: "SEO / AI Specialist",
    company: "Independent",
    description:
      "Built and ranked 40+ profitable content websites from scratch. Full-stack SEO covering keyword research, content strategy, link acquisition, and advanced AI prompt engineering for automation.",
    color: "#5a922c",
    border: "border-[#5a922c]/20",
    bg: "bg-[#5a922c]/10",
  },
];

export function AboutTimeline() {
  return (
    <section className="relative py-24 md:py-32">
      {/* Background accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#d79f1e]">
            Background
          </p>
          <h2
            className="text-3xl font-bold text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Experience
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-[#5B8AEF]/30 via-white/[0.08] to-transparent md:left-1/2 md:-translate-x-px" />

          <div className="space-y-8">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.role + entry.company}
                className={`relative flex gap-6 md:w-[calc(50%-2rem)] ${
                  i % 2 === 0 ? "md:ml-auto md:pl-10" : "md:mr-auto md:pr-10 md:flex-row-reverse md:text-right"
                }`}
                initial={{ opacity: 0, x: i % 2 === 0 ? 24 : -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Dot on the line */}
                <div
                  className={`absolute top-5 h-3 w-3 rounded-full border-2 bg-background md:top-5 ${
                    i % 2 === 0
                      ? "left-[-26px] md:left-[-6px]"
                      : "left-[13px] md:right-[-6px] md:left-auto"
                  }`}
                  style={{ borderColor: entry.color }}
                />

                {/* Card */}
                <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]">
                  <div
                    className={`mb-3 flex items-center gap-3 ${i % 2 !== 0 ? "md:justify-end" : ""}`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${entry.border} ${entry.bg}`}
                      style={{ color: entry.color }}
                    >
                      {entry.icon}
                    </div>
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        borderColor: `${entry.color}33`,
                        backgroundColor: `${entry.color}11`,
                        color: entry.color,
                      }}
                    >
                      {entry.period}
                    </span>
                  </div>
                  <h3
                    className="mb-0.5 text-lg font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {entry.role}
                  </h3>
                  <p className="mb-3 text-sm font-medium text-muted-foreground/70">
                    {entry.company}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
