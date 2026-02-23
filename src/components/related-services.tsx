import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICE_TOPICS } from "@/lib/schema";

type ServiceSummary = {
  slug: string;
  title: string;
  subtitle: string | null;
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
    <div className="border-t border-white/[0.05]">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2
          className="mb-8 text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          You Might Also Need
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {scored.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#5B8AEF]/20 hover:bg-white/[0.04]"
            >
              <h3
                className="mb-2 text-base font-semibold text-foreground transition-colors duration-200 group-hover:text-[#5B8AEF]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {service.title}
              </h3>
              {service.subtitle && (
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {service.subtitle}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/40 transition-all duration-200 group-hover:gap-2 group-hover:text-[#5B8AEF]">
                Learn more <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
