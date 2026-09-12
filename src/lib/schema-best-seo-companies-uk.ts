import { seoCompanies } from "@/data/seo-companies";

/** Alphabetical editorial shortlist, not a scored ranking or review aggregate. */
export function bestSeoCompaniesUkSchemas(): Record<string, unknown>[] {
  return [{
    "@type": "ItemList",
    "@id": "https://sunnypatel.co.uk/blog/best-seo-companies-uk/#agency-list",
    name: "UK SEO agency and consultant shortlist",
    description: "UK SEO providers compared by business need using public services and work. Listed alphabetically; the author's consultancy is separate.",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: seoCompanies.length,
    itemListElement: seoCompanies.map((agency, index) => ({
      "@type": "ListItem", position: index + 1,
      url: `https://sunnypatel.co.uk/blog/best-seo-companies-uk/#${agency.id}`,
      item: { "@type": agency.id === "tom-riley" ? "Person" : "Organization", name: agency.name, url: agency.url, description: agency.fit },
    })),
  }];
}
