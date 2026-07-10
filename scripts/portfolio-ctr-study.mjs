// Aggregates anonymised CTR-by-position data across every GSC property the
// service account can read. Output: src/data/ctr-study.json (no domains stored).
//   GOOGLE_APPLICATION_CREDENTIALS=/root/.hermes/gsc-service-account.json node scripts/portfolio-ctr-study.mjs
import { createSign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("../src/data/ctr-study.json", import.meta.url).pathname;
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || "/root/.hermes/gsc-service-account.json";
const MIN_IMPRESSIONS = 50; // per query row, filters noise

async function getToken() {
  const sa = JSON.parse(readFileSync(KEY_PATH, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${sig}`,
    }),
  });
  if (!res.ok) throw new Error(`token: ${res.status}`);
  return (await res.json()).access_token;
}

const iso = (d) => d.toISOString().slice(0, 10);
const end = new Date(Date.now() - 3 * 86400e3);
const start = new Date(end.getTime() - 89 * 86400e3);

const token = await getToken();
const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const sitesRes = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", { headers: auth });
const sites = (await sitesRes.json()).siteEntry?.filter((s) => s.permissionLevel !== "siteUnverifiedUser") || [];
console.log(`${sites.length} properties readable`);

// position bucket -> {clicks, impressions, queries}
const buckets = {};
const bucketKey = (pos) => (pos < 10.5 ? String(Math.round(pos)) : pos <= 20.5 ? "11-20" : "21+");
let siteCount = 0, rowCount = 0;

for (const site of sites) {
  try {
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: auth,
        body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions: ["query"], rowLimit: 5000 }),
      }
    );
    if (!res.ok) { console.log(`  skip ${site.siteUrl}: ${res.status}`); continue; }
    const rows = (await res.json()).rows || [];
    const usable = rows.filter((r) => r.impressions >= MIN_IMPRESSIONS && r.position >= 0.5);
    if (!usable.length) continue;
    siteCount++;
    for (const r of usable) {
      const k = bucketKey(r.position);
      buckets[k] ??= { clicks: 0, impressions: 0, queries: 0 };
      buckets[k].clicks += r.clicks;
      buckets[k].impressions += r.impressions;
      buckets[k].queries++;
      rowCount++;
    }
  } catch (e) {
    console.log(`  error ${site.siteUrl}: ${e.message}`);
  }
}

const order = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11-20", "21+"];
const table = order
  .filter((k) => buckets[k])
  .map((k) => ({
    position: k,
    ctr: Math.round((buckets[k].clicks / buckets[k].impressions) * 10000) / 100,
    clicks: buckets[k].clicks,
    impressions: buckets[k].impressions,
    queries: buckets[k].queries,
  }));

writeFileSync(
  OUT,
  JSON.stringify(
    {
      updatedAt: iso(new Date()),
      period: { start: iso(start), end: iso(end) },
      method: `Query-level GSC rows with >=${MIN_IMPRESSIONS} impressions, bucketed by rounded average position. Domains anonymised.`,
      sites: siteCount,
      queryRows: rowCount,
      table,
    },
    null,
    2
  ) + "\n"
);
console.log(`ctr-study.json: ${siteCount} sites, ${rowCount} query rows`);
console.table(table);
