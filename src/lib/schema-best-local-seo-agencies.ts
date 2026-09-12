import { localSeoProviders } from "@/data/local-seo-providers";

/** Alphabetical editorial shortlist, including the visibly labelled author's practice. */
export function bestLocalSeoAgenciesSchemas(): Record<string, unknown>[] {
  return [{
    "@type": "ItemList",
    "@id": "https://sunnypatel.co.uk/blog/best-local-seo-agencies/#agency-list",
    name: "UK local SEO agency and consultant shortlist",
    description: "Ten UK local SEO providers listed alphabetically, including Sunny Patel, the guide author's own consultancy, and nine external providers. Not an independently tested ranking.",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: localSeoProviders.length,
    itemListElement: localSeoProviders.map((provider, index) => ({
      "@type": "ListItem", position: index + 1,
      url: `https://sunnypatel.co.uk/blog/best-local-seo-agencies/#${provider.id}`,
      item: {
        "@type": provider.needs.includes("consultant") ? "Person" : "Organization",
        name: provider.name, url: provider.url,
        description: provider.owned ? `${provider.fit}. The guide author's own consultancy.` : provider.fit,
      },
    })),
  }];
}
