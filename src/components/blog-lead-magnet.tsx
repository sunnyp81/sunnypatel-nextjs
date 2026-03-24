"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function BlogLeadMagnet() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          message: "[Lead Magnet] Free SEO Checklist download request",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setFormData({ name: "", email: "" });
        // GA4 conversion tracking
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            event_category: "lead_magnet",
            event_label: "seo_checklist",
          });
        }
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="my-12 rounded-2xl border border-[#5a922c]/20 bg-[#5a922c]/5 p-6 text-center md:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#5a922c]/30 bg-[#5a922c]/10">
          <CheckCircle2 className="h-6 w-6 text-[#5a922c]" />
        </div>
        <h3
          className="mb-2 text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Check your inbox!
        </h3>
        <p className="text-sm text-muted-foreground">
          I&apos;ll send the checklist to your email shortly. In the meantime, feel free to{" "}
          <a href="/contact/" className="text-[#5B8AEF] hover:underline">
            book a free consultation
          </a>{" "}
          if you want hands-on help.
        </p>
      </div>
    );
  }

  return (
    <div className="my-12 overflow-hidden rounded-2xl border border-[#5B8AEF]/20 bg-gradient-to-br from-[#5B8AEF]/[0.06] to-[#7B5AEF]/[0.04]">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          {/* Left — copy */}
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#5B8AEF]/20 bg-[#5B8AEF]/10">
                <Download className="h-4 w-4 text-[#5B8AEF]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
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
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                required
                className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:outline-none"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:outline-none"
              />
              {status === "error" && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errorMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: "linear-gradient(135deg, #5B8AEF 0%, #7B5AEF 100%)",
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
              <p className="text-center text-[10px] text-muted-foreground/30">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
