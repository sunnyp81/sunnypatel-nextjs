import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { About } from "@/components/sections/about";
import { Portfolio, type FeaturedProject } from "@/components/sections/portfolio";
import { Testimonials } from "@/components/sections/testimonials";
import { Cta } from "@/components/sections/cta";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { buildMetadata } from "@/lib/metadata";
import { reader } from "@/lib/content";
import { reviewSchema, schemaGraph } from "@/lib/schema";
import { TESTIMONIALS } from "@/lib/testimonial-data";

export function generateMetadata() {
  return buildMetadata({
    path: "/",
    titleAbsolute: true,
    title: "SEO Consultant Reading | Direct Expert, No Juniors",
    description:
      "Independent SEO consultant in Reading, Berkshire. Direct senior work, no juniors, no contracts. Free 30-minute consultation or a fixed-fee £495 audit.",
  });
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
      {TESTIMONIALS.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaGraph(reviewSchema(TESTIMONIALS)) }}
        />
      )}
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <Hero />
      <Services />
      <Stats />
      <About />
      <Portfolio featuredItems={featuredItems} />
      <Testimonials />
      <Cta />
      <Contact />
      <Footer />
    </main>
  );
}
