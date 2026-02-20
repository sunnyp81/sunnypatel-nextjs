import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";
import { serviceSchema, breadcrumbSchema, schemaGraph } from "@/lib/schema";

export async function generateStaticParams() {
  const slugs = await reader.collections.services.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await reader.collections.services.read(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.metaTitle || service.title,
    description: service.description,
    ogImage: service.ogImage,
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await reader.collections.services.read(slug);
  if (!service) notFound();

  const content = await service.content();
  const rendered = renderMarkdoc(content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaGraph(
            serviceSchema({
              name: service.title,
              description: service.description,
              slug,
            }),
            breadcrumbSchema([
              { name: "Home", url: "https://sunnypatel.co.uk" },
              { name: "Services", url: "https://sunnypatel.co.uk/services" },
              { name: service.title, url: `https://sunnypatel.co.uk/services/${slug}` },
            ])
          ),
        }}
      />
      <ContentPage
        h1={service.h1 || service.title}
        subtitle={service.subtitle}
        badge="Services"
        backHref="/services"
        backLabel="All Services"
        showCta={true}
      >
        {rendered}
      </ContentPage>
    </>
  );
}
