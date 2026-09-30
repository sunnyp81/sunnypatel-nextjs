export type SchemaIssue = { level: "error" | "warning" | "note"; message: string; path: string };
type Rule = { required: string[]; recommended: string[]; doc: string; generator?: string };
const BASE = "https://developers.google.com/search/docs/appearance/structured-data/";
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
  Article: { required: [], recommended: ["headline", "image", "author", "datePublished", "dateModified"], doc: BASE + "article", generator: "article" },
  Product: { required: ["name", "review|aggregateRating|offers"], recommended: ["image", "description", "brand"], doc: BASE + "product-snippet", generator: "product" },
  Offer: { required: ["price|priceSpecification.price", "priceCurrency|priceSpecification.priceCurrency"], recommended: ["availability", "url"], doc: BASE + "product-snippet", generator: "product" },
  Review: { required: ["author", "reviewRating.ratingValue", "itemReviewed"], recommended: ["datePublished", "reviewBody"], doc: BASE + "review-snippet", generator: "review" },
  AggregateRating: { required: ["ratingValue", "ratingCount|reviewCount"], recommended: ["bestRating", "worstRating"], doc: BASE + "review-snippet", generator: "review" },
  BreadcrumbList: { required: ["itemListElement"], recommended: [], doc: BASE + "breadcrumb", generator: "breadcrumb" },
  LocalBusiness: { required: ["name", "address"], recommended: ["telephone", "url", "openingHoursSpecification"], doc: BASE + "local-business", generator: "local-business" },
  Organization: { required: [], recommended: ["name", "url", "logo", "sameAs"], doc: BASE + "organization", generator: "organization" },
  Event: { required: ["name", "startDate", "location"], recommended: ["image", "description", "endDate", "offers"], doc: BASE + "event", generator: "event" },
  JobPosting: { required: ["title", "description", "datePosted", "hiringOrganization", "jobLocation|jobLocationType"], recommended: ["validThrough", "baseSalary", "employmentType"], doc: BASE + "job-posting", generator: "job-posting" },
  Recipe: { required: ["name", "image"], recommended: ["author", "datePublished", "description", "recipeIngredient", "recipeInstructions"], doc: BASE + "recipe" },
  VideoObject: { required: ["name", "thumbnailUrl", "uploadDate"], recommended: ["description", "contentUrl", "embedUrl", "duration"], doc: BASE + "video", generator: "video" },
  SoftwareApplication: { required: ["name", "offers.price"], recommended: ["applicationCategory", "operatingSystem", "aggregateRating"], doc: BASE + "software-app", generator: "software-application" },
  Person: { required: [], recommended: ["name", "image", "description"], doc: BASE + "profile-page", generator: "person" },
  ProfilePage: { required: ["mainEntity"], recommended: ["dateCreated", "dateModified"], doc: BASE + "profile-page" },
  Dataset: { required: ["name", "description"], recommended: ["creator", "license", "distribution", "datePublished"], doc: BASE + "dataset" },
};

function has(node: Record<string, unknown>, path: string): boolean {
  return path.split("|").some(option => {
    const value = option.split(".").reduce<unknown>((part, key) => part && typeof part === "object" ? (part as Record<string, unknown>)[key] : undefined, node);
    return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
  });
}

export function validateSchema(input: string): SchemaIssue[] {
  let data: unknown;
  try { data = JSON.parse(input.trim().replace(/^<script\b[^>]*>/i, "").replace(/<\/script>\s*$/i, "")); }
  catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    const match = message.match(/position (\d+)/i);
    const position = match ? Number(match[1]) : 0;
    const line = input.slice(0, position).split("\n").length;
    return [{ level: "error", path: "JSON", message: `${message} (around line ${line})` }];
  }
  const issues: SchemaIssue[] = [];
  const visit = (value: unknown, path: string, inheritedContext = false) => {
    if (Array.isArray(value)) { value.forEach((item, i) => visit(item, `${path}[${i}]`, inheritedContext)); return; }
    if (!value || typeof value !== "object") { issues.push({ level: "error", path, message: "Expected an object or array of objects." }); return; }
    const node = value as Record<string, unknown>;
    const context = Boolean(node["@context"]) || inheritedContext;
    if (!context) issues.push({ level: "error", path, message: "Missing @context." });
    if (node["@graph"] !== undefined) {
      if (!Array.isArray(node["@graph"])) issues.push({ level: "error", path, message: "@graph must be an array." });
      else visit(node["@graph"], `${path}.@graph`, context);
    }
    if (!node["@type"] && node["@graph"] === undefined) issues.push({ level: "error", path, message: "Missing @type." });
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    for (const type of types) {
      if (typeof type !== "string") continue;
      const rule = schemaRules[type];
      if (rule) {
        for (const property of rule.required) if (!(type === "Review" && property === "itemReviewed" && /\.(review|review\[\d+\])$/.test(path)) && !has(node, property)) issues.push({ level: "error", path, message: `${type}: missing required ${property.replaceAll("|", " or ")}.` });
        for (const property of rule.recommended) if (!has(node, property)) issues.push({ level: "warning", path, message: `${type}: consider recommended ${property}.` });
      }
      if (type === "FAQPage") issues.push({ level: "note", path, message: "FAQPage remains valid markup. Google stopped showing FAQ rich results on 7 May 2026." });
      if (type === "HowTo") issues.push({ level: "note", path, message: "HowTo remains valid markup. Google retired its HowTo rich result." });
      if (type === "Person") issues.push({ level: "note", path, message: "Person has no standalone Google rich result. ProfilePage has separate requirements." });
    }
    for (const [key, child] of Object.entries(node)) if (key !== "@graph" && key !== "@context" && child && typeof child === "object") {
      const checkNested = (item: unknown, sub: string) => { if (item && typeof item === "object" && "@type" in item) visit(item, sub, context); };
      if (Array.isArray(child)) child.forEach((item, i) => checkNested(item, `${path}.${key}[${i}]`)); else checkNested(child, `${path}.${key}`);
    }
  };
  visit(data, "$", false);
  return issues;
}
