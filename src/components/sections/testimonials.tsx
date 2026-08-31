import { TESTIMONIALS } from "@/lib/testimonial-data";
import { ArrowRight, Quote } from "lucide-react";
import Link from "next/link";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.05] bg-[#050507]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-brand opacity-[0.04] blur-[100px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-6 py-20">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-brand">Verified Client Result</p>
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}>
          Real work, in the client&apos;s words
        </h2>

        {TESTIMONIALS.map((testimonial) => (
          <figure key={testimonial.author} className="relative rounded-2xl border border-white/[0.09] bg-white/[0.03] p-7 md:p-9">
            <Quote className="mb-5 h-6 w-6 text-brand" aria-hidden="true" />
            <blockquote className="text-lg leading-relaxed text-foreground md:text-xl">“{testimonial.text}”</blockquote>
            <figcaption className="mt-6">
              <p className="font-semibold text-foreground">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </figcaption>
            <Link href="/portfolio/aatma-aesthetics-website-design-development-seo/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand/25 bg-brand/10 px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">
              See the measured case study <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </figure>
        ))}
      </div>
    </section>
  );
}
