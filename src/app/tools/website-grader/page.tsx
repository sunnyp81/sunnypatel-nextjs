import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import WebsiteGrader from "./WebsiteGrader";
import { ToolExplainer, ExplainerLink } from "@/components/tool-explainer";
import { schemaGraph, websiteGraderPageSchema, websiteGraderSchema } from "@/lib/schema";

export function generateMetadata() {
  return {
    title: "Free Website Grader | SEO Page Grader, A to F",
    description: "Free website grader for one URL: 10 SEO checks, 5 security checks, content stats and a mobile PageSpeed lab score, graded A to F when PageSpeed responds.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/website-grader/" },
  };
}

export default function WebsiteGraderPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaGraph(websiteGraderPageSchema(), websiteGraderSchema()) }}
      />
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <WebsiteGrader />
        <ToolExplainer
          does={
            <>
              <p>It grades one page from A+ to F using four parts. My server fetches the page once, follows redirects and waits up to 10 seconds. Separately, your browser asks Google&apos;s PageSpeed Insights service for a mobile score, so Google receives the address from your browser.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>SEO, 40 per cent: ten checks worth 10 points each. They cover the title, meta description, H1, H2s, canonical tag, noindex, image alt text, three Open Graph tags, JSON-LD and hreflang.</li>
                <li>Performance, 30 per cent: the PageSpeed Insights mobile performance score.</li>
                <li>Security, 20 per cent: HTTPS, plus whether the Content-Security-Policy, X-Frame-Options, X-Content-Type-Options and Strict-Transport-Security headers are present.</li>
                <li>Content, 10 per cent: word count, internal and external links, images and headings.</li>
              </ul>
              <p>The bands are A+ from 95, A from 90, B from 80, C from 70, D from 60, and F below that.</p>
            </>
          }
          steps={[
            "Enter one page address.",
            "Press the button and wait. The page fetch and the PageSpeed request run at the same time.",
            "Read the four scores, then the failed checks and their notes.",
            "Fix the biggest gaps on that page and run it again.",
          ]}
          limits={
            <>
              <p>It grades one URL, not the site. It reads the HTML as first delivered, so text and tags added by JavaScript are not counted. Header checks only test that a header exists, not that its value is sound. JSON-LD is only detected, not validated, so use the <ExplainerLink href="/tools/schema-validator/">schema validator</ExplainerLink> for that. An image with an empty alt attribute counts as missing, even where empty is correct for decoration.</p>
              <p>The title range of 30 to 60 characters and the description range of 120 to 160 are my rules of thumb, not Google limits. Pages with no hreflang still get half marks for that check. The weights are my own choices.</p>
              <p>The performance part is lab data. Google says: &quot;PSI provides both lab and field data about a page&quot; and lab data &quot;may not capture real-world bottlenecks&quot; (<ExplainerLink href="https://developers.google.com/speed/docs/insights/v5/about" external>PageSpeed Insights documentation</ExplainerLink>, read 24 November 2026). It is not proof of real-visitor Core Web Vitals. If PageSpeed returns nothing, no overall grade is given. For a deeper review, see my <ExplainerLink href="/services/technical-seo-audit/">technical SEO audit</ExplainerLink>.</p>
            </>
          }
          faqs={[
            { q: "Why is there no overall grade?", a: "The PageSpeed request returned no score, so the grade would be incomplete. Run it again." },
            { q: "Why did a good page score badly?", a: "Look at which checks failed. Some, like the length ranges, are my rules of thumb." },
            { q: "Does it crawl my whole site?", a: "No. It checks only the address you enter." },
          ]}
        />
        <ToolNextStep lead="Want a second pair of eyes on your grade? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/website-grader/" />
      <Footer />
    </main>
  );
}
