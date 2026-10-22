// Writes src/data/lastmod.json: last git commit date per content folder, for sitemap <lastmod>.
// Run from a full (non-shallow) clone, then commit the result. CI clones are shallow, so the
// sitemap reads this file instead of calling git at build time.
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";

const out = {};
for (const kind of ["services", "portfolio", "website-design"]) {
  const root = `src/content/${kind}`;
  out[kind] = {};
  for (const slug of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", `${root}/${slug}`], { encoding: "utf8" }).trim();
    if (d) out[kind][slug] = d;
  }
}
writeFileSync("src/data/lastmod.json", JSON.stringify(out, null, 2) + "\n");
console.log(Object.values(out).reduce((n, o) => n + Object.keys(o).length, 0), "entries");
