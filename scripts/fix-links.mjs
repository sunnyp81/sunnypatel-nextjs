import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "src", "content");

// URL mapping: old WordPress path → new Next.js path
const LINK_MAP = {
  // Root-level services → /services/
  "/content-briefs/": "/services/content-briefs/",
  "/internal-linking/": "/services/internal-linking/",
  "/keyword-research/": "/services/keyword-research/",
  "/local-seo/": "/services/local-seo/",
  "/on-page-seo/": "/services/on-page-seo/",
  "/seo-berkshire/": "/services/seo-berkshire/",
  "/seo-bracknell/": "/services/seo-bracknell/",
  "/seo-consulting/": "/services/seo-consulting/",
  "/seo-maidenhead/": "/services/seo-maidenhead/",
  "/seo-slough/": "/services/seo-slough/",
  "/seo-wokingham/": "/services/seo-wokingham/",
  "/technical-seo-audit/": "/services/technical-seo-audit/",
  "/topical-maps/": "/services/topical-maps/",
  "/what-is-semantic-seo/": "/services/semantic-seo/",
  "/what-is-topical-authority/": "/services/topical-authority/",
  "/what-is-seo/": "/services/seo/",
  "/seo-reading/": "/services/seo-consultant-reading/",
  "/seo-cost/": "/services/how-much-does-seo-cost/",

  // Root-level blog posts → /blog/
  "/how-long-does-seo-take/": "/blog/how-long-does-seo-take/",
  "/intent-competition-data/": "/blog/intent-competition-data/",
  "/optimise-multiple-keywords/": "/blog/optimise-multiple-keywords/",
  "/seo-mistakes/": "/blog/seo-mistakes/",

  // Wrong prefix fixes
  "/services/contact/": "/contact/",
  "/services/services/": "/services/",
  "/services/what-is-semantic-seo/": "/services/semantic-seo/",
  "/services/what-is-topical-authority/": "/services/topical-authority/",
  "/blogs/": "/blog/",

  // Pages that don't exist — map to closest equivalent
  "/ai-consulting/": "/services/seo-consulting/",
  "/ai-seo-strategy/": "/services/semantic-seo/",
  "/seo-consulting-london/": "/services/seo-consulting/",

  // Pagination URLs → just the base page
  "/contact/page/2/": "/contact/",
  "/contact/page/3/": "/contact/",
  "/contact/page/8/": "/contact/",
  "/contact/page/22/": "/contact/",
};

function fixFile(filePath) {
  let content = readFileSync(filePath, "utf-8");
  let changes = 0;

  // 1. Apply URL mappings (sort by length descending to avoid partial matches)
  const sortedKeys = Object.keys(LINK_MAP).sort((a, b) => b.length - a.length);
  for (const oldPath of sortedKeys) {
    const newPath = LINK_MAP[oldPath];
    // Match the link in markdown context: ](oldPath)
    const pattern = `](${oldPath})`;
    const replacement = `](${newPath})`;
    if (content.includes(pattern)) {
      content = content.split(pattern).join(replacement);
      changes++;
    }
  }

  // 2. Remove entire lines that are just wp-content image links
  // Pattern: [![alt text](/wp-content/...)](link) or ![alt](/wp-content/...)
  const lines = content.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    // Remove standalone image references to wp-content
    if (/^!\[.*?\]\(\/wp-content\//.test(trimmed)) return false;
    // Remove standalone image-link blocks: [![...](/wp-content/...)]
    if (/^\[!\[.*?\]\(\/wp-content\//.test(trimmed)) return false;
    // Remove lines that are just ](/some-path/) (orphaned link destinations from removed images)
    if (/^\]\(\/[^)]+\)\s*$/.test(trimmed) && trimmed.length < 100) return false;
    return true;
  });

  if (filtered.length !== lines.length) {
    changes += lines.length - filtered.length;
    content = filtered.join("\n");
  }

  // 3. Remove tag link lines: [Tag Name](/tag/...)
  content = content.replace(/\[([^\]]*?)\]\(\/tag\/[^)]+\)/g, "");
  // Clean up any lines that became empty after tag removal
  content = content.replace(/\n{3,}/g, "\n\n");

  // 4. Remove category link lines: [Category](/category/...)
  content = content.replace(/\[([^\]]*?)\]\(\/category\/[^)]+\)/g, "");
  content = content.replace(/\n{3,}/g, "\n\n");

  // 5. Remove trailing slashes from internal links for consistency (optional)
  // Keep them for now as Next.js handles both

  content = content.trim();

  if (changes > 0 || content !== readFileSync(filePath, "utf-8")) {
    writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
}

function processDir(dir, label) {
  const entries = readdirSync(dir);
  let fixed = 0;

  for (const entry of entries) {
    const entryPath = join(dir, entry);
    if (!statSync(entryPath).isDirectory()) continue;

    const mdocPath = join(entryPath, "content.mdoc");
    try {
      if (fixFile(mdocPath)) {
        console.log(`  Fixed: ${entry}`);
        fixed++;
      }
    } catch {
      // skip
    }
  }
  return fixed;
}

console.log("Fixing internal links...\n");

console.log("Blog posts:");
const blogFixed = processDir(join(CONTENT_DIR, "blog"), "blog");
console.log(`  ${blogFixed} files updated\n`);

console.log("Services:");
const svcFixed = processDir(join(CONTENT_DIR, "services"), "service");
console.log(`  ${svcFixed} files updated\n`);

console.log("Portfolio:");
const portFixed = processDir(join(CONTENT_DIR, "portfolio"), "portfolio");
console.log(`  ${portFixed} files updated\n`);

console.log("Pages:");
const pageFixed = processDir(join(CONTENT_DIR, "pages"), "page");
console.log(`  ${pageFixed} files updated\n`);

// Verify: check for any remaining broken links
console.log("--- Remaining internal links ---");
const allDirs = [
  ...readdirSync(join(CONTENT_DIR, "blog")).map((d) => join(CONTENT_DIR, "blog", d)),
  ...readdirSync(join(CONTENT_DIR, "services")).map((d) => join(CONTENT_DIR, "services", d)),
  ...readdirSync(join(CONTENT_DIR, "portfolio")).map((d) => join(CONTENT_DIR, "portfolio", d)),
  ...readdirSync(join(CONTENT_DIR, "pages")).map((d) => join(CONTENT_DIR, "pages", d)),
];

const validPaths = new Set([
  "/", "/about/", "/contact/", "/blog/", "/blog", "/services/", "/services",
  "/portfolio/", "/terms-of-use/", "/privacy-policy/",
]);

// Add all blog slugs
for (const d of readdirSync(join(CONTENT_DIR, "blog"))) {
  validPaths.add(`/blog/${d}/`);
}
// Add all service slugs
for (const d of readdirSync(join(CONTENT_DIR, "services"))) {
  validPaths.add(`/services/${d}/`);
}
// Add all portfolio slugs
for (const d of readdirSync(join(CONTENT_DIR, "portfolio"))) {
  validPaths.add(`/portfolio/${d}/`);
}

const brokenLinks = new Map();

for (const dir of allDirs) {
  try {
    if (!statSync(dir).isDirectory()) continue;
    const mdocPath = join(dir, "content.mdoc");
    const content = readFileSync(mdocPath, "utf-8");
    const links = content.matchAll(/\]\((\/?[^)]+)\)/g);
    for (const match of links) {
      const href = match[1];
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) continue;
      if (href.startsWith("/wp-content/")) continue; // already handled images
      // Normalize: ensure trailing slash for comparison
      const normalized = href.endsWith("/") ? href : href + "/";
      if (!validPaths.has(normalized) && !validPaths.has(href)) {
        brokenLinks.set(href, (brokenLinks.get(href) || 0) + 1);
      }
    }
  } catch {
    // skip
  }
}

if (brokenLinks.size > 0) {
  console.log("Potentially broken links found:");
  for (const [link, count] of [...brokenLinks.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${link} (${count}x)`);
  }
} else {
  console.log("All internal links verified!");
}
