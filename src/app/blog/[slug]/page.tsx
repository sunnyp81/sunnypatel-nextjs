import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";

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
    <ContentPage h1={post.title}>
      {post.date && (
        <p className="mb-8 text-sm text-muted-foreground">
          {new Date(post.date).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
      {rendered}
    </ContentPage>
  );
}
