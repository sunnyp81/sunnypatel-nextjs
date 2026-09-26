import { CoverageMap } from "@/components/services/CoverageMap";

export function CoverageSection() {
  return (
    <section
      id="coverage"
      aria-labelledby="coverage-heading"
      className="border-t border-hairline bg-surface-1 py-24 md:py-32 dark:border-white/[0.05] dark:bg-transparent"
    >
      <div className="mx-auto max-w-4xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-ink">
          Where I work
        </p>
        <h2
          id="coverage-heading"
          className="text-2xl font-bold text-foreground md:text-3xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          Reading-based, in person across Berkshire, remote UK-wide
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-white/70">
          I&apos;m based in Reading and meet clients face to face anywhere across Berkshire.
          Outside that area I work the same way, just remotely, so location isn&apos;t a reason
          to rule this out.
        </p>

        <CoverageMap
          caption="Towns I cover across Berkshire. Positions approximate. Remote work available UK-wide."
          listHeading="Berkshire towns covered"
        />

        <p className="mt-6 text-sm">
          <a
            href="/services/seo-berkshire/"
            className="text-brand-ink underline-offset-4 hover:underline"
          >
            See Berkshire SEO services and pricing
          </a>
        </p>
      </div>
    </section>
  );
}
