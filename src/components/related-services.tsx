import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICE_TOPICS } from "@/lib/schema";

type ServiceSummary = {
  slug: string;
  title: string;
  subtitle: string | null;
  description?: string | null;
};

export function RelatedServices({
  currentSlug,
  allServices,
}: {
  currentSlug: string;
  allServices: ServiceSummary[];
}) {
  const currentTopics = SERVICE_TOPICS[currentSlug];
  if (!currentTopics) return null;

  const currentKeys = new Set([...currentTopics.about, ...currentTopics.mentions]);

  const scored = allServices
    .filter((s) => s.slug !== currentSlug)
    .map((s) => {
      const topics = SERVICE_TOPICS[s.slug];
      if (!topics) return { ...s, score: 0 };
      const allKeys = [...topics.about, ...topics.mentions];
      const overlap = allKeys.filter((k) => currentKeys.has(k)).length;
      return { ...s, score: overlap };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) return null;

  return (
    <div className="relative overflow-hidden border-t border-white/[0.05]">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[250px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-16">
        {/* Section heading */}
        <div className="mb-10">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
            Related Services
          </p>
          <h2
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            You Might Also Need
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {scored.map((service) => {
            const excerpt = service.subtitle || service.description || null;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#5B8AEF]/30 hover:bg-[#5B8AEF]/[0.04] hover:shadow-[0_0_32px_rgba(91,138,239,0.10)]"
              >
                {/* Top accent line — slides in on hover */}
                <div className="absolute left-0 right-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#5B8AEF] to-[#7B5AEF] transition-transform duration-500 group-hover:scale-x-100" />

                {/* Service label */}
                <span className="mb-4 inline-flex w-fit items-center rounded-full border border-[#5B8AEF]/15 bg-[#5B8AEF]/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#5B8AEF]">
                  Service
                </span>

                {/* Title */}
                <h3
                  className="mb-3 text-[15px] font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-[#5B8AEF]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {service.title}
                </h3>

                {/* Excerpt */}
                {excerpt && (
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground/80 line-clamp-3">
                    {excerpt}
                  </p>
                )}

                {/* CTA row */}
                <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/40 transition-all duration-200 group-hover:text-[#5B8AEF]">
                  Explore service
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
