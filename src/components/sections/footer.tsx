import { Linkedin } from "lucide-react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050507]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <a
              href="/"
              className="text-xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Sunny<span className="text-[#5B8AEF]">Patel</span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground" style={{ lineHeight: 1.7 }}>
              SEO consultant and AI strategist helping UK businesses grow
              through entity-based content networks.
            </p>
            <a
              href="https://www.linkedin.com/in/sunny-patel-co-uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-[#5B8AEF]"
            >
              <Linkedin className="h-5 w-5" />
              LinkedIn
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground/80"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground/80"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-of-use"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground/80"
                >
                  Terms of Use
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground/50">
            &copy; 2026 Sunny Patel. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/30">
            SEO & AI Consultant, Reading, Berkshire
          </p>
        </div>
      </div>
    </footer>
  );
}
