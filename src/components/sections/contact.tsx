"use client";

import { Mail, Phone, MapPin } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
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
          {/* Left */}
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#4c7894]">
              Get in Touch
            </p>
            <h2
              className="mb-6 text-3xl font-bold text-foreground md:text-4xl"
              style={{
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.03em",
              }}
            >
              Let&apos;s discuss your project
            </h2>
            <p className="mb-10 leading-relaxed text-muted-foreground">
              Whether you need a full SEO strategy or a quick audit, I&apos;m
              happy to chat. Response time is typically within 24 hours.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <Mail className="h-5 w-5 text-[#5B8AEF]" />,
                  label: "Email",
                  value: "Hello@SunnyPatel.co.uk",
                  borderColor: "border-[#5B8AEF]/20",
                  bgColor: "bg-[#5B8AEF]/10",
                },
                {
                  icon: <Phone className="h-5 w-5 text-[#4c7894]" />,
                  label: "Phone",
                  value: "073055 23333",
                  borderColor: "border-[#4c7894]/20",
                  bgColor: "bg-[#4c7894]/10",
                },
                {
                  icon: <MapPin className="h-5 w-5 text-[#5a922c]" />,
                  label: "Location",
                  value: "Reading, Berkshire, UK",
                  borderColor: "border-[#5a922c]/20",
                  bgColor: "bg-[#5a922c]/10",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.borderColor} ${item.bgColor}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="font-medium text-foreground">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div>
            <form className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl">
              <div className="space-y-5">
                {[
                  { id: "name", label: "Name", type: "text", placeholder: "Your full name" },
                  { id: "email", label: "Email", type: "email", placeholder: "you@company.com" },
                  { id: "phone", label: "Phone", type: "tel", placeholder: "07xxx xxx xxx" },
                ].map((field) => (
                  <div key={field.id}>
                    <label
                      htmlFor={field.id}
                      className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-muted-foreground"
                  >
                    How can I help?
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tell me about your project and goals..."
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-[#5B8AEF]/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-foreground px-6 py-4 text-sm font-semibold text-background transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
