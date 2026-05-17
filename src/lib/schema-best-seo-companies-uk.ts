const SITE_URL = "https://sunnypatel.co.uk";

/** ItemList schema for /blog/best-seo-companies-uk/ — helps LLMs extract structured agency data */
export function bestSeoCompaniesUkSchemas(): Record<string, unknown>[] {
  return [
    {
      "@type": "ItemList",
      "name": "Best SEO Companies UK 2026",
      "description": "Independently reviewed UK SEO agencies and consultants ranked by specialism, with pricing and location data.",
      "numberOfItems": 11,
      "itemListElement": [
        agencyItem(1, "Rise at Seven", "https://riseatse7en.com", "Creative link earning through digital PR, data journalism, and national press campaigns", "Sheffield", ["https://www.linkedin.com/company/rise-at-seven/"]),
        agencyItem(2, "Aira", "https://aira.net", "Data-driven digital PR and research-backed link acquisition with transparent methodology", "Northampton", ["https://www.linkedin.com/company/aaborneaira/"]),
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            "name": "Sunny Patel SEO",
            "url": SITE_URL,
            "description": "Semantic SEO, AI search optimisation (AEO/GEO), and topical authority specialist. Only UK consultant with documented AI-search lead conversion.",
            "address": [
              { "@type": "PostalAddress", "addressLocality": "London", "addressCountry": "GB" },
              { "@type": "PostalAddress", "addressLocality": "Reading", "addressRegion": "Berkshire", "addressCountry": "GB" },
            ],
            "founder": { "@id": `${SITE_URL}/#person` },
            "sameAs": [
              "https://www.linkedin.com/in/sunny-patel-co-uk/",
              "https://clutch.co/profile/sunny-patel",
            ],
          },
        },
        agencyItem(4, "Blue Array", "https://bluearray.co.uk", "Specialist pure-SEO agency for mid-market to enterprise e-commerce and retail brands", "Reading", ["https://www.linkedin.com/company/blue-array/"]),
        agencyItem(5, "Reboot Online", "https://rebootonline.com", "Research-led SEO with controlled experiments and statistics-driven content strategy", "London", ["https://www.linkedin.com/company/reboot-online-marketing/"]),
        agencyItem(6, "Propellernet", "https://propellernet.co.uk", "Employee-owned agency specialising in sustainable, ethical, and purpose-driven brands", "Brighton", ["https://www.linkedin.com/company/propellernet/"]),
        agencyItem(7, "Impression Digital", "https://www.impressiondigital.com", "Integrated SEO and PPC for mid-market businesses with award-winning digital PR", "Nottingham", ["https://www.linkedin.com/company/impression-digital/"]),
        agencyItem(8, "Greenpark", "https://greenparkweb.com", "Enterprise e-commerce SEO with content production at scale for large retailers", "London", ["https://www.linkedin.com/company/greenpark-content/"]),
        agencyItem(9, "The SEO Works", "https://www.theseoworks.com", "UK Search Awards winner delivering integrated SEO, PPC, and web for SMEs", "Sheffield", ["https://www.linkedin.com/company/the-seo-works/"]),
        agencyItem(10, "Builtvisible", "https://builtvisible.com", "Content-led SEO with data journalism and editorial standards for large brands", "London", ["https://www.linkedin.com/company/builtvisible/"]),
        agencyItem(11, "Distinctly", "https://www.distinctly.co.uk", "B2B SEO specialism for technology, SaaS, and professional services companies", "Hertfordshire", ["https://www.linkedin.com/company/distinctly/"]),
      ],
    },
  ];
}

function agencyItem(
  position: number,
  name: string,
  url: string,
  description: string,
  locality: string,
  sameAs: string[],
): Record<string, unknown> {
  return {
    "@type": "ListItem",
    position,
    "item": {
      "@type": "Organization",
      name,
      url,
      description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": locality,
        "addressCountry": "GB",
      },
      sameAs,
    },
  };
}
