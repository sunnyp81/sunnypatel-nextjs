import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BOOK } from "@/data/book-sources";
import { personSchema } from "@/lib/schema";

// EntityMap v1.0 (https://entitymap.org/spec/v1.0), built at deploy time.
// Every evidence chunk is the opening text of the page it cites, read from the
// content files, so the map cannot drift from what the pages say.

const SITE_URL = "https://sunnypatel.co.uk";
export const PUBLISHER = "Sunny Patel SEO & AI Consultant";
const CONTENT = join(process.cwd(), "src", "content");

type Relation = { predicate: string; targetName: string; targetId: string; context?: string };
type Chunk = {
  chunkId: string;
  text: string;
  sourceUrl: string;
  pageTitle: string;
  publisher: string;
};
export type EntityMapEntity = {
  entityId: string;
  "@type": string;
  name: string;
  description: string;
  sameAs?: string[];
  relations?: Relation[];
  hasChunks: Chunk[];
};

type Source = { kind: "services" | "blog"; slug: string };

const stripMarkdown = (s: string) =>
  s
    .replace(/\{%[^%]*%\}/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function pageTitle(dir: string): string {
  const yaml = readFileSync(join(dir, "index.yaml"), "utf8");
  const m = yaml.match(/^metaTitle:\s*(?:'((?:[^']|'')*)'|"([^"]*)"|(.+))$/m) ?? yaml.match(/^title:\s*(?:'((?:[^']|'')*)'|"([^"]*)"|(.+))$/m);
  if (!m) throw new Error(`entitymap: no title in ${dir}`);
  return (m[1] ?? m[2] ?? m[3]).replace(/''/g, "'").trim();
}

function openingText(dir: string): string {
  const body = readFileSync(join(dir, "content.mdoc"), "utf8");
  const block = body
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|-|\*|\||!|\[|\{%|\d+\.)/.test(b));
  if (!block) throw new Error(`entitymap: no opening paragraph in ${dir}`);
  const sentences = stripMarkdown(block).split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  for (const s of sentences) {
    if (out.length === 3 || (out.join(" ") + " " + s).trim().length > 600) break;
    out.push(s);
  }
  if (!out.length) throw new Error(`entitymap: opening paragraph too long in ${dir}`);
  return out.join(" ");
}

function pageChunk(id: string, src: Source, path: string, publisher: string): Chunk {
  const dir = join(CONTENT, src.kind, src.slug);
  return {
    chunkId: id,
    text: openingText(dir),
    sourceUrl: `${SITE_URL}${path}`,
    pageTitle: pageTitle(dir),
    publisher,
  };
}

type TopicSpec = {
  id: string;
  name: string;
  description: string;
  src: Source;
  path: string;
  offered: boolean;
  sameAs?: string[];
};

const TOPICS: TopicSpec[] = [
  { id: "e_010", name: "Semantic SEO", description: "SEO methodology that builds topical authority through entity relationships, topic coverage and contextual relevance.", src: { kind: "services", slug: "semantic-seo" }, path: "/services/semantic-seo/", offered: true },
  { id: "e_011", name: "Entity SEO", description: "Building entity identity and knowledge graph presence so search engines understand who a business is, not only what it publishes.", src: { kind: "blog", slug: "what-is-entity-seo" }, path: "/blog/what-is-entity-seo/", offered: false },
  { id: "e_012", name: "Topical Authority", description: "Establishing a website as a dependable source on a subject through comprehensive, interconnected content coverage.", src: { kind: "services", slug: "topical-authority" }, path: "/services/topical-authority/", offered: true },
  { id: "e_013", name: "AI Search Optimisation", description: "Improving search access, answer coverage and verifiable information so search-enabled AI assistants can find and interpret a site's pages.", src: { kind: "services", slug: "ai-search-optimisation" }, path: "/services/ai-search-optimisation/", offered: true },
  { id: "e_014", name: "Technical SEO", description: "Optimising website infrastructure for crawlability, indexation, speed, Core Web Vitals and structured data.", src: { kind: "services", slug: "technical-seo-audit" }, path: "/services/technical-seo-audit/", offered: true },
  { id: "e_015", name: "Local SEO", description: "Optimising for location-based results including Google Maps, the local pack and Google Business Profile.", src: { kind: "services", slug: "local-seo" }, path: "/services/local-seo/", offered: true, sameAs: ["https://en.wikipedia.org/wiki/Local_search_(Internet)"] },
  { id: "e_016", name: "Content Strategy", description: "Planning content around search intent, topical maps, semantic coverage gaps and business objectives.", src: { kind: "services", slug: "content-briefs" }, path: "/services/content-briefs/", offered: true },
  { id: "e_017", name: "E-E-A-T", description: "Google's Experience, Expertise, Authoritativeness and Trustworthiness framework for judging content and creator credibility.", src: { kind: "blog", slug: "what-is-eeat-seo" }, path: "/blog/what-is-eeat-seo/", offered: false },
  { id: "e_018", name: "Keyword Research", description: "Analysis of search terms to find opportunities by volume, intent, competition and semantic relationships.", src: { kind: "services", slug: "keyword-research" }, path: "/services/keyword-research/", offered: true, sameAs: ["https://en.wikipedia.org/wiki/Keyword_research"] },
  { id: "e_019", name: "Internal Linking", description: "Linking between pages to distribute authority, define topic clusters and guide crawlers.", src: { kind: "services", slug: "internal-linking" }, path: "/services/internal-linking/", offered: true },
  { id: "e_020", name: "On-Page SEO", description: "Optimising page elements including meta tags, headings, content structure and semantic HTML.", src: { kind: "services", slug: "on-page-seo" }, path: "/services/on-page-seo/", offered: true },
  { id: "e_021", name: "LLM Optimisation", description: "Optimising content so large language models can retrieve, cite and recommend it in AI search experiences.", src: { kind: "blog", slug: "what-is-llm-optimisation" }, path: "/blog/what-is-llm-optimisation/", offered: false },
];

const PERSON_ID = "e_001";
const BOOK_ID = "e_002";
const idOf = (name: string) => TOPICS.find((t) => t.name === name)!.id;

// Hand-written chunks must appear verbatim in the page they cite; the build fails if they do not.
function verbatimChunk(id: string, text: string, sourceUrl: string, title: string, file: string): Chunk {
  const haystack = stripMarkdown(readFileSync(file, "utf8"));
  if (!haystack.includes(text)) throw new Error(`entitymap: chunk ${id} not found verbatim in ${file}`);
  return { chunkId: id, text, sourceUrl, pageTitle: title, publisher: PUBLISHER };
}

const RELATED: [string, string, string][] = [
  ["Semantic SEO", "Entity SEO", "Entity relationships are the basis of the semantic SEO approach."],
  ["Semantic SEO", "Topical Authority", "Semantic SEO is the method used to build topical authority."],
  ["Internal Linking", "Topical Authority", "Internal links define topic clusters and signal hierarchy."],
  ["AI Search Optimisation", "LLM Optimisation", "LLM optimisation is the retrieval and citation side of AI search work."],
  ["Technical SEO", "On-Page SEO", "Both cover how a page is built and understood by crawlers."],
];

export function buildEntityMap() {
  const personChunk = verbatimChunk(
    "c_001",
    "I help businesses grow organic traffic through semantic SEO, topical authority, and AI-powered search strategies. Based in Berkshire, I combine 15+ years of SEO expertise with advanced AI tools to deliver measurable, sustainable results.",
    `${SITE_URL}/about/`,
    pageTitle(join(CONTENT, "pages", "about")),
    join(CONTENT, "pages", "about", "content.mdoc")
  );

  const person: EntityMapEntity = {
    entityId: PERSON_ID,
    "@type": "Person",
    name: "Sunny Patel",
    description: "SEO consultant and AI strategist based in Reading, Berkshire, specialising in semantic SEO, topical authority and AI search optimisation for UK businesses.",
    sameAs: (personSchema().sameAs as string[]) ?? [],
    relations: [
      ...TOPICS.filter((t) => t.offered).map((t) => ({ predicate: "OFFERS", targetName: t.name, targetId: t.id, context: `Service page: ${SITE_URL}${t.path}` })),
      ...TOPICS.filter((t) => !t.offered).map((t) => ({ predicate: "COVERS", targetName: t.name, targetId: t.id, context: `Guide: ${SITE_URL}${t.path}` })),
    ],
    hasChunks: [personChunk],
  };

  const book: EntityMapEntity = {
    entityId: BOOK_ID,
    "@type": "schema:Book",
    name: BOOK.title,
    description: `${BOOK.subtitle}. Kindle edition by ${BOOK.author}.`,
    sameAs: ["https://www.amazon.co.uk/dp/B0HMPBBK3B"],
    relations: [
      { predicate: "AUTHORED_BY", targetName: "Sunny Patel", targetId: PERSON_ID },
      { predicate: "COVERS", targetName: "AI Search Optimisation", targetId: idOf("AI Search Optimisation"), context: "The subtitle covers websites, SEO and AI search." },
    ],
    hasChunks: [
      {
        chunkId: "c_002",
        text: `Every source cited in ${BOOK.title} by ${BOOK.author}, grouped by part and chapter, with each link checked and kept up to date.`,
        sourceUrl: `${SITE_URL}/book/sources/`,
        pageTitle: `Sources and links: ${BOOK.title}`,
        publisher: PUBLISHER,
      },
    ],
  };

  const topics: EntityMapEntity[] = TOPICS.map((t, i) => ({
    entityId: t.id,
    "@type": "Concept",
    name: t.name,
    description: t.description,
    ...(t.sameAs ? { sameAs: t.sameAs } : {}),
    relations: [
      { predicate: "DESCRIBED_BY", targetName: "Sunny Patel", targetId: PERSON_ID, context: `${SITE_URL}${t.path}` },
      ...RELATED.filter(([a]) => a === t.name).map(([, b, ctx]) => ({ predicate: "RELATES_TO", targetName: b, targetId: idOf(b), context: ctx })),
    ],
    hasChunks: [pageChunk(`c_${String(100 + i)}`, t.src, t.path, PUBLISHER)],
  }));

  return {
    version: "1.0",
    schema: "https://entitymap.org/spec/v1.0",
    publisher: { name: PUBLISHER, url: SITE_URL },
    generated: new Date().toISOString(),
    entities: [person, book, ...topics],
  };
}

export type EntityMap = ReturnType<typeof buildEntityMap>;
