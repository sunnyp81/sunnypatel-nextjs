"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./glow.module.css";

type Point = { label: string; raw: string; value: number };

export type GlowChartProps = {
  type?: "bar" | "line" | "donut";
  title: string;
  data: string;
  source?: string;
  eyebrow?: string;
  prefix?: string;
  suffix?: string;
  highlight?: string;
  series?: string;
};

type Row = { label: string; raws: string[]; values: number[] };

const BLUE = "#5B8AEF";
const GOLD = "#D79F1E";
const SERIES_COLOURS = ["#5B8AEF", "#D79F1E", "#8FB0F5"];
const DONUT_COLOURS = [
  "#5B8AEF",
  "#D79F1E",
  "#4C7894",
  "#8FB0F5",
  "#9A7420",
  "#5A922C",
  "#B4B4BC",
];

function parseData(data: string): Point[] {
  return data
    .split("|")
    .map((pair) => {
      const i = pair.lastIndexOf(":");
      const label = pair.slice(0, i).trim();
      const raw = pair.slice(i + 1).trim();
      return { label, raw, value: Number(raw.replace(/,/g, "")) };
    })
    .filter((p) => p.label && Number.isFinite(p.value));
}

function parseRows(data: string): Row[] {
  return data
    .split("|")
    .map((pair) => {
      const i = pair.lastIndexOf(":");
      const label = pair.slice(0, i).trim();
      const raws = pair
        .slice(i + 1)
        .split(";")
        .map((r) => r.trim());
      return { label, raws, values: raws.map((r) => Number(r.replace(/,/g, ""))) };
    })
    .filter((r) => r.label && r.values.every((v) => Number.isFinite(v)));
}

function useReveal<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.classList.add(styles.pending);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          requestAnimationFrame(() => el.classList.remove(styles.pending));
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

function useWidth<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  fallback: number,
) {
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

function niceMax(max: number) {
  if (max <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * mag;
}

function fmtTick(v: number) {
  if (Math.abs(v) >= 1e9) return `${+(v / 1e9).toFixed(1)}bn`;
  if (Math.abs(v) >= 1e6) return `${+(v / 1e6).toFixed(1)}m`;
  if (Math.abs(v) >= 1e4) return `${+(v / 1e3).toFixed(1)}k`;
  return `${+v.toFixed(2)}`;
}

function useKeys(
  len: number,
  active: number | null,
  setActive: (i: number | null) => void,
) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActive(active === null ? 0 : Math.min(len - 1, active + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive(active === null ? len - 1 : Math.max(0, active - 1));
      } else if (e.key === "Escape") {
        setActive(null);
      }
    },
    [len, active, setActive],
  );
}

function BarChart({
  points,
  fmt,
  highlight,
}: {
  points: Point[];
  fmt: (p: Point) => string;
  highlight?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const onKey = useKeys(points.length, active, setActive);
  const max = Math.max(...points.map((p) => p.value));
  return (
    <div
      ref={ref}
      className={styles.chartWrap}
      tabIndex={0}
      role="group"
      aria-label="Bar chart, use arrow keys to read values"
      onKeyDown={onKey}
      onBlur={() => setActive(null)}
      onPointerLeave={() => setActive(null)}
    >
      <div style={{ display: "grid", gap: "0.9rem" }}>
        {points.map((p, i) => {
          const hi = highlight ? p.label === highlight : false;
          const isActive = active === i;
          const colour = hi ? GOLD : BLUE;
          return (
            <div
              key={p.label}
              onPointerEnter={() => setActive(i)}
              aria-hidden="true"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ fontSize: 14, color: "#EEEEEE", lineHeight: 1.35 }}
                >
                  {p.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: hi || isActive ? GOLD : "#EEEEEE",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(p)}
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className={`${styles.bar} ${active !== null && !isActive ? styles.dim : ""} ${
                    isActive ? (hi ? styles.litGold : styles.lit) : ""
                  }`}
                  style={{
                    height: "100%",
                    width: `${Math.max(1.5, (p.value / max) * 100)}%`,
                    borderRadius: 5,
                    background: hi
                      ? `linear-gradient(90deg, #9A7420, ${GOLD})`
                      : `linear-gradient(90deg, #3D6FE8, ${colour})`,
                    boxShadow: `0 0 10px ${hi ? "rgba(215,159,30,0.35)" : "rgba(91,138,239,0.35)"}`,
                    transitionDelay: `0ms, 0ms, ${i * 70}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {active !== null ? (
        <p className={styles.srOnly} aria-live="polite">
          {points[active].label}: {fmt(points[active])}
        </p>
      ) : null}
    </div>
  );
}

function LineChart({
  points,
  fmt,
  prefix,
  suffix,
}: {
  points: Point[];
  fmt: (p: Point) => string;
  prefix: string;
  suffix: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const width = useWidth(ref, 640);
  const onKey = useKeys(points.length, active, setActive);
  const gid = useId().replace(/:/g, "");

  const H = 260;
  const pad = { top: 16, right: 16, bottom: 34, left: 56 };
  const w = Math.max(200, width);
  const iw = w - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const minV = Math.min(0, ...points.map((p) => p.value));
  const maxV = niceMax(Math.max(...points.map((p) => p.value)));
  const x = (i: number) =>
    pad.left + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => pad.top + ih - ((v - minV) / (maxV - minV)) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => minV + t * (maxV - minV));

  const path = points
    .map(
      (p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`,
    )
    .join(" ");
  const area = `${path} L${x(points.length - 1).toFixed(1)},${y(minV)} L${x(0).toFixed(1)},${y(minV)} Z`;

  const lastIdx = points.length - 1;
  const extent = (i: number): [number, number] => {
    const tw = points[i].label.length * 7.2;
    if (i === 0) return [x(i), x(i) + tw];
    if (i === lastIdx) return [x(i) - tw, x(i)];
    return [x(i) - tw / 2, x(i) + tw / 2];
  };
  const shown = new Set<number>([lastIdx]);
  const lastLeft = extent(lastIdx)[0];
  let prevRight = -Infinity;
  points.forEach((_, i) => {
    if (i === lastIdx) return;
    const [l, r] = extent(i);
    if (l - prevRight >= 12 && lastLeft - r >= 12) {
      shown.add(i);
      prevRight = r;
    }
  });
  const showLabel = (i: number) => shown.has(i);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best = 0;
    let bestD = Infinity;
    points.forEach((_, i) => {
      const d = Math.abs(x(i) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  };

  return (
    <div
      ref={ref}
      className={styles.chartWrap}
      tabIndex={0}
      role="group"
      aria-label="Line chart, use arrow keys to read values"
      onKeyDown={onKey}
      onBlur={() => setActive(null)}
    >
      <svg
        className={styles.svg}
        width={w}
        height={H}
        viewBox={`0 0 ${w} ${H}`}
        aria-hidden="true"
        onPointerMove={onMove}
        onPointerLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={`${gid}-s`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={BLUE} />
            <stop offset="100%" stopColor={GOLD} />
          </linearGradient>
          <linearGradient id={`${gid}-a`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.22" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </linearGradient>
          <filter id={`${gid}-g`} filterUnits="userSpaceOnUse" x={0} y={0} width={w} height={H}>
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              x2={w - pad.right}
              y1={y(t)}
              y2={y(t)}
              stroke="rgba(255,255,255,0.08)"
            />
            <text
              className={styles.axisText}
              x={pad.left - 10}
              y={y(t) + 4}
              textAnchor="end"
            >
              {prefix}
              {fmtTick(t)}
              {suffix}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          showLabel(i) ? (
            <text
              key={p.label}
              className={styles.axisText}
              x={x(i)}
              y={H - 10}
              textAnchor={
                i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
              }
            >
              {p.label}
            </text>
          ) : null,
        )}
        <path className={styles.area} d={area} fill={`url(#${gid}-a)`} />
        <path
          className={styles.line}
          d={path}
          fill="none"
          stroke={`url(#${gid}-s)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${gid}-g)`}
          pathLength={1}
          strokeDasharray="1"
        />
        {points.map((p, i) => (
          <circle
            key={p.label}
            cx={x(i)}
            cy={y(p.value)}
            r={active === i ? 6 : 3.5}
            fill="#050507"
            stroke={i === points.length - 1 ? GOLD : BLUE}
            strokeWidth="2"
            className={styles.dot}
          />
        ))}
        {active !== null ? (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={pad.top}
            y2={pad.top + ih}
            stroke="rgba(215,159,30,0.5)"
            strokeDasharray="3 4"
          />
        ) : null}
      </svg>
      {active !== null ? (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(w - 70, Math.max(70, x(active))),
            top: y(points[active].value),
          }}
          aria-live="polite"
        >
          {points[active].label}
          <b>{fmt(points[active])}</b>
        </div>
      ) : null}
    </div>
  );
}

function DonutChart({
  points,
  fmt,
}: {
  points: Point[];
  fmt: (p: Point) => string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const onKey = useKeys(points.length, active, setActive);
  const total = points.reduce((s, p) => s + p.value, 0);
  const R = 80;
  const C = 2 * Math.PI * R;
  const gap = points.length > 1 ? 4 : 0;
  const offsets = points.map((_, i) =>
    points.slice(0, i).reduce((sum, p) => sum + (p.value / total) * C, 0),
  );
  const cur = active !== null ? points[active] : points[0];

  return (
    <div
      ref={ref}
      className={styles.chartWrap}
      tabIndex={0}
      role="group"
      aria-label="Donut chart, use arrow keys to read values"
      onKeyDown={onKey}
      onBlur={() => setActive(null)}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "1.5rem 2.5rem",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 220,
          height: 220,
          flex: "none",
          margin: "0 auto",
        }}
      >
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          aria-hidden="true"
          onPointerLeave={() => setActive(null)}
        >
          <g transform="rotate(-90 110 110)">
            <circle
              cx="110"
              cy="110"
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="18"
            />
            {points.map((p, i) => {
              const len = Math.max(0, (p.value / total) * C - gap);
              return (
                <circle
                  key={p.label}
                  className={`${styles.arc} ${active !== null && active !== i ? styles.dim : ""}`}
                  cx="110"
                  cy="110"
                  r={R}
                  fill="none"
                  stroke={DONUT_COLOURS[i % DONUT_COLOURS.length]}
                  strokeWidth={active === i ? 24 : 18}
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offsets[i]}
                  onPointerEnter={() => setActive(i)}
                  style={{
                    filter:
                      active === i
                        ? `drop-shadow(0 0 8px ${DONUT_COLOURS[i % DONUT_COLOURS.length]})`
                        : undefined,
                    transition:
                      "stroke-dasharray 1100ms cubic-bezier(0.16,1,0.3,1), stroke-width 200ms ease, opacity 200ms ease",
                  }}
                />
              );
            })}
          </g>
        </svg>
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 48px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 26,
              fontWeight: 700,
              color: GOLD,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
            }}
          >
            {fmt(cur)}
          </span>
          <span
            style={{
              fontSize: 13,
              color: "#B4B4BC",
              marginTop: 4,
              lineHeight: 1.3,
            }}
          >
            {cur.label}
          </span>
        </div>
      </div>
      <ul
        className={styles.legend}
        style={{ flexDirection: "column", flex: "1 1 200px", margin: 0 }}
        aria-hidden="true"
      >
        {points.map((p, i) => (
          <li
            key={p.label}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            style={{ opacity: active !== null && active !== i ? 0.45 : 1 }}
          >
            <span
              className={styles.swatch}
              style={{ background: DONUT_COLOURS[i % DONUT_COLOURS.length] }}
            />
            <span style={{ flex: 1 }}>{p.label}</span>
            <span
              style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(p)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Legend({ names }: { names: string[] }) {
  return (
    <ul className={styles.legend} style={{ margin: "0 0 1rem" }} aria-hidden="true">
      {names.map((n, i) => (
        <li key={n}>
          <span
            className={styles.swatch}
            style={{ background: SERIES_COLOURS[i % SERIES_COLOURS.length] }}
          />
          {n}
        </li>
      ))}
    </ul>
  );
}

function GroupedBarChart({
  rows,
  names,
  fmtRaw,
}: {
  rows: Row[];
  names: string[];
  fmtRaw: (r: string) => string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const onKey = useKeys(rows.length, active, setActive);
  const max = Math.max(...rows.flatMap((r) => r.values));
  return (
    <div
      ref={ref}
      className={styles.chartWrap}
      tabIndex={0}
      role="group"
      aria-label="Grouped bar chart, use arrow keys to read values"
      onKeyDown={onKey}
      onBlur={() => setActive(null)}
      onPointerLeave={() => setActive(null)}
    >
      <Legend names={names} />
      <div style={{ display: "grid", gap: "1.1rem" }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            onPointerEnter={() => setActive(i)}
            aria-hidden="true"
            className={active !== null && active !== i ? styles.dim : ""}
            style={{ transition: "opacity 200ms ease" }}
          >
            <div style={{ fontSize: 14, color: "#EEEEEE", lineHeight: 1.35, marginBottom: 6 }}>
              {r.label}
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              {r.values.map((v, j) => {
                const c = SERIES_COLOURS[j % SERIES_COLOURS.length];
                return (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        className={`${styles.bar} ${active === i ? (j === 1 ? styles.litGold : styles.lit) : ""}`}
                        style={{
                          height: "100%",
                          width: `${Math.max(1.5, (v / max) * 100)}%`,
                          borderRadius: 4,
                          background: c,
                          boxShadow: `0 0 8px ${c}59`,
                          transitionDelay: `0ms, 0ms, ${i * 70}ms`,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        minWidth: 64,
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 600,
                        color: active === i ? c : "#EEEEEE",
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtRaw(r.raws[j])}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {active !== null ? (
        <p className={styles.srOnly} aria-live="polite">
          {rows[active].label}:{" "}
          {rows[active].raws.map((r, j) => `${names[j]} ${fmtRaw(r)}`).join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function MultiLineChart({
  rows,
  names,
  fmtRaw,
  prefix,
  suffix,
}: {
  rows: Row[];
  names: string[];
  fmtRaw: (r: string) => string;
  prefix: string;
  suffix: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const width = useWidth(ref, 640);
  const onKey = useKeys(rows.length, active, setActive);
  const gid = useId().replace(/:/g, "");
  const H = 260;
  const pad = { top: 16, right: 16, bottom: 34, left: 56 };
  const w = Math.max(200, width);
  const iw = w - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const all = rows.flatMap((r) => r.values);
  const minV = Math.min(0, ...all);
  const maxV = niceMax(Math.max(...all));
  const x = (i: number) =>
    pad.left + (rows.length === 1 ? iw / 2 : (i / (rows.length - 1)) * iw);
  const y = (v: number) => pad.top + ih - ((v - minV) / (maxV - minV)) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => minV + t * (maxV - minV));
  const lastIdx = rows.length - 1;
  const extent = (i: number): [number, number] => {
    const tw = rows[i].label.length * 7.2;
    if (i === 0) return [x(i), x(i) + tw];
    if (i === lastIdx) return [x(i) - tw, x(i)];
    return [x(i) - tw / 2, x(i) + tw / 2];
  };
  const shown = new Set<number>([lastIdx]);
  const lastLeft = extent(lastIdx)[0];
  let prevRight = -Infinity;
  rows.forEach((_, i) => {
    if (i === lastIdx) return;
    const [l, r] = extent(i);
    if (l - prevRight >= 12 && lastLeft - r >= 12) {
      shown.add(i);
      prevRight = r;
    }
  });
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
    let best = 0;
    let bestD = Infinity;
    rows.forEach((_, i) => {
      const d = Math.abs(x(i) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  };
  return (
    <div
      ref={ref}
      className={styles.chartWrap}
      tabIndex={0}
      role="group"
      aria-label="Line chart, use arrow keys to read values"
      onKeyDown={onKey}
      onBlur={() => setActive(null)}
    >
      <Legend names={names} />
      <div style={{ position: "relative" }}>
        <svg
          className={styles.svg}
          width={w}
          height={H}
          viewBox={`0 0 ${w} ${H}`}
          aria-hidden="true"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        >
          <defs>
            <filter id={`${gid}-g`} filterUnits="userSpaceOnUse" x={0} y={0} width={w} height={H}>
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left}
                x2={w - pad.right}
                y1={y(t)}
                y2={y(t)}
                stroke="rgba(255,255,255,0.08)"
              />
              <text className={styles.axisText} x={pad.left - 10} y={y(t) + 4} textAnchor="end">
                {prefix}
                {fmtTick(t)}
                {suffix}
              </text>
            </g>
          ))}
          {rows.map((r, i) =>
            shown.has(i) ? (
              <text
                key={r.label}
                className={styles.axisText}
                x={x(i)}
                y={H - 10}
                textAnchor={i === 0 ? "start" : i === lastIdx ? "end" : "middle"}
              >
                {r.label}
              </text>
            ) : null,
          )}
          {names.map((_, j) => {
            const c = SERIES_COLOURS[j % SERIES_COLOURS.length];
            const d = rows
              .map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r.values[j]).toFixed(1)}`)
              .join(" ");
            return (
              <g key={j}>
                <path
                  className={styles.line}
                  d={d}
                  fill="none"
                  stroke={c}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${gid}-g)`}
                  pathLength={1}
                  strokeDasharray="1"
                />
                {rows.map((r, i) => (
                  <circle
                    key={r.label}
                    cx={x(i)}
                    cy={y(r.values[j])}
                    r={active === i ? 6 : 3}
                    fill="#050507"
                    stroke={c}
                    strokeWidth="2"
                    className={styles.dot}
                  />
                ))}
              </g>
            );
          })}
          {active !== null ? (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={pad.top}
              y2={pad.top + ih}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="3 4"
            />
          ) : null}
        </svg>
        {active !== null ? (
          <div
            className={styles.tooltip}
            style={{
              left: Math.min(w - 90, Math.max(90, x(active))),
              top: y(Math.max(...rows[active].values)),
            }}
            aria-live="polite"
          >
            {rows[active].label}
            {rows[active].raws.map((raw, j) => (
              <span
                key={j}
                style={{
                  display: "block",
                  color: SERIES_COLOURS[j % SERIES_COLOURS.length],
                  fontWeight: 600,
                }}
              >
                {names[j]}: {fmtRaw(raw)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function GlowChart({
  type = "bar",
  title,
  data,
  eyebrow,
  prefix = "",
  suffix = "",
  highlight,
  series,
}: GlowChartProps) {
  const points = useMemo(() => parseData(data), [data]);
  const rows = useMemo(() => (series ? parseRows(data) : []), [data, series]);
  const names = useMemo(
    () => (series ? series.split(";").map((n) => n.trim()) : []),
    [series],
  );
  const fmt = useCallback(
    (p: Point) => `${prefix}${/^-?\d{4,}$/.test(p.raw) ? Number(p.raw).toLocaleString("en-GB") : p.raw}${suffix}`,
    [prefix, suffix],
  );
  const fmtRaw = useCallback(
    (raw: string) =>
      `${prefix}${/^-?\d{4,}$/.test(raw) ? Number(raw).toLocaleString("en-GB") : raw}${suffix}`,
    [prefix, suffix],
  );
  if (series) {
    if (!rows.length) return null;
    return (
      <>
        {type === "line" ? (
          <MultiLineChart rows={rows} names={names} fmtRaw={fmtRaw} prefix={prefix} suffix={suffix} />
        ) : (
          <GroupedBarChart rows={rows} names={names} fmtRaw={fmtRaw} />
        )}
        <div className={styles.srOnly}>
          <table>
            <caption>{title}</caption>
            <thead>
              <tr>
                <th scope="col">{eyebrow || "Item"}</th>
                {names.map((n) => (
                  <th scope="col" key={n}>
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {r.raws.map((raw, j) => (
                    <td key={j}>{fmtRaw(raw)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
  if (!points.length) return null;
  return (
    <>
      {type === "line" ? (
        <LineChart points={points} fmt={fmt} prefix={prefix} suffix={suffix} />
      ) : type === "donut" ? (
        <DonutChart points={points} fmt={fmt} />
      ) : (
        <BarChart points={points} fmt={fmt} highlight={highlight} />
      )}
      <div className={styles.srOnly}>
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">{eyebrow || "Item"}</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{fmt(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
