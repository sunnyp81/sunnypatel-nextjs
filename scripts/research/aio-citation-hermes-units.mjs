#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const DEFAULT_STUDY_ROOT = path.join(ROOT, "tmp/ctr-aio/citation-study");
const DEFAULT_OUTPUT_ROOT = path.join(DEFAULT_STUDY_ROOT, "hermes-systemd-plan-v3");
const BUNDLE_ROOT = "/root/.hermes/research/sunnypatel-aio-citation-v1";
const STATE_ROOT = `${BUNDLE_ROOT}/tmp/ctr-aio/citation-study`;
const RUNNER = `${BUNDLE_ROOT}/scripts/research/aio-citation-hermes-runner.mjs`;
const CREDENTIAL_PATH = "/root/.hermes/research-secrets/sunnypatel-aio-dataforseo.json";
const NODE = "/usr/local/bin/node";
const KILL_FILE = "/root/.hermes/locks/KILL";
const SYSTEMD_OPERATION_LOCK = `${STATE_ROOT}/locks/hermes-systemd-operation.lock`;
const WAVES = [
  { wave: "w2", offsetDays: 7 },
  { wave: "w3", offsetDays: 14 },
  { wave: "w4", offsetDays: 21 },
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const iso = (date) => date.toISOString();
const calendar = (date) => `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 23)} UTC`;

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] !== "--output" || !argv[index + 1]) throw new Error(`Unknown or incomplete argument: ${argv[index]}`);
    args.outputRoot = path.resolve(argv[++index]);
  }
  return args;
}

function serviceUnit({ wave, operation }) {
  const timeout = operation === "collect" ? "30min" : "10min";
  const identifier = `sunnypatel-aio-citation-${wave}-${operation}`;
  return `[Unit]
Description=Sunny Patel AIO citation study ${wave.toUpperCase()} ${operation}
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
User=root
WorkingDirectory=${BUNDLE_ROOT}
Environment=DATAFORSEO_CREDENTIALS_PATH=${CREDENTIAL_PATH}
ExecCondition=/usr/bin/test ! -e ${KILL_FILE}
ExecCondition=/usr/bin/test -r ${CREDENTIAL_PATH}
ExecStart=/usr/bin/flock --nonblock --exclusive ${SYSTEMD_OPERATION_LOCK} ${NODE} ${RUNNER} --${operation} --wave ${wave}
TimeoutStartSec=${timeout}
Restart=no
UMask=0077
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${identifier}
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectSystem=strict
ProtectHome=read-only
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
ProtectClock=true
LockPersonality=true
RestrictSUIDSGID=true
RestrictNamespaces=true
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
ReadOnlyPaths=${BUNDLE_ROOT}
ReadOnlyPaths=${CREDENTIAL_PATH}
ReadOnlyPaths=${STATE_ROOT}/frozen-v1
ReadWritePaths=${STATE_ROOT}
ReadWritePaths=/tmp
`;
}

function timerUnit({ wave, operation, occurrences }) {
  const service = `sunnypatel-aio-citation-${wave}-${operation}.service`;
  const calendars = occurrences.map((at) => `OnCalendar=${calendar(at)}`).join("\n");
  return `[Unit]
Description=Schedule Sunny Patel AIO citation study ${wave.toUpperCase()} ${operation}

[Timer]
${calendars}
AccuracySec=1s
RandomizedDelaySec=0
Persistent=true
RemainAfterElapse=true
Unit=${service}

[Install]
WantedBy=timers.target
`;
}

function resumeOccurrences(target) {
  return Array.from({ length: 37 }, (_, index) => new Date(target.getTime() + (10 + index * 10) * 60_000));
}

export function buildUnitPlan(w1SubmittedAt) {
  const baseline = new Date(w1SubmittedAt);
  if (!Number.isFinite(baseline.getTime())) throw new Error("W1 submission anchor is missing or invalid.");
  const units = [];
  const operations = [];
  for (const { wave, offsetDays } of WAVES) {
    const target = new Date(baseline.getTime() + offsetDays * 86_400_000);
    for (const operation of ["collect", "resume"]) {
      const occurrences = operation === "collect" ? [target] : resumeOccurrences(target);
      const basename = `sunnypatel-aio-citation-${wave}-${operation}`;
      const service = serviceUnit({ wave, operation });
      const timer = timerUnit({ wave, operation, occurrences });
      units.push(
        { filename: `${basename}.service`, content: service },
        { filename: `${basename}.timer`, content: timer },
      );
      operations.push({
        wave,
        operation,
        targetSubmittedAt: iso(target),
        firstOccurrence: iso(occurrences[0]),
        lastOccurrence: iso(occurrences.at(-1)),
        occurrenceCount: occurrences.length,
        service: `${basename}.service`,
        timer: `${basename}.timer`,
        timeout: operation === "collect" ? "30min" : "10min",
      });
    }
  }
  return {
    schemaVersion: 1,
    deploymentState: "offline_plan_not_installed",
    w1SubmittedAt: iso(baseline),
    bundleRoot: BUNDLE_ROOT,
    stateRoot: STATE_ROOT,
    nodeExecutable: NODE,
    runnerPath: RUNNER,
    credentialPath: CREDENTIAL_PATH,
    killFile: KILL_FILE,
    systemdOperationLock: SYSTEMD_OPERATION_LOCK,
    operations,
    units,
  };
}

async function writeExact(file, content) {
  try {
    const existing = await readFile(file, "utf8");
    if (existing !== content) throw new Error(`Existing systemd plan differs: ${file}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(file, content, { encoding: "utf8", flag: "wx" });
  }
}

export async function writeUnitPlan(plan, outputRoot) {
  await mkdir(outputRoot, { recursive: true });
  for (const unit of plan.units) await writeExact(path.join(outputRoot, unit.filename), unit.content);
  const manifest = {
    schemaVersion: plan.schemaVersion,
    deploymentState: plan.deploymentState,
    w1SubmittedAt: plan.w1SubmittedAt,
    bundleRoot: plan.bundleRoot,
    stateRoot: plan.stateRoot,
    nodeExecutable: plan.nodeExecutable,
    runnerPath: plan.runnerPath,
    credentialPath: plan.credentialPath,
    killFile: plan.killFile,
    systemdOperationLock: plan.systemdOperationLock,
    operations: plan.operations,
    units: plan.units.map(({ filename, content }) => ({ filename, bytes: Buffer.byteLength(content), sha256: sha256(content) })),
    readbackVerification: [
      "systemd-analyze verify /etc/systemd/system/sunnypatel-aio-citation-*.service /etc/systemd/system/sunnypatel-aio-citation-*.timer",
      "systemctl cat sunnypatel-aio-citation-w2-collect.timer sunnypatel-aio-citation-w2-resume.timer",
      "systemctl show sunnypatel-aio-citation-w2-collect.timer -p ActiveState -p NextElapseUSecRealtime -p LastTriggerUSec",
      "systemctl show sunnypatel-aio-citation-w2-collect.service -p ActiveState -p Result -p ExecMainStatus -p NRestarts",
      "systemctl list-timers 'sunnypatel-aio-citation-*' --all",
      "journalctl -u 'sunnypatel-aio-citation-*' --since today --no-pager",
    ],
    notes: [
      "Do not test-run a collect service.",
      "Install only after the isolated bundle, frozen hashes, W1 state, credential path, disk headroom, DNS and time synchronization are verified.",
      "Disable the Windows study tasks before enabling these timers; the two schedulers must never be armed together.",
      "The runner and frozen wrapper remain authoritative for UTC windows, task identity, money, locks and uncertain outcomes.",
      "Persistent timers may catch up after a brief outage, but the runner rejects a late start outside the frozen UTC window before a provider call.",
      "The service-level flock prevents collect/resume overlap; the runner's separate durable lock is never removed automatically and requires manual audit if left behind.",
      "These units collect evidence only; they do not review, compare, publish or message through Hermes.",
    ],
  };
  await writeExact(path.join(outputRoot, "unit-plan.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function runCli(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv);
  const studyRoot = dependencies.studyRoot || DEFAULT_STUDY_ROOT;
  const outputRoot = dependencies.outputRoot || args.outputRoot || DEFAULT_OUTPUT_ROOT;
  const registry = JSON.parse(await readFile(path.join(studyRoot, "execution-registry.json"), "utf8"));
  const anchor = registry?.waves?.w1?.baselineSubmittedAt || registry?.waves?.w1?.submittedAt;
  const plan = buildUnitPlan(anchor);
  const manifest = await writeUnitPlan(plan, outputRoot);
  (dependencies.logger || console).log(`Offline systemd plan verified at ${outputRoot}; no unit was installed or run.`);
  return { outputRoot, manifest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(`aio-citation-hermes-units: ${error.message}`);
    process.exitCode = 1;
  });
}
