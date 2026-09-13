import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  assembleReviewedWave,
  inspectReviewedWaveInputs,
  loadCaptureReports,
} from "./aio-citation-wave-export.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const REVIEW = path.join(ROOT, "tmp/ctr-aio/citation-study/reviews/w1/2026-09-13T11-02-11-001Z-af4da6");
const options = {
  reviewDirectory: REVIEW,
  visualReview: path.join(ROOT, "tmp/ctr-aio/citation-study/review-w1/visual/visual-review.json"),
  completenessReview: path.join(ROOT, "tmp/ctr-aio/citation-study/review-w1/visual/reference-completeness-review.json"),
  redirectReview: path.join(REVIEW, "redirect-review.json"),
};
const HAS_LOCAL_W1_EVIDENCE = process.env.AIO_TEST_WITH_LOCAL_W1_EVIDENCE !== "0"
  && Object.values(options).every(file => existsSync(file))
  && existsSync(path.join(REVIEW, "wave-evidence-review.json"));
const inspection = HAS_LOCAL_W1_EVIDENCE ? inspectReviewedWaveInputs(options) : null;

test("rejects an incomplete capture index without local study evidence", async () => {
  await assert.rejects(loadCaptureReports(REVIEW, { captureReports: [] }), /does not contain 100 capture reports/);
});

test("preserves unknown/null references and ambiguous feature identity", { skip: !HAS_LOCAL_W1_EVIDENCE }, async () => {
  const { output } = await inspection;
  const unknown = output.captures.find(row => row.tag === "cof-02-desktop");
  assert.equal(unknown.featureState, "confirmed_main_aio");
  assert.equal(unknown.referenceSetState, "unknown");
  assert.equal(unknown.references, null);
  assert.equal(unknown.referenceExclusionReason, "reference_set_completeness_unknown");

  const ambiguous = output.captures.filter(row => row.featureState === "ambiguous_main_generated");
  assert.deepEqual(ambiguous.map(row => row.tag).sort(), ["sto-04-desktop", "sto-04-mobile"]);
  assert.ok(ambiguous.every(row => row.exclusionReason && row.referenceSetState === "known"));
  assert.equal(output.summary.primaryComparisonEligibleCaptures, 97);
});

test("missing or stale parent acknowledgement cannot create output", { skip: !HAS_LOCAL_W1_EVIDENCE }, async () => {
  const directory = await mkdtemp(path.join(ROOT, "tmp/ctr-aio/citation-study/wave-export-test-"));
  const outputFile = path.join(directory, "reviewed.json");
  try {
    await assert.rejects(assembleReviewedWave({
      ...options,
      systemicAcknowledgement: path.join(directory, "missing.json"),
      outputFile,
    }), /acknowledgement could not be read/);

    const canonicalAck = JSON.parse(await readFile(path.join(REVIEW, "systemic-review-acknowledgement.json"), "utf8"));
    canonicalAck.sourceSha256.visualReview = "0".repeat(64);
    const staleAck = path.join(directory, "stale-ack.json");
    await writeFile(staleAck, `${JSON.stringify(canonicalAck, null, 2)}\n`, "utf8");
    await assert.rejects(assembleReviewedWave({ ...options, systemicAcknowledgement: staleAck, outputFile }), /does not hash-pin/);
    await assert.rejects(readFile(outputFile), error => error.code === "ENOENT");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("changed capture-report hash is refused", { skip: !HAS_LOCAL_W1_EVIDENCE }, async () => {
  const index = JSON.parse(await readFile(path.join(REVIEW, "wave-evidence-review.json"), "utf8"));
  index.captureReports[0].sha256 = "f".repeat(64);
  await assert.rejects(loadCaptureReports(REVIEW, index), /capture report hash\/tag mismatch/);
});
