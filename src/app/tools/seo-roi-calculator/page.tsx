import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import SeoRoiCalculator from "./SeoRoiCalculator";

export function generateMetadata() {
  return {
    title: "Free SEO ROI Calculator | Forecast Traffic, Leads & Revenue | Sunny Patel",
    description:
      "Estimate the ROI of an SEO campaign from one keyword. Enter search volume, current and target ranking, conversion rate, and deal value to project clicks, leads, revenue, payback, and first-year return.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/seo-roi-calculator/" },
  };
}

const faqs = [
  {
    q: "How is SEO ROI calculated?",
    a: "SEO ROI is your net return divided by your SEO cost. This calculator multiplies keyword search volume by the organic click-through rate for a ranking position, applies your conversion rate and deal value to get revenue, then compares first-year revenue against first-year SEO cost: ROI = (revenue minus cost) / cost.",
  },
  {
    q: "What is a good click-through rate by Google position?",
    a: "Aggregated organic click-through rates are roughly 27% at position 1, 16% at position 2, 11% at position 3, falling to around 2% at position 10. Click-through rate drops sharply below the top three, which is why ranking gains there drive most of the revenue.",
  },
  {
    q: "What is a good ROI for SEO?",
    a: "SEO is a compounding channel, so first-year ROI is often modest while rankings ramp, then improves as traffic holds without ongoing media spend. A campaign that pays back within 6 to 12 months and returns positive in year one is generally considered healthy.",
  },
  {
    q: "Is this SEO ROI estimate accurate?",
    a: "It is a directional forecast, not a guarantee. Real click-through rate varies with SERP features, brand strength, and search intent, and rankings rarely improve in a straight line. Use it to sanity-check whether a keyword is worth investing in.",
  },
];

export default function SeoRoiCalculatorPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SEO ROI Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://sunnypatel.co.uk/tools/seo-roi-calculator/",
    description:
      "Free SEO ROI calculator that forecasts clicks, leads, revenue, payback, and first-year return from a keyword's search volume and target ranking position.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    author: { "@type": "Person", name: "Sunny Patel", url: "https://sunnypatel.co.uk/" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <div id="main-content" tabIndex={-1} />
      <div className="pt-24 pb-16">
        <SeoRoiCalculator />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2
              className="text-xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{f.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
