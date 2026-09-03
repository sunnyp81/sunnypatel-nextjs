"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";

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
  /** Estimated GBP value of a lead from this form (defaults to 50). */
  leadValue?: number;
  /** Optionally reshape the payload before sending (e.g. inject a message). */
  transform?: (data: T) => Record<string, unknown>;
}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState<T>(opts.initial);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const payload = {
        ...(opts.transform ? opts.transform(formData) : formData),
        ...getAttribution(),
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
          ...("howHeard" in formData ? { how_heard: formData.howHeard } : {}),
        });
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
