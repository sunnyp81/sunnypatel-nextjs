import { Linkedin, Mail, Phone } from "lucide-react";

const links = [
  { href: "/services/", label: "Services" },
  { href: "/services/seo-consultant-reading/", label: "SEO Reading" },
  { href: "/services/seo-berkshire/", label: "SEO Berkshire" },
  { href: "/tools/", label: "Free SEO Tools" },
  { href: "/about/", label: "About" },
  { href: "/portfolio/", label: "Portfolio" },
  { href: "/blog/", label: "Blog" },
  { href: "/contact/", label: "Contact" },
  { href: "https://www.seo.associates/", label: "SEO.Associates" },
];

const serviceLinks = [
  { href: "/services/topical-authority/", label: "Topical Authority" },
  { href: "/services/technical-seo-audit/", label: "Technical SEO Audit" },
  { href: "/services/seo-consulting/", label: "SEO Consulting" },
  { href: "/services/content-briefs/", label: "Content Strategy" },
  { href: "/services/google-algorithm-update-recovery/", label: "Revenue Recovery" },
  { href: "/services/local-seo/", label: "Local SEO" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050507]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
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
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="tel:07305523333"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-[#5B8AEF]"
              >
                <Phone className="h-4 w-4" />
                07305 523333
              </a>
              <a
                href="mailto:hello@sunnypatel.co.uk"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-[#5B8AEF]"
              >
                <Mail className="h-4 w-4" />
                hello@sunnypatel.co.uk
              </a>
              <a
                href="https://www.linkedin.com/in/sunny-patel-co-uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-[#5B8AEF]"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </div>
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

          {/* Services */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
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

          {/* Free Tools */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Free Tools
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/tools/website-grader/", label: "Website Grader" },
                { href: "/tools/speed-checker/", label: "Speed Checker" },
                { href: "/tools/keyword-scraper/", label: "Keyword Scraper" },
                { href: "/tools/schema-generator/", label: "Schema Generator" },
                { href: "/tools/broken-links/", label: "Broken Link Checker" },
                { href: "/tools/", label: "View All 20 Tools" },
              ].map((link) => (
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
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground/50">
              &copy; 2026 Sunny Patel. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/30">
              Part of <span className="text-muted-foreground/50">ND Media Ltd</span> &mdash; Company No. 10784524
            </p>
          </div>
          <div className="flex gap-4">
            <a href="/privacy-policy/" className="text-xs text-muted-foreground/30 transition-colors hover:text-muted-foreground/60">Privacy Policy</a>
            <a href="/terms-of-use/" className="text-xs text-muted-foreground/30 transition-colors hover:text-muted-foreground/60">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
