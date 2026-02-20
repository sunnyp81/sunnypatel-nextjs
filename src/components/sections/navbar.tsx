"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

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
          className="font-[var(--font-heading)] text-xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Sunny<span className="text-[#5B8AEF]">Patel</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="/contact"
          className="hidden rounded-xl border border-[#5B8AEF]/20 bg-[#5B8AEF]/10 px-5 py-2.5 text-sm font-medium text-[#5B8AEF] transition-all duration-300 hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/20 hover:shadow-[0_0_20px_rgba(91,138,239,0.15)] md:inline-flex"
        >
          Get a Quote
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-background/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/contact"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-[#5B8AEF]/20 bg-[#5B8AEF]/10 px-5 py-2.5 text-center text-sm font-medium text-[#5B8AEF]"
            >
              Get a Quote
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
