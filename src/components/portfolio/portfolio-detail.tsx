"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Quote } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ChartHero } from "@/components/portfolio/chart-hero";

type Metric = { readonly value: string; readonly label: string };

type Project = {
  title: string;
  description?: string | null;
  tags?: readonly string[] | null;
  client?: string | null;
  industry?: string | null;
  services?: string | null;
  year?: string | null;
  problem?: string | null;
  solution?: string | null;
  result?: string | null;
  metrics?: readonly Metric[] | null;
  testimonialText?: string | null;
  testimonialAuthor?: string | null;
  testimonialRole?: string | null;
};

export function PortfolioDetail({
  project,
  renderedContent,
}: {
  project: Project;
  renderedContent: React.ReactNode;
}) {
  const meta = [
    { label: "Client", value: project.client },
    { label: "Industry", value: project.industry },
    { label: "Services", value: project.services },
    { label: "Year", value: project.year },
  ].filter((m) => m.value);

  const psr = [
    { label: "The Problem", text: project.problem, color: "#ef4444", accent: "border-red-500/20 bg-red-500/5" },
    { label: "The Solution", text: project.solution, color: "#5B8AEF", accent: "border-[#5B8AEF]/20 bg-[#5B8AEF]/5" },
    { label: "The Result", text: project.result, color: "#5a922c", accent: "border-[#5a922c]/20 bg-[#5a922c]/5" },
  ].filter((s) => s.text);

  return (
    <>
      {/* Hero header */}
      <div className="relative overflow-hidden pb-16 pt-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #d79f1e, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/portfolio"
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Work
            </Link>

            {project.tags && project.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#d79f1e]/20 bg-[#d79f1e]/10 px-3 py-1 text-xs font-medium text-[#d79f1e]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1
              className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              {project.title}
            </h1>

            {project.description && (
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}
          </motion.div>

          {/* Metadata row */}
          {meta.length > 0 && (
            <motion.div
              className="mt-10 flex flex-wrap gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {meta.map((m) => (
                <div key={m.label} className="flex min-w-[120px] flex-1 flex-col bg-background px-5 py-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {m.label}
                  </span>
                  <span className="mt-0.5 text-sm font-medium text-foreground">{m.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* Chart hero visual */}
      <ChartHero
        tags={project.tags}
        industry={project.industry}
        metrics={project.metrics}
      />

      {/* Metrics strip */}
      {project.metrics && project.metrics.length > 0 && (
        <div className="border-b border-white/[0.05]">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <motion.div
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ duration: 0.6 }}
            >
              {project.metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.01 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div
                    className="text-3xl font-bold text-[#d79f1e] md:text-4xl"
                    style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
                  >
                    {m.value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{m.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Problem / Solution / Result */}
      {psr.length > 0 && (
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {psr.map((s, i) => (
              <motion.div
                key={s.label}
                className="relative rounded-[1.25rem] border-[0.75px] border-border p-2"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlowingEffect spread={40} glow proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full rounded-xl border-[0.75px] bg-background p-6">
                  <span
                    className={`mb-3 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest ${s.accent}`}
                    style={{ color: s.color, borderColor: `${s.color}33` }}
                  >
                    {s.label}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonial */}
      {project.testimonialText && (
        <div className="border-t border-white/[0.05]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <motion.div
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ duration: 0.6 }}
            >
              <Quote className="mb-6 h-8 w-8 text-[#d79f1e]/40" />
              <p
                className="text-lg leading-relaxed text-foreground md:text-xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                &ldquo;{project.testimonialText}&rdquo;
              </p>
              {(project.testimonialAuthor || project.testimonialRole) && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.08]" />
                  <div className="text-right">
                    {project.testimonialAuthor && (
                      <p className="text-sm font-semibold text-foreground">
                        {project.testimonialAuthor}
                      </p>
                    )}
                    {project.testimonialRole && (
                      <p className="text-xs text-muted-foreground">{project.testimonialRole}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Extra prose content (if any) */}
      {renderedContent && (
        <div className="mx-auto max-w-3xl px-6 pb-16">
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-[var(--font-heading)] prose-headings:tracking-tight prose-a:text-[#5B8AEF] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-hr:border-white/[0.08]">
            {renderedContent}
          </div>
        </div>
      )}
    </>
  );
}
