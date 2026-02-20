import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Link from "next/link";

export async function generateMetadata() {
  const page = await reader.singletons.servicesIndex.read();
  return buildMetadata({
    title: page?.title || "SEO Services | Sunny Patel",
    description: page?.description || "Comprehensive SEO services including topical authority, technical audits, and content strategy.",
    path: "/services",
  });
}

export default async function ServicesIndex() {
  const page = await reader.singletons.servicesIndex.read();
  const services = await reader.collections.services.all();

  const sorted = services.sort(
    (a, b) => (a.entry.sortOrder ?? 0) - (b.entry.sortOrder ?? 0)
  );

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#5B8AEF]">
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                  />
                  <div className="relative flex h-full min-h-[10rem] flex-col justify-between rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <div>
                      <h2
                        className="mb-2 text-xl font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {service.entry.title}
                      </h2>
                      {service.entry.subtitle && (
                        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                          {service.entry.subtitle}
                        </p>
                      )}
                    </div>
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
