import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "src", "content");

// Patterns that indicate WordPress sidebar/widget content to remove
const WIDGET_MARKERS = [
  /^## Table of Contents\s*$/,
  /^Table of Contents$/,
  /^\[Toggle\]\(#\)$/,
  /^## Categories$/,
  /^## Need Expert Help\?/,
  /^Let me handle your SEO/,
  /^\[?\s*Book Free Consultation\s*\]?\s*$/,
  /^## Recent Posts$/,
  /^## Related Posts$/,
  /^## Share this/,
  /^## Latest Articles$/,
  /^## About the Author$/,
  /^## Leave a (?:Reply|Comment)$/,
  /^-\s+\[.*?\]\(\/category\//,
  /^\[\s*\n*\s*Book Free Consultation/,
];

function cleanFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Find the first line that matches a widget marker
  let cutIndex = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    for (const pattern of WIDGET_MARKERS) {
      if (pattern.test(trimmed)) {
        // Only cut if this is near the end of the file (last 30% of lines)
        if (i > lines.length * 0.6) {
          cutIndex = Math.min(cutIndex, i);
        }
        break;
      }
    }
  }

  if (cutIndex < lines.length) {
    const cleaned = lines.slice(0, cutIndex).join("\n").replace(/\n{3,}$/g, "\n").trim();
    writeFileSync(filePath, cleaned, "utf-8");
    const removed = lines.length - cutIndex;
    return removed;
  }
  return 0;
}

function processDir(dir, label) {
  const entries = readdirSync(dir);
  let totalRemoved = 0;

  for (const entry of entries) {
    const entryPath = join(dir, entry);
    if (!statSync(entryPath).isDirectory()) continue;

    const mdocPath = join(entryPath, "content.mdoc");
    try {
      const removed = cleanFile(mdocPath);
      if (removed > 0) {
        console.log(`  ${entry}: removed ${removed} widget lines`);
        totalRemoved += removed;
      }
    } catch {
      // skip
    }
  }
  return totalRemoved;
}

console.log("Stripping WordPress widgets from content...\n");

console.log("Blog posts:");
processDir(join(CONTENT_DIR, "blog"), "blog");

console.log("\nServices:");
processDir(join(CONTENT_DIR, "services"), "service");

console.log("\nPortfolio:");
processDir(join(CONTENT_DIR, "portfolio"), "portfolio");

console.log("\nPages:");
processDir(join(CONTENT_DIR, "pages"), "page");

console.log("\nDone!");
