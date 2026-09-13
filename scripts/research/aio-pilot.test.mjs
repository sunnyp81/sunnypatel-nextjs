import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import {
  RUNS_ROOT, assertBudget, buildCapturePlan, downloadProviderImage,
  normalizeAdvanced, normalizeReferences, runCli, selectCaptures,
  taskPostIdentityIssues,
} from "./aio-pilot.mjs";

function panel() {
  return {
    proofQueryIds: ["pms-01", "off-05"],
    sectors: Array.from({ length: 10 }, (_, sectorIndex) => ({
      id: sectorIndex === 0 ? "software" : sectorIndex === 1 ? "office" : `sector-${sectorIndex + 1}`,
      label: `Sector ${sectorIndex + 1}`,
      queries: Array.from({ length: 5 }, (_, queryIndex) => {
        const ordinal = sectorIndex * 5 + queryIndex + 1;
        const id = ordinal === 1 ? "pms-01" : ordinal === 10 ? "off-05" : `q-${String(ordinal).padStart(2, "0")}`;
        return { id, query: `deterministic query ${ordinal}`, intent: "informational", userTask: `task ${ordinal}` };
      }),
    })),
  };
}

const success = (result, extra = {}) => ({
  status_code: 20000, tasks_error: 0, tasks: [{ status_code: 20000, result: [result] }], ...extra,
});
const jsonResponse = (value) => new Response(JSON.stringify(value), {
  status: 200, headers: { "content-type": "application/json" },
});

async function fixture(t, prefix = "test") {
  await mkdir(RUNS_ROOT, { recursive: true });
  const dir = path.join(RUNS_ROOT, `${prefix}-${randomBytes(4).toString("hex")}`);
  await mkdir(dir);
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test("builds a 50 x 2 capture plan with the fixed UK request contract", () => {
  const plan = buildCapturePlan(panel());
  assert.equal(plan.length, 100);
  assert.equal(plan.filter((item) => item.request.device === "desktop").length, 50);
  assert.equal(plan.filter((item) => item.request.device === "mobile").length, 50);
  assert.equal(new Set(plan.map((item) => item.tag)).size, 100);
  for (const item of plan) {
    assert.equal(item.request.location_name, "London,England,United Kingdom");
    assert.equal(item.request.language_code, "en");
    assert.equal(item.request.se_domain, "google.co.uk");
    assert.equal(item.request.depth, 10);
    assert.equal(item.request.priority, 1);
    assert.equal(item.request.load_async_ai_overview, true);
    assert.equal(item.request.expand_ai_overview, true);
    assert.equal(item.request.os, item.request.device === "desktop" ? "windows" : "android");
  }
  assert.deepEqual(selectCaptures(plan, panel(), 4).map((item) => item.tag), [
    "pms-01-desktop", "pms-01-mobile", "off-05-desktop", "off-05-mobile",
  ]);
  assert.deepEqual(selectCaptures(plan, panel(), 100), plan);
});

test("keeps fatal, null, pending, partial, empty and genuine absence states distinct", () => {
  assert.equal(normalizeAdvanced({ status_code: 50000 }).aioState, "error");
  assert.equal(normalizeAdvanced({ status_code: 20000, tasks_error: 0, tasks: [{ status_code: 20000, result: null }] }).aioState, "unknown");
  assert.equal(normalizeAdvanced({ status_code: 20000, tasks_error: 1, tasks: [{ status_code: 40601 }] }).aioState, "pending");
  assert.equal(normalizeAdvanced({ status_code: 20000, tasks_error: 1, tasks: [{ status_code: 40106 }] }).aioState, "provider_partial");
  assert.equal(normalizeAdvanced({ status_code: 20000, tasks_error: 1, tasks: [{ status_code: 40501 }] }).aioState, "error");
  assert.equal(normalizeAdvanced(success({ item_types: [], items: [] })).aioState, "unknown");
  assert.equal(normalizeAdvanced(success({ item_types: ["organic"], items: [{ type: "organic" }] })).aioState, "unknown");
  assert.equal(normalizeAdvanced(success({ item_types: ["organic"], items: [{ type: "organic", rank_group: 1, xpath: "/html/body" }] })).aioState, "unknown");
  assert.equal(normalizeAdvanced(success({ item_types: ["organic"], items: [{ type: "organic", url: "https://example.com/" }] })).aioState, "absent_returned_serp");
  assert.equal(normalizeAdvanced(success({ item_types: ["ai_overview"], items: [] })).aioState, "detected_partial");
  assert.equal(normalizeAdvanced(success({ item_types: ["ai_overview"], items: [{ type: "ai_overview", items: [] }] })).aioState, "detected_partial");
});

test("requires answer body content and keeps main and embedded AIO signals separate", () => {
  const referencesOnly = normalizeAdvanced(success({
    item_types: ["ai_overview"],
    items: [{ type: "ai_overview", items: [{ references: [{ url: "https://example.com/", text: "Reference text" }] }], references: [{ url: "https://example.com/", description: "Source description" }] }],
  }));
  assert.equal(referencesOnly.aioState, "detected_partial");
  assert.equal(referencesOnly.contentReturned, false);
  const body = normalizeAdvanced(success({
    item_types: ["ai_overview", "knowledge_graph"],
    items: [{ type: "ai_overview", markdown: null, items: [{ type: "ai_overview_element", markdown: "A returned answer" }, { type: "knowledge_graph_ai_overview_item" }] }],
  }));
  assert.equal(body.aioState, "present_content_returned");
  assert.equal(body.detectedAiOverview, true);
  assert.equal(body.contentReturned, true);
  assert.equal(body.manualReviewRequired, true);
  assert.deepEqual(body.embeddedAioTypes, ["knowledge_graph_ai_overview_item"]);
  const embeddedOnly = normalizeAdvanced(success({
    item_types: ["knowledge_graph"],
    items: [{ type: "knowledge_graph", title: "Entity", items: [{ type: "knowledge_graph_ai_overview_item" }] }],
  }));
  assert.equal(embeddedOnly.detectedAiOverview, false);
  assert.equal(embeddedOnly.aioState, "absent_returned_serp");
  assert.deepEqual(embeddedOnly.embeddedAioTypes, ["knowledge_graph_ai_overview_item"]);
});

test("preserves exact reference URLs and deduplicates only exact URL strings", () => {
  const refs = normalizeReferences([
    { source: "A", domain: "www.example.com", url: "http://example.com/a#one", title: "First" },
    { source: "A duplicate", domain: "www.example.com", url: "http://example.com/a#one", title: "Copy" },
    { source: "HTTPS variant", domain: "example.com", url: "https://example.com/a", title: "Variant" },
    { source: "B", domain: "wrong.example", url: "https://other.example/b/", title: "Second" },
  ]);
  assert.equal(refs.length, 3);
  assert.equal(refs[0].referenceUrl, "http://example.com/a#one");
  assert.equal(refs[0].comparisonKey, "url:http://example.com/a#one");
  assert.equal(refs[1].referenceUrl, "https://example.com/a");
  assert.equal(refs[2].referenceUrl, "https://other.example/b/");
  assert.equal(refs[2].domainMismatch, true);
  assert.equal(refs[2].normalizedDomain, "other.example");
  assert.equal(refs[0].raw.url, "http://example.com/a#one");
});

test("enforces the proof gate, fresh full-wave shape and hard capture maximum", () => {
  assert.equal(assertBudget(4), 0.0208);
  assert.throws(() => assertBudget(5, true), /limited to proof runs/);
  assert.throws(() => assertBudget(100), /proof-reviewed/);
  assert.equal(assertBudget(100, true), 0.52);
  assert.throws(() => assertBudget(101, true), /1 to 100/);
});

test("allows only provider HTTPS images, blocks redirects, and verifies media bytes", async () => {
  let calls = 0;
  await assert.rejects(() => downloadProviderImage(async () => { calls++; }, "https://attacker.example/serp.png"), /allowlist/);
  assert.equal(calls, 0);
  const png = Buffer.from("89504e470d0a1a0a00000000", "hex");
  let initSeen;
  const image = await downloadProviderImage(async (_url, init) => {
    initSeen = init;
    return new Response(png, { status: 200, headers: { "content-type": "image/png" } });
  }, "https://cdn.dataforseo.com/example.png");
  assert.equal(image.extension, ".png");
  assert.equal(initSeen.redirect, "error");
  assert.equal(initSeen.headers, undefined);
  await assert.rejects(
    () => downloadProviderImage(async () => new Response("not an image", { status: 200, headers: { "content-type": "image/png" } }), "https://api.dataforseo.com/example.png"),
    /signature/,
  );
});

test("default dry run creates a missing runs root, writes 100 tasks, and makes no network call", async (t) => {
  const fixtureDir = await fixture(t, "test-input");
  const input = path.join(fixtureDir, "panel.json");
  await writeFile(input, `${JSON.stringify(panel())}\n`, "utf8");
  const missingRoot = path.join(RUNS_ROOT, `test-empty-root-${randomBytes(4).toString("hex")}`, "runs");
  t.after(() => rm(path.dirname(missingRoot), { recursive: true, force: true }));
  let calls = 0;
  const result = await runCli(["--input", input], {
    runsRoot: missingRoot,
    fetchImpl: async () => { calls++; throw new Error("network forbidden"); },
    logger: { log() {} },
  });
  assert.equal(calls, 0);
  assert.equal(result.manifest.mode, "dry-run");
  assert.equal(result.manifest.plannedCaptureCount, 100);
  assert.equal(result.manifest.selectedCaptureCount, 100);
  assert.equal(result.manifest.expectedCaptureIds.length, 100);
  assert.equal(result.manifest.captures.every((capture) => capture.requestSha256.length === 64), true);
  assert.equal(JSON.parse(await readFile(path.join(result.runDir, "task-plan.json"), "utf8")).length, 100);
});

test("a null balance fails closed before the task POST", async (t) => {
  const fixtureDir = await fixture(t, "test-balance");
  const input = path.join(fixtureDir, "panel.json");
  await writeFile(input, `${JSON.stringify(panel())}\n`, "utf8");
  const calls = [];
  await assert.rejects(() => runCli(["--collect", "--input", input], {
    runsRoot: path.join(fixtureDir, "runs"),
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    logger: { log() {} },
    fetchImpl: async (url, init) => {
      calls.push({ url, method: init.method });
      return jsonResponse({ status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: null } }] }] });
    },
  }), /no task POST was made/);
  assert.deepEqual(calls.map((call) => call.method), ["GET"]);
});

test("an unknown account-response cost fails closed before the task POST", async (t) => {
  const fixtureDir = await fixture(t, "test-unknown-cost");
  const input = path.join(fixtureDir, "panel.json");
  await writeFile(input, `${JSON.stringify(panel())}\n`, "utf8");
  let calls = 0;
  await assert.rejects(() => runCli(["--collect", "--input", input], {
    runsRoot: path.join(fixtureDir, "runs"),
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    logger: { log() {} },
    fetchImpl: async () => {
      calls++;
      return jsonResponse({ status_code: 20000, cost: null, tasks: [{ status_code: 20000, result: [{ money: { balance: 1 } }] }] });
    },
  }), /no task POST was made/);
  assert.equal(calls, 1);
});

test("a provider 40200 stops the single task POST without retrying", async (t) => {
  const fixtureDir = await fixture(t, "test-40200");
  const input = path.join(fixtureDir, "panel.json");
  await writeFile(input, `${JSON.stringify(panel())}\n`, "utf8");
  const calls = [];
  await assert.rejects(() => runCli(["--collect", "--input", input], {
    runsRoot: path.join(fixtureDir, "runs"),
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    logger: { log() {} },
    fetchImpl: async (url, init) => {
      calls.push({ url, method: init.method });
      return jsonResponse(calls.length === 1
        ? { status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: 1 } }] }] }
        : { status_code: 40200, cost: 0, tasks_error: 4, tasks: [] });
    },
  }), /40200/);
  assert.deepEqual(calls.map((call) => call.method), ["GET", "POST"]);
  assert.equal(calls.filter((call) => call.url.endsWith("/task_post")).length, 1);
});

test("default resume retrieves with GET only and leaves screenshots unattempted", async (t) => {
  const runDir = await fixture(t, "test-resume");
  const runId = path.basename(runDir);
  await writeFile(path.join(runDir, "run-manifest.json"), `${JSON.stringify({
    runId, mode: "collect", status: "pending", actualReturnedCost: 0, actualCostKnown: true,
    captures: [{ tag: "pms-01-desktop", device: "desktop", taskId: "task-1", state: "pending", files: {}, screenshotState: "not_requested" }],
  })}\n`, "utf8");
  const methods = [];
  const fakeFetch = async (url, init) => {
    methods.push(init.method);
    return jsonResponse(url.includes("/advanced/")
      ? { cost: 0, ...success({ item_types: ["organic"], items: [{ type: "organic", url: "https://example.com/" }] }) }
      : { status_code: 20000, tasks_error: 0, cost: 0, tasks: [{ status_code: 20000, result: [{ html: "<html>ordinary results</html>" }] }] });
  };
  const result = await runCli(["--collect", "--resume", runId], {
    runsRoot: RUNS_ROOT,
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    logger: { log() {} }, fetchImpl: fakeFetch,
  });
  assert.deepEqual(methods, ["GET", "GET"]);
  assert.equal(result.manifest.captures[0].state, "absent_returned_serp");
  assert.equal(result.manifest.captures[0].screenshotState, "not_requested_on_resume");
});

test("evidence completion preserves initial balance and downloads an already-paid screenshot at the deadline", async (t) => {
  const runDir = await fixture(t, "test-evidence");
  const runId = path.basename(runDir);
  const initialBalanceSnapshot = `${JSON.stringify({ checkedAt: "2026-09-12T20:00:00.000Z", balanceUsd: 0.75 }, null, 2)}\n`;
  await writeFile(path.join(runDir, "account-balance.json"), initialBalanceSnapshot, "utf8");
  await writeFile(path.join(runDir, "run-manifest.json"), `${JSON.stringify({
    runId, mode: "collect", status: "retrieval_pass_complete", actualReturnedCost: 0, actualCostKnown: true,
    captures: [
      { tag: "off-05-mobile", device: "mobile", taskId: "existing-task-1", state: "absent_returned_serp", files: { htmlEnvelope: { path: "evidence/off-05-mobile/html-envelope.json" } }, htmlProviderState: "content_returned", screenshotState: "not_requested_on_resume" },
      { tag: "pms-01-desktop", device: "desktop", taskId: "existing-task-2", state: "absent_returned_serp", files: { htmlEnvelope: { path: "evidence/pms-01-desktop/html-envelope.json" } }, htmlProviderState: "content_returned", screenshotState: "not_requested_on_resume" },
    ],
  })}\n`, "utf8");
  const calls = [];
  const png = Buffer.from("89504e470d0a1a0a00000000", "hex");
  const clockOffsets = [0, 0, 0, 0, 59_000, 60_000];
  let clockIndex = 0;
  const result = await runCli(["--collect", "--resume", runId, "--complete-evidence"], {
    runsRoot: RUNS_ROOT,
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    logger: { log() {} },
    now: () => Date.parse("2026-09-12T21:00:00.000Z") + clockOffsets[Math.min(clockIndex++, clockOffsets.length - 1)],
    fetchImpl: async (url, init) => {
      calls.push({ url, method: init.method, headers: init.headers, redirect: init.redirect, body: init.body });
      if (url.endsWith("/appendix/user_data"))
        return jsonResponse({ status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: 1 } }] }] });
      if (url.endsWith("/serp/screenshot"))
        return jsonResponse({ status_code: 20000, cost: 0.004, tasks: [{ status_code: 20000, result: [{ items: [{ image: "https://cdn.dataforseo.com/existing-task-1.png" }] }] }] });
      return new Response(png, { status: 200, headers: { "content-type": "image/png" } });
    },
  });
  assert.deepEqual(calls.map((call) => call.method), ["GET", "POST", "GET"]);
  assert.equal(calls.some((call) => call.url.endsWith("/task_post")), false);
  assert.match(calls[1].body, /existing-task-1/);
  assert.equal(calls[2].headers, undefined);
  assert.equal(calls[2].redirect, "error");
  assert.equal(clockIndex, 7);
  assert.equal(result.manifest.captures[0].screenshotState, "downloaded_unreviewed");
  assert.equal(result.manifest.captures[1].screenshotState, "not_requested_on_resume");
  assert.equal(result.manifest.actualReturnedCost, 0.004);
  assert.equal(await readFile(path.join(runDir, "account-balance.json"), "utf8"), initialBalanceSnapshot);
  const resumeBalanceSnapshots = (await readdir(runDir)).filter((file) =>
    /^account-balance-resume-2026-09-12T21-00-00-000Z-[a-f0-9]{6}\.json$/.test(file),
  );
  assert.equal(resumeBalanceSnapshots.length, 1);
  assert.deepEqual(JSON.parse(await readFile(path.join(runDir, resumeBalanceSnapshots[0]), "utf8")), {
    checkedAt: "2026-09-12T21:00:00.000Z",
    balanceUsd: 1,
  });
});

test("credential file parse errors never expose malformed credential contents", async (t) => {
  const fixtureDir = await fixture(t, "test-credentials");
  const input = path.join(fixtureDir, "panel.json");
  const credentials = path.join(fixtureDir, "credentials.json");
  await writeFile(input, `${JSON.stringify(panel())}\n`, "utf8");
  await writeFile(credentials, '{"login":"private@example.com","password":"secret"', "utf8");
  await assert.rejects(() => runCli(["--collect", "--input", input], {
    runsRoot: path.join(fixtureDir, "runs"),
    env: { DATAFORSEO_CREDENTIALS_PATH: credentials },
    logger: { log() {} }, fetchImpl: async () => { throw new Error("network forbidden"); },
  }), (error) => {
    assert.equal(error.message, "Credentials file could not be read or parsed.");
    assert.equal(error.message.includes("private@example.com"), false);
    return true;
  });
});

test("malformed balances or cost fields cannot authorise a paid task", async (t) => {
  const fixtureDir = await fixture(t, "test-money-guard");
  const input = path.join(fixtureDir, "panel.json");
  await writeFile(input, JSON.stringify(panel()), "utf8");
  const cases = [
    { balance: true, cost: 0 }, { balance: "  ", cost: 0 }, { balance: -1, cost: 0 },
    { balance: 1, cost: false }, { balance: 1, cost: "  " }, { balance: 1, cost: -0.1 },
  ];
  for (const [index, values] of cases.entries()) {
    const methods = [];
    await assert.rejects(() => runCli(["--collect", "--input", input], {
      runsRoot: path.join(fixtureDir, `runs-${index}`),
      env: { DATAFORSEO_LOGIN: "fixture", DATAFORSEO_PASSWORD: "fixture" },
      logger: { log() {} },
      fetchImpl: async (_url, init) => {
        methods.push(init.method);
        assert.equal(init.method, "GET");
        return jsonResponse({status_code:20000,cost:values.cost,tasks:[{status_code:20000,result:[{money:{balance:values.balance}}]}]});
      },
    }), /Balance is unavailable/);
    assert.deepEqual(methods, ["GET"]);
  }
});

test("invalid original task identity stops before any retrieval or screenshot while retaining the paid response", async (t) => {
  const fixtureDir = await fixture(t, "test-post-identities");
  const input = path.join(fixtureDir, "panel.json");
  await writeFile(input, JSON.stringify(panel()), "utf8");
  const selected = selectCaptures(buildCapturePlan(panel()), panel(), 4);
  const posted = {status_code:20000,tasks_error:0,cost:0.0048,tasks:selected.map((c,i)=>({id:`task-${i}`,status_code:20100,data:{tag:c.tag}}))};
  assert.deepEqual(taskPostIdentityIssues(posted, selected), []);
  const badTag = structuredClone(posted);
  badTag.tasks[1].data.tag = badTag.tasks[0].data.tag;
  assert.ok(taskPostIdentityIssues(badTag, selected).includes("duplicate_returned_tag"));
  posted.tasks[1].id = posted.tasks[0].id;
  const calls = [];
  const result = await runCli(["--collect", "--input", input], {
    runsRoot:path.join(fixtureDir,"runs"),env:{DATAFORSEO_LOGIN:"fixture",DATAFORSEO_PASSWORD:"fixture"},logger:{log(){}},
    fetchImpl:async (url,init)=>{
      calls.push({url,method:init.method});
      if(url.endsWith("/appendix/user_data")) return jsonResponse({status_code:20000,cost:0,tasks:[{status_code:20000,result:[{money:{balance:1}}]}]});
      assert.ok(url.endsWith("/task_post"));
      return jsonResponse(posted);
    },
  });
  assert.deepEqual(calls.map(c=>c.method),["GET","POST"]);
  assert.equal(result.manifest.status,"stopped_invalid_task_identity");
  assert.equal(result.manifest.collectionPerformed,true);
  assert.ok(result.manifest.taskPostIdentityIssues.includes("duplicate_original_task_id"));
  assert.ok(result.manifest.captures.every(c=>c.taskId===null));
  assert.deepEqual(JSON.parse(await readFile(path.join(result.runDir,"provider-responses/task-post.json"),"utf8")),posted);
});
