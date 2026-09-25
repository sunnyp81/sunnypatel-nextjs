import React from "react";
import { KeyStatsStrip } from "@/components/key-stats-strip";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { BlogStickyCta } from "@/components/blog-sticky-cta";
import { HumanEditedBadge } from "@/components/human-edited-badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { ServiceInlineForm } from "@/components/service-inline-form";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Shield, Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { BlogTOC } from "@/components/blog-toc";
import { slugifyTag } from "@/lib/utils";

function AuthorByline() {
  return (
    <Link
      href="/author/sunny-patel/"
      className="mt-5 inline-flex items-center gap-3 rounded-xl border border-hairline bg-wash px-4 py-2.5 transition-colors duration-200 hover:border-hairline-strong hover:bg-hairline"
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-hairline-strong">
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
  "prose dark:prose-invert prose-lg max-w-none prose-headings:font-[var(--font-heading)] prose-headings:tracking-tight prose-a:text-brand-ink prose-a:underline prose-a:decoration-brand-ink/30 prose-a:underline-offset-2 hover:prose-a:decoration-brand-ink dark:prose-a:no-underline dark:hover:prose-a:underline prose-strong:text-foreground prose-code:rounded prose-code:bg-wash prose-code:px-1.5 prose-code:py-0.5 prose-code:text-brand-ink prose-blockquote:border-l-gold/40 prose-blockquote:text-muted-foreground prose-hr:border-hairline";

const TRUST_BADGES = [
  { icon: CalendarDays, label: "15+ years experience" },
  { icon: Sparkles,     label: "Free 20-minute diagnosis" },
  { icon: Shield,       label: "No contracts"         },
] as const;

export function ContentPage({
  h1,
  subtitle,
  badge,
  backHref,
  backLabel = "Back",
  dateLine,
  tags,
  heroImage,
  keyStats,
  keyStatsJumpHref,
  serviceHeroImage,
  serviceHeroImageAlt,
  showCta = false,
  showStickyCta = true,
  isService = false,
  isBlog = false,
  serviceHeaderBadges,
  serviceHeaderCtaHref = "/contact/",
  serviceHeaderCtaLabel = "Request Free Diagnosis",
  serviceHeaderCtaMeta = "20 minutes · No obligation",
  serviceHeaderCtaOffer = "free_20_minute_seo_diagnosis",
  ctaTitle,
  ctaSubtitle,
  afterContent,
  breadcrumbItems,
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
  keyStats?: readonly { value: string; label: string; source?: string }[];
  keyStatsJumpHref?: string;
  serviceHeroImage?: string;
  serviceHeroImageAlt?: string;
  showCta?: boolean;
  showStickyCta?: boolean;
  isService?: boolean;
  isBlog?: boolean;
  serviceHeaderBadges?: readonly string[];
  serviceHeaderCtaHref?: string;
  serviceHeaderCtaLabel?: string;
  serviceHeaderCtaMeta?: string;
  serviceHeaderCtaOffer?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  afterContent?: React.ReactNode;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  sections?: Array<{ content: React.ReactNode; after?: React.ReactNode }>;
  children?: React.ReactNode;
}) {
  const headerContent = (
    <>
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} />
      )}
      {!breadcrumbItems && backHref && (
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      )}

      {badge && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-ink">
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

      {/* ── Service page: trust badges + header CTA ── */}
      {isService && (
        <>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {(serviceHeaderBadges
              ? serviceHeaderBadges.map((label, i) => ({
                  label,
                  icon: TRUST_BADGES[i % TRUST_BADGES.length].icon,
                }))
              : TRUST_BADGES
            ).map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/[0.07] px-3 py-1.5 text-xs font-medium text-brand-ink"
              >
                <Icon className="h-3 w-3 shrink-0" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <GradientButton asChild>
              <Link href={serviceHeaderCtaHref} className="gap-2" data-cta-location="service_header" data-cta-offer={serviceHeaderCtaOffer}>
                {serviceHeaderCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </GradientButton>
            <span className="text-sm text-muted-foreground">
              {serviceHeaderCtaMeta}
            </span>
          </div>
        </>
      )}

      {(dateLine || (tags && tags.length > 0)) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {dateLine && (
            <span className="text-sm text-muted-foreground">{dateLine}</span>
          )}
          {dateLine && tags && tags.length > 0 && (
            <span className="text-muted-foreground">|</span>
          )}
          {tags?.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${slugifyTag(tag)}`}
              className="rounded-full border border-hairline bg-wash px-2.5 py-0.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-brand/20 hover:text-brand-ink"
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
    </>
  );

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <div id="main-content" tabIndex={-1} />

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="relative overflow-hidden pb-12 pt-32">
        {/* Blue glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
        />
        {/* Dot grid — dark: original white dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] dark:block hidden"
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
        {/* Dot grid — light: faint blueprint grid dots via themed token */}
        <div
          className="pointer-events-none absolute inset-0 dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />

        <div className={`relative z-10 mx-auto ${isService && serviceHeroImage ? "max-w-6xl" : "max-w-3xl"} px-6`}>
          {isService && serviceHeroImage ? (
            <div className="grid gap-8 md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] md:items-center md:gap-10">
              <div>{headerContent}</div>
              <div>
                <Image
                  src={serviceHeroImage}
                  alt={serviceHeroImageAlt || h1}
                  width={800}
                  height={450}
                  className="h-auto w-full rounded-2xl mix-blend-screen"
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
              </div>
            </div>
          ) : headerContent}
        </div>

        {/* Separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hairline-strong to-transparent" />
      </div>

      {/* Hero image */}
      {heroImage && (
        <div className="mx-auto max-w-4xl px-6 -mt-2 mb-4">
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-hairline">
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

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background decorations — blog and service pages */}
        {(isBlog || isService) && (
          <>
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
          </>
        )}
        {isBlog && (
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
        )}

        <div className={`relative mx-auto ${isService ? "max-w-4xl" : "max-w-3xl"} px-6 py-16`}>
          {keyStats?.length ? <KeyStatsStrip stats={keyStats} jumpHref={keyStatsJumpHref} /> : null}
          {sections ? (
            sections.map((section, i) => (
              <React.Fragment key={i}>
                <div className={isService ? `${PROSE_CLASS} prose-service` : PROSE_CLASS}>
                  {section.content}
                </div>
                {section.after && (
                  <div className={isService ? "my-14" : "my-10"}>{section.after}</div>
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

      {/* TOC — blog posts */}
      {isBlog && <BlogTOC />}

      {/* Sticky CTA — blogs and service pages */}
      {showStickyCta && (isBlog || isService) && <BlogStickyCta />}

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      {showCta && (
        isService ? (
          <ServiceInlineForm
            ctaTitle={ctaTitle}
            ctaSubtitle={ctaSubtitle}
          />
        ) : (
          <div className="relative overflow-hidden border-t border-hairline">
            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.07] blur-[80px]"
              style={{ background: "radial-gradient(circle, #5B8AEF, transparent 70%)" }}
            />

            <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-ink">
                Get Started
              </p>
              <h2
                className="mb-4 text-2xl font-bold text-foreground md:text-3xl"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
              >
                {ctaTitle ?? "Ready to grow your organic traffic?"}
              </h2>
              <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                {ctaSubtitle ??
                  "Request a free 20-minute SEO diagnosis: focus on the biggest issue and the most useful next step."}
              </p>

              <Link
                href="/contact/"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Request Free Diagnosis
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Trust micro-copy */}
              <div className="mt-7 flex flex-wrap justify-center gap-5">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Icon className="h-3 w-3 text-brand-ink/50" />
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Usually responds within a few hours
              </p>
            </div>
          </div>
        )
      )}

      <Footer />
    </main>
  );
}
