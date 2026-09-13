#!/usr/bin/env node
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
export const RUNS_ROOT = path.join(ROOT, "tmp/ctr-aio/runs");
export const DEFAULT_INPUT = path.join(ROOT, "docs/research/ai-overview-pilot-panel.json");
const API = "https://api.dataforseo.com";
const TASK_POST = "/v3/serp/google/organic/task_post";
const USER_DATA = "/v3/appendix/user_data";
const SCREENSHOT = "/v3/serp/screenshot";
const MAX_CAPTURE_COST = 0.0052;
const HARD_CAP = 1;
const REQUEST_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 10_000;
const POLL_WINDOW_MS = 60_000;
const IMAGE_HOSTS = new Set(["api.dataforseo.com", "cdn.dataforseo.com"]);
const EMBEDDED_AIO_TYPES = new Set([
  "knowledge_graph_ai_overview_item",
  "people_also_ask_ai_overview_expanded_element",
  "product_considerations_ai_overview_expanded_element",
]);
const PENDING_CODES = new Set([20100, 40601, 40602]);
const DEFAULT_PROOF_QUERY_IDS = ["pms-01", "off-05"];

const roundMoney = (n) => Math.round(n * 1e6) / 1e6;
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const nowIso = (now) => new Date(now()).toISOString();
const resumeBalanceFilename = (checkedAt) =>
  `account-balance-resume-${checkedAt.replace(/[:.]/g, "-")}-${randomBytes(3).toString("hex")}.json`;

export function buildCapturePlan(candidate) {
  if (!Array.isArray(candidate?.sectors)) throw new Error("Input must contain sectors[].queries[].");
  const queries = candidate.sectors.flatMap((sector) =>
    (sector.queries || []).map((query) => ({ ...query, sectorId: sector.id, sectorLabel: sector.label })),
  );
  if (queries.length !== 50) throw new Error(`Expected 50 queries; found ${queries.length}.`);
  const ids = new Set();
  const plan = queries.flatMap((query) => [
    capture(query, "desktop", "windows"),
    capture(query, "mobile", "android"),
  ]);
  for (const item of plan) {
    if (!item.queryId || !item.keyword) throw new Error("Every query needs a non-empty id and query.");
    if (ids.has(item.tag)) throw new Error(`Duplicate capture tag: ${item.tag}`);
    ids.add(item.tag);
  }
  return plan;
}

function capture(query, device, os) {
  return {
    queryId: query.id,
    sectorId: query.sectorId,
    sectorLabel: query.sectorLabel,
    intent: query.intent,
    userTask: query.userTask,
    keyword: query.query,
    tag: `${query.id}-${device}`,
    request: {
      keyword: query.query,
      location_name: "London,England,United Kingdom",
      language_code: "en",
      se_domain: "google.co.uk",
      device,
      os,
      depth: 10,
      priority: 1,
      load_async_ai_overview: true,
      expand_ai_overview: true,
      tag: `${query.id}-${device}`,
    },
  };
}

export function assertBudget(limit, proofReviewed = false) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("--limit must be an integer from 1 to 100.");
  if (limit > 4 && limit !== 100) throw new Error("Collection waves are limited to proof runs of at most four or a fresh 100-capture run.");
  if (limit > 4 && !proofReviewed) throw new Error("More than four captures requires --proof-reviewed.");
  const reserved = roundMoney(limit * MAX_CAPTURE_COST);
  if (reserved > HARD_CAP) throw new Error(`Reserved cost $${reserved} exceeds the $${HARD_CAP} hard cap.`);
  return reserved;
}

export function selectCaptures(plan, candidate, limit) {
  if (limit === 100) return plan;
  const proofIds = candidate.proofQueryIds || DEFAULT_PROOF_QUERY_IDS;
  if (!Array.isArray(proofIds) || proofIds.length !== 2) throw new Error("proofQueryIds must contain exactly two query IDs.");
  const proof = proofIds.flatMap((queryId) => plan.filter((capture) => capture.queryId === queryId));
  if (proof.length !== 4) throw new Error("Each proof query ID must match one query with desktop and mobile captures.");
  return proof.slice(0, limit);
}

export function taskPostIdentityIssues(posted, selected) {
  const tasks = posted?.tasks;
  if (!Array.isArray(tasks)) return ["missing_tasks_array"];
  const expected = new Set(selected.map(capture => capture.tag));
  const ids = new Set();
  const tags = new Set();
  const issues = [];
  if (tasks.length !== selected.length) issues.push("task_count_differs_from_requested_batch");
  for (const task of tasks) {
    const id = task?.id;
    const tag = task?.data?.tag;
    if (typeof id !== "string" || !id.trim()) issues.push("missing_original_task_id");
    else if (ids.has(id)) issues.push("duplicate_original_task_id");
    else ids.add(id);
    if (typeof tag !== "string" || !expected.has(tag)) issues.push("missing_or_unknown_returned_tag");
    else if (tags.has(tag)) issues.push("duplicate_returned_tag");
    else tags.add(tag);
    if (![20000, 20100].includes(task?.status_code)) issues.push("unsuccessful_task_in_successful_batch");
  }
  if (tags.size !== expected.size) issues.push("requested_tags_not_returned_exactly_once");
  return [...new Set(issues)];
}

export function normalizeAdvanced(envelope) {
  const base = { aioState: "unknown", detectedAiOverview: false, contentReturned: false, manualReviewRequired: true, embeddedAioTypes: [], references: [] };
  if (!envelope || typeof envelope !== "object") return { ...base, reason: "missing_envelope" };
  if (envelope.status_code !== 20000)
    return { ...base, aioState: "error", reason: "provider_envelope_failure" };
  const task = Array.isArray(envelope.tasks) ? envelope.tasks[0] : null;
  if (!task)
    return Number(envelope.tasks_error || 0) > 0
      ? { ...base, aioState: "error", reason: "provider_tasks_failure" }
      : { ...base, reason: "missing_task" };
  if (PENDING_CODES.has(task.status_code)) return { ...base, aioState: "pending", reason: "provider_pending" };
  if (task.status_code === 40106) return { ...base, aioState: "provider_partial", reason: "provider_partial_result" };
  if (Number(envelope.tasks_error || 0) > 0)
    return { ...base, aioState: "error", reason: "provider_tasks_failure" };
  if (task.status_code !== 20000) return { ...base, aioState: "error", reason: "task_failure" };
  if (!Array.isArray(task.result) || !task.result[0]) return { ...base, reason: "successful_task_without_result" };
  const result = task.result[0];
  if (!Array.isArray(result.item_types) || !Array.isArray(result.items))
    return { ...base, reason: "result_items_not_structural_arrays" };
  const allTypes = collectTypes(result);
  const embeddedAioTypes = [...new Set(allTypes.filter((type) => EMBEDDED_AIO_TYPES.has(type)))].sort();
  const itemObjects = result.items.filter((item) => item && typeof item === "object" && typeof item.type === "string");
  const aioItems = itemObjects.filter((item) => item.type === "ai_overview");
  const signalled = result.item_types.includes("ai_overview") || aioItems.length > 0;
  if (!signalled) {
    if (!itemObjects.some(isMeaningfulSerpItem)) return { ...base, embeddedAioTypes, reason: "empty_or_placeholder_serp_items" };
    return { ...base, aioState: "absent_returned_serp", embeddedAioTypes };
  }
  if (!aioItems.length)
    return { ...base, aioState: "detected_partial", detectedAiOverview: true, embeddedAioTypes, reason: "item_type_without_item" };
  const aio = aioItems[0];
  const references = normalizeReferences(collectReferences(aio));
  const contentReturned = hasAioBody(aio);
  return {
    ...base,
    aioState: contentReturned ? "present_content_returned" : "detected_partial",
    detectedAiOverview: true,
    contentReturned,
    asynchronousAiOverview: typeof aio.asynchronous_ai_overview === "boolean" ? aio.asynchronous_ai_overview : null,
    rankGroup: aio.rank_group ?? null,
    rankAbsolute: aio.rank_absolute ?? null,
    page: aio.page ?? null,
    position: aio.position ?? null,
    xpath: aio.xpath ?? null,
    markdown: aio.markdown ?? null,
    embeddedAioTypes,
    references,
    ...(contentReturned ? {} : { reason: "ai_overview_without_body_content" }),
  };
}

function isMeaningfulSerpItem(item) {
  const contentKeys = new Set(["url", "title", "description", "text", "snippet", "content", "answer", "items"]);
  return Object.entries(item).some(([key, value]) => {
    if (!contentKeys.has(key) || value === null || value === undefined || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  });
}

function hasAioBody(aio) {
  if (typeof aio?.markdown === "string" && aio.markdown.trim()) return true;
  const bodyKeys = new Set(["markdown", "text", "description", "snippet", "content", "answer"]);
  const excludedBranches = new Set(["references", "links", "metadata", "citations", "sources"]);
  const visit = (value, key = "") => {
    if (excludedBranches.has(key)) return false;
    if (typeof value === "string") return bodyKeys.has(key) && Boolean(value.trim());
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(([childKey, child]) => visit(child, childKey));
  };
  return Array.isArray(aio?.items) && aio.items.some((item) => visit(item));
}

function collectTypes(value, output = []) {
  if (!value || typeof value !== "object") return output;
  if (typeof value.type === "string") output.push(value.type);
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectTypes(child, output);
  return output;
}

function collectReferences(value, output = []) {
  if (!value || typeof value !== "object") return output;
  if (Array.isArray(value.references)) output.push(...value.references.filter((ref) => ref && typeof ref === "object"));
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectReferences(child, output);
  return output;
}

export function normalizeReferences(references) {
  const seen = new Set();
  const output = [];
  for (const raw of references || []) {
    const referenceUrl = typeof raw.url === "string" ? raw.url : null;
    let comparisonKey = null;
    let normalizedDomain = normalDomain(raw.domain);
    let domainMismatch = false;
    try {
      const parsed = new URL(referenceUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("unsupported protocol");
      comparisonKey = `url:${referenceUrl.trim()}`;
      const urlDomain = normalDomain(parsed.hostname);
      domainMismatch = Boolean(normalizedDomain && urlDomain && normalizedDomain !== urlDomain);
      normalizedDomain = urlDomain || normalizedDomain;
    } catch {}
    const key = comparisonKey || `fallback:${normalizedDomain || ""}|${raw.title || ""}|${raw.source || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ raw: { ...raw }, referenceUrl, comparisonKey, normalizedDomain, domainMismatch });
  }
  return output;
}

function normalDomain(domain) {
  return typeof domain === "string" ? domain.trim().toLowerCase().replace(/^www\./, "") || null : null;
}

function parseArgs(argv) {
  const args = { collect: false, proofReviewed: false, completeEvidence: false, input: DEFAULT_INPUT };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--collect") args.collect = true;
    else if (arg === "--proof-reviewed") args.proofReviewed = true;
    else if (arg === "--complete-evidence") args.completeEvidence = true;
    else if (["--input", "--limit", "--resume"].includes(arg)) {
      if (!argv[i + 1]) throw new Error(`${arg} requires a value.`);
      args[arg.slice(2)] = argv[++i];
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.resume && !args.collect) throw new Error("--resume requires --collect because it performs provider GET requests.");
  if (args.completeEvidence && (!args.collect || !args.resume))
    throw new Error("--complete-evidence requires --collect --resume <run-id>.");
  args.limit = args.limit === undefined ? (args.collect ? 4 : 100) : Number(args.limit);
  return args;
}

function runId(now) {
  return `${new Date(now()).toISOString().replace(/[:.]/g, "-")}-${randomBytes(3).toString("hex")}`;
}

function resumeDir(root, value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("--resume must be a run ID, not a path.");
  return path.join(root, value);
}

async function loadCredentials(env) {
  let login = env.DATAFORSEO_LOGIN;
  let password = env.DATAFORSEO_PASSWORD;
  if (env.DATAFORSEO_CREDENTIALS_PATH) {
    try {
      const parsed = JSON.parse(await readFile(path.resolve(env.DATAFORSEO_CREDENTIALS_PATH), "utf8"));
      login = parsed.login;
      password = parsed.password;
    } catch {
      throw new Error("Credentials file could not be read or parsed.");
    }
  }
  if (!login || !password) throw new Error("DataForSEO credentials are unavailable.");
  return { login, password };
}

function safePath(runDir, ...parts) {
  const resolved = path.resolve(runDir, ...parts);
  if (resolved !== runDir && !resolved.startsWith(`${runDir}${path.sep}`)) throw new Error("Refusing to write outside the run directory.");
  return resolved;
}

async function writeJson(runDir, relative, value) {
  const file = safePath(runDir, relative);
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, payload, "utf8");
  return { path: relative.replaceAll("\\", "/"), sha256: sha256(payload), bytes: Buffer.byteLength(payload) };
}

async function writeArtifact(runDir, relative, data) {
  const file = safePath(runDir, relative);
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buffer);
  return { path: relative.replaceAll("\\", "/"), sha256: sha256(buffer), bytes: buffer.length };
}

async function appendLedger(runDir, entry) {
  await appendFile(safePath(runDir, "cost-ledger.jsonl"), `${JSON.stringify(entry)}\n`, "utf8");
}

function moneyValue(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function envelopeCost(envelope) {
  return moneyValue(envelope?.cost);
}

function has40200(value) {
  if (!value || typeof value !== "object") return false;
  if (value.status_code === 40200) return true;
  return (Array.isArray(value) ? value : Object.values(value)).some(has40200);
}

async function apiJson(fetchImpl, credentials, endpoint, { method = "GET", body, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${API}${endpoint}`, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${credentials.login}:${credentials.password}`).toString("base64")}`,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(`Provider HTTP ${response.status}.`);
      if (response.status === 402) {
        error.stopAll = true;
        error.stopStatus = "stopped_provider_40200";
      }
      throw error;
    }
    try { return JSON.parse(text); } catch { throw new Error("Provider returned non-JSON data."); }
  } finally { clearTimeout(timer); }
}

function minimalBalance(envelope) {
  const task = envelope?.tasks?.[0];
  if (envelope?.status_code !== 20000 || task?.status_code !== 20000) return null;
  const balance = task?.result?.[0]?.money?.balance ?? task?.result?.[0]?.balance;
  return moneyValue(balance);
}

function htmlFrom(envelope) {
  const visit = (value) => {
    if (!value || typeof value !== "object") return null;
    if (typeof value.html === "string") return value.html;
    for (const child of Array.isArray(value) ? value : Object.values(value)) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  return visit(envelope);
}

function htmlSignal(html) {
  if (typeof html !== "string" || !html.trim()) return "unknown";
  return /AI Overview|ai[_ -]?overview/i.test(html) ? "detected_ambiguous" : "not_detected_ambiguous";
}

export async function downloadProviderImage(fetchImpl, url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !IMAGE_HOSTS.has(parsed.hostname)) throw new Error("Screenshot URL is outside the provider HTTPS allowlist.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(parsed.href, { method: "GET", redirect: "error", signal: controller.signal });
    if (!response.ok) throw new Error(`Screenshot download HTTP ${response.status}.`);
    const contentType = (response.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
    if (contentType !== "image/png" && contentType !== "image/jpeg") throw new Error("Screenshot response was not PNG or JPEG.");
    const buffer = Buffer.from(await response.arrayBuffer());
    const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
    const isJpeg = buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"));
    if ((contentType === "image/png" && !isPng) || (contentType === "image/jpeg" && !isJpeg))
      throw new Error("Screenshot signature did not match its content type.");
    return { buffer, extension: contentType === "image/png" ? ".png" : ".jpg", contentType };
  } finally { clearTimeout(timer); }
}

async function saveManifest(runDir, manifest) {
  manifest.updatedAt = new Date().toISOString();
  await writeJson(runDir, "run-manifest.json", manifest);
}

async function recordRequest(runDir, manifest, now, endpoint, method, envelope, taskId = null, tag = null) {
  const cost = envelopeCost(envelope);
  await appendLedger(runDir, { at: nowIso(now), endpoint, method, taskId, tag, cost, statusCode: envelope?.status_code ?? null });
  if (cost === null) manifest.actualCostKnown = false;
  else manifest.actualReturnedCost = roundMoney(manifest.actualReturnedCost + cost);
  if (has40200(envelope)) {
    const error = new Error("Provider returned 40200; collection stopped.");
    error.stopAll = true;
    error.stopStatus = "stopped_provider_40200";
    throw error;
  }
  if (manifest.actualReturnedCost > HARD_CAP) {
    const error = new Error("Provider-reported cost exceeded the $1 hard cap.");
    error.stopAll = true;
    error.stopStatus = "stopped_hard_cap";
    throw error;
  }
}

const READY_STATES = new Set(["absent_returned_serp", "present_content_returned", "detected_partial", "provider_partial"]);

function retrievalPending(manifest) {
  return manifest.captures.some((capture) =>
    capture.state === "pending" || (READY_STATES.has(capture.state) && !capture.files?.htmlEnvelope),
  );
}

async function collectEvidence({ runDir, manifest, credentials, fetchImpl, now, sleep }) {
  const deadline = now() + POLL_WINDOW_MS;
  let work;
  do {
    work = manifest.captures.filter((capture) =>
      capture.state === "pending" || (READY_STATES.has(capture.state) && !capture.files?.htmlEnvelope),
    );
    for (const capture of work) {
      if (now() >= deadline) return;
      const base = `evidence/${capture.tag}`;
      if (capture.state === "pending") {
        let advanced;
        try {
          advanced = await apiJson(fetchImpl, credentials, `/v3/serp/google/organic/task_get/advanced/${capture.taskId}`);
          capture.files.advancedEnvelope = await writeJson(runDir, `${base}/advanced.json`, advanced);
          await recordRequest(runDir, manifest, now, "task_get/advanced", "GET", advanced, capture.taskId, capture.tag);
        } catch (error) {
          capture.state = "unknown";
          capture.note = `Advanced retrieval stopped: ${error.message}`;
          await saveManifest(runDir, manifest);
          if (error.stopAll) throw error;
          continue;
        }
        const normalized = normalizeAdvanced(advanced);
        capture.aio = normalized;
        capture.state = normalized.aioState;
        capture.files.normalized = await writeJson(runDir, `${base}/normalized.json`, normalized);
        if (normalized.aioState === "pending") { await saveManifest(runDir, manifest); continue; }
        if (["error", "unknown"].includes(normalized.aioState)) { await saveManifest(runDir, manifest); continue; }
      }
      if (now() >= deadline) { await saveManifest(runDir, manifest); return; }
      try {
        const htmlEnvelope = await apiJson(fetchImpl, credentials, `/v3/serp/google/organic/task_get/html/${capture.taskId}`);
        capture.files.htmlEnvelope = await writeJson(runDir, `${base}/html-envelope.json`, htmlEnvelope);
        await recordRequest(runDir, manifest, now, "task_get/html", "GET", htmlEnvelope, capture.taskId, capture.tag);
        const html = htmlFrom(htmlEnvelope);
        capture.htmlAioSignal = htmlSignal(html);
        capture.htmlProviderState = html ? "content_returned" : "unknown_or_error";
        if (html) capture.files.html = await writeArtifact(runDir, `${base}/serp.html`, html);
      } catch (error) {
        capture.htmlAioSignal = "unknown";
        capture.htmlProviderState = "unknown_or_error";
        capture.note = `HTML retrieval stopped: ${error.message}`;
        if (error.stopAll) { await saveManifest(runDir, manifest); throw error; }
      }
      capture.reconciliation = "requires_visual_review";
      await saveManifest(runDir, manifest);
    }
    work = manifest.captures.filter((capture) => capture.state === "pending");
    if (work.length && now() < deadline) await sleep(Math.min(POLL_INTERVAL_MS, deadline - now()));
  } while (work.length && now() < deadline);
}

function screenshotCandidates(manifest) {
  return manifest.captures.filter((capture) =>
    capture.taskId && READY_STATES.has(capture.state) && capture.htmlProviderState === "content_returned" &&
    ["not_requested", "not_requested_on_resume"].includes(capture.screenshotState),
  );
}

async function completeScreenshots({ runDir, manifest, credentials, fetchImpl, now }) {
  const deadline = now() + POLL_WINDOW_MS;
  for (const capture of screenshotCandidates(manifest)) {
    if (now() >= deadline) return;
    if (!manifest.actualCostKnown || manifest.actualReturnedCost + 0.004 > HARD_CAP) {
      const error = new Error("Screenshot cost is uncertain or would exceed the $1 hard cap.");
      error.stopAll = true;
      error.stopStatus = "stopped_hard_cap_or_uncertain_cost";
      throw error;
    }
    const base = `evidence/${capture.tag}`;
    capture.screenshotState = "post_attempting";
    await saveManifest(runDir, manifest);
    let screenshotPostReturned = false;
    try {
      const shot = await apiJson(fetchImpl, credentials, SCREENSHOT, {
        method: "POST", body: [{ task_id: capture.taskId, browser_preset: capture.device }],
      });
      screenshotPostReturned = true;
      capture.files.screenshotEnvelope = await writeJson(runDir, `${base}/screenshot.json`, shot);
      await recordRequest(runDir, manifest, now, "serp/screenshot", "POST", shot, capture.taskId, capture.tag);
      const imageUrl = shot?.tasks?.[0]?.result?.[0]?.items?.[0]?.image;
      if (!imageUrl) throw new Error("Screenshot response contained no image URL.");
      const image = await downloadProviderImage(fetchImpl, imageUrl);
      capture.files.screenshot = await writeArtifact(runDir, `${base}/serp${image.extension}`, image.buffer);
      capture.screenshotContentType = image.contentType;
      capture.screenshotState = "downloaded_unreviewed";
      capture.reconciliation = "requires_visual_review";
      await saveManifest(runDir, manifest);
    } catch (error) {
      capture.screenshotState = screenshotPostReturned ? "response_returned_download_failed" : "post_outcome_unknown_do_not_retry";
      capture.note = `Screenshot completion stopped: ${error.message}`;
      if (!screenshotPostReturned) manifest.actualCostKnown = false;
      manifest.status = error.stopAll
        ? error.stopStatus || "stopped_provider_error"
        : screenshotPostReturned ? "stopped_screenshot_download_error" : "stopped_uncertain_screenshot_post";
      await saveManifest(runDir, manifest);
      return;
    }
  }
}

export async function runCli(argv = process.argv.slice(2), dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl || globalThis.fetch;
  const now = dependencies.now || Date.now;
  const sleep = dependencies.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const logger = dependencies.logger || console;
  const env = dependencies.env || process.env;
  const runsRoot = dependencies.runsRoot || RUNS_ROOT;
  const args = parseArgs(argv);
  if (args.resume) {
    const runDir = resumeDir(runsRoot, args.resume);
    const manifest = JSON.parse(await readFile(safePath(runDir, "run-manifest.json"), "utf8"));
    const credentials = await loadCredentials(env);
    try {
      await collectEvidence({ runDir, manifest, credentials, fetchImpl, now, sleep });
    } catch (error) {
      manifest.status = error.stopStatus || (error.stopAll ? "stopped_provider_error" : "stopped_retrieval_error");
      await saveManifest(runDir, manifest);
      throw error;
    }
    for (const capture of manifest.captures) {
      if (capture.screenshotState === "not_requested") capture.screenshotState = "not_requested_on_resume";
    }
    if (args.completeEvidence) {
      const candidates = screenshotCandidates(manifest);
      if (candidates.length) {
        let userData;
        try {
          userData = await apiJson(fetchImpl, credentials, USER_DATA);
          await recordRequest(runDir, manifest, now, "appendix/user_data", "GET", userData);
        } catch (error) {
          manifest.status = error.stopStatus || "stopped_balance_preflight_error";
          await saveManifest(runDir, manifest);
          throw error;
        }
        const balance = minimalBalance(userData);
        const reserve = roundMoney(candidates.length * 0.004);
        manifest.screenshotCompletionReserveUsd = reserve;
        const balanceCheckedAt = nowIso(now);
        await writeJson(runDir, resumeBalanceFilename(balanceCheckedAt), { checkedAt: balanceCheckedAt, balanceUsd: balance });
        if (balance === null || balance < reserve || !manifest.actualCostKnown || manifest.actualReturnedCost + reserve > HARD_CAP) {
          manifest.status = "blocked_screenshot_balance_or_cost_uncertain";
          await saveManifest(runDir, manifest);
          throw new Error("Screenshot balance or cost is unavailable, insufficient, or exceeds the hard cap; no screenshot POST was made.");
        }
        await completeScreenshots({ runDir, manifest, credentials, fetchImpl, now });
      }
    }
    if (!manifest.status.startsWith("stopped_") && !manifest.status.startsWith("blocked_")) {
      const incomplete = retrievalPending(manifest) || (args.completeEvidence && screenshotCandidates(manifest).length > 0);
      manifest.status = incomplete ? "pending" : args.completeEvidence ? "collection_pass_finished_unreviewed" : "retrieval_pass_complete";
    }
    await saveManifest(runDir, manifest);
    logger.log(args.completeEvidence
      ? `Evidence-completion pass recorded for ${manifest.runId}; only existing task IDs were eligible.`
      : `Resume GET pass recorded for ${manifest.runId}; no POST request was made.`);
    return { runDir, manifest };
  }
  const inputText = await readFile(path.resolve(args.input), "utf8");
  const candidate = JSON.parse(inputText);
  const plan = buildCapturePlan(candidate);
  const limit = args.limit;
  const reserved = args.collect
    ? assertBudget(limit, args.proofReviewed)
    : (() => {
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("--limit must be an integer from 1 to 100.");
        return roundMoney(limit * MAX_CAPTURE_COST);
      })();
  const selected = selectCaptures(plan, candidate, limit);
  await mkdir(runsRoot, { recursive: true });
  const runDir = path.join(runsRoot, runId(now));
  await mkdir(runDir, { recursive: false });
  const manifest = {
    schemaVersion: 1,
    runId: path.basename(runDir),
    mode: args.collect ? "collect" : "dry-run",
    status: args.collect ? "initialised" : "dry_run",
    createdAt: nowIso(now),
    input: path.relative(ROOT, path.resolve(args.input)).replaceAll("\\", "/"),
    inputSha256: sha256(inputText),
    plannedCaptureCount: plan.length,
    selectedCaptureCount: selected.length,
    expectedCaptureIds: plan.map((item) => item.tag),
    selectedCaptureIds: selected.map((item) => item.tag),
    proofQueryIds: candidate.proofQueryIds || DEFAULT_PROOF_QUERY_IDS,
    selectedRequestSha256: sha256(JSON.stringify(selected.map((item) => item.request))),
    proofReviewedFlag: Boolean(args.proofReviewed),
    collectionPerformed: false,
    reservedMaximumUsd: reserved,
    hardCapUsd: HARD_CAP,
    actualReturnedCost: 0,
    actualCostKnown: true,
    captures: selected.map((item) => ({ ...item, requestSha256: sha256(JSON.stringify(item.request)), state: "planned", device: item.request.device, taskId: null, files: {}, screenshotState: "not_requested" })),
  };
  await saveManifest(runDir, manifest);
  if (!args.collect) {
    await writeJson(runDir, "task-plan.json", selected.map((item) => item.request));
    logger.log(`Dry run planned ${selected.length} captures in ${path.relative(ROOT, runDir)}; no network request was made.`);
    return { runDir, manifest };
  }
  const credentials = await loadCredentials(env);
  let userData;
  try {
    userData = await apiJson(fetchImpl, credentials, USER_DATA);
    await recordRequest(runDir, manifest, now, "appendix/user_data", "GET", userData);
  } catch (error) {
    manifest.status = error.stopStatus || "stopped_balance_preflight_error";
    await saveManifest(runDir, manifest);
    throw error;
  }
  const balance = minimalBalance(userData);
  await writeJson(runDir, "account-balance.json", { checkedAt: nowIso(now), balanceUsd: balance });
  if (balance === null || balance < reserved || !manifest.actualCostKnown || manifest.actualReturnedCost + reserved > HARD_CAP) {
    manifest.status = "blocked_balance_uncertain_or_insufficient";
    await saveManifest(runDir, manifest);
    throw new Error("Balance is unavailable or below the maximum reserved cost; no task POST was made.");
  }
  manifest.taskPostState = "attempting_single_shot";
  manifest.status = "task_post_attempting";
  await saveManifest(runDir, manifest);
  let posted;
  try {
    posted = await apiJson(fetchImpl, credentials, TASK_POST, { method: "POST", body: selected.map((item) => item.request) });
    await writeJson(runDir, "provider-responses/task-post.json", posted);
    await recordRequest(runDir, manifest, now, "serp/google/organic/task_post", "POST", posted);
  } catch (error) {
    manifest.taskPostState = error.stopStatus === "stopped_provider_40200" ? "returned_40200_do_not_retry" : "unknown_do_not_retry";
    manifest.status = error.stopStatus || (error.stopAll ? "stopped_provider_error" : "stopped_uncertain_post");
    await saveManifest(runDir, manifest);
    throw error;
  }
  if (!Array.isArray(posted.tasks)) {
    manifest.taskPostState = "returned_error_do_not_retry";
    manifest.status = "stopped_provider_error";
    await saveManifest(runDir, manifest);
    return { runDir, manifest };
  }
  if (posted.status_code === 20000 && Number(posted.tasks_error || 0) === 0) {
    const identityIssues = taskPostIdentityIssues(posted, selected);
    if (identityIssues.length) {
      manifest.taskPostState = "returned_invalid_task_identity_do_not_retry";
      manifest.status = "stopped_invalid_task_identity";
      manifest.taskPostIdentityIssues = identityIssues;
      // Preserve returned IDs for charge investigation without assigning an invalid mapping to captures.
      manifest.receivedTaskIds = posted.tasks.map(task => ({ tag: task?.data?.tag ?? null, taskId: task?.id ?? null }));
      manifest.collectionPerformed = manifest.receivedTaskIds.some(item => typeof item.taskId === "string" && item.taskId.trim());
      await saveManifest(runDir, manifest);
      return { runDir, manifest };
    }
  }
  const byTag = new Map(manifest.captures.map((capture) => [capture.tag, capture]));
  for (let index = 0; index < posted.tasks.length; index++) {
    const task = posted.tasks[index];
    const tag = task?.data?.tag || selected[index]?.tag;
    const capture = byTag.get(tag);
    if (!capture) continue;
    capture.taskId = task.id || null;
    capture.state = task.id && (task.status_code === 20100 || task.status_code === 20000) ? "pending" : "error";
    capture.taskPostStatusCode = task.status_code ?? null;
    await saveManifest(runDir, manifest);
  }
  for (const capture of manifest.captures) {
    if (!capture.taskId) {
      capture.state = "error";
      capture.note = "Task POST returned no task ID; do not retry this run.";
    }
  }
  manifest.receivedTaskIds = manifest.captures.filter((capture) => capture.taskId).map((capture) => ({ tag: capture.tag, taskId: capture.taskId }));
  manifest.collectionPerformed = manifest.receivedTaskIds.length > 0;
  if (posted.status_code !== 20000 || Number(posted.tasks_error || 0) > 0) {
    manifest.taskPostState = "returned_partial_or_error_ids_saved_do_not_retry";
    manifest.status = "stopped_provider_error";
    await saveManifest(runDir, manifest);
    return { runDir, manifest };
  }
  manifest.taskPostState = "returned_task_ids_saved";
  manifest.status = "retrieving";
  await saveManifest(runDir, manifest);
  try {
    await collectEvidence({ runDir, manifest, credentials, fetchImpl, now, sleep });
    await completeScreenshots({ runDir, manifest, credentials, fetchImpl, now });
  } catch (error) {
    manifest.status = error.stopStatus || (error.stopAll ? "stopped_provider_error" : "stopped_retrieval_error");
    await saveManifest(runDir, manifest);
    throw error;
  }
  if (!manifest.status.startsWith("stopped_"))
    manifest.status = retrievalPending(manifest) || screenshotCandidates(manifest).length ? "pending" : "collection_pass_finished_unreviewed";
  await saveManifest(runDir, manifest);
  logger.log(`Collection state recorded for ${manifest.runId}; inspect the manifest before any resume.`);
  return { runDir, manifest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => { console.error(`aio-pilot: ${error.message}`); process.exitCode = 1; });
}
