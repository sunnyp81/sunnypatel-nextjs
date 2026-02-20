import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Link from "next/link";

export async function generateMetadata() {
  const page = await reader.singletons.portfolioIndex.read();
  return buildMetadata({
    title: page?.title || "Portfolio | Sunny Patel",
    description: page?.description || "Case studies and results from SEO projects.",
    path: "/portfolio",
  });
}

export default async function PortfolioIndex() {
  const page = await reader.singletons.portfolioIndex.read();
  const projects = await reader.collections.portfolio.all();

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#5B8AEF]">
              Portfolio
            </p>
            <h1
              className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              {page?.h1 || "Our Work"}
            </h1>
            {page?.subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {page.subtitle}
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <Link key={project.slug} href={`/portfolio/${project.slug}`}>
                <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2">
                  <GlowingEffect
                    spread={60}
                    glow={true}
                    disabled={false}
                    proximity={80}
                    inactiveZone={0.01}
                    borderWidth={3}
                  />
                  <div className="relative rounded-xl border-[0.75px] bg-background p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <h2
                      className="mb-3 text-2xl font-bold text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {project.entry.title}
                    </h2>
                    {project.entry.description && (
                      <p className="mb-4 text-muted-foreground">
                        {project.entry.description}
                      </p>
                    )}
                    {project.entry.tags && project.entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#5B8AEF]/20 bg-[#5B8AEF]/10 px-3 py-1 text-xs font-medium text-[#5B8AEF]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
