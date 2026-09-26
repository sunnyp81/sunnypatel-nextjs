import dynamic from "next/dynamic";
import Link from "next/link";

const WebsiteGrader = dynamic(() => import("@/app/tools/website-grader/WebsiteGrader"), {
  loading: () => <GraderSkeleton />,
});

function GraderSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div className="flex gap-3">
        <div className="h-11 flex-1 rounded-lg bg-hairline-strong/40 dark:bg-white/[0.05]" />
        <div className="h-11 w-40 rounded-lg bg-hairline-strong/40 dark:bg-white/[0.05]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-hairline bg-surface-1 dark:bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}

const relatedTools = [
  { name: "Website Speed Checker", href: "/tools/speed-checker/" },
  { name: "SSL Certificate Checker", href: "/tools/ssl-checker/" },
  { name: "Schema Markup Generator", href: "/tools/schema-generator/" },
];

export function FreeToolSection() {
  return (
    <section
      id="free-tool"
      aria-labelledby="free-tool-heading"
      className="relative border-t border-hairline bg-surface-1 py-24 md:py-32 dark:border-white/[0.05] dark:bg-transparent"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-ink">
            Free Tool
          </p>
          <h2
            id="free-tool-heading"
            className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            How does your website actually score?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            I built this free grader to check the same on-page SEO, mobile page speed, security
            headers and content signals I look at for clients. Enter a URL below and get an
            instant A to F grade with specific fixes, no email required.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface-2 p-6 shadow-[var(--elev)] sm:p-8 dark:border-white/[0.08] dark:bg-black/20 dark:shadow-none dark:backdrop-blur-sm">
          <WebsiteGrader compact />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/tools/website-grader/"
            className="text-brand-ink underline-offset-4 hover:underline"
          >
            Open the full Website Grader report
          </Link>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-hairline pt-6 dark:border-white/[0.06]">
          <span className="text-sm text-muted-foreground">More free tools:</span>
          {relatedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-full border border-hairline bg-wash px-4 py-1.5 text-sm text-ink-faint transition-colors hover:border-hairline-strong hover:text-ink-soft dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/65 dark:hover:border-white/[0.16] dark:hover:text-white/80"
            >
              {tool.name}
            </Link>
          ))}
          <Link
            href="/tools/"
            className="rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm font-medium text-brand-ink transition-colors hover:border-brand/40 hover:bg-brand/10"
          >
            Browse all free tools
          </Link>
        </div>
      </div>
    </section>
  );
}
