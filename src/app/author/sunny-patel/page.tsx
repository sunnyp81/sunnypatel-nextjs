import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { personSchema, schemaGraph } from "@/lib/schema";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function generateMetadata() {
  return buildMetadata({
    title: "Sunny Patel | SEO Consultant & AI Strategist | Author",
    description:
      "Articles and guides by Sunny Patel, SEO consultant and AI strategist based in Reading, Berkshire. 15+ years helping UK businesses grow organic traffic.",
    path: "/author/sunny-patel",
  });
}

export default async function AuthorPage() {
  const posts = await reader.collections.blog.all();

  const sorted = posts.sort((a, b) => {
    const dateA = a.entry.date ? new Date(a.entry.date).getTime() : 0;
    const dateB = b.entry.date ? new Date(b.entry.date).getTime() : 0;
    return dateB - dateA;
  });

  const authorSchema = {
    ...personSchema(),
    mainEntityOfPage: {
      "@type": "ProfilePage",
      url: "https://sunnypatel.co.uk/author/sunny-patel",
    },
  };

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaGraph(authorSchema) }}
      />

      <div className="relative overflow-hidden pb-12 pt-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full border-2 border-white/10">
            <Image
              src="/images/sunny-patel.jpg"
              alt="Sunny Patel"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
          <h1
            className="mb-3 text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Sunny Patel
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            SEO consultant and AI strategist based in Reading, Berkshire. 15+ years
            building and ranking content sites through semantic SEO, topical authority,
            and entity optimisation.
          </p>
          <p className="mt-4 text-sm text-muted-foreground/60">
            {sorted.length} {sorted.length === 1 ? "article" : "articles"} published
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
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
      </div>

      <Footer />
    </main>
  );
}
