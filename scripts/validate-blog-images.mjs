import fs from "node:fs";
import path from "node:path";

const dir = "src/content/blog";
const byImage = new Map();
let bad = 0;

for (const slug of fs.readdirSync(dir)) {
  const file = path.join(dir, slug, "index.yaml");
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  const m = src.match(/^ogImage:\s*(.+)$/m);
  const img = (m ? m[1].trim() : "").replace(/^['"]|['"]$/g, "");
  if (!img) {
    console.log(`${file}\n  missing ogImage`);
    bad++;
    continue;
  }
  const onDisk = path.join("public", img);
  if (!fs.existsSync(onDisk)) {
    console.log(`${file}\n  ogImage "${img}" has no file at ${onDisk}`);
    bad++;
  }
  if (!byImage.has(img)) byImage.set(img, []);
  byImage.get(img).push(slug);
}

for (const [img, slugs] of byImage) {
  if (slugs.length > 1) {
    console.log(`${img}\n  reused by ${slugs.length} posts: ${slugs.join(", ")}`);
    bad++;
  }
}

console.log(`${byImage.size} images, ${bad} problems`);
process.exit(bad ? 1 : 0);
