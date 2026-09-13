#!/usr/bin/env node

import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, readFile, realpath, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { inspectWave as inspectActiveWave } from "./aio-citation-hermes-runner.mjs";
import { verifyFrozen as verifyActiveFrozen } from "./aio-citation-study.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const DEFAULT_STUDY_ROOT = path.join(ROOT, "tmp/ctr-aio/citation-study");
const DEFAULT_NOTIFICATION_ROOT = path.join(DEFAULT_STUDY_ROOT, "notifications");
const DEFAULT_CREDENTIAL_PATH = "/root/.hermes/cron-env";
const WAVES = ["w2", "w3", "w4"];
const FILE_ROLES = ["advancedEnvelope", "normalized", "htmlEnvelope", "html", "screenshotEnvelope", "screenshot"];
const TOKEN_PATTERN = /^[1-9]\d{4,15}:[A-Za-z0-9_-]{30,}$/;
const CHAT_PATTERN = /^[1-9]\d*$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const SETUP_MESSAGE = "Hermes research notification test: Telegram alerts are connected. I will notify you after each AI Overview study wave has collected 100 captures and its saved files pass verification. Citation review and analysis follow separately. Next scheduled collection: 20 September 2026 at 12:02 BST.";

const sha256 = value => createHash("sha256").update(value).digest("hex");
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const nowIso = now => new Date(now()).toISOString();
const inside = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
};

function parseArgs(argv) {
  if (argv.length === 0 || (argv.length === 1 && argv[0] === "--check")) return { mode: "check" };
  if (argv.length === 1 && argv[0] === "--test-connection") return { mode: "test" };
  if (argv.length === 1 && ["--help", "-h"].includes(argv[0])) return { mode: "help" };
  throw new Error("Use --check, --test-connection, or --help.");
}

function literalValue(raw) {
  const value = raw.trim();
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    const quote = value[0];
    const inner = value.slice(1, -1);
    if (!inner || inner.includes(quote) || inner.includes("\\")) return null;
    return inner;
  }
  return /^[A-Za-z0-9_:-]+$/.test(value) ? value : null;
}

export function parseTelegramCredentials(text) {
  const selected = new Map();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?(TELEGRAM_BOT_TOKEN|TELEGRAM_HOME_CHANNEL)\s*=\s*(.*?)\s*$/);
    if (!match) {
      if (/^(?:export\s+)?(?:TELEGRAM_BOT_TOKEN|TELEGRAM_HOME_CHANNEL)\b/.test(line)) {
        throw new Error("Telegram credential assignments are malformed.");
      }
      continue;
    }
    if (selected.has(match[1])) throw new Error("Telegram credential assignments are duplicated.");
    const value = literalValue(match[2]);
    if (value === null) throw new Error("Telegram credential assignments must contain literal values.");
    selected.set(match[1], value);
  }
  const token = selected.get("TELEGRAM_BOT_TOKEN");
  const chatText = selected.get("TELEGRAM_HOME_CHANNEL");
  if (!TOKEN_PATTERN.test(token || "") || !CHAT_PATTERN.test(chatText || "")) {
    throw new Error("Telegram credentials are missing or invalid.");
  }
  const chatId = Number(chatText);
  if (!Number.isSafeInteger(chatId) || chatId <= 0) throw new Error("Telegram credentials are missing or invalid.");
  return { token, chatId, destinationFingerprint: sha256(`telegram-private-chat:${chatText}`) };
}

async function loadTelegramCredentials(dependencies) {
  const root = path.resolve(dependencies.root || ROOT);
  const credentialPath = path.resolve(dependencies.credentialPath || DEFAULT_CREDENTIAL_PATH);
  if (inside(root, credentialPath)) throw new Error("Telegram credential file must be external to the research bundle.");
  let info;
  try { info = await (dependencies.stat || stat)(credentialPath); }
  catch { throw new Error("Telegram credential file is unavailable."); }
  if (!info.isFile()) throw new Error("Telegram credential path is not a regular file.");
  if ((dependencies.platform || process.platform) !== "win32") {
    if ((info.mode & 0o777) !== 0o600 || info.uid !== 0) {
      throw new Error("Telegram credential file must be root-owned with permissions 0600.");
    }
  }
  let text;
  try { text = await (dependencies.readFile || readFile)(credentialPath, "utf8"); }
  catch { throw new Error("Telegram credential file is unavailable."); }
  return parseTelegramCredentials(text);
}

function stateFilename(kind, wave) {
  if (kind === "setup") return "telegram-setup-test.json";
  return `telegram-${wave}.json`;
}

async function syncDirectory(directory) {
  let handle;
  try {
    handle = await open(directory, constants.O_RDONLY);
    await handle.sync();
  } catch (error) {
    if (!(["EINVAL", "ENOTSUP", "EPERM", "EISDIR"].includes(error.code))) throw error;
  } finally { await handle?.close(); }
}

async function reserveState(file, value) {
  let handle;
  try {
    handle = await open(file, "wx", 0o600);
    await handle.writeFile(json(value), "utf8");
    await handle.sync();
  } catch (error) {
    if (error.code === "EEXIST") return false;
    throw error;
  } finally { await handle?.close(); }
  await syncDirectory(path.dirname(file));
  return true;
}

async function replaceState(file, value) {
  const temporary = `${file}.${process.pid}.${sha256(`${Date.now()}-${Math.random()}`).slice(0, 12)}.tmp`;
  let handle;
  try {
    handle = await open(temporary, "wx", 0o600);
    await handle.writeFile(json(value), "utf8");
    await handle.sync();
  } finally { await handle?.close(); }
  await rename(temporary, file);
  await syncDirectory(path.dirname(file));
}

async function readState(file) {
  let text;
  try { text = await readFile(file, "utf8"); }
  catch (error) { return error.code === "ENOENT" ? null : { invalid: true }; }
  try { return JSON.parse(text); }
  catch { return { invalid: true }; }
}

function expectedStateMatches(state, kind, wave, runId) {
  if (!state || state.invalid || state.schemaVersion !== 1 || state.kind !== kind) return false;
  return kind === "setup" ? true : state.wave === wave && state.runId === runId;
}

async function sendTelegram(text, credentials, dependencies) {
  const fetchImpl = dependencies.fetchImpl || globalThis.fetch;
  let response;
  try {
    response = await fetchImpl(`https://api.telegram.org/bot${credentials.token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: credentials.chatId, text }),
      redirect: "error",
      signal: (dependencies.timeoutSignal || AbortSignal.timeout)(15_000),
    });
  } catch {
    throw new Error("Telegram delivery outcome is uncertain.");
  }
  let acknowledgement;
  try { acknowledgement = await response.json(); }
  catch { throw new Error("Telegram delivery outcome is uncertain."); }
  const result = acknowledgement?.result;
  if (!response.ok || acknowledgement?.ok !== true || !Number.isInteger(result?.message_id) || result.message_id <= 0 ||
      !Number.isSafeInteger(result?.chat?.id) || result.chat.id !== credentials.chatId || result.chat.type !== "private" ||
      result.text !== text) {
    throw new Error("Telegram delivery outcome is uncertain.");
  }
  return { telegramMessageId: result.message_id };
}

async function notifyOnce({ kind, wave = null, runId = null, text, dependencies }) {
  const notificationRoot = path.resolve(dependencies.notificationRoot || DEFAULT_NOTIFICATION_ROOT);
  await mkdir(notificationRoot, { recursive: true, mode: 0o700 });
  const file = path.join(notificationRoot, stateFilename(kind, wave));
  const existing = await readState(file);
  if (existing) {
    if (!expectedStateMatches(existing, kind, wave, runId)) return { state: "held" };
    if (existing.state === "sent") return { state: "already_sent" };
    return { state: "held" };
  }

  const credentials = await loadTelegramCredentials(dependencies);
  if (kind === "wave") {
    const setup = await readState(path.join(notificationRoot, stateFilename("setup")));
    if (!expectedStateMatches(setup, "setup") || setup.state !== "sent" ||
        setup.destinationFingerprint !== credentials.destinationFingerprint) return { state: "setup_required" };
  }
  const base = {
    schemaVersion: 1, kind, ...(kind === "wave" ? { wave, runId } : {}),
    state: "sending", reservedAt: nowIso(dependencies.now || Date.now), textSha256: sha256(text),
  };
  if (!await reserveState(file, base)) return { state: "held" };
  try {
    const receipt = await sendTelegram(text, credentials, dependencies);
    base.telegramMessageId = receipt.telegramMessageId;
  } catch {
    try {
      await replaceState(file, { ...base, state: "uncertain", uncertainAt: nowIso(dependencies.now || Date.now) });
    } catch { /* The durable sending marker still prevents a blind retransmit. */ }
    return { state: "uncertain" };
  }
  const sent = {
    ...base, state: "sent", acknowledgedAt: nowIso(dependencies.now || Date.now),
    ...(kind === "setup" ? { destinationFingerprint: credentials.destinationFingerprint } : {}),
  };
  try { await replaceState(file, sent); }
  catch { return { state: "held" }; }
  return { state: "sent" };
}

async function hashOpenFile(file) {
  const noFollow = constants.O_NOFOLLOW || 0;
  const handle = await open(file, constants.O_RDONLY | noFollow);
  try {
    const before = await handle.stat();
    if (!before.isFile()) throw new Error("Evidence entry is not a regular file.");
    const hash = createHash("sha256");
    const buffer = Buffer.allocUnsafe(1024 * 1024);
    let bytes = 0;
    for (;;) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      hash.update(buffer.subarray(0, bytesRead));
      bytes += bytesRead;
    }
    const after = await handle.stat();
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeMs !== after.mtimeMs) {
      throw new Error("Evidence changed while it was read.");
    }
    return { bytes, sha256: hash.digest("hex") };
  } finally { await handle.close(); }
}

export async function verifyWaveEvidence({ studyRoot, wave, runId, expectedCaptureCount = 100 }) {
  if (!WAVES.includes(wave) || typeof runId !== "string" || !/^[A-Za-z0-9_-]+$/.test(runId)) {
    throw new Error("Wave evidence identity is invalid.");
  }
  const resolvedStudy = path.resolve(studyRoot);
  const runDir = path.join(resolvedStudy, "runs", wave, runId);
  const registryFile = path.join(resolvedStudy, "execution-registry.json");
  const manifestFile = path.join(runDir, "run-manifest.json");
  const [registryBefore, manifestBefore] = await Promise.all([readFile(registryFile), readFile(manifestFile)]);
  let registry;
  let manifest;
  try {
    registry = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(registryBefore));
    manifest = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(manifestBefore));
  } catch { throw new Error("Evidence metadata is invalid."); }
  if (registry?.waves?.[wave]?.runId !== runId || manifest?.waveId !== wave || manifest?.runId !== runId) {
    throw new Error("Evidence metadata identity does not match the inspected wave.");
  }
  const captures = manifest.captures;
  if (!Array.isArray(captures) || captures.length !== expectedCaptureCount) throw new Error("Evidence capture count is invalid.");

  const runInfo = await lstat(runDir);
  if (!runInfo.isDirectory() || runInfo.isSymbolicLink()) throw new Error("Expected run is not a direct directory.");
  const [realStudy, realRun] = await Promise.all([realpath(resolvedStudy), realpath(runDir)]);
  if (!inside(realStudy, realRun)) throw new Error("Expected run resolves outside the study directory.");
  const seenLexical = new Set();
  const seenReal = new Set();
  let verifiedFiles = 0;
  for (const capture of captures) {
    const files = capture?.files;
    if (!files || typeof files !== "object" || Array.isArray(files) ||
        Object.keys(files).length !== FILE_ROLES.length || FILE_ROLES.some(role => !Object.hasOwn(files, role))) {
      throw new Error("A capture does not contain exactly six evidence entries.");
    }
    for (const role of FILE_ROLES) {
      const entry = files[role];
      if (!entry || typeof entry.path !== "string" || !entry.path || path.isAbsolute(entry.path) ||
          !HASH_PATTERN.test(entry.sha256 || "") || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0) {
        throw new Error("An evidence descriptor is invalid.");
      }
      const resolved = path.resolve(runDir, entry.path);
      if (!inside(runDir, resolved) || seenLexical.has(resolved)) throw new Error("Evidence paths are duplicated or escape the expected run.");
      seenLexical.add(resolved);
      const info = await lstat(resolved);
      if (!info.isFile() || info.isSymbolicLink()) throw new Error("Evidence entry is not a direct regular file.");
      const canonical = await realpath(resolved);
      if (!inside(realRun, canonical) || seenReal.has(canonical)) throw new Error("Evidence real paths are duplicated or escape the expected run.");
      seenReal.add(canonical);
      const actual = await hashOpenFile(resolved);
      if (actual.bytes !== entry.bytes || actual.sha256 !== entry.sha256) throw new Error("Evidence bytes or SHA-256 do not match the manifest.");
      verifiedFiles++;
    }
  }
  const [registryAfter, manifestAfter] = await Promise.all([readFile(registryFile), readFile(manifestFile)]);
  if (!registryBefore.equals(registryAfter) || !manifestBefore.equals(manifestAfter)) {
    throw new Error("Evidence metadata changed during verification.");
  }
  if (verifiedFiles !== expectedCaptureCount * FILE_ROLES.length) throw new Error("Evidence file count is invalid.");
  return { captures: expectedCaptureCount, files: verifiedFiles };
}

async function verifyFrozenSnapshot(dependencies, studyRoot) {
  const frozenManifest = path.join(studyRoot, "frozen-v1", "freeze-manifest.json");
  const before = await readFile(frozenManifest);
  await (dependencies.verifyFrozen || verifyActiveFrozen)({
    root: dependencies.root || ROOT,
    studyRoot,
    ...(dependencies.sourcePaths ? { sourcePaths: dependencies.sourcePaths } : {}),
  });
  const after = await readFile(frozenManifest);
  if (!before.equals(after)) throw new Error("Frozen manifest changed during verification.");
}

function completionMessage(wave) {
  return `Hermes research notification: ${wave.toUpperCase()} completed 100/100 captures with 600 files verified and saved on Hermes. Manual citation review and analysis are still pending.`;
}

export async function runCheck(dependencies = {}) {
  const logger = dependencies.logger || console;
  const studyRoot = path.resolve(dependencies.studyRoot || DEFAULT_STUDY_ROOT);
  try { await verifyFrozenSnapshot(dependencies, studyRoot); }
  catch {
    const statuses = WAVES.map(wave => ({ wave, state: "verification_failed" }));
    for (const item of statuses) logger.log(`${item.wave}: ${item.state}`);
    return statuses;
  }
  const statuses = [];
  for (const wave of WAVES) {
    let inspection;
    try { inspection = await (dependencies.inspectWave || inspectActiveWave)(wave, { studyRoot }); }
    catch {
      const item = { wave, state: "verification_failed" };
      statuses.push(item); logger.log(`${wave}: ${item.state}`); continue;
    }
    if (inspection?.state !== "complete") {
      const state = inspection?.state === "resumable" ? "pending" : ["absent", "manual_hold"].includes(inspection?.state) ? inspection.state : "verification_failed";
      const item = { wave, state };
      statuses.push(item); logger.log(`${wave}: ${state}`); continue;
    }
    if (inspection.wave !== wave || typeof inspection.runId !== "string" || !/^[A-Za-z0-9_-]+$/.test(inspection.runId) ||
        inspection.pendingCaptures !== 0 || inspection.incompleteEvidence !== 0 || !Array.isArray(inspection.reasons) || inspection.reasons.length !== 0) {
      const item = { wave, state: "manual_hold" };
      statuses.push(item); logger.log(`${wave}: ${item.state}`); continue;
    }
    const notificationRoot = path.resolve(dependencies.notificationRoot || DEFAULT_NOTIFICATION_ROOT);
    const existing = await readState(path.join(notificationRoot, stateFilename("wave", wave)));
    if (existing) {
      const state = expectedStateMatches(existing, "wave", wave, inspection.runId) && existing.state === "sent"
        ? "already_sent" : "held";
      const item = { wave, state };
      statuses.push(item); logger.log(`${wave}: ${state}`); continue;
    }
    try {
      const verified = await (dependencies.verifyWaveEvidence || verifyWaveEvidence)({ studyRoot, wave, runId: inspection.runId });
      if (verified.captures !== 100 || verified.files !== 600) throw new Error("Evidence totals are invalid.");
    } catch {
      const item = { wave, state: "verification_failed" };
      statuses.push(item); logger.log(`${wave}: ${item.state}`); continue;
    }
    let finalInspection;
    try { finalInspection = await (dependencies.inspectWave || inspectActiveWave)(wave, { studyRoot }); }
    catch { finalInspection = null; }
    if (finalInspection?.state !== "complete" || finalInspection.wave !== wave || finalInspection.runId !== inspection.runId ||
        finalInspection.status !== inspection.status || finalInspection.pendingCaptures !== 0 || finalInspection.incompleteEvidence !== 0 ||
        !Array.isArray(finalInspection.reasons) || finalInspection.reasons.length !== 0) {
      const item = { wave, state: "manual_hold" };
      statuses.push(item); logger.log(`${wave}: ${item.state}`); continue;
    }
    let notification;
    try {
      notification = await notifyOnce({ kind: "wave", wave, runId: inspection.runId, text: completionMessage(wave), dependencies });
    } catch { notification = { state: "held" }; }
    const item = { wave, state: notification.state };
    statuses.push(item); logger.log(`${wave}: ${item.state}`);
  }
  return statuses;
}

export async function runCli(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv);
  const logger = dependencies.logger || console;
  if (args.mode === "help") {
    logger.log("Usage: node aio-citation-telegram-notify.mjs [--check | --test-connection | --help]");
    return { state: "help" };
  }
  if (args.mode === "check") return runCheck(dependencies);
  let result;
  try { result = await notifyOnce({ kind: "setup", text: SETUP_MESSAGE, dependencies }); }
  catch { result = { state: "failed" }; }
  logger.log(`telegram setup test: ${result.state}`);
  if (!["sent", "already_sent"].includes(result.state)) {
    const error = new Error("Telegram setup test did not receive a confirmed acknowledgement.");
    error.exitCode = 1;
    throw error;
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch(error => {
    console.error("aio-citation-telegram-notify: operation failed safely");
    process.exitCode = error.exitCode || 1;
  });
}
