"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Globe, Network, BookOpen } from "lucide-react";

const frameworks = [
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Entity SEO",
    description:
      "Establishing your brand as a recognised entity in Google\u2019s Knowledge Graph, so search engines understand who you are and what you represent.",
    href: "/blog/what-is-entity-seo/",
    color: "#5B8AEF",
    border: "border-[#5B8AEF]/20",
    bg: "bg-[#5B8AEF]/10",
  },
  {
    icon: <Network className="h-5 w-5" />,
    title: "Semantic SEO",
    description:
      "Building comprehensive topic coverage through entity relationships, ensuring search engines see the full context of your expertise.",
    href: "/services/semantic-seo/",
    color: "#4c7894",
    border: "border-[#4c7894]/20",
    bg: "bg-[#4c7894]/10",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Topical Authority",
    description:
      "Achieving authoritative status through systematic content architecture that covers every facet of your niche.",
    href: "/services/topical-authority/",
    color: "#5a922c",
    border: "border-[#5a922c]/20",
    bg: "bg-[#5a922c]/10",
  },
];

export function AboutMethodology() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
            The Semantic Triangle
          </p>
          <h2
            className="mb-6 text-3xl font-bold text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            My Methodology
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            My SEO methodology combines three interconnected frameworks. Each
            reinforces the others, creating a compounding effect that builds
            lasting search visibility.
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

        {/* Connecting statement */}
        <motion.p
          className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Together these three frameworks form the{" "}
          <span className="font-medium text-foreground">semantic triangle</span>{" "}
          &mdash; a self-reinforcing system where entity recognition strengthens
          topical authority, comprehensive coverage deepens semantic
          understanding, and authoritative content builds entity trust.
        </motion.p>
      </div>
    </section>
  );
}
