[CmdletBinding()]
param(
  [ValidateSet("Plan", "Register")]
  [string]$Mode = "Plan",
  [string]$RepoRoot,
  [string]$StudyRoot,
  [string]$RunnerPath,
  [string]$OutputRoot,
  [string]$TaskPrefix = "Sunny-AIO-Citation",
  [string]$ConfirmRegistration,
  [switch]$RefreshPlan
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($TaskPrefix -notmatch '^[A-Za-z0-9-]+$') { throw "TaskPrefix may contain only letters, numbers, and hyphens." }
if (-not $RepoRoot) { $RepoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../..")) }
if (-not $StudyRoot) { $StudyRoot = Join-Path $RepoRoot "tmp/ctr-aio/citation-study" }
if (-not $RunnerPath) { $RunnerPath = Join-Path $RepoRoot "scripts/research/aio-citation-study-scheduled.ps1" }
if (-not $OutputRoot) { $OutputRoot = Join-Path $StudyRoot "scheduler-plan" }

$RepoRoot = [IO.Path]::GetFullPath($RepoRoot)
$StudyRoot = [IO.Path]::GetFullPath($StudyRoot)
$RunnerPath = [IO.Path]::GetFullPath($RunnerPath)
$OutputRoot = [IO.Path]::GetFullPath($OutputRoot)
$PowerShellPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$NodePath = (Get-Command node.exe -ErrorAction Stop).Source

if (-not (Test-Path -LiteralPath $RunnerPath -PathType Leaf)) { throw "Scheduled runner is missing: $RunnerPath" }
if (-not (Test-Path -LiteralPath $PowerShellPath -PathType Leaf)) { throw "Windows PowerShell is unavailable." }
if ([TimeZoneInfo]::Local.Id -ne "GMT Standard Time") {
  throw "Windows time zone must be GMT Standard Time so the local Task Scheduler triggers match the study UTC anchors."
}

function Read-JsonFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
  return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Write-ExactOrVerify([string]$Path, [string]$Content) {
  if (Test-Path -LiteralPath $Path -PathType Leaf) {
    $existing = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    if ($existing -cne $Content) {
      if (-not $RefreshPlan) { throw "Existing scheduler plan differs: $Path" }
      [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
    }
    return
  }
  [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
}

$registry = Read-JsonFile (Join-Path $StudyRoot "execution-registry.json")
$anchorText = $registry.waves.w1.baselineSubmittedAt
if ($anchorText -isnot [string]) { $anchorText = $registry.waves.w1.submittedAt }
$anchor = [datetime]::MinValue
if ($anchorText -isnot [string] -or -not [datetime]::TryParse(
    $anchorText, [Globalization.CultureInfo]::InvariantCulture,
    [Globalization.DateTimeStyles]::AdjustToUniversal -bor [Globalization.DateTimeStyles]::AssumeUniversal,
    [ref]$anchor)) {
  throw "The execution registry does not contain a valid W1 submission anchor."
}
$anchor = $anchor.ToUniversalTime()

$windowsUser = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $windowsUser -LogonType Interactive -RunLevel Limited
$definitions = [Collections.Generic.List[object]]::new()
$taskObjects = @{}

foreach ($item in @(
  [pscustomobject]@{ Wave = "w2"; Days = 7 },
  [pscustomobject]@{ Wave = "w3"; Days = 14 },
  [pscustomobject]@{ Wave = "w4"; Days = 21 }
)) {
  $targetUtc = $anchor.AddDays($item.Days)
  $targetLocal = $targetUtc.ToLocalTime()
  foreach ($operation in @("Collect", "Resume")) {
    $taskName = "{0}-{1}-{2}" -f $TaskPrefix, $item.Wave.ToUpperInvariant(), $operation
    $at = if ($operation -eq "Collect") { $targetLocal } else { $targetLocal.AddMinutes(10) }
    $arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -File "{0}" -Mode {1} -Wave {2} -RepoRoot "{3}" -StudyRoot "{4}" -NodePath "{5}"' -f
      $RunnerPath, $operation, $item.Wave, $RepoRoot, $StudyRoot, $NodePath
    $action = New-ScheduledTaskAction -Execute $PowerShellPath -Argument $arguments -WorkingDirectory $RepoRoot
    if ($operation -eq "Collect") {
      $trigger = New-ScheduledTaskTrigger -Once -At $at
      $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -WakeToRun -RunOnlyIfNetworkAvailable `
        -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -Hidden
    } else {
      $trigger = New-ScheduledTaskTrigger -Once -At $at -RepetitionInterval (New-TimeSpan -Minutes 10) `
        -RepetitionDuration (New-TimeSpan -Hours 6)
      $trigger.Repetition.StopAtDurationEnd = $false
      $trigger.EndBoundary = $targetUtc.AddMinutes(10).AddHours(6).ToString("yyyy-MM-ddTHH:mm:ss'Z'")
      $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -WakeToRun -RunOnlyIfNetworkAvailable `
        -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -Hidden
    }
    $task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal
    $taskObjects[$taskName] = $task
    $definitions.Add([ordered]@{
      taskName = $taskName
      wave = $item.Wave
      operation = $operation.ToLowerInvariant()
      targetSubmittedAtUtc = $targetUtc.ToString("yyyy-MM-ddTHH:mm:ss.fff'Z'")
      triggerAtLocal = $at.ToString("yyyy-MM-ddTHH:mm:ss")
      timeZone = [TimeZoneInfo]::Local.Id
      executable = $PowerShellPath
      nodeExecutable = $NodePath
      arguments = $arguments
      workingDirectory = $RepoRoot
      logonType = "InteractiveToken"
      requiresLoggedInUser = $true
      schedulerRetryCount = 0
      repetition = if ($operation -eq "Resume") { [ordered]@{ intervalMinutes = 10; durationHours = 6 } } else { $null }
      resumeEndsAtUtc = if ($operation -eq "Resume") { $targetUtc.AddMinutes(10).AddHours(6).ToString("yyyy-MM-ddTHH:mm:ss.fff'Z'") } else { $null }
      startWhenAvailable = $operation -eq "Resume"
      multipleInstances = "IgnoreNew"
    })
  }
}

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
foreach ($definition in $definitions) {
  $xml = (Export-ScheduledTask -InputObject $taskObjects[$definition.taskName]) -replace 'encoding="UTF-16"', 'encoding="UTF-8"'
  Write-ExactOrVerify (Join-Path $OutputRoot ("{0}.xml" -f $definition.taskName)) $xml
}
$plan = [ordered]@{
  schemaVersion = 1
  studyId = $registry.studyId
  w1SubmittedAtUtc = $anchor.ToString("yyyy-MM-ddTHH:mm:ss.fff'Z'")
  registrationMode = "current_user_interactive_token"
  noProviderCallDuringPlanning = $true
  tasks = $definitions
}
$planText = ($plan | ConvertTo-Json -Depth 8) + "`n"
Write-ExactOrVerify (Join-Path $OutputRoot "scheduler-plan.json") $planText

if ($Mode -eq "Plan") {
  $plan | ConvertTo-Json -Depth 8
  exit 0
}
if ($RefreshPlan) { throw "-RefreshPlan is only valid in offline Plan mode." }
if ($ConfirmRegistration -cne "REGISTER_W2_W3_W4") {
  throw "Registration requires -ConfirmRegistration REGISTER_W2_W3_W4 after plan audit."
}

$existing = @($definitions | Where-Object { Get-ScheduledTask -TaskName $_.taskName -ErrorAction SilentlyContinue })
if ($existing.Count) {
  throw "One or more exact study task names already exist. Refusing to overwrite any scheduled task."
}
foreach ($definition in $definitions) {
  Register-ScheduledTask -TaskName $definition.taskName -InputObject $taskObjects[$definition.taskName] -ErrorAction Stop | Out-Null
}
$plan | ConvertTo-Json -Depth 8
