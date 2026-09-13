#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const DEFAULT_OUTPUT_ROOT = path.join(ROOT, "tmp/ctr-aio/citation-study/hermes-telegram-systemd-plan-v1");
const BUNDLE_ROOT = "/root/.hermes/research/sunnypatel-aio-citation-v1";
const STATE_ROOT = `${BUNDLE_ROOT}/tmp/ctr-aio/citation-study`;
const NOTIFICATION_ROOT = `${STATE_ROOT}/notifications`;
const SCRIPT = `${BUNDLE_ROOT}/scripts/research/aio-citation-telegram-notify.mjs`;
const CREDENTIAL_PATH = "/root/.hermes/cron-env";
const KILL_FILE = "/root/.hermes/locks/KILL";
const NODE = "/usr/local/bin/node";

const sha256 = value => createHash("sha256").update(value).digest("hex");

function parseArgs(argv) {
  if (argv.length === 0) return {};
  if (argv.length === 2 && argv[0] === "--output" && argv[1]) return { outputRoot: path.resolve(argv[1]) };
  throw new Error("Use no arguments or --output DIRECTORY.");
}

export function buildTelegramUnitPlan() {
  const service = `[Unit]
Description=Notify Sunny when an AIO citation study wave is verified complete
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
User=root
WorkingDirectory=${BUNDLE_ROOT}
ExecCondition=/usr/bin/test ! -e ${KILL_FILE}
ExecCondition=/usr/bin/test -r ${CREDENTIAL_PATH}
ExecStart=${NODE} ${SCRIPT} --check
TimeoutStartSec=120
Restart=no
UMask=0077
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sunnypatel-aio-citation-telegram-notify
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
ReadWritePaths=${NOTIFICATION_ROOT}
`;
  const timer = `[Unit]
Description=Check AIO citation study wave completion every five minutes

[Timer]
OnCalendar=2026-09-20 10..23:0/5:00 UTC
OnCalendar=2026-09-27 10..23:0/5:00 UTC
OnCalendar=2026-10-04 10..23:0/5:00 UTC
AccuracySec=1s
RandomizedDelaySec=0
Persistent=true
Unit=sunnypatel-aio-citation-telegram-notify.service

[Install]
WantedBy=timers.target
`;
  return {
    schemaVersion: 1,
    deploymentState: "offline_plan_not_installed",
    units: [
      { filename: "sunnypatel-aio-citation-telegram-notify.service", content: service },
      { filename: "sunnypatel-aio-citation-telegram-notify.timer", content: timer },
    ],
  };
}

async function writeExact(file, content) {
  try {
    if (await readFile(file, "utf8") !== content) throw new Error(`Existing Telegram unit plan differs: ${file}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(file, content, { encoding: "utf8", flag: "wx", mode: 0o600 });
  }
}

export async function writeTelegramUnitPlan(plan, outputRoot) {
  await mkdir(outputRoot, { recursive: true });
  for (const unit of plan.units) await writeExact(path.join(outputRoot, unit.filename), unit.content);
  const manifest = {
    schemaVersion: 1,
    deploymentState: plan.deploymentState,
    units: plan.units.map(unit => ({ filename: unit.filename, bytes: Buffer.byteLength(unit.content), sha256: sha256(unit.content) })),
  };
  await writeExact(path.join(outputRoot, "unit-plan.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function runCli(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv);
  const outputRoot = dependencies.outputRoot || args.outputRoot || DEFAULT_OUTPUT_ROOT;
  const manifest = await writeTelegramUnitPlan(buildTelegramUnitPlan(), outputRoot);
  (dependencies.logger || console).log(`Offline Telegram systemd plan verified at ${outputRoot}; no unit was installed or run.`);
  return { outputRoot, manifest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch(error => {
    console.error(`aio-citation-telegram-units: ${error.message}`);
    process.exitCode = 1;
  });
}
