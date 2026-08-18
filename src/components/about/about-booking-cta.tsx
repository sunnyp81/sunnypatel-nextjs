import { ArrowRight } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

// Deep links straight to Choose Date and Time with Service = Free SEO Audit preselected.
// Keep in sync with TRAFFT_BOOKING_URL in src/app/api/contact/route.ts.
const TRAFFT_BOOKING_URL = "https://sunnypatel.trafft.com/booking?service=6";

export function AboutBookingCta() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal">
          Talk To Sunny
        </p>
        <h2
          className="mb-4 text-2xl font-bold text-foreground md:text-3xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          Book a free 15 minute SEO audit call
        </h2>
        <p className="mb-8 text-muted-foreground">
          Choose a slot that works for you and I will look at your current rankings, flag the biggest gaps, and outline the fastest path to more organic traffic.
        </p>
        <GradientButton asChild>
          <a href={TRAFFT_BOOKING_URL} target="_blank" rel="noopener" className="gap-2">
            Pick a Time
            <ArrowRight className="h-4 w-4" />
          </a>
        </GradientButton>
      </div>
    </section>
  );
}
