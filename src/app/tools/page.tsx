import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { tools, categories } from "@/lib/tools-data";

export function generateMetadata() {
  return {
    title: "Free SEO Tools | Keyword Research, Technical SEO & Content Analysis",
    description:
      "22 free SEO tools: website grader, speed checker, keyword scraper, schema generator, SEO ROI calculator, SEO prompt library, and more. No sign-up required.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/" },
  };
}

export default function ToolsPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Free SEO Tools
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Practical tools for keyword research, technical SEO, content analysis, and campaign tracking. Everything runs in your browser â€” no sign-up, no data stored.
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
                      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-brand/30 hover:bg-brand/[0.04] hover:shadow-[0_0_24px_rgba(91,138,239,0.15)]"
                    >
                      <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
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
