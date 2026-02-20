"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion } from "motion/react";

export function Portfolio() {
  return (
    <section id="portfolio" className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#d79f1e]">
            Portfolio
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Real results for real businesses
          </h2>
        </motion.div>

        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
            <GlowingEffect
              spread={60}
              glow={true}
              disabled={false}
              proximity={80}
              inactiveZone={0.01}
              borderWidth={3}
            />
            <div className="group relative overflow-hidden rounded-xl border-[0.75px] bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
              {/* Image */}
              <div className="relative h-64 overflow-hidden md:h-80">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=400&fit=crop&q=80"
                  alt="Aatma Aesthetics case study"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative -mt-16 z-10 p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { label: "Web Design", color: "text-[#5B8AEF]", border: "border-[#5B8AEF]/20", bg: "bg-[#5B8AEF]/10" },
                    { label: "SEO", color: "text-[#4c7894]", border: "border-[#4c7894]/20", bg: "bg-[#4c7894]/10" },
                    { label: "Development", color: "text-[#5a922c]", border: "border-[#5a922c]/20", bg: "bg-[#5a922c]/10" },
                  ].map((tag) => (
                    <span
                      key={tag.label}
                      className={`rounded-full border ${tag.border} ${tag.bg} px-3 py-1 text-xs font-medium ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <h3
                  className="mb-3 text-2xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Aatma Aesthetics
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  Complete website design, development, and SEO strategy for a
                  medical aesthetics clinic. Delivered page-one rankings for
                  competitive local terms within 6 months.
                </p>

                {/* Result metrics */}
                <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  {[
                    { value: "+340%", label: "Organic traffic" },
                    { value: "#1", label: "Local rankings" },
                    { value: "6mo", label: "Time to results" },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div
                        className="text-xl font-bold text-[#d79f1e]"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {metric.value}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="/portfolio/aatma-aesthetics-website-design-development-seo"
                  className="inline-flex items-center gap-2 font-medium text-[#d79f1e] transition-all duration-200 hover:gap-3"
                >
                  View full case study
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
