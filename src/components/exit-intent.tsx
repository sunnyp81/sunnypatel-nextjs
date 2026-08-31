"use client";

import { FormError, FormField } from "@/components/ui/form-field";
import { useLeadForm } from "@/lib/use-lead-form";
import { CheckCircle2, Download, Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function ExitIntent() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const { status, errorMsg, formData, setFormData, handleSubmit } = useLeadForm({
    initial: { name: "", email: "" },
    eventCategory: "lead_magnet",
    eventLabel: "exit_intent_seo_checklist",
    transform: (data) => ({
      ...data,
      message: "[Lead Magnet] Exit-intent SEO audit checklist request",
      leadMagnet: "seo-audit-checklist",
    }),
  });

  const openDialog = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    setShow(true);
  }, []);

  const handleMouseLeave = useCallback((event: MouseEvent) => {
    if (event.clientY <= 5 && !dismissed) openDialog();
  }, [dismissed, openDialog]);

  const dismiss = useCallback(() => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("exit_dismissed", "1");
    previousFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("exit_dismissed")) {
      return;
    }
    const timer = window.setTimeout(() => document.addEventListener("mouseleave", handleMouseLeave), 8000);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  useEffect(() => {
    if (!show) return;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button, input, a[href]")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dismiss, show]);

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm" onClick={dismiss} aria-label="Close checklist offer" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="exit-intent-title" className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a10] shadow-2xl shadow-brand/10">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-brand opacity-20 blur-[60px]" aria-hidden="true" />
          <button type="button" onClick={dismiss} className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60" aria-label="Close checklist offer">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="relative px-7 pb-8 pt-10 text-center sm:px-8">
            {status === "success" ? (
              <div role="status" aria-live="polite" className="py-5">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-success/30 bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" /></div>
                <h2 id="exit-intent-title" className="text-xl font-bold text-foreground">Check your inbox</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The 47-point checklist is on its way. Want hands-on help sooner?</p>
                <a href="tel:07305523333" data-cta-location="exit_intent_success" data-cta-offer="direct_call" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-success px-5 text-sm font-semibold text-black transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60">Call Sunny on 07305 523333</a>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-brand/20 bg-brand/10"><Sparkles className="h-5 w-5 text-brand" aria-hidden="true" /></div>
                <h2 id="exit-intent-title" className="text-xl font-bold text-foreground md:text-2xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}>Take the 47-point SEO checklist</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Run the same first-pass checks I use across technical SEO, content, internal links and AI visibility.</p>
                <ul className="my-5 space-y-2 text-left">
                  {["Find crawl and indexing problems", "Spot missing content and internal links", "Prioritise quick wins before bigger work"].map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{point}</li>
                  ))}
                </ul>
                <form onSubmit={handleSubmit} className="space-y-3" aria-label="Email me the 47-point SEO checklist">
                  <FormField id="exit-name" label="Your name" placeholder="Your name" autoComplete="name" required srOnlyLabel value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} disabled={status === "loading"} />
                  <FormField id="exit-email" label="Email address" type="email" placeholder="you@company.com" autoComplete="email" required srOnlyLabel value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} disabled={status === "loading"} />
                  <FormError message={errorMsg} compact />
                  <button type="submit" disabled={status === "loading"} aria-busy={status === "loading"} data-cta-location="exit_intent" data-cta-offer="seo_checklist" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-[background-color,transform,box-shadow] hover:scale-[1.02] hover:bg-brand/90 hover:shadow-[0_0_30px_rgba(91,138,239,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-70">
                    {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Sending</> : <><Download className="h-4 w-4" aria-hidden="true" />Email Me the Checklist</>}
                  </button>
                  <p className="text-xs text-muted-foreground">One email with the checklist. No mailing list.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
