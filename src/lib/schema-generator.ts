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
