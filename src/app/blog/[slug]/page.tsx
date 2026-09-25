import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
import { renderMarkdoc } from "@/lib/render-markdoc";
import { articleSchema, faqSchema, breadcrumbSchema, personSchema, schemaGraph } from "@/lib/schema";
import { RelatedPosts } from "@/components/related-posts";
import { RelatedServices } from "@/components/related-services";
import { BlogLeadMagnet } from "@/components/blog-lead-magnet";
import { BlogContextualOffer, offerVariantForSlug } from "@/components/blog-contextual-offer";
import { bestSeoCompaniesUkSchemas } from "@/lib/schema-best-seo-companies-uk";
import { bestAeoAgenciesSchemas } from "@/lib/schema-best-aeo-agencies";
import { bestLocalSeoAgenciesSchemas } from "@/lib/schema-best-local-seo-agencies";
import { topGeoAgenciesSchemas } from "@/lib/schema-top-geo-agencies";
import { SeoCompaniesGuide } from "@/components/seo-companies-guide";
import { LocalSeoGuide } from "@/components/local-seo-guide";
import { AeoGuide } from "@/components/aeo-guide";
import { SeoStatisticsGuide } from "@/components/seo-statistics-guide";
import { ReportHero } from "@/components/report-hero";
import styles from "@/components/seo-companies-guide.module.css";

// Match DynamicIslandTOC's heading IDs, using each post's first H2.
const KEY_STATS_JUMP_HREF: Record<string, string> = {
  "ai-search-statistics": "#ai-search-statistics-2026-quick-answer",
  "content-marketing-statistics": "#content-marketing-industry-overview",
  "local-seo-statistics": "#local-seo-statistics-2026-quick-answer",
};

const REPORT_HERO_CONFIG: Record<
  string,
  {
    eyebrow: string;
    dek: string;
    primaryCta: { label: string; href: string };
    heroImage: string;
    heroImageAlt: string;
    disclosure: string;
  }
> = {
  "managing-44-websites-seo-data": {
    eyebrow: "2026 portfolio SEO data",
    dek: "Real Search Console numbers from running dozens of websites, not one cherry-picked case study.",
    primaryCta: { label: "See where the traffic concentrates", href: "#traffic-concentration" },
    heroImage: "/images/blog/hero-managing-44-websites.webp",
    heroImageAlt: "A papercraft grid of small grey browser-window cards with four glowing website cards standing out at the centre, connected by a blue line",
    disclosure:
      "This is my own portfolio data, not independently audited by a third party. No client sites are included.",
  },
  "how-long-does-seo-take": {
    eyebrow: "2026 SEO timeline data",
    dek: "How long SEO actually takes, backed by real Search Console data from 11 sites launched on the same day.",
    primaryCta: { label: "See the 46-day launch data", href: "#launch-data" },
    heroImage: "/images/blog/hero-how-long-does-seo-take.webp",
    heroImageAlt: "A row of eleven identical papercraft browser-window cards, most with dark grey screens, two glowing with a small blue cursor icon",
    disclosure:
      "The launch-cohort data is my own portfolio data, not independently audited by a third party.",
  },
  "google-update-portfolio-impact": {
    eyebrow: "2026 Google update data",
    dek: "Two unrelated sites dropped 87% and 91% of impressions within 24 hours. Full Search Console data, no confirmed cause.",
    primaryCta: { label: "See the drop data", href: "#headline-drops" },
    heroImage: "/images/blog/hero-google-update-impact.webp",
    heroImageAlt: "A row of papercraft browser-window cards where two at either end are toppled with a jagged blue crack torn through the screen, while the cards between them stand upright and glowing",
    disclosure:
      "This is my own owned-site data, not independently audited. A client property was checked during research and excluded from the published sample.",
  },
  "ai-search-traffic-portfolio-data": {
    eyebrow: "2026 AI search traffic data",
    dek: "How much of my traffic actually comes from ChatGPT, Perplexity and Copilot. Real GA4 numbers, 20 sites.",
    primaryCta: { label: "See the AI traffic share", href: "#findings" },
    heroImage: "/images/blog/hero-ai-search-traffic.webp",
    heroImageAlt: "A small papercraft robot with a blue speech-bubble head walking toward one glowing browser-window card among a row of dark ones",
    disclosure:
      "This is a 20-site sample from my own portfolio, not a full census and not independently audited.",
  },
  "negative-seo-backlink-attack-case-study": {
    eyebrow: "2026 negative SEO case study",
    dek: "763 referring domains, 83% flagged as spam. What the data shows, and what it doesn't.",
    primaryCta: { label: "See the backlink data", href: "#export-contents" },
    heroImage: "/images/blog/hero-negative-seo-case-study.webp",
    heroImageAlt: "A papercraft browser-window card almost entirely covered in tangled paper chain-link shapes, with one navy-blue checkmark badge peeking through underneath",
    disclosure:
      "This is my own site's data, not independently audited. No disavow has been filed as of publication.",
  },
  "aged-domains-and-domain-collisions": {
    eyebrow: "2026 domain strategy case study",
    dek: "Does an aged domain actually rank faster? One real case, plus two domain collisions most owners never check for.",
    primaryCta: { label: "See the aged-domain case", href: "#aged-domain-case" },
    heroImage: "/images/blog/hero-aged-domains.webp",
    heroImageAlt: "Two identical papercraft browser-window cards side by side sharing the same navy-blue URL-bar plaque, one faded and dusty, one crisp and fresh",
    disclosure:
      "One aged domain and two verified collisions from my own portfolio, not a statistically powered study.",
  },
};

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
  const offerVariant = offerVariantForSlug(slug);

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
            personSchema(),
            breadcrumbSchema([
              { name: "Home", url: "https://sunnypatel.co.uk/" },
              { name: "Blog", url: "https://sunnypatel.co.uk/blog/" },
              { name: post.title, url: `https://sunnypatel.co.uk/blog/${slug}/` },
            ]),
            ...(post.faqs && post.faqs.length > 0
              ? [faqSchema(post.faqs.map((f) => ({ q: f.question, a: f.answer })))]
              : []),
            ...(slug === "best-seo-companies-uk" ? bestSeoCompaniesUkSchemas() : []),
            ...(slug === "best-aeo-agencies" ? bestAeoAgenciesSchemas() : []),
            ...(slug === "best-local-seo-agencies" ? bestLocalSeoAgenciesSchemas() : []),
            ...(slug === "top-geo-agencies" ? topGeoAgenciesSchemas() : [])
          ),
        }}
      />
      {slug === "best-seo-companies-uk" ? (
        <SeoCompaniesGuide title={post.title} image={post.ogImage || ""} faqs={post.faqs ?? []}>
          {rendered}
        </SeoCompaniesGuide>
      ) : slug === "best-local-seo-agencies" ? (
        <LocalSeoGuide title={post.title} image={post.ogImage || ""} faqs={post.faqs ?? []}>
          {rendered}
        </LocalSeoGuide>
      ) : slug === "best-aeo-agencies" ? (
        <AeoGuide title={post.title} image={post.ogImage || ""} faqs={post.faqs ?? []}>
          {rendered}
        </AeoGuide>
      ) : slug === "seo-statistics-uk" ? (
        <SeoStatisticsGuide title={post.title} faqs={post.faqs ?? []}>
          {rendered}
        </SeoStatisticsGuide>
      ) : REPORT_HERO_CONFIG[slug] ? (
        <ReportHero
          title={post.title}
          eyebrow={REPORT_HERO_CONFIG[slug].eyebrow}
          dek={REPORT_HERO_CONFIG[slug].dek}
          primaryCta={REPORT_HERO_CONFIG[slug].primaryCta}
          secondaryCta={{ label: "Back to all posts", href: "/blog/" }}
          heroImage={REPORT_HERO_CONFIG[slug].heroImage}
          heroImageAlt={REPORT_HERO_CONFIG[slug].heroImageAlt}
          publishedDate={post.date || undefined}
          updatedDate={post.lastUpdated || undefined}
          disclosure={REPORT_HERO_CONFIG[slug].disclosure}
        >
          {rendered}
          {post.faqs && post.faqs.length > 0 ? (
            <section id="faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
              <h2 id="faq-title">Common questions</h2>
              {post.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
          ) : null}
          <RelatedServices currentTags={post.tags ?? []} postTitle={post.title} />
          <RelatedPosts currentSlug={slug} currentTags={post.tags ?? []} allPosts={postSummaries} />
        </ReportHero>
      ) : <ContentPage
        keyStats={post.keyStats}
        keyStatsJumpHref={KEY_STATS_JUMP_HREF[slug]}
        h1={post.title}
        badge="Blog"
        backHref="/blog"
        backLabel="All Posts"
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
        dateLine={
          post.date
            ? new Date(post.date).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) + (slug === "how-long-does-seo-take" && post.lastUpdated
                ? ` · Updated ${new Date(post.lastUpdated).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`
                : "")
            : undefined
        }
        tags={post.tags ? [...post.tags] : undefined}
        heroImage={post.ogImage || undefined}
        isBlog={true}
        showStickyCta={slug !== "how-long-does-seo-take"}
        showCta={true}
        afterContent={
          <>
            <RelatedPosts
              currentSlug={slug}
              currentTags={post.tags ?? []}
              allPosts={postSummaries}
            />
          </>
        }
      >
        {rendered}
        {post.faqs && post.faqs.length > 0 ? (
          <section aria-labelledby="faq-title" className="mt-10 border-t border-white/[0.08] pt-8">
            <h2 id="faq-title" className="font-[var(--font-heading)] text-2xl font-semibold tracking-tight text-foreground">
              Common questions
            </h2>
            <div className="mt-4 space-y-3">
              {post.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 open:bg-white/[0.03]"
                >
                  <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
        <RelatedServices currentTags={post.tags ?? []} postTitle={post.title} />
        {offerVariant ? <BlogContextualOffer variant={offerVariant} /> : <BlogLeadMagnet />}
      </ContentPage>}
    </>
  );
}
