// Lists content pages due a real review: lastUpdated older than 25 days or missing. Markdown to stdout, always exit 0.
// Blog uses index.yaml lastUpdated; collections without that field fall back to the last commit date in src/data/lastmod.json.
// Usage: node scripts/freshness-report.mjs [--days 25]
import { existsSync, readdirSync, readFileSync } from "node:fs";

const argDays = process.argv.indexOf("--days");
const DAYS = argDays > -1 ? Number(process.argv[argDays + 1]) : 25;
const today = new Date(new Date().toISOString().slice(0, 10));
const lastmod = JSON.parse(readFileSync("src/data/lastmod.json", "utf8"));
const kinds = { blog: "/blog/", services: "/services/", portfolio: "/portfolio/", "website-design": "/website-design/" };

const field = (yaml, key) => yaml.match(new RegExp(`^${key}:\\s*['"]?(\\d{4}-\\d{2}-\\d{2})`, "m"))?.[1];
const age = (d) => Math.floor((today - new Date(d)) / 86400000);

const groups = {};
let total = 0;
for (const [kind, prefix] of Object.entries(kinds)) {
  const root = `src/content/${kind}`;
  if (!existsSync(root)) continue;
  for (const slug of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    const file = `${root}/${slug}/index.yaml`;
    if (!existsSync(file)) continue;
    const yaml = readFileSync(file, "utf8");
    const title = yaml.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)?.[1] ?? slug;
    const updated = field(yaml, "lastUpdated");
    const date = updated ?? lastmod[kind]?.[slug];
    const basis = updated ? "lastUpdated" : date ? "last commit" : "missing";
    if (date && age(date) <= DAYS) continue;
    (groups[kind] ??= []).push({ slug, title, date, basis, url: `${prefix}${slug}/` });
    total++;
  }
}

const out = [
  `Generated ${today.toISOString().slice(0, 10)}. Pages with no review date in the last ${DAYS} days: **${total}**.`,
  "",
  "Only change `lastUpdated` after the page's facts, figures and links have actually been re-checked. Bumping the date without a review is fake freshness.",
];
for (const [kind, rows] of Object.entries(groups)) {
  rows.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  out.push("", `## ${kind} (${rows.length})`, "", "| Page | Date | Basis | Days |", "|---|---|---|---|");
  for (const r of rows) out.push(`| [${r.title.replaceAll("|", "\\|")}](https://sunnypatel.co.uk${r.url}) | ${r.date ?? "none"} | ${r.basis} | ${r.date ? age(r.date) : "n/a"} |`);
}
console.log(out.join("\n"));
