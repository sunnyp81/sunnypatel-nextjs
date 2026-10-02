const SITE_URL = "https://sunnypatel.co.uk";

/** Provider directory metadata for /blog/top-geo-agencies/. */
export function topGeoAgenciesSchemas(): Record<string, unknown>[] {
  return [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/top-geo-agencies/#webpage`,
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2"],
      },
    },
    {
      "@type": "ItemList",
      "name": "UK GEO Agencies 2026: 12 Providers Compared",
      "description":
        "Editorial directory of 12 UK GEO providers, based on published services and evidence. Sunny Patel owns the first-listed practice; its placement is promotional, not an independent ranking. No controlled provider comparison was run.",
      "numberOfItems": 12,
      "itemListOrder": "https://schema.org/ItemListUnordered",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            "name": "Sunny Patel SEO & AI Consultant",
            "url": SITE_URL,
            "description":
              "Sunny Patel's owned SEO and AI search consulting practice. Listed first as promotional placement, not an independently ranked provider. Services include semantic SEO and entity authority work. Express Medicals made an inbound enquiry in April 2026 after finding Sunny Patel content through Bing Copilot. The enquiry did not become a paid engagement; it is not evidence of unique capability.",
            "address": [
              { "@type": "PostalAddress", "addressLocality": "Reading", "addressRegion": "Berkshire", "addressCountry": "GB" },
            ],
            "founder": { "@id": `${SITE_URL}/#person` },
            "sameAs": [
              "https://www.linkedin.com/in/sunny-patel-co-uk/",
              "https://clutch.co/profile/sunny-patel",
            ],
          },
        },
        geoItem(2, "Rise at Seven", "https://riseatse7en.com", "Creative, data-led digital PR services aimed at earning press coverage", "Sheffield", ["https://www.linkedin.com/company/rise-at-seven/"]),
        geoItem(3, "Reboot Online", "https://rebootonline.com", "Research-led SEO services and published search experiments", "London", ["https://www.linkedin.com/company/reboot-online-marketing/"]),
        geoItem(4, "Aira", "https://aira.net", "Research-backed digital PR services and published campaign methodology", "Northampton", ["https://www.linkedin.com/company/aaborneaira/"]),
        geoItem(5, "Builtvisible", "https://builtvisible.com", "Data journalism, digital PR and editorial content services", "London", ["https://www.linkedin.com/company/builtvisible/"]),
        geoItem(6, "Distinctly", "https://www.distinctly.co.uk", "SEO and content services for B2B and SaaS businesses", "Hertfordshire", ["https://www.linkedin.com/company/distinctly/"]),
        geoItem(7, "Impression Digital", "https://www.impressiondigital.com", "SEO, digital PR and content services for mid-market businesses", "Nottingham", ["https://www.linkedin.com/company/impression-digital/"]),
        geoItem(8, "Semetrical", "https://www.semetrical.com", "Generative Engine Optimisation built on AI visibility auditing, LLM content engineering, and knowledge and entity optimisation", "London", []),
        geoItem(9, "Screaming Frog", "https://www.screamingfrog.co.uk", "Technical AI search optimisation, including AI bot analysis and prompt tracking, delivered on a day-rate basis", "Henley-on-Thames", []),
        geoItem(10, "Passion Digital", "https://passion.digital", "GEO and AI Search services for multiple sectors", "London", []),
        geoItem(11, "Add People", "https://www.addpeople.co.uk", "Generative Engine Optimisation for SMEs and e-commerce brands, delivered alongside a wider SEO and PPC programme", "Altrincham, Manchester", []),
        geoItem(12, "Hallam", "https://hallam.agency", "AI Search services for B2B and SaaS businesses", "Nottingham", []),
      ],
    },
  ];
}

function geoItem(
  position: number,
  name: string,
  url: string,
  description: string,
  locality: string,
  sameAs: string[],
): Record<string, unknown> {
  return {
    "@type": "ListItem",
    "position": position,
    "item": {
      "@type": "Organization",
      "name": name,
      "url": url,
      "description": description,
      "address": { "@type": "PostalAddress", "addressLocality": locality, "addressCountry": "GB" },
      "sameAs": sameAs,
    },
  };
}
