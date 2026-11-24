import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import OgPreview from "./OgPreview";
import { ToolExplainer, ExplainerLink } from "@/components/tool-explainer";

export function generateMetadata() {
  return {
    title: "Open Graph Preview Tool | See How Links Look on Social Media",
    description: "Preview how your URL appears when shared on Facebook, Twitter/X, and LinkedIn. Check Open Graph tags, Twitter Cards, and fix social sharing issues.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/og-preview/" },
  };
}

export default function OgPreviewPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <OgPreview />
        <ToolExplainer
          does={
            <>
              <p>It shows how a page may look when shared on Facebook, X and LinkedIn, and lists the title, description, Open Graph and Twitter Card tags it found. When you press Preview, your address is sent to my server. The server requests that page once, follows redirects, waits up to 10 seconds and reads the HTML it gets back. It does not run the page&apos;s JavaScript, so tags added only by scripts will not appear.</p>
              <p>The three preview cards are my own drawings built from the tags. X uses its own tags first and falls back to the Open Graph ones. If no card type is set, I draw the large image card. The tag table marks og:title, og:description and og:image as critical and the rest as optional. The Open Graph protocol itself lists four required properties: og:title, og:type, og:image and og:url (<ExplainerLink href="https://ogp.me/" external>ogp.me</ExplainerLink>, read 24 November 2026).</p>
            </>
          }
          steps={[
            "Type or paste the full address of one public page.",
            "Press Preview and wait for the three cards and the tag table.",
            "Look for red crosses on og:title, og:description and og:image, then amber warnings on the other tags.",
            "Fix the tags in your page template, publish, and run the same address again.",
          ]}
          limits={
            <>
              <p>The previews are approximations, not what each platform will render. Platforms may also keep an older copy of your tags, and this tool cannot clear that copy. Use each platform&apos;s own debugger for that.</p>
              <p>It does not measure image width, height or file size. Your browser loads the image straight from its address, so a missing tag shows a grey placeholder and an image that fails to load may leave a blank space. It only reads HTML pages, and it reports an error for pages that return a failure status, take longer than 10 seconds, or are larger than 2 MB. To see how the same page may look in search results, use the <ExplainerLink href="/tools/serp-preview/">SERP preview tool</ExplainerLink>.</p>
              <p>The server route does not save the address you enter.</p>
            </>
          }
          faqs={[
            { q: "Why does my preview look different on the platform?", a: "My cards are drawn from your tags and may not match each platform's layout. A platform may also be showing an older copy of your tags." },
            { q: "Why is my image missing?", a: "The og:image tag is missing, or the image address failed to load in your browser. Check that it is a full address that opens on its own." },
            { q: "Does it fix the tags for me?", a: "No. It reads and shows them. You change them in your page template or CMS." },
          ]}
        />
        <ToolNextStep lead="Want a second pair of eyes on how your pages look when shared? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/og-preview/" />
      <Footer />
    </main>
  );
}
