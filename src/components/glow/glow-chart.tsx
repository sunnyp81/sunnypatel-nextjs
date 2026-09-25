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

/**
 * Canvas can't read CSS custom properties, so the PNG export needs its own
 * resolved palette per theme. BLUE/GOLD stay fixed hues in both (matches
 * the CSS token contract); only neutral bg/text/axis colours flip.
 */
type CanvasPalette = { bg: string; text: string; faint: string; axis: string; track: string };
const DARK_PALETTE: CanvasPalette = {
  bg: "#050507",
  text: "#EEEEEE",
  faint: "#B4B4BC",
  axis: "#808080",
  track: "rgba(255,255,255,0.06)",
};
const LIGHT_PALETTE: CanvasPalette = {
  bg: "#FFFFFF",
  text: "#0A1024",
  faint: "#5D6782",
  axis: "#5D6782",
  track: "rgba(10,16,36,0.08)",
};
function currentCanvasPalette(): CanvasPalette {
  if (typeof document === "undefined") return DARK_PALETTE;
  return document.documentElement.classList.contains("light") ? LIGHT_PALETTE : DARK_PALETTE;
}

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

/**
 * A static, labelled summary; shares the interactive chart's data parsers.
 * `palette` defaults to the dark export (canvas can't resolve CSS vars);
 * pass `currentCanvasPalette()` to match whichever theme is active on export.
 */
export function drawChartToCanvas(
  canvas: HTMLCanvasElement,
  props: GlowChartProps,
  url: string,
  palette: CanvasPalette = DARK_PALETTE,
) {
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const { type = "bar", title, source, prefix = "", suffix = "", series } = props;
  const points = parseData(props.data);
  const rows = series ? parseRows(props.data) : points.map((p) => ({ label: p.label, raws: [p.raw], values: [p.value] }));
  const names = series ? series.split(";").map((name) => name.trim()) : [""];
  const entries = rows.flatMap((row, i) => row.values.map((value, j) => ({
    label: `${row.label}${series ? ` — ${names[j] || `Series ${j + 1}`}` : ""}`,
    value,
    display: `${prefix}${/^-?\d{4,}$/.test(row.raws[j]) ? Number(row.raws[j]).toLocaleString("en-GB") : row.raws[j]}${suffix}`,
    colour: series ? [BLUE, GOLD][j % 2] : type === "line" ? BLUE : [BLUE, GOLD][i % 2],
  })));
  if (!entries.length) throw new Error("No chart data");

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 1200, 675);
  // Canvas maxWidth keeps long source lines and URLs within the image.
  const text = (value: string, x: number, y: number, width: number, size = 18, colour = palette.text) => {
    ctx.font = `${size}px Arial, sans-serif`;
    ctx.fillStyle = colour;
    ctx.fillText(value, x, y, width);
  };
  text(title, 48, 57, 1104, 30);
  const top = 100;
  const height = 440;
  const min = Math.min(0, ...entries.map((entry) => entry.value));
  const max = Math.max(0, ...entries.map((entry) => entry.value));
  const range = max - min || 1;
  const line = type === "line";
  const donut = type === "donut" && !series;
  const rowHeight = height / entries.length;
  const fontSize = Math.min(18, rowHeight * 0.65);

  if (line) {
    const x = (i: number) => 65 + (rows.length === 1 ? 235 : i * 470 / (rows.length - 1));
    const y = (value: number) => top + height - 30 - (value - min) / range * (height - 60);
    ctx.strokeStyle = palette.axis;
    ctx.beginPath();
    ctx.moveTo(65, y(0));
    ctx.lineTo(535, y(0));
    ctx.stroke();
    names.forEach((_, j) => {
      ctx.strokeStyle = [BLUE, GOLD][j % 2];
      ctx.lineWidth = 3;
      ctx.setLineDash(j % 2 ? [8, 5] : []);
      ctx.beginPath();
      rows.forEach((row, i) => {
        if (i === 0) ctx.moveTo(x(i), y(row.values[j]));
        else ctx.lineTo(x(i), y(row.values[j]));
      });
      ctx.stroke();
      ctx.setLineDash([]);
      rows.forEach((row, i) => {
        ctx.beginPath();
        ctx.arc(x(i), y(row.values[j]), 4, 0, Math.PI * 2);
        ctx.fillStyle = [BLUE, GOLD][j % 2];
        ctx.fill();
      });
    });
    text(rows[0].label, 48, 565, 240, 14, palette.faint);
    if (rows.length > 1) text(rows[rows.length - 1].label, 310, 565, 250, 14, palette.faint);
  } else if (donut) {
    const total = points.reduce((sum, point) => sum + Math.max(0, point.value), 0);
    let angle = -Math.PI / 2;
    points.forEach((point, i) => {
      const end = angle + (total ? Math.max(0, point.value) / total * Math.PI * 2 : 0);
      ctx.beginPath();
      ctx.moveTo(290, 320);
      ctx.arc(290, 320, 180, angle, end);
      ctx.closePath();
      ctx.fillStyle = [BLUE, GOLD][i % 2];
      ctx.fill();
      ctx.strokeStyle = palette.bg;
      ctx.lineWidth = 2;
      ctx.stroke();
      angle = end;
    });
  }

  entries.forEach((entry, i) => {
    const y = top + (i + 0.7) * rowHeight;
    if (line || donut) {
      text(`${entry.label}: ${entry.display}`, 595, y, 557, fontSize, entry.colour);
    } else {
      text(entry.label, 48, y, 435, fontSize);
      const x = (value: number) => 505 + (value - min) / range * 475;
      ctx.fillStyle = palette.track;
      ctx.fillRect(505, y - fontSize + 2, 475, fontSize);
      ctx.fillStyle = entry.colour;
      ctx.fillRect(Math.min(x(0), x(entry.value)), y - fontSize + 2, Math.abs(x(entry.value) - x(0)), fontSize);
      text(entry.display, 1000, y, 152, fontSize);
    }
  });
  if (source) text(`Source: ${source}`, 48, 603, 1104, 16, palette.faint);
  text("SunnyPatel.co.uk", 48, 643, 180, 14, palette.faint);
  text(url, 240, 643, 912, 14, palette.faint);
}

function downloadSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ChartActions(props: GlowChartProps) {
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announce = (message: string, temporary = false) => {
    if (timer.current) clearTimeout(timer.current);
    setStatus(message);
    if (temporary) timer.current = setTimeout(() => setStatus(""), 2000);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copyCitation = async () => {
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const citation = `"${props.title}", Sunny Patel, ${document.title}, ${window.location.origin}${window.location.pathname}, accessed ${date}`;
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(citation);
      else {
        const focused = document.activeElement;
        const textarea = document.createElement("textarea");
        textarea.value = citation;
        textarea.className = styles.clipboardFallback;
        textarea.setAttribute("aria-label", "Chart citation");
        document.body.appendChild(textarea);
        try {
          textarea.focus({ preventScroll: true });
          textarea.select();
          if (!document.execCommand("copy")) throw new Error("Copy failed");
        } finally {
          textarea.remove();
          if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
        }
      }
      announce("Copied", true);
    } catch {
      announce("Couldn't copy — copy manually");
    }
  };

  const download = async () => {
    try {
      const canvas = document.createElement("canvas");
      drawChartToCanvas(canvas, props, window.location.href, currentCanvasPalette());
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("PNG unavailable")), "image/png",
      ));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const page = window.location.pathname.split("/").filter(Boolean).pop() || "home";
      anchor.download = `${downloadSlug(page)}-${downloadSlug(props.title)}.png`;
      document.body.appendChild(anchor);
      try { anchor.click(); } finally {
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      announce("Couldn't download — try again");
    }
  };

  return (
    <div className={styles.chartActions}>
      <button type="button" className={styles.chartActionBtn} onClick={download}>Download PNG</button>
      <button type="button" className={styles.chartActionBtn} onClick={copyCitation}>Copy citation</button>
      <span className={styles.chartActionStatus} aria-live="polite" aria-atomic="true">{status}</span>
    </div>
  );
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
                  style={{ fontSize: 14, color: "var(--ink-strong)", lineHeight: 1.35 }}
                >
                  {p.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: hi || isActive ? GOLD : "var(--ink-strong)",
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
                  background: "var(--hairline)",
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
                    boxShadow: `0 0 10px ${hi ? "var(--glow-gold)" : "var(--glow-brand)"}`,
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
              stroke="var(--hairline)"
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
            fill="var(--background)"
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
            stroke="var(--glow-gold)"
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
              stroke="var(--hairline)"
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
              color: "var(--gold-ink)",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
            }}
          >
            {fmt(cur)}
          </span>
          <span
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
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
            <div style={{ fontSize: 14, color: "var(--ink-strong)", lineHeight: 1.35, marginBottom: 6 }}>
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
                        background: "var(--hairline)",
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
                        color: active === i ? c : "var(--ink-strong)",
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
                stroke="var(--hairline)"
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
                    fill="var(--background)"
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
              stroke="var(--crosshair)"
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
