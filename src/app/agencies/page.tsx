import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ServiceInlineForm } from "@/components/service-inline-form";
import { GradientButton } from "@/components/ui/gradient-button";

// Landing page for cold outreach to web design and digital marketing agencies.
// Kept out of search: the white-label SEO page owns the public "white label" intent.
export function generateMetadata() {
  return {
    ...buildMetadata({
      title: "Search and AI Visibility Help for Agencies | Sunny Patel",
      description:
        "A senior SEO and AI visibility specialist for web design and digital marketing agencies. White label if you want it, and a free quick call to bring me your SEO questions.",
      path: "/agencies",
    }),
    robots: { index: false, follow: true },
  };
}

const CLIENT_QUESTIONS = [
  {
    q: "We launched the new site months ago. Why isn't it on Google?",
    a: "I find out what is holding it back and write it up so you can answer in a meeting, not a week later.",
  },
  {
    q: "Can we show up when people ask ChatGPT?",
    a: "I check where your client is and isn't being cited, and what would change that. It sits alongside the SEO, not on top of it.",
  },
  {
    q: "What exactly are we paying for each month?",
    a: "A fixed monthly scope with named deliverables, in a report written for the client to read.",
  },
] as const;

const WORKING_TOGETHER = [
  {
    title: "You keep the client",
    body: "Contract, invoice and every conversation stay with you. I don't contact your clients, and I don't pitch them now or later.",
  },
  {
    title: "Your name on the work",
    body: "Audits, strategy and reports arrive unbranded or in your template, ready to forward.",
  },
  {
    title: "You set the margin",
    body: "I quote you a wholesale price for the scope. What your client pays is your decision.",
  },
  {
    title: "One person does the work",
    body: "You brief me and I do the analysis and the strategy. There is no account handler in between and no offshore team behind me.",
  },
] as const;

const STEPS = [
  "Book a quick call and bring a client site or a question.",
  "If it makes sense to work together, we agree one scope for one client.",
  "I deliver it. You present it as yours.",
] as const;

const FAQS = [
  {
    q: "What happens on the call?",
    a: "About 20 minutes. You bring whatever is on your desk: a client site that isn't ranking, an SEO section in a proposal, a question about AI search. I give you a straight answer, including when the answer is that your team can handle it.",
  },
  {
    q: "Do I have to be white label?",
    a: "No. Some agencies want the work under my name and some want it under theirs. We can talk through which suits you on the call.",
  },
  {
    q: "What does it cost?",
    a: "The call is free. Work is priced per scope, as a fixed monthly retainer or a fixed price per deliverable, and I'll quote before anything starts. More detail is on the white label SEO page.",
  },
  {
    q: "How many agencies do you take on?",
    a: "A small number. I work alone, so I cap how much any one agency can send me. That is how the work stays senior, and it also means availability varies.",
  },
] as const;

const headingFont = { fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" } as const;

export default function AgenciesPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />

      <section className="relative overflow-hidden pb-14 pt-32 md:pb-20">
        <div
          className="pointer-events-none absolute left-1/3 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
            For web design and digital marketing agencies
          </p>
          <h1 className="text-4xl font-bold text-foreground md:text-6xl" style={headingFont}>
            SEO and AI visibility help your agency can lean on
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            I&apos;m Sunny, an SEO consultant in Reading with over 15 years in search. Agencies bring me
            in when a client asks a search question and nobody in-house is the specialist. I can work
            under your name or mine, and the first step is a free call.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <GradientButton asChild>
              <Link href="#call" className="gap-2">
                Book a quick call
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </GradientButton>
            <Link
              href="/services/white-label-seo/"
              className="text-sm font-semibold text-foreground underline decoration-brand/50 underline-offset-4 transition-colors hover:text-brand"
            >
              How white label works
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent dark:via-white/[0.08]" />
      </section>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <section className="mb-16">
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl" style={headingFont}>
            The questions your clients ask
          </h2>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            You probably hear these already. This is how I help you answer them.
          </p>
          <dl className="space-y-8">
            {CLIENT_QUESTIONS.map(({ q, a }) => (
              <div key={q} className="border-l border-hairline pl-5 dark:border-white/[0.12]">
                <dt className="text-lg font-semibold leading-snug text-foreground md:text-xl">
                  &ldquo;{q}&rdquo;
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl" style={headingFont}>
            How I work with agencies
          </h2>
          <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {WORKING_TOGETHER.map(({ title, body }) => (
              <div key={title}>
                <dt className="font-semibold text-foreground">{title}</dt>
                <dd className="mt-1 text-base leading-relaxed text-muted-foreground">{body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-base leading-relaxed text-muted-foreground">
            The full scope and the way pricing works are on the{" "}
            <Link href="/services/white-label-seo/" className="font-medium text-brand hover:underline">
              white label SEO page
            </Link>
            . For evidence of how I work, I publish the Search Console numbers from my own sites on the{" "}
            <Link href="/proof/" className="font-medium text-brand hover:underline">
              proof page
            </Link>
            .
          </p>
        </section>

        <section className="mb-4">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" style={headingFont}>
            How it starts
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:font-semibold marker:text-foreground">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <ServiceInlineForm
        id="call"
        ctaTitle="Book a quick call"
        ctaSubtitle="Tell me who you are and what you'd like to ask. A client site that isn't ranking, a proposal, a question about AI search. I'll reply within one working day to fix a time."
        trustPoints={[
          "Free 20-minute call",
          "Bring any SEO or AI visibility question",
          "A straight answer, including when you don't need me",
          "No obligation and nothing to prepare",
        ]}
        badges={[
          { icon: "calendar", label: "15+ years in search" },
          { icon: "clock", label: "20 minutes" },
          { icon: "shield", label: "No obligation" },
        ]}
        submitLabel="Request the call"
        successMessage="Thanks, your request is with me. I'll reply personally within one working day to fix a time."
        offerId="agency_quick_call"
        offerLabel="Agency outreach: free quick call"
        eventLabel="agencies_form"
        messagePlaceholder="Your agency name and website, and what you'd like to ask me."
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
