import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import Link from "next/link";

export async function generateMetadata() {
  const page = await reader.singletons.blogIndex.read();
  return buildMetadata({
    title: page?.title || "Blog | Sunny Patel",
    description: page?.description || "SEO insights, guides, and strategies from Sunny Patel.",
    path: "/blog",
  });
}

export default async function BlogIndex() {
  const page = await reader.singletons.blogIndex.read();
  const posts = await reader.collections.blog.all();

  const sorted = posts.sort((a, b) => {
    const dateA = a.entry.date ? new Date(a.entry.date).getTime() : 0;
    const dateB = b.entry.date ? new Date(b.entry.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#5B8AEF]">
              Blog
            </p>
            <h1
              className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              {page?.h1 || "SEO Insights & Guides"}
            </h1>
            {page?.subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {page.subtitle}
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="mb-3 text-xs text-muted-foreground">
                  {post.entry.date &&
                    new Date(post.entry.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </div>
                <h2
                  className="mb-2 text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-[#5B8AEF]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {post.entry.title}
                </h2>
                {post.entry.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {post.entry.description}
                  </p>
                )}
                {post.entry.tags && post.entry.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
