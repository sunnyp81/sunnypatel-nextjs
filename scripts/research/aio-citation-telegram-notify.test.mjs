import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { parseTelegramCredentials, runCheck, runCli, verifyWaveEvidence } from "./aio-citation-telegram-notify.mjs";
import { buildTelegramUnitPlan } from "./aio-citation-telegram-units.mjs";

const TOKEN = `123456789:${"A".repeat(35)}`;
const CHAT_ID = 123456789;
const sha256 = value => createHash("sha256").update(value).digest("hex");

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "aio-telegram-"));
  t.after(async () => {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(root));
    assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
    await rm(root, { recursive: true, force: true });
  });
  const bundle = path.join(root, "bundle");
  const studyRoot = path.join(bundle, "tmp/ctr-aio/citation-study");
  const notificationRoot = path.join(studyRoot, "notifications");
  const credentialPath = path.join(root, "cron-env");
  await mkdir(path.join(studyRoot, "frozen-v1"), { recursive: true });
  await writeFile(path.join(studyRoot, "frozen-v1/freeze-manifest.json"), "{}\n");
  await writeFile(credentialPath, `UNRELATED=$(do-not-run)\nTELEGRAM_BOT_TOKEN='${TOKEN}'\nTELEGRAM_HOME_CHANNEL=${CHAT_ID}\n`);
  const logs = [];
  return {
    root: bundle, studyRoot, notificationRoot, credentialPath, platform: "win32",
    timeoutSignal: () => undefined,
    verifyFrozen: async () => ({ verified: true }),
    logger: { log(message) { logs.push(message); } }, logs,
  };
}

function telegramFetch(counter, mutate = value => value) {
  return async (_url, options) => {
    counter.count++;
    const body = JSON.parse(options.body);
    return {
      ok: true,
      async json() {
        return mutate({ ok: true, result: { message_id: counter.count, chat: { id: body.chat_id, type: "private" }, text: body.text } });
      },
    };
  };
}

test("absent, pending, and manual-hold waves do not read credentials or send", async t => {
  const fx = await fixture(t);
  let calls = 0;
  assert.equal((await runCli(["--help"], {
    ...fx, credentialPath: path.join(fx.root, "missing"),
    fetchImpl: async () => { calls++; throw new Error("must not send"); },
  })).state, "help");
  fx.logs.length = 0;
  const statuses = await runCheck({
    ...fx,
    credentialPath: path.join(fx.root, "missing"),
    inspectWave: async wave => wave === "w2"
      ? { state: "absent", wave, runId: null, reasons: ["wave_not_registered"] }
      : wave === "w3"
        ? { state: "resumable", wave, runId: "pending-run", pendingCaptures: 1, incompleteEvidence: 1, reasons: [] }
        : { state: "manual_hold", wave, runId: "held-run", reasons: ["manual_review"] },
    fetchImpl: async () => { calls++; throw new Error("must not send"); },
  });
  assert.deepEqual(statuses.map(item => item.state), ["absent", "pending", "manual_hold"]);
  assert.equal(calls, 0);
  assert.deepEqual(fx.logs, ["w2: absent", "w3: pending", "w4: manual_hold"]);
});

test("setup binds the destination; a verified completion sends once and persists sanitized receipts", async t => {
  const fx = await fixture(t);
  const counter = { count: 0 };
  const deps = { ...fx, fetchImpl: telegramFetch(counter) };
  assert.equal((await runCli(["--test-connection"], deps)).state, "sent");
  const completed = wave => wave === "w2"
    ? { state: "complete", wave, runId: "run-w2", status: "collection_pass_finished_unreviewed", pendingCaptures: 0, incompleteEvidence: 0, reasons: [] }
    : { state: "absent", wave, runId: null, reasons: ["wave_not_registered"] };
  let verifications = 0;
  const checkDeps = {
    ...deps, inspectWave: async wave => completed(wave),
    verifyWaveEvidence: async () => { verifications++; return { captures: 100, files: 600 }; },
  };
  assert.equal((await runCheck(checkDeps))[0].state, "sent");
  assert.equal((await runCheck(checkDeps))[0].state, "already_sent");
  assert.equal(counter.count, 2);
  assert.equal(verifications, 1);
  const changedRun = await runCheck({ ...checkDeps, inspectWave: async wave => wave === "w2"
    ? { ...completed(wave), runId: "different-run" } : completed(wave) });
  assert.equal(changedRun[0].state, "held");
  assert.equal(counter.count, 2);
  assert.equal(verifications, 1);
  const persisted = (await Promise.all((await readdir(fx.notificationRoot)).map(file => readFile(path.join(fx.notificationRoot, file), "utf8")))).join("\n");
  assert.doesNotMatch(persisted, new RegExp(TOKEN.replace(":", "\\:")));
  assert.doesNotMatch(persisted, new RegExp(String(CHAT_ID)));
  assert.doesNotMatch(persisted, /chatId|chat_id|api\.telegram\.org|100\/100 captures/);
  assert.match(persisted, /"telegramMessageId": 2/);
  assert.match(persisted, /"state": "sent"/);
});

test("concurrent checks reserve one wave notification before one POST", async t => {
  const fx = await fixture(t);
  const setupCounter = { count: 0 };
  await runCli(["--test-connection"], { ...fx, fetchImpl: telegramFetch(setupCounter) });
  let release;
  let started;
  let wavePosts = 0;
  const blocked = new Promise(resolve => { release = resolve; });
  const began = new Promise(resolve => { started = resolve; });
  const deps = {
    ...fx,
    inspectWave: async wave => wave === "w2"
      ? { state: "complete", wave, runId: "concurrent-run", status: "collection_pass_finished_unreviewed", pendingCaptures: 0, incompleteEvidence: 0, reasons: [] }
      : { state: "absent", wave, runId: null, reasons: [] },
    verifyWaveEvidence: async () => ({ captures: 100, files: 600 }),
    fetchImpl: async (_url, options) => {
      wavePosts++;
      started();
      await blocked;
      const body = JSON.parse(options.body);
      return { ok: true, json: async () => ({ ok: true, result: { message_id: 9, chat: { id: body.chat_id, type: "private" }, text: body.text } }) };
    },
  };
  const first = runCheck(deps);
  await began;
  const second = await runCheck(deps);
  release();
  await first;
  assert.equal(wavePosts, 1);
  assert.equal(second[0].state, "held");
});

test("an invalid acknowledgement becomes uncertain and is never blindly retried", async t => {
  const fx = await fixture(t);
  const setupCounter = { count: 0 };
  await runCli(["--test-connection"], { ...fx, fetchImpl: telegramFetch(setupCounter) });
  let calls = 0;
  const deps = {
    ...fx,
    inspectWave: async wave => wave === "w2"
      ? { state: "complete", wave, runId: "uncertain-run", status: "collection_pass_finished_unreviewed", pendingCaptures: 0, incompleteEvidence: 0, reasons: [] }
      : { state: "absent", wave, runId: null, reasons: [] },
    verifyWaveEvidence: async () => ({ captures: 100, files: 600 }),
    fetchImpl: telegramFetch({ get count() { return calls; }, set count(value) { calls = value; } }, ack => ({ ...ack, result: { ...ack.result, message_id: 0 } })),
  };
  assert.equal((await runCheck(deps))[0].state, "uncertain");
  assert.equal((await runCheck(deps))[0].state, "held");
  assert.equal(calls, 1);
});

async function evidenceFixture(t) {
  const fx = await fixture(t);
  const wave = "w2";
  const runId = "evidence-run";
  const runDir = path.join(fx.studyRoot, "runs", wave, runId);
  await mkdir(path.join(runDir, "evidence"), { recursive: true });
  const files = {};
  for (const role of ["advancedEnvelope", "normalized", "htmlEnvelope", "html", "screenshotEnvelope", "screenshot"]) {
    const payload = Buffer.from(`fixture-${role}`);
    const relative = `evidence/${role}.bin`;
    await writeFile(path.join(runDir, relative), payload);
    files[role] = { path: relative, sha256: sha256(payload), bytes: payload.length };
  }
  await writeFile(path.join(fx.studyRoot, "execution-registry.json"), JSON.stringify({ waves: { w2: { runId } } }));
  await writeFile(path.join(runDir, "run-manifest.json"), JSON.stringify({ waveId: wave, runId, captures: [{ files }] }));
  return { ...fx, wave, runId, runDir, files };
}

test("evidence verification checks hashes and blocks path escape", async t => {
  const fx = await evidenceFixture(t);
  assert.deepEqual(await verifyWaveEvidence({ studyRoot: fx.studyRoot, wave: fx.wave, runId: fx.runId, expectedCaptureCount: 1 }), { captures: 1, files: 6 });
  await writeFile(path.join(fx.runDir, fx.files.html.path), "corrupt");
  await assert.rejects(verifyWaveEvidence({ studyRoot: fx.studyRoot, wave: fx.wave, runId: fx.runId, expectedCaptureCount: 1 }), /bytes or SHA-256/);
  fx.files.html.path = "../escape.bin";
  await writeFile(path.join(fx.runDir, "run-manifest.json"), JSON.stringify({ waveId: fx.wave, runId: fx.runId, captures: [{ files: fx.files }] }));
  await assert.rejects(verifyWaveEvidence({ studyRoot: fx.studyRoot, wave: fx.wave, runId: fx.runId, expectedCaptureCount: 1 }), /escape/);
});

test("credentials select only literal unique values and failures never expose secrets", async t => {
  assert.deepEqual(parseTelegramCredentials(`OTHER=$(ignored)\nexport TELEGRAM_BOT_TOKEN=${TOKEN}\nTELEGRAM_HOME_CHANNEL='${CHAT_ID}'\n`).chatId, CHAT_ID);
  assert.throws(() => parseTelegramCredentials(`TELEGRAM_BOT_TOKEN=${TOKEN}\nTELEGRAM_BOT_TOKEN=${TOKEN}\nTELEGRAM_HOME_CHANNEL=${CHAT_ID}`), /duplicated/);
  assert.throws(() => parseTelegramCredentials(`TELEGRAM_BOT_TOKEN=$TOKEN\nTELEGRAM_HOME_CHANNEL=${CHAT_ID}`), /literal/);
  assert.throws(() => parseTelegramCredentials(`TELEGRAM_BOT_TOKEN=${TOKEN}\nTELEGRAM_HOME_CHANNEL=-100`), /invalid/);

  const fx = await fixture(t);
  let calls = 0;
  await assert.rejects(runCli(["--test-connection"], {
    ...fx, platform: "linux",
    stat: async () => ({ isFile: () => true, mode: 0o100644, uid: 0 }),
    fetchImpl: async () => { calls++; throw new Error(`network ${TOKEN} ${CHAT_ID}`); },
  }), error => error.exitCode === 1);
  assert.equal(calls, 0);
  assert.equal(fx.logs.join("\n"), "telegram setup test: failed");
  assert.doesNotMatch(fx.logs.join("\n"), new RegExp(String(CHAT_ID)));
});

test("systemd observer is bounded to three study dates and has scoped write access", () => {
  const plan = buildTelegramUnitPlan();
  const service = plan.units.find(unit => unit.filename.endsWith(".service")).content;
  const timer = plan.units.find(unit => unit.filename.endsWith(".timer")).content;
  assert.match(service, /^ExecStart=\/usr\/local\/bin\/node \/root\/\.hermes\/research\/sunnypatel-aio-citation-v1\/scripts\/research\/aio-citation-telegram-notify\.mjs --check$/m);
  assert.match(service, /^TimeoutStartSec=120$/m);
  assert.match(service, /^Restart=no$/m);
  assert.match(service, /^NoNewPrivileges=true$/m);
  assert.match(service, /^ReadOnlyPaths=\/root\/\.hermes\/research\/sunnypatel-aio-citation-v1$/m);
  assert.match(service, /^ReadWritePaths=\/root\/\.hermes\/research\/sunnypatel-aio-citation-v1\/tmp\/ctr-aio\/citation-study\/notifications$/m);
  assert.deepEqual(timer.match(/^OnCalendar=.*$/gm), [
    "OnCalendar=2026-09-20 10..23:0/5:00 UTC",
    "OnCalendar=2026-09-27 10..23:0/5:00 UTC",
    "OnCalendar=2026-10-04 10..23:0/5:00 UTC",
  ]);
  assert.match(timer, /^Persistent=true$/m);
  assert.doesNotMatch(timer, /\*-\*-\*/);
});
