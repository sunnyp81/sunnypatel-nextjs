"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

type Status = "idle" | "loading" | "success" | "error";

const contactItems = [
  {
    icon: <Mail className="h-5 w-5 text-[#5B8AEF]" />,
    label: "Email",
    value: "Hello@SunnyPatel.co.uk",
    href: "mailto:Hello@SunnyPatel.co.uk",
  },
  {
    icon: <Phone className="h-5 w-5 text-[#5B8AEF]" />,
    label: "Phone",
    value: "073055 23333",
    href: "tel:07305523333",
  },
  {
    icon: <MapPin className="h-5 w-5 text-[#5B8AEF]" />,
    label: "Location",
    value: "Reading, Berkshire, UK",
    href: null,
  },
];

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

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
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#4c7894]">
              Get in Touch
            </p>
            <h2
              className="mb-6 text-3xl font-bold text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Let&apos;s discuss your project
            </h2>
            <p className="mb-10 leading-relaxed text-muted-foreground">
              Whether you need a full SEO strategy or a quick audit, I&apos;m
              happy to chat. Response time is typically within 24 hours.
            </p>

            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
              {contactItems.map((item, i) => {
                const inner = (
                  <div
                    className={`flex items-center gap-4 px-5 py-4 transition-all duration-200 ${item.href ? "hover:bg-[#5B8AEF]/5" : ""}`}
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
                    {item.href ? (
                      <a href={item.href}>{inner}</a>
                    ) : (
                      inner
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — form with GlowingEffect */}
          <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2">
            <GlowingEffect
              spread={50}
              glow={true}
              disabled={false}
              proximity={80}
              inactiveZone={0.01}
              borderWidth={3}
            />
            <div className="relative rounded-xl border-[0.75px] bg-background p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
              {status === "success" ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#5a922c]/30 bg-[#5a922c]/10">
                    <CheckCircle2 className="h-8 w-8 text-[#5a922c]" />
                  </div>
                  <h3
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Message sent!
                  </h3>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Thanks for reaching out. I&apos;ll get back to you within 24
                    hours.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-2 text-sm text-[#5B8AEF] transition-colors hover:text-[#5B8AEF]/80"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    {
                      id: "name",
                      label: "Name",
                      type: "text",
                      placeholder: "Your full name",
                      required: true,
                    },
                    {
                      id: "email",
                      label: "Email",
                      type: "email",
                      placeholder: "you@company.com",
                      required: true,
                    },
                    {
                      id: "phone",
                      label: "Phone",
                      type: "tel",
                      placeholder: "07xxx xxx xxx",
                      required: false,
                    },
                  ].map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="mb-2 block text-sm font-medium text-muted-foreground"
                      >
                        {field.label}
                        {field.required && (
                          <span className="ml-1 text-[#5B8AEF]">*</span>
                        )}
                      </label>
                      <input
                        type={field.type}
                        id={field.id}
                        value={formData[field.id as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={status === "loading"}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  ))}

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                      How can I help?
                      <span className="ml-1 text-[#5B8AEF]">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project and goals..."
                      required
                      disabled={status === "loading"}
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-4 text-sm font-semibold text-background transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
