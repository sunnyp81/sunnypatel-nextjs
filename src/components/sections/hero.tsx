"use client";

import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GradientButton } from "@/components/ui/gradient-button";
import { FormError, FormField } from "@/components/ui/form-field";
import { GlowCard } from "@/components/ui/glow-card";
import { useLeadForm } from "@/lib/use-lead-form";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const { status, setStatus, errorMsg, formData, setFormData, handleSubmit } =
    useLeadForm({
      initial: { name: "", email: "", phone: "", message: "" },
      eventCategory: "contact",
      eventLabel: "homepage_hero_quick_enquiry",
    });

  const updateField = (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

  return (
    <HeroGeometric
      badge="SEO Consultant, Reading & UK-Wide"
      title1="SEO Run By the Person"
      title2="Doing the Actual Work"
    >
      <p className="text-base sm:text-lg md:text-xl text-white/70 mb-10 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
        No account managers, no juniors. An independent <Link href="/services/seo-consultant-reading/" className="text-white/60 hover:text-white/80 underline underline-offset-2 transition-colors">SEO consultant</Link>
        {" "}with 15+ years getting UK businesses ranked on Google and cited in AI search.
      </p>

      <GlowCard
        className="mx-auto w-full max-w-2xl border-white/[0.08] bg-black/20 p-1.5 text-left backdrop-blur-sm"
        spread={55}
        proximity={90}
      >
        <div className="relative overflow-hidden rounded-[1rem] border border-white/[0.06] bg-[#07070b]/95 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-5">
          <div
            className="pointer-events-none absolute inset-x-16 -top-16 h-28 rounded-full bg-brand/15 blur-3xl"
            aria-hidden="true"
          />

          {status === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="relative flex min-h-36 items-center gap-4 rounded-xl border border-success/20 bg-success/[0.06] p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-success/30 bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Your enquiry is with Sunny.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  I&apos;ll reply personally within one working day.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-3 text-sm font-medium text-brand underline underline-offset-4 transition-colors hover:text-brand/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  Send another enquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative" aria-label="Quick SEO enquiry">
              <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                    Direct to Sunny
                  </p>
                  <p className="mt-1 text-sm text-white/65">
                    Tell me where search is getting stuck.
                  </p>
                </div>
                <p className="text-xs text-white/45">Reply within one working day</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <FormField
                  id="hero-name"
                  label="Name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={updateField("name")}
                  disabled={status === "loading"}
                  srOnlyLabel
                />
                <FormField
                  id="hero-email"
                  label="Email"
                  type="email"
                  placeholder="Work email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={updateField("email")}
                  disabled={status === "loading"}
                  srOnlyLabel
                />
                <FormField
                  id="hero-phone"
                  label="Phone number (optional)"
                  type="tel"
                  placeholder="Phone (optional)"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={updateField("phone")}
                  disabled={status === "loading"}
                  srOnlyLabel
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <FormField
                  id="hero-message"
                  label="What do you need help with?"
                  placeholder="Rankings, leads, AI visibility..."
                  value={formData.message}
                  onChange={updateField("message")}
                  disabled={status === "loading"}
                  srOnlyLabel
                />
                <GradientButton
                  type="submit"
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                  className="min-h-11 w-full gap-2 whitespace-nowrap px-6 py-3 text-sm sm:w-auto"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending
                    </>
                  ) : (
                    <>
                      Send Quick Enquiry
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </GradientButton>
              </div>
              <div className="mt-3">
                <FormError message={errorMsg} compact />
              </div>
              <p className="mt-3 text-center text-xs text-white/40">
                No sales team. No mailing list. Just a direct reply from me.
              </p>
            </form>
          )}
        </div>
      </GlowCard>

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
            className="group relative cursor-default rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center transition-[border-color,background-color,transform] duration-300 hover:scale-[1.04] hover:border-white/[0.12] hover:bg-white/[0.04]"
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
