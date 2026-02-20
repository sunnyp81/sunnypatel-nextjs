import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";

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

  return (
    <ContentPage h1={project.title}>
      {project.tags && project.tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#5B8AEF]/20 bg-[#5B8AEF]/10 px-3 py-1 text-xs font-medium text-[#5B8AEF]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {rendered}
    </ContentPage>
  );
}
