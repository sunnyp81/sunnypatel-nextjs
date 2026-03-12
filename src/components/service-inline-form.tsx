"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

type Status = "idle" | "loading" | "success" | "error";

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
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  const formCard = (
    <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2">
      <GlowingEffect
        spread={50}
        glow={true}
        disabled={false}
        proximity={80}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <div className="relative rounded-xl border-[0.75px] bg-background p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
        {/* Corner accents */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-tl-xl opacity-[0.08]"
          style={{ background: "radial-gradient(circle at 0% 0%, #5B8AEF, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-br-xl opacity-[0.06]"
          style={{ background: "radial-gradient(circle at 100% 100%, #7B5AEF, transparent 70%)" }}
        />

        {status === "success" ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#5a922c]/30 bg-[#5a922c]/10">
              <CheckCircle2 className="h-8 w-8 text-[#5a922c]" />
            </div>
            <h3
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Message sent!
            </h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              Thanks for reaching out. I&apos;ll get back to you within 24 hours to arrange your consultation.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-2 text-sm text-[#5B8AEF] transition-colors hover:text-[#5B8AEF]/80"
            >
              Send another message
            </button>
          </div>
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
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-muted-foreground"
                >
                  Name <span className="text-[#5B8AEF]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  disabled={status === "loading"}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-muted-foreground"
                >
                  Email <span className="text-[#5B8AEF]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                  disabled={status === "loading"}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Phone */}
            {!compact && (
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-muted-foreground"
                >
                  Phone <span className="text-muted-foreground/40">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07xxx xxx xxx"
                  disabled={status === "loading"}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none disabled:opacity-50"
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                How can I help? <span className="text-muted-foreground/40">(optional)</span>
              </label>
              <textarea
                id="message"
                rows={compact ? 3 : 4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Your website URL and what you're trying to achieve — or just say hi, I'll ask the right questions."
                disabled={status === "loading"}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none disabled:opacity-50"
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(91,138,239,0.45)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              style={{
                fontFamily: "var(--font-heading)",
                background: "linear-gradient(135deg, #5B8AEF 0%, #7B5AEF 100%)",
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

            <p className="text-center text-xs text-muted-foreground/40">
              No obligation · Free 30 minutes · Usually responds same day
            </p>
            <p className="text-center text-xs text-muted-foreground/30">
              Prefer email?{" "}
              <a
                href="mailto:hello@sunnypatel.co.uk"
                className="text-[#5B8AEF]/60 hover:text-[#5B8AEF] transition-colors"
              >
                hello@sunnypatel.co.uk
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );

  /* ── Compact: form only (for inline injection) ──────────── */
  if (compact) {
    return formCard;
  }

  /* ── Full: two-column layout with copy + form ───────────── */
  return (
    <div className="relative overflow-hidden" style={{ background: "#0a0a10" }}>
      {/* Strong top separator */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5B8AEF]/40 to-transparent" />
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
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
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5B8AEF]"
                    fill="currentColor"
                  />
                  {point}
                </li>
              ))}
            </ul>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {BADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#5B8AEF]/20 bg-[#5B8AEF]/[0.07] px-3 py-1.5 text-xs font-medium text-[#5B8AEF]"
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {label}
                </span>
              ))}
            </div>

            {/* Availability + response time */}
            <div className="mt-5 space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                <Clock className="h-3 w-3" />
                Usually responds within a few hours
              </p>
              <p className="flex items-center gap-1.5 text-xs">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400/80">Currently accepting new clients</span>
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
