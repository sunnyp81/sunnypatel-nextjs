"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Sparkles,
  MapPin,
  BarChart3,
  Brain,
} from "lucide-react";

const highlights = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "15 Years Hands-On SEO",
    description:
      "Entity-based content networks built from real data, tested across 40+ sites in competitive niches.",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Local Berkshire Expertise",
    description:
      "Based in Reading with deep knowledge of the local business landscape. Face-to-face meetings available.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Measurable Results",
    description:
      "Every campaign tracked through Google Search Console with transparent monthly reporting. No vanity metrics.",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "AI-Integrated Strategy",
    description:
      "Leveraging AI tools for content optimisation, entity mapping, and competitive analysis at scale.",
  },
];

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 60%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#5a922c]">
            Why Work With Sunny
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-foreground md:text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.03em",
            }}
          >
            Results-driven SEO that
            <br className="hidden md:block" /> compounds over time
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="relative rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3"
            >
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2.5">
                  {item.icon}
                </div>
                <div>
                  <h3
                    className="mb-2 text-lg font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
