import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import SslChecker from "./SslChecker";

export function generateMetadata() {
  return {
    title: "SSL Certificate Checker | HTTPS Security Test | Sunny Patel",
    description: "Check your SSL certificate status, expiry date, issuer, and chain validity. HTTPS is a Google ranking signal — make sure your certificate is valid.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/ssl-checker/" },
  };
}

export default function SslCheckerPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <SslChecker />
      </div>
      <Footer />
    </main>
  );
}
