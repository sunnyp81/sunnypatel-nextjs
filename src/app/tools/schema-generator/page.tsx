import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import SchemaGenerator from "./SchemaGenerator";

export function generateMetadata() {
  return {
    title: "Free Schema Markup Generator | JSON-LD Structured Data | Sunny Patel",
    description: "Generate valid JSON-LD schema markup for FAQ, Article, LocalBusiness, Product, and more. Copy-paste ready structured data for Google rich results.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/schema-generator/" },
  };
}

export default function SchemaGeneratorPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <SchemaGenerator />
      </div>
      <Footer />
    </main>
  );
}
