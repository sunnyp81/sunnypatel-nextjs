"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

const links = [
  { href: "/services/", label: "Services" },
  { href: "/services/seo-consultant-reading/", label: "SEO Reading" },
  { href: "/about/", label: "About" },
  { href: "/portfolio/", label: "Portfolio" },
  { href: "/tools/", label: "Tools" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl backdrop-saturate-[1.8]"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
          event.stopPropagation();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-[450] tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <svg width="38" height="38" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0">
            <defs>
              <linearGradient id="spRing" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
                <stop offset="0%" stopColor="#5B8AEF"/>
                <stop offset="100%" stopColor="#D79F1E"/>
              </linearGradient>
              <linearGradient id="spTile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#11141C"/>
                <stop offset="100%" stopColor="#07070B"/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="url(#spTile)"/>
            <rect x="1.3" y="1.3" width="97.4" height="97.4" rx="22.7" fill="none" stroke="url(#spRing)" strokeWidth="2.6"/>
            <path d="M33.702 70.034Q29.274 70.034 25.980 68.360Q22.686 66.686 20.769 63.743Q18.852 60.800 18.528 56.912L23.388 56.588Q23.766 59.450 25.062 61.448Q26.358 63.446 28.545 64.472Q30.732 65.498 33.810 65.498Q36.510 65.498 38.400 64.796Q40.290 64.094 41.289 62.744Q42.288 61.394 42.288 59.450Q42.288 57.668 41.451 56.291Q40.614 54.914 38.265 53.753Q35.916 52.592 31.326 51.458Q26.898 50.324 24.279 48.974Q21.660 47.624 20.499 45.680Q19.338 43.736 19.338 40.874Q19.338 37.634 20.877 35.177Q22.416 32.720 25.278 31.343Q28.140 29.966 32.082 29.966Q36.294 29.966 39.318 31.559Q42.342 33.152 44.124 35.906Q45.906 38.660 46.338 42.170L41.478 42.494Q41.154 40.172 39.993 38.363Q38.832 36.554 36.834 35.528Q34.836 34.502 31.974 34.502Q28.410 34.502 26.304 36.203Q24.198 37.904 24.198 40.658Q24.198 42.440 25.035 43.601Q25.872 44.762 28.032 45.653Q30.192 46.544 34.242 47.570Q39.048 48.758 41.883 50.405Q44.718 52.052 45.933 54.212Q47.148 56.372 47.148 59.126Q47.148 62.474 45.420 64.931Q43.692 67.388 40.668 68.711Q37.644 70.034 33.702 70.034" fill="#F2F4F8"/>
            <path d="M58.792 69.170L54.148 69.170L54.148 30.830L67.918 30.830Q74.344 30.830 77.908 33.908Q81.472 36.986 81.472 42.440Q81.472 46.112 79.852 48.785Q78.232 51.458 75.208 52.862Q72.184 54.266 67.918 54.266L58.792 54.266L58.792 69.170M58.792 35.366L58.792 49.730L67.918 49.730Q72.238 49.730 74.425 47.894Q76.612 46.058 76.612 42.440Q76.612 38.930 74.425 37.148Q72.238 35.366 67.918 35.366" fill="#5B8AEF"/>
          </svg>
          <span>
            Sunny<span className="text-brand">Patel</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-sm text-muted-foreground shadow-[0_0_8px_rgba(91,138,239,0.07)] transition-[border-color,background-color,color,box-shadow,transform] duration-300 hover:scale-[1.04] hover:border-brand/30 hover:bg-brand/[0.06] hover:text-foreground hover:shadow-[0_0_20px_rgba(91,138,239,0.28)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <GradientButton asChild className="min-w-0 px-5 py-2.5 text-sm leading-none">
            <a href="/contact/" data-cta-location="desktop_nav" data-cta-offer="free_20_minute_seo_diagnosis">Free SEO Diagnosis</a>
          </GradientButton>
        </div>

        <button
          ref={menuButton}
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 items-center justify-center p-2 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-white/[0.06] bg-background/95 backdrop-blur-xl px-6 py-5 md:hidden">
          <div className="flex flex-col gap-1 mb-5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/[0.04] px-3 py-2.5 text-sm text-muted-foreground transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-brand/25 hover:bg-brand/[0.05] hover:text-foreground hover:shadow-[0_0_16px_rgba(91,138,239,0.2)]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          <GradientButton asChild className="min-w-0 w-full text-sm leading-none">
            <a href="/contact/" data-cta-location="mobile_nav" data-cta-offer="free_20_minute_seo_diagnosis" onClick={() => setOpen(false)}>
              Free SEO Diagnosis
            </a>
          </GradientButton>
        </div>
      )}
    </nav>
  );
}
