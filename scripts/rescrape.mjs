import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const BASE = "https://sunnypatel.co.uk";
const CONTENT_DIR = join(process.cwd(), "src", "content");
const td = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

// Remove images, scripts, styles, nav, footer, forms, iframes
td.remove(["script", "style", "nav", "footer", "form", "iframe", "noscript"]);

// Pages to scrape: [url, contentDir, type]
const pages = [];

// Blog posts
const blogSlugs = [
  "b2b-content-marketing-services", "chatgpt-ads", "generative-engine-optimisation-2",
  "google-algorithm-update-recovery", "how-long-does-seo-take", "how-many-keywords",
  "how-to-be-an-seo", "how-to-build-topical-authority", "how-to-choose-seo-consultant",
  "increase-organic-traffic", "intent-competition-data", "local-seo-berkshire-guide",
  "optimise-content-for-ai-search", "optimise-multiple-keywords", "seo-mistakes",
  "technical-seo-vs-on-page-seo", "topical-authority-vs-domain-authority",
  "what-is-a-content-brief", "what-is-eeat-seo", "what-is-entity-seo",
  "what-is-llm-optimisation", "wordpress-vs-webflow",
];
for (const slug of blogSlugs) {
  pages.push({ url: `${BASE}/blog/${slug}/`, dir: join(CONTENT_DIR, "blog", slug), type: "blog" });
}

// Services
const serviceSlugs = [
  "content-briefs", "how-much-does-seo-cost", "internal-linking", "keyword-research",
  "legal-seo-magic-circle-firms-2", "local-seo", "mayfair-luxury-brand-seo",
  "on-page-seo", "semantic-seo", "seo", "seo-berkshire", "seo-bracknell",
  "seo-consultant-reading", "seo-consulting", "seo-maidenhead", "seo-slough",
  "seo-strategy-consulting-expert-guidance-for-in-house-teams", "seo-wokingham",
  "technical-seo-audit", "topical-authority", "topical-maps",
];
for (const slug of serviceSlugs) {
  pages.push({ url: `${BASE}/services/${slug}/`, dir: join(CONTENT_DIR, "services", slug), type: "service" });
}

// Portfolio
pages.push({
  url: `${BASE}/portfolio/aatma-aesthetics-website-design-development-seo/`,
  dir: join(CONTENT_DIR, "portfolio", "aatma-aesthetics-website-design-development-seo"),
  type: "portfolio",
});

// Singleton pages
const singletonPages = [
  { url: `${BASE}/about/`, dir: join(CONTENT_DIR, "pages", "about"), type: "singleton" },
  { url: `${BASE}/contact/`, dir: join(CONTENT_DIR, "pages", "contact"), type: "singleton" },
  { url: `${BASE}/terms-of-use/`, dir: join(CONTENT_DIR, "pages", "terms"), type: "singleton" },
  { url: `${BASE}/privacy-policy/`, dir: join(CONTENT_DIR, "pages", "privacy"), type: "singleton" },
];
pages.push(...singletonPages);

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return await res.text();
}

function extractContent(html) {
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $("nav, footer, header, .breadcrumb, .breadcrumbs, .wp-block-buttons, .sharedaddy, .related-posts, .comments, .comment-form, #comments, .post-navigation, .site-header, .site-footer, .sidebar, aside, .elementor-widget-theme-post-navigation, .elementor-widget-read-more, [class*='cta'], [class*='newsletter'], .wp-block-spacer").remove();

  // Try multiple content selectors (WordPress themes vary)
  const selectors = [
    "article .entry-content",
    ".entry-content",
    "article .post-content",
    ".post-content",
    ".elementor-widget-theme-post-content .elementor-widget-container",
    "article .elementor-section-wrap",
    ".page-content",
    "main article",
    "article",
    "main .content",
    "main",
  ];

  let contentHtml = "";
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 100) {
      contentHtml = el.html();
      break;
    }
  }

  if (!contentHtml) {
    console.warn("  Could not find content area, using body");
    contentHtml = $("body").html() || "";
  }

  // Convert to markdown
  let md = td.turndown(contentHtml);

  // Clean up excessive whitespace
  md = md.replace(/\n{4,}/g, "\n\n\n").trim();

  return md;
}

// Process in batches to avoid overwhelming the server
async function processBatch(batch) {
  const results = [];
  for (const page of batch) {
    try {
      const html = await fetchPage(page.url);
      const markdown = extractContent(html);
      const wordCount = markdown.split(/\s+/).length;

      // Write content.mdoc
      if (!existsSync(page.dir)) {
        mkdirSync(page.dir, { recursive: true });
      }
      writeFileSync(join(page.dir, "content.mdoc"), markdown, "utf-8");

      console.log(`OK  ${page.url} (${wordCount} words)`);
      results.push({ url: page.url, words: wordCount, ok: true });
    } catch (err) {
      console.error(`ERR ${page.url}: ${err.message}`);
      results.push({ url: page.url, ok: false, error: err.message });
    }
    // Small delay between requests
    await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}

console.log(`Re-scraping ${pages.length} pages from ${BASE}...\n`);

const results = await processBatch(pages);

const ok = results.filter((r) => r.ok);
const failed = results.filter((r) => !r.ok);
const totalWords = ok.reduce((sum, r) => sum + r.words, 0);

console.log(`\n--- DONE ---`);
console.log(`Success: ${ok.length}/${results.length}`);
console.log(`Total words: ${totalWords.toLocaleString()}`);
if (failed.length) {
  console.log(`Failed:`);
  failed.forEach((f) => console.log(`  ${f.url}: ${f.error}`));
}
