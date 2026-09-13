#!/usr/bin/env node

import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { mkdir, open, readFile, stat, statfs, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { verifyFrozen as verifyActiveFrozen } from "./aio-citation-study.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const WAVES = new Map([["w2", 7], ["w3", 14], ["w4", 21]]);
const READY_STATES = new Set(["absent_returned_serp", "present_content_returned", "detected_partial", "provider_partial"]);
const SAFE_SCREENSHOT_STATES = new Set(["not_requested", "not_requested_on_resume", "downloaded_unreviewed"]);
const MINIMUM_FREE_BYTES = 1024 ** 3;
const OFFSET_TIMESTAMP = /(?:Z|[+-]\d{2}:\d{2})$/;

function fail(message, exitCode = 1) {
  const error = new Error(message);
  error.exitCode = exitCode;
  throw error;
}

function parseArgs(argv) {
  let mode = null;
  let wave = null;
  let help = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (["--inspect", "--collect", "--resume"].includes(arg)) {
      if (mode) fail("Choose exactly one of --inspect, --collect, or --resume.", 2);
      mode = arg.slice(2);
    } else if (arg === "--wave") {
      wave = argv[++i];
    } else if (["--help", "-h"].includes(arg)) help = true;
    else fail(`Unknown argument: ${arg}`, 2);
  }
  if (help) return { help: true };
  if (!mode || !WAVES.has(wave)) fail("A mode and --wave w2, w3, or w4 are required.", 2);
  return { mode, wave, help: false };
}

async function readJson(file, label, missingAllowed = false) {
  let bytes;
  try { bytes = await readFile(file); }
  catch (error) {
    if (missingAllowed && error.code === "ENOENT") return null;
    fail(`${label} could not be read.`);
  }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { fail(`${label} is not valid UTF-8 JSON.`); }
}

const uniqueNonempty = (values, count) => Array.isArray(values) && values.length === count
  && values.every(value => typeof value === "string" && value.trim()) && new Set(values).size === count;

export async function inspectWave(wave, options = {}) {
  const studyRoot = path.resolve(options.studyRoot || path.join(ROOT, "tmp/ctr-aio/citation-study"));
  const registry = await readJson(path.join(studyRoot, "execution-registry.json"), "execution registry", true);
  const waveRecord = registry?.waves?.[wave];
  if (!waveRecord) return { state: "absent", wave, runId: null, reasons: ["wave_not_registered"] };
  const runId = waveRecord.runId;
  if (typeof runId !== "string" || !/^[A-Za-z0-9_-]+$/.test(runId)) {
    return { state: "manual_hold", wave, runId: runId ?? null, reasons: ["invalid_registered_run_id"] };
  }
  const manifest = await readJson(path.join(studyRoot, "runs", wave, runId, "run-manifest.json"), "registered run manifest", true);
  if (!manifest) return { state: "manual_hold", wave, runId, reasons: ["registered_manifest_missing"] };
  const issues = [];
  if (manifest.runId !== runId) issues.push("manifest_run_id_mismatch");
  if (manifest.waveId !== wave) issues.push("manifest_wave_mismatch");
  if (manifest.collectionPerformed !== true) issues.push("collection_not_recorded");
  if (manifest.taskPostState !== "returned_task_ids_saved") issues.push("task_post_not_certain");
  if (manifest.actualCostKnown !== true) issues.push("cost_uncertain");
  if (typeof manifest.status !== "string" || /^(blocked_|stopped_)/.test(manifest.status)) issues.push("blocked_or_stopped_manifest");

  const captures = Array.isArray(manifest.captures) ? manifest.captures : [];
  const received = Array.isArray(manifest.receivedTaskIds) ? manifest.receivedTaskIds : [];
  const selectedTags = manifest.selectedCaptureIds;
  if (captures.length !== 100) issues.push("capture_count_not_100");
  if (!uniqueNonempty(captures.map(capture => capture?.taskId), 100)) issues.push("capture_task_ids_not_exact_unique_100");
  if (!uniqueNonempty(captures.map(capture => capture?.tag), 100)) issues.push("capture_tags_not_exact_unique_100");
  if (!uniqueNonempty(received.map(item => item?.taskId), 100)) issues.push("received_task_ids_not_exact_unique_100");
  if (!uniqueNonempty(received.map(item => item?.tag), 100)) issues.push("received_tags_not_exact_unique_100");
  if (!uniqueNonempty(selectedTags, 100)) issues.push("selected_tags_not_exact_unique_100");
  const receivedByTag = new Map(received.map(item => [item?.tag, item?.taskId]));
  if (captures.some(capture => receivedByTag.get(capture?.tag) !== capture?.taskId)) issues.push("capture_received_tag_id_join_mismatch");
  const certain = (Array.isArray(waveRecord.attempts) ? waveRecord.attempts : []).filter(attempt => attempt?.retryAllowed === false);
  if (certain.length !== 1 || certain[0]?.runId !== runId || certain[0]?.taskPostState !== "returned_task_ids_saved") {
    issues.push("registry_attempt_not_one_certain_batch");
  }

  let pendingCaptures = 0;
  let incompleteEvidence = 0;
  for (const capture of captures) {
    if (capture.state === "pending") {
      pendingCaptures++;
      incompleteEvidence++;
    } else if (!READY_STATES.has(capture.state)) issues.push("capture_state_requires_manual_review");
    else if (!capture.files?.htmlEnvelope) incompleteEvidence++;
    else if (capture.htmlProviderState !== "content_returned") issues.push("html_result_requires_manual_review");
    if (!SAFE_SCREENSHOT_STATES.has(capture.screenshotState)) issues.push("screenshot_state_requires_manual_review");
    else if (capture.screenshotState !== "downloaded_unreviewed") incompleteEvidence++;
    else if (!capture.files?.screenshot) issues.push("downloaded_screenshot_manifest_entry_missing");
  }
  const base = { wave, runId, status: manifest.status ?? null, pendingCaptures, incompleteEvidence };
  if (issues.length) return { state: "manual_hold", ...base, reasons: [...new Set(issues)] };
  if (incompleteEvidence === 0) return manifest.status === "collection_pass_finished_unreviewed"
    ? { state: "complete", ...base, reasons: [] }
    : { state: "manual_hold", ...base, reasons: ["complete_evidence_status_mismatch"] };
  return manifest.status === "pending"
    ? { state: "resumable", ...base, reasons: [] }
    : { state: "manual_hold", ...base, reasons: ["incomplete_evidence_status_mismatch"] };
}

function parseTimestamp(value, label) {
  if (typeof value !== "string" || !OFFSET_TIMESTAMP.test(value) || !Number.isFinite(Date.parse(value))) fail(`${label} is missing or invalid.`);
  return Date.parse(value);
}

async function schedule(wave, studyRoot) {
  const registry = await readJson(path.join(studyRoot, "execution-registry.json"), "execution registry");
  const anchorText = registry?.waves?.w1?.baselineSubmittedAt ?? registry?.waves?.w1?.submittedAt;
  const anchor = parseTimestamp(anchorText, "W1 UTC submission anchor");
  const target = anchor + WAVES.get(wave) * 86_400_000;
  return {
    target,
    targetSubmittedAt: new Date(target).toISOString(),
    collectOpensAt: new Date(target - 60 * 60_000).toISOString(),
    collectClosesAt: new Date(target + 60 * 60_000).toISOString(),
    resumeOpensAt: new Date(target + 10 * 60_000).toISOString(),
    resumeClosesAt: new Date(target + 370 * 60_000).toISOString(),
  };
}

async function assertCredentialFile(env, root, dependencies) {
  const file = env.DATAFORSEO_CREDENTIALS_PATH;
  if (typeof file !== "string" || !path.isAbsolute(file)) fail("DATAFORSEO_CREDENTIALS_PATH must be an absolute external credential-file path.");
  const relative = path.relative(root, file);
  const outsideRoot = relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
  if (!outsideRoot) fail("Credential file must be outside the research bundle.");
  let info;
  try { info = await (dependencies.stat || stat)(file); } catch { fail("Credential file is unavailable."); }
  if (!info.isFile()) fail("Credential path is not a regular file.");
  if ((dependencies.platform || process.platform) !== "win32" && (info.mode & 0o077) !== 0) fail("Credential file permissions must be 0600 or stricter.");
  if ((dependencies.platform || process.platform) !== "win32" && typeof process.getuid === "function" && info.uid !== process.getuid()) {
    fail("Credential file must be owned by the service user.");
  }
  return file;
}

async function assertDisk(studyRoot, dependencies) {
  const available = dependencies.freeBytes ?? await (async () => {
    const info = await (dependencies.statfs || statfs)(studyRoot);
    return Number(info.bavail) * Number(info.bsize);
  })();
  if (!Number.isFinite(available) || available < MINIMUM_FREE_BYTES) fail("Less than 1 GiB is free; paid collection/evidence completion is blocked.");
  return available;
}

async function createOperationLock(studyRoot, mode, wave) {
  const file = path.join(studyRoot, "locks", "hermes-study-operation.lock");
  const lockId = randomBytes(16).toString("hex");
  await mkdir(path.dirname(file), { recursive: true });
  let handle;
  try {
    handle = await open(file, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify({ lockId, mode, wave, pid: process.pid, startedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
  } catch (error) {
    if (error.code === "EEXIST") fail("Hermes operation lock exists; concurrent execution or a prior crash requires manual audit.", 25);
    throw error;
  } finally { await handle?.close(); }
  return { file, lockId };
}

async function releaseOperationLock(lock) {
  const current = await readJson(lock.file, "Hermes operation lock");
  if (current?.lockId !== lock.lockId) fail("Refusing to release a Hermes operation lock owned by another process.", 25);
  await unlink(lock.file);
}

async function invokeWrapper(mode, wave, paths, credentialsPath, dependencies) {
  if (dependencies.runWrapper) return dependencies.runWrapper({ mode, wave, ...paths, credentialsPath });
  await mkdir(path.join(paths.studyRoot, "scheduler-logs"), { recursive: true });
  const logFile = path.join(paths.studyRoot, "scheduler-logs", `${wave}-${mode}.log`);
  const log = await open(logFile, constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY, 0o600);
  const childEnv = { ...process.env, DATAFORSEO_CREDENTIALS_PATH: credentialsPath };
  delete childEnv.DATAFORSEO_LOGIN;
  delete childEnv.DATAFORSEO_PASSWORD;
  await log.appendFile(`[${new Date().toISOString()}] ${mode} ${wave} started\n`);
  try {
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [paths.wrapperPath, `--${mode}`, "--wave", wave], {
        cwd: paths.root, env: childEnv, stdio: ["ignore", log.fd, log.fd], windowsHide: true,
      });
      child.once("error", reject);
      child.once("exit", value => resolve(value ?? 1));
    });
    await log.appendFile(`[${new Date().toISOString()}] ${mode} ${wave} wrapper exit ${code}\n`);
    return code;
  } finally { await log.close(); }
}

export async function runHermesCli(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv);
  if (args.help) return { help: true };
  const root = path.resolve(dependencies.root || ROOT);
  const studyRoot = path.resolve(dependencies.studyRoot || path.join(root, "tmp/ctr-aio/citation-study"));
  const wrapperPath = path.join(root, "scripts/research/aio-citation-study.mjs");
  await (dependencies.verifyFrozen || verifyActiveFrozen)({ root, studyRoot });
  const initial = await inspectWave(args.wave, { studyRoot });
  if (args.mode === "inspect") return initial;
  const timing = await schedule(args.wave, studyRoot);
  const current = Number(dependencies.now ? dependencies.now() : Date.now());
  if (args.mode === "collect") {
    if (initial.state !== "absent") fail("Collection requires an unregistered wave; duplicate or replacement collection is refused.", 21);
    if (current < Date.parse(timing.collectOpensAt) || current > Date.parse(timing.collectClosesAt)) {
      fail("Collection is outside the frozen UTC +/-60 minute submission window.", 24);
    }
  } else {
    if (initial.state === "complete") return initial;
    if (initial.state !== "resumable") fail("Resume requires one exact, certain, resumable 100-ID run.", 22);
    if (current < Date.parse(timing.resumeOpensAt) || current > Date.parse(timing.resumeClosesAt)) {
      fail("Resume is outside its bounded six-hour UTC evidence window.", 24);
    }
  }
  const operationLock = await createOperationLock(studyRoot, args.mode, args.wave);
  try {
    const lockedState = await inspectWave(args.wave, { studyRoot });
    if (args.mode === "collect" && lockedState.state !== "absent") {
      fail("Collection state changed before execution; duplicate or replacement collection is refused.", 21);
    }
    if (args.mode === "resume") {
      if (lockedState.state === "complete") return lockedState;
      if (lockedState.state !== "resumable") fail("Resume state changed before execution and is no longer safe.", 22);
    }
    const env = dependencies.env || process.env;
    const credentialsPath = await assertCredentialFile(env, root, dependencies);
    await assertDisk(studyRoot, dependencies);
    const code = await invokeWrapper(args.mode, args.wave, { root, studyRoot, wrapperPath }, credentialsPath, dependencies);
    if (code !== 0) fail(`Study wrapper returned ${code}; automatic retry is refused.`, code);
    const final = await inspectWave(args.wave, { studyRoot });
    if (!["complete", "resumable"].includes(final.state)) fail("Post-operation state is unsafe for unattended continuation.", 23);
    return final;
  } finally { await releaseOperationLock(operationLock); }
}

async function main() {
  const result = await runHermesCli();
  if (result.help) {
    console.log("Usage: node scripts/research/aio-citation-hermes-runner.mjs (--inspect|--collect|--resume) --wave (w2|w3|w4)");
    return;
  }
  console.log(JSON.stringify(result));
  if (result.state === "manual_hold") process.exitCode = 20;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(`aio-citation-hermes-runner: ${error.message}`);
    process.exitCode = Number.isInteger(error.exitCode) ? error.exitCode : 1;
  });
}
