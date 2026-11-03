// Refreshes src/data/proof.json and src/data/portfolio-proof.json from the GSC API. Run on the VPS:
//   GOOGLE_APPLICATION_CREDENTIALS=/root/.hermes/gsc-service-account.json node scripts/update-proof-data.mjs
// Then commit + push + deploy. No npm deps: JWT is signed with node:crypto.
import { createSign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "sc-domain:sunnypatel.co.uk";
const OUT = new URL("../src/data/proof.json", import.meta.url).pathname;
const PORTFOLIO_OUT = new URL("../src/data/portfolio-proof.json", import.meta.url).pathname;
const PORTFOLIO_START = "2026-04-01";
const PORTFOLIO_SITES = [
  {
    site: "sc-domain:chargefinder.uk",
    sector: "EV charging directory",
    note: "new site, first search impressions late March 2026",
  },
  { site: "sc-domain:waterhard.uk", sector: "Home and water information site" },
];
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || "/root/.hermes/gsc-service-account.json";

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
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function query(token, body, site = SITE) {
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`query: ${res.status} ${await res.text()}`);
  return (await res.json()).rows || [];
}

const iso = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const gscLag = new Date(today.getTime() - 3 * 86400e3); // GSC data lags ~2-3 days
const start28 = new Date(gscLag.getTime() - 27 * 86400e3);
const start12mo = new Date(gscLag.getTime() - 365 * 86400e3);

const token = await getToken();

const [summaryRows, summary12moRows, queryRows, dateRows] = await Promise.all([
  query(token, { startDate: iso(start28), endDate: iso(gscLag) }),
  query(token, { startDate: iso(start12mo), endDate: iso(gscLag) }),
  query(token, { startDate: iso(start12mo), endDate: iso(gscLag), dimensions: ["query"], rowLimit: 1000 }),
  query(token, {
    startDate: iso(new Date(gscLag.getTime() - 8 * 7 * 86400e3)),
    endDate: iso(gscLag),
    dimensions: ["date"],
    rowLimit: 100,
  }),
]);

const s = summaryRows[0] || { clicks: 0, impressions: 0, position: 0 };
const s12mo = summary12moRows[0] || { clicks: 0, impressions: 0, position: 0 };

// A real, short, human-typed query: no GSC junk IDs, no AI-prompt-length strings.
const isRealQuery = (q) => !/^\d+:/.test(q) && q.length <= 45 && q.split(" ").length <= 7;

const rankings = queryRows
  .filter((r) => r.clicks >= 1 && r.impressions >= 50 && r.position <= 15 && isRealQuery(r.keys[0]))
  .sort((a, b) => a.position - b.position)
  .slice(0, 6)
  .map((r) => ({ query: r.keys[0], position: Math.round(r.position * 10) / 10 }));

// Bucket daily rows into the trailing 8 full weeks
const weekly = [];
for (let w = 7; w >= 0; w--) {
  const wEnd = new Date(gscLag.getTime() - w * 7 * 86400e3);
  const wStart = new Date(wEnd.getTime() - 6 * 86400e3);
  const clicks = dateRows
    .filter((r) => r.keys[0] >= iso(wStart) && r.keys[0] <= iso(wEnd))
    .reduce((sum, r) => sum + r.clicks, 0);
  weekly.push({ weekStart: iso(wStart), clicks });
}

// Completed months only: a month counts once GSC has final data for its last day.
const monthEnd = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return iso(new Date(Date.UTC(y, m, 0)));
};
const portfolioSeries = await Promise.all(
  PORTFOLIO_SITES.map(async ({ site, sector, note }) => {
    const rows = await query(
      token,
      { startDate: PORTFOLIO_START, endDate: iso(today), dimensions: ["date"], rowLimit: 25000 },
      site
    );
    if (!rows.length) throw new Error(`portfolio: no rows for ${site}`);
    const lastDay = rows.reduce((max, r) => (r.keys[0] > max ? r.keys[0] : max), "");
    const totals = new Map();
    for (const r of rows) {
      const ym = r.keys[0].slice(0, 7);
      totals.set(ym, (totals.get(ym) || 0) + r.clicks);
    }
    const months = [...totals]
      .filter(([ym]) => monthEnd(ym) <= lastDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, clicks]) => ({ ym, clicks }));
    return { sector, ...(note ? { note } : {}), months };
  })
);
const prevPortfolio = JSON.parse(readFileSync(PORTFOLIO_OUT, "utf8"));
for (const series of portfolioSeries) {
  const before = prevPortfolio.series.find((s) => s.sector === series.sector);
  if (before && series.months.length < before.months.length) {
    throw new Error(`portfolio: ${series.sector} lost months (${before.months.length} to ${series.months.length})`);
  }
}
writeFileSync(
  PORTFOLIO_OUT,
  JSON.stringify({ updatedAt: iso(today), source: "Google Search Console API", series: portfolioSeries }, null, 2) + "\n"
);

const prev = JSON.parse(readFileSync(OUT, "utf8"));
writeFileSync(
  OUT,
  JSON.stringify(
    {
      ...prev,
      updatedAt: iso(today),
      summary28d: {
        clicks: s.clicks,
        impressions: s.impressions,
        avgPosition: Math.round(s.position * 10) / 10,
      },
      summary12mo: {
        clicks: s12mo.clicks,
        impressions: s12mo.impressions,
        avgPosition: Math.round(s12mo.position * 10) / 10,
      },
      rankings: rankings.length ? rankings : prev.rankings,
      weeklyClicks: weekly,
    },
    null,
    2
  ) + "\n"
);
console.log(`proof.json updated: ${s.clicks} clicks / ${s.impressions} impressions, ${rankings.length} rankings, 8 weeks`);
