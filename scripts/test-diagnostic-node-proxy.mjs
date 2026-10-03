import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const exports = {};
new Function("exports", ts.transpileModule(readFileSync(new URL("../src/lib/diagnostic-node-proxy.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(exports);
const { proxyDiagnosticRequest } = exports;
const request = (path, input = { url: "https://example.com/" }, options = {}) => new Request(`https://sunnypatel.co.uk${path}`, {
  method: "POST", body: JSON.stringify(input), headers: { Cookie: "private", Authorization: "private", "X-Forwarded-Host": "attacker.invalid" }, ...options,
});

test("only seven diagnostic paths and slash variants reach fixed Node origin; inputs and headers are isolated", async () => {
  for (const name of ["fetch-page", "fetch-og", "grade-website", "check-links", "check-redirect", "check-ssl", "ai-visibility"]) for (const suffix of ["", "/"]) {
    const key = name === "check-ssl" ? "domain" : "url";
    const result = await proxyDiagnosticRequest(request(`/api/${name}${suffix}`, { [key]: "example.com", token: "private" }), async (url, init) => {
      assert.equal(url, `https://sunnypatel-nextjs.vercel.app/api/${name}/`);
      assert.deepEqual(init.headers, { "Content-Type": "application/json" });
      assert.deepEqual(JSON.parse(init.body), { [key]: "example.com" });
      assert.equal(init.redirect, "manual");
      return Response.json({ success: true }, { headers: { "Set-Cookie": "private", Location: "https://attacker.invalid/", "X-Diagnostic-Revision": "a".repeat(40) } });
    });
    assert.equal(result.status, 200);
    assert.equal(result.headers.get("Cache-Control"), "no-store");
    assert.equal(result.headers.get("Set-Cookie"), null);
    assert.equal(result.headers.get("Location"), null);
    assert.equal(result.headers.get("X-Diagnostic-Revision"), "a".repeat(40));
  }
  for (const path of ["/api/keystatic/tree", "/api/contact", "/api/check-ssl/extra", "/api/other", "/"]) {
    assert.equal(await proxyDiagnosticRequest(request(path), () => { throw new Error("unexpected request"); }), null);
  }
});

test("invalid methods, malformed input and oversized requests never reach upstream", async () => {
  const send = () => { throw new Error("unexpected request"); };
  assert.equal((await proxyDiagnosticRequest(new Request("https://sunnypatel.co.uk/api/fetch-page/"), send)).status, 405);
  for (const input of [null, [], { url: 1 }, { url: "x".repeat(5000) }]) assert.equal((await proxyDiagnosticRequest(request("/api/fetch-page", input), send)).status, 400);
  assert.equal((await proxyDiagnosticRequest(request("/api/fetch-page", {}, { body: "{" }), send)).status, 400);
});

test("upstream redirects, HTML and oversized responses fail closed; error JSON retains status", async () => {
  for (const response of [new Response(null, { status: 307, headers: { Location: "http://127.0.0.1/" } }), new Response("HTML")]) {
    assert.equal((await proxyDiagnosticRequest(request("/api/fetch-page"), async () => response)).status, 502);
  }
  const large = new Response("x".repeat(4_000_001), { headers: { "Content-Type": "application/json" } });
  assert.equal((await proxyDiagnosticRequest(request("/api/fetch-page"), async () => large)).status, 413);
  const result = await proxyDiagnosticRequest(request("/api/fetch-page"), async () => Response.json({ error: "Unavailable" }, { status: 422 }));
  assert.equal(result.status, 422); assert.deepEqual(await result.json(), { error: "Unavailable" });
});

test("network errors are sanitised and client cancellation cancels the upstream", async () => {
  const result = await proxyDiagnosticRequest(request("/api/fetch-page"), async () => { throw new Error("secret internal network address"); });
  assert.equal(result.status, 502); assert(!JSON.stringify(await result.json()).includes("secret"));
  const controller = new AbortController();
  const pending = proxyDiagnosticRequest(request("/api/fetch-page", undefined, { signal: controller.signal }), async (_url, init) => {
    controller.abort(); assert(init.signal.aborted); throw new Error("Cancelled");
  });
  assert.equal((await pending).status, 502);
});
