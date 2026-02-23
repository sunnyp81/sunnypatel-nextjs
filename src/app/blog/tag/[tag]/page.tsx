import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { slugifyTag } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export async function generateStaticParams() {
  const posts = await reader.collections.blog.all();
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.entry.tags ?? []) {
      tags.add(slugifyTag(tag));
    }
  }
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const label = tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return buildMetadata({
    title: `${label} Articles | Sunny Patel`,
    description: `SEO articles and guides about ${label} by Sunny Patel.`,
    path: `/blog/tag/${tag}`,
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await reader.collections.blog.all();

  const filtered = posts
    .filter((p) =>
      (p.entry.tags ?? []).some((t) => slugifyTag(t) === tag)
    )
    .sort((a, b) => {
      const dateA = a.entry.date ? new Date(a.entry.date).getTime() : 0;
      const dateB = b.entry.date ? new Date(b.entry.date).getTime() : 0;
      return dateB - dateA;
    });

  const label = tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <div className="relative overflow-hidden pb-12 pt-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Posts
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
            Tag
          </p>
          <h1
            className="text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            {label}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">No posts with this tag.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                {post.entry.ogImage && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={post.entry.ogImage}
                      alt={post.entry.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  {post.entry.date && (
                    <div className="mb-3 text-xs text-muted-foreground">
                      {new Date(post.entry.date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  <h2
                    className="mb-2 flex-1 text-base font-semibold text-foreground transition-colors duration-200 group-hover:text-[#5B8AEF]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {post.entry.title}
                  </h2>
                  {post.entry.description && (
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {post.entry.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/40 transition-all duration-200 group-hover:gap-2 group-hover:text-[#5B8AEF]">
                    Read more <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
