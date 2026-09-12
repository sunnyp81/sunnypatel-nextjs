// Reproduce public historical aggregates and chart. No private API access.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const read = name => JSON.parse(readFileSync(new URL(name, root), "utf8"));
const data = read("src/data/ctr-study.json");
const method = read("src/data/ctr-study-method.json");
const totals = data.table.reduce((a, r) => ({clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions, queryRows: a.queryRows + r.queries}), {clicks: 0, impressions: 0, queryRows: 0});
assert.equal(data.table.length, 12);
assert.deepEqual(totals, {clicks: 1667, impressions: 382941, queryRows: 2615});
assert.equal(data.queryRows, totals.queryRows);
for (const row of data.table) assert.equal(row.ctr, Math.round(10000 * row.clicks / row.impressions) / 100);
for (const dir of ["public/downloads/", "public/images/stats/"]) mkdirSync(new URL(dir, root), {recursive: true});
const write = (path, value) => writeFileSync(new URL(path, root), value);
const exported = {edition: method.edition, period: data.period, extractedAt: data.updatedAt, qualifyingProperties: data.sites, queryRows: data.queryRows, totals, table: data.table, methodology: method};
write("public/downloads/google-ctr-study-2026-07.json", JSON.stringify(exported, null, 2) + "\n");
const columns = ["positionBucket", "ctrPercent", "clicks", "impressions", "queryPropertyRows", "periodStart", "periodEnd", "qualifyingProperties", "countryFilter", "brandExclusion", "minimumImpressions", "rowLimitPerProperty", "pagination", "bucketRule", "limitations", "sourceUrl", "reviewedAt"];
const rows = data.table.map(r => [r.position, r.ctr.toFixed(2), r.clicks, r.impressions, r.queries, data.period.start, data.period.end, data.sites, "none", "none", method.minimumImpressions, method.rowLimitPerProperty, "none", method.bucketRule, method.limitations.join(" "), method.pageUrl, method.reviewedAt]);
const quote = v => `"${String(v).replaceAll('"', '""')}"`;
write("public/downloads/google-ctr-study-2026-07.csv", "\uFEFF" + [columns, ...rows].map(row => row.map(quote).join(",")).join("\n") + "\n");
const esc = s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const fmt = n => n.toLocaleString("en-GB");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
<title id="title">Google CTR by average-position bucket: a portfolio sample</title>
<desc id="desc">Twelve historical buckets from 53 qualifying Search Console properties, 9 April to 7 July 2026. No country filter or brand exclusion. CTR ranges from 0.04 to 8.61 percent. Position one has just five query rows. Exact data and limitations are available at ${method.pageUrl}.</desc>
<rect width="1600" height="900" fill="#0b1220"/><g font-family="Arial, sans-serif" fill="#f3f5fa">
<text x="70" y="65" font-size="20" fill="#a6bfea">SUNNY PATEL · ORIGINAL PORTFOLIO DATA</text>
<text x="70" y="124" font-size="43" font-weight="700">Google CTR by average-position bucket</text>
<text x="70" y="165" font-size="23" fill="#c3cedf">9 April–7 July 2026 · 53 qualifying properties · No country filter or brand exclusion</text>
<text x="70" y="212" font-size="18" fill="#c3cedf">BUCKET</text><text x="1010" y="212" font-size="18" fill="#c3cedf" text-anchor="end">CTR</text><text x="1230" y="212" font-size="18" fill="#c3cedf" text-anchor="end">IMPRESSIONS</text><text x="1510" y="212" font-size="18" fill="#c3cedf" text-anchor="end">QUERY ROWS</text>
${[0, 2, 4, 6, 8, 10].map(v=>`<line x1="${230 + v * 68}" x2="${230 + v * 68}" y1="232" y2="714" stroke="#354057"/><text x="${230 + v * 68}" y="745" font-size="18" fill="#c3cedf" text-anchor="middle">${v}%</text>`).join("")}
${data.table.map((r,i)=>{const y=248+i*39;return `<text x="70" y="${y+18}" font-size="23">${esc(r.position)}</text><rect x="230" y="${y}" width="${r.ctr*68}" height="25" fill="#8aacff"/><text x="1010" y="${y+19}" font-size="23" text-anchor="end">${r.ctr.toFixed(2)}%</text><text x="1230" y="${y+19}" font-size="23" text-anchor="end">${fmt(r.impressions)}</text><text x="1510" y="${y+19}" font-size="23" text-anchor="end">${fmt(r.queries)}</text>`}).join("")}
<text x="70" y="790" font-size="22" fill="#e4ebf7">Position one: 43 clicks / 721 impressions / five rows. Different query groups; no causal ranking inference.</text>
<text x="70" y="831" font-size="19" fill="#c3cedf">Up to 5,000 rows requested per property; retained rows have 50+ impressions. No pagination. Property overlap unverified.</text>
<text x="70" y="868" font-size="19" fill="#a6bfea">Source and exact bucket rules: sunnypatel.co.uk/blog/google-ctr-study/ · Interpretation corrected 12 September 2026</text>
</g></svg>`;
write("public/images/stats/portfolio-ctr-study-2026.svg", svg);
await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL("public/images/stats/portfolio-ctr-study-2026.png", root)));
console.log(JSON.stringify({edition: method.edition, rows: data.table.length, totals, chart: "1600x900", privateApiRequests: 0}));
