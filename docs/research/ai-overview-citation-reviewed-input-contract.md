# AI Overview citation study: reviewed-input contract

This contract defines the reviewed wave JSON accepted by the prospective comparison engine. It is a schema and validation boundary, not evidence that a wave is eligible or approval to publish a result.

## Wave-level requirements

Each prospective wave must contain:

- a unique `runId`, the frozen `panelSha256`, a `waveId` from `w1` through `w4`, and all 100 planned capture rows;
- `submittedAt`, set to the actual UTC batch-submission timestamp, and `baselineSubmittedAt`, set to the same actual W1 anchor in every wave;
- `registration: { frozenAt, protocolSha256, configSha256 }`, identical across waves and frozen no later than W1 submission;
- `retrospectiveExploratory: false`; and
- `systemicMethodErrors: []`, populated only after explicit review. A missing declaration is not equivalent to a clear review.

Historical P0 exports remain retrospective. They must not be given fabricated prospective registration or wave metadata. Missing prospective metadata produces explicit failed-gate reasons while preserving the ability to read historical reviewed inputs.

## Capture-level requirements

Every capture must retain:

- `tag`, `queryId`, `query`, `sector: { id, label }`, `intent`, `device`, `taskId`, `providerTimestamp`, `collectionEvidenceComplete`, feature state, and reference records;
- the original `request` object with exactly the frozen keyword, London location, language, domain, device and operating system, depth, priority, asynchronous and expansion flags, and tag;
- `providerResultReturned` as an explicit boolean. Every returned result requires an offset-qualified provider timestamp, including ambiguous and invalid rows. A no-result row cannot carry a provider timestamp or claim complete evidence;
- `screenshotTaskId`, `screenshotOriginalTaskId` matching the original search task, and a 64-character hexadecimal `screenshotSha256` for complete captures;
- `retrospectiveExploratory: false`; and
- `referenceSetState` as `known`, `known_empty`, or `unknown`.

Operation IDs must be unique within and across waves. Identical screenshot content alone does not invalidate a wave.

Unknown reference sets may use `references: null`. A reviewed absence requires an empty list. Every reference retains its byte-exact URL, parsed lowercase hostname, frozen external or product classification, and exact original-HTML or later-redirect destination evidence class. Any unresolved external destination invalidates that capture's entire external reference set. An unresolved product destination invalidates the product subset while preserving independently verified external analysis.

## Independent validation

The engine derives timing eligibility from the actual submission time and every returned provider timestamp, including excluded capture states. It does not trust an input `timingEligible` boolean.

The CLI independently reads and hashes the configured protocol, study configuration, and panel. Library callers must provide the fourth `context` argument containing those three hashes and the frozen `panelCaptures` rows with `tag`, `queryId`, `query`, `device`, `sectorId`, `sectorLabel`, and `intent`. Omitted context cannot pass prospective eligibility.

The engine reports numeric eligibility, prospective protocol eligibility, and statistics status separately. `releaseApproved` remains false. Reviewed input metadata is evidence for validation; it is not independent proof that the underlying observations are true.

Retention, removal, addition, and Jaccard results use explicit denominators and explicit undefined states. Unweighted pair means remain separate from pooled occurrence ratios. The engine enforces the registered total, complete-capture, nonempty-set, and per-device pair thresholds, and it distinguishes adjacent, baseline-secondary, and unplanned wave comparisons.
