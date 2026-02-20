import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";
import { articleSchema, breadcrumbSchema, schemaGraph } from "@/lib/schema";

export async function generateStaticParams() {
  const slugs = await reader.collections.blog.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await reader.collections.blog.read(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.metaTitle || post.title,
    description: post.description,
    ogImage: post.ogImage,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await reader.collections.blog.read(slug);
  if (!post) notFound();

  const content = await post.content();
  const rendered = renderMarkdoc(content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaGraph(
            articleSchema({
              title: post.metaTitle || post.title,
              description: post.description,
              slug,
              date: post.date || undefined,
            }),
            breadcrumbSchema([
              { name: "Home", url: "https://sunnypatel.co.uk" },
              { name: "Blog", url: "https://sunnypatel.co.uk/blog" },
              { name: post.title, url: `https://sunnypatel.co.uk/blog/${slug}` },
            ])
          ),
        }}
      />
      <ContentPage
        h1={post.title}
        badge="Blog"
        backHref="/blog"
        backLabel="All Posts"
        dateLine={
          post.date
            ? new Date(post.date).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : undefined
        }
      >
        {rendered}
      </ContentPage>
    </>
  );
}
