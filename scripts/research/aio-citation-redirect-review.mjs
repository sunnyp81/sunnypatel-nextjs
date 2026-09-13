#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const GOOGLE_GOTO_HOSTS = new Set(["google.com", "www.google.com", "google.co.uk", "www.google.co.uk"]);
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_HOPS = 4;
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;

const sha256 = value => createHash("sha256").update(value).digest("hex");
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const toPosix = value => value.split(path.sep).join("/");
const relativeRepo = value => toPosix(path.relative(REPOSITORY_ROOT, value));

function fail(message) {
  throw new Error(`Redirect review refused: ${message}`);
}

async function readJson(file, label) {
  let bytes;
  try { bytes = await readFile(file); } catch { fail(`${label} could not be read`); }
  try { return { value: JSON.parse(bytes.toString("utf8")), bytes }; } catch { fail(`${label} is not valid UTF-8 JSON`); }
}

function safeRepositoryPath(file) {
  const absolute = path.resolve(REPOSITORY_ROOT, file);
  const relative = path.relative(REPOSITORY_ROOT, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`path escapes repository: ${file}`);
  return absolute;
}

export function allowedGotoUrl(value, base = "https://google.co.uk") {
  let parsed;
  try { parsed = new URL(value, base); } catch { return null; }
  return parsed.protocol === "https:" && !parsed.username && !parsed.password && !parsed.port
    && GOOGLE_GOTO_HOSTS.has(parsed.hostname) && parsed.pathname === "/goto"
    ? parsed : null;
}

async function cancelBody(response) {
  try { await response.body?.cancel(); } catch { /* The response headers remain valid evidence. */ }
}

export async function resolveGotoCandidate(candidate, expectedDestination, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const globalSignal = options.signal;
  const observations = [];
  let current = allowedGotoUrl(candidate);
  if (!current) return { state: "invalid_saved_google_goto_candidate", exactMatch: false, observations };
  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    if (globalSignal?.aborted) return { state: "stopped_global", exactMatch: false, observations };
    const requestedAt = new Date().toISOString();
    let response;
    try {
      const timeout = AbortSignal.timeout(TIMEOUT_MS);
      const signal = globalSignal ? AbortSignal.any([globalSignal, timeout]) : timeout;
      response = await fetchImpl(current.href, { redirect: "manual", signal });
    } catch (error) {
      return {
        state: globalSignal?.aborted ? "stopped_global" : "request_error",
        exactMatch: false,
        observations: [...observations, { requestedUrl: current.href, requestedAt, failedAt: new Date().toISOString(), errorName: error.name }],
      };
    }
    const receivedAt = new Date().toISOString();
    const location = response.headers.get("location");
    observations.push({ requestedUrl: current.href, requestedAt, receivedAt, status: response.status, location });
    await cancelBody(response);
    if (response.status === 403 || response.status === 429) {
      options.onAccessDenied?.(response.status);
      return { state: "stopped_access_denied", accessDeniedStatus: response.status, exactMatch: false, observations };
    }
    if (!location) return { state: "no_location", exactMatch: false, observations };
    if (!REDIRECT_STATUSES.has(response.status)) {
      return { state: "non_redirect_status_with_location", exactMatch: false, observations };
    }
    let next;
    try { next = new URL(location, current); } catch {
      return { state: "invalid_redirect_location", exactMatch: false, observations };
    }
    const nextGoto = allowedGotoUrl(next.href);
    if (nextGoto) {
      current = nextGoto;
      continue;
    }
    return {
      state: next.href === expectedDestination ? "exact_destination_returned" : "destination_mismatch",
      destination: next.href,
      rawLocation: location,
      exactMatch: next.href === expectedDestination,
      observations,
    };
  }
  return { state: "google_goto_hop_limit", exactMatch: false, observations };
}

async function loadAndVerifyInput(inputFile) {
  const inputRead = await readJson(inputFile, "candidate input");
  const input = inputRead.value;
  if (input.artifactType !== "aio-citation-wave-opaque-redirect-candidates" || !Array.isArray(input.references)) {
    fail("input is not an opaque redirect candidate artifact");
  }
  const reviewDir = path.dirname(inputFile);
  const indexFile = path.join(reviewDir, "wave-evidence-review.json");
  const indexRead = await readJson(indexFile, "wave evidence index");
  const index = indexRead.value;
  if (index.runId !== input.runId || !Array.isArray(index.captureReports) || index.captureReports.length !== 100) {
    fail("candidate input and wave evidence index do not join");
  }
  const indexByTag = new Map(index.captureReports.map(record => [record.tag, record]));
  const rows = [];
  const rowKeys = new Set();
  for (const reference of input.references) {
    const rowKey = `${reference.tag}\u0000${reference.taskId}\u0000${reference.expectedDestination}`;
    if (rowKeys.has(rowKey)) fail(`duplicate tag/task/URL row: ${reference.tag}`);
    rowKeys.add(rowKey);
    const reportRecord = indexByTag.get(reference.tag);
    if (!reportRecord?.path || !reportRecord.sha256) fail(`capture report index missing for ${reference.tag}`);
    const reportFile = path.resolve(reviewDir, reportRecord.path);
    const relative = path.relative(reviewDir, reportFile);
    if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`capture report path escapes review directory: ${reference.tag}`);
    const reportRead = await readJson(reportFile, `capture report ${reference.tag}`);
    if (sha256(reportRead.bytes) !== reportRecord.sha256) fail(`capture report hash mismatch: ${reference.tag}`);
    const report = reportRead.value;
    if (report.tag !== reference.tag || report.taskId !== reference.taskId) fail(`capture tag/task join mismatch: ${reference.tag}`);
    const sourceReference = report.mainStructuredReferences?.find(item => item.url === reference.expectedDestination);
    if (!sourceReference || sourceReference.originalHtmlEvidenceState === "exact_original_html") {
      fail(`candidate URL does not join an unresolved capture reference: ${reference.tag}`);
    }
    if (sourceReference.referenceClass !== reference.referenceClass
      || !same(sourceReference.opaqueRedirectCandidates, reference.candidates)) {
      fail(`candidate reference metadata differs from capture report: ${reference.tag}`);
    }
    const htmlRecord = report.fileIntegrity?.html;
    if (htmlRecord?.state !== "verified" || !htmlRecord.path || !htmlRecord.actualSha256) fail(`verified HTML provenance missing: ${reference.tag}`);
    const htmlFile = safeRepositoryPath(htmlRecord.path);
    const htmlBytes = await readFile(htmlFile);
    if (sha256(htmlBytes) !== htmlRecord.actualSha256 || htmlBytes.length !== htmlRecord.actualBytes) {
      fail(`saved capture HTML changed after scaffold: ${reference.tag}`);
    }
    const candidates = reference.candidates ?? [];
    for (const candidate of candidates) {
      if (!allowedGotoUrl(candidate.href)) fail(`non-allowlisted saved candidate: ${reference.tag}`);
    }
    rows.push({
      tag: reference.tag,
      taskId: reference.taskId,
      expectedDestination: reference.expectedDestination,
      referenceClass: reference.referenceClass,
      candidates,
      provenance: {
        captureReport: { path: relativeRepo(reportFile), sha256: reportRecord.sha256 },
        captureHtml: { path: htmlRecord.path, sha256: htmlRecord.actualSha256, bytes: htmlRecord.actualBytes },
      },
    });
  }
  return {
    input,
    rows,
    sources: {
      candidateInput: { path: relativeRepo(inputFile), sha256: sha256(inputRead.bytes), bytes: inputRead.bytes.length },
      waveEvidenceIndex: { path: relativeRepo(indexFile), sha256: sha256(indexRead.bytes), bytes: indexRead.bytes.length },
    },
  };
}

export async function reviewRedirectCandidates(inputPath, outputPath, options = {}) {
  const inputFile = path.resolve(inputPath);
  const outputFile = path.resolve(outputPath);
  if (inputFile === outputFile) fail("output must differ from input");
  try { await readFile(outputFile); fail("output already exists"); } catch (error) {
    if (!String(error.message).includes("output already exists") && error?.code !== "ENOENT") throw error;
    if (String(error.message).includes("output already exists")) throw error;
  }
  const loaded = await loadAndVerifyInput(inputFile);
  const controller = new AbortController();
  let stopped = false;
  let accessDeniedStatus = null;
  const requestCache = new Map();
  const results = new Array(loaded.rows.length);
  let cursor = 0;

  const resolve = href => {
    if (!requestCache.has(href)) requestCache.set(href, resolveGotoCandidate(href, null, {
      fetchImpl: options.fetchImpl,
      signal: controller.signal,
      onAccessDenied(status) {
        stopped = true;
        accessDeniedStatus = status;
        controller.abort();
      },
    }));
    return requestCache.get(href);
  };

  async function worker() {
    while (cursor < loaded.rows.length) {
      const index = cursor;
      cursor += 1;
      const row = loaded.rows[index];
      if (stopped) {
        results[index] = { ...row, finalDestinationEvidenceState: "unresolved", state: "not_attempted_after_global_stop", attempts: [] };
        continue;
      }
      const attempts = [];
      let exact = null;
      for (const candidate of row.candidates) {
        if (stopped) break;
        const rawResult = await resolve(candidate.href);
        const exactMatch = rawResult.destination === row.expectedDestination;
        const result = rawResult.destination ? {
          ...rawResult,
          state: exactMatch ? "exact_destination_returned" : "destination_mismatch",
          exactMatch,
        } : rawResult;
        attempts.push({ capturedHref: candidate.href, capturedIdentity: candidate.visibleIdentity ?? null, ...result });
        if (result.exactMatch) {
          exact = result;
          break;
        }
      }
      results[index] = {
        ...row,
        finalDestinationEvidenceState: exact ? "exact_later_redirect" : "unresolved",
        state: exact ? "exact_destination_returned" : stopped ? "stopped_before_resolution" : row.candidates.length ? "unresolved_after_candidates" : "no_saved_candidate",
        exactDestination: exact?.destination ?? null,
        attempts,
      };
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const unresolved = results.filter(result => result.finalDestinationEvidenceState === "unresolved");
  const output = {
    schemaVersion: "1.0.0",
    artifactType: "aio-citation-wave-redirect-review",
    runId: loaded.input.runId,
    method: "Read-only manual-redirect inspection of saved allowlisted Google /goto URLs. External destination pages were not fetched.",
    controls: {
      allowedRequestProtocol: "https",
      allowedRequestHosts: [...GOOGLE_GOTO_HOSTS].sort(),
      allowedRequestPath: "/goto",
      redirectMode: "manual",
      maximumGoogleGotoHops: MAX_HOPS,
      timeoutMilliseconds: TIMEOUT_MS,
      concurrency: CONCURRENCY,
      stopAllStatuses: [403, 429],
      destinationComparison: "byte-exact resolved Location URL string",
      carryForwardEvidence: false,
    },
    sources: loaded.sources,
    stopped,
    accessDeniedStatus,
    summary: {
      inputReferences: results.length,
      exactLaterRedirectReferences: results.length - unresolved.length,
      unresolvedReferences: unresolved.length,
      capturesWithUnresolvedReferences: new Set(unresolved.map(result => result.tag)).size,
      unresolvedCaptureTags: [...new Set(unresolved.map(result => result.tag))].sort(),
      uniqueNetworkRequestKeys: requestCache.size,
    },
    results,
  };
  await writeFile(outputFile, `${JSON.stringify(output, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return { outputFile, output };
}

async function main() {
  const [inputFile, outputFile] = process.argv.slice(2);
  if (!inputFile || !outputFile || ["--help", "-h"].includes(inputFile)) {
    console.error("Usage: node scripts/research/aio-citation-redirect-review.mjs <opaque-candidates.json> <new-output.json>");
    process.exitCode = inputFile ? 0 : 2;
    return;
  }
  const { output } = await reviewRedirectCandidates(inputFile, outputFile);
  console.log(JSON.stringify({ outputFile, summary: output.summary, stopped: output.stopped }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
