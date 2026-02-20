import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";

export function ContentPage({
  h1,
  subtitle,
  children,
}: {
  h1: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <h1
            className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.03em",
            }}
          >
            {h1}
          </h1>
          {subtitle && (
            <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-[var(--font-heading)] prose-headings:tracking-tight prose-a:text-[#5B8AEF] prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
