import { reader } from "@/lib/content";

export const dynamic = "force-static";

const SITE_URL = "https://sunnypatel.co.uk";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const slugs = await reader.collections.blog.list();
  const posts = (
    await Promise.all(
      slugs.map(async (slug) => {
        const post = await reader.collections.blog.read(slug);
        const date = post?.lastUpdated || post?.date;
        return post && date ? { slug, title: post.title, description: post.description, date: new Date(date) } : null;
      }),
    )
  )
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 30);

  const items = posts
    .map(
      (p) =>
        `<item><title>${esc(p.title)}</title><link>${SITE_URL}/blog/${p.slug}/</link><guid isPermaLink="true">${SITE_URL}/blog/${p.slug}/</guid><pubDate>${p.date.toUTCString()}</pubDate><description>${esc(p.description ?? "")}</description></item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Sunny Patel SEO &amp; AI Consultant</title><link>${SITE_URL}/blog/</link><description>SEO, AI search and website guides from Sunny Patel.</description><language>en-gb</language><atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
