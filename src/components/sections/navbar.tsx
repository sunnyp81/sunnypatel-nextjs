"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl backdrop-saturate-[1.8]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Sunny<span className="text-[#5B8AEF]">Patel</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-sm text-muted-foreground shadow-[0_0_8px_rgba(91,138,239,0.07)] transition-all duration-300 hover:border-[#5B8AEF]/30 hover:bg-[#5B8AEF]/[0.06] hover:text-foreground hover:shadow-[0_0_20px_rgba(91,138,239,0.28)] hover:scale-[1.04]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <GradientButton asChild className="min-w-0 px-5 py-2.5 text-sm leading-none">
            <a href="/contact">Get a Quote</a>
          </GradientButton>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-background/95 backdrop-blur-xl px-6 py-5 md:hidden">
          <div className="flex flex-col gap-1 mb-5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/[0.04] px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:border-[#5B8AEF]/25 hover:bg-[#5B8AEF]/[0.05] hover:text-foreground hover:shadow-[0_0_16px_rgba(91,138,239,0.2)]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <GradientButton asChild className="min-w-0 w-full text-sm leading-none">
            <a href="/contact" onClick={() => setOpen(false)}>
              Get a Quote
            </a>
          </GradientButton>
        </div>
      )}
    </nav>
  );
}
