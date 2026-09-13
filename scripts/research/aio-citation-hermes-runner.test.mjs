import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { inspectWave, runHermesCli } from "./aio-citation-hermes-runner.mjs";

const anchor = Date.parse("2026-09-13T11:02:11.467Z");
const w2Target = anchor + 7 * 86_400_000;
const TEMP_ROOT = path.resolve(os.tmpdir());

async function cleanupFixture(state) {
  const relative = path.relative(TEMP_ROOT, path.resolve(state.root));
  assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
  await rm(state.root, { recursive: true, force: true });
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "aio-hermes-"));
  const studyRoot = path.join(root, "tmp/ctr-aio/citation-study");
  await mkdir(studyRoot, { recursive: true });
  await writeFile(path.join(studyRoot, "execution-registry.json"), JSON.stringify({
    studyId: "test", waves: { w1: { baselineSubmittedAt: new Date(anchor).toISOString() } },
  }));
  return { root, studyRoot };
}

async function installWave(state, { screenshotState = "downloaded_unreviewed" } = {}) {
  const registryFile = path.join(state.studyRoot, "execution-registry.json");
  const registry = JSON.parse(await readFile(registryFile, "utf8"));
  const runId = "test-w2-run";
  const captures = Array.from({ length: 100 }, (_, index) => ({
    tag: `tag-${index}`, taskId: `task-${index}`,
    state: "present_content_returned", htmlProviderState: "content_returned",
    screenshotState, files: { htmlEnvelope: { path: "html.json" }, screenshot: { path: "serp.png" } },
  }));
  if (state.kind === "resumable") {
    captures[0].state = "pending";
    captures[0].screenshotState = "not_requested";
    captures[0].files = {};
  }
  const receivedTaskIds = captures.map(capture => ({ tag: capture.tag, taskId: capture.taskId }));
  const status = state.kind === "complete" ? "collection_pass_finished_unreviewed" : "pending";
  registry.waves.w2 = {
    runId, attempts: [{ runId, retryAllowed: false, taskPostState: "returned_task_ids_saved" }],
  };
  await writeFile(registryFile, JSON.stringify(registry));
  const runDir = path.join(state.studyRoot, "runs/w2", runId);
  await mkdir(runDir, { recursive: true });
  await writeFile(path.join(runDir, "run-manifest.json"), JSON.stringify({
    runId, waveId: "w2", collectionPerformed: true, taskPostState: "returned_task_ids_saved",
    actualCostKnown: true, status, captures, receivedTaskIds,
    selectedCaptureIds: captures.map(capture => capture.tag),
  }));
}

const dependencies = state => ({
  root: state.root,
  studyRoot: state.studyRoot,
  now: () => w2Target,
  verifyFrozen: async () => ({ verified: true }),
  env: { DATAFORSEO_CREDENTIALS_PATH: path.join(path.dirname(state.root), "external-secret.json") },
  stat: async () => ({ isFile: () => true, mode: 0o100600, uid: typeof process.getuid === "function" ? process.getuid() : 0 }),
  platform: "linux",
  freeBytes: 2 * 1024 ** 3,
});

test("inspection and complete resume are offline no-ops", async () => {
  const state = await fixture();
  try {
    state.kind = "complete";
    await installWave(state);
    let calls = 0;
    const deps = { ...dependencies(state), env: {}, freeBytes: 0, runWrapper: async () => { calls++; } };
    assert.equal((await inspectWave("w2", state)).state, "complete");
    assert.equal((await runHermesCli(["--resume", "--wave", "w2"], deps)).state, "complete");
    assert.equal(calls, 0);
  } finally { await cleanupFixture(state); }
});

test("collect invokes the frozen wrapper once and duplicate collection is refused", async () => {
  const state = await fixture();
  try {
    let calls = 0;
    const deps = { ...dependencies(state), runWrapper: async () => {
      calls++;
      state.kind = "complete";
      await installWave(state);
      return 0;
    } };
    assert.equal((await runHermesCli(["--collect", "--wave", "w2"], deps)).state, "complete");
    await assert.rejects(runHermesCli(["--collect", "--wave", "w2"], deps), error => error.exitCode === 21);
    assert.equal(calls, 1);
  } finally { await cleanupFixture(state); }
});

test("unsafe resume state and out-of-window runs stop before wrapper invocation", async () => {
  const state = await fixture();
  try {
    state.kind = "resumable";
    await installWave(state, { screenshotState: "post_attempting" });
    let calls = 0;
    const deps = { ...dependencies(state), runWrapper: async () => { calls++; return 0; } };
    await assert.rejects(runHermesCli(["--resume", "--wave", "w2"], deps), error => error.exitCode === 22);
    state.kind = "resumable";
    await installWave(state);
    for (const now of [w2Target + 9 * 60_000, w2Target + 371 * 60_000]) {
      await assert.rejects(runHermesCli(["--resume", "--wave", "w2"], { ...deps, now: () => now }), error => error.exitCode === 24);
    }
    assert.equal(calls, 0);
  } finally { await cleanupFixture(state); }
});

test("disk and owned-operation locks block paid work safely", async () => {
  const state = await fixture();
  try {
    let calls = 0;
    const deps = { ...dependencies(state), freeBytes: 1024 ** 3 - 1, runWrapper: async () => { calls++; return 0; } };
    await assert.rejects(runHermesCli(["--collect", "--wave", "w2"], deps), /Less than 1 GiB/);
    await assert.rejects(access(path.join(state.studyRoot, "locks/hermes-study-operation.lock")));

    await mkdir(path.join(state.studyRoot, "locks"), { recursive: true });
    await writeFile(path.join(state.studyRoot, "locks/hermes-study-operation.lock"), "{}", { flag: "wx" });
    await assert.rejects(runHermesCli(["--collect", "--wave", "w2"], { ...deps, freeBytes: 2 * 1024 ** 3 }), error => error.exitCode === 25);
    assert.equal(calls, 0);
  } finally { await cleanupFixture(state); }
});

test("operation lock spans the awaited wrapper and blocks a concurrent start", async () => {
  const state = await fixture();
  try {
    let release;
    let started;
    const startedPromise = new Promise(resolve => { started = resolve; });
    const blockedWrapper = new Promise(resolve => { release = resolve; });
    const deps = { ...dependencies(state), runWrapper: async () => {
      started();
      await blockedWrapper;
      state.kind = "complete";
      await installWave(state);
      return 0;
    } };
    const first = runHermesCli(["--collect", "--wave", "w2"], deps);
    await startedPromise;
    await assert.rejects(runHermesCli(["--collect", "--wave", "w2"], deps), error => error.exitCode === 25);
    release();
    assert.equal((await first).state, "complete");
  } finally { await cleanupFixture(state); }
});

test("credentials must be external and private before collection", async () => {
  const state = await fixture();
  try {
    let calls = 0;
    const base = { ...dependencies(state), runWrapper: async () => { calls++; return 0; } };
    await assert.rejects(runHermesCli(["--collect", "--wave", "w2"], {
      ...base, env: { DATAFORSEO_CREDENTIALS_PATH: path.join(state.root, "..secrets/dataforseo.json") },
    }), /outside the research bundle/);
    await assert.rejects(runHermesCli(["--collect", "--wave", "w2"], {
      ...base, stat: async () => ({ isFile: () => true, mode: 0o100644, uid: typeof process.getuid === "function" ? process.getuid() : 0 }),
    }), /permissions must be 0600/);
    assert.equal(calls, 0);
  } finally { await cleanupFixture(state); }
});
