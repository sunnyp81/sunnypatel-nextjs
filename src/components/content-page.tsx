import React from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { BlogStickyCta } from "@/components/blog-sticky-cta";
import { HumanEditedBadge } from "@/components/human-edited-badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { slugifyTag } from "@/lib/utils";

function AuthorByline() {
  return (
    <Link
      href="/author/sunny-patel"
      className="mt-5 inline-flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 transition-colors duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10">
        <Image
          src="/images/sunny-patel.jpg"
          alt="Sunny Patel"
          fill
          className="object-cover"
          sizes="32px"
        />
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold text-foreground">Sunny Patel</p>
        <p className="text-xs text-muted-foreground">SEO Consultant & AI Strategist</p>
      </div>
    </Link>
  );
}

const PROSE_CLASS =
  "prose prose-invert prose-lg max-w-none prose-headings:font-[var(--font-heading)] prose-headings:tracking-tight prose-a:text-[#5B8AEF] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:rounded prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[#5B8AEF] prose-blockquote:border-l-[#5B8AEF]/40 prose-blockquote:text-muted-foreground prose-hr:border-white/[0.08]";

export function ContentPage({
  h1,
  subtitle,
  badge,
  backHref,
  backLabel = "Back",
  dateLine,
  tags,
  heroImage,
  showCta = false,
  isBlog = false,
  afterContent,
  sections,
  children,
}: {
  h1: string;
  subtitle?: string;
  badge?: string;
  backHref?: string;
  backLabel?: string;
  dateLine?: string;
  tags?: string[];
  heroImage?: string;
  showCta?: boolean;
  isBlog?: boolean;
  afterContent?: React.ReactNode;
  sections?: Array<{ content: React.ReactNode; after?: React.ReactNode }>;
  children?: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden pb-12 pt-32">
        {/* Blue glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        {/* Dot grid */}
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

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          {backHref && (
            <Link
              href={backHref}
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </Link>
          )}

          {badge && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
              {badge}
            </p>
          )}

          <h1
            className="text-3xl font-bold text-foreground md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            {h1}
          </h1>

          {subtitle && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}

          {(dateLine || (tags && tags.length > 0)) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {dateLine && (
                <span className="text-sm text-muted-foreground/70">{dateLine}</span>
              )}
              {dateLine && tags && tags.length > 0 && (
                <span className="text-muted-foreground/30">|</span>
              )}
              {tags?.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${slugifyTag(tag)}`}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-[#5B8AEF]/20 hover:text-[#5B8AEF]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {isBlog && (
            <div className="mt-4">
              <HumanEditedBadge />
            </div>
          )}

          {isBlog && <AuthorByline />}
        </div>

        {/* Separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* Hero image */}
      {heroImage && (
        <div className="mx-auto max-w-4xl px-6 -mt-2 mb-4">
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-white/[0.06]">
            <Image
              src={heroImage}
              alt={h1}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative overflow-hidden">
        {/* Blog background decorations */}
        {isBlog && (
          <>
            {/* Side glow accents */}
            <div
              className="pointer-events-none absolute -left-32 top-[20%] h-[500px] w-[400px] rounded-full opacity-[0.025] blur-[100px]"
              style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute -right-32 top-[50%] h-[400px] w-[350px] rounded-full opacity-[0.02] blur-[100px]"
              style={{ background: "radial-gradient(circle, #4c7894, transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute -left-20 top-[75%] h-[300px] w-[300px] rounded-full opacity-[0.02] blur-[80px]"
              style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
            />
            {/* Subtle dot grid that fades in/out */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(91,138,239,0.15) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage:
                  "linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)",
              }}
            />
          </>
        )}

        <div className="relative mx-auto max-w-3xl px-6 py-16">
          {sections ? (
            sections.map((section, i) => (
              <React.Fragment key={i}>
                <div className={PROSE_CLASS}>{section.content}</div>
                {section.after && (
                  <div className="my-10">{section.after}</div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className={PROSE_CLASS}>{children}</div>
          )}
        </div>
      </div>

      {/* Related content */}
      {afterContent}

      {/* Sticky blog CTA */}
      {isBlog && <BlogStickyCta />}

      {/* Optional CTA */}
      {showCta && (
        <div className="border-t border-white/[0.05]">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#5B8AEF]">
              Get Started
            </p>
            <h2
              className="mb-4 text-2xl font-bold text-foreground md:text-3xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              Ready to grow your organic traffic?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">
              Book a free 30-minute consultation. No obligation — just honest
              advice on where your SEO stands and what to do next.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Book Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
