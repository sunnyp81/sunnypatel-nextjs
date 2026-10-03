import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/lib/safe-public-fetch.ts", import.meta.url), "utf8");
const exports = {};
new Function("exports", "require", ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(exports, require);
const { createPublicFetcher, isPublicAddress, parsePublicUrl } = exports;
const publicDNS = [{ address: "93.184.215.14", family: 4 }];

function route(name, fetch) {
  const source = readFileSync(new URL(`../src/app/api/${name}/route.ts`, import.meta.url), "utf8");
  const exports = {};
  const dependencies = id => id === "next/server" ? { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } }
    : id === "@/lib/safe-public-fetch" ? { safePublicFetch: fetch } : require(id);
  new Function("exports", "require", ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(exports, dependencies);
  return exports;
}

function fixture(responses = [], resolve = async () => publicDNS) {
  const calls = [];
  const transport = (url, options, receive) => {
    calls.push({ url: url.href, options });
    const req = new EventEmitter();
    let incoming;
    req.destroy = () => incoming?.destroy();
    const cancel = () => req.emit("error", new Error("cancelled"));
    options.signal.addEventListener("abort", cancel, { once: true });
    req.end = () => queueMicrotask(() => {
      const next = responses.shift() ?? { body: "OK" };
      if (next.error) { req.emit("error", next.error); return; }
      incoming = new PassThrough();
      incoming.statusCode = next.status ?? 200;
      incoming.headers = next.headers ?? {};
      receive(incoming);
      if (next.stall) return;
      if (!incoming.destroyed) {
        for (const chunk of next.chunks ?? [next.body ?? ""]) incoming.write(chunk);
        if (!incoming.destroyed) incoming.end();
      }
      options.signal.removeEventListener("abort", cancel);
    });
    return req;
  };
  return { fetch: createPublicFetcher({ resolve, httpRequest: transport, httpsRequest: transport }), calls };
}

test("blocks special/private IPv4, IPv6, mapped and translation addresses", () => {
  for (const ip of ["0.0.0.0", "10.1.2.3", "100.64.0.1", "127.0.0.1", "169.254.169.254", "172.31.0.2", "192.168.0.1", "192.0.0.9", "192.0.2.1", "198.18.0.1", "198.51.100.1", "203.0.113.1", "224.0.0.1", "255.255.255.255", "::", "::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "fc00::1", "fe80::1", "ff02::1", "64:ff9b::7f00:1", "2001::1", "2001:db8::1", "2002:7f00:1::", "3fff::1", "not-an-ip"]) assert.equal(isPublicAddress(ip), false, ip);
  for (const ip of ["93.184.215.14", "8.8.8.8", "172.32.0.1", "2001:4860:4860::8888", "2606:4700:4700::1111"]) assert.equal(isPublicAddress(ip), true, ip);
});
test("URL normalization blocks schemes, credentials, nonstandard ports and local/IP aliases", () => {
  for (const url of ["file:///etc/passwd", "ftp://example.com", "https://u:p@example.com", "https://example.com:8080", "http://127.1", "http://2130706433", "http://0x7f000001", "http://[::1]", "http://localhost", "http://x.local", "http://x.internal", "http://x.test", "http://singlelabel", "https://example.com/\n", "https://example.com/" + "a".repeat(2048)]) assert.throws(() => parsePublicUrl(url), undefined, url);
  assert.equal(parsePublicUrl("https://EXAMPLE.com.:443/a#b").href, "https://example.com/a");
});
test("rejects a public hostname with any private DNS answer before transport", async () => {
  const f = fixture([], async () => [...publicDNS, { address: "10.0.0.1", family: 4 }]);
  await assert.rejects(f.fetch("https://example.com"), /only to public/);
  assert.equal(f.calls.length, 0);
});
test("DNS failure, empty answers and invalid families fail closed", async () => {
  for (const resolve of [async () => { throw new Error("DNS"); }, async () => [], async () => [{ address: "93.184.215.14", family: 6 }]]) {
    const f = fixture([], resolve); await assert.rejects(f.fetch("https://example.com")); assert.equal(f.calls.length, 0);
  }
});
test("pins validated DNS address while retaining domain for Host and TLS", async () => {
  const f = fixture([{ body: "safe" }]);
  const r = await f.fetch("https://example.com/a"); assert.equal(await r.text(), "safe");
  const c = f.calls[0]; assert.equal(c.url, "https://example.com/a"); assert.equal(c.options.agent, false); assert.equal(c.options.autoSelectFamily, false);
  c.options.lookup("example.com", {}, (error, ip, family) => { assert.equal(error, null); assert.equal(ip, publicDNS[0].address); assert.equal(family, 4); });
  assert.equal(c.options.headers["Accept-Encoding"], "identity");
});
test("IPv6 public address is pinned without allowing mapped private addresses", async () => {
  const f = fixture([{ body: "v6" }], async () => [{ address: "2606:4700:4700::1111", family: 6 }]);
  assert.equal(await (await f.fetch("https://example.com")).text(), "v6");
  assert.equal(f.calls[0].options.family, 6);
});
test("relative public redirects resolve and final URL is reported", async () => {
  const f = fixture([{ status: 302, headers: { location: "/next" } }, { body: "final" }]);
  const r = await f.fetch("https://example.com/start"); assert.equal(r.url, "https://example.com/next"); assert.equal(await r.text(), "final");
});
test("followed redirect to private DNS is rejected before target transport", async () => {
  for (const redirect of ["follow"]) {
    const f = fixture([{ status: 302, headers: { location: "https://private.example.com/" } }], async (h) => h === "private.example.com" ? [{ address: "169.254.169.254", family: 4 }] : publicDNS);
    await assert.rejects(f.fetch("https://example.com", { redirect }), /only to public/); assert.equal(f.calls.length, 1);
  }
});

test("manual redirects preserve the received hop without contacting or resolving its target", async () => {
  for (const location of ["https://private.example.com/", "http://127.0.0.1/", "https://dead.example.com/", "https://example.com:8443/"]) {
    const resolved = [];
    const f = fixture([{ status: 301, headers: { location } }], async host => { resolved.push(host); if (host !== "example.com") throw Error("unresolvable"); return publicDNS; });
    const response = await f.fetch("https://example.com", { redirect: "manual", headersOnly: true });
    assert.equal(response.status, 301); assert.equal(response.headers.get("location"), location);
    assert.deepEqual(resolved, ["example.com"]); assert.equal(f.calls.length, 1);
    await assert.rejects(f.fetch(location)); assert.equal(f.calls.length, 1);
  }
});

test("connection failures retain allowlisted TLS/network codes without leaking upstream messages", async () => {
  for (const code of ["CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "ECONNREFUSED", "UNSAFE_ARBITRARY_CODE"]) {
    const error = Object.assign(new Error("private address and confidential upstream text"), { code });
    const f = fixture([{ error }]);
    await assert.rejects(f.fetch("https://example.com"), failure => {
      assert(!failure.message.includes("confidential"));
      assert.equal(failure.code, code === "UNSAFE_ARBITRARY_CODE" ? undefined : code);
      return true;
    });
  }
});

test("redirect route retains the 301 and attributes blocked/dead targets to their own hop", async () => {
  for (const location of ["https://private.example.com/", "https://dead.example.com/", "http://127.0.0.1/"]) {
    const f = fixture([{ status: 301, headers: { location } }], async host => {
      if (host === "private.example.com") return [{ address: "10.0.0.1", family: 4 }];
      if (host === "dead.example.com") throw Error("DNS failure");
      return publicDNS;
    });
    const result = await route("check-redirect", f.fetch).POST({ json: async () => ({ url: "https://example.com/" }) });
    assert.equal(result.body.chain[0].status, 301); assert.equal(result.body.chain[0].headers.location, location);
    assert.equal(result.body.chain[1].url, location); assert.equal(result.body.chain[1].status, 0);
    assert.equal(f.calls.length, 1); assert(result.body.error);
  }
});

test("SSL route accepts a successful handshake even when its Location is private", async () => {
  const f = fixture([{ status: 301, headers: { location: "http://127.0.0.1/" } }, { body: "[]" }]);
  const result = await route("check-ssl", f.fetch).POST({ json: async () => ({ domain: "example.com" }) });
  assert.equal(result.body.chainValid, true); assert(result.body.error.includes("Certificate details unavailable"));
  assert.equal(f.calls.length, 2); assert(f.calls[1].url.startsWith("https://api.certspotter.com/"));
});

test("SSL route presents the safe certificate error code", async () => {
  const f = fixture([{ error: Object.assign(new Error("sensitive upstream detail"), { code: "CERT_HAS_EXPIRED" }) }, { body: "[]" }]);
  const result = await route("check-ssl", f.fetch).POST({ json: async () => ({ domain: "example.com" }) });
  assert.equal(result.body.chainValid, false); assert(result.body.error.includes("CERT_HAS_EXPIRED"));
  assert(!result.body.error.includes("sensitive"));
});
test("redirect IP literal is rejected before target transport", async () => {
  const f = fixture([{ status: 302, headers: { location: "http://127.0.0.1/" } }]);
  await assert.rejects(f.fetch("https://example.com")); assert.equal(f.calls.length, 1);
});
test("rebinding between redirect validation and connection is rejected", async () => {
  let count = 0;
  const f = fixture([{ status: 302, headers: { location: "/next" } }], async () => ++count < 3 ? publicDNS : [{ address: "10.0.0.1", family: 4 }]);
  await assert.rejects(f.fetch("https://example.com"), /only to public/); assert.equal(f.calls.length, 1);
});
test("redirect loops and limits terminate", async () => {
  const loop = fixture([{ status: 302, headers: { location: "/" } }]); await assert.rejects(loop.fetch("https://example.com"), /loop/);
  const limit = fixture([{ status: 302, headers: { location: "/1" } }, { status: 302, headers: { location: "/2" } }]);
  await assert.rejects(limit.fetch("https://example.com", { maxRedirects: 1 }), /Too many/); assert.equal(limit.calls.length, 2);
});
test("advertised and streamed byte limits reject", async () => {
  for (const response of [{ headers: { "content-length": "100" }, body: "x" }, { chunks: ["123456", "123456"] }]) {
    const f = fixture([response]); await assert.rejects(f.fetch("https://example.com", { maxBytes: 10 }), /limit/);
  }
});
test("compressed responses fail closed instead of accepting a decompression bomb", async () => {
  const f = fixture([{ headers: { "content-encoding": "gzip" }, body: "bytes" }]);
  await assert.rejects(f.fetch("https://example.com"), /compressed/);
});
test("deadline covers stalled DNS and stalled response bodies", async () => {
  await assert.rejects(fixture([], () => new Promise(() => {})).fetch("https://example.com", { timeoutMs: 10 }), /timed out/);
  await assert.rejects(fixture([{ stall: true }]).fetch("https://example.com", { timeoutMs: 10 }), /timed out/);
});
test("cancelled caller signal blocks transport", async () => {
  const c = new AbortController(); c.abort(); const f = fixture();
  await assert.rejects(f.fetch("https://example.com", { signal: c.signal }), /cancelled/); assert.equal(f.calls.length, 0);
});
test("HEAD and status-only GET return headers without downloading bodies", async () => {
  for (const options of [{ method: "HEAD" }, { headersOnly: true }]) {
    const f = fixture([{ body: "body", headers: { "content-length": "999999999" } }]);
    const r = await f.fetch("https://example.com", options); assert.equal(r.status, 200); assert.equal(await r.text(), "");
  }
});
test("unsupported final statuses reject safely for bodies and headers-only responses", async () => {
  for (const status of [199, 600, 999, 250.5]) {
    for (const options of [{}, { headersOnly: true }]) {
      const f = fixture([{ status, body: "invalid" }]);
      await assert.rejects(f.fetch("https://example.com", options), /unsupported HTTP status/);
    }
  }
});
test("malformed response headers reject without escaping the response callback", async () => {
  const f = fixture([{ headers: { "x-test": "invalid\nheader" } }]);
  await assert.rejects(f.fetch("https://example.com"), /invalid response/);
});
test("response constructor failures become rejected promises at headers and body end", async () => {
  const OriginalResponse = globalThis.Response;
  globalThis.Response = class { constructor() { throw new Error("constructor failure"); } };
  try {
    for (const options of [{}, { headersOnly: true }]) {
      const f = fixture([{ body: "valid body" }]);
      await assert.rejects(f.fetch("https://example.com", options), /invalid response|Could not read/);
    }
  } finally { globalThis.Response = OriginalResponse; }
});
test("all seven user-controlled API routes use only the Node safe transport", () => {
  for (const route of ["ai-visibility", "grade-website", "fetch-page", "check-links", "fetch-og", "check-redirect", "check-ssl"]) {
    const code = readFileSync(new URL(`../src/app/api/${route}/route.ts`, import.meta.url), "utf8");
    assert.match(code, /runtime = "nodejs"/); assert.match(code, /safePublicFetch\(/); assert.doesNotMatch(code, /\bawait fetch\(/);
  }
});
