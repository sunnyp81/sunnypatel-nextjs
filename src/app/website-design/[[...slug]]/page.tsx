import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { renderMarkdoc } from "@/lib/render-markdoc";
import { notFound } from "next/navigation";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { getWebsiteDesignVisuals } from "@/data/website-design-visuals";
import Link from "next/link";

const SITE_URL = "https://sunnypatel.co.uk";

function buildBreadcrumbs(slug: string, title: string) {
  const items: Array<{ label: string; href?: string }> = [
    { label: "Home", href: "/" },
    { label: "Website Design", href: slug === "website-design" ? undefined : "/website-design/" },
  ];
  if (slug !== "website-design") items.push({ label: title });
  return items;
}

function buildBreadcrumbSchema(slug: string, title: string) {
  const items = [
    { name: "Home", url: SITE_URL },
    { name: "Website Design", url: `${SITE_URL}/website-design/` },
  ];
  if (slug !== "website-design") {
    items.push({ name: title, url: `${SITE_URL}/website-design/${slug}/` });
  }
  return breadcrumbSchema(items);
}

function buildServiceSchema(page: {
  title: string;
  description: string;
  priceFrom: number;
  h1: string;
}, slug: string) {
  const url = slug === "website-design"
    ? `${SITE_URL}/website-design/`
    : `${SITE_URL}/website-design/${slug}/`;
  const offer = page.priceFrom > 0
    ? {
        "@type": "Offer",
        price: page.priceFrom,
        priceCurrency: "GBP",
        url,
        availability: "https://schema.org/InStock",
      }
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.h1 || page.title,
    description: page.description,
    provider: {
      "@type": "Person",
      name: "Sunny Patel",
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    url,
    ...(offer ? { offers: offer } : {}),
  };
}

export async function generateStaticParams() {
  const slugs = await reader.collections.websiteDesign.list();
  // ROOT page: /website-design/ (empty slug array)
  // SEED/NODE pages: /website-design/<slug>/ (single-segment slug)
  return [
    { slug: [] },
    ...slugs
      .filter((s) => s !== "website-design")
      .map((slug) => ({ slug: [slug] })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const slugStr = !slug || slug.length === 0 ? "website-design" : slug[0];
  const page = await reader.collections.websiteDesign.read(slugStr);
  if (!page) return {};
  const path = slugStr === "website-design"
    ? "/website-design/"
    : `/website-design/${slugStr}/`;
  return buildMetadata({
    title: page.metaTitle || page.title,
    description: page.description,
    ogImage: page.ogImage,
    path,
  });
}

export default async function WebsiteDesignPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const slugStr = !slug || slug.length === 0 ? "website-design" : slug[0];
  const page = await reader.collections.websiteDesign.read(slugStr);
  if (!page) notFound();

  const rawContent = await page.content();
  const rendered = renderMarkdoc(rawContent);
  const breadcrumbItems = buildBreadcrumbs(slugStr, page.title);
  const isRoot = slugStr === "website-design";
  const visuals = getWebsiteDesignVisuals(slugStr);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaGraph(
            buildServiceSchema(
              {
                title: page.title,
                description: page.description,
                priceFrom: page.priceFrom ?? 0,
                h1: page.h1 || page.title,
              },
              slugStr
            ),
            buildBreadcrumbSchema(slugStr, page.title)
          ),
        }}
      />
      <ContentPage
        h1={page.h1 || page.title}
        subtitle={page.subtitle}
        badge={isRoot ? "Website Design" : "Website Design Cluster"}
        backHref={isRoot ? undefined : "/website-design/"}
        backLabel="All Website Design"
        breadcrumbItems={breadcrumbItems}
        showCta={true}
        isService={true}
        ctaTitle="Want a price for your project?"
        ctaSubtitle="Message me at Hello@SunnyPatel.co.uk or call 07305 523333. Same working day response with a fixed quote and a timeline."
      >
        {visuals?.intro}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-[var(--font-heading)] prose-headings:tracking-tight prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-table:my-6 prose-th:text-foreground prose-td:text-muted-foreground">
          {rendered}
        </div>
        {visuals?.close}
        <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h3 className="text-lg font-semibold text-foreground">Explore the website design cluster</h3>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
            <li><Link href="/website-design/" className="text-brand hover:underline">Website design overview</Link></li>
            <li><Link href="/website-design/wordpress/" className="text-brand hover:underline">WordPress web design</Link></li>
            <li><Link href="/website-design/small-business/" className="text-brand hover:underline">Small business websites</Link></li>
            <li><Link href="/website-design/packages/" className="text-brand hover:underline">Packages and pricing</Link></li>
            <li><Link href="/website-design/seo/" className="text-brand hover:underline">SEO web design</Link></li>
            <li><Link href="/website-design/redesign/" className="text-brand hover:underline">Website redesign</Link></li>
            <li><Link href="/website-design/platforms/" className="text-brand hover:underline">Platforms hub</Link></li>
            <li><Link href="/website-design/industries/" className="text-brand hover:underline">Industries hub</Link></li>
            <li><Link href="/website-design/pricing/" className="text-brand hover:underline">Pricing hub</Link></li>
            <li><Link href="/website-design/seo-performance/" className="text-brand hover:underline">SEO + performance hub</Link></li>
            <li><Link href="/website-design/redesign-ux/" className="text-brand hover:underline">Redesign + UX hub</Link></li>
            <li><Link href="/website-design/proof/" className="text-brand hover:underline">Proof hub</Link></li>
            <li><Link href="/website-design/portfolio/" className="text-brand hover:underline">Portfolio</Link></li>
            <li><Link href="/website-design/case-studies/" className="text-brand hover:underline">Case studies</Link></li>
          </ul>
        </div>
      </ContentPage>
    </>
  );
}
