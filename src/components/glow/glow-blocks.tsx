import React from "react";
import { GlowCard } from "@/components/ui/glow-card";
import styles from "./glow.module.css";
import { GlowChart, type GlowChartProps } from "./glow-chart";

export function GlowPullquote({ cite, children }: { cite?: string; children?: React.ReactNode }) {
  return (
    <GlowCard className={`not-prose ${styles.figure}`}>
      <figure className={`${styles.inner} ${styles.quote}`}>
        <span className={styles.tube} aria-hidden="true" />
        <div>
          <blockquote className={styles.quoteText}>{children}</blockquote>
          {cite ? <figcaption className={styles.cite}>{cite}</figcaption> : null}
        </div>
      </figure>
    </GlowCard>
  );
}

export function GlowStat({ value, label, source }: { value: string; label: string; source?: string }) {
  return (
    <GlowCard className={`not-prose ${styles.figure}`}>
      <figure className={styles.inner}>
        <span className={styles.statValue} data-size={value.length > 11 ? "s" : value.length > 7 ? "m" : undefined}>
          {value}
        </span>
        <p className={styles.statLabel}>{label}</p>
        {source ? <figcaption className={styles.source}>Source: {source}</figcaption> : null}
      </figure>
    </GlowCard>
  );
}

export function GlowStatRow({ children }: { children?: React.ReactNode }) {
  const count = React.Children.toArray(children).filter(React.isValidElement).length;
  return (
    <div className={`not-prose ${styles.statRow}`} data-count={Math.min(count, 3)}>
      {children}
    </div>
  );
}

export function GlowChartFigure(props: GlowChartProps) {
  return (
    <GlowCard className={`not-prose ${styles.figure}`}>
      <figure className={styles.inner}>
        {props.eyebrow ? <p className={styles.eyebrow}>{props.eyebrow}</p> : null}
        <figcaption className={styles.title}>{props.title}</figcaption>
        <GlowChart {...props} />
        {props.source ? <p className={styles.source}>Source: {props.source}</p> : null}
      </figure>
    </GlowCard>
  );
}

export function GlowPanel({
  eyebrow,
  title,
  tone,
  children,
}: {
  eyebrow?: string;
  title?: string;
  tone?: "good" | "bad";
  children?: React.ReactNode;
}) {
  return (
    <GlowCard className={`not-prose ${styles.figure}`}>
      <section className={`${styles.inner} ${styles.panel}`} data-tone={tone}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.panelBody}>{children}</div>
      </section>
    </GlowCard>
  );
}

export function GlowPanelRow({ children }: { children?: React.ReactNode }) {
  const count = React.Children.toArray(children).filter(React.isValidElement).length;
  return (
    <div className={`not-prose ${styles.statRow}`} data-count={Math.min(count, 3)}>
      {children}
    </div>
  );
}
