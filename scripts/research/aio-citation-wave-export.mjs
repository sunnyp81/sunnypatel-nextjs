#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FROZEN_SUMMARY_PATH = "tmp/ctr-aio/citation-study/frozen-v1/aio-pilot-summary.mjs";
const FEATURE_STATES = new Set(["confirmed_main_aio", "ambiguous_main_generated", "main_absent", "missing", "invalid"]);
const REFERENCE_SET_STATES = new Set(["known", "known_empty", "unknown"]);
const COMPLETENESS_STATES = new Map([
  ["known_complete_nonempty", "known"],
  ["known_complete_empty_main_absent", "known_empty"],
  ["unknown_null", "unknown"],
]);
const EXACT_EVIDENCE = new Set(["exact_original_html", "exact_later_redirect"]);
const OFFSET_TIMESTAMP = /(?:Z|[+-]\d{2}:\d{2})$/;

const sha256 = value => createHash("sha256").update(value).digest("hex");
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const exactSet = values => [...new Set(values)].sort();
const timestamp = value => typeof value === "string" && OFFSET_TIMESTAMP.test(value) && Number.isFinite(Date.parse(value))
  ? Date.parse(value) : null;
const repoPath = (absolute, label) => {
  const relative = path.relative(REPOSITORY_ROOT, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`${label} is outside the repository`);
  return relative.split(path.sep).join("/");
};

function fail(message) {
  throw new Error(`Reviewed wave export refused: ${message}`);
}

async function bytesSource(file, label) {
  const absolute = path.resolve(file);
  repoPath(absolute, label);
  let bytes;
  try { bytes = await readFile(absolute); } catch { fail(`${label} could not be read`); }
  return { absolute, bytes, sha256: sha256(bytes) };
}

async function source(file, label) {
  const loaded = await bytesSource(file, label);
  let value;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(loaded.bytes)); }
  catch { fail(`${label} is not valid UTF-8 JSON`); }
  return { ...loaded, value };
}

function mapUnique(rows, key, label) {
  const output = new Map();
  for (const row of rows ?? []) {
    const value = row?.[key];
    if (typeof value !== "string" || !value || output.has(value)) fail(`${label} has a duplicate/missing ${key}`);
    output.set(value, row);
  }
  return output;
}

function assertReviewHashes(ack, hashes) {
  if (ack.artifactType !== "aio-citation-wave-systemic-review-acknowledgement"
    || ack.reviewAuthority !== "parent"
    || ack.acknowledgement !== "manual_systemic_review_completed"
    || timestamp(ack.reviewedAt) === null
    || !Array.isArray(ack.systemicMethodErrors)
    || ack.systemicMethodErrors.length) fail("parent systemic-review acknowledgement is missing or not clear");
  if (!ack.sourceSha256 || !same(Object.keys(ack.sourceSha256).sort(), Object.keys(hashes).sort())
    || Object.entries(hashes).some(([key, value]) => ack.sourceSha256[key] !== value)) {
    fail("parent acknowledgement does not hash-pin all supplied review inputs");
  }
}

function validateVisual(row, capture) {
  if (!row) fail(`visual review row missing: ${capture.tag}`);
  if (row.tag !== capture.tag || row.queryId !== capture.queryId || row.query !== capture.query
    || row.sectorId !== capture.sector.id || row.device !== capture.device) fail(`visual metadata join failed: ${capture.tag}`);
  if (row.evidence?.screenshotHashVerified !== true
    || row.evidence.screenshot?.sha256 !== capture.screenshotEvidence.screenshotSha256
    || row.evidence.html?.sha256 !== capture.fileIntegrity.html.actualSha256
    || row.evidence.normalized?.sha256 !== capture.fileIntegrity.normalized.actualSha256) fail(`visual evidence hash join failed: ${capture.tag}`);
  if (!FEATURE_STATES.has(row.stateRecommendation)) fail(`visual feature state invalid: ${capture.tag}`);
  const observation = row.observations ?? {};
  if (observation.allTabSelected !== "yes") fail(`All-results visual review missing: ${capture.tag}`);
  if (row.stateRecommendation === "confirmed_main_aio" && !(capture.providerObservation.firstLevelMainAioCount === 1
    && observation.literalAiOverviewHeading === "yes" && observation.readableAnswerBody === "yes"
    && observation.bodyMatchesFirstLevelProviderMainAio === "yes" && observation.unexplainedMainGeneratedFeature === "no")) {
    fail(`confirmed-main visual rule failed: ${capture.tag}`);
  }
  if (row.stateRecommendation === "main_absent" && !(capture.providerObservation.firstLevelMainAioCount === 0
    && observation.literalAiOverviewHeading === "no" && observation.readableAnswerBody === "no"
    && observation.bodyMatchesFirstLevelProviderMainAio === "not_applicable" && observation.unexplainedMainGeneratedFeature === "no")) {
    fail(`reviewed-absence visual rule failed: ${capture.tag}`);
  }
  if (row.stateRecommendation === "ambiguous_main_generated" && !(capture.providerObservation.firstLevelMainAioCount === 1
    && observation.literalAiOverviewHeading === "no" && observation.readableAnswerBody === "yes"
    && observation.bodyMatchesFirstLevelProviderMainAio === "yes"
    && observation.unexplainedMainGeneratedFeature === "yes_identity_unlabelled"
    && typeof row.uncertainty === "string" && row.uncertainty)) fail(`ambiguous-main visual rule failed: ${capture.tag}`);
  return row.stateRecommendation;
}

function validateCompleteness(row, capture, featureState, reportRecord, visualPath) {
  if (!row || row.tag !== capture.tag || row.queryId !== capture.queryId || row.query !== capture.query
    || row.device !== capture.device || row.visualFeatureState !== featureState) {
    fail(`reference completeness metadata join failed: ${capture.tag}`);
  }
  const state = row.completenessAssessment?.state;
  const referenceSetState = COMPLETENESS_STATES.get(state);
  if (!referenceSetState || !REFERENCE_SET_STATES.has(referenceSetState)
    || row.completenessAssessment.destinationResolutionSeparate !== true) {
    fail(`reference completeness decision missing or invalid: ${capture.tag}`);
  }
  if ((referenceSetState === "unknown") === (row.completenessAssessment.independentlyEstablished === true)) {
    fail(`reference completeness establishment flag is inconsistent: ${capture.tag}`);
  }
  const raw = row.rawFirstLevelMainAio;
  const set = row.firstLevelStructuredReferenceSet;
  if (!raw || !set || raw.count !== capture.providerObservation.firstLevelMainAioCount
    || raw.bodyReturned !== capture.providerObservation.mainAioBodyReturned
    || raw.rootReferencesFieldState !== capture.providerObservation.mainReferenceArrayState) {
    fail(`provider reference payload differs from scaffold: ${capture.tag}`);
  }
  const urls = exactSet(capture.mainStructuredReferences.map(reference => reference.url));
  const externalCount = capture.mainStructuredReferences.filter(reference => reference.referenceClass === "external").length;
  const productCount = capture.mainStructuredReferences.filter(reference => reference.referenceClass === "product").length;
  if (set.uniqueUrlCount !== urls.length || set.externalCount !== externalCount
    || set.googleProductViewCount !== productCount || set.rootUrlsAllPreserved !== true
    || set.allUniqueSubtreeUrlsPreserved !== true || set.exactUrlSetSha256 !== sha256(urls.join("\n"))) {
    fail(`reference completeness URL set/hash differs from scaffold: ${capture.tag}`);
  }
  const evidence = row.evidence;
  if (evidence?.mechanicalReport?.sha256 !== reportRecord.sha256
    || evidence.mechanicalReport.path !== repoPath(reportRecord.absolute, `capture report ${capture.tag}`)
    || evidence.advancedEnvelope?.sha256 !== capture.fileIntegrity.advancedEnvelope.actualSha256
    || evidence.advancedEnvelope.path !== capture.fileIntegrity.advancedEnvelope.path
    || evidence.normalized?.sha256 !== capture.fileIntegrity.normalized.actualSha256
    || evidence.normalized.path !== capture.fileIntegrity.normalized.path
    || evidence.mainHtml?.sha256 !== capture.fileIntegrity.html.actualSha256
    || evidence.mainHtml.path !== capture.fileIntegrity.html.path
    || evidence.screenshot?.sha256 !== capture.fileIntegrity.screenshot.actualSha256
    || evidence.screenshot.path !== capture.fileIntegrity.screenshot.path
    || evidence.visualReview?.path !== visualPath
    || evidence.visualReview.screenshotHashVerified !== true) {
    fail(`reference completeness evidence hash join failed: ${capture.tag}`);
  }
  if (featureState === "main_absent" && referenceSetState !== "known_empty") fail(`reviewed absence is not known-empty: ${capture.tag}`);
  if (["missing", "invalid"].includes(featureState) && referenceSetState !== "unknown") fail(`missing/invalid set is not unknown: ${capture.tag}`);
  if (referenceSetState === "known" && !urls.length) fail(`known reference set is empty: ${capture.tag}`);
  if (referenceSetState === "known_empty" && urls.length) fail(`known-empty reference set has URLs: ${capture.tag}`);
  if (referenceSetState === "unknown" && state !== "unknown_null") fail(`unknown reference state lacks an explicit reviewed reason: ${capture.tag}`);
  return referenceSetState;
}

function resolvedReferences(capture, reportRecord, redirectByKey, usedRedirectKeys, referenceSetState, classifyReferenceDestination) {
  if (referenceSetState === "unknown") return null;
  if (referenceSetState === "known_empty") {
    if (capture.mainStructuredReferences.length) fail(`known-empty scaffold has references: ${capture.tag}`);
    return [];
  }
  const output = capture.mainStructuredReferences.map(reference => {
    let destinationEvidenceState = reference.originalHtmlEvidenceState;
    if (destinationEvidenceState === "exact_original_html") destinationEvidenceState = "exact_original_html";
    else {
      const key = `${capture.tag}\u0000${capture.taskId}\u0000${reference.url}`;
      const redirect = redirectByKey.get(key);
      if (!redirect || redirect.finalDestinationEvidenceState !== "exact_later_redirect"
        || redirect.exactDestination !== reference.url || redirect.state !== "exact_destination_returned"
        || redirect.referenceClass !== reference.referenceClass
        || redirect.provenance?.captureReport?.sha256 !== reportRecord.sha256
        || redirect.provenance.captureReport.path !== repoPath(reportRecord.absolute, `capture report ${capture.tag}`)
        || redirect.provenance?.captureHtml?.sha256 !== capture.fileIntegrity.html.actualSha256
        || redirect.provenance.captureHtml.path !== capture.fileIntegrity.html.path) {
        destinationEvidenceState = "unresolved";
      } else {
        destinationEvidenceState = "exact_later_redirect";
        usedRedirectKeys.add(key);
      }
    }
    let parsed;
    try { parsed = new URL(reference.url); } catch { fail(`reference URL is invalid: ${capture.tag}`); }
    if (!["http:", "https:"].includes(parsed.protocol)) fail(`reference URL protocol is invalid: ${capture.tag}`);
    const referenceClass = classifyReferenceDestination(reference.url) === "google_product_view" ? "product" : "external";
    if (reference.referenceClass !== referenceClass) fail(`reference class changed: ${capture.tag}`);
    return { url: reference.url, host: parsed.hostname.toLowerCase(), referenceClass, destinationEvidenceState };
  });
  if (new Set(output.map(reference => reference.url)).size !== output.length) fail(`duplicate exact reference URL: ${capture.tag}`);
  return output;
}

export async function loadCaptureReports(reviewDir, index) {
  if (!Array.isArray(index.captureReports) || index.captureReports.length !== 100) fail("mechanical index does not contain 100 capture reports");
  const rows = [];
  for (const record of index.captureReports) {
    const file = path.resolve(reviewDir, record.path);
    const relative = path.relative(reviewDir, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`capture report escapes review directory: ${record.tag}`);
    const loaded = await source(file, `capture report ${record.tag}`);
    if (loaded.sha256 !== record.sha256 || loaded.value.tag !== record.tag) fail(`capture report hash/tag mismatch: ${record.tag}`);
    const expectedEvidenceKeys = ["advancedEnvelope", "html", "htmlEnvelope", "normalized", "screenshot", "screenshotEnvelope"];
    if (!same(Object.keys(loaded.value.fileIntegrity ?? {}).sort(), expectedEvidenceKeys)) {
      fail(`capture evidence file set differs: ${record.tag}`);
    }
    for (const key of expectedEvidenceKeys) {
      const integrity = loaded.value.fileIntegrity[key];
      if (integrity.state !== "verified" || integrity.expectedSha256 !== integrity.actualSha256
        || integrity.expectedBytes !== integrity.actualBytes) fail(`capture evidence declaration is not verified: ${record.tag}/${key}`);
      const evidence = await bytesSource(path.resolve(REPOSITORY_ROOT, integrity.path), `capture evidence ${record.tag}/${key}`);
      if (evidence.sha256 !== integrity.actualSha256 || evidence.bytes.length !== integrity.actualBytes) {
        fail(`capture evidence current bytes differ: ${record.tag}/${key}`);
      }
    }
    rows.push({ capture: loaded.value, record: { ...record, absolute: loaded.absolute } });
  }
  return rows;
}

async function loadFrozenReferenceClassifier(index) {
  const record = index.frozenRegistration?.artifacts?.summaryHelper;
  if (!record || record.path !== FROZEN_SUMMARY_PATH || record.matchesFreezeManifest !== true) {
    fail("frozen summary-helper provenance is missing or invalid");
  }
  const loaded = await bytesSource(path.resolve(REPOSITORY_ROOT, record.path), "frozen summary helper");
  if (loaded.sha256 !== record.sha256 || loaded.bytes.length !== record.bytes) {
    fail("frozen summary helper differs from the mechanical evidence index");
  }
  const summaryModule = await import(pathToFileURL(loaded.absolute).href);
  if (typeof summaryModule.classifyReferenceDestination !== "function") {
    fail("frozen summary helper does not export its reference classifier");
  }
  return summaryModule.classifyReferenceDestination;
}

export async function inspectReviewedWaveInputs(options) {
  const reviewDir = path.resolve(options.reviewDirectory);
  const indexSource = await source(path.join(reviewDir, "wave-evidence-review.json"), "mechanical evidence index");
  const visualSource = await source(options.visualReview, "visual review");
  const completenessSource = await source(options.completenessReview, "reference completeness review");
  const redirectSource = await source(options.redirectReview, "redirect review");
  const hashes = {
    waveEvidenceReview: indexSource.sha256,
    visualReview: visualSource.sha256,
    referenceCompletenessReview: completenessSource.sha256,
    redirectReview: redirectSource.sha256,
  };
  const index = indexSource.value;
  const visual = visualSource.value;
  const completeness = completenessSource.value;
  const redirects = redirectSource.value;
  if (![visual.runId, completeness.runId, redirects.runId].every(runId => runId === index.runId)) fail("review input run IDs differ");
  if (![visual.waveId, completeness.waveId].every(waveId => waveId === index.waveId)) fail("review input wave IDs differ");
  if (visual.reviewType !== "independent_visual_identity_review"
    || completeness.reviewType !== `${index.waveId}_reference_set_completeness_review`
    || !Array.isArray(index.captureReports) || index.captureReports.length !== 100) fail("review input type or panel size is invalid");
  if (index.automaticEvidenceSummary?.automaticChecksPassed !== 100
    || index.automaticEvidenceSummary?.automaticChecksFailed !== 0
    || index.automaticEvidenceSummary?.topIssues?.length) fail("mechanical evidence scaffold is not fully clear");
  if (visual.reviewStatus !== "complete" || visual.captures?.length !== 100) fail("visual review is incomplete");
  if (completeness.reviewStatus !== "complete" || completeness.captures?.length !== 100) fail("reference completeness review is incomplete");
  if (redirects.stopped || redirects.summary?.unresolvedReferences !== 0 || redirects.summary?.inputReferences !== redirects.results?.length) {
    fail("redirect review is stopped, incomplete, or unresolved");
  }
  if (completeness.canonicalRedirectReview?.sha256 !== redirectSource.sha256
    || completeness.canonicalRedirectReview.path !== repoPath(redirectSource.absolute, "redirect review")
    || completeness.canonicalRedirectReview.inputReferences !== redirects.summary.inputReferences
    || completeness.canonicalRedirectReview.exactLaterRedirectReferences !== redirects.summary.exactLaterRedirectReferences
    || completeness.canonicalRedirectReview.unresolvedReferences !== 0) {
    fail("reference completeness review does not pin the supplied canonical redirect review");
  }
  if (completeness.visualReviewPath !== repoPath(visualSource.absolute, "visual review")
    || timestamp(completeness.reviewedAt) === null || timestamp(visual.reviewedAt) === null
    || visual.runManifestPath !== index.manifest.path
    || redirectSource.value.sources?.waveEvidenceIndex?.sha256 !== indexSource.sha256
    || redirectSource.value.sources.waveEvidenceIndex.path !== repoPath(indexSource.absolute, "mechanical evidence index")) {
    fail("review-level provenance join failed");
  }
  const manifestSource = await source(path.resolve(REPOSITORY_ROOT, index.manifest?.path ?? ""), "source run manifest");
  if (manifestSource.sha256 !== index.manifest?.sha256 || manifestSource.bytes.length !== index.manifest?.bytes
    || manifestSource.value.runId !== index.runId || manifestSource.value.waveId !== index.waveId
    || manifestSource.value.submittedAt !== index.timing?.submittedAt
    || timestamp(manifestSource.value.baselineSubmittedAt) === null) fail("source run manifest hash or wave metadata join failed");
  const classifyReferenceDestination = await loadFrozenReferenceClassifier(index);
  const captureReports = await loadCaptureReports(reviewDir, index);
  const visualByTag = mapUnique(visual.captures, "tag", "visual review");
  const completenessByTag = mapUnique(completeness.captures, "tag", "reference completeness review");
  const redirectByKey = new Map();
  for (const row of redirects.results) {
    const key = `${row.tag}\u0000${row.taskId}\u0000${row.expectedDestination}`;
    if (redirectByKey.has(key)) fail(`duplicate redirect result: ${row.tag}`);
    redirectByKey.set(key, row);
  }
  const usedRedirectKeys = new Set();
  const captures = captureReports.map(({ capture, record }) => {
    if (!capture.automaticChecksPass) fail(`mechanical capture checks failed: ${capture.tag}`);
    const featureState = validateVisual(visualByTag.get(capture.tag), capture);
    const referenceSetState = validateCompleteness(completenessByTag.get(capture.tag), capture, featureState, record,
      repoPath(visualSource.absolute, "visual review"));
    const references = resolvedReferences(
      capture,
      record,
      redirectByKey,
      usedRedirectKeys,
      referenceSetState,
      classifyReferenceDestination,
    );
    if (references?.some(reference => !EXACT_EVIDENCE.has(reference.destinationEvidenceState))) {
      fail(`reference destination remains unresolved: ${capture.tag}`);
    }
    return {
      index: capture.index,
      tag: capture.tag,
      queryId: capture.queryId,
      query: capture.query,
      sector: capture.sector,
      intent: capture.intent,
      device: capture.device,
      taskId: capture.taskId,
      request: capture.request,
      providerResultReturned: capture.providerObservation.resultReturned,
      providerTimestamp: capture.providerObservation.timestamp,
      collectionEvidenceComplete: true,
      timingEligible: index.timing.allReturnedWithinSubmissionPlus60Minutes
        && index.timing.providerTimestampSpanMilliseconds <= 30 * 60_000,
      screenshotTaskId: capture.screenshotEvidence.screenshotTaskId,
      screenshotOriginalTaskId: capture.screenshotEvidence.screenshotOriginalTaskId,
      screenshotSha256: capture.screenshotEvidence.screenshotSha256,
      retrospectiveExploratory: false,
      featureState,
      exclusionReason: featureState === "ambiguous_main_generated" ? visualByTag.get(capture.tag).uncertainty : null,
      referenceExclusionReason: referenceSetState === "unknown" ? "reference_set_completeness_unknown" : null,
      referenceSetState,
      references,
    };
  });
  if (new Set(captures.map(capture => capture.tag)).size !== 100
    || new Set(captures.map(capture => capture.taskId)).size !== 100
    || new Set(captures.map(capture => capture.screenshotTaskId)).size !== 100) fail("capture/task/screenshot identities are not unique");
  if (usedRedirectKeys.size !== redirectByKey.size) fail("redirect review has unused or unmatched rows");
  const featureCounts = Object.fromEntries([...FEATURE_STATES].map(state => [state, captures.filter(capture => capture.featureState === state).length]));
  const referenceSetCounts = Object.fromEntries([...REFERENCE_SET_STATES].map(state => [state, captures.filter(capture => capture.referenceSetState === state).length]));
  const references = captures.flatMap(capture => capture.references ?? []);
  const destinationEvidenceCounts = Object.fromEntries([...EXACT_EVIDENCE].map(state => [state,
    references.filter(reference => reference.destinationEvidenceState === state).length]));
  const referenceClassCounts = Object.fromEntries(["external", "product"].map(referenceClass => [referenceClass,
    references.filter(reference => reference.referenceClass === referenceClass).length]));
  const primaryComparisonEligibleCaptures = captures.filter(capture => ["confirmed_main_aio", "main_absent"].includes(capture.featureState)
    && ["known", "known_empty"].includes(capture.referenceSetState)
    && capture.collectionEvidenceComplete && capture.timingEligible).length;
  if (completeness.summary?.planned !== 100 || completeness.summary.reviewed !== 100
    || completeness.summary.uniqueStructuredReferencesAcrossCaptureSets !== references.length
    || completeness.summary.externalStructuredReferencesAcrossCaptureSets !== referenceClassCounts.external
    || completeness.summary.googleProductViewsAcrossCaptureSets !== referenceClassCounts.product) {
    fail("reference completeness summary differs from capture rows");
  }
  const output = {
    schemaVersion: "1.0.0",
    artifactType: "aio-citation-reviewed-wave",
    runId: index.runId,
    waveId: index.waveId,
    panelSha256: index.frozenRegistration.panelSha256,
    submittedAt: index.timing.submittedAt,
    baselineSubmittedAt: manifestSource.value.baselineSubmittedAt,
    registration: index.frozenRegistration.registration,
    retrospectiveExploratory: false,
    systemicMethodErrors: null,
    scope: "Prospective reviewed wave input for the frozen fixed-panel comparison engine; this single wave is not a temporal result or release approval.",
    sourceIntegrity: {
      allReviewInputsHashPinnedByParentAcknowledgement: false,
      sources: {
        runManifest: { path: repoPath(manifestSource.absolute, "source run manifest"), sha256: manifestSource.sha256 },
        waveEvidenceReview: { path: repoPath(indexSource.absolute, "mechanical evidence index"), sha256: indexSource.sha256 },
        visualReview: { path: repoPath(visualSource.absolute, "visual review"), sha256: visualSource.sha256 },
        referenceCompletenessReview: { path: repoPath(completenessSource.absolute, "reference completeness review"), sha256: completenessSource.sha256 },
        redirectReview: { path: repoPath(redirectSource.absolute, "redirect review"), sha256: redirectSource.sha256 },
      },
    },
    summary: {
      captures: captures.length,
      featureCounts,
      referenceSetCounts,
      primaryComparisonEligibleCaptures,
      completeTimingEligible: captures.filter(capture => capture.collectionEvidenceComplete && capture.timingEligible).length,
      exactReferenceOccurrences: references.length,
      referenceClassCounts,
      destinationEvidenceCounts,
    },
    captures,
  };
  return { output, hashes };
}

export async function assembleReviewedWave(options) {
  const inspected = await inspectReviewedWaveInputs(options);
  const ackSource = await source(options.systemicAcknowledgement, "systemic-review acknowledgement");
  const ack = ackSource.value;
  if (ack.runId !== inspected.output.runId || ack.waveId !== inspected.output.waveId) fail("systemic-review acknowledgement run/wave differs");
  assertReviewHashes(ack, inspected.hashes);
  const outputFile = path.resolve(options.outputFile);
  repoPath(outputFile, "reviewed wave output");
  try { await readFile(outputFile); fail("output already exists"); } catch (error) {
    if (!String(error.message).includes("output already exists") && error?.code !== "ENOENT") throw error;
    if (String(error.message).includes("output already exists")) throw error;
  }
  const output = {
    ...inspected.output,
    systemicMethodErrors: [],
    sourceIntegrity: {
      allReviewInputsHashPinnedByParentAcknowledgement: true,
      sources: {
        ...inspected.output.sourceIntegrity.sources,
        systemicAcknowledgement: {
          path: repoPath(ackSource.absolute, "systemic-review acknowledgement"),
          sha256: ackSource.sha256,
        },
      },
    },
  };
  await writeFile(outputFile, `${JSON.stringify(output, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return { outputFile, output };
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--preflight") {
    const [, reviewDirectory, visualReview, completenessReview, redirectReview] = args;
    if (!redirectReview) {
      console.error("Usage: node scripts/research/aio-citation-wave-export.mjs --preflight <mechanical-review-dir> <visual-review.json> <reference-completeness.json> <redirect-review.json>");
      process.exitCode = 2;
      return;
    }
    const inspected = await inspectReviewedWaveInputs({ reviewDirectory, visualReview, completenessReview, redirectReview });
    console.log(JSON.stringify({ runId: inspected.output.runId, waveId: inspected.output.waveId,
      parentSystemicAcknowledgementRequired: true, summary: inspected.output.summary }, null, 2));
    return;
  }
  const [reviewDirectory, visualReview, completenessReview, redirectReview, systemicAcknowledgement, outputFile] = args;
  if (!outputFile || ["--help", "-h"].includes(reviewDirectory)) {
    console.error("Usage: node scripts/research/aio-citation-wave-export.mjs <mechanical-review-dir> <visual-review.json> <reference-completeness.json> <redirect-review.json> <parent-systemic-ack.json> <new-output.json>");
    process.exitCode = ["--help", "-h"].includes(reviewDirectory) ? 0 : 2;
    return;
  }
  const { output } = await assembleReviewedWave({ reviewDirectory, visualReview, completenessReview, redirectReview, systemicAcknowledgement, outputFile });
  console.log(JSON.stringify({ outputFile, summary: output.summary }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
