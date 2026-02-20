"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ProjectCover } from "@/components/portfolio/project-cover";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "motion/react";

export type FeaturedProject = {
  slug: string;
  title: string;
  description: string;
  tags: readonly string[];
  industry: string;
  metrics: ReadonlyArray<{ value: string; label: string }>;
};

export function Portfolio({ featuredItems }: { featuredItems: FeaturedProject[] }) {
  return (
    <section id="portfolio" className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
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

        {/* Cards grid */}
        <div
          className={`grid gap-4 ${
            featuredItems.length === 1
              ? "mx-auto max-w-xl"
              : featuredItems.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {featuredItems.map((project, i) => (
            <motion.div
              key={project.slug}
              className="h-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <Link href={`/portfolio/${project.slug}`} className="group block h-full">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 transition-transform duration-200 group-hover:scale-[1.01]">
                  <GlowingEffect
                    spread={60}
                    glow={true}
                    disabled={false}
                    proximity={80}
                    inactiveZone={0.01}
                    borderWidth={3}
                  />
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border-[0.75px] bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <ProjectCover
                      title={project.title}
                      tags={project.tags}
                      industry={project.industry}
                    />
                    <div className="flex flex-1 flex-col p-5">
                      {/* Tags row */}
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5 text-muted-foreground/40 transition-all duration-200 group-hover:border-[#d79f1e]/20 group-hover:bg-[#d79f1e]/10 group-hover:text-[#d79f1e]">
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      {/* Description */}
                      {project.description && (
                        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {project.description}
                        </p>
                      )}

                      {/* First 2 metrics */}
                      {project.metrics && project.metrics.length > 0 && (
                        <div className="mt-auto grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                          {project.metrics.slice(0, 2).map((metric) => (
                            <div key={metric.label}>
                              <div
                                className="text-lg font-bold text-[#d79f1e]"
                                style={{ fontFamily: "var(--font-heading)" }}
                              >
                                {metric.value}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {metric.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <GradientButton variant="variant" asChild>
            <Link href="/portfolio" className="inline-flex items-center gap-2">
              View all case studies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}
