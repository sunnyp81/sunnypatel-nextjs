import { buildMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/sections/navbar";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export function generateMetadata() {
  return buildMetadata({
    title: "Contact Sunny Patel | Free SEO Consultation | Reading, Berkshire",
    description: "Book a free 30-minute SEO consultation with Sunny Patel. Based in Reading, Berkshire. Response within 24 hours. No obligation.",
    path: "/contact",
  });
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden pb-4 pt-32">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #4c7894, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#4c7894]">
            Contact
          </p>
          <h1
            className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Let&apos;s Work Together
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Book a free 30-minute consultation. No obligation — just honest advice on where your SEO stands.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
