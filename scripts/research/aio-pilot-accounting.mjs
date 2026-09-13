#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const SCHEMA_VERSION = "1.0.0";

const ENVELOPE_NAMES = new Map([
  ["advanced.json", "advanced"],
  ["html-envelope.json", "html"],
  ["screenshot.json", "screenshot"],
]);

function money(value) {
  if (typeof value === "boolean" || value === null || value === undefined) return null;
  if (typeof value === "string" && !/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 1e8) / 1e8 : null;
}

function sum(values) {
  return money(values.reduce((total, value) => total + (money(value) ?? 0), 0));
}

function uniqueMoney(values) {
  return [...new Set(values.filter((value) => value !== null).map((value) => money(value).toFixed(8)))].map(Number);
}

function relative(runDirectory, file) {
  return path.relative(runDirectory, file).split(path.sep).join("/");
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function walk(directory) {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return files;
    throw error;
  }
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}

function completedTask(envelope, task) {
  return (
    envelope?.status_code === 20000 &&
    envelope?.tasks_error === 0 &&
    task?.status_code === 20000 &&
    Number(task?.result_count) > 0 &&
    Array.isArray(task?.result) &&
    task.result.length > 0
  );
}

function addIssue(issues, code, severity, details = {}) {
  issues.push({ code, severity, ...details });
}

export async function reconcileRun(inputDirectory, options = {}) {
  const runDirectory = path.resolve(inputDirectory);
  const taskPostFile = path.join(runDirectory, "provider-responses", "task-post.json");
  const ledgerFile = path.join(runDirectory, "cost-ledger.jsonl");
  const outputFile = path.join(runDirectory, "cost-reconciliation.json");
  const issues = [];

  let taskPost;
  try {
    taskPost = await readJson(taskPostFile);
  } catch (error) {
    throw new Error(`Cannot read required task POST response ${taskPostFile}: ${error.message}`);
  }

  const taskRecords = new Map();
  for (const task of Array.isArray(taskPost.tasks) ? taskPost.tasks : []) {
    if (!task?.id) {
      addIssue(issues, "task_post_missing_id", "error");
      continue;
    }
    taskRecords.set(task.id, {
      taskId: task.id,
      tag: task.data?.tag ?? null,
      device: task.data?.device ?? null,
      postStatusCode: task.status_code ?? null,
      provisionalCostUsd: money(task.cost),
      completedCostObservations: [],
      ledgerGetCostObservations: [],
      successfulRepresentations: new Set(),
      failedRepresentations: [],
    });
  }

  if (taskPost.status_code !== 20000 || Number(taskPost.tasks_error) !== 0) {
    addIssue(issues, "task_post_envelope_not_successful", "error", {
      statusCode: taskPost.status_code ?? null,
      tasksError: taskPost.tasks_error ?? null,
    });
  }

  const rawEnvelopeCosts = [money(taskPost.cost)];
  const evidenceFiles = (await walk(path.join(runDirectory, "evidence")))
    .filter((file) => ENVELOPE_NAMES.has(path.basename(file)))
    .sort();
  const envelopeSources = [];
  const screenshots = new Map();
  let screenshotConflict = false;

  for (const file of evidenceFiles) {
    const kind = ENVELOPE_NAMES.get(path.basename(file));
    const source = relative(runDirectory, file);
    let envelope;
    try {
      envelope = await readJson(file);
    } catch (error) {
      addIssue(issues, "invalid_envelope_json", "error", { source, message: error.message });
      continue;
    }
    envelopeSources.push(source);
    rawEnvelopeCosts.push(money(envelope.cost));

    for (const task of Array.isArray(envelope.tasks) ? envelope.tasks : []) {
      if (kind === "screenshot") {
        const screenshotTaskId = task?.id ?? null;
        const originalTaskId = task?.data?.task_id ?? null;
        const observation = {
          screenshotTaskId,
          originalTaskId,
          source,
          statusCode: task?.status_code ?? null,
          costUsd: money(task?.cost),
          resultCount: Number(task?.result_count ?? 0),
          imageCount: Number(task?.result?.[0]?.items_count ?? 0),
          imageUrlPresent: Boolean(task?.result?.[0]?.items?.[0]?.image),
        };
        const successful = completedTask(envelope, task) && observation.imageUrlPresent;
        observation.state = successful ? (observation.costUsd === null ? "cost-missing" : "final") : "failed";

        if (!screenshotTaskId) {
          addIssue(issues, "screenshot_missing_operation_id", "error", { source, originalTaskId });
          screenshotConflict = true;
          continue;
        }
        if (screenshots.has(screenshotTaskId)) {
          const previous = screenshots.get(screenshotTaskId);
          if (previous.originalTaskId !== originalTaskId || previous.costUsd !== observation.costUsd) {
            addIssue(issues, "screenshot_operation_conflict", "error", {
              screenshotTaskId,
              sources: [previous.source, source],
            });
            screenshotConflict = true;
          }
          continue;
        }
        screenshots.set(screenshotTaskId, observation);
        if (observation.costUsd === null) {
          addIssue(issues, "screenshot_cost_missing", "error", {
            screenshotTaskId,
            originalTaskId,
            source,
          });
        }
        if (!successful) {
          addIssue(issues, "screenshot_not_successful", "warning", {
            screenshotTaskId,
            originalTaskId,
            source,
            statusCode: task?.status_code ?? null,
          });
        }
        if (originalTaskId && !taskRecords.has(originalTaskId)) {
          addIssue(issues, "screenshot_original_task_unknown", "warning", {
            screenshotTaskId,
            originalTaskId,
            source,
          });
        }
        continue;
      }

      const taskId = task?.id ?? null;
      const record = taskRecords.get(taskId);
      if (!record) {
        addIssue(issues, "task_get_original_task_unknown", "warning", { taskId, representation: kind, source });
        continue;
      }
      if (completedTask(envelope, task)) {
        record.successfulRepresentations.add(kind);
        const costUsd = money(task.cost);
        record.completedCostObservations.push({ representation: kind, source, costUsd });
        if (costUsd === null) {
          addIssue(issues, "completed_task_cost_missing", "warning", {
            taskId,
            representation: kind,
            source,
          });
        }
      } else {
        record.failedRepresentations.push({
          representation: kind,
          source,
          envelopeStatusCode: envelope.status_code ?? null,
          tasksError: envelope.tasks_error ?? null,
          taskStatusCode: task?.status_code ?? null,
          taskStatusMessage: task?.status_message ?? null,
          costUsd: money(task?.cost),
        });
      }
    }
  }

  const ledgerRows = [];
  try {
    const text = await fs.readFile(ledgerFile, "utf8");
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (!line.trim()) continue;
      try {
        ledgerRows.push({ line: index + 1, ...JSON.parse(line) });
      } catch (error) {
        addIssue(issues, "invalid_cost_ledger_row", "error", { line: index + 1, message: error.message });
      }
    }
  } catch (error) {
    if (error.code === "ENOENT") addIssue(issues, "cost_ledger_missing", "warning", { source: relative(runDirectory, ledgerFile) });
    else throw error;
  }

  for (const row of ledgerRows) {
    if (!String(row.endpoint ?? "").includes("task_get/")) continue;
    const record = taskRecords.get(row.taskId);
    if (!record) continue;
    record.ledgerGetCostObservations.push({
      line: row.line,
      endpoint: row.endpoint,
      statusCode: row.statusCode ?? null,
      costUsd: money(row.cost),
    });
  }

  const originalTasks = [];
  const conflictingTaskIds = new Set();
  const unresolvedTaskIds = new Set();
  for (const record of taskRecords.values()) {
    const envelopeFinalCosts = uniqueMoney(record.completedCostObservations.map((item) => item.costUsd));
    const positiveLedgerGetCosts = uniqueMoney(
      record.ledgerGetCostObservations.map((item) => item.costUsd).filter((value) => value > 0),
    );
    let finalCostUsd = envelopeFinalCosts.length === 1 ? envelopeFinalCosts[0] : null;
    let costState;

    if (envelopeFinalCosts.length > 1) {
      costState = "conflict";
      conflictingTaskIds.add(record.taskId);
      addIssue(issues, "completed_task_cost_conflict", "error", {
        taskId: record.taskId,
        observedCostsUsd: envelopeFinalCosts,
        observations: record.completedCostObservations,
      });
    } else if (
      finalCostUsd !== null &&
      positiveLedgerGetCosts.some((value) => money(value) !== money(finalCostUsd))
    ) {
      costState = "conflict";
      finalCostUsd = null;
      conflictingTaskIds.add(record.taskId);
      addIssue(issues, "ledger_final_cost_conflict", "error", {
        taskId: record.taskId,
        completedEnvelopeCostsUsd: envelopeFinalCosts,
        positiveLedgerGetCostsUsd: positiveLedgerGetCosts,
      });
    } else if (finalCostUsd !== null) {
      costState = "final";
    } else if (record.provisionalCostUsd !== null) {
      costState = "provisional";
      unresolvedTaskIds.add(record.taskId);
      addIssue(issues, "task_final_cost_unresolved", "warning", {
        taskId: record.taskId,
        provisionalCostUsd: record.provisionalCostUsd,
      });
    } else {
      costState = "missing";
      unresolvedTaskIds.add(record.taskId);
      addIssue(issues, "task_cost_missing", "error", { taskId: record.taskId });
    }

    for (const representation of ["advanced", "html"]) {
      if (!record.successfulRepresentations.has(representation)) {
        unresolvedTaskIds.add(record.taskId);
        addIssue(issues, "task_representation_unresolved", "warning", {
          taskId: record.taskId,
          representation,
        });
      }
    }
    if (![...screenshots.values()].some((item) => item.originalTaskId === record.taskId && item.state === "final")) {
      unresolvedTaskIds.add(record.taskId);
      addIssue(issues, "task_screenshot_unresolved", "warning", { taskId: record.taskId });
    }

    originalTasks.push({
      taskId: record.taskId,
      tag: record.tag,
      device: record.device,
      postStatusCode: record.postStatusCode,
      provisionalCostUsd: record.provisionalCostUsd,
      completedCostObservations: record.completedCostObservations,
      ledgerGetCostObservations: record.ledgerGetCostObservations,
      successfulRepresentations: [...record.successfulRepresentations].sort(),
      failedRepresentations: record.failedRepresentations,
      finalCostUsd,
      effectiveCostUsd:
        costState === "conflict" ? null : finalCostUsd ?? record.provisionalCostUsd,
      costState,
    });
  }
  originalTasks.sort((a, b) => a.taskId.localeCompare(b.taskId));

  const screenshotOperations = [...screenshots.values()].sort((a, b) =>
    a.screenshotTaskId.localeCompare(b.screenshotTaskId),
  );
  const hasConflicts = conflictingTaskIds.size > 0 || screenshotConflict;
  const originalTaskCostsKnown = originalTasks.every((task) => task.effectiveCostUsd !== null);
  const screenshotCostsKnown = screenshotOperations.every((item) => item.costUsd !== null);
  const originalTaskReconciledUsd = hasConflicts || !originalTaskCostsKnown
    ? null
    : sum(originalTasks.map((task) => task.effectiveCostUsd));
  const screenshotTotalUsd = screenshotCostsKnown ? sum(screenshotOperations.map((item) => item.costUsd)) : null;
  const reconciledTotalUsd =
    originalTaskReconciledUsd === null || screenshotTotalUsd === null
      ? null
      : sum([originalTaskReconciledUsd, screenshotTotalUsd]);
  const rawEnvelopeTopLevelCostSumUsd = sum(rawEnvelopeCosts);
  const costLedgerEventSumUsd = sum(ledgerRows.map((row) => row.cost));
  const ledgerScreenshotCostSumUsd = sum(
    ledgerRows.filter((row) => row.endpoint === "serp/screenshot").map((row) => row.cost),
  );

  if (screenshotTotalUsd !== null && money(ledgerScreenshotCostSumUsd) !== money(screenshotTotalUsd)) {
    addIssue(issues, "screenshot_ledger_total_mismatch", "warning", {
      ledgerScreenshotCostSumUsd,
      screenshotEnvelopeTotalUsd: screenshotTotalUsd,
    });
  }

  const hasUnresolved =
    unresolvedTaskIds.size > 0 ||
    !originalTaskCostsKnown ||
    !screenshotCostsKnown ||
    issues.some((issue) => issue.severity === "warning" || issue.severity === "error");
  const status = hasConflicts ? "conflict" : hasUnresolved ? "unresolved" : "reconciled";
  const report = {
    schemaVersion: SCHEMA_VERSION,
    artifactType: "aio-pilot-cost-reconciliation",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    runDirectory,
    accountingPolicy: {
      originalSerpTask: "count once by original task ID; replace provisional POST cost with completed GET cost",
      taskGet: "metadata only; never add repeated Advanced or HTML GET cost",
      screenshot: "count once by unique screenshot operation task ID",
      conflict: "do not select a final cost when completed observations disagree",
    },
    sources: {
      taskPost: relative(runDirectory, taskPostFile),
      costLedger: relative(runDirectory, ledgerFile),
      evidenceEnvelopes: envelopeSources,
    },
    statuses: {
      overall: status,
      hasConflicts,
      hasUnresolved,
      conflictingTaskIds: [...conflictingTaskIds].sort(),
      unresolvedTaskIds: [...unresolvedTaskIds].sort(),
    },
    originalSerpTasks: originalTasks,
    screenshots: screenshotOperations,
    totals: {
      originalTasksProvisionalUsd: sum(originalTasks.map((task) => task.provisionalCostUsd)),
      originalTasksFinalizedUsd: sum(originalTasks.map((task) => task.finalCostUsd)),
      originalTasksUnresolvedProvisionalUsd: sum(
        originalTasks.filter((task) => task.costState === "provisional").map((task) => task.provisionalCostUsd),
      ),
      originalTaskReconciledUsd,
      screenshotTotalUsd,
      reconciledTotalUsd,
      reconciledTotalIsFinal: status === "reconciled",
      rawEnvelopeTopLevelCostSumUsd,
      rawEnvelopeMinusReconciledUsd:
        reconciledTotalUsd === null ? null : money(rawEnvelopeTopLevelCostSumUsd - reconciledTotalUsd),
      costLedgerEventSumUsd,
      ledgerScreenshotCostSumUsd,
    },
    issues,
  };

  if (options.write !== false) {
    await fs.writeFile(outputFile, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  return { report, outputFile };
}

async function main() {
  const inputDirectory = process.argv[2];
  if (!inputDirectory || inputDirectory === "--help" || inputDirectory === "-h") {
    console.error("Usage: node scripts/research/aio-pilot-accounting.mjs <run-directory>");
    process.exitCode = inputDirectory ? 0 : 2;
    return;
  }
  const { report, outputFile } = await reconcileRun(inputDirectory);
  console.log(
    JSON.stringify(
      {
        outputFile,
        status: report.statuses.overall,
        reconciledTotalUsd: report.totals.reconciledTotalUsd,
        rawEnvelopeTopLevelCostSumUsd: report.totals.rawEnvelopeTopLevelCostSumUsd,
        issues: report.issues.length,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
