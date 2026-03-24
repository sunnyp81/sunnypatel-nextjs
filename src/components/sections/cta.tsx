"use client";

import { ArrowRight } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "motion/react";

export function Cta() {
  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ background: "radial-gradient(ellipse at 30% 50%, #5B8AEF, transparent 50%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ background: "radial-gradient(ellipse at 70% 50%, #4c7894, transparent 50%)" }}
      />

      {/* Noise overlay */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain-cta">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-cta)" />
      </svg>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5B8AEF]/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5B8AEF]/15 to-transparent" />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="mb-6 text-3xl font-bold text-foreground md:text-5xl"
          style={{
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.03em",
            textShadow: "0 0 60px rgba(91,138,239,0.15)",
          }}
        >
          Get More Clients From Organic Search
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          Free 30-minute consultation — I'll review your rankings live on the call and tell you exactly what's holding you back. No sales pitch. No obligation. Call <a href="tel:07305523333" className="text-foreground hover:text-white transition-colors">07305 523333</a> or book below.
        </p>

        {/* Pulsing ring wrapper */}
        <div className="relative inline-flex">
          <div className="absolute -inset-3 animate-ping rounded-full bg-[#5B8AEF]/10 duration-[2000ms]" />
          <div className="absolute -inset-1.5 rounded-full bg-[#5B8AEF]/5" />
          <GradientButton asChild>
            <a href="/contact/" className="relative gap-2">
              Book Free Consultation
              <ArrowRight className="h-5 w-5" />
            </a>
          </GradientButton>
        </div>

        {/* Internal links to key service pages */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {[
            { label: "SEO Reading", href: "/services/seo-consultant-reading/" },
            { label: "SEO Berkshire", href: "/services/seo-berkshire/" },
            { label: "Technical Audits", href: "/services/technical-seo-audit/" },
            { label: "Topical Authority", href: "/services/topical-authority/" },
            { label: "SEO Consulting", href: "/services/seo-consulting/" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-muted-foreground/60 transition-all duration-200 hover:border-[#5B8AEF]/20 hover:text-[#5B8AEF]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
