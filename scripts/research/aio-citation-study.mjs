#!/usr/bin/env node
import { createHash, randomBytes } from "node:crypto";
import { mkdir, open, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runCli as runPilotCli } from "./aio-pilot.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
export const STUDY_ROOT = path.join(ROOT, "tmp/ctr-aio/citation-study");
export const FROZEN_DIRECTORY = "frozen-v1";
export const REGISTRY_FILE = "execution-registry.json";
const WAVES = ["w1", "w2", "w3", "w4"];
const EXPECTED_OFFSETS_DAYS = [0, 7, 14, 21];
const PER_WAVE_RESERVE_USD = 0.52;
const STUDY_RESERVE_USD = 2.08;
const DAY_MS = 86_400_000;

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const iso = (now) => new Date(now()).toISOString();
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function defaultSourcePaths(root) {
  return {
    protocol: path.join(root, "docs/research/ai-overview-citation-protocol.md"),
    config: path.join(root, "docs/research/ai-overview-citation-study.json"),
    panel: path.join(root, "docs/research/ai-overview-pilot-panel.json"),
    collector: path.join(root, "scripts/research/aio-pilot.mjs"),
    wrapper: path.join(root, "scripts/research/aio-citation-study.mjs"),
    comparisonEngine: path.join(root, "scripts/research/aio-citation-compare.mjs"),
    summaryHelper: path.join(root, "scripts/research/aio-pilot-summary.mjs"),
  };
}

const FROZEN_NAMES = {
  protocol: "ai-overview-citation-protocol.md",
  config: "ai-overview-citation-study.json",
  panel: "ai-overview-pilot-panel.json",
  collector: "aio-pilot.mjs",
  wrapper: "aio-citation-study.mjs",
  comparisonEngine: "aio-citation-compare.mjs",
  summaryHelper: "aio-pilot-summary.mjs",
};

function pathsFor(dependencies) {
  const root = dependencies.root || ROOT;
  const studyRoot = dependencies.studyRoot || (root === ROOT ? STUDY_ROOT : path.join(root, "tmp/ctr-aio/citation-study"));
  return {
    root,
    studyRoot,
    frozenRoot: path.join(studyRoot, FROZEN_DIRECTORY),
    registryPath: path.join(studyRoot, REGISTRY_FILE),
    sources: dependencies.sourcePaths || defaultSourcePaths(root),
  };
}

function relative(root, file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function parseArgs(argv) {
  let command = null;
  let wave = null;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (["--prepare", "--collect", "--resume"].includes(arg)) {
      if (command) throw new Error("Choose exactly one of --prepare, --collect, or --resume.");
      command = arg.slice(2);
    } else if (arg === "--wave") {
      if (!argv[index + 1]) throw new Error("--wave requires w1, w2, w3, or w4.");
      wave = argv[++index].toLowerCase();
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  command ||= "prepare";
  if (command === "prepare" && wave) throw new Error("--wave is only valid with --collect or --resume.");
  if (command !== "prepare" && !WAVES.includes(wave)) throw new Error("--collect and --resume require --wave w1, w2, w3, or w4.");
  return { command, wave };
}

function assertConfig(config, panelHash) {
  if (!config || typeof config !== "object") throw new Error("Study configuration must be a JSON object.");
  const exact = [
    [config.captureCount, 100, "captureCount"],
    [config.repeatStartToleranceMinutes, 60, "repeatStartToleranceMinutes"],
    [config.reservedMaximumPerWaveUsd, PER_WAVE_RESERVE_USD, "reservedMaximumPerWaveUsd"],
    [config.reservedMaximumStudyUsd, STUDY_RESERVE_USD, "reservedMaximumStudyUsd"],
  ];
  for (const [actual, expected, field] of exact) {
    if (actual !== expected) throw new Error(`Study configuration ${field} must equal ${expected}.`);
  }
  if (JSON.stringify(config.waveIds) !== JSON.stringify(WAVES)) throw new Error("Study configuration waveIds must be exactly w1 through w4.");
  if (JSON.stringify(config.repeatOffsetsDays) !== JSON.stringify(EXPECTED_OFFSETS_DAYS))
    throw new Error("Study configuration repeatOffsetsDays must be exactly 0, 7, 14, and 21.");
  if (config.panelSha256 !== panelHash) throw new Error("Study configuration panelSha256 does not match the panel bytes.");
  if (config.reservedMaximumPerWaveUsd * config.waveIds.length !== config.reservedMaximumStudyUsd)
    throw new Error("Study configuration wave reserves do not equal the total study reserve.");
}

function preparedProtocolState(config) {
  const fields = [
    "schemaVersion", "studyId", "protocolVersion", "preparedDate", "methodologicalAmendmentDate",
    "methodologicalAmendmentScope", "scope", "panelPath", "panelSha256", "protocolPath", "captureCount",
    "waveIds", "repeatOffsetsDays", "repeatStartToleranceMinutes", "maxProviderCaptureSpanMinutes",
    "maxProviderCaptureDelayMinutes", "providerTimingPopulation", "minimumCompleteCapturesPerWave",
    "minimumIdentityResolvedPairs", "minimumIdentityResolvedPairsPerDevice",
    "identityResolvedPairRequiresValidExternalCitationSets", "minimumRetentionPairs",
    "reservedMaximumPerWaveUsd", "reservedMaximumStudyUsd", "primaryFeatureStates", "excludedFeatureStates",
    "primaryWaveComparisons", "secondaryWaveComparisons", "unresolvedExternalReferencePolicy",
    "nullReferenceSetPolicy", "systemicMethodErrorsBlockRelease", "urlPolicy", "hostPolicy",
    "publicationRequiresProspectiveWaves",
  ];
  return Object.fromEntries(fields.map((field) => [field, config[field] ?? null]));
}

async function writeExclusiveOrVerify(file, bytes) {
  let handle;
  try {
    handle = await open(file, "wx");
    await handle.writeFile(bytes);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const existing = await readFile(file);
    if (!existing.equals(bytes)) throw new Error(`Frozen artifact already exists with different bytes: ${path.basename(file)}.`);
  } finally {
    await handle?.close();
  }
}

async function readInputs(paths) {
  const entries = await Promise.all(Object.entries(paths.sources).map(async ([role, source]) => [role, source, await readFile(source)]));
  const buffers = Object.fromEntries(entries.map(([role, , bytes]) => [role, bytes]));
  let config;
  try { config = JSON.parse(buffers.config.toString("utf8")); }
  catch { throw new Error("Study configuration is not valid JSON."); }
  assertConfig(config, sha256(buffers.panel));
  return { entries, buffers, config };
}

function expectedArtifacts(paths, entries) {
  return Object.fromEntries(entries.map(([role, source, bytes]) => [role, {
    role,
    source: relative(paths.root, source),
    frozenFile: FROZEN_NAMES[role],
    sha256: sha256(bytes),
    bytes: bytes.length,
  }]));
}

export async function prepareStudy(dependencies = {}) {
  const paths = pathsFor(dependencies);
  const now = dependencies.now || Date.now;
  const { entries, config } = await readInputs(paths);
  const artifacts = expectedArtifacts(paths, entries);
  await mkdir(paths.frozenRoot, { recursive: true });
  for (const [role, , bytes] of entries) {
    await writeExclusiveOrVerify(path.join(paths.frozenRoot, FROZEN_NAMES[role]), bytes);
  }
  const registration = {
    frozenAt: iso(now),
    protocolSha256: artifacts.protocol.sha256,
    configSha256: artifacts.config.sha256,
    collectorSha256: artifacts.collector.sha256,
    wrapperSha256: artifacts.wrapper.sha256,
    comparisonEngineSha256: artifacts.comparisonEngine.sha256,
    summaryHelperSha256: artifacts.summaryHelper.sha256,
  };
  const manifestPath = path.join(paths.frozenRoot, "freeze-manifest.json");
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw new Error("Frozen manifest could not be read or parsed.");
    manifest = {
      schemaVersion: 1,
      studyId: config.studyId,
      frozenAt: registration.frozenAt,
      registration,
      preparedProtocolState: preparedProtocolState(config),
      artifacts,
    };
    await writeExclusiveOrVerify(manifestPath, Buffer.from(json(manifest)));
  }
  await verifyFrozen(dependencies);
  (dependencies.logger || console).log(`Verified immutable study inputs in ${relative(paths.root, paths.frozenRoot)}; no network request was made.`);
  return { frozenRoot: paths.frozenRoot, manifest };
}

export async function verifyFrozen(dependencies = {}) {
  const paths = pathsFor(dependencies);
  let manifest;
  try { manifest = JSON.parse(await readFile(path.join(paths.frozenRoot, "freeze-manifest.json"), "utf8")); }
  catch { throw new Error("Frozen study inputs are missing or the freeze manifest is invalid; run --prepare after final review."); }
  const { entries, config } = await readInputs(paths);
  const expected = expectedArtifacts(paths, entries);
  for (const [role, , currentBytes] of entries) {
    const recorded = manifest.artifacts?.[role];
    if (!recorded || JSON.stringify(recorded) !== JSON.stringify(expected[role]))
      throw new Error(`Current ${role} does not match its frozen registration.`);
    const frozenBytes = await readFile(path.join(paths.frozenRoot, FROZEN_NAMES[role]));
    if (sha256(frozenBytes) !== recorded.sha256 || !frozenBytes.equals(currentBytes))
      throw new Error(`Current ${role} hash differs from the frozen artifact; collection is blocked before provider access.`);
  }
  if (manifest.registration?.protocolSha256 !== expected.protocol.sha256 ||
      manifest.registration?.configSha256 !== expected.config.sha256 ||
      manifest.registration?.collectorSha256 !== expected.collector.sha256 ||
      manifest.registration?.wrapperSha256 !== expected.wrapper.sha256 ||
      manifest.registration?.comparisonEngineSha256 !== expected.comparisonEngine.sha256 ||
      manifest.registration?.summaryHelperSha256 !== expected.summaryHelper.sha256 ||
      manifest.frozenAt !== manifest.registration?.frozenAt)
    throw new Error("Frozen registration hashes are inconsistent.");
  if (JSON.stringify(manifest.preparedProtocolState) !== JSON.stringify(preparedProtocolState(config)))
    throw new Error("Frozen prepared protocol state differs from the current configuration.");
  return { paths, manifest, config };
}

async function readRegistry(verified) {
  try {
    const registry = JSON.parse(await readFile(verified.paths.registryPath, "utf8"));
    if (registry.studyId !== verified.config.studyId ||
        JSON.stringify(registry.registration) !== JSON.stringify(verified.manifest.registration))
      throw new Error("Execution registry does not match the frozen registration.");
    return registry;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return {
      schemaVersion: 1,
      studyId: verified.config.studyId,
      registration: verified.manifest.registration,
      reservedMaximumPerWaveUsd: PER_WAVE_RESERVE_USD,
      reservedMaximumStudyUsd: STUDY_RESERVE_USD,
      waves: {},
    };
  }
}

async function writeAtomic(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}-${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(temporary, json(value), { encoding: "utf8", flag: "wx" });
  await rename(temporary, file);
}

async function readJson(file) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch { return null; }
}

async function listWaveRuns(waveRoot) {
  let entries;
  try { entries = await readdir(waveRoot, { withFileTypes: true }); }
  catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  return entries.filter((entry) => entry.isDirectory()).map((entry) => ({
    runId: entry.name,
    runDir: path.join(waveRoot, entry.name),
  })).sort((a, b) => a.runId.localeCompare(b.runId));
}

async function ledgerEntries(runDir) {
  let text;
  try { text = await readFile(path.join(runDir, "cost-ledger.jsonl"), "utf8"); }
  catch (error) { return error.code === "ENOENT" ? [] : null; }
  try { return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
  catch { return null; }
}

async function inspectRun(runDir) {
  const manifest = await readJson(path.join(runDir, "run-manifest.json"));
  const ledger = await ledgerEntries(runDir);
  const submissionReceipt = await readJson(path.join(runDir, "task-post-submission.json"));
  const taskPostResponse = await readJson(path.join(runDir, "provider-responses/task-post.json"));
  return { runDir, runId: path.basename(runDir), manifest, ledger, submissionReceipt, taskPostResponse };
}

function safeInsufficientBalanceAttempt(run) {
  const manifest = run.manifest;
  const ledger = run.ledger;
  return Boolean(
    manifest && manifest.status === "blocked_balance_uncertain_or_insufficient" &&
    manifest.collectionPerformed === false && !Object.hasOwn(manifest, "taskPostState") &&
    !run.submissionReceipt && !run.taskPostResponse &&
    Array.isArray(manifest.captures) && manifest.captures.every((capture) => !capture.taskId) &&
    Array.isArray(ledger) && ledger.length > 0 &&
    ledger.every((entry) => entry?.method === "GET") &&
    ledger.some((entry) => entry?.endpoint === "appendix/user_data")
  );
}

function taskPostSubmittedAt(run, wave, registration, captureCount) {
  const receipt = run?.submissionReceipt;
  const receiptAt = receipt?.submittedAt;
  if (!receipt || receipt.recordedBeforeProviderRequest !== true || receipt.waveId !== wave || receipt.runId !== run.runId ||
      receipt.requestCount !== captureCount || JSON.stringify(receipt.registration) !== JSON.stringify(registration) ||
      typeof receipt.requestBodySha256 !== "string" || receipt.requestBodySha256 !== run.manifest?.selectedRequestSha256 ||
      typeof receiptAt !== "string" || !Number.isFinite(Date.parse(receiptAt))) return null;
  return new Date(receiptAt).toISOString();
}

function taskBatchIssues(envelope, expectedTags) {
  const issues = [];
  const tasks = envelope?.tasks;
  if (!Array.isArray(tasks) || tasks.length !== expectedTags.length)
    issues.push(`expected_${expectedTags.length}_tasks`);
  const ids = [];
  const tags = [];
  for (const task of Array.isArray(tasks) ? tasks : []) {
    if (typeof task?.id !== "string" || !task.id.trim()) issues.push("missing_task_id");
    else ids.push(task.id);
    if (typeof task?.data?.tag !== "string" || !task.data.tag) issues.push("missing_task_tag");
    else tags.push(task.data.tag);
    if (![20000, 20100].includes(task?.status_code)) issues.push("non_success_task_status");
  }
  if (new Set(ids).size !== ids.length) issues.push("duplicate_task_id");
  if (new Set(tags).size !== tags.length) issues.push("duplicate_task_tag");
  const expected = new Set(expectedTags);
  if (tags.length !== expected.size || tags.some((tag) => !expected.has(tag)) || expectedTags.some((tag) => !tags.includes(tag)))
    issues.push("task_tag_join_mismatch");
  return [...new Set(issues)];
}

function successfulBatch(run, captureCount, wave, registration) {
  const manifest = run.manifest;
  const captures = manifest?.captures;
  const expectedTags = manifest?.selectedCaptureIds;
  const returned = manifest?.receivedTaskIds;
  const returnedIds = Array.isArray(returned) ? returned.map((item) => item?.taskId) : [];
  const returnedTags = Array.isArray(returned) ? returned.map((item) => item?.tag) : [];
  const captureTags = Array.isArray(captures) ? captures.map((capture) => capture?.tag) : [];
  const captureIds = Array.isArray(captures) ? captures.map((capture) => capture?.taskId) : [];
  const requestBodySha256 = Array.isArray(captures) ? sha256(JSON.stringify(captures.map((capture) => capture?.request))) : null;
  const returnedByTag = new Map(Array.isArray(returned) ? returned.map((item) => [item?.tag, item?.taskId]) : []);
  const responseByTag = new Map(Array.isArray(run.taskPostResponse?.tasks)
    ? run.taskPostResponse.tasks.map((task) => [task?.data?.tag, task?.id]) : []);
  return Boolean(
    manifest?.collectionPerformed === true && manifest?.taskPostState === "returned_task_ids_saved" &&
    Array.isArray(expectedTags) && expectedTags.length === captureCount && new Set(expectedTags).size === captureCount &&
    Array.isArray(captures) && captures.length === captureCount &&
    captureTags.every((tag) => typeof tag === "string" && tag) && new Set(captureTags).size === captureCount &&
    captureTags.every((tag) => expectedTags.includes(tag)) &&
    captureIds.every((id) => typeof id === "string" && id) && new Set(captureIds).size === captureCount &&
    Array.isArray(returned) && returned.length === captureCount &&
    returnedIds.every((id) => typeof id === "string" && id) && new Set(returnedIds).size === captureCount &&
    returnedTags.every((tag) => typeof tag === "string" && tag) && new Set(returnedTags).size === captureCount &&
    returnedTags.every((tag) => expectedTags.includes(tag)) &&
    captures.every((capture) => returnedByTag.get(capture.tag) === capture.taskId && responseByTag.get(capture.tag) === capture.taskId) &&
    requestBodySha256 === manifest.selectedRequestSha256 && requestBodySha256 === run.submissionReceipt?.requestBodySha256 &&
    run.taskPostResponse?.status_code === 20000 && Number(run.taskPostResponse?.tasks_error || 0) === 0 &&
    taskBatchIssues(run.taskPostResponse, expectedTags).length === 0 &&
    taskPostSubmittedAt(run, wave, registration, captureCount)
  );
}

async function collectRunInspections(waveRoot) {
  const found = await listWaveRuns(waveRoot);
  return Promise.all(found.map((entry) => inspectRun(entry.runDir)));
}

async function createLock(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  let handle;
  const lockId = randomBytes(16).toString("hex");
  try {
    handle = await open(file, "wx");
    await handle.writeFile(json({ ...value, lockId }), "utf8");
  } catch (error) {
    if (error.code === "EEXIST") throw new Error(`Operation lock already exists: ${path.basename(file)}. Refusing a concurrent or duplicate operation.`);
    throw error;
  } finally { await handle?.close(); }
  return lockId;
}

async function removeOwnedLock(file, lockId) {
  const lock = await readJson(file);
  if (!lock || lock.lockId !== lockId) throw new Error(`Refusing to release a lock not owned by this operation: ${path.basename(file)}.`);
  await unlink(file);
}

function windowFor(wave, baselineSubmittedAt, config) {
  const index = WAVES.indexOf(wave);
  if (index === 0) return { targetSubmittedAt: null, windowOpensAt: null, windowClosesAt: null };
  const baseline = Date.parse(baselineSubmittedAt);
  if (!Number.isFinite(baseline)) throw new Error("W1 has no valid recorded task POST timestamp; later waves are blocked.");
  const target = baseline + config.repeatOffsetsDays[index] * DAY_MS;
  const tolerance = config.repeatStartToleranceMinutes * 60_000;
  return {
    targetSubmittedAt: new Date(target).toISOString(),
    windowOpensAt: new Date(target - tolerance).toISOString(),
    windowClosesAt: new Date(target + tolerance).toISOString(),
  };
}

function assertWithinWindow(window, at) {
  if (!window.targetSubmittedAt) return;
  const current = Date.parse(at);
  if (current < Date.parse(window.windowOpensAt))
    throw new Error(`Wave window has not opened; collection is blocked until ${window.windowOpensAt}.`);
  if (current > Date.parse(window.windowClosesAt))
    throw new Error(`Wave window was missed at ${window.windowClosesAt}; no automatic off-schedule collection is allowed.`);
}

async function resultWasReturned(runDir, capture) {
  const relativePath = capture?.files?.advancedEnvelope?.path;
  if (typeof relativePath !== "string") return false;
  const resolved = path.resolve(runDir, relativePath);
  if (resolved !== runDir && !resolved.startsWith(`${runDir}${path.sep}`)) return false;
  const envelope = await readJson(resolved);
  return Boolean(Array.isArray(envelope?.tasks?.[0]?.result) && envelope.tasks[0].result[0]);
}

async function annotateManifest(run, wave, registration, baselineSubmittedAt, window, captureCount, now, failure = null) {
  if (!run.manifest) return null;
  const manifest = run.manifest;
  const submittedAt = taskPostSubmittedAt(run, wave, registration, captureCount);
  const baseline = wave === "w1" ? submittedAt : baselineSubmittedAt;
  manifest.waveId = wave;
  manifest.submittedAt = submittedAt;
  manifest.baselineSubmittedAt = baseline || null;
  manifest.registration = registration;
  manifest.targetSubmittedAt = window.targetSubmittedAt;
  manifest.waveWindowOpensAt = window.windowOpensAt;
  manifest.waveWindowClosesAt = window.windowClosesAt;
  manifest.systemicMethodErrors = Array.isArray(manifest.systemicMethodErrors) ? manifest.systemicMethodErrors : [];
  if (run.submissionReceipt && !submittedAt && !manifest.systemicMethodErrors.includes("invalid_task_post_submission_receipt"))
    manifest.systemicMethodErrors.push("invalid_task_post_submission_receipt");
  if (Array.isArray(manifest.captures)) {
    for (const capture of manifest.captures) {
      capture.originalRequest ??= capture.request ? structuredClone(capture.request) : null;
      capture.providerResultReturned = await resultWasReturned(run.runDir, capture);
    }
  }
  manifest.studyWrapperUpdatedAt = iso(now);
  manifest.studyWrapperOutcome = failure ? "failed" : "returned";
  manifest.studyWrapperFailure = failure
    ? { name: failure.name || "Error", message: String(failure.message || "Unspecified failure").slice(0, 1000) }
    : null;
  await writeAtomic(path.join(run.runDir, "run-manifest.json"), manifest);
  run.manifest = manifest;
  return manifest;
}

function recordRegistryAttempt(registry, wave, run, outcome, window, baselineSubmittedAt, registration, at, error = null) {
  const waveRecord = registry.waves[wave] || { waveId: wave, attempts: [] };
  const existing = waveRecord.attempts.find((attempt) => attempt.runId === run?.runId);
  const attempt = {
    runId: run?.runId || null,
    recordedAt: at,
    outcome,
    status: run?.manifest?.status || "missing_manifest",
    collectionPerformed: run?.manifest?.collectionPerformed ?? null,
    taskPostState: run?.manifest?.taskPostState ?? null,
    submittedAt: run?.manifest?.submittedAt || null,
    retryAllowed: run ? safeInsufficientBalanceAttempt(run) : false,
    failure: error ? { name: error.name || "Error", message: error.message || "Unspecified failure" } : null,
  };
  if (existing) Object.assign(existing, attempt);
  else waveRecord.attempts.push(attempt);
  waveRecord.runId = run?.runId || waveRecord.runId || null;
  waveRecord.submittedAt = attempt.submittedAt || waveRecord.submittedAt || null;
  waveRecord.baselineSubmittedAt = wave === "w1" ? waveRecord.submittedAt : baselineSubmittedAt || null;
  waveRecord.registration = registration;
  waveRecord.systemicMethodErrors = run?.manifest?.systemicMethodErrors || [];
  Object.assign(waveRecord, window);
  waveRecord.latestStatus = attempt.status;
  waveRecord.latestOutcome = outcome;
  registry.waves[wave] = waveRecord;
}

async function priorSuccessfulRuns(verified, registry, wave) {
  const index = WAVES.indexOf(wave);
  const output = {};
  for (let priorIndex = 0; priorIndex < index; priorIndex++) {
    const prior = WAVES[priorIndex];
    const runs = await collectRunInspections(path.join(verified.paths.studyRoot, "runs", prior));
    const successes = runs.filter((run) => successfulBatch(
      run, verified.config.captureCount, prior, verified.manifest.registration,
    ));
    const registered = registry.waves?.[prior]?.attempts || [];
    const registeredNonRetryable = registered.filter((attempt) => !attempt.retryAllowed);
    if (successes.length !== 1 ||
        runs.some((run) => !safeInsufficientBalanceAttempt(run) && !successfulBatch(
          run, verified.config.captureCount, prior, verified.manifest.registration,
        )) ||
        registeredNonRetryable.length !== 1 || registeredNonRetryable[0].runId !== successes[0]?.runId ||
        registeredNonRetryable[0].taskPostState !== "returned_task_ids_saved")
      throw new Error(`Prior wave ${prior} lacks one certain 100-ID task POST or contains an uncertain/duplicate POST; ${wave} is blocked.`);
    output[prior] = successes[0];
  }
  return output;
}

async function findNewRun(waveRoot, before) {
  const after = await listWaveRuns(waveRoot);
  const created = after.filter((entry) => !before.has(entry.runId));
  if (created.length !== 1) return null;
  return inspectRun(created[0].runDir);
}

async function collectWave(wave, verified, dependencies) {
  const now = dependencies.now || Date.now;
  const logger = dependencies.logger || console;
  const waveRoot = path.join(verified.paths.studyRoot, "runs", wave);
  const registry = await readRegistry(verified);
  const prior = await priorSuccessfulRuns(verified, registry, wave);
  const baselineSubmittedAt = wave === "w1" ? null : taskPostSubmittedAt(
    prior.w1, "w1", verified.manifest.registration, verified.config.captureCount,
  );
  const window = windowFor(wave, baselineSubmittedAt, verified.config);
  const attemptStartedAt = iso(now);
  assertWithinWindow(window, attemptStartedAt);

  const existingRuns = await collectRunInspections(waveRoot);
  const registeredAttempts = registry.waves?.[wave]?.attempts || [];
  if (registeredAttempts.some((attempt) => !attempt.retryAllowed))
    throw new Error(`Wave ${wave} registry contains a non-retryable task attempt; duplicate task submission is blocked.`);
  if (registeredAttempts.length && (registeredAttempts.length !== existingRuns.length ||
      registeredAttempts.some((attempt) => !existingRuns.some((run) => run.runId === attempt.runId && safeInsufficientBalanceAttempt(run)))))
    throw new Error(`Wave ${wave} registry and balance-only run evidence differ; collection is held for manual audit.`);
  const unsafe = existingRuns.filter((run) => !safeInsufficientBalanceAttempt(run));
  if (unsafe.length) throw new Error(`Wave ${wave} already has a non-retryable or uncertain attempt; duplicate task submission is blocked.`);
  const lockPath = path.join(verified.paths.studyRoot, "locks", `${wave}.collect.lock`);
  const collectLockId = await createLock(lockPath, { waveId: wave, attemptStartedAt, registration: verified.manifest.registration });

  await mkdir(waveRoot, { recursive: true });
  const before = new Set((await listWaveRuns(waveRoot)).map((entry) => entry.runId));
  const runPilot = dependencies.runPilot || runPilotCli;
  const baseFetch = dependencies.fetchImpl || globalThis.fetch;
  let submittedAt = null;
  const recordingFetch = async (url, init = {}) => {
    const requestUrl = typeof url === "string" ? url : url?.url;
    if (init.method === "POST" && typeof requestUrl === "string" && requestUrl.endsWith("/v3/serp/google/organic/task_post")) {
      if (submittedAt) throw new Error("A second task POST was attempted inside one wave operation.");
      const candidates = (await listWaveRuns(waveRoot)).filter((entry) => !before.has(entry.runId));
      if (candidates.length !== 1) throw new Error("Cannot bind the task POST submission receipt to exactly one new run.");
      const latestFreeze = await verifyFrozen(dependencies);
      if (JSON.stringify(latestFreeze.manifest.registration) !== JSON.stringify(verified.manifest.registration))
        throw new Error("Frozen registration changed during the balance preflight; task POST is blocked.");
      submittedAt = iso(now);
      assertWithinWindow(window, submittedAt);
      if (typeof init.body !== "string") throw new Error("Task POST body is unavailable for the pre-request receipt.");
      let requests;
      try { requests = JSON.parse(init.body); }
      catch { throw new Error("Task POST body is not valid JSON for the pre-request receipt."); }
      const requestCount = Array.isArray(requests) ? requests.length : null;
      if (requestCount !== verified.config.captureCount) throw new Error("Task POST body does not contain the frozen capture count.");
      const expectedTags = requests.map((request) => request?.tag);
      if (expectedTags.some((tag) => typeof tag !== "string" || !tag) || new Set(expectedTags).size !== requestCount)
        throw new Error("Task POST body does not contain one unique tag per frozen capture.");
      await writeExclusiveOrVerify(path.join(candidates[0].runDir, "task-post-submission.json"), Buffer.from(json({
        schemaVersion: 1,
        recordedBeforeProviderRequest: true,
        waveId: wave,
        runId: candidates[0].runId,
        submittedAt,
        baselineSubmittedAt: wave === "w1" ? submittedAt : baselineSubmittedAt,
        registration: verified.manifest.registration,
        requestCount,
        requestBodySha256: sha256(init.body),
      })));
      return baseFetch(url, init);
    }
    return baseFetch(url, init);
  };
  const pilotDependencies = {
    runsRoot: waveRoot,
    env: dependencies.env || process.env,
    logger,
    now,
    fetchImpl: recordingFetch,
    ...(dependencies.sleep ? { sleep: dependencies.sleep } : {}),
  };
  let returned;
  let failure;
  try {
    returned = await runPilot(["--collect", "--input", path.join(verified.paths.frozenRoot, FROZEN_NAMES.panel), "--limit", "100", "--proof-reviewed"], pilotDependencies);
  } catch (error) { failure = error; }
  let run = returned?.runDir ? await inspectRun(returned.runDir) : await findNewRun(waveRoot, before);
  if (!run && returned?.manifest) run = { runDir: returned.runDir, runId: returned.manifest.runId, manifest: returned.manifest, ledger: [] };
  if (run) await annotateManifest(
    run, wave, verified.manifest.registration, baselineSubmittedAt, window, verified.config.captureCount, now, failure,
  );
  const outcome = failure ? "failed" : "returned";
  recordRegistryAttempt(registry, wave, run, outcome, window, baselineSubmittedAt, verified.manifest.registration, iso(now), failure);
  await writeAtomic(verified.paths.registryPath, registry);
  if (run && safeInsufficientBalanceAttempt(run)) await removeOwnedLock(lockPath, collectLockId);
  if (failure) {
    const error = new Error(`${failure.message} Wave ${wave} state was saved${run ? ` as run ${run.runId}` : " without a discoverable run ID"}.`);
    error.cause = failure;
    throw error;
  }
  if (!run) throw new Error(`Wave ${wave} returned without a discoverable run manifest; the durable lock remains and collection is held.`);
  logger.log(`Wave ${wave} state saved as run ${run.runId}; inspect it before any manual resume.`);
  return { runDir: run.runDir, manifest: run.manifest, registry };
}

async function resumeWave(wave, verified, dependencies) {
  const now = dependencies.now || Date.now;
  const logger = dependencies.logger || console;
  const waveRoot = path.join(verified.paths.studyRoot, "runs", wave);
  const runs = await collectRunInspections(waveRoot);
  const eligible = runs.filter((run) => successfulBatch(
    run, verified.config.captureCount, wave, verified.manifest.registration,
  ));
  if (eligible.length !== 1 || runs.some((run) => !safeInsufficientBalanceAttempt(run) && !successfulBatch(
    run, verified.config.captureCount, wave, verified.manifest.registration,
  ))) throw new Error(`Wave ${wave} does not have exactly one certain 100-ID run, or has an uncertain sibling; resume is blocked.`);
  const run = eligible[0];
  if (!run.manifest.captures?.some((capture) => capture.taskId)) throw new Error(`Wave ${wave} has no existing task IDs; resume is blocked.`);
  const registry = await readRegistry(verified);
  const registeredNonRetryable = (registry.waves?.[wave]?.attempts || []).filter((attempt) => !attempt.retryAllowed);
  if (registeredNonRetryable.some((attempt) => attempt.runId !== run.runId || attempt.taskPostState !== "returned_task_ids_saved"))
    throw new Error(`Wave ${wave} registry contains an uncertain sibling attempt; resume is blocked.`);
  const prior = await priorSuccessfulRuns(verified, registry, wave);
  const baselineSubmittedAt = wave === "w1"
    ? taskPostSubmittedAt(run, wave, verified.manifest.registration, verified.config.captureCount)
    : taskPostSubmittedAt(prior.w1, "w1", verified.manifest.registration, verified.config.captureCount);
  const window = windowFor(wave, baselineSubmittedAt, verified.config);
  const lockPath = path.join(verified.paths.studyRoot, "locks", `${wave}.resume.lock`);
  const resumeLockId = await createLock(lockPath, { waveId: wave, resumeStartedAt: iso(now), runId: run.runId, existingTaskIdsOnly: true });
  const runPilot = dependencies.runPilot || runPilotCli;
  const baseFetch = dependencies.fetchImpl || globalThis.fetch;
  const existingIdsOnlyFetch = async (url, init = {}) => {
    const requestUrl = typeof url === "string" ? url : url?.url;
    if (init.method === "POST" && typeof requestUrl === "string" && requestUrl.endsWith("/v3/serp/google/organic/task_post"))
      throw new Error("Resume attempted a new task POST; existing task IDs are required.");
    return baseFetch(url, init);
  };
  let failure;
  try {
    await runPilot(["--collect", "--resume", run.runId, "--complete-evidence"], {
      runsRoot: waveRoot,
      env: dependencies.env || process.env,
      logger,
      now,
      fetchImpl: existingIdsOnlyFetch,
      ...(dependencies.sleep ? { sleep: dependencies.sleep } : {}),
    });
  } catch (error) { failure = error; }
  try {
    const refreshed = await inspectRun(run.runDir);
    await annotateManifest(
      refreshed, wave, verified.manifest.registration, baselineSubmittedAt, window, verified.config.captureCount, now, failure,
    );
    recordRegistryAttempt(registry, wave, refreshed, failure ? "resume_failed" : "resumed", window,
      baselineSubmittedAt, verified.manifest.registration, iso(now), failure);
    await writeAtomic(verified.paths.registryPath, registry);
    if (failure) throw failure;
    return { runDir: refreshed.runDir, manifest: refreshed.manifest, registry };
  } finally { await removeOwnedLock(lockPath, resumeLockId); }
}

export async function runCitationStudyCli(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv);
  if (args.command === "prepare") return prepareStudy(dependencies);
  const verified = await verifyFrozen(dependencies);
  const operationLockPath = path.join(verified.paths.studyRoot, "locks", "study-operation.lock");
  const operationLockId = await createLock(operationLockPath, {
    operation: args.command,
    waveId: args.wave,
    startedAt: iso(dependencies.now || Date.now),
    registration: verified.manifest.registration,
  });
  try {
    return args.command === "collect"
      ? await collectWave(args.wave, verified, dependencies)
      : await resumeWave(args.wave, verified, dependencies);
  } finally {
    await removeOwnedLock(operationLockPath, operationLockId);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCitationStudyCli().catch((error) => {
    console.error(`aio-citation-study: ${error.message}`);
    process.exitCode = 1;
  });
}
