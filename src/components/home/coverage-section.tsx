import { CoverageMap } from "@/components/services/CoverageMap";
import { GlowCard } from "@/components/ui/glow-card";
import { BERKSHIRE_TOWNS } from "@/data/berkshire-towns";

export function CoverageSection() {
  return (
    <section
      id="coverage"
      aria-labelledby="coverage-heading"
      className="border-t border-hairline bg-surface-1 py-24 md:py-32 dark:border-white/[0.05] dark:bg-transparent"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div className="min-w-0">
          <h2
            id="coverage-heading"
            className="text-2xl font-bold text-foreground md:text-3xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Reading-based, in person across Berkshire, remote UK-wide
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground dark:text-white/70">
            I&apos;m based in Reading and meet clients face to face anywhere across Berkshire.
            Outside that area I work the same way, just remotely, so location isn&apos;t a reason
            to rule this out.
          </p>

          <p id="coverage-towns-heading" className="mt-8 text-[13.5px] font-semibold text-brand-ink">
            Berkshire towns covered
          </p>
          <ul
            aria-labelledby="coverage-towns-heading"
            className="mt-3 grid grid-cols-2 border-t border-hairline sm:grid-cols-3 dark:border-white/[0.08]"
          >
            {BERKSHIRE_TOWNS.map((town) => {
              const name = town.isBase ? "Reading (base)" : town.name;
              const dot = town.isBase
                ? "bg-gold-ink dark:shadow-[0_0_8px_rgba(215,159,30,0.8)]"
                : "bg-brand-ink dark:shadow-[0_0_8px_rgba(91,138,239,0.8)]";
              return (
                <li key={town.name} className="border-b border-hairline dark:border-white/[0.08]">
                  {town.slug ? (
                    <a
                      href={`/services/${town.slug}/`}
                      className="group flex min-h-11 items-center gap-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                      <span className="underline-offset-4 group-hover:underline">{name}</span>
                    </a>
                  ) : (
                    <span className="flex min-h-11 items-center gap-2.5 py-2 text-sm text-foreground/80">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                      {name}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground dark:text-white/70">
            Anywhere else in the UK: the same work, remotely.
          </p>

          <p className="mt-6 text-sm">
            <a
              href="/services/seo-berkshire/"
              className="font-medium text-brand-ink underline-offset-4 hover:underline"
            >
              See Berkshire SEO services and pricing
            </a>
          </p>
        </div>

        <GlowCard className="min-w-0">
          <CoverageMap
            hideList
            caption="Towns I cover across Berkshire. Positions approximate. Remote work available UK-wide."
          />
        </GlowCard>
      </div>
    </section>
  );
}
