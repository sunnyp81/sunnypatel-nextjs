import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

const CONTENT_DIR = join(process.cwd(), "src", "content");
const BASE = "https://sunnypatel.co.uk";

const td = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});
td.remove(["script", "style", "nav", "footer", "form", "iframe", "noscript"]);

// --- Re-scrape chatgpt-ads with better extraction ---
async function fixChatgptAds() {
  console.log("Fixing chatgpt-ads...");
  const url = `${BASE}/blog/chatgpt-ads/`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Aggressively remove non-content
  $("nav, footer, header, aside, .sidebar, script, style, noscript, iframe, form, svg, img, figure, .breadcrumb, .breadcrumbs, .sharedaddy, .related-posts, .comments, #comments, .post-navigation, .site-header, .site-footer, .wp-block-spacer, .wp-block-buttons, [class*='cta'], [class*='newsletter'], [class*='share'], [class*='social'], canvas, video, audio, object, embed").remove();

  // Try to get just the text content area
  const selectors = [
    "article .entry-content",
    ".entry-content",
    ".post-content",
    "article",
    "main",
  ];

  let contentHtml = "";
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 200) {
      contentHtml = el.html();
      break;
    }
  }

  if (!contentHtml) {
    contentHtml = $("body").html() || "";
  }

  let md = td.turndown(contentHtml);
  md = cleanMarkdown(md);

  const dir = join(CONTENT_DIR, "blog", "chatgpt-ads");
  writeFileSync(join(dir, "content.mdoc"), md, "utf-8");
  console.log(`  Fixed: ${md.split(/\s+/).length} words`);
}

function cleanMarkdown(md) {
  let lines = md.split("\n");

  // Remove breadcrumb lines at top (Home, Blog, Category links)
  let startIndex = 0;
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();
    if (
      line === "" ||
      line === "[Home](/)" ||
      line === "[Blog](/blog)" ||
      /^\[.*?\]\(.*?\)$/.test(line) && line.length < 80 ||
      /^(Home|Blog)$/i.test(line) ||
      /^\[?\]?\(https?:\/\/.*?\)$/.test(line)
    ) {
      startIndex = i + 1;
      continue;
    }
    break;
  }
  lines = lines.slice(startIndex);

  // Remove author/date/reading time lines right after H1
  let h1Index = -1;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].startsWith("# ")) {
      h1Index = i;
      break;
    }
  }

  if (h1Index >= 0) {
    // Remove the H1 line (it's already in index.yaml)
    lines.splice(h1Index, 1);

    // Remove metadata lines after where H1 was (author, date, reading time)
    let removeCount = 0;
    for (let i = h1Index; i < Math.min(h1Index + 10, lines.length); i++) {
      const line = lines[i].trim();
      if (
        line === "" ||
        /^Sunny Patel$/i.test(line) ||
        /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d/i.test(line) ||
        /^Reading time/i.test(line) ||
        /^\d+ min(s)? read$/i.test(line) ||
        /^By\s/i.test(line) ||
        /^\d{1,2}\s+(January|February)/i.test(line)
      ) {
        removeCount++;
        continue;
      }
      break;
    }
    lines.splice(h1Index, removeCount);
  }

  // Remove image lines with WordPress URLs (we'll handle images separately)
  lines = lines.filter((line) => {
    const trimmed = line.trim();
    // Remove standalone image lines pointing to wp-content
    if (/^!\[.*?\]\(https:\/\/sunnypatel\.co\.uk\/wp-content\//.test(trimmed)) {
      return false;
    }
    return true;
  });

  // Update internal links from sunnypatel.co.uk to relative
  let content = lines.join("\n");
  content = content.replace(/https:\/\/sunnypatel\.co\.uk\//g, "/");

  // Clean up excessive whitespace
  content = content.replace(/\n{4,}/g, "\n\n\n").trim();

  // Remove any remaining binary-looking content (lines with lots of non-ASCII)
  const cleanLines = content.split("\n").filter((line) => {
    const nonAscii = (line.match(/[^\x20-\x7E\n\r\t]/g) || []).length;
    return nonAscii < line.length * 0.3 || line.length < 10;
  });
  content = cleanLines.join("\n");

  return content.trim();
}

// --- Clean all content.mdoc files ---
function processDirectory(dir, type) {
  const entries = readdirSync(dir);
  let processed = 0;

  for (const entry of entries) {
    const entryPath = join(dir, entry);
    const stat = statSync(entryPath);
    if (!stat.isDirectory()) continue;

    const mdocPath = join(entryPath, "content.mdoc");
    try {
      const content = readFileSync(mdocPath, "utf-8");

      // Skip binary content (chatgpt-ads will be fixed separately)
      if (content.includes("\x00") || content.includes("PNG")) {
        console.log(`  SKIP (binary): ${entry}`);
        continue;
      }

      const cleaned = cleanMarkdown(content);
      writeFileSync(mdocPath, cleaned, "utf-8");

      const beforeWords = content.split(/\s+/).length;
      const afterWords = cleaned.split(/\s+/).length;
      const diff = beforeWords - afterWords;
      if (diff > 5) {
        console.log(`  ${entry}: ${beforeWords} → ${afterWords} words (-${diff} metadata)`);
      }
      processed++;
    } catch {
      // No content.mdoc, skip
    }
  }
  return processed;
}

// Fix chatgpt-ads first
await fixChatgptAds();

console.log("\nCleaning blog posts...");
processDirectory(join(CONTENT_DIR, "blog"), "blog");

console.log("\nCleaning services...");
processDirectory(join(CONTENT_DIR, "services"), "service");

console.log("\nCleaning portfolio...");
processDirectory(join(CONTENT_DIR, "portfolio"), "portfolio");

console.log("\nCleaning pages...");
processDirectory(join(CONTENT_DIR, "pages"), "page");

console.log("\nDone!");
