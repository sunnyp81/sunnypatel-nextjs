"use client";

import { useRef, useState } from "react";
import { getToolJourney, trackEvent } from "@/lib/analytics";
import { getAttribution, getArticleCTA, clearArticleCTA } from "@/lib/attribution";
import { qualificationAnalyticsParams } from "@/lib/lead-qualification";

export type FormStatus = "idle" | "loading" | "success" | "error";

// Public Turnstile site key (invisible widget for sunnypatel.co.uk lead forms).
const TURNSTILE_SITE_KEY = "0x4AAAAAAFLM8CkdZF0txmms";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  execute: (id: string) => void;
  remove: (id: string) => void;
};

let turnstileScript: Promise<Turnstile | null> | null = null;

function loadTurnstile(): Promise<Turnstile | null> {
  const w = window as unknown as { turnstile?: Turnstile };
  if (w.turnstile) return Promise.resolve(w.turnstile);
  turnstileScript ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve(w.turnstile ?? null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return turnstileScript;
}

// Returns a token, or "" if the script is blocked or slow: the server then labels
// the enquiry as unverified instead of rejecting it.
function getTurnstileToken(): Promise<string> {
  // Overall cap: a script that never loads or answers must not hold up the lead.
  return Promise.race([
    fetchTurnstileToken(),
    new Promise<string>((resolve) => setTimeout(() => resolve(""), 8000)),
  ]);
}

async function fetchTurnstileToken(): Promise<string> {
  const turnstile = await loadTurnstile();
  if (!turnstile) return "";
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.style.display = "none";
    document.body.appendChild(el);
    let id = "";
    const done = (token: string) => {
      clearTimeout(timer);
      try { if (id) turnstile.remove(id); } catch {}
      el.remove();
      resolve(token);
    };
    const timer = setTimeout(() => done(""), 8000);
    try {
      id = turnstile.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        execution: "execute",
        callback: (token: string) => done(token),
        "error-callback": () => done(""),
      });
      turnstile.execute(id);
    } catch {
      done("");
    }
  });
}

/**
 * Shared state machine for the lead-capture forms (Contact, ServiceInlineForm,
 * BlogLeadMagnet). Previously this exact logic was copy-pasted in all three.
 * Posts to /api/contact and fires the GA4 `generate_lead` event on success.
 */
export function useLeadForm<T extends Record<string, string>>(opts: {
  initial: T;
  eventCategory: string;
  eventLabel: string;
  /** Estimated GBP value of a lead from this form (defaults to 50). */
  leadValue?: number;
  /** Optionally reshape the payload before sending (e.g. inject a message). */
  transform?: (data: T) => Record<string, unknown>;
}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<T>(opts.initial);
  const inFlight = useRef(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("loading");
    setErrorMsg("");

    try {
      const articleCTA = getArticleCTA();
      const payload = {
        ...(opts.transform ? opts.transform(formData) : formData),
        ...getAttribution(),
        ...articleCTA,
        turnstileToken: await getTurnstileToken(),
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        trackEvent("form_error", {
          event_category: opts.eventCategory,
          event_label: opts.eventLabel,
          form_location: opts.eventLabel,
          error_type: "api_response",
        });
      } else {
        setStatus("success");
        setFormData(opts.initial);
        trackEvent("generate_lead", {
          event_category: opts.eventCategory,
          event_label: opts.eventLabel,
          form_location: opts.eventLabel,
          value: opts.leadValue ?? 50,
          currency: "GBP",
          transport_type: "beacon",
          ...getToolJourney(),
          ...(articleCTA.cta_article ? { article_cta_slug: articleCTA.cta_article.split("/")[2], article_cta_offer: articleCTA.cta_offer } : {}),
          ...("howHeard" in formData ? { how_heard: formData.howHeard } : {}),
          ...qualificationAnalyticsParams(formData.supportType),
        });
        clearArticleCTA();
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
      trackEvent("form_error", {
        event_category: opts.eventCategory,
        event_label: opts.eventLabel,
        form_location: opts.eventLabel,
        error_type: "network",
      });
    } finally {
      inFlight.current = false;
    }
  }

  return {
    status,
    setStatus,
    errorMsg,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
  };
}
