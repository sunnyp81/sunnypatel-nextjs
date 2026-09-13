import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runCitationStudyCli } from "./aio-citation-study.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");

function panel() {
  return {
    sectors: Array.from({ length: 10 }, (_, sectorIndex) => ({
      id: `sector-${sectorIndex + 1}`,
      label: `Sector ${sectorIndex + 1}`,
      queries: Array.from({ length: 5 }, (_, queryIndex) => {
        const ordinal = sectorIndex * 5 + queryIndex + 1;
        return { id: `q-${String(ordinal).padStart(2, "0")}`, query: `query ${ordinal}`, intent: "informational", userTask: `task ${ordinal}` };
      }),
    })),
  };
}

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "aio-citation-study-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const docs = path.join(root, "docs/research");
  const scripts = path.join(root, "scripts/research");
  await mkdir(docs, { recursive: true });
  await mkdir(scripts, { recursive: true });
  const panelText = `${JSON.stringify(panel(), null, 2)}\n`;
  await writeFile(path.join(docs, "ai-overview-pilot-panel.json"), panelText, "utf8");
  await writeFile(path.join(docs, "ai-overview-citation-protocol.md"), "# Frozen protocol\n", "utf8");
  await writeFile(path.join(scripts, "aio-pilot.mjs"), "export const collector = true;\n", "utf8");
  await writeFile(path.join(scripts, "aio-citation-study.mjs"), "export const wrapper = true;\n", "utf8");
  await writeFile(path.join(scripts, "aio-citation-compare.mjs"), "export const compare = true;\n", "utf8");
  await writeFile(path.join(scripts, "aio-pilot-summary.mjs"), "export const summary = true;\n", "utf8");
  const config = {
    schemaVersion: "1.0.0",
    studyId: "test-study-v1",
    protocolVersion: "1.0.0",
    preparedDate: "2026-09-13",
    methodologicalAmendmentDate: "2026-09-13",
    methodologicalAmendmentScope: "prospective",
    panelPath: "docs/research/ai-overview-pilot-panel.json",
    panelSha256: hash(panelText),
    protocolPath: "docs/research/ai-overview-citation-protocol.md",
    scope: "test scope",
    captureCount: 100,
    waveIds: ["w1", "w2", "w3", "w4"],
    repeatOffsetsDays: [0, 7, 14, 21],
    repeatStartToleranceMinutes: 60,
    maxProviderCaptureSpanMinutes: 30,
    maxProviderCaptureDelayMinutes: 60,
    providerTimingPopulation: "all",
    minimumCompleteCapturesPerWave: 95,
    minimumIdentityResolvedPairs: 80,
    minimumIdentityResolvedPairsPerDevice: 40,
    identityResolvedPairRequiresValidExternalCitationSets: true,
    minimumRetentionPairs: 20,
    reservedMaximumPerWaveUsd: 0.52,
    reservedMaximumStudyUsd: 2.08,
    primaryFeatureStates: ["confirmed_main_aio", "main_absent"],
    excludedFeatureStates: ["ambiguous_main_generated", "missing", "invalid"],
    primaryWaveComparisons: [["w1", "w2"], ["w2", "w3"], ["w3", "w4"]],
    secondaryWaveComparisons: [["w1", "w3"], ["w1", "w4"]],
    unresolvedExternalReferencePolicy: "invalidate",
    nullReferenceSetPolicy: "unknown",
    systemicMethodErrorsBlockRelease: true,
    urlPolicy: "byte_exact",
    hostPolicy: "hostname",
    publicationRequiresProspectiveWaves: 2,
  };
  await writeFile(path.join(docs, "ai-overview-citation-study.json"), `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return { root, studyRoot: path.join(root, "tmp/ctr-aio/citation-study") };
}

const response = (value) => new Response(JSON.stringify(value), {
  status: 200,
  headers: { "content-type": "application/json" },
});

const quiet = { log() {} };

test("default command freezes seven inputs without network and reruns as exact verification", async (t) => {
  const fx = await fixture(t);
  let calls = 0;
  const dependencies = {
    ...fx,
    now: () => Date.parse("2026-09-13T10:00:00.000Z"),
    logger: quiet,
    fetchImpl: async () => { calls++; throw new Error("network forbidden"); },
  };
  const first = await runCitationStudyCli([], dependencies);
  const firstManifest = await readFile(path.join(first.frozenRoot, "freeze-manifest.json"), "utf8");
  const second = await runCitationStudyCli(["--prepare"], { ...dependencies, now: () => Date.parse("2026-09-14T10:00:00.000Z") });
  assert.equal(calls, 0);
  assert.equal(await readFile(path.join(second.frozenRoot, "freeze-manifest.json"), "utf8"), firstManifest);
  assert.deepEqual(Object.keys(second.manifest.artifacts).sort(), [
    "collector", "comparisonEngine", "config", "panel", "protocol", "summaryHelper", "wrapper",
  ]);
  assert.equal(second.manifest.registration.frozenAt, "2026-09-13T10:00:00.000Z");
  assert.equal(second.manifest.preparedProtocolState.reservedMaximumStudyUsd, 2.08);
});

test("a current protocol hash change blocks collection before provider access", async (t) => {
  const fx = await fixture(t);
  await runCitationStudyCli([], { ...fx, logger: quiet });
  await writeFile(path.join(fx.root, "docs/research/ai-overview-citation-protocol.md"), "# Changed after freeze\n", "utf8");
  let calls = 0;
  await assert.rejects(() => runCitationStudyCli(["--collect", "--wave", "w1"], {
    ...fx,
    logger: quiet,
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    fetchImpl: async () => { calls++; throw new Error("must not run"); },
  }), /frozen registration|frozen artifact/);
  assert.equal(calls, 0);
});

test("the freeze is checked again after balance GET and before task POST", async (t) => {
  const fx = await fixture(t);
  await runCitationStudyCli([], { ...fx, logger: quiet });
  const methods = [];
  await assert.rejects(() => runCitationStudyCli(["--collect", "--wave", "w1"], {
    ...fx,
    logger: quiet,
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    fetchImpl: async (url, init) => {
      methods.push(init.method);
      assert.equal(url.endsWith("/appendix/user_data"), true);
      await writeFile(path.join(fx.root, "docs/research/ai-overview-citation-protocol.md"), "# Changed during balance GET\n", "utf8");
      return response({ status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: 3 } }] }] });
    },
  }), /frozen registration.*state was saved/);
  assert.deepEqual(methods, ["GET"]);
});

test("one successful 100-ID batch records join metadata and blocks a duplicate", async (t) => {
  const fx = await fixture(t);
  await runCitationStudyCli([], { ...fx, logger: quiet, now: () => Date.parse("2026-09-13T08:00:00.000Z") });
  const methods = [];
  let clock = Date.parse("2026-09-13T09:00:00.000Z") - 61_000;
  const now = () => (clock += 61_000);
  const fetchImpl = async (url, init) => {
    methods.push(init.method);
    if (url.endsWith("/appendix/user_data")) {
      return response({ status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: 3 } }] }] });
    }
    if (url.endsWith("/task_post")) {
      const runIds = await readdir(path.join(fx.studyRoot, "runs/w1"));
      const receipt = JSON.parse(await readFile(path.join(fx.studyRoot, "runs/w1", runIds[0], "task-post-submission.json"), "utf8"));
      assert.equal(receipt.waveId, "w1");
      assert.equal(receipt.requestCount, 100);
      assert.equal(receipt.recordedBeforeProviderRequest, true);
      assert.equal(receipt.requestBodySha256, hash(init.body));
      const requests = JSON.parse(init.body);
      return response({
        status_code: 20000,
        cost: 0.12,
        tasks_error: 0,
        tasks: requests.map((request, index) => ({ id: `task-${index + 1}`, status_code: 20100, data: { tag: request.tag }, result: null })),
      });
    }
    throw new Error(`unexpected provider call: ${url}`);
  };
  const dependencies = {
    ...fx,
    logger: quiet,
    now,
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    fetchImpl,
    sleep: async () => {},
  };
  const first = await runCitationStudyCli(["--collect", "--wave", "w1"], dependencies);
  assert.deepEqual(methods, ["GET", "POST"]);
  assert.equal(first.manifest.waveId, "w1");
  assert.equal(first.manifest.receivedTaskIds.length, 100);
  assert.equal(first.manifest.submittedAt, first.manifest.baselineSubmittedAt);
  assert.deepEqual(first.manifest.systemicMethodErrors, []);
  assert.equal(first.manifest.captures.every((capture) => capture.originalRequest && capture.providerResultReturned === false), true);
  assert.equal(first.manifest.registration.protocolSha256.length, 64);
  await assert.rejects(
    () => runCitationStudyCli(["--collect", "--wave", "w1"], dependencies),
    /duplicate task submission is blocked/,
  );
  assert.deepEqual(methods, ["GET", "POST"]);

  const unsafeSibling = path.join(fx.studyRoot, "runs/w1/unsafe-sibling");
  await mkdir(unsafeSibling, { recursive: true });
  await writeFile(path.join(unsafeSibling, "run-manifest.json"), `${JSON.stringify({
    runId: "unsafe-sibling",
    status: "stopped_uncertain_post",
    collectionPerformed: false,
    taskPostState: "unknown_do_not_retry",
    captures: [],
  })}\n`, "utf8");
  await assert.rejects(
    () => runCitationStudyCli(["--resume", "--wave", "w1"], dependencies),
    /uncertain sibling/,
  );
  await rm(unsafeSibling, { recursive: true, force: true });

  const baseline = Date.parse(first.manifest.baselineSubmittedAt);
  let w2Clock = baseline + 7 * 86_400_000 + 60 * 60_000 - 1;
  const w2Methods = [];
  await assert.rejects(() => runCitationStudyCli(["--collect", "--wave", "w2"], {
    ...fx,
    logger: quiet,
    now: () => w2Clock,
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    fetchImpl: async (url, init) => {
      w2Methods.push(init.method);
      if (!url.endsWith("/appendix/user_data")) throw new Error("paid POST reached base fetch after the window");
      w2Clock += 2;
      return response({ status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: 3 } }] }] });
    },
  }), /window was missed.*state was saved/);
  assert.deepEqual(w2Methods, ["GET"]);

  const receiptPath = path.join(first.runDir, "task-post-submission.json");
  await writeFile(receiptPath, `${JSON.stringify({ submittedAt: first.manifest.submittedAt })}\n`, "utf8");
  await assert.rejects(
    () => runCitationStudyCli(["--resume", "--wave", "w1"], dependencies),
    /does not have exactly one certain 100-ID run/,
  );
  assert.deepEqual(methods, ["GET", "POST"]);
});

test("insufficient funding performs one balance GET, records zero POST, and permits only an explicit retry", async (t) => {
  const fx = await fixture(t);
  await runCitationStudyCli([], { ...fx, logger: quiet });
  const methods = [];
  const dependencies = {
    ...fx,
    logger: quiet,
    now: () => Date.parse("2026-09-13T10:00:00.000Z") + methods.length,
    env: { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" },
    fetchImpl: async (_url, init) => {
      methods.push(init.method);
      return response({ status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: 0.51 } }] }] });
    },
  };
  await assert.rejects(() => runCitationStudyCli(["--collect", "--wave", "w1"], dependencies), /no task POST was made.*state was saved/);
  assert.deepEqual(methods, ["GET"]);
  const registry = JSON.parse(await readFile(path.join(fx.studyRoot, "execution-registry.json"), "utf8"));
  assert.equal(registry.waves.w1.attempts[0].retryAllowed, true);
  assert.equal(registry.waves.w1.attempts[0].taskPostState, null);
  const runManifest = JSON.parse(await readFile(path.join(
    fx.studyRoot, "runs/w1", registry.waves.w1.attempts[0].runId, "run-manifest.json",
  ), "utf8"));
  assert.equal(runManifest.waveId, "w1");
  assert.equal(runManifest.submittedAt, null);
  assert.equal(runManifest.studyWrapperOutcome, "failed");
  assert.match(runManifest.studyWrapperFailure.message, /no task POST was made/);
  assert.equal(runManifest.captures.every((capture) => capture.providerResultReturned === false), true);

  await assert.rejects(() => runCitationStudyCli(["--collect", "--wave", "w1"], dependencies), /no task POST was made.*state was saved/);
  assert.deepEqual(methods, ["GET", "GET"]);
});

test("two concurrent retries after a balance-only block cannot overlap", async (t) => {
  const fx = await fixture(t);
  await runCitationStudyCli([], { ...fx, logger: quiet });
  const env = { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" };
  const lowBalance = async () => response({
    status_code: 20000,
    cost: 0,
    tasks: [{ status_code: 20000, result: [{ money: { balance: 0.51 } }] }],
  });
  await assert.rejects(() => runCitationStudyCli(["--collect", "--wave", "w1"], {
    ...fx, env, logger: quiet, fetchImpl: lowBalance,
  }), /no task POST was made/);

  let release;
  let entered;
  const enteredPromise = new Promise((resolve) => { entered = resolve; });
  const heldFetch = async (_url, init) => {
    assert.equal(init.method, "GET");
    entered();
    await new Promise((resolve) => { release = resolve; });
    return lowBalance();
  };
  const active = runCitationStudyCli(["--collect", "--wave", "w1"], {
    ...fx, env, logger: quiet, fetchImpl: heldFetch,
  });
  await enteredPromise;
  await assert.rejects(() => runCitationStudyCli(["--collect", "--wave", "w1"], {
    ...fx, env, logger: quiet, fetchImpl: async () => { throw new Error("provider must not be called"); },
  }), /lock already exists/);
  release();
  await assert.rejects(() => active, /no task POST was made/);
});

test("a resume cannot overlap an active initial collection after task IDs exist", async (t) => {
  const fx = await fixture(t);
  await runCitationStudyCli([], { ...fx, logger: quiet });
  const env = { DATAFORSEO_LOGIN: "test", DATAFORSEO_PASSWORD: "secret" };
  const base = Date.parse("2026-09-13T12:00:00.000Z");
  let clock = base;
  let releaseAdvanced;
  let advancedEntered;
  const advancedEnteredPromise = new Promise((resolve) => { advancedEntered = resolve; });
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push(init.method);
    if (url.endsWith("/appendix/user_data")) {
      return response({ status_code: 20000, cost: 0, tasks: [{ status_code: 20000, result: [{ money: { balance: 3 } }] }] });
    }
    if (url.endsWith("/task_post")) {
      const requests = JSON.parse(init.body);
      return response({
        status_code: 20000,
        cost: 0.12,
        tasks_error: 0,
        tasks: requests.map((request, index) => ({ id: `held-${index + 1}`, status_code: 20100, data: { tag: request.tag }, result: null })),
      });
    }
    if (url.includes("/task_get/advanced/")) {
      advancedEntered();
      await new Promise((resolve) => { releaseAdvanced = resolve; });
      clock = base + 61_000;
      return response({ status_code: 20000, cost: 0, tasks_error: 0, tasks: [{ status_code: 20100, result: null }] });
    }
    throw new Error(`unexpected provider call: ${url}`);
  };
  const dependencies = { ...fx, env, logger: quiet, now: () => clock, fetchImpl, sleep: async () => {} };
  const active = runCitationStudyCli(["--collect", "--wave", "w1"], dependencies);
  await advancedEnteredPromise;
  await assert.rejects(
    () => runCitationStudyCli(["--resume", "--wave", "w1"], {
      ...dependencies,
      fetchImpl: async () => { throw new Error("resume provider access must not occur"); },
    }),
    /lock already exists/,
  );
  assert.deepEqual(calls, ["GET", "POST", "GET"]);
  releaseAdvanced();
  const result = await active;
  assert.equal(result.manifest.receivedTaskIds.length, 100);
});
