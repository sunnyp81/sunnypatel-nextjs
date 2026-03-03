import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    text: "The SEO work delivered real results \u2014 I\u2019m seeing more clicks compared to this time last year in Google Analytics, without having to spend loads on advertising. Super impressed.",
    name: "Dr Shaan Patel",
    role: "Founder, Aatma Aesthetics",
    location: "UK",
  },
  {
    text: "Before working with Sunny, we were getting around 180 organic visits a month. Nine months later we\u2019re at 620 and enquiries from organic have tripled.",
    name: "James W.",
    role: "Director",
    location: "Reading",
  },
  {
    text: "We went from invisible in local pack to ranking in the top 3 for our main service terms within 5 months. The increase in enquiry rate was roughly 3\u00d7.",
    name: "Sarah M.",
    role: "Partner, professional services firm",
    location: "Berkshire",
  },
  {
    text: "Sunny\u2019s topical map approach was unlike any other SEO work we\u2019d had before. Within 6 months we were ranking for terms we\u2019d never appeared for.",
    name: "Tom B.",
    role: "MD, SaaS company",
    location: "Thames Valley",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.05] bg-[#050507]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.04] blur-[100px]"
        style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
          Client Results
        </p>
        <h2
          className="mb-12 text-center text-2xl font-bold text-foreground md:text-3xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          What clients say
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              <Quote className="mb-4 h-5 w-5 text-[#5B8AEF]/30" />
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground/60">
                  {t.role} &middot; {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
