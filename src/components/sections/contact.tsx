"use client";

import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { FormField, FormSelect, FormError, FormSuccess } from "@/components/ui/form-field";
import { useLeadForm } from "@/lib/use-lead-form";

const HOW_HEARD_OPTIONS = [
  { value: "google", label: "Google search" },
  { value: "ai_assistant", label: "ChatGPT, Perplexity, or another AI assistant" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Referral or word of mouth" },
  { value: "directory", label: "A directory listing (Clutch, The Manifest, etc.)" },
  { value: "existing_client", label: "I'm an existing client" },
  { value: "other", label: "Other" },
];

const contactItems = [
  {
    icon: <Mail className="h-5 w-5 text-brand" />,
    label: "Email",
    value: "Hello@SunnyPatel.co.uk",
    href: "mailto:Hello@SunnyPatel.co.uk",
  },
  {
    icon: <Phone className="h-5 w-5 text-brand" />,
    label: "Phone",
    value: "07305 523333",
    href: "tel:07305523333",
  },
  {
    icon: <MapPin className="h-5 w-5 text-brand" />,
    label: "Location",
    value: "Berkshire, UK (Remote & In-Person)",
    href: null,
  },
];

export function Contact() {
  const { status, setStatus, errorMsg, formData, handleChange, handleSubmit } =
    useLeadForm({
      initial: { name: "", email: "", phone: "", message: "", howHeard: "" },
      eventCategory: "contact",
      eventLabel: "contact_form",
    });

  return (
    <section id="contact" className="relative overflow-hidden py-24 md:py-32">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 15%, transparent 50%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 15%, transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left — info */}
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-teal">
              Free SEO Diagnosis
            </p>
            <h2
              className="mb-6 text-3xl font-bold text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Start with the biggest search problem
            </h2>
            <p className="mb-10 leading-relaxed text-muted-foreground">
              Request a free 20-minute diagnosis and I&apos;ll help identify the most useful next step. For a full documented review, choose the £495 SEO audit.
            </p>

            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
              {contactItems.map((item, i) => {
                const inner = (
                  <div
                    className={`flex items-center gap-4 px-5 py-4 transition-colors duration-200 ${item.href ? "hover:bg-brand/5" : ""}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {item.label}
                      </div>
                      <div className="font-medium text-foreground">
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
                return (
                  <div key={item.label}>
                    {i > 0 && <div className="border-t border-white/[0.06]" />}
                    {item.href ? <a href={item.href}>{inner}</a> : inner}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — form */}
          <GlowCard spread={50} proximity={80}>
            <div className="relative rounded-xl border-[0.75px] bg-background p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
              {status === "success" ? (
                <FormSuccess
                  message="Your diagnosis request is with me. I'll reply personally within one working day."
                  onReset={() => setStatus("idle")}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <FormField
                    id="name"
                    label="Name"
                    placeholder="Your full name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  />
                  <FormField
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  />
                  <FormField
                    id="phone"
                    label="Phone"
                    type="tel"
                    placeholder="07xxx xxx xxx"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  />
                  <FormSelect
                    id="howHeard"
                    label="How did you hear about me?"
                    options={HOW_HEARD_OPTIONS}
                    required
                    value={formData.howHeard}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  />
                  <FormField
                    id="message"
                    label="How can I help?"
                    placeholder="Tell me about your project and goals..."
                    required
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  />

                  <FormError message={errorMsg} />

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    aria-busy={status === "loading"}
                    data-cta-location="homepage_contact"
                    data-cta-offer="free_20_minute_seo_diagnosis"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-4 text-sm font-semibold text-background transition-[transform,opacity] duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Request My Free Diagnosis"
                    )}
                  </button>
                </form>
              )}
            </div>
          </GlowCard>
        </div>
      </div>
    </section>
  );
}
