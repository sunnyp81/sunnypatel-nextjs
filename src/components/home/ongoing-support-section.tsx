import Link from "next/link";

const workLog = [
  "Clarified the scope of the AI search optimisation service",
  "Corrected claims that were not supported by the available evidence",
  "Added contextual links between relevant service pages",
  "Improved enquiry attribution and recorded checks and review",
];

const first90Days = [
  {
    period: "Month 1",
    description: "Establish a baseline, review access and data, and agree the first priorities.",
  },
  {
    period: "Month 2",
    description:
      "Select and implement technical or content work within the agreed scope.",
  },
  {
    period: "Month 3",
    description:
      "Review changes alongside search and enquiry data, then agree the next priorities.",
  },
];

export function OngoingSupportSection() {
  return (
    <section
      id="ongoing-support"
      aria-labelledby="ongoing-support-heading"
      className="border-t border-hairline bg-surface-1 py-20 md:py-24 dark:border-white/[0.05] dark:bg-transparent"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-ink">
            Ongoing SEO support
          </p>
          <h2
            id="ongoing-support-heading"
            className="text-2xl font-bold text-foreground md:text-3xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Ongoing SEO work, handled directly by me
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground dark:text-white/70">
            Choose hands-on implementation or advice for your team to deliver. Before an
            engagement starts, we agree the tasks, allowance, owners, costs and approvals.
          </p>
        </div>

        <div className="mt-9 grid gap-8 border-y border-hairline py-7 md:grid-cols-2 md:gap-12 dark:border-white/[0.08]">
          <article>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">
              Implementation
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">From £1,500 per month</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground dark:text-white/70">
              I plan and carry out the agreed SEO work for your site.
            </p>
            <Link
              href="/contact/?support=ongoing_implementation#contact"
              data-cta-location="homepage_ongoing_support"
              data-cta-offer="ongoing_implementation"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink dark:focus-visible:ring-white/70"
            >
              Discuss implementation
            </Link>
          </article>

          <article className="border-t border-hairline pt-7 md:border-l md:border-t-0 md:pl-12 md:pt-0 dark:border-white/[0.08]">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground dark:text-white/70">
              Advisory
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">£600 per month, 4 hours</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground dark:text-white/70">
              I provide direction and review. You or your team carry out the work. A single
              £200 session is also available.
            </p>
            <Link
              href="/contact/?support=ongoing_advice#contact"
              data-cta-location="homepage_ongoing_support"
              data-cta-offer="ongoing_advice"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:bg-brand/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink dark:border-white/[0.16] dark:hover:bg-white/[0.04] dark:focus-visible:ring-white/70"
            >
              Discuss advisory support
            </Link>
          </article>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h3 className="text-lg font-semibold text-foreground">An illustrative first 90 days</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/70">
              This is an illustrative sequence. Actual priorities depend on the site and
              agreed scope.
            </p>
            <ol className="mt-5 space-y-4 border-l border-hairline-strong pl-4 dark:border-white/[0.12]">
              {first90Days.map((step) => (
                <li key={step.period} className="relative">
                  <span className="absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
                  <p className="text-sm font-semibold text-foreground">{step.period}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-white/70">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t border-hairline pt-7 md:border-l md:border-t-0 md:pl-8 md:pt-0 dark:border-white/[0.08]">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">
              Sunny Patel&apos;s own site, 2 to 3 October 2026
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              A recorded piece of delivery
            </h3>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground dark:text-white/70">
              {workLog.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-muted-foreground dark:text-white/60">
              This was work on sunnypatel.co.uk, not a client engagement. No lead or revenue
              uplift has been measured. The updated{" "}
              <Link
                href="/services/seo-consulting/"
                className="text-brand-ink underline underline-offset-2 hover:decoration-2"
              >
                consulting page
              </Link>{" "}
              and{" "}
              <Link
                href="/services/ai-search-optimisation/"
                className="text-brand-ink underline underline-offset-2 hover:decoration-2"
              >
                AI search page
              </Link>{" "}
              are inspectable examples. The{" "}
              <Link
                href="/blog/ai-referral-traffic-study/"
                className="text-brand-ink underline underline-offset-2 hover:decoration-2"
              >
                AI referral traffic study
              </Link>{" "}
              reports separate portfolio analytics, not campaign impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
