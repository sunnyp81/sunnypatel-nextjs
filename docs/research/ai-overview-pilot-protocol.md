# London-localised Google AI Overview pilot

Status: four-capture proof and separate fresh 100-capture methods pilot collected and reviewed on 12 September 2026. Acquisition and main structured-reference provenance pass; expansion is on hold for unresolved feature identity and unvalidated extraction scope. See the [pilot quality report](ai-overview-pilot-report.md). Proof run: 2026-09-12T21-37-45-600Z-8db716. Full wave: 2026-09-12T21-53-08-862Z-3c829f. The panel remains the version frozen on 12 September 2026 in ai-overview-pilot-panel.json. No population or sector finding has been published.

## Research question and sample

Can the selected provider consistently return auditable AI Overview presence and citation data for a fixed set of UK-English commercial tasks on desktop and mobile?

The editorial convenience panel contains 50 fixed queries: five in each of ten sectors. Three sectors concern software and seven concern consumer products. Each sector has two informational queries, two commercial-investigation queries and one transactional query. The labels are editorial classifications, not measured intent or demand.

The panel has no search-volume weighting or national sampling frame. Its sector mix is deliberately narrow for collection testing. London-localised results do not represent every UK location or all searches in a sector. The later industry study needs its own preregistered selection and coverage rules.

## Collection contract

Use DataForSEO Google Organic SERP Standard tasks at normal priority. Fix location to London,England,United Kingdom, language to en and Google domain to google.co.uk. Observe each query on desktop/Windows and mobile/Android at depth 10. Request asynchronous AI Overview loading and expanded AI Overview HTML. Keep exact request JSON, task ID, provider timestamp, UTC retrieval timestamp and panel hash.

These settings retrieve asynchronously loaded content and expand the AIO in HTML. The pilot does not measure an ordinary visitor's initial, unexpanded viewport or actual exposure/clicks. Report the retrieval settings with any later findings. [Provider request options](https://docs.dataforseo.com/v3/serp-google-type-task_post/).

First collect four proof captures: pms-01 and off-05 on both devices. These cover an informational software task and a transactional furniture task. They are a technical proof, not a positive/negative control with a known expected answer.

Inspect all four returned JSON records, raw HTML and task-linked screenshots. Confirm query, requested location, device, observable text and extracted source URLs agree as far as the returned evidence permits. An echoed request location confirms the requested setting, not independent proof of every Google localisation signal. A screenshot generated from saved HTML is a rendering of that capture, not an independent second observation.

If the four captures contain no AI Overview with citations, the positive extraction path remains unvalidated. Additional proof queries or a later repeat would need a separately recorded collection decision. Do not replace the frozen panel after seeing results to manufacture an interesting rate.

Proceed to a fresh 100-capture wave only after the proof has been reviewed. Re-collect all 50 query/device pairs in that wave; keep the proof separate. Record elapsed collection span, provider failures and missing captures. Use a new run directory and hash every raw evidence file.

## Evidence and coding

Preserve the original provider envelopes, Advanced result, HTML response and downloaded screenshot in the ignored local run directory. Keep credentials in a user-level secret file or process environment. No credentials, raw Google HTML or screenshots belong in the public Next.js directory or the Git repository.

Distinguish provider failure, pending response, structurally invalid result, detected but incomplete AI Overview, main AI Overview with parsed content, embedded AI Overview and provider-reported absence. A missing or null result is never absence. Record reference URLs, normalised hosts, visible organic URLs/ranks and citation overlap where the returned fields support it. Do not silently merge main and embedded features.

Separate request success, readable evidence, presence agreement and source extraction agreement. A successful API response does not demonstrate a correct parser. Save reviewer-coded observations separately from automatic fields and retain disagreements.

DataForSEO documents screenshots as a rendering of the task's HTML. It does not explicitly guarantee that every expanded asynchronous AI Overview appears in that screenshot. This must be tested. HTML and screenshot retention is short; save both during the same run. [Screenshot documentation](https://docs.dataforseo.com/v3/serp_screenshot/).

## Advance or stop

Before starting a larger study, require at least 95 of the 100 planned captures to have usable structured data and saved evidence. Report failures as their own count and use explicit denominators. This proposed engineering threshold is not a statistical confidence level.

Manually review every detected main or embedded AI Overview in the pilot, plus at least one provider-reported absence per sector/device combination where available. If that means all 100 records, inspect all 100. Check every parsed citation against the retained source evidence. Retain a record for every checked URL and every mismatch.

Advance only when unresolved evidence/parser mismatches are zero in the reviewed set, at least one AIO-positive extraction has been validated and the absence checks show no unexplained false negatives. An all-absent wave can validate capture delivery but cannot validate positive source extraction. A reviewer's inability to see the AIO in the saved HTML/screenshot is an evidence gap, not automatic proof that the API is wrong.

The output is a pilot quality report: attempted captures, usable captures, feature states, evidence agreement and defects. Do not publish a sector prevalence headline from five queries. Do not infer clicks, national zero-click behaviour, conversions or causal ranking effects from these captures.

## Costs and execution boundary

At the rates checked on 12 September 2026, the planned normal-priority request costs up to $0.0012 including the asynchronous AIO add-on. A screenshot costs $0.004. Four proof captures reserve $0.0208; 100 fresh captures reserve $0.52; both together reserve $0.5408 before any extra requests. These estimates assume depth 10, no rectangles and no retries. [Google Organic pricing](https://dataforseo.com/pricing/serp/google-organic-serp-api), [task options](https://docs.dataforseo.com/v3/serp-google-type-task_post/), [screenshot price](https://docs.dataforseo.com/v3/serp_screenshot/).

DataForSEO advertises $1 registration credit and pay-as-you-go billing with a $50 minimum top-up. Start with the legitimate free account. No top-up, subscription or new account has been made by this work. Check account balance through the free user-data endpoint before billable task creation. The runner has a $1 per-run hard limit and no automatic billable retries. Check cumulative proof/full-wave spending too. [Trial](https://dataforseo.com/help-center/how-does-your-free-unlimited-trial-work), [minimum payment](https://dataforseo.com/pricing), [balance endpoint](https://docs.dataforseo.com/v3/appendix-user-data/).

The account owner supplied access for the live proof after the collector passed offline tests and independent review. Credentials are held outside the repository. Default execution still prepares the request manifest without a network call. Successful fixture tests do not establish live provider accuracy.

The live proof found that Advanced/HTML GET response cost fields repeat the original task cost; they are not additional retrieval charges. The collector's legacy response-field accumulator is a conservative guard, not billed spend. Use the separate offline cost reconciliation helper to count original tasks once at their completed cost and each screenshot operation once. Preserve the raw ledger. The proof reconciled to $0.0202; its initial $1 balance was observed in tool output, but the first preflight file was overwritten, so the archived balance snapshots independently substantiate only its last $0.004 screenshot debit. The full wave's starting $0.9798 snapshot was preserved before any resume. [Cost semantics](https://dataforseo.com/help-center/how-to-track-api-usage-with-tag).

The proof also established separate fields for provider feature type, matching answer body, selected All-results tab and visible AI Overview label. One product summary lacked the visible label while the returned body and All-results capture agreed. Product-view references and direct answer hyperlinks must remain distinct from publisher references. Two opaque captured source links required separately timestamped Google redirect checks to corroborate their exact destinations; this is later evidence, not original HTML text.

## Local operation

Final pilot interpretation: all 100 captures meet the original structured-data/saved-evidence delivery threshold. Separate visual coding found 85 labelled positives, six matching generated bodies with unresolved feature identity, and nine reviewed main absences. The literal-heading distinction is a pilot observation, not an original preregistered requirement. The zero-unresolved evidence gate remains open. All 731 main structured-reference destinations are corroborated, but direct answer hyperlinks are a separate incompletely verified set and all 368 embedded records are null-payload placeholders. Define those boundaries prospectively before another collection; do not silently relabel placeholders or ambiguous bodies to pass a gate.

From the repository root, run `node scripts/research/aio-pilot.mjs` to create an offline 100-request plan. Run `node --test scripts/research/aio-pilot.test.mjs` for the provider-response and execution-guard fixtures. These commands do not call DataForSEO.

After account access is available, supply a user-level JSON credentials file with the provider's `login` and `password` fields through `DATAFORSEO_CREDENTIALS_PATH`. The script also accepts `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD` process variables. Do not put credentials in this repository or paste them into a conversation.

Explicit `--collect` starts the four-capture proof. A normal-priority task can take several minutes, so inspect the generated run manifest and use `--collect --resume` with its run ID for further retrieval. Resume is GET-only by default. Add `--complete-evidence` to allow a fresh balance check and screenshot requests for existing task IDs whose screenshots were never attempted. This does not submit another search task and does not retry a screenshot POST with an uncertain outcome.

After visual proof review, `--collect --limit 100 --proof-reviewed` starts a separate full pilot wave. The flag records the operator's decision; it is not evidence that review took place. Preserve a written proof review with the raw captures. Inspect every capture state and missing file before counting usable results, even when a command exits successfully.
