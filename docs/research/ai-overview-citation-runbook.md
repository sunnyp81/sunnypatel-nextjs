# Citation-study operation

Use this runbook with the [frozen measurement protocol](ai-overview-citation-protocol.md) and [study configuration](ai-overview-citation-study.json). The frozen methodology has not changed. Credentials stay outside the research bundle in a root-owned file with mode `0600`.

The [analysis and publication workflow](ai-overview-citation-publication-workflow.md) contains the post-collection copy, integrity, review, comparison and release steps. The [research package boundary](README.md) explains what is versioned and which original private records must be restored when continuing this study from another checkout.

## Current research state

The 12 September pilot is preserved as P0, a retrospective exploratory dataset. Its normalized [baseline export](../../tmp/ctr-aio/citation-study/pilot-baseline.json) contains every planned observation, including six ambiguous feature identities. P0 is not W1. Do not copy its task IDs or screenshots into a prospective wave, change its retrospective flag, or use it to manufacture another study date.

W1 submitted its certain 100-ID batch at `2026-09-13T11:02:11.467Z` and is fully reviewed. The Windows PC retains all 600 W1 raw evidence files, totalling 399,719,261 bytes. The Hermes server holds the minimum W1 execution metadata and reviewed baseline needed to validate the fixed schedule and later comparisons; it does not hold or claim a second complete W1 raw archive.

## Hermes repeat collection

W2–W4 are scheduled on the Hermes VPS `srv583318` from `/root/.hermes/research/sunnypatel-aio-citation-v1`. Connect through `root@srv583318.hstgr.cloud` with the existing `hostinger_key`. The older `hermes.aifor.tech` hostname did not resolve during the migration checks.

Six systemd timers are enabled and active:

| Wave | One-time collection | Bounded evidence resumes |
|---|---|---|
| W2 | 20 Sep 2026, 11:02:11.467 UTC / 12:02:11.467 BST | 37 explicit starts, every 10 minutes from 11:12:11.467 through 17:12:11.467 UTC |
| W3 | 27 Sep 2026, 11:02:11.467 UTC / 12:02:11.467 BST | 37 explicit starts, every 10 minutes from 11:12:11.467 through 17:12:11.467 UTC |
| W4 | 4 Oct 2026, 11:02:11.467 UTC / 12:02:11.467 BST | 37 explicit starts, every 10 minutes from 11:12:11.467 through 17:12:11.467 UTC |

The unit names follow `sunnypatel-aio-citation-w{2,3,4}-{collect,resume}`. Inspect them without starting work:

```bash
systemctl list-timers 'sunnypatel-aio-citation-*'
systemctl status sunnypatel-aio-citation-w2-collect.timer
journalctl -u sunnypatel-aio-citation-w2-collect.service
```

Each collect timer can invoke one paid 100-task batch. Resume timers can only continue one exact, certain saved run using its existing task IDs. They never submit a replacement search batch. `Persistent=true` permits a brief reboot catch-up, but the runner independently rejects collection outside the frozen ±60-minute UTC window and rejects resumes outside their bounded evidence window. The units have no service restart policy.

A shared `flock` and the runner's durable owned lock prevent overlapping collection and resume processes. Frozen hashes, the execution registry, per-wave sticky collection locks, task/tag joins, cost certainty and the provider balance guard remain in force. The runner rechecks wave state after acquiring its lock, requires at least 1 GiB free before any provider call, and exits without provider access when a wave is already complete. A leftover lock, uncertain POST, stopped state, duplicate attempt, invalid identity or missed window is a manual hold. Never delete a lock, repair the registry, top up the account or launch a replacement batch automatically.

The server had 2.43 GB free at activation. Future raw envelopes, HTML and screenshots are saved on the VPS, so the Windows PC can remain off. Disk availability must still be checked after each wave because the 1 GiB runner threshold is a safety floor rather than a storage forecast.

The six former Windows Task Scheduler definitions are disabled. Three local `w2.collect.lock`, `w3.collect.lock` and `w4.collect.lock` retirement markers provide an additional block against accidental local submissions. Do not delete those markers or re-enable the Windows tasks without first auditing the authoritative remote registry and run directories. The original Windows definitions remain evidence of the retired setup.

Scheduling performs collection only. It does not review evidence, run comparisons, publish results, invoke an LLM, change provider settings or manage account funding.

A separate [Telegram completion observer](ai-overview-citation-telegram.md) checks the saved files after collection and notifies Sunny through the existing Hermes cron bot. It has its own timer and delivery records and cannot start or retry a research collection. A message means capture is complete; citation review and publication remain separate.

## Deployment and readiness boundary

The isolated VPS bundle contains the seven byte-frozen active sources, all eight `frozen-v1` records, the execution registry, both W1 attempt records needed by the duplicate guard, and the reviewed W1 baseline. The full W1 raw evidence remains on the PC. Do not describe the metadata mirror as an independent raw backup.

Activation checks verified all seven frozen hashes and 159 transferred-file hashes, private `0600` credentials, writable run state with a read-only freeze, synchronized time, TLS/DNS access, and acceptance of the prior W1 state by the frozen wrapper. Final readback found all six timers enabled, active and waiting; all 12 live unit hashes matched the reviewed plan; all six paid services had never run; and the W1 registry remained byte-unchanged. Readiness checks made zero API requests and no paid test query. A subsequent [Hermes account verification](../../tmp/ctr-aio/citation-study/hermes-migration/hermes-account-verification.json) authenticated the actual DataForSEO account with one free `GET appendix/user_data` request at zero cost and a balance of US$49.9524; it made no paid query or screenshot request.

The [Hermes deployment verification](../../tmp/ctr-aio/citation-study/hermes-migration/hermes-deployment-verification.json), [Hermes readiness verification](../../tmp/ctr-aio/citation-study/hermes-migration/hermes-readiness-verification.json), [remote Linux test log](../../tmp/ctr-aio/citation-study/hermes-migration/linux-tests.txt), [local predeployment verification](../../tmp/ctr-aio/citation-study/hermes-migration/parent-predeploy-verification.json), [Windows retirement verification](../../tmp/ctr-aio/citation-study/hermes-migration/windows-retirement/retirement-verification.json), and [local retirement-lock record](../../tmp/ctr-aio/citation-study/hermes-migration/windows-retirement/local-collection-locks.json) preserve the supporting evidence.

## Review and compare

After each wave, copy its private raw evidence from the VPS into the controlled review workflow without changing the remote originals. Generate structured summaries, reconcile unique-task and screenshot costs, and review all 100 captures against the protocol. Save reviewer decisions separately from collector states. Check the main feature body and heading, selected All-results tab, metadata, original source scope and exact destination provenance. An unknown external reference set remains unknown.

The comparison engine consumes two reviewed wave JSON files using the prospective registration, request, timing and screenshot metadata in the [reviewed-input contract](ai-overview-citation-reviewed-input-contract.md). It validates the frozen panel, settings, timing and eligible sets before calculating URL and host persistence. Numeric eligibility is not public-release approval.

```bash
node scripts/research/aio-citation-compare.mjs earlier-reviewed.json later-reviewed.json comparison.json
```

Primary comparisons are adjacent waves. A comparison involving P0 remains exploratory. Before publication, independently recompute results from raw evidence, verify the exact downloadable files, and inspect every chart and rendered desktop/mobile page. No retention result exists until at least two eligible prospective waves have been collected and reviewed.

## Funding and validation

Four complete waves reserve US$2.08 in provider usage. The scheduler never tops up the account or changes provider settings. Before changing any operational file, run the offline tests and lint locally; the deployed frozen seven must continue matching their registered hashes.

```bash
node --test scripts/research/*.test.mjs
npx eslint scripts/research
```

At migration activation, 63 local tests and 9 tests in the isolated remote bundle passed, and lint was clean. Fixture and readiness tests make no provider API requests. Raw capture validity, manual visual/source review and prospective timing remain separate requirements.
