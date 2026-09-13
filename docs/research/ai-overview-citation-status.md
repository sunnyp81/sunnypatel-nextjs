# Google AI Overview citation study: current status

**Status on 13 September 2026: W1 is reviewed, and W2–W4 are scheduled on the Hermes VPS.**

The prospective study tracks byte-exact external structured-reference URLs in visibly labelled main Google AI Overviews for a fixed London panel. Each wave contains 50 queries on desktop and mobile, giving 100 captures. Its scope, exclusions and release gates remain fixed in the [protocol](ai-overview-citation-protocol.md), with current operations documented in the [runbook](ai-overview-citation-runbook.md). The 12 September pilot remains separate retrospective exploratory evidence and is not W1.

## W1 evidence

The guarded W1 run [`2026-09-13T11-02-11-001Z-af4da6`](../../tmp/ctr-aio/citation-study/runs/w1/2026-09-13T11-02-11-001Z-af4da6/run-manifest.json) returned exactly 100 task IDs. All 100 captures have structured, HTML and screenshot evidence: **600 verified files totalling 399,719,261 bytes**. Provider result timestamps span **11:02:41–11:13:19 UTC**, or **638 seconds**. Reconciled provider cost is **US$0.514**; the closing balance was **US$49.9524 at 11:16:32 UTC**. The [raw-evidence verification](../../tmp/ctr-aio/citation-study/review-w1/parent-raw-verification.json) preserves the checks.

Direct screenshot review classified **90 captures as confirmed labelled main AI Overviews**, **8 as confirmed absent**, and **2 as ambiguous**: `sto-04-desktop` and `sto-04-mobile`. Reference review found 91 non-empty sets and 8 reviewed empty sets. `cof-02-desktop` returned literal `null` references and remains unknown. W1 therefore has **97 eligible baseline records: 48 desktop and 49 mobile**. These are records rather than matched temporal pairs.

The 91 non-empty sets contain **757 structured URL occurrences: 668 external destinations and 89 Google product-view URLs**. Original HTML resolves 506 exactly, and later redirect evidence resolves the remaining 251 exactly. The canonical [W1 reviewed export](../../tmp/ctr-aio/citation-study/reviews/w1/2026-09-13T11-02-11-001Z-af4da6/w1-reviewed.json) contains all 100 rows and has SHA-256 `ad8b786375c94360a717d9a56ddd4b6b8c20b4fd8cbe8c1404a0c3efe20ab17a`. These are W1 evidence-completeness counts, not stability findings.

The Windows PC remains the authoritative store for all 600 W1 raw files, totalling about 399.7 MB. Hermes holds minimum execution metadata and the reviewed baseline so it can enforce the schedule and support later comparison. That mirror is not a complete second copy of the W1 raw evidence.

## Repeat waves

Collection has moved to the Hermes server `srv583318`, reached as `root@srv583318.hstgr.cloud` with the existing `hostinger_key`. The isolated bundle is `/root/.hermes/research/sunnypatel-aio-citation-v1`. The older `hermes.aifor.tech` hostname did not resolve during the migration checks.

Six systemd timers are enabled and active. W2, W3 and W4 collect at **11:02:11.467 UTC / 12:02:11.467 BST** on 20 September, 27 September and 4 October. Each wave has 37 explicit resume starts every ten minutes from +10 through +370 minutes. Persistent timers can catch a brief reboot only while the runner's UTC windows remain open; services do not restart automatically.

Collection is protected by the frozen hashes, registry, balance and cost checks, task-ID joins, shared `flock`, durable runner lock and sticky per-wave collection locks. The runner requires at least 1 GiB free before provider access; 2.43 GB was free at activation. A completed wave is an offline no-op. Unsafe, uncertain, duplicate, overdue or locked states require manual review.

All six former Windows tasks are disabled, and local W2–W4 collection-lock markers block accidental PC submissions. Do not remove those markers or re-enable the tasks without auditing the remote state. New capture evidence is stored on the VPS, so the PC does not need to remain on or signed in.

Remote readiness verified the seven frozen hashes, 159 transferred-file hashes, private `0600` credentials, writable state and read-only frozen inputs, NTP, TLS/DNS, and prior-W1 wrapper acceptance. Final readback confirmed all six timers enabled, active and waiting, all 12 live unit hashes equal to the reviewed plan, all six paid services never run, and the W1 registry byte-unchanged. The readiness process made **zero API requests and no paid test query**. A subsequent [Hermes account verification](../../tmp/ctr-aio/citation-study/hermes-migration/hermes-account-verification.json) authenticated the actual DataForSEO account with one free `GET appendix/user_data` request at zero cost and a balance of US$49.9524; it made no paid query or screenshot request.

Supporting records include the [Hermes deployment verification](../../tmp/ctr-aio/citation-study/hermes-migration/hermes-deployment-verification.json), [Hermes readiness verification](../../tmp/ctr-aio/citation-study/hermes-migration/hermes-readiness-verification.json), [remote Linux test log](../../tmp/ctr-aio/citation-study/hermes-migration/linux-tests.txt), [predeployment verification](../../tmp/ctr-aio/citation-study/hermes-migration/parent-predeploy-verification.json), [Windows retirement verification](../../tmp/ctr-aio/citation-study/hermes-migration/windows-retirement/retirement-verification.json), and [local collection-lock record](../../tmp/ctr-aio/citation-study/hermes-migration/windows-retirement/local-collection-locks.json).

The scheduler collects and preserves evidence only. Visual/source review, reviewed-wave export and comparison remain separate manual work. W1 cannot support a temporal finding by itself; the first stability comparison still depends on an eligible, fully reviewed W2. No public temporal finding or study page exists yet.

At migration, validation passed **63 local research tests and 9 remote bundle tests**, with lint clean. UTF-8 and transfer-hash checks also passed. No public page or frozen methodology file changed during migration.

## Research handoff

The [analysis and publication workflow](ai-overview-citation-publication-workflow.md) documents the remaining wave reviews, comparisons, public data contract and article structure. Its commands retain the separation between raw evidence, manual decisions and release review. The current exporter has stricter completeness requirements than the protocol in some cases; these are explicit tooling holds in that workflow.

The [package boundary](README.md) and [reviewed-input contract](ai-overview-citation-reviewed-input-contract.md) accompany the source and offline tests. The original private freeze and execution registry must be restored when resuming this active study from a new checkout; a newly generated freeze cannot replace its pre-W1 registration. No temporal finding has been added by preparing this handoff.
