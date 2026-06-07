"use client";

import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { useLeadForm } from "@/lib/use-lead-form";
import { FormField, FormError } from "@/components/ui/form-field";

export function BlogLeadMagnet() {
  const { status, errorMsg, formData, handleChange, handleSubmit } = useLeadForm({
    initial: { name: "", email: "" },
    eventCategory: "lead_magnet",
    eventLabel: "seo_checklist",
    transform: (d) => ({
      ...d,
      message: "[Lead Magnet] Free SEO Checklist download request",
    }),
  });

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="my-12 rounded-2xl border border-success/20 bg-success/5 p-6 text-center md:p-8"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-success/30 bg-success/10">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <h3
          className="mb-2 text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Check your inbox!
        </h3>
        <p className="text-sm text-muted-foreground">
          I&apos;ll send the checklist to your email shortly. In the meantime, feel free to{" "}
          <a href="/contact/" className="text-brand hover:underline">
            book a free consultation
          </a>{" "}
          if you want hands-on help.
        </p>
      </div>
    );
  }

  return (
    <div className="my-12 overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] to-brand-deep/[0.04]">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          {/* Left — copy */}
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10">
                <Download className="h-4 w-4 text-brand" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                Free Resource
              </span>
            </div>
            <h3
              className="mb-2 text-lg font-bold text-foreground md:text-xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Free SEO Audit Checklist
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The same 47-point checklist I use for client audits. Covers technical SEO, content gaps, and quick wins you can fix today.
            </p>
          </div>

          {/* Right — form */}
          <div className="w-full md:w-80">
            <form onSubmit={handleSubmit} className="space-y-3">
              <FormField
                id="name"
                label="Your name"
                placeholder="Your name"
                required
                srOnlyLabel
                value={formData.name}
                onChange={handleChange}
                disabled={status === "loading"}
              />
              <FormField
                id="email"
                label="Email address"
                type="email"
                placeholder="you@company.com"
                required
                srOnlyLabel
                value={formData.email}
                onChange={handleChange}
                disabled={status === "loading"}
              />
              <FormError message={errorMsg} compact />
              <button
                type="submit"
                disabled={status === "loading"}
                aria-busy={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: "linear-gradient(135deg, #5B8AEF 0%, #3d6fe8 100%)",
                  boxShadow: "0 0 20px rgba(91,138,239,0.25)",
                }}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Get Free Checklist
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-muted-foreground/70">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
