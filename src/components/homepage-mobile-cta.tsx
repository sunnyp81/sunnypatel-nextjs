"use client";

import { Phone, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

export function HomepageMobileCta() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [contactVisible, setContactVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("homepage-hero");
    const contact = document.getElementById("contact");
    if (!hero || !contact || typeof IntersectionObserver === "undefined") return;

    const heroObserver = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.05 });
    const contactObserver = new IntersectionObserver(([entry]) => setContactVisible(entry.isIntersecting), { threshold: 0.05 });
    heroObserver.observe(hero);
    contactObserver.observe(contact);
    return () => {
      heroObserver.disconnect();
      contactObserver.disconnect();
    };
  }, []);

  if (dismissed || heroVisible || contactVisible) return null;

  return (
    <aside aria-label="Quick contact options" className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/15 bg-[#08080d]/95 p-2 shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl md:hidden" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <a href="tel:07305523333" data-cta-location="mobile_sticky" data-cta-offer="direct_call" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">
          <Phone className="h-4 w-4" aria-hidden="true" /> Call Sunny
        </a>
        <a href="#contact" data-cta-location="mobile_sticky" data-cta-offer="free_20_minute_seo_diagnosis" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
          <Send className="h-4 w-4" aria-hidden="true" /> Send Enquiry
        </a>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss quick contact options" className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
