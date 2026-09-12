import { seoCompanies } from "@/data/seo-companies";

/** Alphabetical editorial shortlist, not a scored ranking or review aggregate. */
export function bestSeoCompaniesUkSchemas(): Record<string, unknown>[] {
  return [{
    "@type": "ItemList",
    "@id": "https://sunnypatel.co.uk/blog/best-seo-companies-uk/#agency-list",
    name: "UK SEO agency and consultant shortlist",
    description: "16 UK SEO providers listed alphabetically, including Sunny Patel, the guide author's own consultancy, and 15 external providers. An editorial shortlist, not an independent ranking.",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: seoCompanies.length,
    itemListElement: seoCompanies.map((agency, index) => ({
      "@type": "ListItem", position: index + 1,
      url: `https://sunnypatel.co.uk/blog/best-seo-companies-uk/#${agency.id}`,
      item: { "@type": agency.needs.includes("consultant") ? "Person" : "Organization", name: agency.name, url: agency.url, description: agency.owned ? `${agency.fit}. The guide author's own consultancy.` : agency.fit },
    })),
  }];
}
