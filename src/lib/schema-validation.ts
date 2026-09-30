export type SchemaIssue = {
  level: "error" | "warning" | "note";
  message: string;
  path: string;
};
type Rule = {
  required: string[];
  recommended: string[];
  doc: string;
  generator?: string;
};
const BASE =
  "https://developers.google.com/search/docs/appearance/structured-data/";
// Article: https://developers.google.com/search/docs/appearance/structured-data/article
// Product and Offer: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
// Review and AggregateRating: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
// BreadcrumbList: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
// LocalBusiness: https://developers.google.com/search/docs/appearance/structured-data/local-business
// Organization: https://developers.google.com/search/docs/appearance/structured-data/organization
// Event: https://developers.google.com/search/docs/appearance/structured-data/event
// JobPosting: https://developers.google.com/search/docs/appearance/structured-data/job-posting
// Recipe: https://developers.google.com/search/docs/appearance/structured-data/recipe
// VideoObject: https://developers.google.com/search/docs/appearance/structured-data/video
// SoftwareApplication: https://developers.google.com/search/docs/appearance/structured-data/software-app
// Person and ProfilePage: https://developers.google.com/search/docs/appearance/structured-data/profile-page
// Dataset: https://developers.google.com/search/docs/appearance/structured-data/dataset
export const schemaRules: Record<string, Rule> = {
  Article: {
    required: [],
    recommended: [
      "headline",
      "image",
      "author",
      "datePublished",
      "dateModified",
    ],
    doc: BASE + "article",
    generator: "article",
  },
  Product: {
    required: ["name", "review|aggregateRating|offers"],
    recommended: ["image", "description", "brand"],
    doc: BASE + "product-snippet",
    generator: "product",
  },
  Offer: {
    required: [
      "price|priceSpecification.price",
      "priceCurrency|priceSpecification.priceCurrency",
    ],
    recommended: ["availability", "url"],
    doc: BASE + "product-snippet",
    generator: "product",
  },
  Review: {
    required: ["author", "reviewRating.ratingValue", "itemReviewed"],
    recommended: ["datePublished", "reviewBody"],
    doc: BASE + "review-snippet",
    generator: "review",
  },
  AggregateRating: {
    required: ["ratingValue", "ratingCount|reviewCount"],
    recommended: ["bestRating", "worstRating"],
    doc: BASE + "review-snippet",
    generator: "review",
  },
  BreadcrumbList: {
    required: ["itemListElement"],
    recommended: [],
    doc: BASE + "breadcrumb",
    generator: "breadcrumb",
  },
  LocalBusiness: {
    required: [],
    recommended: ["name", "address", "telephone", "url"],
    doc: BASE + "local-business",
    generator: "local-business",
  },
  Organization: {
    required: [],
    recommended: ["name", "url", "logo", "sameAs"],
    doc: BASE + "organization",
    generator: "organization",
  },
  Event: {
    required: ["name", "startDate", "location"],
    recommended: ["image", "description", "endDate", "offers"],
    doc: BASE + "event",
    generator: "event",
  },
  JobPosting: {
    required: [
      "title",
      "description",
      "datePosted",
      "hiringOrganization",
      "jobLocation|jobLocationType",
    ],
    recommended: ["validThrough", "baseSalary", "employmentType"],
    doc: BASE + "job-posting",
    generator: "job-posting",
  },
  Recipe: {
    required: ["name", "image"],
    recommended: [
      "author",
      "datePublished",
      "description",
      "recipeIngredient",
      "recipeInstructions",
    ],
    doc: BASE + "recipe",
  },
  VideoObject: {
    required: ["name", "thumbnailUrl", "uploadDate"],
    recommended: ["description", "contentUrl", "embedUrl", "duration"],
    doc: BASE + "video",
    generator: "video",
  },
  SoftwareApplication: {
    required: ["name", "offers.price"],
    recommended: ["applicationCategory", "operatingSystem", "aggregateRating"],
    doc: BASE + "software-app",
    generator: "software-application",
  },
  Person: {
    required: [],
    recommended: ["name", "image", "description"],
    doc: BASE + "profile-page",
    generator: "person",
  },
  ProfilePage: {
    required: ["mainEntity"],
    recommended: ["dateCreated", "dateModified"],
    doc: BASE + "profile-page",
  },
  Dataset: {
    required: ["name", "description"],
    recommended: ["creator", "license", "distribution", "datePublished"],
    doc: BASE + "dataset",
  },
};

function has(node: Record<string, unknown>, path: string): boolean {
  return path.split("|").some((option) => {
    const value = option
      .split(".")
      .reduce<unknown>(
        (part, key) =>
          part && typeof part === "object"
            ? (part as Record<string, unknown>)[key]
            : undefined,
        node,
      );
    return (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    );
  });
}

const commonTypes = new Set(
  `
  AboutPage AdministrativeArea AggregateOffer AggregateRating Answer Article AudioObject
  BedAndBreakfast Blog BlogPosting Book Brand BreadcrumbList BusinessAudience
  City CollectionPage ContactPage Country CreativeWork DataCatalog Dataset DefinedTerm
  EducationalOrganization Event FAQPage GovernmentOrganization HowTo ImageObject
  ItemList JobPosting ListItem LocalBusiness MedicalOrganization MonetaryAmount
  Movie NewsArticle Occupation Offer OfferCatalog OnlineStore Organization Person Place PostalAddress
  Product ProfessionalService ProfilePage Question Rating Recipe Review SearchAction Service
  SiteNavigationElement SoftwareApplication Thing TouristAttraction VideoObject WebApplication
  WebPage WebPageElement WebSite DefinedTermSet
`
    .trim()
    .split(/\s+/),
);

function schemaContext(value: unknown): boolean {
  if (typeof value === "string")
    return /^https?:\/\/schema\.org\/?$/i.test(value);
  if (Array.isArray(value)) return value.some(schemaContext);
  if (value && typeof value === "object") {
    return Object.values(value).some(schemaContext);
  }
  return false;
}

function validDate(value: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
      value,
    )
  ) {
    return false;
  }
  const date = new Date(value);
  return (
    !Number.isNaN(date.valueOf()) &&
    date.toISOString().slice(0, 10) === value.slice(0, 10)
  );
}

export function validateSchema(input: string): SchemaIssue[] {
  let data: unknown;
  try {
    data = JSON.parse(
      input
        .trim()
        .replace(/^<script\b[^>]*>/i, "")
        .replace(/<\/script>\s*$/i, ""),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    const match = message.match(/position (\d+)/i);
    const position = match ? Number(match[1]) : 0;
    const line = input.slice(0, position).split("\n").length;
    return [
      {
        level: "error",
        path: "JSON",
        message: `${message} (around line ${line})`,
      },
    ];
  }
  const issues: SchemaIssue[] = [];
  const add = (level: SchemaIssue["level"], path: string, message: string) => {
    issues.push({ level, path, message });
  };
  const visit = (
    value: unknown,
    path: string,
    context = false,
    standalone = false,
    parentType = "",
    property = "",
  ) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        visit(
          item,
          `${path}[${index}]`,
          context,
          standalone,
          parentType,
          property,
        ),
      );
      return;
    }
    if (!value || typeof value !== "object") {
      add("error", path, "Expected an object or array of objects.");
      return;
    }
    const node = value as Record<string, unknown>;
    const ownContext = node["@context"];
    const validContext =
      ownContext === undefined ? context : schemaContext(ownContext);
    if (!validContext) {
      add(
        "error",
        path,
        ownContext === undefined
          ? "Missing @context."
          : "@context must use schema.org.",
      );
    }
    const types = (
      Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]
    ).filter((type): type is string => typeof type === "string");
    const type = types[0] || "";
    if (
      !types.length &&
      node["@graph"] === undefined &&
      (standalone || path === "$")
    ) {
      add("error", path, "Missing @type.");
    }
    for (const name of types) {
      if (!commonTypes.has(name) && !/^https?:\/\//.test(name)) {
        add(
          "warning",
          `${path}.@type`,
          `Unknown schema.org @type "${name}". Check its spelling.`,
        );
      }
      const rule = schemaRules[name];
      const referenceOnly =
        Boolean(node["@id"]) &&
        Object.keys(node).every((key) =>
          ["@id", "@type", "review", "aggregateRating"].includes(key),
        );
      const richCandidate =
        name === "Offer"
          ? (parentType === "Product" ||
              parentType === "SoftwareApplication") &&
            property === "offers"
          : standalone && !referenceOnly;
      if (
        rule &&
        richCandidate &&
        name !== "Organization" &&
        name !== "Person"
      ) {
        for (const required of rule.required) {
          if (!has(node, required)) {
            add(
              "error",
              path,
              `${name}: missing required ${required.replaceAll("|", " or ")}.`,
            );
          }
        }
        const missing = rule.recommended.filter(
          (recommended) =>
            !has(node, recommended) &&
            !(
              name === "LocalBusiness" &&
              recommended === "address" &&
              has(node, "areaServed")
            ),
        );
        if (missing.length) {
          add(
            "warning",
            path,
            `${name}: consider recommended ${missing.join(", ")}.`,
          );
        }
      }
      if (
        standalone &&
        (name === "Organization" || name === "Person") &&
        rule
      ) {
        const missing = rule.recommended.filter(
          (recommended) => !has(node, recommended),
        );
        if (missing.length)
          add(
            "note",
            path,
            `${name}: optional details to consider: ${missing.join(", ")}.`,
          );
      }
      if (standalone && name === "FAQPage") {
        add(
          "note",
          path,
          "FAQPage remains valid markup, but has no current Google FAQ rich result.",
        );
      }
      if (standalone && name === "HowTo") {
        add(
          "note",
          path,
          "HowTo remains valid markup, but Google retired its rich result.",
        );
      }
    }
    if (node["@graph"] !== undefined && !Array.isArray(node["@graph"])) {
      add("error", `${path}.@graph`, "@graph must be an array.");
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "@context") continue;
      const childPath = `${path}.${key}`;
      if (
        child === null ||
        child === "" ||
        (Array.isArray(child) && !child.length)
      ) {
        add("warning", childPath, `Empty ${key} value.`);
      }
      if (
        /^date[A-Z]|Date$/.test(key) &&
        typeof child === "string" &&
        !validDate(child)
      ) {
        add(
          "warning",
          childPath,
          `Invalid date format in ${key}. Use an ISO 8601 date.`,
        );
      }
      if (["url", "image", "logo", "sameAs"].includes(key)) {
        const values = Array.isArray(child) ? child : [child];
        values.forEach((entry, index) => {
          if (typeof entry === "string" && !/^https?:\/\//i.test(entry)) {
            add(
              "warning",
              Array.isArray(child) ? `${childPath}[${index}]` : childPath,
              `Relative URL in ${key}. Use an absolute URL.`,
            );
          }
        });
      }
      if (key === "@graph" && Array.isArray(child)) {
        visit(child, childPath, validContext, standalone || path === "$");
      } else if (child && typeof child === "object") {
        const nestedStandalone =
          type === "ProfilePage" && key === "mainEntity" && standalone;
        const inspect = (entry: unknown, entryPath: string) => {
          if (entry && typeof entry === "object" && !Array.isArray(entry)) {
            const object = entry as Record<string, unknown>;
            if (object["@type"] || object["@graph"]) {
              visit(
                object,
                entryPath,
                validContext,
                nestedStandalone,
                type,
                key,
              );
            }
          }
        };
        if (Array.isArray(child))
          child.forEach((entry, index) =>
            inspect(entry, `${childPath}[${index}]`),
          );
        else inspect(child, childPath);
      }
    }
  };
  visit(data, "$", false, true);
  return issues;
}
