import assert from "node:assert/strict";
import test from "node:test";

import { classifyReferenceDestination, summarizeEmbeddedAio } from "./aio-pilot-summary.mjs";

test("counts only explicit null asynchronous embedded records as placeholders", () => {
  const summary = summarizeEmbeddedAio({
    items: [
      {
        type: "people_also_ask_ai_overview_expanded_element",
        asynchronous_ai_overview: true,
        items: null,
        references: null,
      },
      {
        type: "people_also_ask_ai_overview_expanded_element",
        asynchronous_ai_overview: true,
        items: [{ type: "ai_overview_element" }],
        references: [],
      },
    ],
  });

  assert.equal(summary.embeddedNodeCount, 2);
  assert.equal(summary.count, 1);
  assert.equal(summary.nonPlaceholderCount, 1);
  assert.deepEqual(summary.byType, { people_also_ask_ai_overview_expanded_element: 1 });
  assert.deepEqual(summary.nonPlaceholdersByType, { people_also_ask_ai_overview_expanded_element: 1 });
});

test("restricts Google product views to the observed provider host allowlist", () => {
  assert.equal(
    classifyReferenceDestination("https://www.google.com/search?q=product&ibp=oshop"),
    "google_product_view",
  );
  assert.equal(
    classifyReferenceDestination("https://google.co.uk/search?ibp=oshop&q=product"),
    "google_product_view",
  );
  assert.equal(
    classifyReferenceDestination("https://google.example/search?q=product&ibp=oshop"),
    "external_destination",
  );
});
