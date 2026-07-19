"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GradientButton } from "@/components/ui/gradient-button";
import { ArrowRight, Search } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [domain, setDomain] = useState("");

  const submitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = domain.trim();
    if (!trimmed) return;
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "cta_click", {
        event_category: "engagement",
        event_label: "Hero Grade My Site",
        transport_type: "beacon",
      });
    }
    router.push(`/tools/website-grader/?url=${encodeURIComponent(trimmed)}`);
  };

  return (
    <HeroGeometric
      badge="SEO Consultant, Reading & UK-Wide"
      title1="SEO Run By the Person"
      title2="Doing the Actual Work"
    >
      <p className="text-base sm:text-lg md:text-xl text-white/70 mb-10 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
        No account managers, no juniors. An independent <a href="/services/seo-consultant-reading/" className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">SEO consultant</a>
        {" "}with 15+ years getting UK businesses ranked on Google and cited in AI search.
      </p>

      <form
        onSubmit={submitGrade}
        className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 sm:flex-row sm:gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            inputMode="url"
            autoComplete="url"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourwebsite.co.uk"
            aria-label="Your website address"
            className="w-full rounded-xl border border-white/15 bg-white/[0.05] py-3.5 pl-11 pr-4 text-base text-white placeholder:text-white/35 backdrop-blur-sm transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <GradientButton asChild>
          <button type="submit" className="gap-2 whitespace-nowrap">
            Grade My Site Free
            <ArrowRight className="h-4 w-4" />
          </button>
        </GradientButton>
      </form>
      <p className="mt-4 text-sm text-white/50">
        Instant A-F score: SEO, speed, security, content. No sign-up.{" "}
        <a href="#contact" className="text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Or book a free consultation
        </a>
      </p>

      {/* Social proof — star rating */}
      <div className="mt-10 flex items-center justify-center gap-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-medium text-white/65">
          Rated 5/5 by 100+ UK businesses
        </span>
      </div>

      <div className="mt-8 mx-auto grid max-w-xl grid-cols-3 gap-4">
        {[
          { value: "100+", label: "Clients Served", color: "#d79f1e" },
          { value: "15+", label: "Years Experience", color: "#5B8AEF" },
          { value: "150-280%", label: "Avg Traffic Growth", color: "#5a922c" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative cursor-default rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:scale-[1.04]"
          >
            {/* Glow behind the number — intensifies on hover */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
              style={{ background: stat.color }}
            />
            <div
              className="relative whitespace-nowrap text-xl font-bold transition-transform duration-300 group-hover:scale-110 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)", color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-white/60 transition-colors duration-300 group-hover:text-white/80">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </HeroGeometric>
  );
}
