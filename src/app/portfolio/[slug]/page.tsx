import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Cta } from "@/components/sections/cta";
import { PortfolioDetail } from "@/components/portfolio/portfolio-detail";
import { portfolioSchema, breadcrumbSchema, schemaGraph } from "@/lib/schema";

export async function generateStaticParams() {
  const slugs = await reader.collections.portfolio.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await reader.collections.portfolio.read(slug);
  if (!project) return {};
  return buildMetadata({
    title: project.metaTitle || project.title,
    description: project.description,
    ogImage: project.ogImage,
    path: `/portfolio/${slug}`,
  });
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await reader.collections.portfolio.read(slug);
  if (!project) notFound();

  const content = await project.content();
  const rendered = renderMarkdoc(content);

  const { title, description, tags, client, industry, services, year, problem, solution, result, metrics, testimonialText, testimonialAuthor, testimonialRole } = project;

  return (
    <main className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaGraph(
            portfolioSchema({
              title,
              description,
              slug,
            }),
            breadcrumbSchema([
              { name: "Home", url: "https://sunnypatel.co.uk" },
              { name: "Portfolio", url: "https://sunnypatel.co.uk/portfolio" },
              { name: title, url: `https://sunnypatel.co.uk/portfolio/${slug}` },
            ])
          ),
        }}
      />
      <Navbar />
      <PortfolioDetail
        project={{ title, description, tags, client, industry, services, year, problem, solution, result, metrics, testimonialText, testimonialAuthor, testimonialRole }}
        renderedContent={rendered}
      />
      <Cta />
      <Footer />
    </main>
  );
}
