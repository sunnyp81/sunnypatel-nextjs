import assert from "node:assert/strict";

const revision = process.env.GITHUB_SHA;
assert(revision && /^[a-f0-9]{40}$/.test(revision), "GITHUB_SHA must identify this release");
const site = process.argv.includes("--site");
const origin = site ? "https://sunnypatel.co.uk" : "https://sunnypatel-nextjs.vercel.app";
if (!site) {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${origin}/api/diagnostic-health/`, { redirect: "manual", signal: AbortSignal.timeout(10_000), cache: "no-store" });
      const body = response.ok ? await response.json() : null;
      if (body?.revision === revision && body.runtime === "nodejs") { ready = true; break; }
    } catch { /* Wait for the matching Vercel deployment, never change aliases. */ }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  assert(ready, "Matching Node revision is not ready; Cloudflare deployment must remain unchanged");
}
const shapes = {
  "fetch-page": body => typeof body.text === "string" && body.text.includes("Example Domain"),
  "fetch-og": body => body.title === "Example Domain",
  "grade-website": body => Array.isArray(body.seoChecks) && Array.isArray(body.securityChecks),
  "check-links": body => Array.isArray(body.results) && typeof body.incomplete === "boolean",
  "check-redirect": body => Array.isArray(body.chain) && body.chain[0]?.status === 200 && !body.error,
  "check-ssl": body => body.chainValid === true,
  "ai-visibility": body => Array.isArray(body.pillars) && typeof body.incomplete === "boolean",
};
await Promise.all(Object.entries(shapes).map(async ([name, valid]) => {
  const response = await fetch(`${origin}/api/${name}/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(name === "check-ssl" ? { domain: "example.com" } : { url: "https://example.com/" }),
    redirect: "manual", signal: AbortSignal.timeout(40_000),
  });
  assert.equal(response.status, 200, `${name}: status`);
  assert.equal(response.headers.get("X-Diagnostic-Revision"), revision, `${name}: Node revision`);
  assert(valid(await response.json()), `${name}: result shape`);
  console.log(JSON.stringify({ origin, route: name, revision, status: "pass" }));
}));
