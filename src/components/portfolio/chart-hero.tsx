"use client";

import { motion } from "motion/react";

const tagColorMap: Array<{ test: RegExp; color: string; secondary: string }> = [
  { test: /health|medical|aesthet|care/i, color: "#5B8AEF", secondary: "#4c7894" },
  { test: /design|brand|creative/i,       color: "#d79f1e", secondary: "#5B8AEF" },
  { test: /dev|code|tech|software/i,      color: "#4c7894", secondary: "#5a922c" },
  { test: /seo|content|search|organic/i,  color: "#5a922c", secondary: "#4c7894" },
  { test: /legal|law|finance/i,           color: "#8b5cf6", secondary: "#5B8AEF" },
];

function getColors(tags: readonly string[], industry?: string | null) {
  const haystack = [...(tags ?? []), industry ?? ""].join(" ");
  for (const entry of tagColorMap) {
    if (entry.test.test(haystack)) return entry;
  }
  return { color: "#5B8AEF", secondary: "#4c7894" };
}

type Metric = { readonly value: string; readonly label: string };

// Upward-trending chart path with realistic variance (viewBox 0 0 400 160)
const LINE_PATH =
  "M 0 130 C 30 128, 55 138, 85 118 C 115 98, 135 108, 165 88 C 195 68, 215 76, 248 52 C 281 28, 300 38, 330 18 C 355 4, 375 8, 400 2";
const AREA_PATH = `${LINE_PATH} L 400 160 L 0 160 Z`;

export function ChartHero({
  tags,
  industry,
  metrics,
}: {
  tags?: readonly string[] | null;
  industry?: string | null;
  metrics?: readonly Metric[] | null;
}) {
  const { color, secondary } = getColors(tags ?? [], industry);
  const fillId = `chart-fill-${color.replace("#", "")}`;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-2 pt-6">
      <motion.div
        className="relative h-52 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#050507]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 75% 85%, ${color}25, transparent 55%)`,
          }}
        />

        {/* SVG chart */}
        <svg
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id="chart-glow" x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area fill — static, fades in with parent */}
          <path d={AREA_PATH} fill={`url(#${fillId})`} />

          {/* Animated line draw */}
          <motion.path
            d={LINE_PATH}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#chart-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
          />

          {/* Endpoint pulse dot */}
          <motion.circle
            cx="400"
            cy="2"
            r="4"
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ duration: 0.3, delay: 1.9 }}
          />
          <motion.circle
            cx="400"
            cy="2"
            r="10"
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 0.25, 0] }}
            transition={{ duration: 0.8, delay: 1.9 }}
          />
        </svg>

        {/* Primary metric — left */}
        {metrics && metrics.length > 0 && (
          <motion.div
            className="absolute left-6 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div
              className="text-4xl font-bold md:text-5xl"
              style={{
                fontFamily: "var(--font-heading)",
                color,
                letterSpacing: "-0.03em",
              }}
            >
              {metrics[0].value}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {metrics[0].label}
            </div>
          </motion.div>
        )}

        {/* Secondary metric — right */}
        {metrics && metrics.length > 1 && (
          <motion.div
            className="absolute right-6 top-1/2 -translate-y-1/2 text-right"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div
              className="text-2xl font-bold md:text-3xl"
              style={{
                fontFamily: "var(--font-heading)",
                color: secondary,
                letterSpacing: "-0.03em",
              }}
            >
              {metrics[1].value}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {metrics[1].label}
            </div>
          </motion.div>
        )}

        {/* Subtle corner label */}
        <div className="absolute bottom-3 right-4 text-[9px] font-semibold uppercase tracking-widest text-white/20">
          Results
        </div>
      </motion.div>
    </div>
  );
}
