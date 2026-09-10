"use client";

import Link from "next/link";
import { motion } from "motion/react";

type ProofData = {
  updatedAt: string;
  clicks: number;
  impressions: number;
  rankings: { query: string; position: number }[];
  weeklyClicks: { weekStart: string; clicks: number }[];
};

function ClicksTrend({ values }: { values: number[] }) {
  const width = 640;
  const height = 160;
  const padX = 12;
  const padTop = 28;
  const padBottom = 24;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);

  const points = values.map((value, i) => ({
    x: padX + (i / Math.max(values.length - 1, 1)) * (width - padX * 2),
    y: height - padBottom - ((value - min) / range) * (height - padTop - padBottom),
    value,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Weekly Google clicks: ${values.join(", ")}`}
      className="w-full"
    >
      <title>Weekly clicks from Google Search Console</title>
      <line
        x1={padX}
        y1={height - padBottom}
        x2={width - padX}
        y2={height - padBottom}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />
      <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={`${i}-${p.value}`}>
          <circle cx={p.x} cy={p.y} r={4} fill="var(--color-brand)" />
          <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-white/50 text-[10px]">
            {p.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function LiveProof({ proof }: { proof: ProofData }) {
  const updated = new Date(`${proof.updatedAt}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden border-t border-white/[0.05] bg-[#050507] py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-brand opacity-[0.04] blur-[100px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
              This Website · Google Search Console
            </p>
            <h2
              className="text-2xl font-bold text-foreground md:text-3xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
            >
              The work stays measurable, live
            </h2>
          </div>
          <Link
            href="/proof/"
            className="whitespace-nowrap text-sm text-brand transition-colors hover:text-white"
          >
            Experiment log →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.08] bg-black/20 p-6 backdrop-blur-sm sm:p-8"
        >
          <div className="mb-6 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <div>
              <strong className="text-2xl font-bold text-foreground">{proof.clicks}</strong>
              <span className="ml-2 text-sm text-muted-foreground">clicks · last 28 days</span>
            </div>
            <div>
              <strong className="text-2xl font-bold text-foreground">
                {proof.impressions.toLocaleString("en-GB")}
              </strong>
              <span className="ml-2 text-sm text-muted-foreground">impressions · last 28 days</span>
            </div>
          </div>

          <ClicksTrend values={proof.weeklyClicks.map((w) => w.clicks)} />

          <p className="mt-2 text-xs text-white/40">
            Source data refreshed {updated}. Transparent test-site snapshot, not a client
            performance claim.
          </p>

          <div className="mt-6 divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {proof.rankings.slice(0, 4).map((ranking) => (
              <div key={ranking.query} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-white/70">{ranking.query}</span>
                <strong className="text-foreground">Position {ranking.position.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
