import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { RelatedTools } from "@/components/related-tools";
import { faqSchema, schemaGraph, breadcrumbSchema } from "@/lib/schema";
import ChatgptCheckForm from "./ChatgptCheckForm";

export function generateMetadata() {
  return buildMetadata({
    title: "Free ChatGPT Check: Does It Recommend Your Business?",
    description:
      "Free check for UK businesses. I ask ChatGPT three of your buyers' questions and email you who it names and cites. Results within one working day.",
    path: "/tools/chatgpt-visibility-check",
  });
}

const FAQS = [
  {
    q: "Is the check really free?",
    a: "Yes. The check is free with one check per business. I run it myself so I can show you how the paid audit works.",
  },
  {
    q: "Why do you run it by hand?",
    a: "I ask ChatGPT signed out in a new chat. That is close to what a new buyer sees. Automated tools use the API instead and the answers can differ from the ChatGPT app.",
  },
  {
    q: "How accurate is one run?",
    a: "One run is a snapshot. ChatGPT gives different answers to the same question on different days. The £795 audit asks 20 questions three times each to show the pattern.",
  },
  {
    q: "What do you do with my email?",
    a: "I use your email to send the results and to answer your questions about them. I do not add you to a mailing list.",
  },
];

const SCHEMA = schemaGraph(
  faqSchema(FAQS),
  breadcrumbSchema([
    { name: "Home", url: "https://sunnypatel.co.uk/" },
    { name: "Tools", url: "https://sunnypatel.co.uk/tools/" },
    { name: "Free ChatGPT Check", url: "https://sunnypatel.co.uk/tools/chatgpt-visibility-check/" },
  ])
);

const H2 = { fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" } as const;

export default function ChatgptVisibilityCheckPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
      <main className="relative min-h-screen bg-background">
        <Navbar />
        <div id="main-content" tabIndex={-1} />

        <div className="relative overflow-hidden pb-10 pt-28">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
            style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
          />
          <div className="relative z-10 mx-auto max-w-5xl px-6">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools/" }, { label: "Free ChatGPT Check" }]} />
            <h1
              className="mt-4 text-3xl font-bold text-foreground md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Does ChatGPT recommend your business?
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              I ask ChatGPT three questions your buyers ask. You get an email within one working day showing who it names and which websites it cites. The check is free.
            </p>
            <div className="mt-8 rounded-2xl border border-hairline bg-background p-5 shadow-sm dark:border-white/[0.08] md:p-8">
              <ChatgptCheckForm />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-16">
          <section className="mb-14">
            <h2 className="mb-4 text-2xl font-bold text-foreground" style={H2}>What your email shows</h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
              <li>The full ChatGPT answer to each of the three questions</li>
              <li>Whether your business is named in each answer</li>
              <li>Whether ChatGPT cites your website as a source</li>
              <li>The businesses and websites ChatGPT names instead</li>
              <li>One fix I would look at first</li>
            </ul>
          </section>

          <section className="mb-14">
            <h2 className="mb-4 text-2xl font-bold text-foreground" style={H2}>How I run the check</h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>I open ChatGPT signed out in a new chat for each question. I use a UK connection and the default settings. I ask each question once and copy the answer and its sources exactly.</p>
              <p>A signed-out answer has no chat history or saved memory. Your buyers may see different answers when signed in.</p>
            </div>
          </section>

          <section className="mb-14 rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/[0.08] to-brand-deep/[0.04] p-6 md:p-8">
            <h2 className="mb-3 text-xl font-bold text-foreground" style={H2}>See the full pattern for £795</h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              The AI Visibility Audit asks ChatGPT 20 of your buyers&apos; questions three times each. It shows where you appear beside two competitors and ranks the ten fixes most likely to help.
            </p>
            <Link
              href="/ai-visibility/"
              data-cta-location="chatgpt_check_page"
              data-cta-offer="ai_visibility_audit"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02]"
              style={{ fontFamily: "var(--font-heading)", background: "linear-gradient(135deg, #2a5bd7 0%, #234bb8 100%)" }}
            >
              See the £795 AI Visibility Audit
            </Link>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-foreground" style={H2}>Frequently asked questions</h2>
            <div className="divide-y divide-hairline dark:divide-white/[0.08]">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group py-4">
                  <summary className="cursor-pointer list-none text-base font-semibold text-foreground">{q}</summary>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <RelatedTools currentHref="/tools/chatgpt-visibility-check/" />
        <Footer />
      </main>
    </>
  );
}
