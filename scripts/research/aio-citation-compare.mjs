import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { classifyReferenceDestination } from "./aio-pilot-summary.mjs";

const KNOWN = new Set(["confirmed_main_aio", "main_absent"]);
const STATES = new Set([...KNOWN, "ambiguous_main_generated", "missing", "invalid"]);
const EVIDENCE = new Set(["exact_original_html", "exact_later_redirect"]);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const ratio = (n, d) => d > 0 ? n / d : null;
const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const sectorKey = c => typeof c.sector === "string" ? c.sector : c.sector?.id ?? "unspecified";
// Explicit offsets avoid machine-local date interpretation. Provider UTC strings are accepted.
const timestamp = value => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  && Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;

export function compareSets(earlier, later) {
  const a = new Set(earlier), b = new Set(later);
  const retained = [...a].filter(x => b.has(x));
  const noLongerObserved = [...a].filter(x => !b.has(x));
  const newlyObserved = [...b].filter(x => !a.has(x));
  const unionCount = new Set([...a, ...b]).size;
  return { earlierCount: a.size, laterCount: b.size, retained: retained.sort(),
    noLongerObserved: noLongerObserved.sort(), newlyObserved: newlyObserved.sort(),
    retention: ratio(retained.length, a.size), noLongerObservedShare: ratio(noLongerObserved.length, a.size),
    newlyObservedShare: ratio(newlyObserved.length, b.size), jaccard: ratio(retained.length, unionCount), unionCount };
}

function validateCapture(c) {
  assert.ok(c && typeof c.tag === "string" && c.tag, "Missing capture tag.");
  assert.ok(STATES.has(c.featureState), `Unknown feature state: ${c.tag}`);
  assert.ok(["desktop", "mobile"].includes(c.device), `Invalid device: ${c.tag}`);
  assert.ok(typeof c.queryId === "string" && typeof c.query === "string", `Missing query: ${c.tag}`);
  assert.ok(c.references === null || Array.isArray(c.references), `Invalid reference list: ${c.tag}`);
  if (c.featureState === "main_absent") assert.ok(Array.isArray(c.references) && c.references.length === 0,
    `Absent capture must have reviewed empty references: ${c.tag}`);
  const seen = new Set();
  for (const r of c.references ?? []) {
    assert.ok(typeof r.url === "string" && !seen.has(r.url), `Invalid/duplicate exact URL: ${c.tag}`);
    seen.add(r.url);
    const u = new URL(r.url);
    assert.ok(["http:", "https:"].includes(u.protocol), `Invalid reference protocol: ${c.tag}`);
    assert.equal(r.host, u.hostname.toLowerCase(), `Host differs from exact URL hostname: ${c.tag}`);
    const expectedClass = classifyReferenceDestination(r.url) === "google_product_view" ? "product" : "external";
    assert.equal(r.referenceClass, expectedClass, `Reference class differs from frozen classifier: ${c.tag}`);
  }
}

function setValidity(c, referenceClass) {
  if (!Array.isArray(c.references)) return "unknown_reference_set";
  if (!["known", "known_empty"].includes(c.referenceSetState)) return "unreviewed_reference_set_completeness";
  if (c.referenceSetState === "known_empty" && c.references.length) return "inconsistent_empty_reference_set";
  if (!c.references.length && c.referenceSetState !== "known_empty") return "unreviewed_empty_reference_set";
  return c.references.some(r => r.referenceClass === referenceClass && !EVIDENCE.has(r.destinationEvidenceState))
    ? `unresolved_${referenceClass}_citation_set` : null;
}

function requestMatches(c) {
  const expected = { keyword: c.query, location_name: "London,England,United Kingdom", language_code: "en",
    se_domain: "google.co.uk", device: c.device, os: c.device === "desktop" ? "windows" : "android",
    depth: 10, priority: 1, load_async_ai_overview: true, expand_ai_overview: true, tag: c.tag };
  return c.request && Object.entries(expected).every(([k, v]) => c.request[k] === v)
    && Object.keys(c.request).every(k => Object.hasOwn(expected, k));
}

function waveQuality(wave, config, context) {
  const reasons = [];
  const submitted = timestamp(wave.submittedAt), baseline = timestamp(wave.baselineSubmittedAt);
  const frozen = timestamp(wave.registration?.frozenAt);
  const times = wave.captures.map(c => timestamp(c.providerTimestamp)).filter(t => t !== null);
  const span = times.length ? Math.max(...times) - Math.min(...times) : null;
  if (submitted === null) reasons.push("missing_actual_submission_timestamp");
  if (baseline === null) reasons.push("missing_baseline_submission_timestamp");
  if (!context.protocolSha256 || !context.configSha256 || !context.panelSha256 || !context.panelCaptures) reasons.push("unverified_frozen_artifact_context");
  if (wave.registration?.protocolSha256 !== context.protocolSha256
    || wave.registration?.configSha256 !== context.configSha256
    || frozen === null || baseline === null || frozen > baseline) reasons.push("missing_or_late_protocol_registration");
  if (wave.retrospectiveExploratory !== false || wave.captures.some(c => c.retrospectiveExploratory !== false)
    || wave.runId === config.pilotRunId) reasons.push("retrospective_or_unregistered_input");
  if (!Array.isArray(wave.systemicMethodErrors)) reasons.push("systemic_error_review_missing");
  else if (wave.systemicMethodErrors.length) reasons.push("systemic_method_errors_hold_release");
  if (wave.captures.some(c => c.collectionEvidenceComplete === true && (
    typeof c.screenshotTaskId !== "string" || !c.screenshotTaskId || c.screenshotOriginalTaskId !== c.taskId
    || !/^[a-f0-9]{64}$/i.test(c.screenshotSha256 ?? "")))) reasons.push("missing_or_mismatched_screenshot_operation_provenance");
  if (wave.captures.some(c => typeof c.providerResultReturned !== "boolean"
    || (c.providerResultReturned && timestamp(c.providerTimestamp) === null)
    || (!c.providerResultReturned && (c.providerTimestamp != null || c.collectionEvidenceComplete === true)))) reasons.push("returned_timestamp_population_incomplete_or_inconsistent");
  if (!times.length || span > (config.maxProviderCaptureSpanMinutes ?? 30) * 60_000) reasons.push("provider_capture_span_outside_window");
  const inWindow = c => {
    const t = timestamp(c.providerTimestamp);
    return submitted !== null && t !== null && t >= submitted
      && t <= submitted + (config.maxProviderCaptureDelayMinutes ?? 60) * 60_000;
  };
  if (submitted === null || times.some(t => t < submitted || t > submitted + (config.maxProviderCaptureDelayMinutes ?? 60) * 60_000)) reasons.push("provider_capture_delay_outside_window");
  const waveIndex = config.waveIds?.indexOf(wave.waveId) ?? -1;
  let target = null;
  if (waveIndex < 0 || !Number.isFinite(config.repeatOffsetsDays?.[waveIndex]) || baseline === null) reasons.push("unknown_wave_schedule");
  else {
    target = baseline + config.repeatOffsetsDays[waveIndex] * 86_400_000;
    if (submitted === null || (waveIndex === 0 ? submitted !== baseline
      : Math.abs(submitted - target) > (config.repeatStartToleranceMinutes ?? 60) * 60_000)) reasons.push("submission_outside_registered_schedule");
  }
  const settingsMismatches = wave.captures.filter(c => !requestMatches(c)).map(c => c.tag);
  if (settingsMismatches.length) reasons.push("missing_or_changed_original_request_settings");
  const complete = wave.captures.filter(c => c.collectionEvidenceComplete === true && inWindow(c)).length;
  if (complete < (config.minimumCompleteCapturesPerWave ?? 95)) reasons.push("fewer_than_required_complete_timing_eligible_captures");
  return { reasons, submittedAt: wave.submittedAt ?? null, targetSubmissionAt: target === null ? null : new Date(target).toISOString(),
    returnedTimestampCount: times.length, providerSpanMilliseconds: span,
    completeTimingEligible: complete, settingsMismatchTags: settingsMismatches, inWindow };
}

function summary(pairs, field) {
  const sets = pairs.map(p => p[field]).filter(Boolean);
  const previous = sets.reduce((n, s) => n + s.earlierCount, 0), next = sets.reduce((n, s) => n + s.laterCount, 0);
  const retained = sets.reduce((n, s) => n + s.retained.length, 0), additions = sets.reduce((n, s) => n + s.newlyObserved.length, 0);
  const metric = name => { const values = sets.map(s => s[name]).filter(v => v !== null); return { mean: mean(values), eligiblePairs: values.length }; };
  return { eligiblePairs: sets.length, earlierOccurrences: previous, laterOccurrences: next, retainedOccurrences: retained,
    newlyObservedOccurrences: additions, noLongerObservedOccurrences: previous - retained, retention: metric("retention"),
    noLongerObservedShare: metric("noLongerObservedShare"), newlyObservedShare: metric("newlyObservedShare"), jaccard: metric("jaccard"),
    pooledRetention: ratio(retained, previous), pooledNoLongerObservedShare: ratio(previous - retained, previous),
    pooledNewlyObservedShare: ratio(additions, next) };
}

// Context hashes and panel rows come from independently loaded frozen files, not reviewed-input declarations.
export function compareCohorts(earlier, later, config = {}, context = {}) {
  assert.ok(Array.isArray(earlier.captures) && Array.isArray(later.captures), "Both inputs need capture arrays.");
  assert.ok(typeof earlier.panelSha256 === "string" && earlier.panelSha256 === later.panelSha256, "Panel hashes must match.");
  if (config.panelSha256) assert.equal(earlier.panelSha256, config.panelSha256, "Panel differs from study configuration.");
  if (context.panelSha256) assert.equal(earlier.panelSha256, context.panelSha256, "Panel file hash differs.");
  assert.ok(earlier.runId && later.runId && earlier.runId !== later.runId, "Different original wave runs are required.");
  const expected = config.captureCount ?? 100;
  const a = new Map(), b = new Map();
  for (const [wave, map] of [[earlier, a], [later, b]]) {
    assert.equal(wave.captures.length, expected, "Panel incomplete; retain missing-state rows.");
    for (const c of wave.captures) { validateCapture(c); assert.ok(!map.has(c.tag), `Duplicate tag ${c.tag}`); map.set(c.tag, c); }
    if (context.panelCaptures) {
      assert.equal(context.panelCaptures.length, expected, "Frozen panel shape differs.");
      for (const frozen of context.panelCaptures) {
        const c = map.get(frozen.tag);
        assert.ok(c, `Missing frozen query-device tag: ${frozen.tag}`);
        for (const field of ["queryId", "query", "device"]) assert.equal(c[field], frozen[field], `Changed frozen ${field}: ${c.tag}`);
        assert.equal(sectorKey(c), frozen.sectorId, `Changed frozen sector: ${c.tag}`);
        assert.equal(c.sector?.label, frozen.sectorLabel, `Changed frozen sector label: ${c.tag}`);
        assert.equal(c.intent, frozen.intent, `Changed frozen intent: ${c.tag}`);
      }
    }
  }
  assert.deepEqual([...a.keys()].sort(), [...b.keys()].sort(), "Wave tags differ.");
  const previousTasks = new Set(earlier.captures.map(c => c.taskId).filter(Boolean));
  const nextTasks = later.captures.map(c => c.taskId).filter(Boolean);
  assert.equal(new Set(nextTasks).size, nextTasks.length, "Later wave reuses a task ID within the wave.");
  assert.equal(previousTasks.size, earlier.captures.filter(c => c.taskId).length, "Earlier wave reuses a task ID.");
  assert.ok(nextTasks.every(id => !previousTasks.has(id)), "A task ID was reused across waves.");
  const screenshotIds = [earlier, later].flatMap(w => w.captures.map(c => c.screenshotTaskId).filter(Boolean));
  assert.equal(new Set(screenshotIds).size, screenshotIds.length, "A screenshot operation ID was reused within/across waves.");
  const leftQuality = waveQuality(earlier, config, context), rightQuality = waveQuality(later, config, context);
  const comparison = [earlier.waveId, later.waveId];
  const listed = list => list?.some(pair => pair[0] === comparison[0] && pair[1] === comparison[1]);
  const comparisonClass = listed(config.primaryWaveComparisons) ? "primary_adjacent"
    : listed(config.secondaryWaveComparisons) ? "secondary_baseline" : "unplanned_or_exploratory";
  const pairs = [], exclusions = [], productExclusions = [];
  const transitions = Object.fromEntries([...STATES].map(s => [s, Object.fromEntries([...STATES].map(t => [t, 0]))]));
  for (const [tag, left] of a) {
    const right = b.get(tag);
    for (const field of ["queryId", "query", "device"]) assert.equal(left[field], right[field], `Changed ${field}: ${tag}`);
    assert.equal(sectorKey(left), sectorKey(right), `Changed sector: ${tag}`);
    assert.equal(left.intent, right.intent, `Changed intent: ${tag}`);
    transitions[left.featureState][right.featureState]++;
    const reason = !KNOWN.has(left.featureState) || !KNOWN.has(right.featureState) ? "feature_unknown_or_invalid"
      : !leftQuality.inWindow(left) || !rightQuality.inWindow(right) ? "timing_ineligible"
        : !requestMatches(left) || !requestMatches(right) ? "request_settings_unverified"
          : left.collectionEvidenceComplete !== true || right.collectionEvidenceComplete !== true || !left.taskId || !right.taskId ? "incomplete_capture_evidence"
            : setValidity(left, "external") ?? setValidity(right, "external");
    if (reason) { exclusions.push({ tag, device: left.device, sector: sectorKey(left), earlierState: left.featureState, laterState: right.featureState, reason }); continue; }
    assert.ok(timestamp(right.providerTimestamp) > timestamp(left.providerTimestamp), `Non-increasing capture time: ${tag}`);
    const urls = (c, type) => c.references.filter(r => r.referenceClass === type).map(r => r.url);
    const hosts = c => c.references.filter(r => r.referenceClass === "external").map(r => r.host);
    const productReason = setValidity(left, "product") ?? setValidity(right, "product");
    if (productReason) productExclusions.push({ tag, reason: productReason });
    pairs.push({ tag, device: left.device, sector: sectorKey(left), earlierState: left.featureState, laterState: right.featureState,
      elapsedSeconds: (timestamp(right.providerTimestamp) - timestamp(left.providerTimestamp)) / 1000,
      externalUrls: compareSets(urls(left, "external"), urls(right, "external")),
      externalHosts: compareSets(hosts(left), hosts(right)), productViews: productReason ? null : compareSets(urls(left, "product"), urls(right, "product")) });
  }
  const primary = summary(pairs, "externalUrls");
  const perDevice = Object.fromEntries(["desktop", "mobile"].map(d => [d, summary(pairs.filter(p => p.device === d), "externalUrls")]));
  const perSector = Object.fromEntries([...new Set([...a.values()].map(sectorKey))].map(s => [s, summary(pairs.filter(p => p.sector === s), "externalUrls")]));
  const numericReasons = [];
  if (leftQuality.completeTimingEligible < (config.minimumCompleteCapturesPerWave ?? 95) || rightQuality.completeTimingEligible < (config.minimumCompleteCapturesPerWave ?? 95)) numericReasons.push("fewer_than_required_complete_timing_eligible_captures");
  if (pairs.length < (config.minimumIdentityResolvedPairs ?? 80)) numericReasons.push("fewer_than_required_identity_resolved_pairs");
  if (Object.values(perDevice).some(d => d.eligiblePairs < (config.minimumIdentityResolvedPairsPerDevice ?? 40))) numericReasons.push("fewer_than_required_pairs_for_a_device");
  if (primary.retention.eligiblePairs < (config.minimumRetentionPairs ?? 20)) numericReasons.push("fewer_than_required_nonempty_earlier_sets");
  const reasons = [...numericReasons, ...leftQuality.reasons.map(r => `earlier:${r}`), ...rightQuality.reasons.map(r => `later:${r}`)];
  if (comparisonClass === "unplanned_or_exploratory") reasons.push("comparison_not_in_frozen_plan");
  if (!earlier.baselineSubmittedAt || timestamp(earlier.baselineSubmittedAt) !== timestamp(later.baselineSubmittedAt)) reasons.push("baseline_anchors_differ_or_missing");
  if (["frozenAt", "protocolSha256", "configSha256"].some(k => earlier.registration?.[k] !== later.registration?.[k])) reasons.push("wave_registration_records_differ");
  const publicQuality = quality => { const { inWindow, ...rest } = quality; void inWindow; return rest; };
  return { schemaVersion: "1.1.0", artifactType: "aio-citation-comparison", earlierRunId: earlier.runId, laterRunId: later.runId,
    panelSha256: earlier.panelSha256, comparisonClass,
    statisticsStatus: reasons.length ? "diagnostic_only_not_release_eligible" : "eligible_for_independent_release_review",
    publicationGate: { numericEligibilityPass: numericReasons.length === 0, prospectiveProtocolEligibilityPass: reasons.length === 0,
      releaseApproved: false, reasons: [...new Set(reasons)],
      finalReleaseStillRequires: "Independent raw-evidence, manual feature/source coding, exact dataset/chart and rendered-page review; this engine never approves release." },
    waveQuality: { earlier: publicQuality(leftQuality), later: publicQuality(rightQuality) },
    coverage: { plannedPairs: expected, earlierCompleteTimingEligible: leftQuality.completeTimingEligible,
      laterCompleteTimingEligible: rightQuality.completeTimingEligible, eligiblePairs: pairs.length, excludedPairs: exclusions.length },
    primary, conditionalBothConfirmed: summary(pairs.filter(p => p.earlierState === "confirmed_main_aio" && p.laterState === "confirmed_main_aio"), "externalUrls"),
    secondaryExactHosts: summary(pairs, "externalHosts"), separateGoogleProductViews: {
      scope: "Product-valid subset of primary external-set-eligible pairs; not the full product-reference panel.",
      ...summary(pairs, "productViews") },
    perDevice, perSector, transitions, exclusions, productExclusions, pairs };
}

async function main() {
  const [before, after, output] = process.argv.slice(2);
  if (!before || !after || !output) throw new Error("Usage: node scripts/research/aio-citation-compare.mjs <earlier-reviewed.json> <later-reviewed.json> <output.json>");
  const configPath = "docs/research/ai-overview-citation-study.json";
  const bytes = await Promise.all([readFile(before), readFile(after), readFile(configPath)]);
  const config = JSON.parse(bytes[2]);
  const [protocolBytes, panelBytes] = await Promise.all([readFile(config.protocolPath), readFile(config.panelPath)]);
  const panel = JSON.parse(panelBytes);
  const panelCaptures = panel.sectors.flatMap(s => s.queries.flatMap(q => ["desktop", "mobile"].map(device => ({
    tag: `${q.id}-${device}`, queryId: q.id, query: q.query, device, sectorId: s.id, sectorLabel: s.label, intent: q.intent }))));
  const result = compareCohorts(JSON.parse(bytes[0]), JSON.parse(bytes[1]), config, {
    protocolSha256: hash(protocolBytes), configSha256: hash(bytes[2]), panelSha256: hash(panelBytes), panelCaptures });
  result.generatedAt = new Date().toISOString();
  result.inputs = [before, after, configPath, config.protocolPath, config.panelPath].map((file, i) => ({
    path: file, sha256: hash([...bytes, protocolBytes, panelBytes][i]) }));
  await writeFile(path.resolve(output), JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ output, coverage: result.coverage, publicationGate: result.publicationGate }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(e => { console.error(e.message); process.exitCode = 1; });
