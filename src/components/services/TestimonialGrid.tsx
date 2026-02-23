import { Star } from "lucide-react";

export function TestimonialGrid({
  testimonials,
}: {
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
    location: string;
  }>;
}) {
  return (
    <div>
      <h2
        className="mb-6 text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        What Clients Say
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#5B8AEF]/20 bg-white/[0.02] p-5 shadow-[0_0_20px_rgba(91,138,239,0.08)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(91,138,239,0.16)]"
          >
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="mb-4 text-sm leading-relaxed text-muted-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.role} &middot; {t.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
