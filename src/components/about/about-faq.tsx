"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { faqs } from "@/lib/faq-data";

export function AboutFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#4c7894]">
            FAQ
          </p>
          <h2
            className="text-3xl font-bold text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Your questions, answered
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span
                    className="text-sm font-medium text-foreground md:text-base"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.1] transition-all duration-300 ${
                      open === i
                        ? "rotate-45 border-[#5B8AEF]/30 bg-[#5B8AEF]/10 text-[#5B8AEF]"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
