"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

export function AnalyticsEvents() {
  useEffect(() => {
    captureAttribution();

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
          trackEvent("scroll_depth", {
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
      const ctaLocation = link.getAttribute("data-cta-location") || undefined;
      const ctaOffer = link.getAttribute("data-cta-offer") || undefined;

      // Track CTA buttons
      if (
        text.includes("Get in Touch") ||
        text.includes("Get Free Checklist") ||
        text.includes("Get the £495 Audit") ||
        text.includes("Run Free Website Grader") ||
        text.includes("Run Free AI Visibility Check") ||
        text.includes("Check AI Visibility") ||
        text.includes("Send Quick Enquiry") ||
        text.includes("Free Diagnosis") ||
        text.includes("Get My Free Diagnosis") ||
        Boolean(ctaLocation)
      ) {
        trackEvent("cta_click", {
          event_category: "engagement",
          event_label: text,
          cta_location: ctaLocation,
          cta_offer: ctaOffer,
          transport_type: "beacon",
        });
      }

      // Track phone clicks
      if (href.startsWith("tel:")) {
        trackEvent("phone_click", {
          event_category: "contact",
          event_label: href,
          cta_location: ctaLocation,
          transport_type: "beacon",
        });
      }

      // Track email clicks
      if (href.startsWith("mailto:")) {
        trackEvent("email_click", {
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
