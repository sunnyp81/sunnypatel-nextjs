import { reader } from "@/lib/content";
import { serviceMarkdown } from "@/lib/markdown-twin";
import { hasMarkdownTwin } from "@/lib/service-slugs";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await reader.collections.services.list();
  return slugs.filter(hasMarkdownTwin).map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const md = hasMarkdownTwin(slug) ? serviceMarkdown(slug) : null;
  if (!md) return new Response("Not found", { status: 404 });
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<https://sunnypatel.co.uk/services/${slug}/>; rel="canonical", </llms.txt>; rel="describedby"`,
    },
  });
}
