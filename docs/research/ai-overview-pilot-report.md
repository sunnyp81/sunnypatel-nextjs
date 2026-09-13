# Google AI Overview methods pilot: 12 September 2026

**The pilot collected all 100 planned captures and validated the main structured-reference extraction process. Hold before a larger study:** six returned summaries retain unresolved feature identity, and embedded-answer payload coverage remains unvalidated. This is an internal methods report; no UK prevalence finding has been published.

## What was collected

The frozen editorial panel contains 50 queries in ten sectors, each collected once on desktop and once on mobile. A separate four-capture proof was reviewed before submitting the fresh 100-capture wave; none of its tasks or screenshots was reused. The full run is `2026-09-12T21-53-08-862Z-3c829f`.

Requests fixed London, English, google.co.uk, depth 10, desktop/Windows or mobile/Android, normal priority, asynchronous AIO loading and expanded AIO HTML. Provider timestamps span **21:53:10–22:03:39 UTC**, or 10 minutes 29 seconds. The largest desktop/mobile gap for one query is **9 minutes 57 seconds**; paired differences cannot be attributed solely to device.

All 100 captures have structured results, HTML and screenshots. Independent inspection checked all **600 evidence files** against their recorded hashes and byte counts, with no mismatch. All 100 screenshots and all nine main-feature absences were reviewed. Screenshots render the provider's retained HTML; they are not independent second observations of Google. Expanded asynchronous retrieval does not measure an ordinary visitor's initial viewport. [Provider request options](https://docs.dataforseo.com/v3/serp-google-type-task_post/), [screenshot method](https://docs.dataforseo.com/v3/serp_screenshot/).

## Observations and evidence limits

| Measure | Full-wave count | Interpretation |
|---|---:|---|
| Planned captures with saved usable collection evidence | 100/100 | Passes the original 95-of-100 engineering threshold |
| Provider-returned main AIO with content | 91 | Provider classification, not independently confirmed feature identity in every case |
| Visibly labelled main AI Overview | 85 | Literal heading observed in screenshot review |
| Generated body present without visible AIO heading | 6 | Matching returned content, but feature identity remains unresolved |
| Reviewed provider-reported main absence | 9 | No unexplained main-feature false negative found in this reviewed set |
| Embedded asynchronous placeholder nodes | 368 across 92 captures | All have null items and references; completed embedded-answer extraction is unvalidated |

The six ambiguous captures are `pms-05-mobile`, `web-01-desktop`, `ems-01-desktop`, `off-02-desktop`, `lug-03-desktop` and `cof-01-desktop`. Readable crops corroborate the returned body and selected All-results tab. That does not establish the product feature's identity. A readable recheck corrected `off-02-mobile` from heading absent to heading present before aggregation.

There are **94 identity-resolved main-feature observations**: 85 labelled positives plus nine reviewed absences. This is a separate diagnostic from delivery usability. The original protocol did not explicitly require a literal heading; the hold follows its zero-unresolved-evidence gate and incomplete feature-coding rules, rather than a retrospectively invented numerical threshold.

## Source extraction

The unit is a distinct exact structured-reference URL **within a capture**. Repeated URLs across captures count again. There are **731 such observations**: 639 external destinations and 92 Google product-view destinations.

Of the 639 external destinations, **413** occur exactly in the saved main-AIO subtree; **226** are corroborated by separately timestamped checks of opaque Google links preserved in that subtree. All 92 product-view destinations have exact original-subtree support. The combined total is 505 original-HTML matches and 226 later redirect matches, with no unresolved destination in this structured-reference set.

Later redirect evidence is not original plaintext evidence. Checks stopped before fetching external destination pages; this validates captured destination provenance, not the publisher's factual claims. Direct answer hyperlinks and image assets were recorded separately and are not all destination-verified. Embedded placeholders provide no citation payload. No blanket claim that every parsed link or embedded citation was validated is supported.

The raw export retains 846 returned organic URL records with provider ranks. **214 structured-reference observations** match an organic URL byte-for-byte within the same capture. No canonicalisation was applied; the remaining references cannot be described as ranking outside the top ten from this comparison.

## Actual API usage and repairs

The four-capture proof used **$0.0202**. The full wave used **$0.5134**: $0.1134 for completed search tasks and $0.4000 for 100 screenshots. Combined provider usage was **$0.5336**, leaving approximately **$0.4664** of the trial credit. No top-up was made.

The full-wave opening balance of $0.9798 and closing balance of $0.4664 independently reconcile its cost. The proof's initial $1 balance was observed in tool output, but its initial file was overwritten on resume; its archived snapshots only independently confirm the last screenshot debit. Its unique-task ledger still reconciles to $0.0202.

Repairs preserve opening balance snapshots on resume, reconcile repeated GET cost fields without double counting, reject malformed cost values, and finish downloading an already purchased screenshot without purchasing it twice. Final collector/accounting checks passed 19 tests; the summary helper passed two focused classification tests. [Provider cost-field semantics](https://dataforseo.com/help-center/how-to-track-api-usage-with-tag).

## Decision and next research asset

**Acquisition and main structured-reference provenance pass; expansion is on hold.** Before further collection, prospectively define how unlabelled generated bodies, missing embedded payloads and direct answer links enter each denominator. Keep separate confirmed, ambiguous, absent and failed states. Validate any expanded extraction scope with a further proof before treating it as reliable.

My recommendation is a **fixed-panel citation-persistence study**: repeat the same preregistered queries at declared intervals and measure which source URLs remain, appear or disappear. Release dated aggregate results, a downloadable URL-level dataset, explicit denominators and a revision log. Report labelled main AIO separately from ambiguous generated summaries, and keep Google product views separate from external sources. These recurring observations could give writers a concrete first-party result to cite.

This pilot supplies a baseline and working collection process, not persistence findings. A future protocol must freeze wave timing, missingness rules, exact-URL and host-level measures, and feature handling before another collection. The convenience sample has no search-volume weighting or national sampling frame. It cannot establish UK-wide rates, sector market share, click loss, conversions or causal ranking effects.

## Reproduction and audit files

- [Frozen panel](ai-overview-pilot-panel.json) and [collection protocol](ai-overview-pilot-protocol.md).
- [Raw-data summary](../../tmp/ctr-aio/full-wave-data-summary.json) and [offline summary helper](../../scripts/research/aio-pilot-summary.mjs).
- [Final capture-level review](../../tmp/ctr-aio/full-wave-final-review.json) and [independent methodology review](../../tmp/ctr-aio/full-wave-method-review.md).
- [Part A evidence coding](../../tmp/ctr-aio/full-review/part-a/part-a-review.json) and [part B evidence coding](../../tmp/ctr-aio/full-review/part-b/capture-review.json).
- [Later redirect receipts](../../tmp/ctr-aio/full-wave-redirect-reconciliation.json), [invariant audit](../../tmp/ctr-aio/full-wave-invariants-audit.json) and [redirect audit](../../tmp/ctr-aio/full-wave-redirect-provenance-audit.json).

Raw HTML, screenshots and review sidecars remain in the ignored local research directory. This report and tooling have been saved locally; the pilot has not been published as a public study.
