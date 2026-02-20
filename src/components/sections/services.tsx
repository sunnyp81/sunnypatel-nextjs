"use client";

import {
  Globe,
  BarChart3,
  Map,
  Code,
  FileText,
  TrendingUp,
} from "lucide-react";
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                className="h-full"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.04]">
                  {/* Accent corner glow */}
                  <div
                    className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.12] blur-2xl"
                    style={{ background: service.color }}
                  />
                  {/* Icon */}
                  <div
                    className="mb-4 w-fit rounded-lg border p-2"
                    style={{
                      borderColor: `${service.color}28`,
                      backgroundColor: `${service.color}10`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: service.color }} />
                  </div>
                  {/* Text */}
                  <h3
                    className="mb-2 text-base font-semibold leading-snug tracking-tight text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
