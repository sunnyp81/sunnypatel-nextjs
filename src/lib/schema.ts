const SITE_URL = "https://sunnypatel.co.uk";

export function personSchema() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: "Sunny Patel",
    jobTitle: "SEO Consultant & AI Strategist",
    url: SITE_URL,
    sameAs: [
      "https://www.linkedin.com/in/sunny-patel-co-uk/",
      "https://g.co/kgs/SunnyPatelSEO",
      "https://www.sunnypatel.co.uk",
    ],
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    knowsAbout: [
      "Semantic SEO",
      "Topical Authority",
      "Entity SEO",
      "AI Search Optimisation",
      "Content Strategy",
      "Technical SEO",
    ],
    image: `${SITE_URL}/images/sunny-patel.jpg`,
  };
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Sunny Patel SEO",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    founder: { "@id": `${SITE_URL}/#person` },
    sameAs: [
      "https://www.linkedin.com/in/sunny-patel-co-uk/",
      "https://g.co/kgs/SunnyPatelSEO",
    ],
  };
}

export function localBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "Sunny Patel SEO",
    url: SITE_URL,
    telephone: "",
    email: "hello@sunnypatel.co.uk",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Reading",
      addressRegion: "Berkshire",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.4543,
      longitude: -0.9781,
    },
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    founder: { "@id": `${SITE_URL}/#person` },
    priceRange: "$$",
    sameAs: [
      "https://www.linkedin.com/in/sunny-patel-co-uk/",
      "https://g.co/kgs/SunnyPatelSEO",
    ],
  };
}

export function articleSchema({
  title,
  description,
  slug,
  date,
}: {
  title: string;
  description: string;
  slug: string;
  date?: string;
}) {
  return {
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${SITE_URL}/blog/${slug}`,
    ...(date && { datePublished: date }),
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function serviceSchema({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@type": "ProfessionalService",
    name,
    description,
    url: `${SITE_URL}/services/${slug}`,
    provider: { "@id": `${SITE_URL}/#person` },
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function portfolioSchema({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  return {
    "@type": "CreativeWork",
    headline: title,
    description,
    url: `${SITE_URL}/portfolio/${slug}`,
    author: { "@id": `${SITE_URL}/#person` },
  };
}

export function schemaGraph(...schemas: Record<string, unknown>[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas,
  });
}
