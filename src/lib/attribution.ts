"use client";

const KEY = "sp_attribution";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
};

/**
 * First-touch attribution: captured once per session on the first page a
 * visitor lands on, then read back by lead forms so the enquiry email shows
 * where the lead actually came from (chatgpt.com, google/organic, an ad,
 * etc.) instead of relying on the self-reported "how did you hear" field.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const attribution: Attribution = {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_term: params.get("utm_term") || undefined,
      utm_content: params.get("utm_content") || undefined,
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname,
    };
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage unavailable (private browsing, etc) — skip silently.
  }
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
