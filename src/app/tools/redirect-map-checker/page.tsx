import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import RedirectMapChecker from "./RedirectMapChecker";

const URL = "https://sunnypatel.co.uk/tools/redirect-map-checker/";
const DESCRIPTION =
  "Paste your old URLs and redirect map to find missing redirects, chains, loops and conflicts before a site migration. Free, runs in your browser.";

export function generateMetadata() {
  return {
    title: "Redirect Map Checker | Free Migration Redirect Tool",
    description: DESCRIPTION,
    alternates: { canonical: URL },
  };
}

const software = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Redirect Map Checker",
  applicationCategory: "SEOApplication",
  operatingSystem: "Web",
  url: URL,
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  author: { "@type": "Person", name: "Sunny Patel", url: "https://sunnypatel.co.uk/" },
};

const linkClass = "text-brand underline underline-offset-2";
const h2 = "mb-3 text-xl font-bold text-foreground";
const h3 = "font-semibold text-foreground";

const checks: { title: string; what: string; fix: string }[] = [
  {
    title: "Old URLs with no redirect",
    what: "An old URL appears in your list but has no row in the map.",
    fix: "Add a row that sends it to the closest matching new page. If the page has no match, decide on purpose what should happen, such as a category page or a 410, and write that down.",
  },
  {
    title: "Map sources not in the old URL list",
    what: "A row redirects a URL that is not in your list. It is often a typo, a stale row or a URL your inventory missed.",
    fix: "Fix the typo, or add the URL to your inventory if it is real. Delete rows that no longer apply.",
  },
  {
    title: "Same source, different targets",
    what: "One old URL appears on several rows with different new URLs. A server can only send it one place.",
    fix: "Pick the right target and delete the other rows.",
  },
  {
    title: "Exact duplicate rows",
    what: "The same old and new URL pair appears more than once.",
    fix: "Keep one row. Duplicates make the map harder to review and to load into your server.",
  },
  {
    title: "Redirect chains",
    what: "The target of one row is the source of another, so A goes to B and B goes to C.",
    fix: "Change the first row to point at the final target. Then A goes straight to C.",
  },
  {
    title: "Loops and self-redirects",
    what: "A goes to B and B goes back to A, or a URL redirects to itself. Browsers give up and show an error.",
    fix: "Decide which URL is the real destination and make that one a normal page. Remove the row that points back.",
  },
  {
    title: "Targets receiving many redirects",
    what: "One target takes 10 or more sources and more than 10 per cent of the map, or the homepage takes more than one.",
    fix: "Check these are deliberate. Many pages with no close match can reasonably go to a category page. A page with a close match should go to that match.",
  },
  {
    title: "Targets not found in the new URL list",
    what: "A target is missing from the list of new site URLs you supplied. It may be a typo or a page that is not built yet.",
    fix: "Correct the target or build the page. Only runs when you add the new URL list.",
  },
  {
    title: "Malformed lines",
    what: "A line has no target, no source, or text that is not a URL or a path starting with a slash.",
    fix: "Fix the line in your spreadsheet and run the check again. Malformed lines are left out of every other check.",
  },
  {
    title: "Advisories",
    what: "A URL matches a listed URL only when I ignore a trailing slash, http versus https, or www versus non-www.",
    fix: "Write the map using the exact form your server uses, so each rule matches without help.",
  },
];

export default function RedirectMapCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }} />
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Free SEO tool</p>
          <h1
            className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Redirect Map Checker
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground">
            Paste your old URLs and your redirect map to find what is wrong with the map before launch.
          </p>
        </div>

        <RedirectMapChecker />

        <div className="mt-12 max-w-3xl space-y-12 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className={h2}>What a redirect map is</h2>
            <p>
              A redirect map is a list that pairs every old URL with the new URL that should replace it. You build it
              before a migration, then your developer turns it into server rules. A permanent redirect such as a 301
              tells browsers and search engines that the page has moved for good. Google recommends{" "}
              <a
                className={linkClass}
                href="https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes"
                target="_blank"
                rel="noopener noreferrer"
              >
                mapping old URLs to new URLs and using server-side permanent redirects
              </a>{" "}
              when URLs change.
            </p>
            <p className="mt-3">
              Mistakes in the map are cheap to fix in a spreadsheet and costly to fix after launch. This tool reads your
              lists and shows the mistakes it can find. If you want a person to own the whole move, see my{" "}
              <Link className={linkClass} href="/services/seo-migration-consultant/">
                SEO migration consultant
              </Link>{" "}
              service.
            </p>
          </section>

          <section>
            <h2 className={h2}>What each check means and how to fix it</h2>
            <ul className="space-y-5">
              {checks.map((c) => (
                <li key={c.title}>
                  <h3 className={h3}>{c.title}</h3>
                  <p className="mt-1">{c.what}</p>
                  <p className="mt-1">
                    <span className="font-medium text-foreground">Fix:</span> {c.fix}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={h2}>How I compare URLs</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>I trim spaces from every line.</li>
              <li>I treat the scheme and the domain as case-insensitive. I keep the case of the path.</li>
              <li>
                A trailing slash difference counts as the same URL for matching. I report it as an advisory so you can
                make the map consistent.
              </li>
              <li>I ignore anything after a # fragment.</li>
              <li>I keep query strings, so /page?id=1 and /page?id=2 are different URLs.</li>
              <li>
                http versus https and www versus non-www count as the same page when I match your lists, and I report the
                difference as an advisory. I still treat them as different URLs when I look for chains and loops.
              </li>
              <li>
                Paths that start with a slash are allowed. If your lists mix full URLs and paths, I compare path and query
                only and say so in the report.
              </li>
              <li>
                A map line can separate the two URLs with a comma, a tab, or an arrow written as -&gt; or =&gt;. Quoted
                CSV cells, a header row, blank lines and Windows line endings are fine. If a line has more than two
                columns, I use the first two.
              </li>
            </ul>
          </section>

          <section>
            <h2 className={h2}>How I use this on a migration</h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Build the old URL list from a crawl, the sitemap, analytics and Search Console, then remove repeats.</li>
              <li>Write the map in a spreadsheet, one row per old URL, matching each to the closest new page.</li>
              <li>Export the map and the old list and run this check. Fix every missing row, loop and conflict.</li>
              <li>Add the list of new URLs from staging and run it again to catch targets that do not exist.</li>
              <li>Review the many-to-one results with the page owners and agree which are deliberate.</li>
              <li>After launch, test the live redirects. This tool cannot do that part.</li>
            </ol>
          </section>

          <section>
            <h2 className={h2}>What this tool does not do</h2>
            <p>
              It checks the map you paste, in your browser. It does not request your old or new URLs, so it cannot tell
              you a status code or whether a page loads. To test what a live URL returns, use the{" "}
              <Link className={linkClass} href="/tools/redirect-checker/">
                redirect chain checker
              </Link>
              . A clean report means the map is consistent with your lists. It does not prove the redirects are live.
            </p>
          </section>
        </div>

        <ToolNextStep
          lead="Planning a migration and want the map reviewed by a person? Book a"
          href="/contact/"
          label="free 20-minute diagnosis"
        />
      </div>
      <RelatedTools currentHref="/tools/redirect-map-checker/" />
      <Footer />
    </main>
  );
}
