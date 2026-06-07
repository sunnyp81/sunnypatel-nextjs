"use client";

import { useState } from "react";

export type FormStatus = "idle" | "loading" | "success" | "error";

/**
 * Shared state machine for the lead-capture forms (Contact, ServiceInlineForm,
 * BlogLeadMagnet). Previously this exact logic was copy-pasted in all three.
 * Posts to /api/contact and fires the GA4 `generate_lead` event on success.
 */
export function useLeadForm<T extends Record<string, string>>(opts: {
  initial: T;
  eventCategory: string;
  eventLabel: string;
  /** Optionally reshape the payload before sending (e.g. inject a message). */
  transform?: (data: T) => Record<string, unknown>;
}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<T>(opts.initial);

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
      const payload = opts.transform ? opts.transform(formData) : formData;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setFormData(opts.initial);
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            event_category: opts.eventCategory,
            event_label: opts.eventLabel,
          });
        }
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
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
