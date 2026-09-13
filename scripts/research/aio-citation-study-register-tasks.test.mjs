import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const planner = path.join(here, "aio-citation-study-register-tasks.ps1");
const powershell = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";

function invoke(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(powershell, ["-NoProfile", "-NonInteractive", "-File", planner, ...args], { windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("offline plan emits six exact InteractiveToken tasks and never registers them", { skip: process.platform !== "win32" }, async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "aio-study-task-plan-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const studyRoot = path.join(root, "tmp/ctr-aio/citation-study");
  const outputRoot = path.join(root, "plan");
  const runner = path.join(root, "runner.ps1");
  const prefix = `CodexAioPlanTest${process.pid}${Date.now()}`;
  await mkdir(studyRoot, { recursive: true });
  await writeFile(runner, "exit 0\n", "utf8");
  await writeFile(path.join(studyRoot, "execution-registry.json"), JSON.stringify({
    studyId: "fixture-study",
    waves: { w1: { baselineSubmittedAt: "2026-09-13T11:02:11.467Z" } },
  }), "utf8");

  const result = await invoke([
    "-Mode", "Plan", "-RepoRoot", root, "-StudyRoot", studyRoot,
    "-RunnerPath", runner, "-OutputRoot", outputRoot, "-TaskPrefix", prefix,
  ]);
  assert.equal(result.code, 0, result.stderr);
  const plan = JSON.parse(await readFile(path.join(outputRoot, "scheduler-plan.json"), "utf8"));
  assert.equal(plan.tasks.length, 6);
  assert.deepEqual(plan.tasks.filter(({ operation }) => operation === "collect").map(({ targetSubmittedAtUtc }) => targetSubmittedAtUtc), [
    "2026-09-20T11:02:11.467Z", "2026-09-27T11:02:11.467Z", "2026-10-04T11:02:11.467Z",
  ]);
  assert.equal(plan.tasks.every(({ logonType }) => logonType === "InteractiveToken"), true);
  assert.equal(plan.tasks.filter(({ operation }) => operation === "collect").every(({ repetition }) => repetition === null), true);
  assert.equal(plan.tasks.filter(({ operation }) => operation === "resume").every(({ repetition }) => repetition.intervalMinutes === 10), true);

  const files = await readdir(outputRoot);
  assert.equal(files.filter((name) => name.endsWith(".xml")).length, 6);
  const collectXml = await readFile(path.join(outputRoot, `${prefix}-W2-Collect.xml`), "utf8");
  const resumeXml = await readFile(path.join(outputRoot, `${prefix}-W2-Resume.xml`), "utf8");
  assert.match(collectXml, /<LogonType>InteractiveToken<\/LogonType>/);
  assert.match(collectXml, /-WindowStyle Hidden/);
  assert.match(collectXml, /-NodePath "C:\\Program Files\\nodejs\\node\.exe"/);
  assert.match(collectXml, /-Mode Collect -Wave w2/);
  assert.match(collectXml, /<StartBoundary>2026-09-20T11:02:11Z<\/StartBoundary>/);
  assert.doesNotMatch(collectXml, /<Repetition>/);
  assert.match(collectXml, /<StartWhenAvailable>false<\/StartWhenAvailable>/);
  assert.match(collectXml, /<MultipleInstancesPolicy>IgnoreNew<\/MultipleInstancesPolicy>/);
  assert.match(collectXml, /<WakeToRun>true<\/WakeToRun>/);
  assert.match(collectXml, /<RunOnlyIfNetworkAvailable>true<\/RunOnlyIfNetworkAvailable>/);
  assert.match(collectXml, /<ExecutionTimeLimit>PT30M<\/ExecutionTimeLimit>/);
  assert.match(resumeXml, /-Mode Resume -Wave w2/);
  assert.match(resumeXml, /<Interval>PT10M<\/Interval>/);
  assert.match(resumeXml, /<Duration>PT6H<\/Duration>/);
  assert.match(resumeXml, /<StopAtDurationEnd>false<\/StopAtDurationEnd>/);
  assert.match(resumeXml, /<EndBoundary>2026-09-20T17:12:11Z<\/EndBoundary>/);
  assert.match(resumeXml, /<StartWhenAvailable>true<\/StartWhenAvailable>/);
  assert.match(resumeXml, /<ExecutionTimeLimit>PT10M<\/ExecutionTimeLimit>/);

  const taskQuery = await new Promise((resolve, reject) => {
    const child = spawn(powershell, ["-NoProfile", "-NonInteractive", "-Command",
      `(Get-ScheduledTask -TaskName '${prefix}*' -ErrorAction SilentlyContinue | Measure-Object).Count`], { windowsHide: true });
    let stdout = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout }));
  });
  assert.equal(taskQuery.code, 0);
  assert.equal(taskQuery.stdout.trim(), "0");
});
