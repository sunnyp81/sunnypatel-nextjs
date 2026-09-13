import assert from "node:assert/strict";
import test from "node:test";
import { compareCohorts, compareSets } from "./aio-citation-compare.mjs";

// Synthetic fixtures only: these are not study observations or future collection evidence.
const baseTime = Date.parse("2026-09-13T10:00:00Z");
const ref = url => ({ url, host: new URL(url).hostname, referenceClass: "external", destinationEvidenceState: "exact_original_html" });
const gate = { captureCount: 4, panelSha256: "fixture-panel", minimumCompleteCapturesPerWave: 3,
  minimumIdentityResolvedPairs: 2, minimumIdentityResolvedPairsPerDevice: 1, minimumRetentionPairs: 1,
  waveIds: ["w1", "w2", "w3", "w4"], repeatOffsetsDays: [0, 7, 14, 21],
  primaryWaveComparisons: [["w1", "w2"], ["w2", "w3"], ["w3", "w4"]], secondaryWaveComparisons: [["w1", "w3"], ["w1", "w4"]] };
function cohort(waveId, states) {
  const submitted = baseTime + (Number(waveId.slice(1)) - 1) * 7 * 86_400_000;
  return { runId: `fixture-${waveId}`, waveId, panelSha256: "fixture-panel", submittedAt: new Date(submitted).toISOString(),
    baselineSubmittedAt: new Date(baseTime).toISOString(), retrospectiveExploratory: false, systemicMethodErrors: [],
    registration: { frozenAt: "2026-09-13T09:00:00Z", protocolSha256: "fixture-protocol", configSha256: "fixture-config" },
    captures: states.map(([featureState, urls], i) => {
      const c = { tag: `q-${i}`, queryId: `q${i}`, query: `query ${i}`, sector: { id: "fixture-sector", label: "Fixture" },
        intent: "informational", screenshotTaskId: `screenshot-${waveId}-${i}`, screenshotOriginalTaskId: `${waveId}-${i}`, screenshotSha256: "a".repeat(64),
        device: i % 2 ? "mobile" : "desktop", taskId: `${waveId}-${i}`, providerTimestamp: new Date(submitted + 60_000).toISOString(),
        providerResultReturned: true, retrospectiveExploratory: false, collectionEvidenceComplete: true, timingEligible: true,
        featureState, referenceSetState: urls === null ? "unknown" : urls.length ? "known" : "known_empty", references: urls?.map(ref) ?? null };
      c.request = { keyword: c.query, location_name: "London,England,United Kingdom", language_code: "en", se_domain: "google.co.uk",
        device: c.device, os: c.device === "desktop" ? "windows" : "android", depth: 10, priority: 1,
        load_async_ai_overview: true, expand_ai_overview: true, tag: c.tag };
      return c;
    }) };
}
const present = n => Array.from({ length: n }, () => ["confirmed_main_aio", ["https://a.test/"]]);
const context = wave => ({ protocolSha256: "fixture-protocol", configSha256: "fixture-config", panelSha256: "fixture-panel",
  panelCaptures: wave.captures.map(({ tag, queryId, query, device, sector, intent }) => ({ tag, queryId, query, device, sectorId: sector.id, sectorLabel: sector.label, intent })) });
const compare = (a, b, config = gate) => compareCohorts(a, b, config, context(a));

test("set changes use declared denominators, including absence and empty-set undefined values", () => {
  assert.deepEqual([compareSets([], []).retention, compareSets([], []).jaccard, compareSets([], []).noLongerObservedShare], [null, null, null]);
  const lost = compareSets(["a"], []);
  assert.equal(lost.retention, 0); assert.equal(lost.noLongerObservedShare, 1); assert.equal(lost.jaccard, 0);
  assert.equal(compareSets([], ["a"]).newlyObservedShare, 1);
  const changed = compareSets(["a", "b", "b"], ["b", "c"]);
  assert.deepEqual([changed.retention, changed.noLongerObservedShare, changed.newlyObservedShare, changed.jaccard], [0.5, 0.5, 0.5, 1 / 3]);
});

test("disappearance counts loss, ambiguity excludes the pair, and product failure leaves external set usable", () => {
  const a = cohort("w1", [["confirmed_main_aio", ["https://a.test/one"]], ["confirmed_main_aio", ["https://b.test/"]], ["main_absent", []], ["confirmed_main_aio", ["https://c.test/"]]]);
  const b = cohort("w2", [["main_absent", []], ["ambiguous_main_generated", ["https://b.test/"]], ["confirmed_main_aio", ["https://d.test/"]], ["confirmed_main_aio", ["https://c.test/"]]]);
  a.captures[3].references.push({ ...ref("https://google.com/search?q=product"), referenceClass: "product", destinationEvidenceState: "unresolved" });
  const result = compare(a, b);
  assert.equal(result.coverage.eligiblePairs, 3);
  assert.equal(result.primary.retention.mean, 0.5);
  assert.equal(result.primary.noLongerObservedShare.mean, 0.5);
  assert.equal(result.primary.retention.eligiblePairs, 2);
  assert.equal(result.conditionalBothConfirmed.retention.mean, 1);
  assert.equal(result.separateGoogleProductViews.eligiblePairs, 2);
  assert.equal(result.productExclusions[0].reason, "unresolved_product_citation_set");
  assert.equal(result.transitions.confirmed_main_aio.ambiguous_main_generated, 1);
});

test("pair means differ from pooled retention; exact hosts preserve www and URL tracking differences", () => {
  const a = cohort("w1", [["confirmed_main_aio", ["https://www.a.test/a", "https://www.a.test/b", "https://www.a.test/c", "https://www.a.test/d"]], ["confirmed_main_aio", ["https://b.test/"]], ["main_absent", []], ["main_absent", []]]);
  const b = cohort("w2", [["confirmed_main_aio", ["https://www.a.test/a"]], ["confirmed_main_aio", ["https://b.test/"]], ["main_absent", []], ["main_absent", []]]);
  const result = compare(a, b);
  assert.equal(result.primary.retention.mean, 0.625);
  assert.equal(result.primary.pooledRetention, 0.4);
  assert.equal(result.secondaryExactHosts.retention.mean, 1);
  b.captures[0].references = [ref("https://a.test/a?tracking=1")];
  assert.equal(compare(a, b).secondaryExactHosts.retention.mean, 0.5);
});

test("unresolved external destination or null set excludes the entire capture set without dropping individual URLs", () => {
  const a = cohort("w1", present(4)), b = cohort("w2", present(4));
  b.captures[0].references.push({ ...ref("https://unresolved.test/"), destinationEvidenceState: "unresolved" });
  b.captures[1].references = null; b.captures[1].referenceSetState = "unknown";
  const result = compare(a, b);
  assert.equal(result.coverage.eligiblePairs, 2);
  assert.equal(result.primary.earlierOccurrences, 2);
  assert.deepEqual(result.exclusions.map(e => e.reason), ["unresolved_external_citation_set", "unknown_reference_set"]);
  b.captures[2].references = []; b.captures[2].referenceSetState = "unknown";
  assert.equal(compare(a, b).coverage.eligiblePairs, 1);
});

test("actual timing catches excluded outliers and delayed compact batches despite true timing flags", () => {
  const a = cohort("w1", present(4)), b = cohort("w2", present(4));
  b.captures[0].featureState = "ambiguous_main_generated";
  b.captures[0].providerTimestamp = "2026-09-20T10:45:00Z";
  const span = compare(a, b);
  assert.ok(span.publicationGate.reasons.includes("later:provider_capture_span_outside_window"));
  assert.equal(span.waveQuality.later.returnedTimestampCount, 4);
  for (const c of b.captures) c.providerTimestamp = "2026-09-20T12:00:00Z";
  const delayed = compare(a, b);
  assert.equal(delayed.waveQuality.later.providerSpanMilliseconds, 0);
  assert.ok(delayed.publicationGate.reasons.includes("later:provider_capture_delay_outside_window"));
  assert.equal(delayed.coverage.eligiblePairs, 0);
  delete b.captures[0].providerTimestamp;
  assert.ok(compare(a, b).publicationGate.reasons.includes("later:returned_timestamp_population_incomplete_or_inconsistent"));
});

test("prospective registration, request settings, systemic review and real schedule all fail closed", () => {
  const a = cohort("w1", present(4)), b = cohort("w2", present(4));
  const valid = compare(a, b);
  assert.equal(valid.publicationGate.prospectiveProtocolEligibilityPass, true);
  assert.equal(valid.publicationGate.releaseApproved, false);
  for (const mutate of [
    w => { delete w.registration; },
    w => { w.registration.frozenAt = "2026-09-14T00:00:00Z"; },
    w => { w.retrospectiveExploratory = true; },
    w => { delete w.systemicMethodErrors; },
    w => { w.systemicMethodErrors = ["incomplete extraction branch"]; },
    w => { w.captures[0].request.location_name = "United Kingdom"; },
    w => { w.captures[0].screenshotOriginalTaskId = "other-search-task"; },
    w => { w.submittedAt = "2026-09-20T11:01:00Z"; },
  ]) {
    const changed = structuredClone(b); mutate(changed);
    assert.equal(compare(a, changed).publicationGate.prospectiveProtocolEligibilityPass, false);
  }
  assert.equal(compareCohorts(a, b, gate).publicationGate.prospectiveProtocolEligibilityPass, false);
});

test("frozen plan distinguishes adjacent and baseline-secondary comparisons; it rejects unplanned intervals", () => {
  const a = cohort("w1", present(4)), b = cohort("w2", present(4)), c = cohort("w3", present(4)), d = cohort("w4", present(4));
  assert.equal(compare(a, b).comparisonClass, "primary_adjacent");
  assert.equal(compare(a, c).comparisonClass, "secondary_baseline");
  assert.equal(compare(b, d).comparisonClass, "unplanned_or_exploratory");
  assert.equal(compare(b, d).publicationGate.prospectiveProtocolEligibilityPass, false);
  assert.equal(compare(c, d).publicationGate.prospectiveProtocolEligibilityPass, true);
});

test("40 per-device gate still fails when total known pairs exceed 80", () => {
  const a = cohort("w1", present(100)), b = cohort("w2", present(100));
  for (let i = 1; i < 22; i += 2) b.captures[i].featureState = "ambiguous_main_generated";
  const config = { ...gate, captureCount: 100, minimumCompleteCapturesPerWave: 95, minimumIdentityResolvedPairs: 80,
    minimumIdentityResolvedPairsPerDevice: 40, minimumRetentionPairs: 20 };
  const result = compare(a, b, config);
  assert.equal(result.coverage.eligiblePairs, 89);
  assert.equal(result.perDevice.mobile.eligiblePairs, 39);
  assert.ok(result.publicationGate.reasons.includes("fewer_than_required_pairs_for_a_device"));
});

test("refuses reused tasks, mutated frozen query contracts and misclassified Google lookalikes", () => {
  const a = cohort("w1", present(4)), b = cohort("w2", present(4));
  b.captures[0].taskId = a.captures[0].taskId;
  assert.throws(() => compare(a, b), /reused across waves/);
  b.captures[0].taskId = "fresh";
  b.captures[0].query = "changed";
  assert.throws(() => compare(a, b), /Changed frozen query/);
  b.captures[0].query = a.captures[0].query;
  b.captures[0].sector.id = "wrong-sector";
  assert.throws(() => compare(a, b), /Changed frozen sector/);
  b.captures[0].sector.id = "fixture-sector";
  b.captures[0].screenshotTaskId = a.captures[0].screenshotTaskId;
  assert.throws(() => compare(a, b), /screenshot operation ID was reused/);
  b.captures[0].screenshotTaskId = "fresh-screenshot";
  b.captures[0].references = [{ ...ref("https://google.com.evil.test/search?q=product"), referenceClass: "product" }];
  assert.throws(() => compare(a, b), /Reference class differs/);
});

test("legacy retrospective exports remain readable without fabricated new provenance and cannot pass", () => {
  const a = cohort("w1", present(4)), b = cohort("w2", present(4));
  for (const wave of [a, b]) {
    wave.retrospectiveExploratory = true;
    delete wave.registration; delete wave.submittedAt; delete wave.baselineSubmittedAt;
    for (const c of wave.captures) { delete c.request; delete c.providerResultReturned; c.retrospectiveExploratory = true; }
  }
  const result = compare(a, b);
  assert.equal(result.publicationGate.prospectiveProtocolEligibilityPass, false);
  assert.equal(result.publicationGate.releaseApproved, false);
  assert.equal(result.coverage.excludedPairs, 4);
  assert.ok(result.publicationGate.reasons.includes("earlier:missing_actual_submission_timestamp"));
});
