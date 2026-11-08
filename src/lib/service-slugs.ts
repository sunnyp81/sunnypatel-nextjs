export const NOINDEX_SLUGS = new Set([
  "seo-consultant-birmingham",
  "seo-consultant-bradford",
  "seo-consultant-brighton",
  "seo-consultant-cardiff",
  "seo-consultant-devon",
  "seo-consultant-edinburgh",
  "seo-consultant-essex",
  "seo-consultant-glasgow",
  "seo-consultant-harrogate",
  "seo-consultant-leeds",
  "seo-consultant-manchester",
  "seo-consultant-nottingham",
  "seo-consultant-oxford",
  "seo-consultant-preston",
  "seo-consultant-sheffield",
  "seo-consultant-southampton",
  "seo-consultant-surrey",
  "seo-consultant-york",
]);

export const REDIRECTED_SLUGS = new Set([
  "local-seo-agency",
  "seo-strategy-consulting-expert-guidance-for-in-house-teams",
  "seo-consultant-london",
  "seo-consultant-kent",
  ...NOINDEX_SLUGS,
]);

/** Service pages that get a Markdown copy: indexable, self-canonical, not redirected. */
export const hasMarkdownTwin = (slug: string) => !REDIRECTED_SLUGS.has(slug);
