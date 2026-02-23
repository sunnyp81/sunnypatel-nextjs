import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string | null;
  ogImage: string | null;
  tags: readonly string[];
};

export function RelatedPosts({
  currentSlug,
  currentTags,
  allPosts,
}: {
  currentSlug: string;
  currentTags: readonly string[];
  allPosts: PostSummary[];
}) {
  const scored = allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      const overlap = p.tags.filter((t) => currentTags.includes(t)).length;
      return { ...p, score: overlap };
    })
    .sort((a, b) => b.score - a.score || (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 3);

  if (scored.length === 0) return null;

  return (
    <div className="border-t border-white/[0.05]">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2
          className="mb-8 text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          Related Articles
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {scored.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              {post.ogImage && (
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={post.ogImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                {post.date && (
                  <div className="mb-3 text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}
                <h3
                  className="mb-2 flex-1 text-base font-semibold text-foreground transition-colors duration-200 group-hover:text-[#5B8AEF]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {post.title}
                </h3>
                {post.description && (
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/40 transition-all duration-200 group-hover:gap-2 group-hover:text-[#5B8AEF]">
                  Read more <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
