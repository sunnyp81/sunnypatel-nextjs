"use client";

import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GradientButton } from "@/components/ui/gradient-button";
import { FormError, FormField } from "@/components/ui/form-field";
import { GlowCard } from "@/components/ui/glow-card";
import { useLeadForm } from "@/lib/use-lead-form";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

const PROOF = [
  { value: "15+ years", label: "Hands-on SEO experience", color: "#d79f1e", href: "/about/" },
  { value: "45 sites", label: "Live SEO testing portfolio", color: "#7ba3f5", href: "/portfolio/niche-affiliate-seo-portfolio-45-sites/" },
  { value: "+340%", label: "Aatma organic traffic YoY", color: "#78b844", href: "/portfolio/aatma-aesthetics-website-design-development-seo/" },
] as const;

export function Hero() {
  const formStarted = useRef(false);
  const { status, setStatus, errorMsg, formData, setFormData, handleSubmit } = useLeadForm({
    initial: { name: "", email: "", phone: "", message: "" },
    eventCategory: "contact",
    eventLabel: "homepage_hero_diagnosis",
  });

  useEffect(() => {
    const form = document.getElementById("hero-diagnosis-form");
    if (!form || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackEvent("hero_cta_view", {
          event_category: "engagement",
          event_label: "free_20_minute_seo_diagnosis",
          cta_location: "homepage_hero",
          non_interaction: true,
        });
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const updateField = (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

  function trackFormStart() {
    if (formStarted.current) return;
    formStarted.current = true;
    trackEvent("form_start", {
      event_category: "contact",
      event_label: "homepage_hero_diagnosis",
      form_location: "homepage_hero",
    });
  }

  return (
    <HeroGeometric badge="SEO Consultant, Reading & UK-Wide" title1="SEO Run By the Person" title2="Doing the Actual Work">
      <p className="mx-auto mb-8 max-w-xl px-4 text-base font-normal leading-relaxed tracking-wide text-white/75 sm:text-lg md:text-xl">
        No account managers, no juniors. An independent{" "}
        <Link href="/services/seo-consultant-reading/" className="text-white underline decoration-white/40 underline-offset-2 transition-colors hover:text-brand">
          SEO consultant
        </Link>{" "}
        with 15+ years getting UK businesses ranked on Google and cited in AI search.
      </p>

      <GlowCard className="mx-auto w-full max-w-2xl border-white/[0.08] bg-black/20 p-1.5 text-left backdrop-blur-sm" spread={55} proximity={90}>
        <div className="relative overflow-hidden rounded-[1rem] border border-white/[0.06] bg-[#07070b]/95 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-5">
          <div className="pointer-events-none absolute inset-x-16 -top-16 h-28 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />

          {status === "success" ? (
            <div role="status" aria-live="polite" className="relative flex min-h-40 flex-col items-center gap-4 rounded-xl border border-success/20 bg-success/[0.06] p-5 text-center sm:flex-row sm:text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-success/30 bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Your diagnosis request is with Sunny.</p>
                <p className="mt-1 text-sm text-muted-foreground">I&apos;ll reply personally within one working day.</p>
                <a href="tel:07305523333" data-cta-location="homepage_hero_success" data-cta-offer="direct_call" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-success px-4 py-2 text-sm font-semibold text-black transition-[background-color,transform] hover:scale-[1.02] hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60 sm:w-auto">
                  Want to talk sooner? Call Sunny
                </a>
                <button type="button" onClick={() => setStatus("idle")} className="mt-2 min-h-11 text-sm font-medium text-brand underline underline-offset-4 transition-colors hover:text-brand/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:ml-3 sm:mt-3">
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <form id="hero-diagnosis-form" name="hero_diagnosis_form" onSubmit={handleSubmit} onFocusCapture={trackFormStart} className="relative" aria-label="Request a free 20-minute SEO diagnosis">
              <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Free 20-Minute SEO Diagnosis</p>
                  <p className="mt-1 text-sm text-white/75">Tell me where search is getting stuck. I&apos;ll reply personally.</p>
                </div>
                <p className="text-xs text-white/65">No sales team · No obligation</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField id="hero-name" label="Name" placeholder="Your name" autoComplete="name" required value={formData.name} onChange={updateField("name")} disabled={status === "loading"} srOnlyLabel />
                <FormField id="hero-email" label="Email" type="email" placeholder="Work email" autoComplete="email" required value={formData.email} onChange={updateField("email")} disabled={status === "loading"} srOnlyLabel />
                <FormField id="hero-phone" label="Phone number (optional)" type="tel" placeholder="Phone (optional)" autoComplete="tel" value={formData.phone} onChange={updateField("phone")} disabled={status === "loading"} srOnlyLabel />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <FormField id="hero-message" label="What do you need help with?" placeholder="Rankings, leads, AI visibility..." value={formData.message} onChange={updateField("message")} disabled={status === "loading"} srOnlyLabel />
                <GradientButton type="submit" disabled={status === "loading"} aria-busy={status === "loading"} className="min-h-11 w-full gap-2 whitespace-nowrap px-6 py-3 text-sm sm:w-auto" data-cta-location="homepage_hero" data-cta-offer="free_20_minute_seo_diagnosis">
                  {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Sending</> : <>Get My Free Diagnosis<ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
                </GradientButton>
              </div>
              <div className="mt-3"><FormError message={errorMsg} compact /></div>
              <p className="mt-3 text-center text-xs text-white/65">
                Prefer to talk? Call Sunny on{" "}<a href="tel:07305523333" className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:text-brand">07305 523333</a>
              </p>
            </form>
          )}
        </div>
      </GlowCard>

      <p className="mt-9 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Evidence, not promises</p>
      <div className="mx-auto mt-4 grid max-w-2xl gap-3 sm:grid-cols-3">
        {PROOF.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group relative rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-4 text-center transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-35" style={{ background: stat.color }} aria-hidden="true" />
            <div className="relative whitespace-nowrap text-xl font-bold md:text-2xl" style={{ fontFamily: "var(--font-heading)", color: stat.color }}>{stat.value}</div>
            <div className="mt-1 text-xs leading-snug text-white/75 transition-colors duration-300 group-hover:text-white">{stat.label}</div>
          </Link>
        ))}
      </div>
    </HeroGeometric>
  );
}
