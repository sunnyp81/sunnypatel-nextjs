// Scans public/images for "<name>.light.<ext>" variants sitting next to their
// dark/original file, and writes a manifest of which original public paths
// have a light counterpart. ThemedImage (src/components/themed-image.tsx) and
// MarkdocImage (src/lib/render-markdoc.tsx) read this manifest at build time
// to decide whether to render a theme-swapped pair or just the original.
import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = "public/images";
const OUT_FILE = "src/data/light-images.json";
const LIGHT_RE = /\.light\.(webp|png|jpg|jpeg|svg|avif)$/i;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function toPublicPath(diskPath) {
  // public/images/services/foo.webp -> /images/services/foo.webp
  return "/" + diskPath.split(path.sep).slice(1).join("/");
}

const manifest = {};
let lightCount = 0;
let orphanCount = 0;

if (fs.existsSync(IMAGES_DIR)) {
  for (const file of walk(IMAGES_DIR)) {
    if (!LIGHT_RE.test(file)) continue;
    lightCount++;
    const originalDisk = file.replace(/\.light\.(\w+)$/i, ".$1");
    if (!fs.existsSync(originalDisk)) {
      console.warn(`[light-image-manifest] ${toPublicPath(file)} has no matching original at ${toPublicPath(originalDisk)} — skipped`);
      orphanCount++;
      continue;
    }
    manifest[toPublicPath(originalDisk)] = true;
  }
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n");

console.log(`[light-image-manifest] ${Object.keys(manifest).length} light variant(s) mapped, ${orphanCount} orphaned light file(s), written to ${OUT_FILE}`);
