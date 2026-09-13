import assert from "node:assert/strict";
import test from "node:test";
import { load } from "cheerio";
import {
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
