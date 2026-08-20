"use client";

import {
  Loader2,
  CalendarDays,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { Badge } from "@/components/ui/badge";
import { FormField, FormError, FormSuccess } from "@/components/ui/form-field";
import { useLeadForm } from "@/lib/use-lead-form";

const TRUST_POINTS = [
  "Review your current rankings and identify quick wins",
  "Audit your biggest technical and content gaps",
  "Outline a clear 90-day action plan",
  "Answer any SEO questions you have",
] as const;

const BADGES = [
  { icon: CalendarDays, label: "15+ years experience" },
  { icon: Sparkles, label: "Free consultation" },
  { icon: Shield, label: "No contracts" },
] as const;

export function ServiceInlineForm({
  ctaTitle = "Book Your Free 30-Minute Consultation",
  ctaSubtitle = "Tell me about your business and I'll come prepared with specific recommendations for your site.",
  compact = false,
}: {
  ctaTitle?: string;
  ctaSubtitle?: string;
  compact?: boolean;
}) {
  const { status, setStatus, errorMsg, formData, handleChange, handleSubmit } =
    useLeadForm({
      initial: { name: "", email: "", phone: "", message: "" },
      eventCategory: "contact",
      eventLabel: "service_inline_form",
    });

  const formCard = (
    <GlowCard spread={50} proximity={80}>
      <div className="relative rounded-xl border-[0.75px] bg-background p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
        {/* Corner accents */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-tl-xl opacity-[0.08]"
          style={{ background: "radial-gradient(circle at 0% 0%, #5B8AEF, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-br-xl opacity-[0.06]"
          style={{ background: "radial-gradient(circle at 100% 100%, #3d6fe8, transparent 70%)" }}
        />

        {status === "success" ? (
          <FormSuccess
            message="Thanks for reaching out. I'll get back to you within 24 hours to arrange your consultation."
            onReset={() => setStatus("idle")}
          />
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-5">
            <p
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Tell me about your project
            </p>

            {/* Name + Email row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="name"
                label="Name"
                placeholder="Your name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={status === "loading"}
              />
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="you@company.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={status === "loading"}
              />
            </div>

            {!compact && (
              <FormField
                id="phone"
                label="Phone"
                type="tel"
                placeholder="07xxx xxx xxx"
                optional
                value={formData.phone}
                onChange={handleChange}
                disabled={status === "loading"}
              />
            )}

            <FormField
              id="message"
              label="How can I help?"
              placeholder="Your website URL and what you're trying to achieve — or just say hi, I'll ask the right questions."
              optional
              multiline
              rows={compact ? 3 : 4}
              value={formData.message}
              onChange={handleChange}
              disabled={status === "loading"}
            />

            <FormError message={errorMsg} />

            <button
              type="submit"
              disabled={status === "loading"}
              aria-busy={status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(91,138,239,0.45)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              style={{
                fontFamily: "var(--font-heading)",
                background: "linear-gradient(135deg, #5B8AEF 0%, #3d6fe8 100%)",
                boxShadow:
                  "0 0 20px rgba(91,138,239,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Book Free Consultation
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground/70">
              No obligation · Free 30 minutes · Usually responds same day
            </p>
            <p className="text-center text-xs text-muted-foreground/70">
              Prefer to talk?{" "}
              <a
                href="tel:07305523333"
                className="text-brand/60 hover:text-brand transition-colors"
              >
                07305 523333
              </a>
              {" · "}
              <a
                href="mailto:Hello@SunnyPatel.co.uk"
                className="text-brand/60 hover:text-brand transition-colors"
              >
                Hello@SunnyPatel.co.uk
              </a>
            </p>
          </form>
        )}
      </div>
    </GlowCard>
  );

  /* ── Compact: form only (for inline injection) ──────────── */
  if (compact) {
    return formCard;
  }

  /* ── Full: two-column layout with copy + form ───────────── */
  return (
    <div className="relative overflow-hidden" style={{ background: "#0a0a10" }}>
      {/* Strong top separator */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.10] blur-[100px]"
        style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(91,138,239,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: copy & trust ───────────────────────── */}
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">
              Get Started
            </p>
            <h2
              className="mb-4 text-2xl font-bold text-foreground md:text-3xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              {ctaTitle}
            </h2>
            <p className="mb-8 text-muted-foreground">{ctaSubtitle}</p>

            {/* What's included */}
            <ul className="mb-8 space-y-3">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <Star
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                    fill="currentColor"
                  />
                  {point}
                </li>
              ))}
            </ul>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {BADGES.map(({ icon: Icon, label }) => (
                <Badge key={label} variant="brand">
                  <Icon className="h-3 w-3 shrink-0" />
                  {label}
                </Badge>
              ))}
            </div>

            {/* Availability + response time */}
            <div className="mt-5 space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground/65">
                <Clock className="h-3 w-3" />
                Usually responds within a few hours
              </p>
              <p className="flex items-center gap-1.5 text-xs">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                <span className="text-success/90">Currently accepting new clients</span>
              </p>
            </div>
          </div>

          {/* ── Right: form ──────────────────────────────── */}
          {formCard}
        </div>
      </div>
    </div>
  );
}
