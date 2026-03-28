import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <div className="relative overflow-hidden pb-12 pt-40">
        {/* Blue glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
            404
          </p>
          <h1
            className="text-4xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Page not found
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Go Home
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View Services
            </Link>
            <Link
              href="/blog/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Read Blog
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
