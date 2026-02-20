import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function generateMetadata() {
  const page = await reader.singletons.blogIndex.read();
  return buildMetadata({
    title: page?.title || "Blog | Sunny Patel",
    description:
      page?.description || "SEO insights, guides, and strategies from Sunny Patel.",
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

  const [featured, ...rest] = sorted;

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden pb-12 pt-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground">No posts yet.</p>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group mb-6 block">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-[#5B8AEF]/20 hover:bg-white/[0.04] md:p-10">
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(91,138,239,0.04), transparent 60%)" }} />

                  <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:gap-10">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-full border border-[#5B8AEF]/20 bg-[#5B8AEF]/10 px-2.5 py-0.5 text-xs font-medium text-[#5B8AEF]">
                          Latest
                        </span>
                        {featured.entry.date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(featured.entry.date).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h2
                        className="mb-3 text-2xl font-bold text-foreground transition-colors duration-200 group-hover:text-[#5B8AEF] md:text-3xl"
                        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
                      >
                        {featured.entry.title}
                      </h2>
                      {featured.entry.description && (
                        <p className="text-base leading-relaxed text-muted-foreground">
                          {featured.entry.description}
                        </p>
                      )}
                      {featured.entry.tags && featured.entry.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {featured.entry.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground/50 transition-all duration-200 group-hover:gap-2.5 group-hover:text-[#5B8AEF] md:mt-1">
                      Read article
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining posts */}
            {rest.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
                  >
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
                    {post.entry.tags && post.entry.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
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
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/40 transition-all duration-200 group-hover:gap-2 group-hover:text-[#5B8AEF]">
                      Read more <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
