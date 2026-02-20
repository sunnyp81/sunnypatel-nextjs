import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { About } from "@/components/sections/about";
import { Portfolio, type FeaturedProject } from "@/components/sections/portfolio";
import { Cta } from "@/components/sections/cta";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { buildMetadata } from "@/lib/metadata";
import { reader } from "@/lib/content";

export function generateMetadata() {
  return buildMetadata({ path: "/" });
}

export default async function Home() {
  const projects = await reader.collections.portfolio.all();
  const featuredItems: FeaturedProject[] = projects
    .filter((p) => p.entry.featured)
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.entry.title,
      description: p.entry.description ?? "",
      tags: p.entry.tags ?? [],
      industry: p.entry.industry ?? "",
      metrics: p.entry.metrics ?? [],
    }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Navbar />
      <Hero />
      <Services />
      <Stats />
      <About />
      <Portfolio featuredItems={featuredItems} />
      <Cta />
      <Contact />
      <Footer />
    </main>
  );
}
