import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";
import { articleSchema, faqSchema, breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { RelatedPosts } from "@/components/related-posts";

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
    type: "article",
    articleMeta: {
      publishedTime: post.date || undefined,
      authors: ["Sunny Patel"],
    },
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

  const [content, allPosts] = await Promise.all([
    post.content(),
    reader.collections.blog.all(),
  ]);
  const rendered = renderMarkdoc(content);

  const postSummaries = allPosts.map((p) => ({
    slug: p.slug,
    title: p.entry.title,
    description: p.entry.description,
    date: p.entry.date,
    ogImage: p.entry.ogImage,
    tags: p.entry.tags ?? [],
  }));

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
              lastUpdated: post.lastUpdated || undefined,
              image: post.ogImage || undefined,
            }),
            breadcrumbSchema([
              { name: "Home", url: "https://sunnypatel.co.uk" },
              { name: "Blog", url: "https://sunnypatel.co.uk/blog" },
              { name: post.title, url: `https://sunnypatel.co.uk/blog/${slug}` },
            ]),
            ...(post.faqs && post.faqs.length > 0
              ? [faqSchema(post.faqs.map((f) => ({ q: f.question, a: f.answer })))]
              : [])
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
        tags={post.tags ? [...post.tags] : undefined}
        heroImage={post.ogImage || undefined}
        isBlog={true}
        afterContent={
          <RelatedPosts
            currentSlug={slug}
            currentTags={post.tags ?? []}
            allPosts={postSummaries}
          />
        }
      >
        {rendered}
      </ContentPage>
    </>
  );
}
