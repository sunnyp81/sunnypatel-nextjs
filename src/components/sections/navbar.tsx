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
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0">
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
            <path d="M30.725 77.825Q24.575 77.825 20 75.500Q15.425 73.175 12.762 69.088Q10.100 65 9.650 59.600L16.400 59.150Q16.925 63.125 18.725 65.900Q20.525 68.675 23.562 70.100Q26.600 71.525 30.875 71.525Q34.625 71.525 37.250 70.550Q39.875 69.575 41.262 67.700Q42.650 65.825 42.650 63.125Q42.650 60.650 41.487 58.737Q40.325 56.825 37.063 55.213Q33.800 53.600 27.425 52.025Q21.275 50.450 17.637 48.575Q14 46.700 12.387 44Q10.775 41.300 10.775 37.325Q10.775 32.825 12.912 29.413Q15.050 26 19.025 24.087Q23 22.175 28.475 22.175Q34.325 22.175 38.525 24.388Q42.725 26.600 45.200 30.425Q47.675 34.250 48.275 39.125L41.525 39.575Q41.075 36.350 39.462 33.837Q37.850 31.325 35.075 29.900Q32.300 28.475 28.325 28.475Q23.375 28.475 20.450 30.837Q17.525 33.200 17.525 37.025Q17.525 39.500 18.688 41.113Q19.850 42.725 22.850 43.962Q25.850 45.200 31.475 46.625Q38.150 48.275 42.087 50.563Q46.025 52.850 47.712 55.850Q49.400 58.850 49.400 62.675Q49.400 67.325 47 70.737Q44.600 74.150 40.400 75.987Q36.200 77.825 30.725 77.825" fill="#F2F4F8"/>
            <path d="M58.850 76.625L52.400 76.625L52.400 23.375L71.525 23.375Q80.450 23.375 85.400 27.650Q90.350 31.925 90.350 39.500Q90.350 44.600 88.100 48.313Q85.850 52.025 81.650 53.975Q77.450 55.925 71.525 55.925L58.850 55.925L58.850 76.625M58.850 29.675L58.850 49.625L71.525 49.625Q77.525 49.625 80.563 47.075Q83.600 44.525 83.600 39.500Q83.600 34.625 80.563 32.150Q77.525 29.675 71.525 29.675" fill="#5B8AEF"/>
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
