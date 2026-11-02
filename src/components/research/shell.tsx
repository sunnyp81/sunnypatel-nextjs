import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";

const SECTIONS = [
  { href: "/research/", label: "Research" },
  { href: "/research/data/", label: "Data catalogue" },
  { href: "/research/methodology/", label: "Methodology" },
  { href: "/research/editorial-policy/", label: "Editorial policy" },
];

export const headingStyle = { fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" } as const;
export const linkClass =
  "font-semibold text-foreground underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink";

export function ResearchShell({
  current,
  crumbs,
  eyebrow,
  title,
  intro,
  wide = false,
  children,
}: {
  current: string;
  crumbs: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const max = wide ? "max-w-5xl" : "max-w-3xl";
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />

      <div className="relative pb-10 pt-32">
        <div className={`mx-auto ${max} px-6`}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, ...crumbs]} />
          <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-widest text-brand-ink">{eyebrow}</p>
          <h1
            className="text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            {title}
          </h1>
          <div className="mt-5 max-w-2xl space-y-4 text-lg leading-relaxed text-muted-foreground">{intro}</div>
          <nav aria-label="Research section" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    aria-current={s.href === current ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-md border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                      s.href === current
                        ? "border-brand-ink text-brand-ink"
                        : "border-hairline-strong text-foreground hover:border-brand-ink hover:text-brand-ink"
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
      </div>

      <div className={`mx-auto ${max} px-6 py-12`}>{children}</div>

      <Footer />
    </main>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mb-12 scroll-mt-28">
      <h2 id={`${id}-title`} className="text-2xl font-bold text-foreground" style={headingStyle}>
        {title}
      </h2>
      <div className="mt-3 space-y-4 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function NextStep() {
  return (
    <p className="mt-12 border-t border-hairline pt-6 text-sm leading-relaxed text-muted-foreground">
      Want this kind of check on your own site? The free 20-minute diagnosis is at{" "}
      <Link href="/contact/" className={linkClass}>
        /contact/
      </Link>
      .
    </p>
  );
}
