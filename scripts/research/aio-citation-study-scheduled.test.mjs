import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const runner = path.join(here, "aio-citation-study-scheduled.ps1");
const powershell = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";

function invoke(args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(powershell, ["-NoProfile", "-NonInteractive", "-File", runner, ...args], {
      env: { ...process.env, ...env }, windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function fixture(t, screenshotState = "not_requested_on_resume") {
  const root = await mkdtemp(path.join(os.tmpdir(), "aio-study-scheduled-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const studyRoot = path.join(root, "tmp/ctr-aio/citation-study");
  const runId = "fixture-run";
  const runDir = path.join(studyRoot, "runs/w2", runId);
  await mkdir(runDir, { recursive: true });
  const captures = Array.from({ length: 100 }, (_, index) => ({
    tag: `tag-${index + 1}`,
    taskId: `task-${index + 1}`,
    state: "pending",
    screenshotState,
    files: {},
  }));
  const manifest = {
    runId,
    waveId: "w2",
    status: "pending",
    collectionPerformed: true,
    taskPostState: "returned_task_ids_saved",
    actualCostKnown: true,
    selectedCaptureIds: captures.map(({ tag }) => tag),
    receivedTaskIds: captures.map(({ tag, taskId }) => ({ tag, taskId })),
    captures,
  };
  const registry = {
    waves: {
      w1: { baselineSubmittedAt: "2026-09-13T11:02:11.467Z" },
      w2: {
        runId,
        attempts: [{ runId, retryAllowed: false, taskPostState: "returned_task_ids_saved" }],
      },
    },
  };
  await writeFile(path.join(runDir, "run-manifest.json"), `${JSON.stringify(manifest)}\n`, "utf8");
  await writeFile(path.join(studyRoot, "execution-registry.json"), `${JSON.stringify(registry)}\n`, "utf8");
  return { root, studyRoot, runDir };
}

test("inspect is offline and recognises one exact resumable 100-ID run", { skip: process.platform !== "win32" }, async (t) => {
  const fx = await fixture(t);
  const result = await invoke(["-Mode", "Inspect", "-Wave", "w2", "-RepoRoot", fx.root, "-StudyRoot", fx.studyRoot]);
  assert.equal(result.code, 0, result.stderr);
  const state = JSON.parse(result.stdout.trim());
  assert.equal(state.state, "resumable");
  assert.equal(state.pendingCaptures, 100);
});

test("resume invokes the wrapper once and never constructs a collect command", { skip: process.platform !== "win32" }, async (t) => {
  const fx = await fixture(t);
  const argumentLog = path.join(fx.root, "arguments.txt");
  const fakeNode = path.join(fx.root, "fake-node.cmd");
  await writeFile(fakeNode, "@echo off\r\necho %*>>\"%AIO_TEST_ARGUMENT_LOG%\"\r\nexit /b 0\r\n", "utf8");
  const result = await invoke([
    "-Mode", "Resume", "-Wave", "w2", "-RepoRoot", fx.root, "-StudyRoot", fx.studyRoot,
    "-NodePath", fakeNode, "-WrapperPath", path.join(fx.root, "wrapper.mjs"),
  ], { AIO_TEST_ARGUMENT_LOG: argumentLog });
  assert.equal(result.code, 0, result.stderr);
  const args = await readFile(argumentLog, "utf8");
  assert.match(args, /wrapper\.mjs --resume --wave w2/);
  assert.doesNotMatch(args, /--collect/);
  assert.equal(args.trim().split(/\r?\n/).length, 1);
});

test("an uncertain screenshot state blocks before invoking the wrapper", { skip: process.platform !== "win32" }, async (t) => {
  const fx = await fixture(t, "post_outcome_unknown_do_not_retry");
  const argumentLog = path.join(fx.root, "arguments.txt");
  const fakeNode = path.join(fx.root, "fake-node.cmd");
  await writeFile(fakeNode, "@echo off\r\necho invoked>>\"%AIO_TEST_ARGUMENT_LOG%\"\r\nexit /b 0\r\n", "utf8");
  const result = await invoke([
    "-Mode", "Resume", "-Wave", "w2", "-RepoRoot", fx.root, "-StudyRoot", fx.studyRoot,
    "-NodePath", fakeNode, "-WrapperPath", path.join(fx.root, "wrapper.mjs"),
  ], { AIO_TEST_ARGUMENT_LOG: argumentLog });
  assert.notEqual(result.code, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /screenshot_state_requires_manual_review/);
  await assert.rejects(readFile(argumentLog, "utf8"), /ENOENT/);
});

test("a completed wave exits without invoking the wrapper", { skip: process.platform !== "win32" }, async (t) => {
  const fx = await fixture(t);
  const manifestPath = path.join(fx.runDir, "run-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.status = "collection_pass_finished_unreviewed";
  manifest.captures = manifest.captures.map((capture) => ({
    ...capture,
    state: "present_content_returned",
    htmlProviderState: "content_returned",
    screenshotState: "downloaded_unreviewed",
    files: { htmlEnvelope: { path: `evidence/${capture.tag}/html-envelope.json` }, screenshot: { path: `evidence/${capture.tag}/serp.png` } },
  }));
  await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`, "utf8");
  const argumentLog = path.join(fx.root, "arguments.txt");
  const fakeNode = path.join(fx.root, "fake-node.cmd");
  await writeFile(fakeNode, "@echo off\r\necho invoked>>\"%AIO_TEST_ARGUMENT_LOG%\"\r\nexit /b 0\r\n", "utf8");
  const result = await invoke([
    "-Mode", "Resume", "-Wave", "w2", "-RepoRoot", fx.root, "-StudyRoot", fx.studyRoot,
    "-NodePath", fakeNode, "-WrapperPath", path.join(fx.root, "wrapper.mjs"),
  ], { AIO_TEST_ARGUMENT_LOG: argumentLog });
  assert.equal(result.code, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout.trim()).state, "complete");
  await assert.rejects(readFile(argumentLog, "utf8"), /ENOENT/);
});

test("scheduled collect rejects an existing wave before invoking the wrapper", { skip: process.platform !== "win32" }, async (t) => {
  const fx = await fixture(t);
  const argumentLog = path.join(fx.root, "arguments.txt");
  const fakeNode = path.join(fx.root, "fake-node.cmd");
  await writeFile(fakeNode, "@echo off\r\necho invoked>>\"%AIO_TEST_ARGUMENT_LOG%\"\r\nexit /b 0\r\n", "utf8");
  const result = await invoke([
    "-Mode", "Collect", "-Wave", "w2", "-RepoRoot", fx.root, "-StudyRoot", fx.studyRoot,
    "-NodePath", fakeNode, "-WrapperPath", path.join(fx.root, "wrapper.mjs"),
  ], { AIO_TEST_ARGUMENT_LOG: argumentLog });
  assert.notEqual(result.code, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /automatic repeat collection is refused/);
  await assert.rejects(readFile(argumentLog, "utf8"), /ENOENT/);
});

test("an overdue resume window blocks before invoking the wrapper", { skip: process.platform !== "win32" }, async (t) => {
  const fx = await fixture(t);
  const registryPath = path.join(fx.studyRoot, "execution-registry.json");
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  registry.waves.w1.baselineSubmittedAt = "2020-01-01T00:00:00.000Z";
  await writeFile(registryPath, `${JSON.stringify(registry)}\n`, "utf8");
  const argumentLog = path.join(fx.root, "arguments.txt");
  const fakeNode = path.join(fx.root, "fake-node.cmd");
  await writeFile(fakeNode, "@echo off\r\necho invoked>>\"%AIO_TEST_ARGUMENT_LOG%\"\r\nexit /b 0\r\n", "utf8");
  const result = await invoke([
    "-Mode", "Resume", "-Wave", "w2", "-RepoRoot", fx.root, "-StudyRoot", fx.studyRoot,
    "-NodePath", fakeNode, "-WrapperPath", path.join(fx.root, "wrapper.mjs"),
  ], { AIO_TEST_ARGUMENT_LOG: argumentLog });
  assert.notEqual(result.code, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /resume_schedule_deadline_missed/);
  await assert.rejects(readFile(argumentLog, "utf8"), /ENOENT/);
});
