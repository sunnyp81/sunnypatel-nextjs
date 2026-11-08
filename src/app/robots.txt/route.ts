// Route handler (not the robots.ts metadata file) so the EntityMap discovery line can be included.
const SITE_URL = "https://sunnypatel.co.uk";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /keystatic/",
    "Disallow: /api/",
    "Disallow: /for/",
    "",
    `Host: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `EntityMap: ${SITE_URL}/entitymap.json`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
