"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import GradientMenu from "@/components/ui/gradient-menu";

export function Navbar() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl backdrop-saturate-[1.8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <a
            href="/"
            className="text-xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sunny<span className="text-[#5B8AEF]">Patel</span>
          </a>

          {/* Desktop gradient pill nav */}
          <div className="hidden md:flex">
            <GradientMenu />
          </div>

          {/* Desktop CTA */}
          <div className="relative hidden rounded-xl border border-[#5B8AEF]/25 bg-[#5B8AEF]/8 transition-transform duration-200 hover:scale-[1.05] active:scale-[0.97] md:inline-flex">
            <GlowingEffect
              spread={35}
              glow={true}
              disabled={false}
              proximity={80}
              inactiveZone={0.01}
              borderWidth={1.5}
            />
            <a
              href="/contact"
              className="relative px-5 py-2.5 text-sm font-semibold text-[#5B8AEF] transition-colors duration-200 hover:text-[#7aa6f5]"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile bottom dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pt-3 bg-background/80 backdrop-blur-xl border-t border-white/[0.06] md:hidden">
        <GradientMenu size="sm" />
      </div>
    </>
  );
}
