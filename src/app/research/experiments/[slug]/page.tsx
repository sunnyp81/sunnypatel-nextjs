import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { GradientButton } from "@/components/ui/gradient-button";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { Field, StatusChips } from "@/components/research/experiment-bits";
import { formatDate } from "@/data/research-catalogue";
import { EXPERIMENTS, experimentBySlug, isObservational, lastUpdatedOf, type Experiment } from "@/data/experiments";

const SITE_URL = "https://sunnypatel.co.uk";
const HUB_URL = `${SITE_URL}/research/experiments/`;
const headingStyle = { fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" } as const;
const linkCls =
  "underline decoration-hairline-strong underline-offset-4 hover:text-brand-ink focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink";

export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export const dynamicParams = false;

function describe(e: Experiment) {
  const h = e.hypothesis.trim();
  if (h.length <= 159) return h;
  const first = h.slice(0, h.indexOf(". ") + 1);
  if (first.length > 20 && first.length <= 159) return first;
  const cut = h.slice(0, 156);
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = experimentBySlug(slug);
  if (!e) return {};
  return buildMetadata({
    title: `${e.id}: ${e.title}`,
    description: describe(e),
    path: `/research/experiments/${e.slug}`,
  });
}

const short = (t: string) => t.length <= 110 && !t.includes(". ");

function Time({ iso }: { iso: string }) {
  return <time dateTime={iso}>{formatDate(iso)}</time>;
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mb-10 scroll-mt-28">
      <h2 id={`${id}-title`} className="text-xl font-bold text-foreground md:text-2xl" style={headingStyle}>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function ExperimentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = experimentBySlug(slug);
  if (!e) notFound();

  const i = EXPERIMENTS.findIndex((x) => x.id === e.id);
  const prev = EXPERIMENTS[i - 1];
  const next = EXPERIMENTS[i + 1];
  const url = `${HUB_URL}${e.slug}/`;

  const schema = schemaGraph(
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: `${e.id}: ${e.title}`,
      description: describe(e),
      inLanguage: "en-GB",
      dateModified: lastUpdatedOf(e),
      isPartOf: { "@id": `${HUB_URL}#webpage` },
      author: { "@id": `${SITE_URL}/#person` },
    },
    breadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Research", url: `${SITE_URL}/research/` },
      { name: "SEO experiments", url: HUB_URL },
      { name: e.id, url },
    ])
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

      <main className="relative min-h-screen bg-background">
        <Navbar />
        <div id="main-content" tabIndex={-1} />

        <div className="relative pb-10 pt-32">
          <div className="mx-auto max-w-3xl px-6">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Research", href: "/research/" },
                { label: "SEO experiments", href: "/research/experiments/" },
                { label: e.id },
              ]}
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{e.id}</span>
              <StatusChips e={e} />
            </div>
            <h1
              className="mt-3 text-3xl font-bold text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              {e.title}
            </h1>

            <dl className="mt-8 rounded-md border border-hairline p-5 md:p-6">
              <Field label="Site">{e.site}</Field>
              {e.unit && <Field label="Unit">{e.unit}</Field>}
              <Field label="Hypothesis">{e.hypothesis}</Field>
              <Field label="Primary metric">{e.metric}</Field>
              <Field label="Registered">
                <Time iso={e.registeredDate ?? e.updates[0].date} />
              </Field>
              {isObservational(e) ? (
                <Field label="Type">Observational check. Nothing on the site was changed.</Field>
              ) : (
                <Field label="Change made">{e.changeDate ? <Time iso={e.changeDate} /> : "Not yet"}</Field>
              )}
              {e.comparison && short(e.comparison) && <Field label="Comparison">{e.comparison}</Field>}
              {e.window && short(e.window) && <Field label="Window">{e.window}</Field>}
              {e.power && short(e.power) && <Field label="Power">{e.power}</Field>}
              {e.readbackDate && (
                <Field label="Next readback">
                  <Time iso={e.readbackDate} />
                </Field>
              )}
            </dl>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-hairline" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-12">
          {(e.arms || e.design || (e.change && !isObservational(e))) && (
            <Block id="design" title="Design and arms">
              {e.change && !isObservational(e) && (
                <p>
                  <span className="font-semibold text-foreground">Change made: </span>
                  {e.change}
                </p>
              )}
              {e.design && <p>{e.design}</p>}
              {e.arms && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                    <caption className="sr-only">Arms of {e.id}</caption>
                    <thead>
                      <tr className="border-b border-hairline-strong">
                        <th scope="col" className="py-2 pr-4 font-semibold text-foreground">Arm</th>
                        <th scope="col" className="py-2 font-semibold text-foreground">What happens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.arms.map((a) => (
                        <tr key={a.name} className="border-b border-hairline align-top">
                          <th scope="row" className="py-2 pr-4 font-semibold text-foreground">{a.name}</th>
                          <td className="py-2">{a.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Block>
          )}

          {e.baseline && (
            <Block id="baseline" title="Baseline">
              <p>{e.baseline}</p>
            </Block>
          )}

          {e.comparison && !short(e.comparison) && (
            <Block id="comparison" title="Comparison">
              <p>{e.comparison}</p>
            </Block>
          )}

          {e.window && !short(e.window) && (
            <Block id="window" title="Window">
              <p>{e.window}</p>
            </Block>
          )}

          {e.power && !short(e.power) && (
            <Block id="power" title="Power">
              <p>{e.power}</p>
            </Block>
          )}

          {e.limits && (
            <Block id="limits" title="Limits">
              <p>{e.limits}</p>
            </Block>
          )}

          {e.priorWork && e.priorWork.length > 0 && (
            <Block id="prior-work" title="Prior work">
              <ul className="list-disc space-y-2 pl-5">
                {e.priorWork.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className={`${linkCls} text-foreground`}>
                      {p.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    {p.note ? `: ${p.note}` : ""}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {e.publishable && (
            <Block id="publish" title="What I will publish">
              <p>{e.publishable}</p>
            </Block>
          )}

          <Block id="outcome" title="Outcome">
            <p>{e.outcome}</p>
            {e.note && <p>{e.note}</p>}
            {e.result && (
              <dl className="grid gap-1 rounded-md border border-hairline p-4 text-sm sm:grid-cols-[7rem_1fr]">
                <dt className="font-semibold text-foreground">Metric</dt>
                <dd className="m-0">{e.result.metric}</dd>
                <dt className="font-semibold text-foreground">Baseline</dt>
                <dd className="m-0">{e.result.baseline}</dd>
                <dt className="font-semibold text-foreground">After</dt>
                <dd className="m-0">{e.result.after}</dd>
                <dt className="font-semibold text-foreground">Sample</dt>
                <dd className="m-0">{e.result.n}</dd>
                <dt className="font-semibold text-foreground">Verdict</dt>
                <dd className="m-0">{e.result.verdict}</dd>
              </dl>
            )}
          </Block>

          <Block id="log" title="Log">
            <ol className="m-0 list-none space-y-1 p-0 text-sm">
              {e.updates.map((u) => (
                <li key={u.date + u.note}>
                  <time dateTime={u.date} className="font-mono text-muted-foreground">
                    {formatDate(u.date)}
                  </time>
                  {": "}
                  {u.note}
                </li>
              ))}
            </ol>
          </Block>

          {e.evidence && (
            <Block id="evidence" title="Evidence">
              <p>
                <Link href={e.evidence.href} className={`${linkCls} text-foreground`}>
                  {e.evidence.label}
                </Link>
              </p>
            </Block>
          )}

          <nav aria-label="Other experiments" className="mb-10 grid gap-3 border-t border-hairline pt-6 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/research/experiments/${prev.slug}/`}
                className="flex min-h-11 flex-col rounded-md border border-hairline-strong p-4 text-sm transition-colors hover:border-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                <span className="text-xs text-muted-foreground">Previous: {prev.id}</span>
                <span className="mt-1 font-semibold text-foreground">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/research/experiments/${next.slug}/`}
                className="flex min-h-11 flex-col rounded-md border border-hairline-strong p-4 text-sm transition-colors hover:border-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink sm:text-right"
              >
                <span className="text-xs text-muted-foreground">Next: {next.id}</span>
                <span className="mt-1 font-semibold text-foreground">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <p className="mb-12">
            <Link href="/research/experiments/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-ink underline underline-offset-4">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to the experiment register
            </Link>
          </p>

          {e.status === "failed" || e.status === "inconclusive" ? (
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              If you want me to look at what is worth testing on your site, the free 20-minute diagnosis is{" "}
              <Link href="/contact/" className={`${linkCls} text-foreground`}>
                the place to start
              </Link>
              .
            </p>
          ) : (
            <section aria-labelledby="exp-cta" className="mb-8">
              <h2 id="exp-cta" className="text-xl font-bold text-foreground md:text-2xl" style={headingStyle}>
                Want a test like these on your site?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                The free 20-minute diagnosis is the place to start. I look at your site and tell you what is worth
                testing first.
              </p>
              <div className="mt-6">
                <GradientButton asChild>
                  <Link href="/contact/" className="gap-2">
                    Book the free diagnosis
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </GradientButton>
              </div>
            </section>
          )}
        </div>

        <Footer />
      </main>
    </>
  );
}
