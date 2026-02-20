"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "What does an SEO consultant do?",
    a: "An SEO consultant analyses your website, identifies opportunities for improvement, and develops strategies to increase your organic search visibility. This includes technical audits, keyword research, content strategy, and ongoing optimisation to help you rank higher and attract more qualified traffic.",
  },
  {
    q: "How long does it take to see SEO results?",
    a: "SEO is a long-term investment. Most clients start seeing measurable improvements within 3–6 months, with significant results typically appearing between 6–12 months. The timeline depends on your current site health, competition level, and the scope of work required.",
  },
  {
    q: "What is semantic SEO?",
    a: "Semantic SEO focuses on understanding and optimising for the meaning behind search queries, not just keywords. It involves building topical authority through entity-based content networks, helping search engines understand your expertise and relevance within your niche.",
  },
  {
    q: "Do you work with businesses outside Berkshire?",
    a: "Yes — while I'm based in Reading and offer face-to-face sessions across the Thames Valley, I work with clients across the UK and internationally. All strategy sessions and reporting are available remotely.",
  },
  {
    q: "Can you help recover from a Google ranking drop?",
    a: "Yes. I specialise in diagnosing and recovering from ranking drops caused by algorithm updates, technical issues, competitor movements, or content quality problems. I provide a detailed action plan to recover and strengthen your positions.",
  },
];

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
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="group w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-left transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-sm font-medium text-foreground md:text-base"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.1] transition-all duration-300 ${
                      open === i
                        ? "rotate-45 border-[#5B8AEF]/30 bg-[#5B8AEF]/10 text-[#5B8AEF]"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
