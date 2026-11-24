import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import AiVisibilityChecker from "./AiVisibilityChecker";
import { ToolExplainer, ExplainerLink } from "@/components/tool-explainer";

export function generateMetadata() {
  return {
    title: "AI Visibility Checker | Technical Readiness Diagnostic",
    description:
      "Inspect crawl directives, structured data and page structure with a free technical diagnostic. Its heuristic score does not measure AI retrieval or citations.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/ai-visibility-checker/" },
  };
}

export default function AiVisibilityCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <AiVisibilityChecker />
        <ToolExplainer
          does={
            <>
              <p>It is a technical checklist for one page. It does not ask ChatGPT, Perplexity, Gemini or Google anything, so the score says nothing about whether any AI answer names or cites you.</p>
              <p>When you press the button, my server fetches your page, your /robots.txt and your /llms.txt. It then sends the brand name it guessed from your page to the Wikipedia and Wikidata search services. The guess is the og:site_name tag, else the start of the title, else the domain name. Four groups of checks follow.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Crawler rules: whether robots.txt allows OAI-SearchBot, PerplexityBot and Googlebot to fetch this URL. Scored out of 25.</li>
                <li>Structured identity: whether the page has readable JSON-LD, an Organization or Person type, a name and a URL. Scored out of 25.</li>
                <li>Page structure: one H1, a title, a meta description and at least one H2. Scored out of 25.</li>
                <li>Entity lookups and llms.txt: shown for information and not scored.</li>
              </ul>
              <p>The three scored groups are added up and scaled to 100.</p>
            </>
          }
          steps={[
            "Enter one page address, such as your home page.",
            "Press Check Technical Readiness and wait for the four groups.",
            "Read each failed or unknown line and its note, and decide whether it applies to your site.",
            "Change only what is wrong for your visitors, then run the check again.",
          ]}
          limits={
            <>
              <p>A robots.txt rule is a request to crawlers. It does not show that a firewall lets the bot in or that your page is chosen for an answer. If robots.txt cannot be read, no overall score is shown. The checker does not run JavaScript, so markup added by scripts is missed.</p>
              <p>The Wikipedia and Wikidata lines only compare names. A match is not proof it is you, and no match is not a fault. The weights are my own choices, not a validated predictor of AI citations.</p>
              <p>Google says: &quot;There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary&quot; (<ExplainerLink href="https://developers.google.com/search/docs/appearance/ai-features" external>Google Search Central</ExplainerLink>, read 24 November 2026). To see what answers say about a brand, see the <ExplainerLink href="/ai-visibility/">AI visibility service</ExplainerLink>.</p>
              <p>If analytics is active in your browser, a check records an event with the address you entered.</p>
            </>
          }
          faqs={[
            { q: "Does a high score mean AI tools will cite me?", a: "No. The checks cover crawl rules, markup and page structure. They do not read any AI answer." },
            { q: "Do I need an llms.txt file?", a: "The tool reports whether one exists and does not score it. Google's page above says no new machine-readable files are needed for its AI features." },
            { q: "Why is there no overall score?", a: "I could not read robots.txt, so the crawler group is unknown. The other groups still show." },
          ]}
        />
        <ToolNextStep lead="Want to see what ChatGPT says about you? Get a" href="/tools/chatgpt-visibility-check/" label="free ChatGPT check" />
      </div>
      <RelatedTools currentHref="/tools/ai-visibility-checker/" />
      <Footer />
    </main>
  );
}
