import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ToolNextStep } from "@/components/tool-next-step";
import { RelatedTools } from "@/components/related-tools";
import SslChecker from "./SslChecker";

export function generateMetadata() {
  return {
    title: "SSL Certificate Checker | HTTPS Security Test",
    description: "Check your SSL certificate status, expiry date, issuer, and chain validity. HTTPS is a Google ranking signal: make sure your certificate is valid.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/ssl-checker/" },
  };
}

export default function SslCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <SslChecker />
        <ToolNextStep lead="Want a second pair of eyes on your site setup? Book a" href="/contact/" label="free 20-minute diagnosis" />
      </div>
      <RelatedTools currentHref="/tools/ssl-checker/" />
      <Footer />
    </main>
  );
}
