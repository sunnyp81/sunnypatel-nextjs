export function serializeJsonLdForHtml(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

export function createJsonLdScript(value: Record<string, unknown>): string {
  return `<script type="application/ld+json">\n${serializeJsonLdForHtml(value)}\n</script>`;
}

export function countSchemaItems(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countSchemaItems(item), 0);
  }

  if (!value || typeof value !== "object") return 0;

  const record = value as Record<string, unknown>;
  return (record["@type"] ? 1 : 0) +
    Object.values(record).reduce<number>((total, item) => total + countSchemaItems(item), 0);
}

export type RatingCountKey = "reviewCount" | "ratingCount";

export function buildAggregateRating(
  ratingValue: string,
  count: string,
  countKey: RatingCountKey,
): { aggregateRating?: Record<string, string>; issue?: string } {
  const value = ratingValue.trim();
  const total = count.trim();
  if (value && total) {
    return { aggregateRating: { "@type": "AggregateRating", ratingValue: value, [countKey]: total } };
  }
  const countLabel = countKey === "reviewCount" ? "review count" : "rating count";
  if (value) return { issue: `Add a ${countLabel} to include the rating, or clear the rating value` };
  if (total) return { issue: `Add a rating value to include the ${countLabel}, or clear the ${countLabel}` };
  return {};
}
