"use client";

import { useEffect } from "react";

export function AnalyticsEvents() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    // ── Scroll depth tracking ──────────────────────────────────
    const thresholds = [25, 50, 75, 90];
    const fired = new Set<number>();

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = Math.round((scrollY / docHeight) * 100);

      for (const t of thresholds) {
        if (percent >= t && !fired.has(t)) {
          fired.add(t);
          window.gtag("event", "scroll_depth", {
            event_category: "engagement",
            event_label: `${t}%`,
            value: t,
            non_interaction: true,
          });
        }
      }
    };

    // ── CTA click tracking ─────────────────────────────────────
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a, button");
      if (!link) return;

      const text = link.textContent?.trim() || "";
      const href = link.getAttribute("href") || "";

      // Track CTA buttons
      if (
        text.includes("Book Free Consultation") ||
        text.includes("Book Now") ||
        text.includes("Get a Quote") ||
        text.includes("Get Free Checklist")
      ) {
        window.gtag("event", "cta_click", {
          event_category: "engagement",
          event_label: text,
          transport_type: "beacon",
        });
      }

      // Track phone clicks
      if (href.startsWith("tel:")) {
        window.gtag("event", "phone_click", {
          event_category: "contact",
          event_label: href,
          transport_type: "beacon",
        });
      }

      // Track email clicks
      if (href.startsWith("mailto:")) {
        window.gtag("event", "email_click", {
          event_category: "contact",
          event_label: href,
          transport_type: "beacon",
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
