import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import ts from "typescript";
import * as qualification from "../src/lib/lead-qualification.js";

const here = new URL("../", import.meta.url);
const routeUrl = new URL("src/app/api/contact/route.ts", here);
const source = await readFile(routeUrl, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;
const spamSource = await readFile(new URL("src/lib/spam-score.ts", here), "utf8");
const spamModule = { exports: {} };
new Function("module", "exports", ts.transpileModule(spamSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(spamModule, spamModule.exports);
const requireFromRepo = createRequire(routeUrl);

function createMockRoute() {
  const stored = [];
  const delivered = [];
  const workerCalls = [];
  const env = { EMAILIT_API_KEY: "mock-only", AAA_INTAKE_SECRET: "mock-only", AAA_INTAKE_ENABLED: "1" };
  const mockFetch = async (url, options = {}) => {
    const record = { url: String(url), options, body: options.body ? JSON.parse(options.body) : null };
    delivered.push(record);
    if (record.url.includes("aaa-intake")) workerCalls.push(record);
    return new Response("{}", { status: 202 });
  };
  const mockRequire = (specifier) => {
    if (specifier === "next/server") return { NextResponse: { json: (body, options = {}) => new Response(JSON.stringify(body), { status: options.status ?? 200, headers: { "Content-Type": "application/json" } }) } };
    if (specifier === "@opennextjs/cloudflare") return { getCloudflareContext: async () => ({ env: { LEADS: { put: async (key, value, options) => stored.push({ key, value: JSON.parse(value), options }) } } }) };
    if (specifier === "@/lib/lead-qualification") return qualification;
    if (specifier === "@/lib/spam-score") return spamModule.exports;
    return requireFromRepo(specifier);
  };
  const cjsModule = { exports: {} };
  const run = new Function("require", "module", "exports", "process", "fetch", "crypto", "console", "setTimeout", "clearTimeout", compiled);
  run(mockRequire, cjsModule, cjsModule.exports, { env }, mockFetch, { randomUUID }, console, setTimeout, clearTimeout);
  return { POST: cjsModule.exports.POST, stored, delivered, workerCalls };
}

async function post(POST, body, ip) {
  return POST(new Request("https://example.test/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  }));
}

test("API rejects invalid qualification before KV or provider delivery", async () => {
  const mock = createMockRoute();
  for (const body of [
    { name: "Test", email: "test@example.com", supportType: "made_up_offer" },
    { name: "Test", email: "test@example.com", budget: "exactly_999" },
  ]) {
    const response = await post(mock.POST, body, randomUUID());
    assert.equal(response.status, 400);
  }
  assert.equal(mock.stored.length, 0);
  assert.equal(mock.delivered.length, 0);
});

test("API accepts a lead with an invalid optional website and never stores or sends its raw value", async () => {
  const mock = createMockRoute();
  const response = await post(mock.POST, {
    name: "Sam Example",
    email: "sam@example.com",
    message: "Please get in touch",
    website: "https://private-user:private-pass-97@example.com/path?token=private-token",
  }, randomUUID());

  assert.equal(response.status, 200);
  assert.equal(mock.stored.length, 2);
  const storedLead = mock.stored[0].value;
  assert.equal(storedLead.website, "");
  assert.equal(storedLead.websiteOmitted, true);
  assert.match(mock.delivered[0].body.text, /Website omitted because format not recognised/);
  assert.doesNotMatch(JSON.stringify(mock.stored), /private-user|private-pass-97|private-token/);
  assert.doesNotMatch(JSON.stringify(mock.delivered), /private-user|private-pass-97|private-token/);
  assert.equal(mock.workerCalls.length, 1);
  assert.match(mock.workerCalls[0].body.message, /Website omitted because format not recognised/);
  assert.doesNotMatch(JSON.stringify(mock.workerCalls[0].body), /private-user|private-pass-97|private-token/);
});

test("API stores normalised qualification, includes readable mocked delivery details and keeps intake contract", async () => {
  const mock = createMockRoute();
  const response = await post(mock.POST, {
    name: "Sam Example",
    email: "sam@example.com",
    message: "Looking for help",
    website: "example.com/path?token=private",
    supportType: "ongoing_implementation",
    offer: "Untrusted client-supplied label",
    budget: "1500_plus",
    timing: "now",
  }, randomUUID());

  assert.equal(response.status, 200);
  assert.equal(mock.delivered.length, 2);
  const emailText = mock.delivered[0].body.text;
  assert.match(emailText, /Offer: Ongoing SEO implementation \(from £1,500\/month\)/);
  assert.match(emailText, /Selected support: Ongoing implementation/);
  assert.match(emailText, /Website: https:\/\/example\.com/);
  assert.doesNotMatch(emailText, /token=private/);
  assert.equal(mock.stored[0].value.website, "https://example.com");
  assert.equal(mock.stored[0].value.supportType, "ongoing_implementation");

  assert.equal(mock.workerCalls.length, 1);
  const intake = mock.workerCalls[0].body;
  assert.deepEqual(Object.keys(intake).sort(), ["brand", "email", "message", "name", "phone"]);
  assert.match(intake.message, /Selected support: Ongoing implementation/);
  assert.match(intake.message, /Monthly budget: £1,500\/month or more/);
});

test("API email offer follows allowlisted one-off audit and session selections", async () => {
  const cases = [
    ["one_off_audit", "Paid SEO Audit (£495)"],
    ["single_session", "Single SEO consulting session (£200)"],
    ["quarterly_strategy_review", "Quarterly strategy review (£500)"],
    ["not_sure", "Free 20-minute SEO diagnosis"],
  ];
  for (const [supportType, expectedOffer] of cases) {
    const mock = createMockRoute();
    const response = await post(mock.POST, {
      name: "Sam Example",
      email: "sam@example.com",
      message: "Please get in touch",
      supportType,
      offer: "Wrong client label",
    }, randomUUID());
    assert.equal(response.status, 200, supportType);
    assert.match(mock.delivered[0].body.text, new RegExp(`Offer: ${expectedOffer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
});

test("legacy API payload still reaches mocked mail with no new intake details", async () => {
  const mock = createMockRoute();
  const response = await post(mock.POST, {
    name: "Legacy lead",
    email: "legacy@example.com",
    message: "Hello",
  }, randomUUID());
  assert.equal(response.status, 200);
  assert.equal(mock.delivered.length, 2);
  assert.equal(mock.workerCalls[0].body.message, "Hello");
  assert.doesNotMatch(mock.delivered[0].body.text, /Selected support:/);
});

test("vendor spam is labelled in the subject and still delivered", async () => {
  const mock = createMockRoute();
  const spam = await post(mock.POST, {
    name: "Rahul", email: "rahul.backlinkserviceprovider@gmail.com",
    message: "I have 10k+ sites, price starts from $25. Should I send you my site lists?",
  }, randomUUID());
  assert.equal(spam.status, 200);
  assert.match(mock.delivered[0].body.subject, /^\[Spam\?\] /);
  const real = await post(mock.POST, {
    name: "Jo", email: "jo@smallbiz.co.uk", message: "My plumbing business needs more leads from Google. What do you charge?",
  }, randomUUID());
  assert.equal(real.status, 200);
  assert.doesNotMatch(mock.delivered[1].body.subject, /Spam/);
});
