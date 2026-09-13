import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildUnitPlan, runCli } from "./aio-citation-hermes-units.mjs";

const anchor = "2026-09-13T11:02:11.467Z";

test("builds six bounded deterministic operations with explicit one-time persistent calendar entries", () => {
  const plan = buildUnitPlan(anchor);
  assert.equal(plan.operations.length, 6);
  assert.equal(plan.units.length, 12);
  const w2Collect = plan.operations.find(({ wave, operation }) => wave === "w2" && operation === "collect");
  const w2Resume = plan.operations.find(({ wave, operation }) => wave === "w2" && operation === "resume");
  const w4Collect = plan.operations.find(({ wave, operation }) => wave === "w4" && operation === "collect");
  assert.deepEqual(w2Collect, {
    wave: "w2", operation: "collect", targetSubmittedAt: "2026-09-20T11:02:11.467Z",
    firstOccurrence: "2026-09-20T11:02:11.467Z", lastOccurrence: "2026-09-20T11:02:11.467Z",
    occurrenceCount: 1, service: "sunnypatel-aio-citation-w2-collect.service",
    timer: "sunnypatel-aio-citation-w2-collect.timer", timeout: "30min",
  });
  assert.equal(w2Resume.firstOccurrence, "2026-09-20T11:12:11.467Z");
  assert.equal(w2Resume.lastOccurrence, "2026-09-20T17:12:11.467Z");
  assert.equal(w2Resume.occurrenceCount, 37);
  assert.equal(w4Collect.targetSubmittedAt, "2026-10-04T11:02:11.467Z");

  const collectTimer = plan.units.find(({ filename }) => filename === "sunnypatel-aio-citation-w2-collect.timer").content;
  const resumeTimer = plan.units.find(({ filename }) => filename === "sunnypatel-aio-citation-w2-resume.timer").content;
  assert.equal((collectTimer.match(/^OnCalendar=/gm) || []).length, 1);
  assert.equal((resumeTimer.match(/^OnCalendar=/gm) || []).length, 37);
  assert.match(collectTimer, /OnCalendar=2026-09-20 11:02:11\.467 UTC/);
  assert.match(resumeTimer, /OnCalendar=2026-09-20 11:12:11\.467 UTC/);
  assert.match(resumeTimer, /OnCalendar=2026-09-20 17:12:11\.467 UTC/);
  assert.doesNotMatch(`${collectTimer}\n${resumeTimer}`, /2027-|\*-\*-/);
  assert.match(collectTimer, /Persistent=true/);
  assert.match(collectTimer, /RandomizedDelaySec=0/);
});

test("services invoke the deterministic runner with scoped paths and no restart", () => {
  const plan = buildUnitPlan(anchor);
  const collect = plan.units.find(({ filename }) => filename === "sunnypatel-aio-citation-w3-collect.service").content;
  const resume = plan.units.find(({ filename }) => filename === "sunnypatel-aio-citation-w3-resume.service").content;
  assert.match(collect, /^ExecStart=\/usr\/bin\/flock --nonblock --exclusive \/root\/\.hermes\/research\/sunnypatel-aio-citation-v1\/tmp\/ctr-aio\/citation-study\/locks\/hermes-systemd-operation\.lock \/usr\/local\/bin\/node \/root\/\.hermes\/research\/sunnypatel-aio-citation-v1\/scripts\/research\/aio-citation-hermes-runner\.mjs --collect --wave w3$/m);
  assert.match(resume, /aio-citation-hermes-runner\.mjs --resume --wave w3/);
  assert.match(collect, /^Environment=DATAFORSEO_CREDENTIALS_PATH=\/root\/\.hermes\/research-secrets\/sunnypatel-aio-dataforseo\.json$/m);
  assert.match(collect, /^ExecCondition=\/usr\/bin\/test ! -e \/root\/\.hermes\/locks\/KILL$/m);
  assert.match(collect, /^Restart=no$/m);
  assert.match(collect, /^TimeoutStartSec=30min$/m);
  assert.match(resume, /^TimeoutStartSec=10min$/m);
  assert.match(collect, /^ProtectSystem=strict$/m);
  assert.match(collect, /^ReadOnlyPaths=\/root\/\.hermes\/research\/sunnypatel-aio-citation-v1\/tmp\/ctr-aio\/citation-study\/frozen-v1$/m);
  assert.match(collect, /^ReadWritePaths=\/root\/\.hermes\/research\/sunnypatel-aio-citation-v1\/tmp\/ctr-aio\/citation-study$/m);
  assert.doesNotMatch(`${collect}\n${resume}`, /hermes cron|gateway|publish|telegram|password|login=/i);
});

test("offline CLI writes and exactly verifies twelve units without installation", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "aio-hermes-units-"));
  t.after(async () => {
    const tempRoot = path.resolve(os.tmpdir());
    const resolvedRoot = path.resolve(root);
    const relative = path.relative(tempRoot, resolvedRoot);
    assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
    await rm(resolvedRoot, { recursive: true, force: true });
  });
  const studyRoot = path.join(root, "study");
  const outputRoot = path.join(root, "plan");
  await mkdir(studyRoot, { recursive: true });
  await writeFile(path.join(studyRoot, "execution-registry.json"), JSON.stringify({
    waves: { w1: { baselineSubmittedAt: anchor } },
  }), "utf8");
  let logs = 0;
  const dependencies = { studyRoot, outputRoot, logger: { log() { logs++; } } };
  const first = await runCli([], dependencies);
  const original = await readFile(path.join(outputRoot, "unit-plan.json"), "utf8");
  const second = await runCli([], dependencies);
  assert.equal(await readFile(path.join(outputRoot, "unit-plan.json"), "utf8"), original);
  assert.equal(first.manifest.deploymentState, "offline_plan_not_installed");
  assert.equal(second.manifest.units.length, 12);
  assert.equal((await readdir(outputRoot)).length, 13);
  assert.equal(logs, 2);
});
