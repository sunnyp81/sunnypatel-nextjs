import assert from "node:assert/strict";
import test from "node:test";

import { allowedGotoUrl, resolveGotoCandidate } from "./aio-citation-redirect-review.mjs";

test("allowlist rejects credentials, custom ports, and non-Google URLs", () => {
  assert.ok(allowedGotoUrl("/goto?token=saved"));
  assert.equal(allowedGotoUrl("https://user:secret@google.co.uk/goto?token=x"), null);
  assert.equal(allowedGotoUrl("https://google.co.uk:444/goto?token=x"), null);
  assert.equal(allowedGotoUrl("https://example.com/goto?token=x"), null);
});

test("only a redirect status can corroborate a Location destination", async () => {
  const requests = [];
  const result = await resolveGotoCandidate("/goto?token=saved", "https://example.com/exact", {
    fetchImpl: async (url, init) => {
      requests.push({ url, redirect: init.redirect });
      return new Response(null, { status: 200, headers: { location: "https://example.com/exact" } });
    },
  });
  assert.equal(result.state, "non_redirect_status_with_location");
  assert.equal(result.exactMatch, false);
  assert.deepEqual(requests, [{ url: "https://google.co.uk/goto?token=saved", redirect: "manual" }]);
});

test("302 evidence stops before fetching the external destination", async () => {
  const requests = [];
  const result = await resolveGotoCandidate("/goto?token=saved", "https://example.com/exact", {
    fetchImpl: async (url, init) => {
      requests.push({ url, redirect: init.redirect });
      return new Response(null, { status: 302, headers: { location: "https://example.com/exact" } });
    },
  });
  assert.equal(result.state, "exact_destination_returned");
  assert.equal(result.exactMatch, true);
  assert.equal(result.destination, "https://example.com/exact");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://google.co.uk/goto?token=saved");
});

test("redirect without Location stays unresolved", async () => {
  const result = await resolveGotoCandidate("/goto?token=saved", "https://example.com/exact", {
    fetchImpl: async () => new Response(null, { status: 302 }),
  });
  assert.equal(result.state, "no_location");
  assert.equal(result.exactMatch, false);
});
