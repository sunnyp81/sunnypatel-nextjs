"use client";

import { motion } from "motion/react";

const STAGES = [
  {
    name: "Findable",
    question: "Can search systems reach the right pages?",
    work: "Crawling, rendering, indexation, performance",
  },
  {
    name: "Understood",
    question: "Is the site clear about what it knows and offers?",
    work: "Architecture, entities, structured data, internal links",
  },
  {
    name: "Trusted",
    question: "Is there enough evidence to rank or cite the brand?",
    work: "Content coverage, authority, corroboration, digital PR",
  },
  {
    name: "Chosen",
    question: "Does visibility turn into the right commercial action?",
    work: "Intent, UX, conversion paths, measurement",
  },
] as const;

export function SearchModel() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.05] bg-[#050507] py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand">
            The Model
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Search is a connected system
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Optimising one layer in isolation just moves the constraint. Working
            across all four, in order, gives the commercial outcome a foundation.
          </p>
        </motion.div>

        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <motion.li
              key={stage.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col gap-3 border-t-2 border-brand/40 pt-5"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="text-xl font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stage.name}
              </h3>
              <p className="text-sm text-muted-foreground">{stage.question}</p>
              <span className="mt-auto text-xs text-white/40">{stage.work}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
