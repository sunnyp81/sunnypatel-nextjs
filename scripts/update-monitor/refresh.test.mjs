import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { clean, excerpt, matchUpdate, normaliseIncident, validate } from "./refresh.mjs";

const nov = { id: "nov", name: "November 2026 core update", type: "core", start: "2026-11-10T18:06:00+00:00", end: null };
const sep = { id: "sep", name: "September 2026 spam update", type: "spam", start: "2026-09-24T16:15:00+00:00", end: "2026-10-08T08:00:00+00:00" };
const now = Date.parse("2026-11-17T12:00:00Z");

test("clean strips markup, entities and CDATA", () => {
  assert.equal(clean("<![CDATA[<p>Core &amp; spam&#8217;s &mdash; update</p>]]>"), "Core & spam’s - update");
});

test("excerpt cuts on a word and adds an ellipsis", () => {
  const out = excerpt("word ".repeat(80), 200);
  assert.ok(out.length <= 201 && out.endsWith("…"));
});

test("matches items that name the update inside its window", () => {
  assert.equal(matchUpdate({ kind: "community", date: "2026-11-12T10:00:00Z", text: "Google's core update is moving things" }, [nov, sep], now), "nov");
  assert.equal(matchUpdate({ kind: "news", date: "2026-11-16T10:00:00Z", title: "Google Ranking Volatility Continues" }, [nov], now), "nov");
});

test("rejects off-topic, out-of-window and loose community matches", () => {
  assert.equal(matchUpdate({ kind: "community", date: "2026-11-12T10:00:00Z", text: "Game patch: core update for Valorant" }, [nov], now), null);
  assert.equal(matchUpdate({ kind: "community", date: "2026-11-12T10:00:00Z", text: "Google ranking volatility today" }, [nov], now), null);
  assert.equal(matchUpdate({ kind: "news", date: "2026-07-01T10:00:00Z", title: "Google core update rumours" }, [nov, sep], now), null);
});

test("normalises a Google incident and strips the docs link", () => {
  const i = normaliseIncident({ id: "x", begin: nov.start, external_desc: "November 2026 core update", uri: "incidents/x", updates: [{ when: nov.start, text: "Released the November 2026 core update <https://developers.google.com/x>, which applies globally." }] });
  assert.equal(i.status, "rolling-out");
  assert.equal(i.googleNotes[0].text, "Released the November 2026 core update, which applies globally.");
});

test("validator rejects bad links and replacement characters", () => {
  const bad = { updates: [{ ...nov, url: "https://status.search.google.com/incidents/x", news: [{ url: "https://news.google.com/x", date: "2026-11-11", title: "a�" }], community: [] }] };
  assert.equal(validate(bad).length, 2);
});

test("committed data validates", () => {
  const data = JSON.parse(readFileSync(new URL("../../src/data/live/update-monitor.json", import.meta.url), "utf8"));
  assert.deepEqual(validate(data), []);
});
