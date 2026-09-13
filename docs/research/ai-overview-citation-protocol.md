# Google AI Overview citation stability: protocol v1

Status: prospective protocol prepared on 13 September 2026. Freeze this document, the study configuration and panel hashes before the first funded study wave. The September 12 pilot remains retrospective exploratory evidence, not a preregistered baseline. The public article will follow at least two eligible prospective waves.

## Question and scope

For this fixed London search panel, which external structured citation URLs remain, appear or stop being observed in visibly labelled main Google AI Overviews between weekly captures?

Use the existing 50-query editorial convenience panel, on desktop and mobile: 100 query-device observations per wave. Preserve query text, sector/intent labels, London setting, English, google.co.uk, depth 10, device/OS, normal priority, asynchronous loading and expanded HTML. The panel is not weighted by search volume and cannot estimate UK-wide prevalence, sector market share, clicks or causal device/ranking effects.

The pilot validated unchanged main structured-reference extraction. This protocol narrows the measured feature and link scope; it does not claim the pilot's six ambiguous identities or missing embedded payloads were resolved. Existing reviewed evidence supports the unchanged extraction method, so a further paid proof is not required merely to adopt these prospective coding rules. Any later parser or evidence-method expansion needs a separate validation decision.

**Methodological amendment, 13 September 2026:** once frozen, this prospective protocol replaces the pilot's open-ended expansion HOLD only for the defined future labelled-main-AIO structured-reference study. Ambiguous bodies become explicit excluded states; embedded payloads and direct answer hyperlinks are outside its primary extraction scope. This is a new measurement definition and gate, not a retrospective passing result for the pilot. The September 12 data, coding and HOLD report remain unchanged. Methodological readiness does not remove the funding or per-wave quality gates below.

## Feature coding

Keep provider detection, visible heading, matching body, selected All-results tab, metadata, source evidence and reviewer decision separate. Code every planned capture, including failures.

| State | Required evidence | Primary citation comparison |
|---|---|---|
| `confirmed_main_aio` | First-level provider AIO item; uniquely matched HTML subtree; readable matching answer body and literal AI Overview heading in the screenshot; All-results tab; matching request/result metadata | Include external structured references |
| `ambiguous_main_generated` | Provider main item and matching generated body, but product identity cannot be confirmed under the rule above | Exclude from comparison; report count and reason |
| `main_absent` | Successful complete result with no first-level main AIO item, plus reviewed HTML and screenshot with no unexplained main-feature evidence | Include as an empty main citation set |
| `missing` | Pending/failed request, missing evidence, unreadable capture or unavailable review | Exclude; never code as absence |
| `invalid` | Metadata, task join, evidence hash, parser/body or destination mismatch | Exclude and investigate; unresolved included-record mismatches block release |

A heading alone does not establish a valid capture: the body, source scope and metadata checks still apply. A missing heading does not prove the provider is wrong. Preserve literal-heading and body observations even after assigning a state. Every ambiguous or excluded record needs a reason. The pilot's original coding and report remain unchanged.

People Also Ask and other embedded AI nodes are outside the primary study. Preserve their type and payload-availability counts. Null items/references with an asynchronous flag mean unavailable payload, not a completed answer or verified absence. Do not expand, replace or retry queries selectively to produce positive findings.

## Citation units and evidence

The primary unit is a byte-exact external structured-reference URL, deduplicated within one query-device capture. Include only `ai_overview_reference` records from the first-level main AIO subtree. Identical URLs cited by different query-device observations count separately in pooled totals; they are not unique publishers.

Record Google product-view references separately. Classify a URL as a product view only when its hostname is on the explicit google.com/www.google.com/google.co.uk/www.google.co.uk allowlist, its path is `/search`, and its parsed `q` equals `product` or its comma-separated `ibp` contains `oshop`. These product views are not external citations. Inline answer hyperlinks, images, shopping modules outside the main AIO and embedded citations are excluded from primary counts.

Every included structured URL must match the saved main-AIO subtree exactly or have an exact destination corroborated by a separately timestamped redirect of an opaque link preserved in that subtree. Keep those evidence classes separate. Later redirects do not retroactively place plaintext URLs in the original HTML. Do not fetch destination pages to imply their claims were verified.

If any external structured-reference destination is unresolved or mismatched, the entire external citation set for that capture is invalid for primary comparison. Do not retain a selectively verified subset or mark the set empty. Keep feature observations and citation-set validity separate. Missing/null reference fields are unknown unless completeness is independently established; an explicit empty reference array may be a valid empty set only after the retained main-panel evidence is reviewed for omitted references. An unresolved product-view destination affects its separate product series, not an otherwise fully verified external set.

Preserve original URLs, query strings, fragments and case; do not canonicalise them. Secondary host-level sets use lowercased `URL.hostname`, retaining `www` and other subdomains. This is exact-host analysis, not registrable-domain or publisher ownership analysis. Tracking-parameter changes can therefore count as URL changes while the host remains stable.

## Comparisons and denominators

Match records by the same frozen query and device, with identical request settings. Require new original task IDs and new task-linked screenshots each wave. Unknown, ambiguous, missing and invalid observations do not become empty sets.

Primary temporal comparisons are adjacent waves W1→W2, W2→W3 and W3→W4. W1→W3 and W1→W4 are secondary baseline comparisons. Do not bridge a missing wave and describe the resulting interval as a scheduled seven-day comparison. Apply the same eligibility rules to every comparison.

For each eligible pair, let A be its earlier external URL set and B its later external URL set:

- Retained: intersection of A and B. Newly observed: B minus A. No longer observed: A minus B.
- Citation retention: retained / size of A; undefined when A is empty.
- No-longer-observed share: no-longer-observed count / size of A; undefined when A is empty.
- Newly observed share: newly observed / size of B; undefined when B is empty.
- Jaccard similarity: retained / size of the union; undefined when both sets are empty.

A confirmed-to-reviewed-absent transition has zero retained URLs from its non-empty earlier set. Describe this as loss of observation in the later capture, not proof of permanent removal. An absent-to-confirmed transition contributes new URLs but no retention denominator. Absence-to-absence contributes a feature transition and no URL similarity score.

Report the primary series across all identity-resolved pairs, alongside a conditional series restricted to confirmed AIO in both waves. The latter separates within-panel citation changes from main-feature appearance/disappearance. Apply the same set rules to exact hosts as a secondary measure. Google product-view changes remain separate from both external series.

The primary summary is the unweighted mean per-pair retention for pairs with a non-empty earlier external set. Report its eligible-pair count. Also report pooled retained/earlier URL occurrences, with its different denominator clearly named. Report mean Jaccard and its non-empty-union pair count. Never substitute zero for an undefined score. Show the complete five-state transition matrix and exclusions by wave, device and sector.

These are descriptive statistics for a fixed convenience panel. Do not add population confidence intervals, causal claims or sector rankings from five queries. Compare sector/device groups descriptively only with their denominators, and retain provider timestamps and paired timing differences.

## Waves and timing

Collect four prospective waves: W1 is a fresh funded baseline; W2, W3 and W4 target 7, 14 and 21 days after W1's original batch submission time, in UTC. The first actual W1 submission anchors the schedule mechanically; it must be recorded before inspecting returned results. The September 12 pilot is P0 and is excluded from primary prospective trends.

Use a single 100-task batch per wave. Start each repeat within one hour of its target. Require the provider timestamp span within each wave to be at most 30 minutes for the primary weekly series. Every returned provider capture timestamp must also fall from that wave's actual submission through 60 minutes afterwards; a short span alone must not admit a batch captured hours late. Compute timing gates across all returned capture timestamps, without selecting a favourable subset. Record actual timestamps and elapsed intervals. A missed window or prolonged capture is retained as a dated protocol deviation, with no automatic replacement or backdating. Do not call an off-schedule capture a scheduled weekly wave.

Save Advanced envelopes, normalized data, HTML envelopes, raw HTML, screenshot envelopes and screenshots during each run. Hash files and keep original account/collection receipts private. API screenshots render retained HTML and are not an independent observation; expanded asynchronous captures do not measure ordinary initial-viewport exposure. [Request options](https://docs.dataforseo.com/v3/serp-google-type-task_post/), [screenshot documentation](https://docs.dataforseo.com/v3/serp_screenshot/).

## Quality and publication gates

Review all 100 planned records per wave. Require at least 95 with usable structured data and saved evidence; report all failures separately. Require zero unresolved parser, body, metadata, hash or destination mismatches among included primary records. Explicitly coded ambiguous feature identity is allowed as an exclusion, not silently resolved or treated as a successful primary observation.

Systemic parser, extraction, task-mapping or evidence-integrity defects hold release even if excluding affected records would leave enough pairs. Investigate and independently validate remediation before release; retain original records and the revision history.

For a paired headline, require both waves to pass their timing and 95-complete-capture gates, at least 80 of the 100 planned query-device pairs to be identity-resolved and external-citation-set-valid in both waves, at least 40 such pairs per device, and at least 20 eligible pairs with non-empty earlier external citation sets. These are prospective engineering/reporting safeguards, not statistical power or confidence thresholds. If a gate fails, publish a methods/coverage update rather than a citation-retention headline. Do not relax the gates after observing a result.

Before public release, independently recompute counts from raw results, check reviewer/source joins, inspect the exact downloadable dataset and every chart against the same version, and verify the rendered page on desktop/mobile. Include all five feature states in the public denominator. No selective successful-only export.

## Budget and execution

Reserve $0.52 per complete wave at the checked normal-priority rates: up to $0.0012 per search task plus $0.004 per screenshot. Four waves reserve $2.08 in provider usage, excluding any separately justified future method test. Reconcile completed unique task costs and screenshot operations rather than summing repeated GET cost fields. [Pricing](https://dataforseo.com/pricing/serp/google-organic-serp-api), [screenshot price](https://docs.dataforseo.com/v3/serp_screenshot/), [cost semantics](https://dataforseo.com/help-center/how-to-track-api-usage-with-tag).

Do not start a partial wave because of insufficient credit. Check the account before each wave; require the complete reserve. Stop on uncertain charges or uncertain POST outcomes. Resume existing task IDs; do not repeat a billable submission whose outcome is unknown. No automatic top-up or subscription is authorised by this protocol.

The account balance checked on 13 September was $0.4664, below the $0.52 reserve. The next wave awaits sufficient funds. The provider's minimum top-up is a payment balance, not the estimated research cost. No new paid collection or top-up has been made while preparing this protocol.

## Public research package

Working title: **Google AI Overview Citation Study: Which Sources Keep Their Place?**

After eligible repeat observations exist, publish the primary finding with its exact panel/wave dates and denominator, URL and host persistence charts, feature transitions, downloadable CSV/JSON, this methodology, limitations and a revision log. Use a stable study URL and versioned data releases. Link supported findings from the SEO statistics page only after the study is public and verified. Do not present the pilot as a longitudinal result.
