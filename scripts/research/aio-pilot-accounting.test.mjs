import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { reconcileRun, SCHEMA_VERSION } from "./aio-pilot-accounting.mjs";

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function taskPost(tasks) {
  return {
    status_code: 20000,
    cost: tasks.reduce((total, task) => total + task.cost, 0),
    tasks_count: tasks.length,
    tasks_error: 0,
    tasks: tasks.map((task) => ({
      id: task.id,
      status_code: 20100,
      cost: task.cost,
      data: { tag: task.tag, device: task.device },
    })),
  };
}

function getEnvelope(id, cost, kind) {
  return {
    status_code: 20000,
    cost,
    tasks_count: 1,
    tasks_error: 0,
    tasks: [
      {
        id,
        status_code: 20000,
        cost,
        result_count: 1,
        path: ["v3", "serp", "google", "organic", "task_get", kind],
        result: [{}],
      },
    ],
  };
}

function screenshotEnvelope(screenshotId, originalTaskId, cost = 0.004) {
  return {
    status_code: 20000,
    cost,
    tasks_count: 1,
    tasks_error: 0,
    tasks: [
      {
        id: screenshotId,
        status_code: 20000,
        cost,
        result_count: 1,
        data: { task_id: originalTaskId },
        result: [{ items_count: 1, items: [{ image: "https://example.invalid/screenshot" }] }],
      },
    ],
  };
}

async function fixture(t, tasks) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "aio-accounting-"));
  if (path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith("aio-accounting-")) {
    throw new Error("Unexpected accounting test directory.");
  }
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await writeJson(path.join(directory, "provider-responses", "task-post.json"), taskPost(tasks));
  await fs.writeFile(path.join(directory, "cost-ledger.jsonl"), "", "utf8");
  return directory;
}

test("deduplicates repeated GET costs and counts unique screenshots", async (t) => {
  const directory = await fixture(t, [
    { id: "task-a", tag: "a-desktop", device: "desktop", cost: 0.0012 },
    { id: "task-b", tag: "b-mobile", device: "mobile", cost: 0.0012 },
  ]);
  for (const [capture, id, finalCost, screenshotId] of [
    ["a-desktop", "task-a", 0.0006, "shot-a"],
    ["b-mobile", "task-b", 0.0012, "shot-b"],
  ]) {
    await writeJson(path.join(directory, "evidence", capture, "advanced.json"), getEnvelope(id, finalCost, "advanced"));
    await writeJson(path.join(directory, "evidence", capture, "html-envelope.json"), getEnvelope(id, finalCost, "html"));
    await writeJson(path.join(directory, "evidence", capture, "screenshot.json"), screenshotEnvelope(screenshotId, id));
  }
  const ledgerRows = [
    { endpoint: "serp/google/organic/task_post", method: "POST", cost: 0.0024, statusCode: 20000 },
    { endpoint: "task_get/advanced", method: "GET", taskId: "task-a", cost: 0.0006, statusCode: 20000 },
    { endpoint: "task_get/html", method: "GET", taskId: "task-a", cost: 0.0006, statusCode: 20000 },
    { endpoint: "task_get/advanced", method: "GET", taskId: "task-b", cost: 0.0012, statusCode: 20000 },
    { endpoint: "task_get/html", method: "GET", taskId: "task-b", cost: 0.0012, statusCode: 20000 },
    { endpoint: "serp/screenshot", method: "POST", taskId: "task-a", cost: 0.004, statusCode: 20000 },
    { endpoint: "serp/screenshot", method: "POST", taskId: "task-b", cost: 0.004, statusCode: 20000 },
  ];
  await fs.writeFile(
    path.join(directory, "cost-ledger.jsonl"),
    `${ledgerRows.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );

  const { report } = await reconcileRun(directory, { write: false, generatedAt: "2026-09-12T00:00:00.000Z" });
  assert.equal(report.schemaVersion, SCHEMA_VERSION);
  assert.equal(report.statuses.overall, "reconciled");
  assert.equal(report.totals.originalTasksProvisionalUsd, 0.0024);
  assert.equal(report.totals.originalTasksFinalizedUsd, 0.0018);
  assert.equal(report.totals.screenshotTotalUsd, 0.008);
  assert.equal(report.totals.reconciledTotalUsd, 0.0098);
  assert.equal(report.totals.rawEnvelopeTopLevelCostSumUsd, 0.014);
  assert.equal(report.screenshots.length, 2);
  assert.equal(report.issues.length, 0);
});

test("a malformed ledger prevents a reconciled status even when task costs are readable", async (t) => {
  const directory = await fixture(t, [{id:"task-ledger",tag:"ledger",device:"desktop",cost:0.0012}]);
  await writeJson(path.join(directory,"evidence","ledger","advanced.json"),getEnvelope("task-ledger",0.0012,"advanced"));
  await writeJson(path.join(directory,"evidence","ledger","html-envelope.json"),getEnvelope("task-ledger",0.0012,"html"));
  await writeJson(path.join(directory,"evidence","ledger","screenshot.json"),screenshotEnvelope("shot-ledger","task-ledger"));
  await fs.writeFile(path.join(directory,"cost-ledger.jsonl"),JSON.stringify({endpoint:"serp/screenshot",method:"POST",cost:0.004})+"\n{broken\n","utf8");
  const {report}=await reconcileRun(directory,{write:false});
  assert.equal(report.statuses.overall,"unresolved");
  assert.equal(report.issues.some(issue=>issue.code==="invalid_cost_ledger_row"),true);
});

test("flags conflicting completed costs instead of choosing one", async (t) => {
  const directory = await fixture(t, [{ id: "task-conflict", tag: "conflict", device: "desktop", cost: 0.0012 }]);
  await writeJson(
    path.join(directory, "evidence", "conflict", "advanced.json"),
    getEnvelope("task-conflict", 0.0006, "advanced"),
  );
  await writeJson(
    path.join(directory, "evidence", "conflict", "html-envelope.json"),
    getEnvelope("task-conflict", 0.0012, "html"),
  );
  await writeJson(
    path.join(directory, "evidence", "conflict", "screenshot.json"),
    screenshotEnvelope("shot-conflict", "task-conflict"),
  );

  const { report } = await reconcileRun(directory, { write: false });
  assert.equal(report.statuses.overall, "conflict");
  assert.deepEqual(report.statuses.conflictingTaskIds, ["task-conflict"]);
  assert.equal(report.originalSerpTasks[0].costState, "conflict");
  assert.equal(report.originalSerpTasks[0].finalCostUsd, null);
  assert.equal(report.totals.reconciledTotalUsd, null);
  assert.ok(report.issues.some((issue) => issue.code === "completed_task_cost_conflict"));
});

test("counts a recorded screenshot charge even when screenshot evidence failed", async (t) => {
  const directory = await fixture(t, [{ id: "task-shot-failed", tag: "failed", device: "mobile", cost: 0.0006 }]);
  await writeJson(
    path.join(directory, "evidence", "failed", "advanced.json"),
    getEnvelope("task-shot-failed", 0.0006, "advanced"),
  );
  await writeJson(
    path.join(directory, "evidence", "failed", "html-envelope.json"),
    getEnvelope("task-shot-failed", 0.0006, "html"),
  );
  const failedScreenshot = screenshotEnvelope("shot-failed", "task-shot-failed");
  failedScreenshot.tasks_error = 1;
  failedScreenshot.tasks[0].status_code = 40501;
  failedScreenshot.tasks[0].result_count = 0;
  failedScreenshot.tasks[0].result = null;
  await writeJson(path.join(directory, "evidence", "failed", "screenshot.json"), failedScreenshot);

  const { report } = await reconcileRun(directory, { write: false });
  assert.equal(report.statuses.overall, "unresolved");
  assert.equal(report.totals.screenshotTotalUsd, 0.004);
  assert.equal(report.totals.reconciledTotalUsd, 0.0046);
  assert.ok(report.issues.some((issue) => issue.code === "screenshot_not_successful"));
});

test("keeps missing POST, GET, and screenshot costs unresolved", async (t) => {
  const directory = await fixture(t, [{ id: "task-cost-missing", tag: "missing", device: "desktop", cost: null }]);
  const post = JSON.parse(
    await fs.readFile(path.join(directory, "provider-responses", "task-post.json"), "utf8"),
  );
  post.cost = "";
  post.tasks[0].cost = null;
  await writeJson(path.join(directory, "provider-responses", "task-post.json"), post);

  const advanced = getEnvelope("task-cost-missing", null, "advanced");
  const html = getEnvelope("task-cost-missing", 0, "html");
  delete html.cost;
  delete html.tasks[0].cost;
  const screenshot = screenshotEnvelope("shot-cost-missing", "task-cost-missing");
  screenshot.cost = false;
  screenshot.tasks[0].cost = "   ";

  await writeJson(path.join(directory, "evidence", "missing", "advanced.json"), advanced);
  await writeJson(path.join(directory, "evidence", "missing", "html-envelope.json"), html);
  await writeJson(path.join(directory, "evidence", "missing", "screenshot.json"), screenshot);

  const { report } = await reconcileRun(directory, { write: false });
  assert.equal(report.statuses.overall, "unresolved");
  assert.deepEqual(report.statuses.unresolvedTaskIds, ["task-cost-missing"]);
  assert.equal(report.originalSerpTasks[0].provisionalCostUsd, null);
  assert.equal(report.originalSerpTasks[0].finalCostUsd, null);
  assert.equal(report.originalSerpTasks[0].effectiveCostUsd, null);
  assert.equal(report.originalSerpTasks[0].costState, "missing");
  assert.equal(report.screenshots[0].costUsd, null);
  assert.equal(report.screenshots[0].state, "cost-missing");
  assert.equal(report.totals.originalTaskReconciledUsd, null);
  assert.equal(report.totals.screenshotTotalUsd, null);
  assert.equal(report.totals.reconciledTotalUsd, null);
  assert.equal(report.totals.reconciledTotalIsFinal, false);
  assert.equal(
    report.issues.filter((issue) => issue.code === "completed_task_cost_missing").length,
    2,
  );
  assert.ok(report.issues.some((issue) => issue.code === "task_cost_missing"));
  assert.ok(report.issues.some((issue) => issue.code === "screenshot_cost_missing"));
});

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const liveRun = path.join(
  repositoryRoot,
  "tmp",
  "ctr-aio",
  "runs",
  "2026-09-12T21-37-45-600Z-8db716",
);
let liveRunAvailable = true;
try {
  await fs.access(path.join(liveRun, "provider-responses", "task-post.json"));
} catch {
  liveRunAvailable = false;
}

test("reconciles the offline live proof without summing GET envelopes", { skip: !liveRunAvailable }, async () => {
  const { report } = await reconcileRun(liveRun, { write: false });
  assert.equal(report.statuses.hasConflicts, false);
  assert.equal(report.originalSerpTasks.length, 4);
  assert.equal(report.totals.originalTasksProvisionalUsd, 0.0048);
  assert.equal(report.totals.originalTaskReconciledUsd, 0.0042);
  assert.equal(
    report.totals.reconciledTotalUsd,
    Number((report.totals.originalTaskReconciledUsd + report.totals.screenshotTotalUsd).toFixed(8)),
  );
  assert.ok(report.totals.rawEnvelopeTopLevelCostSumUsd > report.totals.reconciledTotalUsd);
  assert.equal(report.totals.costLedgerEventSumUsd, report.totals.rawEnvelopeTopLevelCostSumUsd);
  assert.ok(report.screenshots.length === 3 || report.screenshots.length === 4);
  const refundedTask = report.originalSerpTasks.find(
    (task) => task.taskId === "09122137-2520-0066-0000-f0dad9cf4174",
  );
  assert.equal(refundedTask.finalCostUsd, 0.0006);
  assert.deepEqual(refundedTask.successfulRepresentations, ["advanced", "html"]);
  assert.equal(refundedTask.completedCostObservations.length, 2);
});
