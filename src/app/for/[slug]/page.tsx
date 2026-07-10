import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, Search, TrendingUp } from "lucide-react";
import prospectsData from "@/data/prospects.json";

interface Prospect {
  slug: string;
  company: string;
  contactName: string;
  moneyTerm: string;
  position: number;
  graderScore?: number;
  loomUrl?: string;
  fixes: { title: string; detail: string }[];
  expires: string;
}

const prospects: Prospect[] = prospectsData.prospects;

function getProspect(slug: string): Prospect | null {
  const p = prospects.find((x) => x.slug === slug);
  if (!p) return null;
  if (new Date(p.expires) < new Date()) return null;
  return p;
}

export async function generateStaticParams() {
  return prospects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProspect(slug);
  return {
    title: p ? `For ${p.company}: your SEO quick wins` : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function ProspectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProspect(slug);
  if (!p) notFound();

  const loomEmbed = p.loomUrl
    ? p.loomUrl.replace("loom.com/share/", "loom.com/embed/")
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">
        Prepared for {p.company}
      </p>
      <h1
        className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        {p.contactName}, you are position {p.position} for &ldquo;{p.moneyTerm}&rdquo;. Here is what is holding you back.
      </h1>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground">
        I recorded a short video walking through your site the way Google sees it. The two fixes below are yours to keep, no strings. This page is private to you and expires on{" "}
        {new Date(p.expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
      </p>

      {loomEmbed && (
        <div className="mb-10 overflow-hidden rounded-2xl border border-border">
          <div className="relative" style={{ paddingBottom: "62.5%" }}>
            <iframe
              src={loomEmbed}
              title={`SEO teardown video for ${p.company}`}
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}
      {!loomEmbed && (
        <div className="mb-10 flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-5 text-sm text-muted-foreground">
          <PlayCircle className="h-5 w-5 shrink-0 text-brand" />
          Video on its way, the written version is below.
        </div>
      )}

      {typeof p.graderScore === "number" && (
        <div className="mb-10 flex items-center gap-4 rounded-2xl border border-brand/20 bg-brand/[0.05] p-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-brand"
            style={{ fontFamily: "var(--font-heading)", background: "rgba(91,138,239,0.12)" }}
          >
            {p.graderScore}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your site scores {p.graderScore}/100 on my free grader (SEO, speed, security, content).{" "}
            <Link href="/tools/website-grader/" className="text-brand hover:underline">
              Run it yourself
            </Link>{" "}
            any time, no sign-up.
          </p>
        </div>
      )}

      <h2
        className="mb-6 text-xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Two fixes you can make this week
      </h2>
      <div className="mb-12 space-y-5">
        {p.fixes.map((fix, i) => (
          <div key={i} className="rounded-2xl border border-border p-5">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
              <h3 className="text-sm font-semibold text-foreground">{fix.title}</h3>
            </div>
            <p className="pl-6 text-sm leading-relaxed text-muted-foreground">{fix.detail}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/[0.08] to-brand-deep/[0.04] p-6 md:p-8">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">
            The full picture
          </span>
        </div>
        <h2
          className="mb-3 text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          There are more issues like these on your site
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          The full audit covers every technical, content and AI-visibility issue, prioritised by revenue impact, delivered in 5 working days with a 45-minute walkthrough call. Fixed fee £495, no retainer required. Or reply to my email and I will answer questions for free.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/services/paid-seo-audit/"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
            style={{
              fontFamily: "var(--font-heading)",
              background: "linear-gradient(135deg, #5B8AEF 0%, #3d6fe8 100%)",
              boxShadow: "0 0 20px rgba(91,138,239,0.25)",
            }}
          >
            Get the £495 Audit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Search className="h-4 w-4" />
            Book a free 30-minute call
          </Link>
        </div>
      </div>
    </main>
  );
}
