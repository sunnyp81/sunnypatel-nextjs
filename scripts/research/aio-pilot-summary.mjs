#!/usr/bin/env node

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { normalizeAdvanced } from "./aio-pilot.mjs";

export const SCHEMA_VERSION = "1.0.0";

const MAIN_AIO_TYPES = new Set(["ai_overview", "ai_overview_element", "ai_overview_reference"]);
const GOOGLE_PRODUCT_VIEW_HOSTS = new Set(["google.com", "www.google.com", "google.co.uk", "www.google.co.uk"]);
const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function relativeFromRepository(file) {
  return toPosix(path.relative(REPOSITORY_ROOT, file));
}

async function readJsonWithBytes(file) {
  const bytes = await fs.readFile(file);
  return { value: JSON.parse(bytes.toString("utf8")), bytes };
}

function walk(value, visit) {
  if (Array.isArray(value)) {
    for (const child of value) walk(child, visit);
    return;
  }
  if (!value || typeof value !== "object") return;
  visit(value);
  for (const child of Object.values(value)) walk(child, visit);
}

export function classifyReferenceDestination(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const isProductView = (
      GOOGLE_PRODUCT_VIEW_HOSTS.has(parsed.hostname.toLowerCase()) &&
      parsed.pathname === "/search" &&
      (parsed.searchParams.get("q") === "product" || parsed.searchParams.get("ibp")?.split(",").includes("oshop"))
    );
    return isProductView ? "google_product_view" : "external_destination";
  } catch {
    return "external_destination";
  }
}

function mainAioItem(result) {
  return (Array.isArray(result?.items) ? result.items : []).find(
    (item) => item && typeof item === "object" && item.type === "ai_overview",
  ) ?? null;
}

function mainReferences(aio, organicResults) {
  if (!aio) return [];
  const seen = new Set();
  const references = [];
  walk(aio, (item) => {
    if (item.type !== "ai_overview_reference" || typeof item.url !== "string" || seen.has(item.url)) return;
    seen.add(item.url);
    const organicByteExactMatches = organicResults
      .filter((organic) => organic.url === item.url)
      .map((organic) => ({ rankGroup: organic.rankGroup, rankAbsolute: organic.rankAbsolute }));
    references.push({
      url: item.url,
      destinationClass: classifyReferenceDestination(item.url),
      byteExactOrganicOverlap: organicByteExactMatches.length > 0,
      organicByteExactMatches,
    });
  });
  return references;
}

function organicResults(result) {
  return (Array.isArray(result?.items) ? result.items : [])
    .filter((item) => item?.type === "organic" && typeof item.url === "string")
    .map((item) => ({
      url: item.url,
      rankGroup: item.rank_group ?? null,
      rankAbsolute: item.rank_absolute ?? null,
    }));
}

export function summarizeEmbeddedAio(result) {
  const placeholdersByType = {};
  const nonPlaceholdersByType = {};
  walk(result, (item) => {
    if (
      typeof item.type !== "string" ||
      !item.type.includes("ai_overview") ||
      MAIN_AIO_TYPES.has(item.type)
    ) return;
    const isPlaceholder =
      item.asynchronous_ai_overview === true &&
      item.items === null &&
      item.references === null;
    const collection = isPlaceholder ? placeholdersByType : nonPlaceholdersByType;
    collection[item.type] = (collection[item.type] ?? 0) + 1;
  });
  const sortObject = (value) => Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
  const placeholderCount = Object.values(placeholdersByType).reduce((total, count) => total + count, 0);
  const nonPlaceholderCount = Object.values(nonPlaceholdersByType).reduce((total, count) => total + count, 0);
  return {
    embeddedNodeCount: placeholderCount + nonPlaceholderCount,
    count: placeholderCount,
    types: Object.keys(placeholdersByType).sort(),
    byType: sortObject(placeholdersByType),
    nonPlaceholderCount,
    nonPlaceholderTypes: Object.keys(nonPlaceholdersByType).sort(),
    nonPlaceholdersByType: sortObject(nonPlaceholdersByType),
  };
}

function parsedTimestamp(value) {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function pairedTimestampSummary(captures) {
  const byQuery = new Map();
  for (const capture of captures) {
    if (!byQuery.has(capture.queryId)) byQuery.set(capture.queryId, {});
    byQuery.get(capture.queryId)[capture.device] = capture;
  }
  const pairs = [];
  for (const [queryId, devices] of byQuery) {
    const desktopMs = parsedTimestamp(devices.desktop?.provider.resultDatetime);
    const mobileMs = parsedTimestamp(devices.mobile?.provider.resultDatetime);
    if (desktopMs === null || mobileMs === null) continue;
    pairs.push({
      queryId,
      desktopTag: devices.desktop.tag,
      mobileTag: devices.mobile.tag,
      gapMilliseconds: Math.abs(desktopMs - mobileMs),
    });
  }
  pairs.sort((left, right) => right.gapMilliseconds - left.gapMilliseconds || left.queryId.localeCompare(right.queryId));
  const maximum = pairs[0] ?? null;
  return {
    pairedQueryCount: pairs.length,
    maxPairedTimestampGapMilliseconds: maximum?.gapMilliseconds ?? null,
    maxPairedTimestampGapSeconds: maximum === null ? null : maximum.gapMilliseconds / 1000,
    maxGapPair: maximum,
  };
}

export async function buildPilotSummary(runDirectoryInput, options = {}) {
  const runDirectory = path.resolve(runDirectoryInput);
  const manifestFile = path.join(runDirectory, "run-manifest.json");
  const manifestRead = await readJsonWithBytes(manifestFile);
  const manifest = manifestRead.value;
  if (!Array.isArray(manifest.captures) || manifest.captures.length !== 100) {
    throw new Error(`Expected exactly 100 manifest captures; found ${manifest.captures?.length ?? "none"}.`);
  }

  const captures = [];
  const advancedSources = [];
  for (const [index, manifestCapture] of manifest.captures.entries()) {
    const recorded = manifestCapture.files?.advancedEnvelope;
    if (!recorded?.path) throw new Error(`Capture ${manifestCapture.tag ?? index} has no Advanced envelope path.`);
    const advancedFile = path.resolve(runDirectory, recorded.path);
    if (advancedFile !== runDirectory && !advancedFile.startsWith(`${runDirectory}${path.sep}`)) {
      throw new Error(`Capture ${manifestCapture.tag ?? index} points outside the run directory.`);
    }
    const advancedRead = await readJsonWithBytes(advancedFile);
    const advanced = advancedRead.value;
    const task = Array.isArray(advanced.tasks) ? advanced.tasks[0] : null;
    const result = Array.isArray(task?.result) ? task.result[0] : null;
    if (!task || !result) throw new Error(`Capture ${manifestCapture.tag} has no returned Advanced result.`);
    if (task.id !== manifestCapture.taskId) {
      throw new Error(`Capture ${manifestCapture.tag} task ID differs between manifest and Advanced evidence.`);
    }
    const actualHash = sha256(advancedRead.bytes);
    if (recorded.sha256 !== actualHash) {
      throw new Error(`Capture ${manifestCapture.tag} Advanced evidence hash differs from the manifest.`);
    }
    const organic = organicResults(result);
    const aio = mainAioItem(result);
    const normalized = normalizeAdvanced(advanced);
    const references = mainReferences(aio, organic);
    captures.push({
      index,
      tag: manifestCapture.tag,
      queryId: manifestCapture.queryId,
      sector: { id: manifestCapture.sectorId, label: manifestCapture.sectorLabel },
      intent: manifestCapture.intent,
      query: manifestCapture.keyword,
      device: manifestCapture.device,
      os: manifestCapture.request?.os ?? task.data?.os ?? null,
      taskId: manifestCapture.taskId,
      provider: {
        envelopeStatusCode: advanced.status_code ?? null,
        taskStatusCode: task.status_code ?? null,
        resultDatetime: result.datetime ?? null,
        mainFeatureState: normalized.aioState,
      },
      embeddedPlaceholders: summarizeEmbeddedAio(result),
      mainStructuredReferences: references,
      organicResults: organic,
    });
    advancedSources.push({
      tag: manifestCapture.tag,
      path: relativeFromRepository(advancedFile),
      sha256: actualHash,
      bytes: advancedRead.bytes.byteLength,
      manifestRecordedSha256: recorded.sha256,
      hashMatchesManifest: true,
    });
  }

  const allReferences = captures.flatMap((capture) => capture.mainStructuredReferences);
  const allOrganic = captures.flatMap((capture) => capture.organicResults);
  const mainFeatureStates = {};
  for (const capture of captures) {
    const state = capture.provider.mainFeatureState;
    mainFeatureStates[state] = (mainFeatureStates[state] ?? 0) + 1;
  }
  const pairedTimestamps = pairedTimestampSummary(captures);
  const summary = {
    schemaVersion: SCHEMA_VERSION,
    artifactType: "aio-pilot-full-wave-data-summary",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    runId: manifest.runId,
    scopeNote: "Settled 100-capture methods-pilot data export; no prevalence, sector, ranking-causation, or outside-returned-results inference.",
    urlPolicy: {
      preservation: "URLs are copied byte-for-byte from saved Advanced envelopes; no canonicalisation or redirect resolution.",
      overlap: "A main structured reference overlaps an organic result only when the URL strings are byte-for-byte equal within the same capture.",
      productView: "A reference is google_product_view only when its saved URL is a Google /search URL with q=product or ibp containing oshop.",
    },
    counts: {
      captures: captures.length,
      queries: new Set(captures.map((capture) => capture.queryId)).size,
      devices: Object.fromEntries(
        [...new Set(captures.map((capture) => capture.device))].sort().map((device) => [
          device,
          captures.filter((capture) => capture.device === device).length,
        ]),
      ),
      mainFeatureStates: Object.fromEntries(Object.entries(mainFeatureStates).sort(([left], [right]) => left.localeCompare(right))),
      embeddedAioNodes: captures.reduce((total, capture) => total + capture.embeddedPlaceholders.embeddedNodeCount, 0),
      embeddedPlaceholderNodes: captures.reduce((total, capture) => total + capture.embeddedPlaceholders.count, 0),
      embeddedNonPlaceholderNodes: captures.reduce(
        (total, capture) => total + capture.embeddedPlaceholders.nonPlaceholderCount,
        0,
      ),
      capturesWithEmbeddedAio: captures.filter((capture) => capture.embeddedPlaceholders.embeddedNodeCount > 0).length,
      capturesWithEmbeddedPlaceholders: captures.filter((capture) => capture.embeddedPlaceholders.count > 0).length,
      capturesWithEmbeddedNonPlaceholders: captures.filter(
        (capture) => capture.embeddedPlaceholders.nonPlaceholderCount > 0,
      ).length,
      mainStructuredReferenceUrlsWithinCapture: allReferences.length,
      externalDestinationReferences: allReferences.filter((reference) => reference.destinationClass === "external_destination").length,
      googleProductViewReferences: allReferences.filter((reference) => reference.destinationClass === "google_product_view").length,
      referencesWithByteExactOrganicOverlap: allReferences.filter((reference) => reference.byteExactOrganicOverlap).length,
      returnedOrganicUrlRecords: allOrganic.length,
    },
    pairedTimestamps,
    rawSourceFileHashes: {
      runManifest: {
        path: relativeFromRepository(manifestFile),
        sha256: sha256(manifestRead.bytes),
        bytes: manifestRead.bytes.byteLength,
      },
      advancedEnvelopes: advancedSources,
    },
    captures,
  };

  const outputFile = path.resolve(options.outputFile ?? path.join(runDirectory, "full-wave-data-summary.json"));
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  return { summary, outputFile };
}

async function main() {
  const [runDirectory, outputFile] = process.argv.slice(2);
  if (!runDirectory || runDirectory === "--help" || runDirectory === "-h") {
    console.error("Usage: node scripts/research/aio-pilot-summary.mjs <run-directory> [output-file]");
    process.exitCode = runDirectory ? 0 : 2;
    return;
  }
  const { summary, outputFile: written } = await buildPilotSummary(runDirectory, { outputFile });
  console.log(JSON.stringify({
    outputFile: written,
    captures: summary.counts.captures,
    mainFeatureStates: summary.counts.mainFeatureStates,
    maxPairedTimestampGapSeconds: summary.pairedTimestamps.maxPairedTimestampGapSeconds,
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
