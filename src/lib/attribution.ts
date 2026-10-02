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


// Last article CTA is client-reported journey context, separate from first touch.
const ARTICLE_CTA_KEY = "sp_article_cta";
const ARTICLE_CTA_TTL = 30 * 60 * 1000;
export type ArticleCTA = { cta_article?: string; cta_offer?: string };

export function captureArticleCTA(article: string, offer: string) {
  if (typeof window === "undefined" || /[\r\n]/.test(article + offer) || !/^\/blog\/[a-z0-9-]{1,100}\/$/.test(article) || !/^[a-z0-9_]{1,80}$/.test(offer)) return;
  try {
    sessionStorage.setItem(ARTICLE_CTA_KEY, JSON.stringify({ article, offer, at: Date.now() }));
  } catch { /* Storage must never block navigation. */ }
}

export function getArticleCTA(): ArticleCTA {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(ARTICLE_CTA_KEY);
    if (!raw || raw.length > 500) return {};
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value) ||
      typeof value.article !== "string" || /[\r\n]/.test(value.article) || !/^\/blog\/[a-z0-9-]{1,100}\/$/.test(value.article) ||
      typeof value.offer !== "string" || /[\r\n]/.test(value.offer) || !/^[a-z0-9_]{1,80}$/.test(value.offer) ||
      typeof value.at !== "number" || !Number.isFinite(value.at) ||
      Date.now() - value.at < 0 || Date.now() - value.at >= ARTICLE_CTA_TTL) return {};
    return { cta_article: value.article, cta_offer: value.offer };
  } catch { return {}; }
}

export function clearArticleCTA() {
  try { if (typeof window !== "undefined") sessionStorage.removeItem(ARTICLE_CTA_KEY); } catch {}
}
