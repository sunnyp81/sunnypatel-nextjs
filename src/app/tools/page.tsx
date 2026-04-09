import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";

const tools = [
  {
    name: "Keyword Suggestions",
    description: "Scrape Google Autocomplete suggestions across 8 regions with a-z expansion.",
    href: "/tools/keyword-scraper/",
    category: "Keyword Research",
  },
  {
    name: "SERP Snippet Previewer",
    description: "See exactly how your page will appear in Google search results before publishing.",
    href: "/tools/serp-preview/",
    category: "On-Page SEO",
  },
  {
    name: "Bulk Title Tag Checker",
    description: "Check multiple title tags at once for character count, pixel width, and truncation.",
    href: "/tools/title-checker/",
    category: "On-Page SEO",
  },
  {
    name: "Schema Markup Generator",
    description: "Generate valid JSON-LD structured data for FAQ, Article, LocalBusiness, Product, and more.",
    href: "/tools/schema-generator/",
    category: "Technical SEO",
  },
  {
    name: "Robots.txt Generator",
    description: "Build a valid robots.txt with a visual editor. Includes AI crawler blocking presets.",
    href: "/tools/robots-generator/",
    category: "Technical SEO",
  },
  {
    name: "Hreflang Tag Generator",
    description: "Generate correct hreflang tags for multilingual sites in HTML or XML sitemap format.",
    href: "/tools/hreflang-generator/",
    category: "Technical SEO",
  },
  {
    name: "Redirect Chain Checker",
    description: "Follow and visualise the full redirect chain for any URL. Detect loops and 302s.",
    href: "/tools/redirect-checker/",
    category: "Technical SEO",
  },
  {
    name: "UTM Link Builder",
    description: "Build UTM-tagged campaign URLs with presets for common sources and mediums.",
    href: "/tools/utm-builder/",
    category: "Analytics",
  },
  {
    name: "Keyword Density Checker",
    description: "Analyse word frequency, 2-word and 3-word phrase density in your content.",
    href: "/tools/keyword-density/",
    category: "Content",
  },
  {
    name: "Readability Score Calculator",
    description: "Check Flesch Reading Ease, Flesch-Kincaid Grade Level, and Gunning Fog Index.",
    href: "/tools/readability-score/",
    category: "Content",
  },
  {
    name: "Internal Link Suggester",
    description: "Find internal linking opportunities between two pages by matching anchor text phrases.",
    href: "/tools/internal-links/",
    category: "Content",
  },
];

const categories = [...new Set(tools.map((t) => t.category))];

export function generateMetadata() {
  return {
    title: "Free SEO Tools | Keyword Research, Technical SEO & Content Analysis | Sunny Patel",
    description:
      "11 free SEO tools — keyword scraper, SERP previewer, schema generator, robots.txt builder, readability checker, and more. No sign-up required.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/" },
  };
}

export default function ToolsPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Free SEO Tools
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Practical tools for keyword research, technical SEO, content analysis, and campaign tracking. Everything runs in your browser — no sign-up, no data stored.
          </p>

          {categories.map((category) => (
            <section key={category} className="mt-10">
              <h2
                className="mb-4 text-lg font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {category}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools
                  .filter((t) => t.category === category)
                  .map((tool) => (
                    <a
                      key={tool.href}
                      href={tool.href}
                      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-[#5B8AEF]/30 hover:bg-[#5B8AEF]/[0.04] hover:shadow-[0_0_24px_rgba(91,138,239,0.15)]"
                    >
                      <h3 className="font-semibold text-foreground group-hover:text-[#5B8AEF] transition-colors">
                        {tool.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </a>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
