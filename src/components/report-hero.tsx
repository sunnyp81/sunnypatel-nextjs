import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import styles from "./seo-companies-guide.module.css";

export function ReportHero({
  title,
  eyebrow,
  dek,
  intro,
  primaryCta,
  secondaryCta,
  heroImage,
  heroImageAlt,
  heroCaption,
  publishedDate,
  publishedLabel,
  updatedDate,
  updatedLabel,
  disclosure,
  children,
}: {
  title: string;
  eyebrow: string;
  dek: string;
  intro?: ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  heroImage?: string;
  heroImageAlt?: string;
  heroCaption?: string;
  publishedDate?: string;
  publishedLabel?: string;
  updatedDate?: string;
  updatedLabel?: string;
  disclosure?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.guide}>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <header className={styles.hero}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog/">Blog</Link>
            <span>/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1>{title}</h1>
              <p className={styles.dek}>{dek}</p>
              {intro ? <p>{intro}</p> : null}
              {primaryCta || secondaryCta ? (
                <div className={styles.actions}>
                  {primaryCta ? (
                    <a className={styles.primary} href={primaryCta.href}>
                      {primaryCta.label}
                    </a>
                  ) : null}
                  {secondaryCta ? (
                    <a className={styles.textLink} href={secondaryCta.href}>
                      {secondaryCta.label}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
            {heroImage ? (
              <figure className={styles.heroFigure}>
                <Image
                  src={heroImage}
                  width={1600}
                  height={900}
                  sizes="(max-width: 800px) 100vw, 480px"
                  alt={heroImageAlt || ""}
                  priority
                />
                {heroCaption ? <figcaption>{heroCaption}</figcaption> : null}
              </figure>
            ) : null}
          </div>
          {publishedDate || updatedDate ? (
            <div className={styles.byline}>
              <Link href="/author/sunny-patel/">By Sunny Patel, SEO consultant</Link>
              {publishedDate ? (
                <span>
                  {publishedLabel || "Published"} <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
                </span>
              ) : null}
              {updatedDate ? (
                <span>
                  {updatedLabel || "Updated"} <time dateTime={updatedDate}>{formatDate(updatedDate)}</time>
                </span>
              ) : null}
            </div>
          ) : null}
          {disclosure ? <p className={styles.disclosure}>{disclosure}</p> : null}
        </header>
        <div className={styles.layout}>
          <div className={styles.body} style={{ gridColumn: "1 / -1" }}>
            <div className={styles.article}>{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
