import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BOOK } from "@/data/book-sources";
import { personSchema } from "@/lib/schema";

// EntityMap v1.0 (https://entitymap.org/spec/v1.0), built at deploy time.
// Every evidence chunk is text from the page it cites, read from the content
// files, so the map cannot drift from what the pages say.

const SITE_URL = "https://sunnypatel.co.uk";
export const PUBLISHER = "Sunny Patel";
const CONTENT = join(process.cwd(), "src", "content");

type Relation = {
  predicate: string;
  targetName: string;
  targetId?: string;
  targetUri?: string;
  targetDescription?: string;
  confidence?: "declared" | "inferred";
};
type Chunk = {
  chunkId: string;
  text: string;
  sourceUrl: string;
  pageTitle: string;
  publisher: string;
  retrieved: string;
  contentType?: "definition" | "evidence" | "example" | "statistic" | "procedure";
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

// First prose paragraph, capped at 3 sentences and 600 characters (spec limit).
// A bold lead-in ("**In short:** ...") counts as prose; list items do not.
function openingText(dir: string): string {
  const body = readFileSync(join(dir, "content.mdoc"), "utf8");
  const block = body
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|- |\* |\||!|\[|\{%|\d+\.|---)/.test(b));
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

let RETRIEVED = "";

function pageChunk(id: string, src: Source, path: string, contentType?: Chunk["contentType"]): Chunk {
  const dir = join(CONTENT, src.kind, src.slug);
  return {
    chunkId: id,
    text: openingText(dir),
    sourceUrl: `${SITE_URL}${path}`,
    pageTitle: pageTitle(dir),
    publisher: PUBLISHER,
    retrieved: RETRIEVED,
    ...(contentType ? { contentType } : {}),
  };
}

// Hand-picked chunks must appear verbatim in the page they cite; the build fails if they do not.
function verbatimChunk(id: string, text: string, sourceUrl: string, title: string, file: string, contentType?: Chunk["contentType"]): Chunk {
  const haystack = stripMarkdown(readFileSync(file, "utf8"));
  if (!haystack.includes(text)) throw new Error(`entitymap: chunk ${id} not found verbatim in ${file}`);
  if (text.length > 600) throw new Error(`entitymap: chunk ${id} over 600 characters`);
  return { chunkId: id, text, sourceUrl, pageTitle: title, publisher: PUBLISHER, retrieved: RETRIEVED, ...(contentType ? { contentType } : {}) };
}

/* ── Knowledge: concepts Sunny writes about and works in ─────────────── */

type TopicSpec = { id: string; name: string; description: string; src: Source; path: string; sameAs?: string[] };

const TOPICS: TopicSpec[] = [
  { id: "e_010", name: "Semantic SEO", description: "SEO methodology that builds topical authority through entity relationships, topic coverage and contextual relevance.", src: { kind: "services", slug: "semantic-seo" }, path: "/services/semantic-seo/" },
  { id: "e_011", name: "Entity SEO", description: "Building entity identity and knowledge graph presence so search engines understand who a business is, not only what it publishes.", src: { kind: "blog", slug: "what-is-entity-seo" }, path: "/blog/what-is-entity-seo/" },
  { id: "e_012", name: "Topical Authority", description: "Establishing a website as a dependable source on a subject through comprehensive, interconnected content coverage.", src: { kind: "services", slug: "topical-authority" }, path: "/services/topical-authority/" },
  { id: "e_013", name: "AI Search Optimisation", description: "Improving search access, answer coverage and verifiable information so search-enabled AI assistants can find and interpret a site's pages.", src: { kind: "services", slug: "ai-search-optimisation" }, path: "/services/ai-search-optimisation/" },
  { id: "e_014", name: "Technical SEO", description: "Optimising website infrastructure for crawlability, indexation, speed, Core Web Vitals and structured data.", src: { kind: "services", slug: "technical-seo-services" }, path: "/services/technical-seo-services/" },
  { id: "e_015", name: "Local SEO", description: "Optimising for location-based results including Google Maps, the local pack and Google Business Profile.", src: { kind: "services", slug: "local-seo" }, path: "/services/local-seo/", sameAs: ["https://en.wikipedia.org/wiki/Local_search_(Internet)"] },
  { id: "e_016", name: "Content Strategy", description: "Planning content around search intent, topical maps, semantic coverage gaps and business objectives.", src: { kind: "services", slug: "topical-maps" }, path: "/services/topical-maps/", sameAs: ["https://en.wikipedia.org/wiki/Content_strategy"] },
  { id: "e_017", name: "E-E-A-T", description: "Google's Experience, Expertise, Authoritativeness and Trustworthiness framework for judging content and creator credibility.", src: { kind: "blog", slug: "what-is-eeat-seo" }, path: "/blog/what-is-eeat-seo/" },
  { id: "e_018", name: "Keyword Research", description: "Analysis of search terms to find opportunities by volume, intent, competition and semantic relationships.", src: { kind: "services", slug: "keyword-research" }, path: "/services/keyword-research/", sameAs: ["https://en.wikipedia.org/wiki/Keyword_research"] },
  { id: "e_019", name: "Internal Linking", description: "Linking between pages to distribute authority, define topic clusters and guide crawlers.", src: { kind: "services", slug: "internal-linking" }, path: "/services/internal-linking/" },
  { id: "e_020", name: "On-Page SEO", description: "Optimising page elements including meta tags, headings, content structure and semantic HTML.", src: { kind: "services", slug: "on-page-seo" }, path: "/services/on-page-seo/" },
  { id: "e_021", name: "LLM Optimisation", description: "Optimising content so large language models can retrieve, cite and recommend it in AI search experiences.", src: { kind: "blog", slug: "what-is-llm-optimisation" }, path: "/blog/what-is-llm-optimisation/" },
];

// [source, predicate, target]. Most specific predicate that holds; RELATES_TO only as a last resort.
const RELATED: [string, string, string][] = [
  ["Entity SEO", "PART_OF", "Semantic SEO"],
  ["Semantic SEO", "ENABLES", "Topical Authority"],
  ["Internal Linking", "ENABLES", "Topical Authority"],
  ["LLM Optimisation", "PART_OF", "AI Search Optimisation"],
  ["Technical SEO", "RELATES_TO", "On-Page SEO"],
];

/* ── Services Sunny sells ─────────────────────────────────────────────── */

type ServiceSpec = { id: string; name: string; description: string; slug: string; topics: string[]; places?: string[] };

const SERVICES: ServiceSpec[] = [
  { id: "e_030", name: "Technical SEO Audit", description: "Fixed-fee audit of a website's technical SEO, content and AI visibility, delivered with a prioritised action list and a walkthrough call.", slug: "technical-seo-audit", topics: ["Technical SEO", "On-Page SEO", "AI Search Optimisation"] },
  { id: "e_031", name: "SEO Consulting", description: "Independent SEO advice and strategy for business owners and in-house teams, delivered directly by Sunny Patel.", slug: "seo-consulting", topics: ["Semantic SEO", "Topical Authority", "Content Strategy"] },
  { id: "e_032", name: "SEO Retainer", description: "Ongoing monthly SEO support with agreed priorities, implementation and reporting.", slug: "seo-retainer", topics: ["Technical SEO", "Content Strategy", "Internal Linking"] },
  { id: "e_033", name: "SEO Training", description: "Live SEO training for in-house teams, run on the team's own website and data.", slug: "seo-training", topics: ["Keyword Research", "On-Page SEO", "Technical SEO"] },
  {
    id: "e_034",
    name: "Local SEO for Berkshire businesses",
    description: "Local SEO for businesses in Reading and the towns of Berkshire: Google Business Profile, map results and town service pages.",
    slug: "seo-berkshire",
    topics: ["Local SEO"],
    places: ["Reading", "Newbury", "Thatcham", "Hungerford", "Slough", "Windsor", "Bracknell", "Wokingham", "Maidenhead"],
  },
];

/* ── Places Sunny serves (Wikidata IDs checked 8 Nov 2026) ────────────── */

type PlaceSpec = { id: string; name: string; description: string; wikidata: string; wikipedia: string; page: string; slug: string; verbatim?: string; partOfBerkshire: boolean };

const PLACES: PlaceSpec[] = [
  { id: "e_050", name: "Berkshire", description: "County in South East England where Sunny Patel is based and meets clients in person.", wikidata: "Q23220", wikipedia: "Berkshire", page: "/services/seo-berkshire/", slug: "seo-berkshire", partOfBerkshire: false },
  { id: "e_051", name: "Reading", description: "Largest town in Berkshire and Sunny Patel's home base.", wikidata: "Q161491", wikipedia: "Reading,_Berkshire", page: "/services/seo-consultant-reading/", slug: "seo-consultant-reading", verbatim: "I'm Sunny Patel, a Reading-based independent SEO consultant specialising in semantic SEO, topical authority, and AI search optimisation.", partOfBerkshire: true },
  { id: "e_052", name: "Newbury", description: "Main town of West Berkshire, served from Reading.", wikidata: "Q655874", wikipedia: "Newbury,_Berkshire", page: "/services/seo-newbury/", slug: "seo-newbury", partOfBerkshire: true },
  { id: "e_053", name: "Thatcham", description: "Town in West Berkshire, east of Newbury, covered by the Newbury page.", wikidata: "Q1026304", wikipedia: "Thatcham", page: "/services/seo-newbury/", slug: "seo-newbury", verbatim: "I help businesses in Newbury, Thatcham and Hungerford get found on Google, in map results and in AI answers.", partOfBerkshire: true },
  { id: "e_054", name: "Hungerford", description: "Market town in West Berkshire, west of Newbury, covered by the Newbury page.", wikidata: "Q1637841", wikipedia: "Hungerford", page: "/services/seo-newbury/", slug: "seo-newbury", verbatim: "I help businesses in Newbury, Thatcham and Hungerford get found on Google, in map results and in AI answers.", partOfBerkshire: true },
  { id: "e_055", name: "Slough", description: "Town in east Berkshire, served from Reading.", wikidata: "Q211907", wikipedia: "Slough", page: "/services/seo-slough/", slug: "seo-slough", partOfBerkshire: true },
  { id: "e_056", name: "Windsor", description: "Town in east Berkshire, served from Reading.", wikidata: "Q464955", wikipedia: "Windsor,_Berkshire", page: "/services/seo-windsor/", slug: "seo-windsor", partOfBerkshire: true },
  { id: "e_057", name: "Bracknell", description: "Town in central Berkshire, served from Reading.", wikidata: "Q783210", wikipedia: "Bracknell", page: "/services/seo-bracknell/", slug: "seo-bracknell", partOfBerkshire: true },
  { id: "e_058", name: "Wokingham", description: "Market town next to Reading in Berkshire.", wikidata: "Q1000679", wikipedia: "Wokingham", page: "/services/seo-wokingham/", slug: "seo-wokingham", partOfBerkshire: true },
  { id: "e_059", name: "Maidenhead", description: "Town in east Berkshire on the River Thames, served from Reading.", wikidata: "Q238803", wikipedia: "Maidenhead", page: "/services/seo-maidenhead/", slug: "seo-maidenhead", partOfBerkshire: true },
];

const PERSON_ID = "e_001";
const BOOK_ID = "e_002";
const topicId = (name: string) => TOPICS.find((t) => t.name === name)!.id;
const placeId = (name: string) => PLACES.find((p) => p.name === name)!.id;
const pageUrl = (path: string) => `${SITE_URL}${path}`;

export function buildEntityMap() {
  const generated = new Date().toISOString();
  RETRIEVED = generated;
  const servicesDir = (slug: string) => join(CONTENT, "services", slug);

  const person: EntityMapEntity = {
    entityId: PERSON_ID,
    "@type": "Person",
    name: "Sunny Patel",
    description: "Independent SEO and AI visibility consultant based in Reading, Berkshire, working directly with UK businesses on semantic SEO, technical SEO and AI search.",
    sameAs: (personSchema().sameAs as string[]) ?? [],
    // A Person cannot OFFERS (validator rule); each Service points back with PRODUCED_BY instead.
    hasChunks: [
      verbatimChunk(
        "c_001",
        "I help businesses grow organic traffic through semantic SEO, topical authority, and AI-powered search strategies. Based in Berkshire, I combine 15+ years of SEO expertise with advanced AI tools to deliver measurable, sustainable results.",
        pageUrl("/about/"),
        pageTitle(join(CONTENT, "pages", "about")),
        join(CONTENT, "pages", "about", "content.mdoc"),
        "definition"
      ),
    ],
  };

  const book: EntityMapEntity = {
    entityId: BOOK_ID,
    "@type": "schema:Book",
    name: BOOK.title,
    description: `${BOOK.subtitle}. Kindle edition by ${BOOK.author}.`,
    sameAs: ["https://www.amazon.co.uk/dp/B0HMPBBK3B"],
    relations: [
      { predicate: "AUTHORED_BY", targetName: "Sunny Patel", targetId: PERSON_ID },
      { predicate: "RELATES_TO", targetName: "AI Search Optimisation", targetId: topicId("AI Search Optimisation") },
    ],
    hasChunks: [
      {
        chunkId: "c_002",
        text: `Every source cited in ${BOOK.title} by ${BOOK.author}, grouped by part and chapter, with each link checked and kept up to date.`,
        sourceUrl: pageUrl("/book/sources/"),
        pageTitle: `Sources and links: ${BOOK.title}`,
        publisher: PUBLISHER,
        retrieved: RETRIEVED,
        contentType: "evidence",
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
      { predicate: "DESCRIBED_BY", targetName: "Sunny Patel", targetId: PERSON_ID, targetUri: pageUrl(t.path) },
      ...RELATED.filter(([a]) => a === t.name).map(([, predicate, b]) => ({ predicate, targetName: b, targetId: topicId(b) })),
    ],
    hasChunks: [pageChunk(`c_${100 + i}`, t.src, t.path, "definition")],
  }));

  const services: EntityMapEntity[] = SERVICES.map((s, i) => ({
    entityId: s.id,
    "@type": "Service",
    name: s.name,
    description: s.description,
    relations: [
      { predicate: "PRODUCED_BY", targetName: "Sunny Patel", targetId: PERSON_ID },
      ...s.topics.map((t) => ({ predicate: "INCLUDES", targetName: t, targetId: topicId(t) })),
      ...(s.places ?? []).map((p) => ({
        predicate: "TARGETS",
        targetName: p,
        targetId: placeId(p),
        targetUri: pageUrl(PLACES.find((x) => x.name === p)!.page),
        confidence: "declared" as const,
      })),
    ],
    hasChunks: [pageChunk(`c_${200 + i}`, { kind: "services", slug: s.slug }, `/services/${s.slug}/`, "evidence")],
  }));

  const places: EntityMapEntity[] = PLACES.map((p, i) => ({
    entityId: p.id,
    "@type": "Place",
    name: p.name,
    description: p.description,
    sameAs: [`https://www.wikidata.org/wiki/${p.wikidata}`, `https://en.wikipedia.org/wiki/${p.wikipedia}`],
    relations: p.partOfBerkshire ? [{ predicate: "PART_OF", targetName: "Berkshire", targetId: placeId("Berkshire") }] : [],
    hasChunks: [
      p.verbatim
        ? verbatimChunk(`c_${300 + i}`, p.verbatim, pageUrl(p.page), pageTitle(servicesDir(p.slug)), join(servicesDir(p.slug), "content.mdoc"), "evidence")
        : pageChunk(`c_${300 + i}`, { kind: "services", slug: p.slug }, p.page, "evidence"),
    ],
  }));

  return {
    version: "1.0",
    schema: "https://entitymap.org/spec/v1.0",
    publisher: { name: PUBLISHER, url: SITE_URL },
    generated,
    profile: "core",
    verificationStatus: "self-declared",
    entities: [person, book, ...topics, ...services, ...places],
  };
}

export type EntityMap = ReturnType<typeof buildEntityMap>;
