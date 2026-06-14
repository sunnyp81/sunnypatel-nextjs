'use client';

import { useState, useMemo, useCallback } from 'react';

interface Prompt {
  id: string;
  category: string;
  title: string;
  use: string;
  text: string;
}

const PROMPTS: Prompt[] = [
  // Keyword & Demand Research
  {
    id: 'intent-classify',
    category: 'Keyword & Demand',
    title: 'Classify search intent for a keyword list',
    use: 'Sort keywords into informational, commercial, transactional, and navigational so you map each to the right page type.',
    text: `Act as a semantic SEO strategist. Classify each keyword below by dominant search intent (informational, commercial investigation, transactional, navigational) and by funnel stage (awareness, consideration, decision). For each, name the single best page type to satisfy it (guide, comparison, service page, product, tool, FAQ). Return a table: keyword, intent, stage, page type, one-line reason.

Keywords:
{paste keyword list}`,
  },
  {
    id: 'demand-map',
    category: 'Keyword & Demand',
    title: 'Build a demand map from one seed query',
    use: 'Turn a seed term into the real questions and sub-tasks users have, clustered by entity and attribute.',
    text: `You are mapping search demand for the seed query "{seed query}" in {country}. List the entities, attributes, and user tasks connected to it. Group them into 6 to 10 clusters, each cluster named by the shared entity plus attribute. Under each cluster, list the specific questions a user would ask, ordered from awareness to decision. Flag which clusters are commercial and which are informational.`,
  },
  {
    id: 'paa-expand',
    category: 'Keyword & Demand',
    title: 'Expand People Also Ask coverage',
    use: 'Find the follow-up questions a topic must answer to win the question cluster.',
    text: `For the topic "{topic}", generate the 20 questions most likely to appear in Google People Also Ask and AI Overviews. For each question, write a one-sentence direct answer that starts with the answer (no preamble). Order the questions so each leads naturally into the next, forming a logical sequence a reader would follow.`,
  },

  // Topical Maps & Authority
  {
    id: 'topical-map',
    category: 'Topical Authority',
    title: 'Generate a ROOT / NODE / SEED topical map',
    use: 'Plan a full content architecture that builds topical authority, not scattered posts.',
    text: `Act as a semantic SEO architect using Koray Tugberk Gubur's methodology. For the central entity "{central entity}" and the source context "{what the site sells}", build a topical map. Define: the central search intent, the core section (ROOT pages that earn money or rankings), and the outer section (NODE and SEED supporting pages that build authority). Output as a tree: each page with its target query, page type, and the one attribute it uniquely covers. No two pages should target the same query.`,
  },
  {
    id: 'gap-vs-competitor',
    category: 'Topical Authority',
    title: 'Find content gaps versus a competitor',
    use: 'See which subtopics a competitor covers that you do not, ranked by value.',
    text: `Compare my topical coverage to a competitor. My pages cover: {list your main topics or paste URLs}. The competitor covers: {paste competitor topics or URLs}. Identify the subtopics and queries the competitor covers that I do not. Rank the gaps by commercial value and by how winnable they are for a lower-authority site. Return a table: gap topic, target query, value (high/med/low), winnability, suggested page type.`,
  },
  {
    id: 'contextual-bridge',
    category: 'Topical Authority',
    title: 'Write a contextual bridge between two topics',
    use: 'Connect two sections so the topical flow stays smooth and the internal link reads naturally.',
    text: `I am linking a page about "{topic A}" to a page about "{topic B}". Write a 2-sentence contextual bridge that connects them using shared terms, so the transition feels natural and the internal link has strong lexical relevance. Start with the answer or subject, no filler. Then suggest the exact anchor text to use, matching the target page's main query.`,
  },

  // Content Briefs
  {
    id: 'semantic-brief',
    category: 'Content Briefs',
    title: 'Build a semantic content brief from the SERP',
    use: 'Produce a brief that replicates the winning patterns for a query.',
    text: `Create a semantic content brief for the target query "{query}" in {country}. Include: the central entity and its key attributes, the dominant search intent, a heading structure (H1 plus H2/H3) where every heading covers different information and answers a distinct question, the entities and terms the content must mention, the question-answer pairs to include, and the best format for each section (paragraph, list, table, definition). End with the single sentence the page should open with to answer the query immediately.`,
  },
  {
    id: 'entity-extract',
    category: 'Content Briefs',
    title: 'Extract entities and attributes for a topic',
    use: 'Know exactly which entities and attributes to cover for full topical completeness.',
    text: `For the topic "{topic}", list the named entities, attributes, and relationships a comprehensive page must cover to demonstrate expertise to both Google and AI systems. Group them as: core entities (must cover), supporting entities (should cover), and contextual terms (adds depth). For each core entity, note the one fact or attribute that proves first-hand understanding.`,
  },

  // Writing & Optimization
  {
    id: 'answer-first',
    category: 'Writing & Optimization',
    title: 'Rewrite content answer-first (micro-semantics)',
    use: 'Make every sentence lead with the answer so the page is extractable and ranks for the snippet.',
    text: `Rewrite the text below following micro-semantic rules: every sentence starts with the answer or subject, no preamble or rhetorical openers, no filler words (avoid "in today's", "it's important", "when it comes to", "unlock", "delve"). Keep claims specific and quantified where possible. Use commas only for enumerations or ranges. Preserve meaning and length. Return only the rewritten text.

Text:
{paste content}`,
  },
  {
    id: 'meta-ctr',
    category: 'Writing & Optimization',
    title: 'Write title tags and meta descriptions for CTR',
    use: 'Generate click-worthy, non-truncating titles and descriptions front-loaded with the keyword.',
    text: `Write 3 title tag and meta description options for a page targeting "{query}". Rules: title under 60 characters and front-loaded with the primary keyword, meta description 150 to 160 characters with a clear benefit and a soft call to action. Match the dominant search intent. Do not use the brand name unless it adds trust. Avoid clickbait. Return as a numbered list with character counts.`,
  },
  {
    id: 'snippet-block',
    category: 'Writing & Optimization',
    title: 'Draft a featured snippet definition block',
    use: 'Win the definition or "what is" snippet with a tight, extractable answer.',
    text: `Write a featured-snippet-optimised answer for the query "{query}". Give a 40 to 55 word direct definition that starts by naming the subject, then one short supporting sentence. Follow it with a 4 to 6 item list or a small table if the query implies steps or comparison. The answer must make sense on its own when quoted by an AI assistant with no other context.`,
  },

  // Schema & Technical
  {
    id: 'schema-gen',
    category: 'Schema & Technical',
    title: 'Generate JSON-LD schema for a page',
    use: 'Get valid structured data for the right schema type, ready to paste.',
    text: `Generate valid JSON-LD schema for a {page type, e.g. Service / Article / FAQPage / LocalBusiness} page about "{topic}". Use Schema.org types correctly, include all recommended properties, and reference the author and organisation entities. Add SpeakableSpecification if the page answers questions. Return only the JSON-LD, wrapped in a script tag, with no placeholder values left blank where I have given details: {paste page details}.`,
  },
  {
    id: 'tech-audit',
    category: 'Schema & Technical',
    title: 'Run a technical SEO triage checklist',
    use: 'Get a prioritized list of technical issues to check on any page or site.',
    text: `Act as a technical SEO auditor. Give me a prioritised checklist to triage "{site or page URL}", covering crawlability, indexability, Core Web Vitals, mobile usability, HTTPS and security, structured data, URL structure, and internationalisation. For each item, state what to check, the tool to use, and the symptom that signals a problem. Order by impact on rankings, highest first.`,
  },

  // Internal Linking
  {
    id: 'link-finder',
    category: 'Internal Linking',
    title: 'Find internal linking opportunities',
    use: 'Surface contextual links between your pages that pass relevance and equity.',
    text: `I want to improve internal linking. Here are my pages with their target queries: {paste list of URLs and their main keyword}. Identify the strongest contextual linking opportunities between them. For each, give: source page, target page, anchor text matching the target query, and the section of the source page where the link fits naturally. Avoid linking from the first paragraph and keep at most one link per section.`,
  },
  {
    id: 'anchor-plan',
    category: 'Internal Linking',
    title: 'Plan diversified anchor text',
    use: 'Avoid over-optimized anchors while keeping links relevant.',
    text: `For the target page "{target URL}" ranking for "{primary query}", suggest 8 internal anchor text variations that stay lexically relevant without repeating the exact-match keyword more than twice. Include partial-match, entity-based, and natural-phrase anchors. Note which to use on high-authority source pages and which on supplementary content.`,
  },

  // AEO / GEO
  {
    id: 'make-citable',
    category: 'AEO / GEO',
    title: 'Make content citable by AI assistants',
    use: 'Restructure a page so ChatGPT, Perplexity, and AI Overviews quote it.',
    text: `Assess how citable the content below is for AI assistants (ChatGPT, Perplexity, Google AI Overviews). Then rewrite the opening so it answers the core question in the first 2 sentences, add clear claims with specific figures, mark the author and source clearly, and structure the key facts so they can be extracted out of context. List what you changed and why it improves citation odds.

Content:
{paste content}`,
  },
  {
    id: 'faq-extract',
    category: 'AEO / GEO',
    title: 'Extract an FAQ for AI answers',
    use: 'Turn a page into question-answer pairs that AI engines lift directly.',
    text: `From the content below, extract the 6 to 8 questions a user would ask an AI assistant about this topic. Write each answer in 40 to 70 words, starting with the answer, self-contained so it makes sense when quoted alone. Format as question and answer pairs ready for FAQPage schema.

Content:
{paste content}`,
  },
  {
    id: 'entity-eeat',
    category: 'AEO / GEO',
    title: 'Strengthen entity and E-E-A-T signals',
    use: 'Make it unambiguous who the author is and why they are credible, for YMYL and AI trust.',
    text: `Review the page "{URL or paste content}" for entity clarity and E-E-A-T. Identify where authorship, expertise, and first-hand experience are unclear or missing. Suggest specific additions: author attribution, credentials, experience statements, citations, and sameAs entity links. Prioritise changes that most increase trust for AI systems deciding whether to cite the source.`,
  },

  // Local SEO
  {
    id: 'gbp-optimise',
    category: 'Local SEO',
    title: 'Optimise a Google Business Profile',
    use: 'Get a concrete GBP action list to improve local pack visibility.',
    text: `Act as a local SEO specialist. For a "{business type}" in "{town}", give a Google Business Profile optimisation plan covering: primary and secondary categories, the services to list, a keyword-rich business description, post ideas for the next month, review acquisition tactics, and the NAP consistency checks to run. Prioritise the actions that most influence local pack rankings.`,
  },
  {
    id: 'location-page',
    category: 'Local SEO',
    title: 'Plan a location page that ranks',
    use: 'Build a genuinely useful local page, not a thin doorway page.',
    text: `Plan a location page for "{service} in {town}". Outline a structure that is genuinely useful and not thin: local intro with real area detail, the service explained for this area, who it is for, local proof or context, FAQs with location-specific answers, and a clear call to action. List the on-page entities and local terms to include, and the schema to add. Flag anything that would make Google treat it as a doorway page.`,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(PROMPTS.map((p) => p.category)))];

export default function SeoPrompts() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPTS.filter((p) => {
      const catOk = activeCat === 'All' || p.category === activeCat;
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.use.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, activeCat]);

  const copy = useCallback(async (p: Prompt) => {
    try {
      await navigator.clipboard.writeText(p.text);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId((c) => (c === p.id ? null : c)), 1800);
    } catch {
      setCopiedId(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          SEO Prompt Library
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">
          {PROMPTS.length} copy-paste prompts for ChatGPT, Claude, and Gemini, built on semantic SEO
          method: demand mapping, topical authority, content briefs, schema, internal linking, and
          AI search optimisation. Replace the {'{bracketed}'} parts with your own details, then run.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts (e.g. schema, topical map, local)"
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30"
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCat === cat
                  ? 'bg-brand/20 text-brand border border-brand/30'
                  : 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Showing {filtered.length} of {PROMPTS.length} prompts
      </p>

      {/* Prompt grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-12">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-md bg-brand/[0.12] px-2 py-0.5 text-[11px] font-medium text-brand">
                  {p.category}
                </span>
                <h2 className="mt-2 font-semibold text-foreground leading-snug">{p.title}</h2>
              </div>
              <button
                onClick={() => copy(p)}
                className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(91,138,239,0.3)] transition-opacity hover:opacity-90"
              >
                {copiedId === p.id ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.use}</p>
            <pre className="mt-3 flex-1 whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-foreground/90 font-mono leading-relaxed">
              {p.text}
            </pre>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground mb-12">
          No prompts match that search. Try a broader term or pick a different category.
        </p>
      )}

      {/* How to use */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="text-xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How to get the most from these prompts
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Replace every {'{bracketed}'} placeholder with your own keyword, URL, topic, or pasted
            content before running the prompt. The more specific your inputs, the better the output.
          </p>
          <p>
            Treat the result as a first draft, not a finished page. AI speeds up demand mapping,
            briefs, and structure, but the ranking edge comes from your own expertise, real data, and
            editing. Verify any factual claim before publishing, especially in YMYL niches.
          </p>
          <p>
            Chain the prompts in order. Start with intent and demand mapping, move to a topical map,
            then a content brief, then writing and schema. Each output feeds the next, which is how
            you build topical authority rather than disconnected posts.
          </p>
        </div>
      </div>
    </div>
  );
}
