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
import { cn } from "@/lib/utils";

const services = [
  {
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    icon: <Globe className="h-4 w-4" />,
    title: "Topical Authority",
    description:
      "Build comprehensive content networks that establish your site as the definitive source in your niche through entity relationships.",
  },
  {
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
    icon: <Code className="h-4 w-4" />,
    title: "Technical SEO Audits",
    description:
      "Deep crawl analysis, Core Web Vitals optimisation, schema markup, and site architecture improvements.",
  },
  {
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
    icon: <Map className="h-4 w-4" />,
    title: "Topical Maps",
    description:
      "Strategic content architecture using root, node, and seed page hierarchy to signal topical completeness to search engines.",
  },
  {
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
    icon: <BarChart3 className="h-4 w-4" />,
    title: "SEO Consulting",
    description:
      "Strategic guidance for in-house teams. Monthly retainers with priority support and quarterly strategy reviews.",
  },
  {
    area: "md:[grid-area:3/1/4/7] xl:[grid-area:2/8/3/10]",
    icon: <FileText className="h-4 w-4" />,
    title: "Content Strategy",
    description:
      "Semantic briefs, content calendars, and editorial workflows aligned with search intent.",
  },
  {
    area: "md:[grid-area:3/7/4/13] xl:[grid-area:2/10/3/13]",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Revenue Recovery",
    description:
      "Diagnose traffic drops, recover lost rankings, and rebuild organic revenue from algorithm updates.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32">
      {/* Background accent */}
      <div
        className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.04] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #5B8AEF, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#5B8AEF]">
            Specialist Services
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-foreground md:text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.03em",
            }}
          >
            Everything you need to
            <br className="hidden md:block" /> dominate organic search
          </h2>
        </div>

        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:grid-rows-2">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServiceCard({
  area,
  icon,
  title,
  description,
}: {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3
                className="pt-0.5 text-xl font-semibold leading-[1.375rem] tracking-[-0.04em] text-balance text-foreground md:text-2xl md:leading-[1.875rem]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-[1.125rem] text-muted-foreground md:text-base md:leading-[1.375rem]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
