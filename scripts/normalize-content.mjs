#!/usr/bin/env node
/**
 * normalize-content.mjs
 *
 * Self-healing guard for the flat-file Keystatic content. The external
 * "CTR: rewrite titles" automation commits straight to `master` and has
 * twice broken production builds by:
 *   1. writing a top-level scalar (e.g. metaTitle) whose value contains an
 *      unquoted colon — a YAML parse error that fails `next build`; and
 *   2. leaving frontmatter keys that aren't in the Keystatic schema
 *      (e.g. comparisonTable, stepByStepGuide) — which also fail the build.
 *
 * This script makes that output harmless:
 *   - quotes top-level scalar values that would break the YAML parser, and
 *   - strips top-level keys that aren't allowed by the collection's schema.
 *
 * It runs automatically before every build (see package.json `build`) so
 * deploys self-heal, and in CI (--check / the content-guard workflow).
 *
 * Usage:
 *   node scripts/normalize-content.mjs           # fix in place
 *   node scripts/normalize-content.mjs --check    # exit 1 if changes needed
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// js-yaml is only used for an optional post-fix sanity check / long-title
// warning. The build-saving string fixes below do not need it, so we import
// it lazily and degrade gracefully if it isn't installed.
let yaml = null;
try {
  yaml = (await import("js-yaml")).default;
} catch {
  // optional
}

const CHECK = process.argv.includes("--check");
const ROOT = join(process.cwd(), "src", "content");

// Allowed top-level frontmatter keys per collection/singleton (mirrors
// keystatic.config.ts). `content` lives in a separate .mdoc file, so it is
// not a key in index.yaml.
const COLLECTIONS = {
  services: ["title", "metaTitle", "description", "ogImage", "h1", "subtitle", "icon", "featured", "sortOrder", "canonicalOverride"],
  blog: ["title", "metaTitle", "description", "ogImage", "date", "lastUpdated", "tags", "faqs"],
  "website-design": ["title", "metaTitle", "description", "ogImage", "h1", "subtitle", "sortOrder", "priceFrom", "nodeType", "parentNode"],
  portfolio: ["title", "metaTitle", "description", "ogImage", "tags", "featured", "client", "industry", "services", "year", "problem", "solution", "result", "metrics", "testimonialText", "testimonialAuthor", "testimonialRole"],
};
const SINGLETONS = {
  "pages/about": ["title", "description", "ogImage", "h1", "subtitle"],
  "pages/contact": ["title", "description", "ogImage", "h1", "subtitle"],
  "pages/services-index": ["title", "description", "ogImage", "h1", "subtitle"],
  "pages/portfolio-index": ["title", "description", "ogImage", "h1", "subtitle"],
  "pages/blog-index": ["title", "description", "ogImage", "h1", "subtitle"],
  "pages/terms": ["title", "description"],
  "pages/privacy": ["title", "description"],
  "site-settings": ["siteName", "siteUrl", "defaultTitle", "defaultDescription", "ogImage", "phone", "email", "location", "linkedin"],
};

/** Quote top-level plain scalars whose value would break the YAML parser. */
function quoteUnsafeScalars(text) {
  let fixed = 0;
  const out = text.split("\n").map((line) => {
    const m = line.match(/^([A-Za-z_][\w]*): (.+)$/); // top-level "key: value" only
    if (!m) return line;
    const [, key, rawVal] = m;
    const val = rawVal;
    const first = val[0];
    // Skip already-quoted, block (| >), flow ([ {) and other indicator starts.
    if ("'\"|>[{#&*!%@`".includes(first)) return line;
    // A plain scalar breaks YAML if it contains ": ", ends with ":", or has " #".
    if (val.includes(": ") || val.endsWith(":") || val.includes(" #")) {
      fixed++;
      return `${key}: '${val.replace(/'/g, "''")}'`;
    }
    return line;
  });
  return { text: out.join("\n"), fixed };
}

/** Remove top-level keys (and their value blocks) not in the allowed set. */
function stripDisallowedKeys(text, allowed) {
  const lines = text.split("\n");
  const out = [];
  const removed = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^([A-Za-z_][\w]*):/);
    if (m && !allowed.includes(m[1])) {
      removed.push(m[1]);
      i++;
      while (i < lines.length && !/^[A-Za-z_][\w]*:/.test(lines[i])) i++;
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return { text: out.join("\n"), removed };
}

function allowedFor(rel) {
  // rel like "services/foo/index.yaml" or "pages/about/index.yaml"
  const parts = rel.split("/");
  if (parts[0] in COLLECTIONS) return COLLECTIONS[parts[0]];
  const singletonKey = parts.slice(0, -1).join("/"); // drop index.yaml
  if (singletonKey in SINGLETONS) return SINGLETONS[singletonKey];
  return null; // unknown — don't strip keys we don't understand
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (name === "index.yaml") files.push(p);
  }
  return files;
}

let changed = 0;
let longTitles = 0;
const issues = [];

for (const file of walk(ROOT)) {
  const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");
  const original = readFileSync(file, "utf8");

  // 1) make it parseable
  let { text, fixed } = quoteUnsafeScalars(original);
  // 2) strip schema-violating keys
  const allowed = allowedFor(rel);
  let removed = [];
  if (allowed) ({ text, removed } = stripDisallowedKeys(text, allowed));

  // 3) sanity: it must now parse, and we warn (non-fatal) on long titles
  if (yaml) {
    try {
      const data = yaml.load(text);
      const mt = data?.metaTitle;
      if (typeof mt === "string" && mt.length > 62) {
        longTitles++;
        issues.push(`  ⚠ long metaTitle (${mt.length}): ${rel}`);
      }
    } catch (e) {
      issues.push(`  ✗ still unparseable: ${rel} — ${e.message.split("\n")[0]}`);
    }
  }

  if (text !== original) {
    changed++;
    if (fixed) issues.push(`  ✓ quoted ${fixed} unsafe scalar(s): ${rel}`);
    if (removed.length) issues.push(`  ✓ removed disallowed key(s) [${removed.join(", ")}]: ${rel}`);
    if (!CHECK) writeFileSync(file, text);
  }
}

if (issues.length) console.log(issues.join("\n"));
console.log(`\nnormalize-content: ${changed} file(s) ${CHECK ? "need fixing" : "fixed"}, ${longTitles} long title(s).`);

if (CHECK && (changed > 0 || issues.some((i) => i.includes("✗")))) {
  console.error("Content needs normalisation (run: node scripts/normalize-content.mjs).");
  process.exit(1);
}
