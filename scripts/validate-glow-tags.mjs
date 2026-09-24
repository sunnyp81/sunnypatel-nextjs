import Markdoc from "@markdoc/markdoc";
import fs from "node:fs";
import path from "node:path";

const tags = {
  cta: { attributes: { heading: { type: String }, text: { type: String } } },
  pullquote: { attributes: { cite: { type: String } } },
  stat: { selfClosing: true, attributes: { value: { type: String, required: true }, label: { type: String, required: true }, source: { type: String } } },
  stats: {},
  chart: {
    selfClosing: true,
    attributes: {
      type: { type: String, matches: ["bar", "line", "donut"] },
      title: { type: String, required: true },
      data: { type: String, required: true },
      source: { type: String },
      eyebrow: { type: String },
      prefix: { type: String },
      suffix: { type: String },
      highlight: { type: String },
      series: { type: String },
    },
  },
  panel: { attributes: { eyebrow: { type: String }, title: { type: String }, tone: { type: String, matches: ["good", "bad"] }, id: { type: String } } },
  panels: {},
  quotecheck: { selfClosing: true },
  agencyscore: { selfClosing: true },
  resourcepicker: { selfClosing: true },
  localpackcalc: { selfClosing: true, attributes: { variant: { type: String, matches: ["dental"] } } },
};

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["src/content/blog", "src/content/website-design"].flatMap((d) =>
      fs.readdirSync(d).map((s) => path.join(d, s, "content.mdoc")).filter((f) => fs.existsSync(f))
    );

let bad = 0;
const counts = { chart: 0, pullquote: 0, stat: 0 };
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const ast = Markdoc.parse(src);
  const errs = Markdoc.validate(ast, { tags }).filter((e) => e.error.level !== "debug" && e.error.level !== "info");
  const probs = errs.map((e) => `line ${e.lines?.[0] + 1}: ${e.error.message}`);
  for (const node of ast.walk()) {
    if (node.type !== "tag") continue;
    if (counts[node.tag] !== undefined) counts[node.tag]++;
    if (node.tag === "chart") {
      const a = node.attributes;
      const nSeries = a.series ? String(a.series).split(";").length : 1;
      const pts = String(a.data).split("|").map((p) => {
        const i = p.lastIndexOf(":");
        const vals = p.slice(i + 1).split(";").map((v) => Number(v.trim().replace(/,/g, "")));
        if (vals.length !== nSeries) probs.push(`line ${node.lines[0] + 1}: "${p}" has ${vals.length} values, series has ${nSeries}`);
        return [p.slice(0, i).trim(), vals.every(Number.isFinite) ? vals[0] : NaN];
      });
      if (pts.length < 2 || pts.some(([l, v]) => !l || !Number.isFinite(v))) probs.push(`line ${node.lines[0] + 1}: bad chart data "${a.data}"`);
      if (a.type === "line" && pts.length < 3) probs.push(`line ${node.lines[0] + 1}: line chart needs 3+ points`);
      if (a.highlight && !pts.some(([l]) => l === a.highlight)) probs.push(`line ${node.lines[0] + 1}: highlight "${a.highlight}" not a label`);
    }
  }
  const lines = src.split("\n");
  for (const node of ast.walk()) {
    if (node.type !== "tag" || !["chart", "stat", "pullquote", "panel"].includes(node.tag)) continue;
    const [a, b] = [node.lines[0], node.lines[node.lines.length - 1]];
    const text = lines.slice(a, b + 1).join("\n");
    if (/[–—�]/.test(text)) probs.push(`line ${a + 1}: en/em dash or U+FFFD inside glow tag`);
  }
  if (probs.length) {
    bad++;
    console.log(f + "\n  " + probs.join("\n  "));
  }
}
console.log(`${files.length} files, ${bad} with problems, tags:`, counts);
process.exit(bad ? 1 : 0);
