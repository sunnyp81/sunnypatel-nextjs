import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { RelatedTools } from "@/components/related-tools";

export type ToolPageInfo = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  explanation: string[];
  steps: string[];
  checks: string[];
  limits: string;
  faqs: { q: string; a: string }[];
  service: { href: string; label: string; lead: string };
};

export const newToolPages: Record<string, ToolPageInfo> = {
  "local-seo-audit": {
    slug: "local-seo-audit",
    title: "Local SEO Audit Tool",
    description: "Check a business page for local search signals, contact details and structured data.",
    intro: "Enter a business page and its details to get a scored, prioritised local SEO checklist.",
    explanation: [
      "A local service page should make it easy for people to see who serves their area and how to get in touch. This tool reads the HTML returned for one public URL. It looks for your business name, town and phone in visible text, page headings and metadata, then compares those details with any LocalBusiness or Organization structured data. It also checks for a map or directions link, a Google Maps or Business Profile link, a telephone link and review signals.",
      "Use the checklist when publishing a new location page or reviewing an existing one. Enter the business name, town and phone exactly as customers know them. A pass means the specified signal was detected in the returned page, while a warning means it was partial or ambiguous. A fail points to a missing signal. The score is a weighted sum of these checks, with partial credit for warnings. It is a practical editing guide, not a Google score or ranking prediction.",
      "Review each finding against the actual page before changing it. In particular, a local landing page should describe a real service in that town rather than repeat place names mechanically. Keep contact details consistent with your genuine business records. This tool cannot open your Google Business Profile, verify an address, see rankings or assess content added after the HTML response loads.",
    ],
    steps: [
      "Enter the public page URL, business name, town and phone number.",
      "Run the check and review the highest weighted gaps first.",
      "Compare flagged details with the live page and your real business records before editing.",
    ],
    checks: [
      "Business details in visible text and structured data",
      "LocalBusiness fields, town in key page elements and service headings",
      "Map, Google listing, click-to-call and review signals",
    ],
    limits: "This checks one returned HTML page. It cannot inspect your Google Business Profile, confirm rankings, validate a physical address or see content rendered later by JavaScript.",
    faqs: [
      { q: "Is the score a Google metric?", a: "No. It is a transparent weighted checklist of on-page signals. Google does not supply this score." },
      { q: "Can this check my Google Business Profile?", a: "No. It can only find links to a profile or Maps page in the returned HTML." },
      { q: "Do I need to show my address?", a: "Only publish an address that genuinely represents the business. The audit marks missing address information as a review point, not proof that you need a public shopfront." },
      { q: "Will it check several locations?", a: "Run each location page separately with its own town and business details." },
    ],
    service: { href: "/services/local-seo/", label: "local SEO service", lead: "For a wider local search review, see my" },
  },
  "keyword-cannibalisation-checker": {
    slug: "keyword-cannibalisation-checker",
    title: "Keyword Cannibalisation Checker",
    description: "Find queries receiving impressions across several pages in a Google Search Console export.",
    intro: "Paste or upload a query and page CSV to find overlapping search queries across your pages.",
    explanation: [
      "Keyword cannibalisation describes a situation where several pages compete for the same search intent. More than one page appearing for a query is only a clue: a category page and a detailed article may both deserve visibility. This checker groups the rows in a Google Search Console query and page table. It flags queries with impressions on at least two distinct pages and shows the impressions, clicks, average position and impression share for each page.",
      "Use a table covering a useful date range with Query and Page on every row. Search Console's standard Performance export usually gives separate dimension tables, which cannot be joined into query and page pairs. For a targeted check, filter by one query, open Pages, choose Export and CSV, then add that query as a Query column to the exported page rows. Repeat for other queries and combine the rows. A query and page table exported from the Search Console API also works. The file stays in your browser.",
      "Issues with more combined impressions and similar page positions rise to the top. The suggested owner is the page with most clicks, using best position as a tie-breaker. This is a starting point for review, not an instruction to delete or redirect a page. Check intent, content quality, conversions and the wider query set before deciding whether to consolidate, differentiate or leave both pages alone. Download the flagged rows to share or investigate further.",
    ],
    steps: [
      "In Search Console, open Performance, then Search results and choose a date range.",
      "Choose a query in Queries to filter the report, open Pages, then choose Export and CSV. Add that query as a Query column to each exported page row.",
      "Repeat for other queries and combine the rows into one CSV with Query, Page, Clicks, Impressions and Position columns. Upload or paste it here.",
    ],
    checks: [
      "Queries with impressions on two or more distinct pages",
      "Per-page clicks, impressions, average position and impression share",
      "Priority based on combined impressions and position proximity",
    ],
    limits: "An overlap is not automatically a problem. Exported rows can be limited or anonymised by Search Console. The suggested owner uses clicks and position only; final decisions need editorial judgement.",
    faqs: [
      { q: "Can I use separate Queries and Pages CSV files?", a: "No. Each input row must contain both a query and its page. Separate totals cannot be reliably joined." },
      { q: "Is keyword cannibalization the same term?", a: "Yes. Cannibalization is the US spelling; this page uses the British spelling cannibalisation." },
      { q: "Does every overlap need a fix?", a: "No. Several pages may serve different intents for the same query. Review the pages before making changes." },
      { q: "Is my export uploaded?", a: "No. Your file and pasted rows are read and analysed in your browser." },
    ],
    service: { href: "/services/technical-seo-audit/", label: "technical SEO audit", lead: "For a full review of competing pages and site structure, see my" },
  },
  "readability-score": {
    slug: "readability-score",
    title: "Readability Checker",
    description:
      "Check readability with Flesch Reading Ease, Flesch-Kincaid Grade Level and Gunning Fog, sentence by sentence, in your browser.",
    intro:
      "Paste your text to get Flesch Reading Ease, Flesch-Kincaid Grade Level and Gunning Fog scores, with the long sentences and complex words that drag them down.",
    explanation: [
      "Readability formulas estimate how much effort a piece of text asks of a reader. They count sentence length and word length, usually by syllables, and turn those counts into a score. Flesch Reading Ease runs from 0 to 100, where a higher score is easier to read. Flesch-Kincaid Grade Level and Gunning Fog express the same idea as a rough number of years of schooling.",
      "I use these scores as a quick editing check, not as a target in themselves. A service page for small business owners usually works best in plain English, while a technical guide can carry longer words if the audience expects them. Search engines do not publish readability scores as a ranking factor, so the reason to improve them is that people understand and act on clearer pages.",
      "Run a draft through the checker, then work on the longest sentences and the densest paragraphs first. Split sentences that carry two ideas, swap jargon for the word a customer would use, and check the score again. Your text stays in your browser and is never uploaded.",
    ],
    steps: [
      "Paste or type your text into the box.",
      "Read the three scores and the plain-English summary.",
      "Shorten the longest sentences and simplify complex words, then check again.",
    ],
    checks: [
      "Flesch Reading Ease (0 to 100, higher is easier)",
      "Flesch-Kincaid Grade Level and Gunning Fog Index",
      "Word, sentence and syllable counts behind each score",
    ],
    limits:
      "Formulas count syllables and sentence length only. They cannot judge accuracy, structure, tone or whether the text answers the reader's question, and syllable counts are estimates.",
    faqs: [
      {
        q: "What is a good Flesch Reading Ease score?",
        a: "Around 60 to 70 is generally treated as plain English. Specialist audiences can cope with lower scores, so judge it against who will read the page.",
      },
      {
        q: "Does readability affect Google rankings?",
        a: "Google has not said it uses readability formulas for ranking. Clearer writing helps people understand the page, which is the outcome that matters.",
      },
      {
        q: "Is my text uploaded anywhere?",
        a: "No. The scores are calculated in your browser.",
      },
      {
        q: "Why do different tools give slightly different scores?",
        a: "Tools count syllables and sentence breaks in different ways, so small differences between checkers are normal.",
      },
    ],
    service: {
      href: "/services/content-briefs/",
      label: "content strategy and briefs service",
      lead: "If you want a hand making your pages clearer and more persuasive, see my",
    },
  },
  "schema-validator": {
    slug: "schema-validator",
    title: "Schema Validator",
    description:
      "Check JSON-LD syntax and structured data properties from code or a URL.",
    intro:
      "Paste JSON-LD or fetch a page to find syntax errors and missing structured data properties.",
    explanation: [
      "Structured data gives machines a more explicit description of a page. JSON-LD is a common way to " +
        "place that description in a script element, using schema.org types and properties. A search engine " +
        "can use the markup to understand the subject of a page and, for some eligible types, consider a " +
        "richer search appearance. The markup still needs to describe the visible content accurately.",
      "Use this validator when you add or edit JSON-LD, inherit markup from a plugin, or notice a " +
        "structured data warning elsewhere. Paste one block for a quick syntax check, or enter a public URL " +
        "to inspect the blocks in its returned HTML. The tool checks the basic schema.org shape throughout " +
        "each block. It applies the selected Google rich result property checks only to standalone entities, " +
        "so an author or publisher nested inside an Article does not collect irrelevant warnings.",
      "Start with errors, then decide whether recommended details are relevant to your page. Expand the " +
        "paths to locate a repeated issue, and follow the linked guidance for the exact type before changing " +
        "markup. A clean result here is a starting point: check the published URL with Google's own testing " +
        "tools and make sure every claim is supported on the page.",
    ],
    steps: [
      "Paste a JSON-LD script or enter a public page URL.",
      "Run the check and inspect each graph node.",
      "Use the linked generator to repair a supported type, then test the published page with Google.",
    ],
    checks: [
      "JSON syntax, including an approximate line number",
      "Missing @context and @type, including graph nodes",
      "Selected required and recommended Google Search properties",
    ],
    limits:
      "This is a first pass. It cannot assess whether claims match visible page content or guarantee a rich " +
      "result. Google may apply additional type and page rules.",
    faqs: [
      {
        q: "Can I test several JSON-LD blocks?",
        a: "Yes. URL mode checks each application/ld+json block it finds in the returned HTML.",
      },
      {
        q: "Does a warning make my markup invalid?",
        a: "No. Recommended properties and unsupported rich result types can still be valid schema.org markup.",
      },
      {
        q: "Can this check rendered JavaScript?",
        a: "It checks the HTML returned by the server. Structured data added later by JavaScript may be missed.",
      },
      {
        q: "Does passing guarantee a rich result?",
        a: "No. Google applies content, eligibility and quality rules beyond these property checks.",
      },
    ],
    service: {
      href: "/services/technical-seo-audit/",
      label: "technical SEO audit",
      lead: "For a review of the published markup and page context, see my",
    },
  },
  "sitemap-generator": {
    slug: "sitemap-generator",
    title: "XML Sitemap Generator",
    description: "Crawl internal HTML links and download a sitemap draft.",
    intro:
      "Build a draft XML sitemap from links found in a public website's HTML.",
    explanation: [
      "An XML sitemap lists URLs that you want crawlers to consider. It is especially useful when a site " +
        "has many important pages or when internal linking does not make every page easy to find. A sitemap " +
        "is a discovery aid, so its entries should point to canonical, indexable pages that you intend to " +
        "keep public.",
      "Use this generator when you need a small site's first sitemap, want a quick independent list of " +
        "linked pages, or need to inspect the output of a lightweight crawl. Enter a public homepage, set a " +
        "sensible page cap and watch the crawl progress. The tool follows links in returned HTML on the same " +
        "host, checks the basic wildcard robots.txt disallow rules, and leaves out pages that declare noindex " +
        "or a different canonical URL.",
      "Review the XML before you publish it. Check that key pages are present, remove URLs that do not " +
        "belong, and compare the result with the site's real content inventory. Links produced only by " +
        "JavaScript and orphan pages may be absent. If your site already generates a maintained sitemap, use " +
        "that as the source of truth and treat this download as a diagnostic draft.",
    ],
    steps: [
      "Enter the site URL and choose a page limit.",
      "Start the crawl and watch the discovered page count.",
      "Review, copy or download the XML before submitting it.",
    ],
    checks: [
      "Same-host HTML links",
      "Robots.txt Disallow rules for the wildcard user agent",
      "Noindex and canonical signals in returned HTML",
    ],
    limits:
      "The crawl stops at 500 URLs. JavaScript-rendered links are not discovered. Robots rules, redirects " +
      "and canonicals can be more complex than this lightweight crawler can resolve. Review the output " +
      "before publishing.",
    faqs: [
      {
        q: "Will it find every page?",
        a: "No. It follows links in returned HTML only and cannot discover orphan pages or links added by JavaScript.",
      },
      {
        q: "Does it respect robots.txt?",
        a:
          "It applies wildcard Disallow rules found in robots.txt before fetching pages. " +
          "Review complex rule sets separately.",
      },
      {
        q: "Where does lastmod come from?",
        a: "A valid Last-Modified response header is used where available. Otherwise the entry has no lastmod.",
      },
      {
        q: "Can I stop a crawl?",
        a: "Yes. Stop prevents the queue from starting more pages and preserves results already collected.",
      },
    ],
    service: {
      href: "/services/technical-seo-audit/",
      label: "technical SEO audit",
      lead: "For a full crawl and indexability review, see my",
    },
  },
  "llms-txt-generator": {
    slug: "llms-txt-generator",
    title: "llms.txt Generator",
    description: "Draft a proposed llms.txt file for your website.",
    intro:
      "Create a concise Markdown guide to your site's most useful pages. llms.txt is a proposed convention, " +
      "not an official standard.",
    explanation: [
      "An llms.txt file is a short Markdown guide to a website. The proposal puts a site title, a brief " +
        "summary and a curated set of links in one text file at the site root. It gives a reader or a system " +
        "a compact route to the pages you consider useful. The format is optional, and publishing one does " +
        "not guarantee that any AI service will read it or cite your site.",
      "Use this generator when you can identify the pages that best explain your organisation, services or " +
        "reference material. Write the summary in plain language and choose link titles that describe the " +
        "destination. The optional prefill reads the homepage and sitemap, then fetches up to 20 selected " +
        "pages to use their HTML titles. It prioritises main pages and service pages, and places deeper " +
        "material in the Optional section.",
      "Treat the draft as an editorial file. Check each title, URL and short note, remove weak or " +
        "duplicated entries, and make sure the summary matches what visitors can verify on the site. Download " +
        "the reviewed text and place it at /llms.txt if you choose to publish it. Keep your normal navigation " +
        "and XML sitemap in place.",
    ],
    steps: [
      "Add your site name and a short summary.",
      "Add sections with useful links and optional notes, or prefill from your public site.",
      "Review the draft, then copy or download llms.txt.",
    ],
    checks: [
      "H1 title and blockquote summary",
      "H2 link sections and optional detail",
      "Markdown links with short notes",
    ],
    limits:
      "Publishing llms.txt does not improve rankings or guarantee AI citations. Prefill is a starting point " +
      "from the homepage and sitemap, so check every link and summary.",
    faqs: [
      {
        q: "Is llms.txt an official standard?",
        a: "No. It is a proposal described at llmstxt.org.",
      },
      {
        q: "Will AI systems read the file?",
        a:
          "Some systems may choose to read it. Adoption and behaviour vary, so check your own server " +
          "logs and results.",
      },
      {
        q: "Does it replace a sitemap?",
        a: "No. Keep an XML sitemap for search crawling and use llms.txt only as an optional human-reviewed guide.",
      },
      {
        q: "Where should I upload it?",
        a: "Place the reviewed text file at the root path /llms.txt of your site.",
      },
    ],
    service: {
      href: "/services/ai-search-optimisation/",
      label: "AI search optimisation service",
      lead: "For a broader review of how your site is represented in AI search, see my",
    },
  },
  "meta-description-generator": {
    slug: "meta-description-generator",
    title: "Meta Description Generator",
    description:
      "Create six search descriptions and compare estimated pixel widths.",
    intro:
      "Draft six British English meta descriptions from your own page facts, without an AI API.",
    explanation: [
      "A meta description is a short summary that you can add to a page's HTML metadata. Search engines may " +
        "use it as the text below a result title, although the displayed snippet can change with the query. A " +
        "useful description tells the reader what the page covers and gives a truthful reason to open it. It " +
        "should match the content they will actually find.",
      "Use this generator when drafting a new page, refreshing a weak search snippet, or comparing several " +
        "ways to express the same offer. Enter the page topic and primary keyword, then add the audience, " +
        "your real distinguishing detail and the action you want a reader to take. The six drafts use those " +
        "details in different orders. Character counts and estimated pixel widths help you spot likely " +
        "truncation, but neither number is a fixed Google limit.",
      "Choose the draft that reads most naturally, then edit it as a human sentence. Verify the selling " +
        "point against the page and make the call to action specific to the next step. If a draft is outside " +
        "the suggested character range, the amber label invites review rather than automatic rejection. Copy " +
        "the final text into your page metadata and inspect the published result.",
    ],
    steps: [
      "Enter the page topic, keyword and any relevant audience, benefit and call to action.",
      "Generate six varied drafts and compare their estimated widths.",
      "Edit the chosen text for accuracy, then copy it into your page metadata.",
    ],
    checks: [
      "Character count and approximate desktop and mobile pixel width",
      "Keyword placement in each draft",
      "Six deterministic wording patterns",
    ],
    limits:
      "Pixel guides are approximate. Google may rewrite a snippet and display length varies by device, " +
      "query and typography. Only include benefits you can substantiate.",
    faqs: [
      {
        q: "Does Google always show my description?",
        a: "No. Google can choose a different snippet from the page for a particular search.",
      },
      {
        q: "Are the pixel limits exact?",
        a: "No. The desktop and mobile guides are estimates based on browser text measurement.",
      },
      {
        q: "Is this generated by AI?",
        a: "No. The six variations use fixed templates and only the details you enter.",
      },
      {
        q: "Should I use the primary keyword every time?",
        a: "Use it naturally when it accurately describes the page. Edit any draft that feels repetitive.",
      },
    ],
    service: {
      href: "/services/technical-seo-audit/",
      label: "technical SEO audit",
      lead: "For a broader review of snippets and on-page signals, see my",
    },
  },
};

export function ToolPageShell({
  info,
  children,
}: {
  info: ToolPageInfo;
  children: ReactNode;
}) {
  const url = `https://sunnypatel.co.uk/tools/${info.slug}/`;
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: info.title,
    applicationCategory: "SEOApplication",
    operatingSystem: "Web",
    url,
    description: info.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    author: {
      "@type": "Person",
      name: "Sunny Patel",
      url: "https://sunnypatel.co.uk/",
    },
  };
  return (
    <main className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Free SEO tool
          </p>
          <h1
            className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {info.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground">
            {info.intro}
          </p>
        </div>
        {children}
        <section className="mt-10 max-w-3xl">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            About this tool
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {info.explanation.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xl font-bold text-foreground">
              How to use it
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {info.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold text-foreground">
              What it checks
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {info.checks.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold text-foreground">Limits</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {info.limits}
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold text-foreground">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {info.faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-foreground">{f.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          {info.service.lead}{" "}
          <Link
            className="text-brand underline underline-offset-2"
            href={info.service.href}
          >
            {info.service.label}
          </Link>
          .
        </p>
      </div>
      <RelatedTools currentHref={`/tools/${info.slug}/`} />
      <Footer />
    </main>
  );
}
