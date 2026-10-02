"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { BookOpen, Globe, Network } from "lucide-react";
import { ComparisonTable } from "./ComparisonTable";

const frameworks = [
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Entity SEO",
    description:
      "Entity SEO clarifies who your brand is through consistent names, profiles and verifiable facts. Knowledge Graph inclusion is not guaranteed.",
    href: "/blog/what-is-entity-seo/",
    color: "var(--brand-ink)",
    border: "border-brand/20",
    bg: "bg-brand/10",
  },
  {
    icon: <Network className="h-5 w-5" />,
    title: "Semantic SEO",
    description:
      "Semantic SEO connects related entities and questions in useful content, so each section explains its subject and relevant context.",
    href: "/services/semantic-seo/",
    color: "var(--teal-ink)",
    border: "border-teal/20",
    bg: "bg-teal/10",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Topical Authority",
    description:
      "Topical authority planning maps the relevant questions in your niche and the evidence needed to answer them. Coverage alone does not establish authority.",
    href: "/services/topical-authority/",
    color: "var(--success-ink)",
    border: "border-success/20",
    bg: "bg-success/10",
  },
];

export function AboutMethodology() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hairline dark:via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-ink">
            The Semantic Triangle
          </p>
          <h2
            className="mb-6 text-3xl font-bold text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            My Methodology
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            I combine entity SEO, semantic SEO and topical authority
            planning to organise an SEO campaign. Entity SEO clarifies the brand,
            semantic SEO connects related information, and topical planning maps
            the questions the site needs to answer.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {frameworks.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
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
                  className={`w-fit rounded-lg border ${f.border} ${f.bg} p-2.5`}
                  style={{ color: f.color }}
                >
                  {f.icon}
                </div>
                <div className="flex flex-1 flex-col">
                  <h3
                    className="mb-2 text-lg font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                  <Link
                    href={f.href}
                    className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200 hover:underline"
                    style={{ color: f.color }}
                  >
                    Learn more
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <ComparisonTable />

        {/* Connecting statement */}
        <motion.p
          className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          I call this combination of entity SEO, semantic SEO and topical authority the{" "}
          <span className="font-medium text-foreground">semantic triangle</span>
          . It is a planning framework for connecting brand information, useful content and supporting evidence, not a published formula used by search engines.
        </motion.p>
      </div>
    </section>
  );
}
