#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SUMMARY_PATH = 'tmp/ctr-aio/full-wave-data-summary.json';
const REVIEW_PATH = 'tmp/ctr-aio/full-wave-final-review.json';
const OUTPUT_PATH = 'tmp/ctr-aio/citation-study/pilot-baseline.json';
const EXPECTED_RUN_ID = '2026-09-12T21-53-08-862Z-3c829f';
const EXPECTED_SOURCE_SHA256 = {
  summary: 'fd5c92aa8ebf60d391b8c0e7441a0373223e701b224d486ed08754536cac0b06',
  review: '06a678b585243612104bc9941333ef29983185a1389b7e11d8d50580af67c0cc',
  manifest: '50119ebff888b2e78ff860a915e3116759f171f75b4ccb9431d033751e1e4e34',
  panel: '3b69e7d795167e3e2a8409b9ce84c5753e135ee5a5f24313a4dd0ee4db54cfd9',
};
const EXPECTED_MANIFEST_FILES_PER_CAPTURE = 6;
const MAX_TIMING_SPAN_MS = 30 * 60 * 1000;
const EXPECTED_FEATURE_COUNTS = { confirmed_main_aio: 85, ambiguous_main_generated: 6, main_absent: 9 };
const EXPECTED_REVIEW_COUNTS = {
  captures: 100,
  providerMainPresent: 91,
  visibleMainAioLabel: 85,
  mainAbsenceReviewed: 9,
  mainFeatureIdentityUnresolved: 6,
  structuredReferenceUrlsWithinCapture: 731,
  exactOriginalHtmlReferenceUrls: 505,
  exactLaterRedirectReferenceUrls: 226,
};
const FINAL_EVIDENCE = new Map([
  ['exact_url_in_saved_aio_subtree', 'exact_original_html'],
  ['exact_destination_via_later_captured_token_redirect', 'exact_later_redirect'],
]);

const fail = (message) => { throw new Error(`Baseline export refused: ${message}`); };
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const exactSet = (values) => [...new Set(values)].sort();
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function absolute(relativePath) {
  const resolved = path.resolve(ROOT, relativePath);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) fail(`path escapes repository: ${relativePath}`);
  return resolved;
}

async function readJsonWithHash(relativePath) {
  const bytes = await readFile(absolute(relativePath));
  return { value: JSON.parse(bytes.toString('utf8')), bytes, sha256: sha256(bytes) };
}

async function verifyFile(record, label) {
  if (!record?.path || !record?.sha256) fail(`${label} lacks path or sha256`);
  const bytes = await readFile(absolute(record.path));
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== record.sha256) fail(`${label} hash mismatch (${record.path})`);
  if (record.bytes !== undefined && bytes.length !== record.bytes) fail(`${label} byte-count mismatch (${record.path})`);
  return { path: record.path, sha256: actualSha256, bytes: bytes.length };
}

async function verifyManifestEvidence(record, runDirectory, label) {
  if (!record?.path || !record?.sha256 || !Number.isInteger(record.bytes)) fail(`${label} lacks path, sha256, or bytes`);
  const runRoot = absolute(runDirectory);
  const resolved = path.resolve(runRoot, record.path);
  if (!resolved.startsWith(`${runRoot}${path.sep}`)) fail(`${label} path escapes run directory: ${record.path}`);
  const bytes = await readFile(resolved);
  if (sha256(bytes) !== record.sha256) fail(`${label} hash mismatch (${record.path})`);
  if (bytes.length !== record.bytes) fail(`${label} byte-count mismatch (${record.path})`);
}

function parseProviderTimestamp(value, tag) {
  if (typeof value !== 'string' || !value) fail(`missing provider timestamp for ${tag}`);
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) fail(`invalid provider timestamp for ${tag}: ${value}`);
  return milliseconds;
}

function featureState(summaryCapture, reviewCapture) {
  const providerPresent = reviewCapture.providerMainAio === true;
  const labelVisible = reviewCapture.visibleAiOverviewLabel === true;
  if (!providerPresent) {
    if (summaryCapture.provider.mainFeatureState !== 'absent_returned_serp' || reviewCapture.featureIdentity !== 'reviewed_main_absence') {
      fail(`inconsistent reviewed absence for ${summaryCapture.tag}`);
    }
    return 'main_absent';
  }
  if (summaryCapture.provider.mainFeatureState !== 'present_content_returned') fail(`inconsistent provider presence for ${summaryCapture.tag}`);
  if (labelVisible) {
    if (reviewCapture.featureIdentity !== 'main_aio_visible_label') fail(`inconsistent confirmed main AIO for ${summaryCapture.tag}`);
    return 'confirmed_main_aio';
  }
  if (reviewCapture.featureIdentity !== 'provider_main_generated_body_identity_unresolved' || reviewCapture.matchingBodyAndAllTabParentCorroborated !== true) {
    fail(`inconsistent ambiguous generated main body for ${summaryCapture.tag}`);
  }
  return 'ambiguous_main_generated';
}

function referenceClass(destinationClass, tag, url) {
  if (destinationClass === 'external_destination') return 'external';
  if (destinationClass === 'google_product_view') return 'product';
  fail(`unsupported reference class ${destinationClass} in ${tag}: ${url}`);
}

function hostOf(url, tag) {
  let parsed;
  try { parsed = new URL(url); } catch { fail(`invalid reference URL in ${tag}: ${url}`); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || !parsed.hostname) fail(`unsafe reference URL in ${tag}: ${url}`);
  return parsed.hostname.toLowerCase();
}

function joinReferences(summaryCapture, reviewCapture) {
  const summaryByUrl = new Map();
  for (const reference of summaryCapture.mainStructuredReferences) {
    if (typeof reference.url !== 'string' || !reference.url) fail(`empty reference URL in ${summaryCapture.tag}`);
    const prior = summaryByUrl.get(reference.url);
    if (prior && prior.destinationClass !== reference.destinationClass) fail(`conflicting duplicate reference in ${summaryCapture.tag}: ${reference.url}`);
    summaryByUrl.set(reference.url, reference);
  }
  const reviewByUrl = new Map();
  for (const reference of reviewCapture.mainStructuredReferences) {
    const prior = reviewByUrl.get(reference.url);
    if (prior && prior.finalDestinationEvidenceState !== reference.finalDestinationEvidenceState) fail(`conflicting review evidence in ${summaryCapture.tag}: ${reference.url}`);
    reviewByUrl.set(reference.url, reference);
  }
  if (!equal(exactSet(summaryByUrl.keys()), exactSet(reviewByUrl.keys()))) fail(`reference-set join mismatch for ${summaryCapture.tag}`);
  const references = [...summaryByUrl.values()].map((reference) => {
    const reviewed = reviewByUrl.get(reference.url);
    const destinationEvidenceState = FINAL_EVIDENCE.get(reviewed.finalDestinationEvidenceState);
    if (!destinationEvidenceState) fail(`unresolved/unsupported reference evidence in ${summaryCapture.tag}: ${reference.url}`);
    return {
      url: reference.url,
      host: hostOf(reference.url, summaryCapture.tag),
      referenceClass: referenceClass(reference.destinationClass, summaryCapture.tag, reference.url),
      destinationEvidenceState,
    };
  });
  if (new Set(references.map((reference) => reference.url)).size !== references.length) fail(`reference deduplication failed for ${summaryCapture.tag}`);
  return references;
}

async function main() {
  const [summaryFile, reviewFile] = await Promise.all([readJsonWithHash(SUMMARY_PATH), readJsonWithHash(REVIEW_PATH)]);
  const summary = summaryFile.value;
  const review = reviewFile.value;
  if (summaryFile.sha256 !== EXPECTED_SOURCE_SHA256.summary || reviewFile.sha256 !== EXPECTED_SOURCE_SHA256.review) fail('frozen primary-input hash mismatch');
  if (summary.runId !== EXPECTED_RUN_ID || review.runId !== EXPECTED_RUN_ID || summary.runId !== review.runId) fail('run ID mismatch');
  if (summary.captures?.length !== 100 || review.captures?.length !== 100) fail('both inputs must contain exactly 100 captures');
  for (const [key, expected] of Object.entries(EXPECTED_REVIEW_COUNTS)) {
    if (review.counts?.[key] !== expected) fail(`final-review count ${key} must be ${expected}`);
  }

  const declaredSummary = review.sourceFiles?.find((source) => source.role === 'rawSummary');
  if (!declaredSummary || declaredSummary.path !== SUMMARY_PATH || declaredSummary.sha256 !== summaryFile.sha256) fail('final-review raw-summary hash join failed');
  const finalReviewDependencies = [];
  for (const source of review.sourceFiles || []) finalReviewDependencies.push({ role: source.role, ...(await verifyFile(source, `final-review dependency ${source.role}`)) });
  const summaryManifest = await verifyFile(summary.rawSourceFileHashes?.runManifest, 'summary manifest dependency');
  if (summaryManifest.sha256 !== EXPECTED_SOURCE_SHA256.manifest) fail('frozen manifest hash mismatch');
  const manifestFile = await readJsonWithHash(summaryManifest.path);
  const manifest = manifestFile.value;
  if (manifest.runId !== EXPECTED_RUN_ID || manifest.captures?.length !== 100) fail('manifest run ID/capture count mismatch');
  if (manifest.input !== 'docs/research/ai-overview-pilot-panel.json' || typeof manifest.inputSha256 !== 'string') fail('manifest panel identity missing');
  if (manifest.inputSha256 !== EXPECTED_SOURCE_SHA256.panel) fail('frozen panel hash mismatch');
  const panel = await verifyFile({ path: manifest.input, sha256: manifest.inputSha256 }, 'frozen panel');
  const manifestDirectory = path.dirname(summaryManifest.path);
  const requiredEvidenceKeys = ['advancedEnvelope', 'normalized', 'htmlEnvelope', 'html', 'screenshotEnvelope', 'screenshot'];
  let verifiedManifestFileRecords = 0;
  const manifestByTag = new Map();
  for (const capture of manifest.captures) {
    if (!capture.tag || manifestByTag.has(capture.tag)) fail(`duplicate/missing manifest tag: ${capture.tag}`);
    manifestByTag.set(capture.tag, capture);
    const fileKeys = Object.keys(capture.files || {}).sort();
    if (!equal(fileKeys, [...requiredEvidenceKeys].sort())) fail(`manifest evidence file set is incomplete for ${capture.tag}`);
    for (const key of requiredEvidenceKeys) {
      await verifyManifestEvidence(capture.files[key], manifestDirectory, `manifest ${capture.tag} ${key}`);
      verifiedManifestFileRecords += 1;
    }
  }
  const expectedManifestFileRecords = manifest.captures.length * EXPECTED_MANIFEST_FILES_PER_CAPTURE;
  if (verifiedManifestFileRecords !== expectedManifestFileRecords || expectedManifestFileRecords !== 600) fail('manifest evidence must verify all 600 file records');
  const advancedRecords = summary.rawSourceFileHashes?.advancedEnvelopes;
  if (!Array.isArray(advancedRecords) || advancedRecords.length !== 100) fail('summary must declare 100 Advanced-envelope hashes');
  const advancedVerified = [];
  const advancedTags = new Set();
  for (const record of advancedRecords) {
    if (!record.tag || advancedTags.has(record.tag)) fail(`duplicate/missing Advanced-envelope tag: ${record.tag}`);
    advancedTags.add(record.tag);
    const verified = await verifyFile(record, `Advanced envelope ${record.tag}`);
    if (record.hashMatchesManifest !== true || record.manifestRecordedSha256 !== record.sha256) fail(`summary/manifest Advanced hash mismatch for ${record.tag}`);
    const manifested = manifestByTag.get(record.tag);
    if (!manifested || manifested.files.advancedEnvelope.sha256 !== record.sha256 || !path.normalize(record.path).endsWith(path.normalize(manifested.files.advancedEnvelope.path))) {
      fail(`Advanced-envelope tag/path/hash join failed for ${record.tag}`);
    }
    advancedVerified.push({ tag: record.tag, ...verified });
  }

  const summaryTags = new Set();
  const reviewByTag = new Map();
  for (const capture of review.captures) {
    if (!capture.tag || reviewByTag.has(capture.tag)) fail(`duplicate/missing final-review tag: ${capture.tag}`);
    reviewByTag.set(capture.tag, capture);
  }
  const captures = summary.captures.map((capture, index) => {
    if (!capture.tag || summaryTags.has(capture.tag)) fail(`duplicate/missing summary tag: ${capture.tag}`);
    summaryTags.add(capture.tag);
    const reviewed = reviewByTag.get(capture.tag);
    const manifested = manifestByTag.get(capture.tag);
    if (!reviewed || !manifested || capture.index !== index || reviewed.index !== index || capture.taskId !== reviewed.taskId || capture.taskId !== manifested.taskId) {
      fail(`exact tag/index/task join failed for ${capture.tag}`);
    }
    if (capture.queryId !== manifested.queryId || capture.query !== manifested.keyword || capture.sector?.id !== manifested.sectorId || capture.sector?.label !== manifested.sectorLabel || capture.intent !== manifested.intent || capture.device !== manifested.device) {
      fail(`summary/manifest metadata join failed for ${capture.tag}`);
    }
    const references = joinReferences(capture, reviewed);
    const state = featureState(capture, reviewed);
    if (state === 'main_absent' && references.length) fail(`absent capture has references: ${capture.tag}`);
    if (state !== 'main_absent' && !references.length) fail(`present/ambiguous capture has an unknown empty reference set: ${capture.tag}`);
    parseProviderTimestamp(capture.provider?.resultDatetime, capture.tag);
    return {
      index,
      tag: capture.tag,
      queryId: capture.queryId,
      query: capture.query,
      sector: capture.sector,
      intent: capture.intent,
      device: capture.device,
      taskId: capture.taskId,
      providerTimestamp: capture.provider.resultDatetime,
      retrospectiveExploratory: true,
      collectionEvidenceComplete: true,
      timingEligible: true,
      featureState: state,
      referenceSetState: state === 'main_absent' ? 'known_empty' : 'known',
      references,
    };
  });
  if (reviewByTag.size !== summaryTags.size || [...reviewByTag.keys()].some((tag) => !summaryTags.has(tag))) fail('tag sets differ');
  if (new Set(captures.map((capture) => `${capture.queryId}\u0000${capture.device}`)).size !== 100) fail('query-device observation keys are not unique');
  if (new Set(captures.map((capture) => capture.taskId)).size !== 100) fail('task IDs are not unique');
  const queryPairs = new Map();
  for (const capture of captures) {
    const pair = queryPairs.get(capture.queryId) || [];
    pair.push(capture);
    queryPairs.set(capture.queryId, pair);
  }
  if (queryPairs.size !== 50) fail('baseline must contain exactly 50 query pairs');
  for (const [queryId, pair] of queryPairs) {
    if (pair.length !== 2 || !equal(exactSet(pair.map(({ device }) => device)), ['desktop', 'mobile'])) fail(`query pair devices invalid for ${queryId}`);
    for (const field of ['query', 'sector', 'intent']) {
      if (!pair.every((capture) => equal(capture[field], pair[0][field]))) fail(`query pair ${field} mismatch for ${queryId}`);
    }
  }

  const ambiguousTags = exactSet(captures.filter(({ featureState: state }) => state === 'ambiguous_main_generated').map(({ tag }) => tag));
  if (!equal(ambiguousTags, exactSet(review.unresolvedMainFeatureIdentityTags || []))) fail('ambiguous tag set differs from final review');
  const providerTimes = captures.map((capture) => parseProviderTimestamp(capture.providerTimestamp, capture.tag));
  const minProviderTime = Math.min(...providerTimes);
  const maxProviderTime = Math.max(...providerTimes);
  const timingSpanMilliseconds = maxProviderTime - minProviderTime;
  if (timingSpanMilliseconds > MAX_TIMING_SPAN_MS) fail(`provider timing span exceeds 30 minutes: ${timingSpanMilliseconds}ms`);

  const featureCounts = Object.fromEntries(Object.keys(EXPECTED_FEATURE_COUNTS).map((state) => [state, captures.filter((capture) => capture.featureState === state).length]));
  if (!equal(featureCounts, EXPECTED_FEATURE_COUNTS)) fail(`feature counts differ from reviewed 85/6/9 baseline: ${JSON.stringify(featureCounts)}`);
  const references = captures.flatMap((capture) => capture.references);
  const external = references.filter((reference) => reference.referenceClass === 'external');
  const product = references.filter((reference) => reference.referenceClass === 'product');
  if (references.length !== summary.counts.mainStructuredReferenceUrlsWithinCapture || external.length !== summary.counts.externalDestinationReferences || product.length !== summary.counts.googleProductViewReferences) {
    fail('reference counts differ from the source summary');
  }
  const destinationEvidenceCounts = Object.fromEntries([...FINAL_EVIDENCE.values()].map((state) => [state, references.filter((reference) => reference.destinationEvidenceState === state).length]));
  if (destinationEvidenceCounts.exact_original_html !== review.counts.exactOriginalHtmlReferenceUrls || destinationEvidenceCounts.exact_later_redirect !== review.counts.exactLaterRedirectReferenceUrls) {
    fail('destination-evidence counts differ from final review');
  }
  const hostValues = {
    all: exactSet(references.map((reference) => reference.host)),
    external: exactSet(external.map((reference) => reference.host)),
    product: exactSet(product.map((reference) => reference.host)),
  };
  const output = {
    schemaVersion: 1,
    artifactType: 'aio-citation-pilot-baseline',
    runId: EXPECTED_RUN_ID,
    panelSha256: manifest.inputSha256,
    observationUnit: 'query_device',
    retrospectiveExploratory: true,
    prospectiveEligibility: false,
    scope: 'Descriptive baseline for this fixed 12 September 2026 methods pilot only; it does not estimate prevalence, stability, change, or sector-level effects.',
    vocabularies: {
      featureState: ['confirmed_main_aio', 'ambiguous_main_generated', 'main_absent', 'missing', 'invalid'],
      referenceClass: ['external', 'product'],
      destinationEvidenceState: ['exact_original_html', 'exact_later_redirect'],
      referenceSetState: ['known', 'known_empty', 'unknown'],
    },
    referenceSetSemantics: {
      known: 'The reviewed structured main-feature reference set is available and non-empty.',
      known_empty: 'A reviewed main-feature absence has an empty reference set.',
      unknown: 'Future missing or invalid observations must use null references; an empty array must not imply observed absence.',
    },
    hostPolicy: 'Lowercase URL.hostname exactly as parsed, including www where present; no public-suffix or registrable/root-domain inference.',
    eligibilityProvenance: {
      collectionEvidence: {
        sourceManifestPath: summaryManifest.path,
        sourceManifestSha256: summaryManifest.sha256,
        expectedManifestFileRecords,
        verifiedManifestFileRecords,
        allManifestHashesAndBytesVerified: true,
      },
      timing: {
        basis: 'Minimum and maximum provider resultDatetime across all 100 query-device observations.',
        minimumProviderTimestamp: new Date(minProviderTime).toISOString(),
        maximumProviderTimestamp: new Date(maxProviderTime).toISOString(),
        spanMilliseconds: timingSpanMilliseconds,
        maximumAllowedMilliseconds: MAX_TIMING_SPAN_MS,
        eligible: true,
      },
      note: 'These completeness and timing flags describe this retrospective pilot baseline only and do not make it prospectively eligible.',
    },
    sourceIntegrity: {
      allVerified: true,
      primaryInputs: [
        { role: 'dataSummary', path: SUMMARY_PATH, sha256: summaryFile.sha256, bytes: summaryFile.bytes.length },
        { role: 'finalReview', path: REVIEW_PATH, sha256: reviewFile.sha256, bytes: reviewFile.bytes.length },
      ],
      frozenPanel: panel,
      finalReviewDependencies,
      summaryRawDependencies: {
        runManifest: summaryManifest,
        advancedEnvelopeCount: advancedVerified.length,
        advancedEnvelopeIndexSha256: sha256(Buffer.from(JSON.stringify(advancedVerified))),
      },
    },
    summary: {
      observations: captures.length,
      featureCounts,
      referenceOccurrences: { total: references.length, external: external.length, product: product.length },
      destinationEvidenceCounts,
      uniqueHosts: {
        total: hostValues.all.length,
        external: hostValues.external.length,
        product: hostValues.product.length,
        values: hostValues,
      },
    },
    captures,
  };
  await mkdir(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  await writeFile(absolute(OUTPUT_PATH), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  process.stdout.write(`${OUTPUT_PATH}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
