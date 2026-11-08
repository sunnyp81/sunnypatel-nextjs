import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import lastmod from "@/data/lastmod.json";

// Plain Markdown copy of each service page, served at <page>/index.md (llms.txt v2 convention).
// Built from the same content files as the HTML page, so the two cannot drift.

const SITE_URL = "https://sunnypatel.co.uk";
const SERVICES = join(process.cwd(), "src", "content", "services");

const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`${name}="((?:[^"\\\\]|\\\\.)*)"`))?.[1]?.replace(/\\"/g, '"') ?? "";

function yamlField(yaml: string, key: string): string {
  const lines = yaml.split(/\r?\n/);
  const i = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (i < 0) return "";
  const raw = lines[i].slice(key.length + 1).trim();
  if (raw === ">-" || raw === "|" || raw === ">") {
    const out: string[] = [];
    for (const l of lines.slice(i + 1)) {
      if (!/^\s+/.test(l)) break;
      out.push(l.trim());
    }
    return out.join(" ");
  }
  const q = raw.match(/^'((?:[^']|'')*)'$/) ?? raw.match(/^"([^"]*)"$/);
  return q ? q[1].replace(/''/g, "'") : raw;
}

const absolute = (href: string) =>
  href === "#enquire" || href.startsWith("#enquire")
    ? `${SITE_URL}/contact/`
    : href.startsWith("/")
      ? `${SITE_URL}${href}`
      : href;

export function serviceMarkdown(slug: string): string | null {
  const dir = join(SERVICES, slug);
  if (!existsSync(join(dir, "content.mdoc"))) return null;
  const yaml = readFileSync(join(dir, "index.yaml"), "utf8");
  const body = readFileSync(join(dir, "content.mdoc"), "utf8");
  const url = `${SITE_URL}/services/${slug}/`;
  const h1 = yamlField(yaml, "h1") || yamlField(yaml, "title");
  const subtitle = yamlField(yaml, "subtitle");
  const updated = (lastmod as { services: Record<string, string> }).services[slug];

  const converted = body
    .replace(/\{%\s*cta\b[^%]*\/%\}/g, (t) => {
      const heading = attr(t, "heading");
      const text = attr(t, "text");
      return `> **${heading}** ${text} [Request a free 20-minute SEO diagnosis](${SITE_URL}/contact/)`;
    })
    .replace(/\{%\s*call-to-action\b[^%]*\/%\}/g, (t) => {
      const title = attr(t, "title");
      const desc = attr(t, "description");
      const href = absolute(attr(t, "href") || "/contact/");
      const label = attr(t, "label") || "Get in touch";
      return `> **${title}** ${desc} [${label}](${href.endsWith("/") ? href : `${href}/`})`;
    })
    .replace(/\{%\s*step\b[^%]*\/%\}/g, (t) => `1. **${attr(t, "title")}**: ${attr(t, "detail")}`)
    .replace(/\{%\s*\/?[\w-]+[^%]*%\}/g, "")
    .replace(/\]\(([^)\s]+)\)/g, (_m, href: string) => `](${absolute(href)})`)
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return [
    `# ${h1}`,
    "",
    subtitle ? `> ${subtitle}\n` : "",
    `Source: ${url}`,
    `Published by Sunny Patel, independent SEO consultant, Reading, Berkshire.${updated ? ` Last updated ${updated}.` : ""}`,
    "",
    converted,
    "",
    "---",
    "",
    `Contact: ${SITE_URL}/contact/ | Hello@SunnyPatel.co.uk | 07305 523333`,
    "",
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}
