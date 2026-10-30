import assert from "node:assert/strict";
import test from "node:test";
import { load } from "cheerio";
import {
  buildAggregateRating,
  countSchemaItems,
  createJsonLdScript,
  serializeJsonLdForHtml,
} from "../../src/lib/schema-generator.ts";

test("HTML-safe JSON-LD cannot terminate its script and preserves entered text", () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "A </script><script>alert('unsafe')</script> example",
    description: "2 < 3 & the original text must survive",
  };

  const html = createJsonLdScript(schema);
  assert.equal((html.match(/<script/gi) ?? []).length, 1);
  assert.equal((html.match(/<\/script>/gi) ?? []).length, 1);
  assert.doesNotMatch(serializeJsonLdForHtml(schema), /</);

  const $ = load(html);
  const parsed = JSON.parse($("script[type='application/ld+json']").text());
  assert.deepEqual(parsed, schema);
});

test("schema item counts include nested typed entities", () => {
  const schema = {
    "@type": "Product",
    offers: { "@type": "Offer", price: "20" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8" },
  };

  assert.equal(countSchemaItems(schema), 3);
});

for (const [label, key] of [["Product", "reviewCount"], ["SoftwareApplication", "ratingCount"]]) {
  test(`${label} aggregateRating needs both value and count`, () => {
    assert.deepEqual(buildAggregateRating("", "", key), {});
    const valueOnly = buildAggregateRating("4.5", "", key);
    assert.equal(valueOnly.aggregateRating, undefined);
    assert.match(valueOnly.issue, /^Add a (review|rating) count to include the rating/);
    const countOnly = buildAggregateRating("", "12", key);
    assert.equal(countOnly.aggregateRating, undefined);
    assert.match(countOnly.issue, /^Add a rating value/);
    assert.deepEqual(buildAggregateRating("4.5", "12", key), {
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.5", [key]: "12" },
    });
  });
}
