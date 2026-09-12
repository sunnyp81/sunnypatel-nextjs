// Rebuild public citation downloads and the chart from the same data used by the page.
// Run after editing src/data/seo-statistics.json: node scripts/export-seo-statistics.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const data = JSON.parse(readFileSync(new URL("../src/data/seo-statistics.json", import.meta.url), "utf8"));
const publicDir = new URL("../public/", import.meta.url);
mkdirSync(new URL("downloads/", publicDir), { recursive: true });
mkdirSync(new URL("images/stats/", publicDir), { recursive: true });
const columns = ["id", "value", "label", "scope", "topic", "statement", "period", "sourceDate", "sourceDateType", "sample", "source", "sourceUrl", "caveat", "checked", "permalink"];
const cell = value => `"${String(value).replaceAll('"', '""')}"`;
const csv = [columns, ...data.statistics.map(stat => columns.map(key => key === "permalink" ? `${data.pageUrl}#${stat.id}` : stat[key]))].map(row => row.map(cell).join(",")).join("\r\n") + "\r\n";
writeFileSync(new URL("downloads/seo-statistics-uk-2026.csv", publicDir), "\ufeff" + csv, "utf8");
writeFileSync(new URL("downloads/seo-statistics-uk-2026.json", publicDir), JSON.stringify(data, null, 2) + "\n", "utf8");
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const ticks = [0, 25, 50, 75, 100].map(n => `<text x="${380 + 1030 * n / 100}" y="268" text-anchor="middle" fill="#b6bdcc" font-size="22">${n}%</text><line x1="${380 + 1030 * n / 100}" x2="${380 + 1030 * n / 100}" y1="286" y2="678" stroke="#303846"/>`).join("");
const bars = data.zeroClickChart.values.map((row, i) => { const y = 310 + i * 62; return `<text x="64" y="${y + 29}" fill="#ededf1" font-size="29">${escape(row.country)}</text><rect x="380" y="${y}" width="${1030 * row.value / 100}" height="40" fill="${i === 0 ? "#96b6ff" : "#aab4c8"}"/><text x="1518" y="${y + 29}" text-anchor="end" fill="#ededf1" font-size="30" font-weight="700">${row.value.toFixed(1)}%</text>`; }).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
<title id="title">Google zero-click searches across six countries</title><desc id="desc">${data.zeroClickChart.values.map(r => `${r.country}: ${r.value.toFixed(1)}%`).join("; ")}. Browser-based panel; excludes Google mobile app. Published June 2026. Shared method says January to April 2026 but labels that line US; UK period not separately confirmed.</desc>
<rect width="1600" height="900" fill="#0c0f15"/><g font-family="Arial, sans-serif"><text x="64" y="66" font-size="21" letter-spacing="3" fill="#96b6ff">SUNNY PATEL / UK SEO STATISTICS</text><text x="64" y="135" font-size="54" font-weight="700" fill="#ededf1">Google searches ending without a click</text><text x="64" y="190" font-size="26" fill="#b6bdcc">Six-country browser panel • Analysis published 16 June 2026</text>${ticks}${bars}
<text x="64" y="741" font-size="22" fill="#c0c7d6">Sources: SparkToro / Similarweb. Google mobile app excluded; panel sizes not disclosed.</text><text x="64" y="779" font-size="21" fill="#c0c7d6">Shared method: January–April 2026, labelled US. UK period not separately confirmed.</text><text x="64" y="844" font-size="22" fill="#96b6ff">Chart and source notes: sunnypatel.co.uk/blog/seo-statistics-uk/</text></g>
<metadata>${escape(JSON.stringify({ source: data.zeroClickChart.sourceUrl, dataProvider: "https://www.similarweb.com/", compiler: data.pageUrl, reviewed: data.version }))}</metadata></svg>`;
writeFileSync(new URL("images/stats/uk-zero-click-2026.svg", publicDir), svg, "utf8");
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(new URL("images/stats/uk-zero-click-2026.png", publicDir).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
console.log(`Exported ${data.statistics.length} statistics and ${data.zeroClickChart.values.length} chart values.`);
