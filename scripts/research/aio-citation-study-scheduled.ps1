[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("Inspect", "Collect", "Resume")]
  [string]$Mode,

  [Parameter(Mandatory = $true)]
  [ValidateSet("w2", "w3", "w4")]
  [string]$Wave,

  [string]$RepoRoot,
  [string]$StudyRoot,
  [string]$WrapperPath,
  [string]$NodePath,
  [string]$LogRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $RepoRoot) { $RepoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../..")) }
if (-not $StudyRoot) { $StudyRoot = Join-Path $RepoRoot "tmp/ctr-aio/citation-study" }
if (-not $WrapperPath) { $WrapperPath = Join-Path $RepoRoot "scripts/research/aio-citation-study.mjs" }
if (-not $LogRoot) { $LogRoot = Join-Path $StudyRoot "scheduler-logs" }
if (-not $NodePath) { $NodePath = (Get-Command node.exe -ErrorAction Stop).Source }

$RepoRoot = [IO.Path]::GetFullPath($RepoRoot)
$StudyRoot = [IO.Path]::GetFullPath($StudyRoot)
$WrapperPath = [IO.Path]::GetFullPath($WrapperPath)
$LogRoot = [IO.Path]::GetFullPath($LogRoot)

function Read-JsonFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
  return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Test-UniqueNonEmpty([object[]]$Values, [int]$ExpectedCount) {
  $items = @($Values)
  if ($items.Count -ne $ExpectedCount) { return $false }
  if (@($items | Where-Object { $_ -isnot [string] -or -not $_.Trim() }).Count -ne 0) { return $false }
  return @($items | Select-Object -Unique).Count -eq $ExpectedCount
}

function Get-WaveState([string]$WaveId) {
  $registryPath = Join-Path $StudyRoot "execution-registry.json"
  $registry = Read-JsonFile $registryPath
  if (-not $registry -or -not $registry.waves -or -not $registry.waves.PSObject.Properties[$WaveId]) {
    return [pscustomobject]@{ state = "absent"; wave = $WaveId; runId = $null; reason = "wave_not_registered" }
  }

  $waveRecord = $registry.waves.$WaveId
  $runId = $waveRecord.runId
  if ($runId -isnot [string] -or -not $runId.Trim() -or $runId -notmatch '^[A-Za-z0-9_-]+$') {
    return [pscustomobject]@{ state = "manual_hold"; wave = $WaveId; runId = $runId; reason = "invalid_registered_run_id" }
  }

  $runDir = Join-Path (Join-Path (Join-Path $StudyRoot "runs") $WaveId) $runId
  $manifest = Read-JsonFile (Join-Path $runDir "run-manifest.json")
  if (-not $manifest) {
    return [pscustomobject]@{ state = "manual_hold"; wave = $WaveId; runId = $runId; reason = "registered_manifest_missing" }
  }

  $issues = [Collections.Generic.List[string]]::new()
  if ($manifest.runId -ne $runId) { $issues.Add("manifest_run_id_mismatch") }
  if ($manifest.waveId -ne $WaveId) { $issues.Add("manifest_wave_mismatch") }
  if ($manifest.collectionPerformed -ne $true) { $issues.Add("collection_not_recorded") }
  if ($manifest.taskPostState -ne "returned_task_ids_saved") { $issues.Add("task_post_not_certain") }
  if ($manifest.actualCostKnown -ne $true) { $issues.Add("cost_uncertain") }
  if ($manifest.status -isnot [string] -or $manifest.status -match '^(blocked_|stopped_)') { $issues.Add("blocked_or_stopped_manifest") }

  $captures = @($manifest.captures)
  $received = @($manifest.receivedTaskIds)
  $selectedTags = @($manifest.selectedCaptureIds)
  if ($captures.Count -ne 100) { $issues.Add("capture_count_not_100") }
  if (-not (Test-UniqueNonEmpty @($captures | ForEach-Object { $_.taskId }) 100)) { $issues.Add("capture_task_ids_not_exact_unique_100") }
  if (-not (Test-UniqueNonEmpty @($captures | ForEach-Object { $_.tag }) 100)) { $issues.Add("capture_tags_not_exact_unique_100") }
  if (-not (Test-UniqueNonEmpty @($received | ForEach-Object { $_.taskId }) 100)) { $issues.Add("received_task_ids_not_exact_unique_100") }
  if (-not (Test-UniqueNonEmpty @($received | ForEach-Object { $_.tag }) 100)) { $issues.Add("received_tags_not_exact_unique_100") }
  if (-not (Test-UniqueNonEmpty $selectedTags 100)) { $issues.Add("selected_tags_not_exact_unique_100") }

  $receivedByTag = @{}
  foreach ($item in $received) {
    if ($item.tag -is [string] -and -not $receivedByTag.ContainsKey($item.tag)) { $receivedByTag[$item.tag] = $item.taskId }
  }
  foreach ($capture in $captures) {
    if ($capture.tag -isnot [string] -or -not $receivedByTag.ContainsKey($capture.tag) -or $receivedByTag[$capture.tag] -ne $capture.taskId) {
      $issues.Add("capture_received_tag_id_join_mismatch")
      break
    }
  }

  $certainAttempts = @($waveRecord.attempts | Where-Object { $_.retryAllowed -eq $false })
  if ($certainAttempts.Count -ne 1 -or $certainAttempts[0].runId -ne $runId -or
      $certainAttempts[0].taskPostState -ne "returned_task_ids_saved") {
    $issues.Add("registry_attempt_not_one_certain_batch")
  }

  $readyStates = @("absent_returned_serp", "present_content_returned", "detected_partial", "provider_partial")
  $safeScreenshotStates = @("not_requested", "not_requested_on_resume", "downloaded_unreviewed")
  $pendingCount = 0
  $incompleteCount = 0
  foreach ($capture in $captures) {
    if ($capture.state -eq "pending") {
      $pendingCount++
      $incompleteCount++
    } elseif ($readyStates -notcontains $capture.state) {
      $issues.Add("capture_state_requires_manual_review")
    } else {
      if (-not $capture.files -or -not $capture.files.htmlEnvelope) {
        $incompleteCount++
      } elseif ($capture.htmlProviderState -ne "content_returned") {
        $issues.Add("html_result_requires_manual_review")
      }
    }

    if ($safeScreenshotStates -notcontains $capture.screenshotState) {
      $issues.Add("screenshot_state_requires_manual_review")
    } elseif ($capture.screenshotState -ne "downloaded_unreviewed") {
      $incompleteCount++
    } elseif (-not $capture.files -or -not $capture.files.screenshot) {
      $issues.Add("downloaded_screenshot_manifest_entry_missing")
    }
  }

  $issues = @($issues | Select-Object -Unique)
  if ($issues.Count) {
    return [pscustomobject]@{
      state = "manual_hold"; wave = $WaveId; runId = $runId; status = $manifest.status
      pendingCaptures = $pendingCount; incompleteEvidence = $incompleteCount; reasons = $issues
    }
  }

  if ($incompleteCount -eq 0) {
    if ($manifest.status -ne "collection_pass_finished_unreviewed") {
      return [pscustomobject]@{
        state = "manual_hold"; wave = $WaveId; runId = $runId; status = $manifest.status
        pendingCaptures = 0; incompleteEvidence = 0; reasons = @("complete_evidence_status_mismatch")
      }
    }
    return [pscustomobject]@{
      state = "complete"; wave = $WaveId; runId = $runId; status = $manifest.status
      pendingCaptures = 0; incompleteEvidence = 0; reasons = @()
    }
  }

  if ($manifest.status -ne "pending") {
    return [pscustomobject]@{
      state = "manual_hold"; wave = $WaveId; runId = $runId; status = $manifest.status
      pendingCaptures = $pendingCount; incompleteEvidence = $incompleteCount; reasons = @("incomplete_evidence_status_mismatch")
    }
  }
  return [pscustomobject]@{
    state = "resumable"; wave = $WaveId; runId = $runId; status = $manifest.status
    pendingCaptures = $pendingCount; incompleteEvidence = $incompleteCount; reasons = @()
  }
}

function Write-State([object]$State) {
  $State | ConvertTo-Json -Depth 6 -Compress | Write-Output
}

function Get-ResumeDeadlineUtc([string]$WaveId) {
  $registry = Read-JsonFile (Join-Path $StudyRoot "execution-registry.json")
  $anchorText = $registry.waves.w1.baselineSubmittedAt
  if ($anchorText -isnot [string]) { $anchorText = $registry.waves.w1.submittedAt }
  try {
    $anchor = [DateTimeOffset]::Parse(
      $anchorText, [Globalization.CultureInfo]::InvariantCulture,
      [Globalization.DateTimeStyles]::AdjustToUniversal -bor [Globalization.DateTimeStyles]::AssumeUniversal
    )
  } catch {
    throw "W1 has no valid UTC submission anchor; scheduled resume is blocked."
  }
  $offsetDays = @{ w2 = 7; w3 = 14; w4 = 21 }[$WaveId]
  return $anchor.UtcDateTime.AddDays($offsetDays).AddMinutes(10).AddHours(6)
}

$initial = Get-WaveState $Wave
if ($Mode -eq "Inspect") {
  Write-State $initial
  if ($initial.state -eq "manual_hold") { exit 20 }
  exit 0
}

if ($Mode -eq "Collect" -and $initial.state -ne "absent") {
  Write-State $initial
  Write-Error "Scheduled collection requires an unregistered wave; automatic repeat collection is refused."
  exit 21
}
if ($Mode -eq "Resume") {
  if ($initial.state -eq "complete") { Write-State $initial; exit 0 }
  if ($initial.state -ne "resumable") {
    Write-State $initial
    Write-Error "Scheduled resume requires one exact, certain, resumable 100-ID run."
    exit 22
  }
  $resumeDeadlineUtc = Get-ResumeDeadlineUtc $Wave
  if ([DateTime]::UtcNow -gt $resumeDeadlineUtc) {
    $overdue = [pscustomobject]@{
      state = "manual_hold"; wave = $Wave; runId = $initial.runId; status = $initial.status
      pendingCaptures = $initial.pendingCaptures; incompleteEvidence = $initial.incompleteEvidence
      reasons = @("resume_schedule_deadline_missed"); resumeDeadlineUtc = $resumeDeadlineUtc.ToString("yyyy-MM-ddTHH:mm:ss.fff'Z'")
    }
    Write-State $overdue
    Write-Error "The bounded resume period has ended; StartWhenAvailable catch-up is refused."
    exit 24
  }
}

New-Item -ItemType Directory -Path $LogRoot -Force | Out-Null
$logPath = Join-Path $LogRoot ("{0}-{1}.log" -f $Wave, $Mode.ToLowerInvariant())
$startedAt = [DateTime]::UtcNow.ToString("o")
Add-Content -LiteralPath $logPath -Encoding UTF8 -Value "[$startedAt] $Mode $Wave started"

if (-not $env:DATAFORSEO_CREDENTIALS_PATH) {
  if (-not $env:LOCALAPPDATA) { throw "LOCALAPPDATA is unavailable; credential path cannot be selected." }
  $env:DATAFORSEO_CREDENTIALS_PATH = Join-Path $env:LOCALAPPDATA "SunnyResearch/dataforseo.json"
}

Push-Location $RepoRoot
try {
  $commandName = if ($Mode -eq "Collect") { "--collect" } else { "--resume" }
  & $NodePath $WrapperPath $commandName "--wave" $Wave *>> $logPath
  $wrapperExit = $LASTEXITCODE
} finally {
  Pop-Location
}

$finishedAt = [DateTime]::UtcNow.ToString("o")
Add-Content -LiteralPath $logPath -Encoding UTF8 -Value "[$finishedAt] $Mode $Wave wrapper exit $wrapperExit"
if ($wrapperExit -ne 0) {
  $afterFailure = Get-WaveState $Wave
  Write-State $afterFailure
  Write-Error "Study wrapper returned $wrapperExit. Automatic retry is refused; inspect the log and raw run state."
  exit $wrapperExit
}

$final = Get-WaveState $Wave
Write-State $final
if ($final.state -eq "manual_hold" -or $final.state -eq "absent") {
  Write-Error "The post-operation manifest is not safe for unattended continuation."
  exit 23
}
exit 0
