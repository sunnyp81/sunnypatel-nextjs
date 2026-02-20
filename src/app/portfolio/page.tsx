import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ProjectCover } from "@/components/portfolio/project-cover";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function generateMetadata() {
  const page = await reader.singletons.portfolioIndex.read();
  return buildMetadata({
    title: page?.title || "Portfolio | Sunny Patel",
    description:
      page?.description || "Case studies and results from SEO projects.",
    path: "/portfolio",
  });
}

export default async function PortfolioIndex() {
  const page = await reader.singletons.portfolioIndex.read();
  const projects = await reader.collections.portfolio.all();

  const sorted = [...projects].sort((a, b) =>
    a.entry.featured === b.entry.featured ? 0 : a.entry.featured ? -1 : 1
  );

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden pb-12 pt-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #d79f1e, transparent 70%)" }}
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#d79f1e]">
            Portfolio
          </p>
          <h1
            className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            {page?.h1 || "Real Results for Real Businesses"}
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
        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Case studies coming soon.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sorted.map((project) => (
              <Link
                key={project.slug}
                href={`/portfolio/${project.slug}`}
                className="group"
              >
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 transition-transform duration-200 group-hover:scale-[1.01]">
                  <GlowingEffect
                    spread={60}
                    glow={true}
                    disabled={false}
                    proximity={80}
                    inactiveZone={0.01}
                    borderWidth={3}
                  />
                  <div className="relative flex h-full flex-col overflow-hidden rounded-xl border-[0.75px] bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    {/* Gradient cover */}
                    <ProjectCover
                      title={project.entry.title}
                      tags={project.entry.tags}
                      industry={(project.entry as { industry?: string }).industry}
                    />

                    {/* Card body */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {project.entry.featured && (
                            <span className="rounded-full border border-[#d79f1e]/20 bg-[#d79f1e]/10 px-2.5 py-0.5 text-xs font-medium text-[#d79f1e]">
                              Featured
                            </span>
                          )}
                          {project.entry.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5 text-muted-foreground/40 transition-all duration-200 group-hover:border-[#d79f1e]/20 group-hover:bg-[#d79f1e]/10 group-hover:text-[#d79f1e]">
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      {project.entry.description && (
                        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {project.entry.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
