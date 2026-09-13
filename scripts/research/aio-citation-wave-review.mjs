#!/usr/bin/env node

import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as cheerio from "cheerio";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FREEZE_ROOT = path.join(REPOSITORY_ROOT, "tmp/ctr-aio/citation-study/frozen-v1");
const FILE_KEYS = ["advancedEnvelope", "normalized", "htmlEnvelope", "html", "screenshotEnvelope", "screenshot"];
const REQUEST_EXTRAS = { api: "serp", function: "task_get", se: "google", se_type: "organic" };
const LONDON_LOCATION_CODE = 1006886;
const OFFSET_TIMESTAMP = /(?:Z|[+-]\d{2}:\d{2})$/;
const EMBEDDED_EXCLUSIONS = new Set(["ai_overview", "ai_overview_element", "ai_overview_reference"]);

const sha256 = value => createHash("sha256").update(value).digest("hex");
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const exactSet = values => [...new Set(values)].sort();
const toPosix = value => value.split(path.sep).join("/");
const relativeRepo = value => toPosix(path.relative(REPOSITORY_ROOT, value));
const timestamp = value => typeof value === "string" && OFFSET_TIMESTAMP.test(value) && Number.isFinite(Date.parse(value))
  ? Date.parse(value) : null;

function fail(message) {
  throw new Error(`Wave review scaffold refused: ${message}`);
}

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function readJson(file, label) {
  let bytes;
  try { bytes = await readFile(file); } catch { fail(`${label} could not be read`); }
  try { return { value: JSON.parse(bytes.toString("utf8")), bytes }; } catch { fail(`${label} is not valid UTF-8 JSON`); }
}

async function verifyRecordedFile(runDir, record, key) {
  if (!record?.path || !record.sha256 || !Number.isInteger(record.bytes)) {
    return { public: { key, path: record?.path ?? null, state: "missing_manifest_record" }, bytes: null };
  }
  const absolute = path.resolve(runDir, record.path);
  if (!inside(runDir, absolute) || absolute === runDir) {
    return { public: { key, path: record.path, state: "path_outside_run" }, bytes: null };
  }
  let bytes;
  try { bytes = await readFile(absolute); } catch {
    return { public: { key, path: relativeRepo(absolute), state: "file_missing", expectedSha256: record.sha256, expectedBytes: record.bytes }, bytes: null };
  }
  const actualSha256 = sha256(bytes);
  const valid = actualSha256 === record.sha256 && bytes.length === record.bytes;
  return {
    public: {
      key,
      path: relativeRepo(absolute),
      state: valid ? "verified" : "hash_or_size_mismatch",
      expectedSha256: record.sha256,
      actualSha256,
      expectedBytes: record.bytes,
      actualBytes: bytes.length,
    },
    bytes: valid ? bytes : null,
  };
}

function expectedRequest(capture) {
  return {
    keyword: capture.keyword,
    location_name: "London,England,United Kingdom",
    language_code: "en",
    se_domain: "google.co.uk",
    device: capture.device,
    os: capture.device === "desktop" ? "windows" : "android",
    depth: 10,
    priority: 1,
    load_async_ai_overview: true,
    expand_ai_overview: true,
    tag: capture.tag,
  };
}

function exactObject(actual, expected) {
  return actual && same(Object.keys(actual).sort(), Object.keys(expected).sort())
    && Object.entries(expected).every(([key, value]) => same(actual[key], value));
}

function taskDataMatches(data, request) {
  return exactObject(data, { ...REQUEST_EXTRAS, ...request });
}

function parseTrustedJson(verified, key, issues) {
  if (!verified[key]?.bytes) return null;
  try { return JSON.parse(verified[key].bytes.toString("utf8")); } catch {
    issues.push(`${key}_invalid_utf8_json`);
    return null;
  }
}

function walk(value, visit, objectPath = []) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => walk(child, visit, [...objectPath, index]));
    return;
  }
  if (!value || typeof value !== "object") return;
  visit(value, objectPath);
  for (const [key, child] of Object.entries(value)) walk(child, visit, [...objectPath, key]);
}

function xpathToCss(xpath) {
  if (typeof xpath !== "string" || !xpath) return null;
  return xpath.split("/").filter(Boolean).map((segment) => {
    const match = segment.match(/^([\w-]+)\[(\d+)]$/);
    return match ? `${match[1]}:nth-of-type(${match[2]})` : segment;
  }).join(" > ");
}

function decodeHydration(value) {
  return String(value ?? "")
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\\//g, "/")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function simplify(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function bodyProbe(aio) {
  const candidates = [];
  walk(aio, node => {
    if (node.type === "ai_overview_reference") return;
    for (const key of ["text", "title", "markdown"]) {
      if (typeof node[key] !== "string") continue;
      const cleaned = node[key].replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/[*_`#]/g, " ").replace(/\s+/g, " ").trim();
      if (cleaned.length >= 30) candidates.push(cleaned.slice(0, 80));
    }
  });
  return candidates[0] ?? null;
}

function opaqueCandidates($, node, reference) {
  if (!node?.length) return [];
  const title = simplify(reference.title);
  const source = simplify(reference.source);
  const domain = simplify(reference.domain);
  const needles = [title, source, domain].filter(value => value.length >= 3);
  const output = [];
  node.find("a[href]").each((_, element) => {
    const link = $(element);
    const href = decodeHydration(link.attr("href"));
    if (!/(?:^|\/)goto\?|google\.[^/]+\/goto\?/i.test(href)) return;
    const visibleIdentity = decodeHydration(link.attr("aria-label") || link.text()).trim() || null;
    const label = simplify(visibleIdentity);
    const matchedBy = needles.filter(needle => needle.length < 8
      ? label === needle || label.startsWith(`${needle} opens in`)
      : label.includes(needle) || (label.length >= 8 && needle.includes(label)));
    if (matchedBy.length) output.push({ href, visibleIdentity, matchedBy });
  });
  return [...new Map(output.map(item => [`${item.href}\n${item.visibleIdentity}`, item])).values()].slice(0, 8);
}

function safeReferenceUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || !parsed.hostname) return null;
    return parsed;
  } catch { return null; }
}

const URL_TOKEN_CHARACTER = /[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]/;

export function exactUrlEvidence(decodedSubtree, $, aioNode, rawUrl) {
  if (!rawUrl || !aioNode?.length) return { exact: false, method: null };
  let attributeMatch = false;
  aioNode.find("*").addBack().each((_, element) => {
    for (const value of Object.values(element.attribs ?? {})) {
      if (decodeHydration(value) === rawUrl) attributeMatch = true;
    }
  });
  if (attributeMatch) return { exact: true, method: "exact_attribute_value" };
  let offset = decodedSubtree.indexOf(rawUrl);
  while (offset >= 0) {
    const before = decodedSubtree[offset - 1] ?? "";
    const after = decodedSubtree[offset + rawUrl.length] ?? "";
    if (!URL_TOKEN_CHARACTER.test(before) && !URL_TOKEN_CHARACTER.test(after)) {
      return { exact: true, method: "exact_bounded_hydration_token" };
    }
    offset = decodedSubtree.indexOf(rawUrl, offset + 1);
  }
  return { exact: false, method: null };
}

function mainReferences(aio, decodedSubtree, $, aioNode, tag, issues, classifyReferenceDestination) {
  if (!aio) return [];
  const byUrl = new Map();
  walk(aio, (node, objectPath) => {
    if (node.type !== "ai_overview_reference") return;
    if (typeof node.url !== "string" || !node.url) {
      issues.push("main_ai_overview_reference_url_missing_or_non_string");
      return;
    }
    const parsed = safeReferenceUrl(node.url);
    if (!parsed) {
      issues.push("invalid_main_reference_url");
      return;
    }
    const existing = byUrl.get(node.url);
    if (existing) {
      existing.providerPaths.push(objectPath.join("/"));
      return;
    }
    const exactEvidence = exactUrlEvidence(decodedSubtree, $, aioNode, node.url);
    const candidates = exactEvidence.exact ? [] : opaqueCandidates($, aioNode, node);
    byUrl.set(node.url, {
      url: node.url,
      host: parsed.hostname.toLowerCase(),
      referenceClass: classifyReferenceDestination(node.url) === "google_product_view" ? "product" : "external",
      source: node.source ?? null,
      domain: node.domain ?? null,
      title: node.title ?? null,
      providerPaths: [objectPath.join("/")],
      originalHtmlEvidenceState: exactEvidence.exact ? "exact_original_html" : candidates.length ? "opaque_redirect_candidate_unresolved" : "unresolved",
      originalHtmlMatchMethod: exactEvidence.method,
      opaqueRedirectCandidates: candidates,
      laterRedirectEvidence: null,
    });
  });
  if (byUrl.size !== exactSet(byUrl.keys()).length) issues.push(`reference_deduplication_failed_${tag}`);
  return [...byUrl.values()];
}

function answerLinks(aio) {
  if (!aio) return [];
  const output = new Map();
  walk(aio, (node, objectPath) => {
    if (node.type === "link_element" && typeof node.url === "string") {
      output.set(`answer_link\n${node.url}`, { role: "answer_link", url: node.url, providerPath: objectPath.join("/") });
    }
    if (node.type === "images_element" && typeof node.image_url === "string") {
      output.set(`provider_image_asset\n${node.image_url}`, { role: "provider_image_asset", url: node.image_url, providerPath: objectPath.join("/") });
    }
  });
  return [...output.values()];
}

function embeddedAio(result) {
  const grouped = new Map();
  walk(result, (node, objectPath) => {
    if (typeof node.type !== "string" || !node.type.includes("ai_overview") || EMBEDDED_EXCLUSIONS.has(node.type)) return;
    if (!grouped.has(node.type)) grouped.set(node.type, { type: node.type, count: 0, providerPaths: [], payloadStates: new Set(), referenceUrls: new Set() });
    const record = grouped.get(node.type);
    record.count += 1;
    record.providerPaths.push(objectPath.join("/"));
    const placeholder = node.asynchronous_ai_overview === true && node.items === null && node.references === null;
    record.payloadStates.add(placeholder ? "placeholder_no_payload" : "payload_or_nonplaceholder_fields_returned");
    walk(node, child => {
      if (child.type === "ai_overview_reference" && typeof child.url === "string") record.referenceUrls.add(child.url);
    });
  });
  return [...grouped.values()].map(record => ({
    ...record,
    payloadStates: [...record.payloadStates].sort(),
    referenceUrls: [...record.referenceUrls],
  })).sort((left, right) => left.type.localeCompare(right.type));
}

function htmlAnalysis(html, aio) {
  const output = {
    providerXpath: aio?.xpath ?? null,
    xpathMatchCount: aio ? 0 : null,
    bodyProbeSha256: null,
    bodyProbeLength: null,
    bodyProbeMatched: null,
    literalAiOverviewLabelInSubtree: null,
    allResultsTextInDocument: html ? /(?:^|\W)All(?:\W|$)/i.test(cheerio.load(html).text()) : null,
    decodedSubtree: "",
    $: null,
    node: null,
  };
  if (!html || !aio) return output;
  const $ = cheerio.load(html, { decodeEntities: false });
  const css = xpathToCss(aio.xpath);
  const nodes = css ? $(css) : null;
  output.xpathMatchCount = nodes?.length ?? 0;
  if (output.xpathMatchCount !== 1) return output;
  const node = nodes.first();
  const decodedSubtree = decodeHydration($.html(node));
  const probe = bodyProbe(aio);
  output.bodyProbeSha256 = probe ? sha256(Buffer.from(probe, "utf8")) : null;
  output.bodyProbeLength = probe?.length ?? null;
  output.bodyProbeMatched = probe ? simplify(node.text()).includes(simplify(probe)) || simplify(decodedSubtree).includes(simplify(probe)) : null;
  output.literalAiOverviewLabelInSubtree = /\bAI Overview\b/i.test(decodedSubtree);
  output.decodedSubtree = decodedSubtree;
  output.$ = $;
  output.node = node;
  return output;
}

function imageType(bytes) {
  if (!bytes) return null;
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return "unknown";
}

function referenceFieldState(aio) {
  if (!aio) return "no_single_main_aio_item";
  if (!Object.hasOwn(aio, "references")) return "missing";
  if (aio.references === null) return "null";
  if (!Array.isArray(aio.references)) return "invalid_non_array";
  return aio.references.length ? "array_nonempty" : "array_empty";
}

async function frozenContext() {
  const manifestFile = path.join(FREEZE_ROOT, "freeze-manifest.json");
  const freezeRead = await readJson(manifestFile, "freeze manifest");
  const freeze = freezeRead.value;
  const verifiedArtifacts = {};
  for (const [role, record] of Object.entries(freeze.artifacts ?? {})) {
    const file = path.resolve(FREEZE_ROOT, record.frozenFile);
    if (!inside(FREEZE_ROOT, file) || file === FREEZE_ROOT) fail(`frozen ${role} path escapes freeze directory`);
    const bytes = await readFile(file);
    verifiedArtifacts[role] = { path: relativeRepo(file), sha256: sha256(bytes), bytes: bytes.length, matchesFreezeManifest: sha256(bytes) === record.sha256 };
  }
  if (!Object.values(verifiedArtifacts).every(record => record.matchesFreezeManifest)) fail("a frozen artifact hash differs from the freeze manifest");
  const summaryFile = path.join(FREEZE_ROOT, freeze.artifacts.summaryHelper.frozenFile);
  const summaryModule = await import(pathToFileURL(summaryFile).href);
  if (typeof summaryModule.classifyReferenceDestination !== "function") fail("frozen summary helper does not export its reference classifier");
  const panelFile = path.join(FREEZE_ROOT, freeze.artifacts.panel.frozenFile);
  const panel = (await readJson(panelFile, "frozen panel")).value;
  return {
    freeze,
    freezeManifest: { path: relativeRepo(manifestFile), sha256: sha256(freezeRead.bytes), bytes: freezeRead.bytes.length },
    verifiedArtifacts,
    panel,
    classifyReferenceDestination: summaryModule.classifyReferenceDestination,
  };
}

async function submissionEvidence(runDir, manifest) {
  const receiptFile = path.join(runDir, "task-post-submission.json");
  const responseFile = path.join(runDir, "provider-responses", "task-post.json");
  let receiptRead = null;
  let responseRead = null;
  try { receiptRead = await readJson(receiptFile, "pre-POST submission receipt"); } catch { /* Report absent historical receipt below. */ }
  try { responseRead = await readJson(responseFile, "task POST envelope"); } catch { /* Report absent envelope below. */ }
  const receipt = receiptRead?.value ?? null;
  const response = responseRead?.value ?? null;
  const requests = manifest.captures.map(capture => capture.request);
  const requestBodySha256 = sha256(Buffer.from(JSON.stringify(requests), "utf8"));
  const responseTasks = Array.isArray(response?.tasks) ? response.tasks : [];
  const taskRows = responseTasks.map(task => ({ tag: task?.data?.tag ?? null, taskId: task?.id ?? null }));
  const manifestRows = manifest.captures.map(capture => ({ tag: capture.tag, taskId: capture.taskId }));
  const receivedRows = Array.isArray(manifest.receivedTaskIds)
    ? manifest.receivedTaskIds.map(record => typeof record === "string" ? { tag: null, taskId: record } : { tag: record?.tag ?? null, taskId: record?.taskId ?? null })
    : [];
  const rowKey = row => `${row.tag ?? ""}\u0000${row.taskId ?? ""}`;
  const requestRowsMatch = responseTasks.length === 100 && responseTasks.every((task, index) => {
    const expected = { ...REQUEST_EXTRAS, function: "task_post", ...requests[index] };
    return task?.status_code === 20100 && exactObject(task.data, expected);
  });
  const fullBijection = manifestRows.length === 100
    && new Set(manifestRows.map(rowKey)).size === 100
    && same(exactSet(taskRows.map(rowKey)), exactSet(manifestRows.map(rowKey)))
    && same(exactSet(receivedRows.map(rowKey)), exactSet(manifestRows.map(rowKey)));
  const receiptMatches = Boolean(receipt
    && receipt.recordedBeforeProviderRequest === true
    && receipt.runId === manifest.runId
    && receipt.waveId === manifest.waveId
    && receipt.submittedAt === manifest.submittedAt
    && receipt.baselineSubmittedAt === manifest.baselineSubmittedAt
    && same(receipt.registration, manifest.registration)
    && receipt.requestCount === 100
    && receipt.requestBodySha256 === requestBodySha256
    && manifest.selectedRequestSha256 === requestBodySha256);
  return {
    receipt: receiptRead ? { path: relativeRepo(receiptFile), sha256: sha256(receiptRead.bytes), bytes: receiptRead.bytes.length } : null,
    taskPostEnvelope: responseRead ? { path: relativeRepo(responseFile), sha256: sha256(responseRead.bytes), bytes: responseRead.bytes.length } : null,
    requestBodySha256,
    receiptMatchesManifestAndRequestBody: receiptMatches,
    taskPostEnvelopeSuccessful: response?.status_code === 20000 && response?.tasks_count === 100 && response?.tasks_error === 0,
    taskPostRequestRowsMatchManifestRequests: requestRowsMatch,
    tagTaskIdBijectionPass: fullBijection,
  };
}

function panelCaptures(panel) {
  const output = [];
  for (const sector of panel.sectors ?? []) for (const query of sector.queries ?? []) for (const device of panel.devices ?? []) {
    output.push({
      tag: `${query.id}-${device}`,
      queryId: query.id,
      keyword: query.query,
      sectorId: sector.id,
      sectorLabel: sector.label,
      intent: query.intent,
      userTask: query.userTask,
      device,
    });
  }
  return output;
}

async function captureReport(capture, index, expectedPanel, runDir, classifyReferenceDestination) {
  const issues = [];
  const keys = Object.keys(capture.files ?? {}).sort();
  if (!same(keys, [...FILE_KEYS].sort())) issues.push("manifest_evidence_file_set_incomplete_or_extra");
  const verified = {};
  for (const key of FILE_KEYS) verified[key] = await verifyRecordedFile(runDir, capture.files?.[key], key);
  const fileIntegrity = Object.fromEntries(FILE_KEYS.map(key => [key, verified[key].public]));
  if (FILE_KEYS.some(key => verified[key].public.state !== "verified")) issues.push("evidence_file_integrity_failed");

  const panelFields = ["tag", "queryId", "keyword", "sectorId", "sectorLabel", "intent", "userTask", "device"];
  if (!expectedPanel || panelFields.some(key => capture[key] !== expectedPanel[key])) issues.push("frozen_panel_metadata_join_failed");
  const request = expectedRequest(capture);
  if (!exactObject(capture.request, request)) issues.push("manifest_request_settings_mismatch");
  if (capture.requestSha256 !== sha256(Buffer.from(JSON.stringify(capture.request ?? null)))) issues.push("manifest_request_hash_mismatch");

  const advanced = parseTrustedJson(verified, "advancedEnvelope", issues);
  const normalized = parseTrustedJson(verified, "normalized", issues);
  const htmlEnvelope = parseTrustedJson(verified, "htmlEnvelope", issues);
  const screenshotEnvelope = parseTrustedJson(verified, "screenshotEnvelope", issues);
  let html = null;
  if (verified.html.bytes) {
    try { html = new TextDecoder("utf-8", { fatal: true }).decode(verified.html.bytes); } catch { issues.push("html_not_valid_utf8"); }
  }

  const advancedTasks = Array.isArray(advanced?.tasks) ? advanced.tasks : [];
  const advancedTask = advancedTasks[0] ?? null;
  const advancedResults = Array.isArray(advancedTask?.result) ? advancedTask.result : [];
  const result = advancedResults[0] ?? null;
  if (advancedTasks.length !== 1 || advancedResults.length !== 1) issues.push("advanced_task_or_result_cardinality_invalid");
  if (advanced?.status_code !== 20000 || advancedTask?.status_code !== 20000) issues.push("advanced_envelope_not_successful");
  if (!advancedTask || advancedTask.id !== capture.taskId) issues.push("advanced_task_id_join_failed");
  if (advancedTask && !taskDataMatches(advancedTask.data, request)) issues.push("advanced_request_settings_join_failed");
  if (result && (result.keyword !== request.keyword || result.se_domain !== request.se_domain
    || result.language_code !== request.language_code || result.location_code !== LONDON_LOCATION_CODE || result.type !== "organic")) {
    issues.push("advanced_result_metadata_join_failed");
  }
  const providerTimestamp = result?.datetime ?? null;
  if (result && timestamp(providerTimestamp) === null) issues.push("returned_result_timestamp_missing_or_invalid");
  if (!result && providerTimestamp !== null) issues.push("nonreturned_result_has_timestamp");

  const htmlTasks = Array.isArray(htmlEnvelope?.tasks) ? htmlEnvelope.tasks : [];
  const htmlTask = htmlTasks[0] ?? null;
  const htmlResults = Array.isArray(htmlTask?.result) ? htmlTask.result : [];
  const htmlResult = htmlResults[0] ?? null;
  if (htmlTasks.length !== 1 || htmlResults.length !== 1) issues.push("html_task_or_result_cardinality_invalid");
  const htmlPayload = htmlResult?.items?.[0]?.html;
  if (htmlEnvelope?.status_code !== 20000 || htmlTask?.status_code !== 20000) issues.push("html_envelope_not_successful");
  if (!htmlTask || htmlTask.id !== capture.taskId) issues.push("html_task_id_join_failed");
  if (htmlTask && !taskDataMatches(htmlTask.data, request)) issues.push("html_request_settings_join_failed");
  if (result && htmlResult && (htmlResult.keyword !== result.keyword || htmlResult.se_domain !== result.se_domain
    || htmlResult.language_code !== result.language_code || htmlResult.location_code !== result.location_code
    || htmlResult.datetime !== result.datetime)) issues.push("advanced_html_result_metadata_join_failed");
  if (typeof htmlPayload !== "string" || !verified.html.bytes?.equals(Buffer.from(htmlPayload, "utf8"))) issues.push("saved_html_payload_join_failed");

  const screenshotTasks = Array.isArray(screenshotEnvelope?.tasks) ? screenshotEnvelope.tasks : [];
  const screenshotTask = screenshotTasks[0] ?? null;
  const screenshotResults = Array.isArray(screenshotTask?.result) ? screenshotTask.result : [];
  if (screenshotTasks.length !== 1 || screenshotResults.length !== 1) issues.push("screenshot_task_or_result_cardinality_invalid");
  const screenshotTaskId = screenshotTask?.id ?? null;
  const screenshotOriginalTaskId = screenshotTask?.data?.task_id ?? null;
  const browserPreset = screenshotTask?.data?.browser_preset ?? null;
  if (!screenshotTaskId || screenshotOriginalTaskId !== capture.taskId) issues.push("screenshot_task_join_failed");
  if (screenshotEnvelope?.status_code !== 20000 || screenshotTask?.status_code !== 20000) issues.push("screenshot_envelope_not_successful");
  if (!exactObject(screenshotTask?.data, { api: "serp", function: "screenshot", task_id: capture.taskId, browser_preset: capture.device })) {
    issues.push("screenshot_settings_mismatch");
  }
  const screenshotMimeType = imageType(verified.screenshot.bytes);
  if (screenshotMimeType !== "image/png" || (capture.screenshotContentType && capture.screenshotContentType !== screenshotMimeType)) {
    issues.push("screenshot_content_type_or_signature_mismatch");
  }
  const screenshotImageUrl = screenshotTask?.result?.[0]?.items?.[0]?.image;
  try {
    const parsed = new URL(screenshotImageUrl);
    if (parsed.protocol !== "https:" || parsed.hostname !== "api.dataforseo.com" || !parsed.pathname.startsWith("/cdn/s/")) throw new Error();
  } catch { issues.push("screenshot_provider_image_url_invalid"); }

  const mainAioItems = (Array.isArray(result?.items) ? result.items : []).filter(item => item?.type === "ai_overview");
  if (mainAioItems.length > 1) issues.push("multiple_first_level_main_aio_items_requires_systemic_review");
  const mainAio = mainAioItems.length === 1 ? mainAioItems[0] : null;
  if (normalized && capture.aio && !same(normalized, capture.aio)) issues.push("normalized_manifest_aio_join_failed");
  const htmlReview = htmlAnalysis(html, mainAio);
  if (mainAio && htmlReview.xpathMatchCount !== 1) issues.push("main_aio_xpath_not_unique");
  const references = mainReferences(
    mainAio,
    htmlReview.decodedSubtree,
    htmlReview.$,
    htmlReview.node,
    capture.tag,
    issues,
    classifyReferenceDestination,
  );
  const normalizedUrls = exactSet((normalized?.references ?? []).map(reference => reference.referenceUrl ?? reference.raw?.url).filter(Boolean));
  if (normalized && !same(normalizedUrls, exactSet(references.map(reference => reference.url)))) issues.push("normalized_main_reference_join_failed");

  const report = {
    schemaVersion: "1.0.0",
    artifactType: "aio-citation-wave-capture-evidence-scaffold",
    index,
    tag: capture.tag ?? null,
    queryId: capture.queryId ?? null,
    query: capture.keyword ?? null,
    sector: { id: capture.sectorId ?? null, label: capture.sectorLabel ?? null },
    intent: capture.intent ?? null,
    device: capture.device ?? null,
    taskId: capture.taskId ?? null,
    request: capture.request ?? null,
    providerObservation: {
      resultReturned: Boolean(result),
      timestamp: providerTimestamp,
      firstLevelMainAioCount: mainAioItems.length,
      firstLevelMainAioDetected: mainAioItems.length > 0,
      mainAioBodyReturned: typeof mainAio?.markdown === "string" && mainAio.markdown.trim().length > 0,
      mainReferenceArrayState: referenceFieldState(mainAio),
      manifestAutomaticState: capture.state ?? null,
    },
    htmlEvidence: {
      providerXpath: htmlReview.providerXpath,
      xpathMatchCount: htmlReview.xpathMatchCount,
      bodyProbeSha256: htmlReview.bodyProbeSha256,
      bodyProbeLength: htmlReview.bodyProbeLength,
      bodyProbeMatched: htmlReview.bodyProbeMatched,
      literalAiOverviewLabelInSubtree: htmlReview.literalAiOverviewLabelInSubtree,
      allResultsTextInDocument: htmlReview.allResultsTextInDocument,
    },
    screenshotEvidence: {
      screenshotTaskId,
      screenshotOriginalTaskId,
      browserPreset,
      screenshotSha256: verified.screenshot.public.actualSha256 ?? null,
      screenshotMimeType,
    },
    mainStructuredReferences: references,
    answerLinks: answerLinks(mainAio),
    embeddedAio: embeddedAio(result),
    fileIntegrity,
    automaticChecksPass: issues.length === 0,
    issues: [...new Set(issues)].sort(),
    reviewerObservation: {
      reviewState: "pending",
      visibleLiteralAiOverviewHeading: null,
      renderedBodyMatchesProviderMain: null,
      allResultsTabSelected: null,
      absenceReviewComplete: null,
      referenceSetCompletenessReviewed: null,
      referenceSetState: null,
      featureState: null,
      exclusionReason: null,
      collectionEvidenceComplete: null,
    },
  };
  return report;
}

function timingSummary(captures, submittedAt) {
  const returned = captures.filter(capture => capture.providerObservation.resultReturned);
  const times = returned.map(capture => timestamp(capture.providerObservation.timestamp));
  const valid = times.filter(value => value !== null);
  const submitted = timestamp(submittedAt);
  const minimum = valid.length ? Math.min(...valid) : null;
  const maximum = valid.length ? Math.max(...valid) : null;
  return {
    submittedAt: submittedAt ?? null,
    plannedCaptureCount: captures.length,
    providerResultReturnedCount: returned.length,
    validProviderTimestampCount: valid.length,
    fullReturnedTimestampPopulationValid: valid.length === returned.length,
    minimumProviderTimestamp: minimum === null ? null : new Date(minimum).toISOString(),
    maximumProviderTimestamp: maximum === null ? null : new Date(maximum).toISOString(),
    providerTimestampSpanMilliseconds: minimum === null ? null : maximum - minimum,
    allReturnedWithinSubmissionPlus60Minutes: submitted !== null && valid.length === returned.length
      && valid.every(value => value >= submitted && value <= submitted + 60 * 60_000),
  };
}

export async function buildWaveReview(runDirectory, reviewDirectory) {
  const runDir = path.resolve(runDirectory);
  const reviewDir = path.resolve(reviewDirectory);
  if (runDir === reviewDir || inside(runDir, reviewDir)) fail("review directory must be outside the immutable run directory");
  await access(path.join(runDir, "run-manifest.json"), constants.R_OK).catch(() => fail("run manifest is unavailable"));
  try {
    const entries = await readdir(reviewDir);
    if (entries.length) fail("review directory must be new or empty");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const manifestRead = await readJson(path.join(runDir, "run-manifest.json"), "run manifest");
  const manifest = manifestRead.value;
  if (!Array.isArray(manifest.captures) || manifest.captures.length !== 100) fail("manifest must preserve all 100 planned captures");
  const frozen = await frozenContext();
  const submission = await submissionEvidence(runDir, manifest);
  const expected = panelCaptures(frozen.panel);
  if (expected.length !== 100) fail("frozen panel does not expand to 100 captures");

  const registrationMatches = same(manifest.registration, frozen.freeze.registration);
  const panelSha256 = frozen.freeze.artifacts.panel.sha256;
  const reports = [];
  for (const [index, capture] of manifest.captures.entries()) {
    reports.push(await captureReport(capture, index, expected[index], runDir, frozen.classifyReferenceDestination));
  }
  const tags = reports.map(report => report.tag);
  const taskIds = reports.map(report => report.taskId).filter(Boolean);
  const screenshotIds = reports.map(report => report.screenshotEvidence.screenshotTaskId).filter(Boolean);
  const topIssues = [];
  if (!registrationMatches) topIssues.push("run_registration_differs_from_frozen_registration");
  if (manifest.inputSha256 !== panelSha256) topIssues.push("run_panel_hash_differs_from_frozen_panel");
  if (!same(tags, expected.map(capture => capture.tag)) || new Set(tags).size !== 100) topIssues.push("capture_order_or_tag_set_differs_from_frozen_panel");
  if (taskIds.length !== 100 || new Set(taskIds).size !== 100) topIssues.push("original_task_ids_missing_or_reused");
  if (screenshotIds.length !== 100 || new Set(screenshotIds).size !== 100) topIssues.push("screenshot_operation_ids_missing_or_reused");
  if (!submission.receiptMatchesManifestAndRequestBody) topIssues.push("pre_post_receipt_or_request_body_join_failed");
  if (!submission.taskPostEnvelopeSuccessful || !submission.taskPostRequestRowsMatchManifestRequests) topIssues.push("task_post_envelope_or_request_join_failed");
  if (!submission.tagTaskIdBijectionPass) topIssues.push("task_post_received_manifest_tag_task_bijection_failed");
  const timing = timingSummary(reports, manifest.submittedAt);
  if (!timing.fullReturnedTimestampPopulationValid) topIssues.push("returned_timestamp_population_incomplete_or_invalid");
  if (timing.providerResultReturnedCount !== 100) topIssues.push("not_all_planned_provider_results_returned");
  if (timestamp(manifest.submittedAt) === null) topIssues.push("missing_actual_submission_timestamp");
  if (timing.providerTimestampSpanMilliseconds === null || timing.providerTimestampSpanMilliseconds > 30 * 60_000) topIssues.push("provider_timestamp_span_exceeds_30_minutes");
  if (!timing.allReturnedWithinSubmissionPlus60Minutes) topIssues.push("provider_timestamps_outside_submission_window");

  const indexReport = {
    schemaVersion: "1.0.0",
    artifactType: "aio-citation-wave-evidence-review-scaffold",
    runId: manifest.runId ?? null,
    waveId: manifest.waveId ?? null,
    sourceRunDirectory: relativeRepo(runDir),
    manifest: { path: relativeRepo(path.join(runDir, "run-manifest.json")), sha256: sha256(manifestRead.bytes), bytes: manifestRead.bytes.length },
    frozenRegistration: {
      panelSha256,
      registration: frozen.freeze.registration,
      registrationMatches,
      freezeManifest: frozen.freezeManifest,
      artifacts: frozen.verifiedArtifacts,
    },
    submissionEvidence: submission,
    timing,
    automaticEvidenceSummary: {
      captures: reports.length,
      automaticChecksPassed: reports.filter(report => report.automaticChecksPass).length,
      automaticChecksFailed: reports.filter(report => !report.automaticChecksPass).length,
      firstLevelMainAioDetected: reports.filter(report => report.providerObservation.firstLevelMainAioDetected).length,
      reviewerObservationsPending: reports.filter(report => report.reviewerObservation.reviewState === "pending").length,
      topIssues,
      captureIssueTags: reports.filter(report => report.issues.length).map(report => ({ tag: report.tag, issues: report.issues })),
    },
    methodBoundary: "Offline mechanical evidence scaffold only. Automatic provider/HTML signals do not establish visual identity, reviewed absence, reference-set completeness, a final feature state, wave eligibility, or release approval.",
    captureReports: reports.map(report => ({ tag: report.tag, path: `captures/${report.tag}.json`, sha256: null })),
  };
  const opaque = reports.flatMap(report => report.mainStructuredReferences
    .filter(reference => reference.originalHtmlEvidenceState !== "exact_original_html")
    .map(reference => ({
      tag: report.tag,
      taskId: report.taskId,
      expectedDestination: reference.url,
      referenceClass: reference.referenceClass,
      originalHtmlEvidenceState: reference.originalHtmlEvidenceState,
      candidates: reference.opaqueRedirectCandidates,
      laterRedirectEvidence: null,
    })));
  const observations = {
    schemaVersion: "1.0.0",
    artifactType: "aio-citation-wave-reviewer-observations-template",
    runId: manifest.runId ?? null,
    instructions: "Populate only after direct full-resolution screenshot/HTML/source review. Preserve null for unreviewed fields; do not infer absence from an automatic state.",
    captures: Object.fromEntries(reports.map(report => [report.tag, {
      expectedScreenshotSha256: report.screenshotEvidence.screenshotSha256,
      reviewedAt: null,
      inspectionArtifact: null,
      ...report.reviewerObservation,
    }])),
  };

  await mkdir(path.join(reviewDir, "captures"), { recursive: true });
  for (const report of reports) {
    const bytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8");
    await writeFile(path.join(reviewDir, "captures", `${report.tag}.json`), bytes);
    indexReport.captureReports.find(record => record.tag === report.tag).sha256 = sha256(bytes);
  }
  await writeFile(path.join(reviewDir, "opaque-redirect-candidates.json"), `${JSON.stringify({
    schemaVersion: "1.0.0",
    artifactType: "aio-citation-wave-opaque-redirect-candidates",
    runId: manifest.runId ?? null,
    methodBoundary: "Candidates are captured links from the uniquely matched saved main-AIO subtree. They are unresolved and no redirect or destination request was made.",
    references: opaque,
  }, null, 2)}\n`, "utf8");
  await writeFile(path.join(reviewDir, "reviewer-observations.template.json"), `${JSON.stringify(observations, null, 2)}\n`, "utf8");
  await writeFile(path.join(reviewDir, "wave-evidence-review.json"), `${JSON.stringify(indexReport, null, 2)}\n`, "utf8");
  return { reviewDir, report: indexReport, opaqueReferenceCount: opaque.length };
}

async function main() {
  const [runDirectory, reviewDirectory] = process.argv.slice(2);
  if (!runDirectory || !reviewDirectory || ["--help", "-h"].includes(runDirectory)) {
    console.error("Usage: node scripts/research/aio-citation-wave-review.mjs <run-directory> <new-or-empty-review-directory>");
    process.exitCode = runDirectory ? 0 : 2;
    return;
  }
  const result = await buildWaveReview(runDirectory, reviewDirectory);
  console.log(JSON.stringify({
    reviewDirectory: relativeRepo(result.reviewDir),
    captures: result.report.automaticEvidenceSummary.captures,
    automaticChecksFailed: result.report.automaticEvidenceSummary.automaticChecksFailed,
    reviewerObservationsPending: result.report.automaticEvidenceSummary.reviewerObservationsPending,
    opaqueReferenceCount: result.opaqueReferenceCount,
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
