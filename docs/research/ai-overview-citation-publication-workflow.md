# AI Overview citation study: analysis and publication workflow

Status: operator handoff prepared 13 September 2026. This document does not change the frozen [protocol](ai-overview-citation-protocol.md), [configuration](ai-overview-citation-study.json), [runbook](ai-overview-citation-runbook.md), or current [status](ai-overview-citation-status.md). It contains no temporal finding and authorises no collection or publication.

## Current boundary

W1 is the only reviewed prospective wave. It has 97 primary-eligible baseline records (48 desktop and 49 mobile), but records from one wave are not temporal pairs and cannot produce a retention estimate. The first possible adjacent comparison awaits an eligible, fully reviewed W2 on 20 September 2026. W3 is scheduled for 27 September and W4 for 4 October, each at 11:02:11.467 UTC.

Use this scope sentence unchanged unless the frozen protocol is amended prospectively:

> This study follows a fixed editorial convenience panel of 50 queries on desktop and mobile, captured from London on google.co.uk. It measures persistence of byte-exact external structured-reference URLs in the first-level, visibly labelled main AI Overview. It does not estimate UK prevalence, search-volume-weighted behaviour, clicks, publisher market share, or causal device and ranking effects. The 12 September pilot (P0) is separate retrospective exploratory evidence and is excluded from the prospective trend.

`ambiguous_main_generated`, `missing`, `invalid`, and unknown/null reference sets are exclusions, never empty citation sets. A reviewed `main_absent` capture may contribute an empty set. Google product views, embedded AI nodes, direct answer links, images, and other modules remain outside the primary external-URL series.

## One-wave operator sequence

Run from the repository root in PowerShell after the scheduled service has settled. Set `$Wave` to `w2`, `w3`, or `w4`. These commands discover the authoritative run ID from the remote registry, refuse an incomplete wave or an existing local target, copy without changing the VPS originals, and compare every copied file by SHA-256.

```powershell
Set-Location C:\Users\sunny\repos\sunnypatel-nextjs
$Wave = "w2"
$SshKey = Join-Path $env:USERPROFILE ".ssh\hostinger_key"
$Remote = "root@srv583318.hstgr.cloud"
$RemoteStudy = "/root/.hermes/research/sunnypatel-aio-citation-v1/tmp/ctr-aio/citation-study"
$SshOptions = @("-4", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "-o", "StrictHostKeyChecking=yes", "-i", $SshKey)
if ($Wave -notin @("w2", "w3", "w4")) { throw "Wave must be w2, w3, or w4." }
if (-not (Test-Path -LiteralPath $SshKey -PathType Leaf)) { throw "SSH key is unavailable: $SshKey" }

$RegistryText = & ssh @SshOptions $Remote "cat '$RemoteStudy/execution-registry.json'"
if ($LASTEXITCODE -ne 0) { throw "Could not read the remote execution registry." }
$Registry = $RegistryText | ConvertFrom-Json
$WaveState = $Registry.waves.PSObject.Properties[$Wave].Value
if ($null -eq $WaveState) { throw "Wave is absent from the remote registry: $Wave" }
if ($WaveState.latestStatus -ne "collection_pass_finished_unreviewed") {
  throw "Hold: $Wave is not a settled, complete, unreviewed collection."
}
$RunId = $WaveState.runId
if ($RunId -notmatch '^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-f0-9]{6}$') {
  throw "Remote registry returned an invalid run ID."
}
$RemoteRun = "$RemoteStudy/runs/$Wave/$RunId"
$LocalWave = "tmp/ctr-aio/citation-study/runs/$Wave"
$LocalRun = Join-Path $LocalWave $RunId
if (Test-Path -LiteralPath $LocalRun) { throw "Local run target already exists: $LocalRun" }
New-Item -ItemType Directory -Path $LocalWave -Force | Out-Null
& scp @SshOptions -r "${Remote}:$RemoteRun" $LocalWave
if ($LASTEXITCODE -ne 0) { throw "Run copy failed." }

$RemoteHashes = & ssh @SshOptions $Remote "cd '$RemoteRun' && find . -type f -print0 | sort -z | xargs -0 sha256sum"
if ($LASTEXITCODE -ne 0) { throw "Remote hash inventory failed." }
$ResolvedLocalRun = (Resolve-Path -LiteralPath $LocalRun).Path.TrimEnd('\')
$LocalPrefix = "$ResolvedLocalRun\"
$LocalHashes = Get-ChildItem -LiteralPath $LocalRun -File -Recurse | ForEach-Object {
  if (-not $_.FullName.StartsWith($LocalPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Copied file resolved outside the expected run directory: $($_.FullName)"
  }
  $Relative = $_.FullName.Substring($LocalPrefix.Length).Replace('\', '/')
  "{0}  ./{1}" -f (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant(), $Relative
}
$HashDiff = Compare-Object ($RemoteHashes | Sort-Object) ($LocalHashes | Sort-Object)
if ($HashDiff) { $HashDiff | Format-Table; throw "Copied run differs from the VPS source." }
```

Keep the verified hash inventory and remote registry readback in the private evidence record. Do not put credentials, account receipts, raw HTML, screenshots, task IDs, local absolute paths, or the private execution registry in the public download.

Create the offline mechanical scaffold and summaries. The review directory must be new or empty.

```powershell
$ReviewDir = "tmp/ctr-aio/citation-study/reviews/$Wave/$RunId"
node scripts/research/aio-citation-wave-review.mjs $LocalRun $ReviewDir
if ($LASTEXITCODE -ne 0) { throw "Mechanical review failed." }
node scripts/research/aio-pilot-summary.mjs $LocalRun (Join-Path $ReviewDir "$Wave-data-summary.json")
if ($LASTEXITCODE -ne 0) { throw "Wave summary failed." }
$CostReview = Join-Path $ReviewDir "cost-reconciliation.json"
node --input-type=module -e "import { reconcileRun } from './scripts/research/aio-pilot-accounting.mjs'; import { writeFile } from 'node:fs/promises'; const [run, out] = process.argv.slice(1); const { report } = await reconcileRun(run, { write: false }); await writeFile(out, JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' }); if (report.statuses.overall !== 'reconciled') throw new Error('Cost review is unresolved; inspect the saved report.');" $LocalRun $CostReview
if ($LASTEXITCODE -ne 0) { throw "Cost reconciliation failed." }
```

The scaffold is an aid, not a decision. An independent reviewer must inspect all 100 full-resolution screenshots and their matching saved HTML/provider evidence. For every tag, record the screenshot hash, reviewer and review time, visible literal heading, matching body, selected All-results tab, absence review where applicable, final five-state feature decision, uncertainty/exclusion reason, first-level structured-reference field state, completeness decision, excluded material, and the source paths and hashes used. Preserve null as unknown. Do not copy W1 decisions into a later wave.

The repository currently has no general CLI that creates the required `visual-review.json`, `reference-completeness-review.json`, or parent systemic acknowledgement. The scaffold's `reviewer-observations.template.json` is working material and is not an input accepted by the exporter. The required shapes are demonstrated by the existing [W1 visual review](../../tmp/ctr-aio/citation-study/review-w1/visual/visual-review.json), [W1 completeness review](../../tmp/ctr-aio/citation-study/review-w1/visual/reference-completeness-review.json), and [W1 acknowledgement](../../tmp/ctr-aio/citation-study/reviews/w1/2026-09-13T11-02-11-001Z-af4da6/systemic-review-acknowledgement.json). Reuse the schema and review method, never the findings.

Resolve only the opaque Google `/goto` candidates saved by the scaffold. This command performs network requests to those saved redirect URLs, writes a new file, and must stop on access denial or unresolved destinations.

```powershell
$RedirectReview = Join-Path $ReviewDir "redirect-review.json"
node scripts/research/aio-citation-redirect-review.mjs (Join-Path $ReviewDir "opaque-redirect-candidates.json") $RedirectReview
if ($LASTEXITCODE -ne 0) { throw "Redirect review failed." }
```

After the visual and completeness files exist, preflight them before an independent parent/systemic review. The acknowledgement must hash-pin the mechanical index, visual review, completeness review, and redirect review and must record any systemic method errors rather than clearing them by exclusion.

```powershell
$VisualReview = Join-Path $ReviewDir "visual-review.json"
$CompletenessReview = Join-Path $ReviewDir "reference-completeness-review.json"
$SystemicAck = Join-Path $ReviewDir "systemic-review-acknowledgement.json"
$ReviewedWave = Join-Path $ReviewDir "$Wave-reviewed.json"

node scripts/research/aio-citation-wave-export.mjs --preflight $ReviewDir $VisualReview $CompletenessReview $RedirectReview
if ($LASTEXITCODE -ne 0) { throw "Reviewed-wave preflight failed." }

# Create $SystemicAck only after the independent review and hash checks.
node scripts/research/aio-citation-wave-export.mjs $ReviewDir $VisualReview $CompletenessReview $RedirectReview $SystemicAck $ReviewedWave
if ($LASTEXITCODE -ne 0) { throw "Reviewed-wave export failed." }
```

The current exporter is stricter than the protocol's 95-complete-capture wave threshold: it requires 100 clear automatic capture reports, 100 completed visual decisions, 100 completed reference-completeness decisions, and zero unresolved redirect rows. It also blocks export for an unresolved Google product-view redirect even though the protocol isolates that issue to the product series. Treat either condition as a tooling hold; do not relax the frozen method, edit evidence, or invent an alternate export.

Compare only reviewed prospective waves that satisfy the versioned [reviewed-input contract](ai-overview-citation-reviewed-input-contract.md). The engine reads and hashes the frozen protocol, configuration, and panel itself. It always leaves `releaseApproved` false.

```powershell
$EarlierWave = switch ($Wave) { "w2" { "w1" } "w3" { "w2" } "w4" { "w3" } }
$EarlierRunId = $Registry.waves.PSObject.Properties[$EarlierWave].Value.runId
$EarlierReviewed = "tmp/ctr-aio/citation-study/reviews/$EarlierWave/$EarlierRunId/$EarlierWave-reviewed.json"
$ComparisonDir = "tmp/ctr-aio/citation-study/comparisons"
$Comparison = Join-Path $ComparisonDir "$EarlierWave-$Wave.json"
New-Item -ItemType Directory -Path $ComparisonDir -Force | Out-Null
if (Test-Path -LiteralPath $Comparison) { throw "Comparison output already exists: $Comparison" }
node scripts/research/aio-citation-compare.mjs $EarlierReviewed $ReviewedWave $Comparison
if ($LASTEXITCODE -ne 0) { throw "Adjacent-wave comparison failed." }

if ($Wave -in @("w3", "w4")) {
  $BaselineRunId = $Registry.waves.PSObject.Properties["w1"].Value.runId
  $BaselineReviewed = "tmp/ctr-aio/citation-study/reviews/w1/$BaselineRunId/w1-reviewed.json"
  $BaselineComparison = Join-Path $ComparisonDir "w1-$Wave.json"
  if (Test-Path -LiteralPath $BaselineComparison) { throw "Comparison output already exists: $BaselineComparison" }
  node scripts/research/aio-citation-compare.mjs $BaselineReviewed $ReviewedWave $BaselineComparison
  if ($LASTEXITCODE -ne 0) { throw "Baseline comparison failed." }
}
```

For W3 and W4, also run the frozen secondary baseline comparison from W1 to the new reviewed wave. Label it as a 14-day or 21-day baseline comparison, not a seven-day result. Never compare P0 as if it were W1.

## Independent quality gates

Record evidence for each gate separately. A later gate cannot repair an earlier failure.

| Gate | Pass condition | Evidence to retain |
|---|---|---|
| Copy integrity | Every remote run file copied byte-for-byte; remote originals unchanged | host, wave/run ID, retrieval time, file count/bytes, remote and local SHA-256 inventories, hash diff |
| Wave timing and capture | Submission within the registered one-hour target tolerance; all returned timestamps between submission and +60 minutes; provider span at most 30 minutes; at least 95 usable captures with saved evidence | target/actual UTC times, all returned provider times, span, usable/failure counts and reasons |
| Mechanical integrity | Frozen hashes and panel match; 100 planned rows retained; task/tag, request, HTML, screenshot and evidence joins verified; no systemic defect | scaffold hashes, issue list, request-setting check, task/screenshot uniqueness, file/hash joins |
| Manual identity and sources | All 100 captures reviewed; every row has one of five states and a reason for ambiguity/exclusion; null remains unknown; included sets have exact original-HTML or later-redirect evidence | reviewer, timestamp, screenshot hash, heading/body/All-tab observations, absence review, reference field/completeness state, destination evidence |
| Pair eligibility | Both waves pass timing and at least 95 usable captures; at least 80 identity-resolved and external-set-valid pairs overall, at least 40 per device, and at least 20 with a non-empty earlier external set | full transition matrix, exclusions by wave/device/sector/reason, pair counts, non-empty-earlier denominator |
| Analysis | Primary adjacent comparison; unweighted per-pair mean retention and its denominator; pooled occurrence retention named separately; mean Jaccard and denominator; exact-host series secondary; product views separate; undefined values remain null | reviewed-wave hashes, comparison-engine output/hash, independent recomputation, discrepancy log |
| Release | Independent recomputation agrees with raw evidence and downloads; all planned rows remain in coverage counts and the transition matrix includes all five states, including zero counts; downloads and charts use one release version; desktop/mobile page and links verified | release manifest, file hashes/bytes/row counts, chart source hashes, rendered screenshots, link checks, revision and reviewer records |

If the acquisition and pair gates fail, publish only a dated methods/coverage update. Do not use a retention headline. Zero unresolved parser, body, metadata, hash, or external-destination mismatches is required among included records; a systemic method defect holds the release even when numerical thresholds are met.

## Public download contract

Build the public package in a clean release checkout from hash-pinned reviewed inputs. Keep the internal reviewed-wave files private because they contain task and screenshot operation identifiers. Publish UTF-8, RFC 4180 CSV plus JSON metadata under one versioned release ID:

| File | Grain and required fields |
|---|---|
| `observations.csv` | One row for every planned query-device observation in every released prospective wave: release/study/wave/run IDs, target/submission/provider UTC times, tag, query ID/text, sector ID/label, intent, device, feature state, reference-set state, primary eligibility, exclusion reasons, timing/evidence booleans. Retain all 100 rows per wave and every observed state, including exclusions. |
| `citations.csv` | One row per preserved structured-reference occurrence: wave, tag, stable within-capture ordinal, byte-exact URL, exact lowercased hostname, external/product class, destination-evidence class, and whether its capture is primary-eligible. A null/unknown set creates no citation rows but remains explicit in `observations.csv`. |
| `pair_metrics.csv` | One row for each of the 100 planned tags per released comparison: comparison/class, earlier/later wave and state, pair eligibility/exclusion reason, elapsed seconds, earlier/later/retained/new/no-longer URL counts, retention/removal/addition shares and Jaccard. Undefined metrics are empty CSV cells and JSON `null`, never zero. |
| `url_changes.csv` | One row per eligible comparison-tag-URL relation with `retained`, `newly_observed`, or `no_longer_observed`; include exact URL and host. |
| `summary.json` | Sanitised comparison summaries, coverage, complete five-state transition matrices including zero-count cells, exclusions, per-device and descriptive per-sector denominators, URL/host/product series, gate outcomes, scope text and limitations. Do not expose local paths or private IDs from the internal engine output. |
| `manifest.json` | Release ID/version/date, study ID, included waves/comparisons, source reviewed-wave and comparison hashes, each public file's SHA-256/bytes/row count, schema versions, code revision, reviewer record and revision history. |
| `data-dictionary.md` | Field definitions, primary keys, null semantics, URL/host policy, units, exclusions and scope language. |

Primary keys are `(release_id, wave_id, tag)` for observations, `(release_id, wave_id, tag, reference_ordinal)` for citations, and `(release_id, comparison_id, tag)` for pair metrics. Sort deterministically by wave, panel order, device, then reference ordinal or URL status. Validate unique keys, allowed enums, referential joins, row counts, UTF-8, CSV/JSON value agreement, file hashes, and absence of secrets before release.

## Article structure and staged publication

Working title: **Google AI Overview Citation Study: Which Sources Keep Their Place?**

1. Lead with the verified adjacent-wave result only when its pair gate passes, naming both exact capture dates and the retention denominator in the same paragraph.
2. Explain what “kept” means: intersection of byte-exact external structured URLs for the same query and device. Use “no longer observed” rather than permanent removal.
3. Show coverage before findings: 100 planned pairs, the five-state transition matrix, eligible/excluded counts, reasons, and device denominators.
4. Present unweighted per-pair URL retention first. Then show pooled URL occurrences, Jaccard, exact-host results, confirmed-in-both-waves sensitivity, and product views as distinctly labelled series.
5. Describe the fixed 50-query London convenience panel, desktop/mobile collection, weekly schedule, first-level visibly labelled main-AIO rule, evidence provenance, manual review and missing/null handling.
6. State limitations: no UK prevalence inference, no search-volume weighting, five queries per sector are descriptive only, API screenshots render retained expanded HTML, and URL tracking changes can differ while exact hosts persist.
7. Link the versioned downloads, methodology, release manifest and revision log. Add a “data checked” date and name the released wave interval.

What can be prepared now: the page shell, prose above, chart specifications, CSV/JSON schemas, deterministic export/validation code, release manifest template, and desktop/mobile QA checklist. Do not insert a result, chart value, retention headline, or “stable source” claim.

After W2 review, W1→W2 may support the first seven-day article only if every gate passes. After W3, add W2→W3 as the next primary interval and W1→W3 as a clearly labelled 14-day secondary comparison. After W4, add W3→W4 and the W1→W4 21-day secondary comparison, then update the revision log and all release hashes. Each update requires a fresh independent recomputation and exact download/chart/rendered-page review.
