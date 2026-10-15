"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { GradientButton } from "@/components/ui/gradient-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const primaryLinks = [
  { href: "/services/", label: "Services" },
  { href: "/about/", label: "About" },
  { href: "/portfolio/", label: "Portfolio" },
  { href: "/blog/", label: "Blog" },
];

const moreLinks = [
  { href: "/services/seo-consultant-reading/", label: "SEO Reading" },
  { href: "/tools/", label: "Tools" },
  { href: "/contact/", label: "Contact" },
];

const allLinks = [...primaryLinks, ...moreLinks];

const linkBase =
  "group relative rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60";
const underline =
  "pointer-events-none absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-gradient-to-r from-[#5B8AEF] to-[#D79F1E] shadow-[0_0_8px_rgba(91,138,239,0.6)]";

function isCurrent(pathname: string, href: string) {
  if (!pathname.startsWith(href)) return false;
  return !allLinks.some((l) => l.href.length > href.length && pathname.startsWith(l.href));
}

function NavLink({ href, label, current }: { href: string; label: string; current: boolean }) {
  return (
    <a href={href} aria-current={current ? "page" : undefined} className={`${linkBase} ${current ? "text-foreground" : ""}`}>
      {label}
      <span className={`${underline} transition-transform duration-300 ${current ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} aria-hidden="true" />
    </a>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "";
  const moreHasCurrent = moreLinks.some((l) => isCurrent(pathname, l.href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [moreOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-hairline bg-background/70 backdrop-blur-xl backdrop-saturate-[1.8]"
      onKeyDown={(event) => {
        if (event.key === "Escape" && moreOpen) {
          setMoreOpen(false);
          event.stopPropagation();
          return;
        }
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
          event.stopPropagation();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setMoreOpen(false);
        }
      }}
    >
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-[padding] duration-300 ${scrolled ? "py-2.5" : "py-4"}`}>
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-[450] tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <svg width="38" height="38" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0 drop-shadow-[0_4px_10px_rgba(42,91,215,0.18)] [--sp-ring-a:#2a5bd7] [--sp-ring-b:#b07a0a] [--sp-tile-a:#ffffff] [--sp-tile-b:#e8eefb] [--sp-s:#0a1024] [--sp-p:#2a5bd7] dark:drop-shadow-none dark:[--sp-ring-a:#5B8AEF] dark:[--sp-ring-b:#D79F1E] dark:[--sp-tile-a:#11141C] dark:[--sp-tile-b:#07070B] dark:[--sp-s:#F2F4F8] dark:[--sp-p:#5B8AEF]">
            <defs>
              <linearGradient id="spRing" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
                <stop offset="0%" style={{ stopColor: "var(--sp-ring-a)" }}/>
                <stop offset="100%" style={{ stopColor: "var(--sp-ring-b)" }}/>
              </linearGradient>
              <linearGradient id="spTile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--sp-tile-a)" }}/>
                <stop offset="100%" style={{ stopColor: "var(--sp-tile-b)" }}/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="url(#spTile)"/>
            <rect x="1.3" y="1.3" width="97.4" height="97.4" rx="22.7" fill="none" stroke="url(#spRing)" strokeWidth="2.6"/>
            <path d="M33.702 70.034Q29.274 70.034 25.980 68.360Q22.686 66.686 20.769 63.743Q18.852 60.800 18.528 56.912L23.388 56.588Q23.766 59.450 25.062 61.448Q26.358 63.446 28.545 64.472Q30.732 65.498 33.810 65.498Q36.510 65.498 38.400 64.796Q40.290 64.094 41.289 62.744Q42.288 61.394 42.288 59.450Q42.288 57.668 41.451 56.291Q40.614 54.914 38.265 53.753Q35.916 52.592 31.326 51.458Q26.898 50.324 24.279 48.974Q21.660 47.624 20.499 45.680Q19.338 43.736 19.338 40.874Q19.338 37.634 20.877 35.177Q22.416 32.720 25.278 31.343Q28.140 29.966 32.082 29.966Q36.294 29.966 39.318 31.559Q42.342 33.152 44.124 35.906Q45.906 38.660 46.338 42.170L41.478 42.494Q41.154 40.172 39.993 38.363Q38.832 36.554 36.834 35.528Q34.836 34.502 31.974 34.502Q28.410 34.502 26.304 36.203Q24.198 37.904 24.198 40.658Q24.198 42.440 25.035 43.601Q25.872 44.762 28.032 45.653Q30.192 46.544 34.242 47.570Q39.048 48.758 41.883 50.405Q44.718 52.052 45.933 54.212Q47.148 56.372 47.148 59.126Q47.148 62.474 45.420 64.931Q43.692 67.388 40.668 68.711Q37.644 70.034 33.702 70.034" style={{ fill: "var(--sp-s)" }}/>
            <path d="M58.792 69.170L54.148 69.170L54.148 30.830L67.918 30.830Q74.344 30.830 77.908 33.908Q81.472 36.986 81.472 42.440Q81.472 46.112 79.852 48.785Q78.232 51.458 75.208 52.862Q72.184 54.266 67.918 54.266L58.792 54.266L58.792 69.170M58.792 35.366L58.792 49.730L67.918 49.730Q72.238 49.730 74.425 47.894Q76.612 46.058 76.612 42.440Q76.612 38.930 74.425 37.148Q72.238 35.366 67.918 35.366" style={{ fill: "var(--sp-p)" }}/>
          </svg>
          <span>
            Sunny<span className="text-brand-ink">Patel</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-1">
            {primaryLinks.map((link) => (
              <NavLink key={link.href} {...link} current={isCurrent(pathname, link.href)} />
            ))}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                aria-expanded={moreOpen}
                aria-controls="nav-more"
                className={`${linkBase} inline-flex items-center gap-1 ${moreHasCurrent ? "text-foreground" : ""}`}
              >
                More
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                <span className={`${underline} transition-transform duration-300 ${moreHasCurrent ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} aria-hidden="true" />
              </button>
              {moreOpen && (
                <div id="nav-more" className="absolute right-0 top-full mt-3 w-52 rounded-xl border border-hairline-strong bg-surface-1/95 p-1.5 shadow-[var(--elev)] backdrop-blur-xl dark:bg-[#08080d]/95">
                  {moreLinks.map((link) => {
                    const current = isCurrent(pathname, link.href);
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        aria-current={current ? "page" : undefined}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-brand/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                      >
                        {link.label}
                        {current && <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#5B8AEF] to-[#D79F1E]" aria-hidden="true" />}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <ThemeToggle />

          <GradientButton asChild className="min-w-0 px-5 py-2.5 text-sm leading-none">
            <a href="/contact/" data-cta-location="desktop_nav" data-cta-offer="free_20_minute_seo_diagnosis">Free SEO Diagnosis</a>
          </GradientButton>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            ref={menuButton}
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center p-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-t border-hairline bg-background px-6 pt-4 md:hidden" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <ul className="flex flex-col">
            {allLinks.map((link) => {
              const current = isCurrent(pathname, link.href);
              return (
                <li key={link.href} className="border-b border-hairline">
                  <a
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-14 items-center justify-between text-2xl tracking-tight transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 ${current ? "text-foreground" : "text-muted-foreground"}`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {link.label}
                    {current ? (
                      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gold-ink">
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#5B8AEF] to-[#D79F1E]" aria-hidden="true" />
                        Current page
                      </span>
                    ) : (
                      <ArrowRight className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <GradientButton asChild className="min-w-0 w-full text-sm leading-none">
              <a href="/contact/" data-cta-location="mobile_nav" data-cta-offer="free_20_minute_seo_diagnosis" onClick={() => setOpen(false)}>
                Free SEO Diagnosis
              </a>
            </GradientButton>
            <div className="grid grid-cols-2 gap-3">
              <a href="tel:07305523333" data-cta-location="mobile_nav" data-cta-offer="direct_call" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-hairline-strong text-sm font-semibold text-foreground transition-colors hover:bg-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">
                <Phone className="h-4 w-4" aria-hidden="true" /> Call
              </a>
              <a href="https://wa.me/447305523333" target="_blank" rel="noopener noreferrer" data-cta-location="mobile_nav" data-cta-offer="whatsapp_chat" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#128C7E] text-sm font-semibold text-foreground transition-colors hover:bg-[#25D366] hover:text-[#04210f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] dark:border-[#25D366]">
                <FaWhatsapp className="h-4 w-4" aria-hidden="true" /> WhatsApp
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
