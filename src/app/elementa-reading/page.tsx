import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ServiceInlineForm } from "@/components/service-inline-form";
import { GradientButton } from "@/components/ui/gradient-button";

// Landing page for the printed flyer on the Elementa (450 Brook Drive, Green Park) notice board.
export function generateMetadata() {
  return {
    ...buildMetadata({
      title: "Free SEO Audit for Elementa Reading | Sunny Patel",
      description:
        "A free SEO audit for anyone working at Elementa, 450 Brook Drive, Green Park, Reading. Written list of your top fixes, plus fixed-quote websites from £1,500.",
      path: "/elementa-reading",
    }),
    robots: { index: false, follow: true },
  };
}

const AUDIT_CHECKS = [
  "Whether Google can find and index the pages that matter to you",
  "How your business shows up in Google search and on Maps",
  "The titles and descriptions people see before they decide to click",
  "Speed and the phone experience on your key pages",
  "Whether AI tools like ChatGPT and Google's AI Overviews can read and mention you",
  "A short written list of the fixes worth doing first, in plain English",
] as const;

const FAQS = [
  {
    q: "Do I need to be an Elementa member?",
    a: "It's meant for anyone working in the building: members, hot-deskers and visitors. If you found this page another way, ask anyway.",
  },
  {
    q: "Is the audit really free?",
    a: "Yes. You keep the written list of fixes whether or not you hire me for anything. If you want every page reviewed in depth, that is the paid £495 audit, and I'll only suggest it if your site needs it.",
  },
  {
    q: "What happens after I send the form?",
    a: "I reply within one working day to confirm your website and what you want more of, whether that's calls, enquiries or bookings. Then I do the audit and send it over. We can go through it together in the building if that's easier.",
  },
] as const;

const headingFont = { fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" } as const;

export default function ElementaReadingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />

      <section className="relative overflow-hidden pb-14 pt-32 md:pb-20">
        <div
          className="pointer-events-none absolute left-1/3 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Elementa, 450 Brook Drive, Green Park
            </p>
            <h1 className="text-4xl font-bold text-foreground md:text-6xl" style={headingFont}>
              A free SEO audit for anyone working at Elementa Reading
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              You&apos;ve probably seen my flyer on the board. I&apos;m Sunny, an SEO consultant based in
              Reading, and I work from Elementa some days. If you run a business from the building,
              I&apos;ll look at your website for free and tell you what&apos;s stopping it bringing in work.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <GradientButton asChild>
                <Link href="#claim" className="gap-2">
                  Claim your free audit
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </GradientButton>
              <Link
                href="#website"
                className="text-sm font-semibold text-foreground underline decoration-brand/50 underline-offset-4 transition-colors hover:text-brand"
              >
                Need a new website instead?
              </Link>
            </div>
          </div>

          <figure className="mx-auto w-full max-w-[300px] md:max-w-[340px]">
            <div className="relative -rotate-2 rounded-sm shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]">
              <span
                aria-hidden="true"
                className="absolute -top-2 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #f3c75a, #d79f1e 55%, #8a6410)",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.35)",
                }}
              />
              <Image
                src="/images/elementa/elementa-flyer.webp"
                alt="The printed flyer on the Elementa notice board: a free SEO audit, new websites from £1,500, and a QR code to this page"
                width={720}
                height={1018}
                priority
                sizes="(min-width: 768px) 340px, 300px"
                className="h-auto w-full rounded-sm"
              />
            </div>
            <figcaption className="mt-4 text-center text-xs text-muted-foreground">
              The flyer on the board, if you&apos;re wondering where you saw it
            </figcaption>
          </figure>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent dark:via-white/[0.08]" />
      </section>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" style={headingFont}>
            What the free audit covers
          </h2>
          <p className="mb-6 text-base leading-relaxed text-muted-foreground">
            It&apos;s a focused look at the issues most likely to cost you enquiries, written for the
            person who runs the business rather than a developer.
          </p>
          <ul className="space-y-3">
            {AUDIT_CHECKS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span className="text-base leading-relaxed text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="website" className="mb-16 scroll-mt-28 rounded-2xl border border-hairline bg-wash p-6 dark:border-white/[0.08] dark:bg-white/[0.02] md:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold-ink">From £1,500</p>
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" style={headingFont}>
            Need a new website?
          </h2>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground">
            I build websites that load fast, work properly on phones and are set up so Google
            understands them from the first day. You get a fixed quote before any work starts, so the
            price you agree is the price you pay.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            See the{" "}
            <Link href="/website-design/packages/" className="font-medium text-brand hover:underline">
              website packages and prices
            </Link>{" "}
            or{" "}
            <Link href="/website-design/" className="font-medium text-brand hover:underline">
              how I approach website design
            </Link>
            , then use the form below and mention you&apos;d like a quote.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" style={headingFont}>
            Why ask me
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              I&apos;ve worked in search for over 15 years and I&apos;m based in Reading, so you deal
              with me directly, not an account manager. I also run my own portfolio of websites, which
              means the advice comes from sites I test things on myself.{" "}
              <Link href="/proof/" className="font-medium text-brand hover:underline">
                See the results from my own sites
              </Link>
              , or read about my{" "}
              <Link href="/services/seo-consultant-reading/" className="font-medium text-brand hover:underline">
                SEO work in Reading
              </Link>
              .
            </p>
          </div>
        </section>
      </div>

      <div aria-hidden="true" className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 border-t border-dashed border-muted-foreground/40" />
          <span>Take one</span>
          <span className="h-px flex-1 border-t border-dashed border-muted-foreground/40" />
        </div>
      </div>

      <ServiceInlineForm
        id="claim"
        ctaTitle="Claim your free SEO audit"
        ctaSubtitle="Send your website and what you'd like more of: calls, enquiries or bookings. If you need a new site instead, say so and I'll send a fixed quote."
        trustPoints={[
          "Free for anyone working at Elementa",
          "A written list of your top fixes",
          "Happy to go through it in person in the building",
          "The fixes are yours to keep, hire me or not",
        ]}
        badges={[
          { icon: "sparkles", label: "Free SEO audit" },
          { icon: "calendar", label: "15+ years in search" },
          { icon: "shield", label: "No obligation" },
        ]}
        submitLabel="Claim free audit"
        successMessage="Thanks, your audit request is with me. I'll reply personally within one working day."
        offerId="elementa_reading_free_seo_audit"
        offerLabel="Elementa Reading flyer: free SEO audit or website quote"
        eventLabel="elementa_reading_form"
        messagePlaceholder="Your website address (or 'I need one') and what you'd like it to do for your business."
        operationalNotes={["Personal reply from Sunny within one working day"]}
        formFooterNote="No obligation · Direct reply from Sunny · Reply within one working day"
      />

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-bold text-foreground" style={headingFont}>
          Questions
        </h2>
        <dl className="space-y-6">
          {FAQS.map(({ q, a }) => (
            <div key={q}>
              <dt className="mb-2 font-semibold text-foreground">{q}</dt>
              <dd className="text-base leading-relaxed text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Footer />
    </main>
  );
}
