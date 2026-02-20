import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Link from "next/link";
import {
  Globe,
  BarChart3,
  Map,
  Code,
  FileText,
  TrendingUp,
  Brain,
  MapPin,
  Search,
  Link2,
  ArrowRight,
  Layers,
  ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";

const iconMap: Record<string, ReactNode> = {
  "topical-authority": <Globe className="h-5 w-5" />,
  "seo": <TrendingUp className="h-5 w-5" />,
  "topical-maps": <Map className="h-5 w-5" />,
  "technical-seo-audit": <Code className="h-5 w-5" />,
  "technical-seo-audit-comprehensive-site-health-analysis-and-recommendations": <Code className="h-5 w-5" />,
  "seo-consulting": <BarChart3 className="h-5 w-5" />,
  "seo-strategy-consulting-expert-guidance-for-in-house-teams": <BarChart3 className="h-5 w-5" />,
  "content-briefs": <FileText className="h-5 w-5" />,
  "semantic-seo": <Brain className="h-5 w-5" />,
  "local-seo": <MapPin className="h-5 w-5" />,
  "on-page-seo": <Layers className="h-5 w-5" />,
  "internal-linking": <Link2 className="h-5 w-5" />,
  "keyword-research": <Search className="h-5 w-5" />,
  "how-much-does-seo-cost": <FileText className="h-5 w-5" />,
  "b2b-content-marketing-services": <FileText className="h-5 w-5" />,
  "generative-engine-optimisation": <Brain className="h-5 w-5" />,
  "google-algorithm-update-recovery": <ShieldAlert className="h-5 w-5" />,
};

const locationSlugs = [
  "seo-berkshire",
  "seo-bracknell",
  "seo-consultant-reading",
  "seo-maidenhead",
  "seo-slough",
  "seo-wokingham",
  "mayfair-luxury-brand-seo",
  "legal-seo-magic-circle-firms-2",
];

export async function generateMetadata() {
  const page = await reader.singletons.servicesIndex.read();
  return buildMetadata({
    title: page?.title || "SEO Services | Sunny Patel",
    description:
      page?.description ||
      "Comprehensive SEO services including topical authority, technical audits, and content strategy.",
    path: "/services",
  });
}

export default async function ServicesIndex() {
  const page = await reader.singletons.servicesIndex.read();
  const services = await reader.collections.services.all();

  const sorted = services.sort(
    (a, b) => (a.entry.sortOrder ?? 0) - (b.entry.sortOrder ?? 0)
  );

  const coreServices = sorted.filter((s) => !locationSlugs.includes(s.slug));
  const locationServices = sorted.filter((s) => locationSlugs.includes(s.slug));

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden pb-12 pt-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
            Services
          </p>
          <h1
            className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            {page?.h1 || "SEO Services"}
          </h1>
          {page?.subtitle && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {page.subtitle}
            </p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Core services */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coreServices.map((service) => (
            <ServiceCard
              key={service.slug}
              slug={service.slug}
              title={service.entry.title}
              subtitle={service.entry.subtitle}
              icon={iconMap[service.slug] ?? <Globe className="h-5 w-5" />}
            />
          ))}
        </div>

        {/* Location pages */}
        {locationServices.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                Location & Specialist Pages
              </p>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {locationServices.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-sm transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      {service.entry.title}
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#5B8AEF]" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function ServiceCard({
  slug,
  title,
  subtitle,
  icon,
}: {
  slug: string;
  title: string;
  subtitle?: string | null;
  icon: ReactNode;
}) {
  return (
    <Link href={`/services/${slug}`} className="group">
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 transition-transform duration-200 group-hover:scale-[1.01]">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full min-h-[11rem] flex-col justify-between rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
          <div>
            <div className="mb-4 w-fit rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-muted-foreground transition-colors duration-200 group-hover:border-[#5B8AEF]/20 group-hover:bg-[#5B8AEF]/10 group-hover:text-[#5B8AEF]">
              {icon}
            </div>
            <h2
              className="mb-2 text-lg font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground/50 transition-all duration-200 group-hover:gap-2 group-hover:text-[#5B8AEF]">
            View service
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
