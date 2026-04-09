import Link from "next/link";
import { ArrowRight, Globe, Code, Map, BarChart3, FileText, TrendingUp } from "lucide-react";

/* ── Static service data (used for blog → service linking) ──── */
const STATIC_SERVICES = [
  {
    icon: Globe,
    title: "Topical Authority",
    description: "Build content networks that establish your site as the go-to source in your niche.",
    href: "/services/topical-authority/",
    color: "#5B8AEF",
    keywords: ["topical", "authority", "content", "entity", "semantic", "niche"],
  },
  {
    icon: Code,
    title: "Technical SEO Audit",
    description: "Core Web Vitals, crawl analysis, schema markup, and site architecture fixes.",
    href: "/services/technical-seo-audit/",
    color: "#4c7894",
    keywords: ["technical", "audit", "core web vitals", "crawl", "speed", "schema", "structured data"],
  },
  {
    icon: Map,
    title: "Topical Maps",
    description: "Strategic content architecture using root, node, and seed page hierarchy.",
    href: "/services/topical-maps/",
    color: "#5a922c",
    keywords: ["topical map", "content strategy", "architecture", "hierarchy", "silo"],
  },
  {
    icon: BarChart3,
    title: "SEO Consulting",
    description: "Strategic guidance for in-house teams with monthly retainers and priority support.",
    href: "/services/seo-consulting/",
    color: "#d79f1e",
    keywords: ["consulting", "strategy", "retainer", "in-house", "team", "guidance"],
  },
  {
    icon: FileText,
    title: "Content Strategy",
    description: "Semantic briefs, content calendars, and editorial workflows aligned with search intent.",
    href: "/services/content-briefs/",
    color: "#5B8AEF",
    keywords: ["content", "brief", "calendar", "editorial", "intent", "keyword"],
  },
  {
    icon: TrendingUp,
    title: "Revenue Recovery",
    description: "Diagnose traffic drops and recover lost rankings from algorithm updates.",
    href: "/services/google-algorithm-update-recovery/",
    color: "#5a922c",
    keywords: ["recovery", "algorithm", "update", "penalty", "traffic drop", "ranking"],
  },
];

const ICON_MAP: Record<string, typeof Globe> = {
  "topical-authority": Globe,
  "technical-seo-audit": Code,
  "topical-maps": Map,
  "seo-consulting": BarChart3,
  "content-briefs": FileText,
  "google-algorithm-update-recovery": TrendingUp,
};

const COLOR_MAP: Record<string, string> = {
  "topical-authority": "#5B8AEF",
  "technical-seo-audit": "#4c7894",
  "topical-maps": "#5a922c",
  "seo-consulting": "#d79f1e",
  "content-briefs": "#5B8AEF",
  "google-algorithm-update-recovery": "#5a922c",
};

function scoreService(service: typeof STATIC_SERVICES[number], tags: readonly string[], title: string) {
  const text = `${tags.join(" ")} ${title}`.toLowerCase();
  return service.keywords.filter((kw) => text.includes(kw)).length;
}

type ServiceSummary = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
};

/* ── Component ────────────────────────────────────────────────── */
export function RelatedServices({
  // Service page mode (dynamic list from Keystatic)
  currentSlug,
  allServices,
  // Blog mode (keyword matching against static services)
  currentTags,
  postTitle,
}: {
  currentSlug?: string;
  allServices?: ServiceSummary[];
  currentTags?: readonly string[];
  postTitle?: string;
}) {
  /* ── Service page mode: show other services ───────────────── */
  if (currentSlug && allServices) {
    const others = allServices.filter((s) => s.slug !== currentSlug).slice(0, 3);
    if (others.length === 0) return null;

    return (
      <div className="border-t border-white/[0.05]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2
            className="mb-8 text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Other Services
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {others.map((service) => {
              const Icon = ICON_MAP[service.slug] || Globe;
              const color = COLOR_MAP[service.slug] || "#5B8AEF";
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}/`}
                  className="group flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div
                    className="mb-4 w-fit rounded-lg border p-2"
                    style={{ borderColor: `${color}28`, backgroundColor: `${color}10` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <h3
                    className="mb-2 text-base font-semibold text-foreground transition-colors group-hover:text-[#5B8AEF]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground/40 transition-all duration-200 group-hover:gap-2 group-hover:text-[#5B8AEF]">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Blog mode: keyword-match static services ─────────────── */
  const scored = STATIC_SERVICES
    .map((s) => ({ ...s, score: scoreService(s, currentTags ?? [], postTitle ?? "") }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="my-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
        Related Services
      </p>
      <h3
        className="mb-6 text-lg font-bold text-foreground md:text-xl"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        Need help implementing this?
      </h3>
      <div className="grid gap-3 md:grid-cols-3">
        {scored.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.href}
              href={service.href}
              className="group flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div
                className="mb-3 w-fit rounded-lg border p-2"
                style={{
                  borderColor: `${service.color}28`,
                  backgroundColor: `${service.color}10`,
                }}
              >
                <Icon className="h-4 w-4" style={{ color: service.color }} />
              </div>
              <h4
                className="mb-1 text-sm font-semibold text-foreground transition-colors group-hover:text-[#5B8AEF]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {service.title}
              </h4>
              <p className="mb-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground/40 transition-all duration-200 group-hover:gap-2 group-hover:text-[#5B8AEF]">
                Learn more <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl border border-[#5B8AEF]/15 bg-[#5B8AEF]/[0.03] p-4">
        <Link
          href="/tools/"
          className="group flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-foreground">Try our free SEO tools</p>
            <p className="text-xs text-muted-foreground">Website grader, speed checker, keyword scraper, and 17 more — no sign-up required.</p>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#5B8AEF] transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
