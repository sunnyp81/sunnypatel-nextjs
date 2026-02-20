"use client";

import {
  Globe,
  BarChart3,
  Map,
  Code,
  FileText,
  TrendingUp,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion } from "motion/react";

const services = [
  {
    icon: Globe,
    title: "Topical Authority",
    description:
      "Build comprehensive content networks that establish your site as the definitive source in your niche through entity relationships.",
    color: "#5B8AEF",
  },
  {
    icon: Code,
    title: "Technical SEO Audits",
    description:
      "Deep crawl analysis, Core Web Vitals optimisation, schema markup, and site architecture improvements.",
    color: "#4c7894",
  },
  {
    icon: Map,
    title: "Topical Maps",
    description:
      "Strategic content architecture using root, node, and seed page hierarchy to signal topical completeness to search engines.",
    color: "#5a922c",
  },
  {
    icon: BarChart3,
    title: "SEO Consulting",
    description:
      "Strategic guidance for in-house teams. Monthly retainers with priority support and quarterly strategy reviews.",
    color: "#d79f1e",
  },
  {
    icon: FileText,
    title: "Content Strategy",
    description:
      "Semantic briefs, content calendars, and editorial workflows aligned with search intent.",
    color: "#5B8AEF",
  },
  {
    icon: TrendingUp,
    title: "Revenue Recovery",
    description:
      "Diagnose traffic drops, recover lost rankings, and rebuild organic revenue from algorithm updates.",
    color: "#5a922c",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32">
      <div
        className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.04] blur-[120px]"
        style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#5B8AEF]">
            Specialist Services
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Everything you need to
            <br className="hidden md:block" /> dominate organic search
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ alignItems: "start" }}>
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <div className="group relative rounded-[1.25rem] border-[0.75px] border-border p-2 transition-colors duration-200 hover:border-white/20">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                  />
                  <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border-[0.75px] bg-background p-5 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    {/* Subtle corner glow */}
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full opacity-15 blur-2xl"
                      style={{ background: service.color }}
                    />
                    {/* Icon */}
                    <div
                      className="w-fit rounded-lg border p-2"
                      style={{
                        borderColor: `${service.color}30`,
                        backgroundColor: `${service.color}12`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: service.color }} />
                    </div>
                    {/* Text */}
                    <div className="space-y-1.5">
                      <h3
                        className="text-base font-semibold leading-snug tracking-tight text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {service.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
