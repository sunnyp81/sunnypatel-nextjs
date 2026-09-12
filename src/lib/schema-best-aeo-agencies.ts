import { aeoProviders } from "@/data/aeo-providers";

export function bestAeoAgenciesSchemas(): Record<string, unknown>[] {
  return [{
    "@type": "ItemList",
    "@id": "https://sunnypatel.co.uk/blog/best-aeo-agencies/#agency-list",
    name: "UK AEO agency and consultant shortlist",
    description: "Eight providers listed alphabetically, including Sunny Patel, the guide author's consultancy, and seven external options. Not an independently tested ranking.",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: aeoProviders.length,
    itemListElement: aeoProviders.map((provider, index) => ({
      "@type": "ListItem", position: index + 1,
      url: `https://sunnypatel.co.uk/blog/best-aeo-agencies/#${provider.id}`,
      item: {
        "@type": provider.needs.includes("consultant") ? "Person" : "Organization",
        name: provider.name, url: provider.url,
        description: provider.owned ? `${provider.fit}. The guide author's own consultancy.` : provider.fit,
      },
    })),
  }];
}
