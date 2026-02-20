import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export function generateMetadata() {
  return buildMetadata({
    title: "Contact | Sunny Patel – SEO Consultant Reading",
    description: "Get in touch for a free SEO consultation. Based in Reading, Berkshire. Response within 24 hours.",
    path: "/contact",
  });
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
