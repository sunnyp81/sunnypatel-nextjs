"use client";

import { useState } from "react";
import { downloadText } from "@/lib/fetch-page-client";

type QueryRow = { query: string; clicks: number; impressions: number };
type Totals = { clicks: number; impressions: number };
type Result = {
  rows: QueryRow[];
  visible: Totals;
  totals: Totals;
  remainder: Totals;
  capReached: 1000 | 25000 | 0;
  filtered: boolean;
  top10: number;
  zeroRows: number;
  zeroImpressionShare: number;
  brandTerms: string[];
  brandClicks: number;
};

const SAMPLE_QUERIES = `Top queries,Clicks,Impressions,CTR,Position
sample seo services,42,1900,2.2%,6.1
sample local seo,31,1400,2.2%,7.4
sample technical audit,18,620,2.9%,5.2
sample brand name,16,90,17.8%,1.1
sample schema guide,9,780,1.2%,9.8
sample page speed,6,540,1.1%,11.3
sample seo pricing,0,410,0%,14.2
sample crawl budget,0,260,0%,18.9`;
const SAMPLE_TOTALS = { clicks: "160", impressions: "9800" };

function csvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const text = input.replace(/^﻿/, "");
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && !field) quoted = true;
    else if (char === "," || char === "\t") {
      row.push(field.trim());
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const num = (value: string | undefined) =>
  Number((value || "").replace(/[,\s]/g, ""));

type Kind = "queries" | "dates" | "pages" | "unknown";

function detect(text: string): Kind {
  const header = csvRows(text)
    .slice(0, 3)
    .flat()
    .map((cell) => cell.toLowerCase());
  if (header.some((cell) => /^(top pages|page|pages|landing page)$/.test(cell)))
    return "pages";
  if (header.some((cell) => /^(top queries|query|queries|search query)$/.test(cell)))
    return "queries";
  if (header.includes("date")) return "dates";
  return "unknown";
}

function table(text: string, firstColumn: RegExp) {
  const all = csvRows(text);
  const at = all.findIndex((row) =>
    row.some((cell) => firstColumn.test(cell.toLowerCase())),
  );
  if (at < 0) return null;
  const head = all[at].map((cell) => cell.toLowerCase());
  const first = head.findIndex((cell) => firstColumn.test(cell));
  const clicks = head.indexOf("clicks");
  const impressions = head.indexOf("impressions");
  if (clicks < 0 || impressions < 0) return null;
  return { body: all.slice(at + 1), first, clicks, impressions };
}

function parseQueries(text: string): QueryRow[] {
  const t = table(text, /^(top queries|query|queries|search query)$/);
  if (!t)
    throw new Error(
      "The Queries rows need a query column plus Clicks and Impressions columns.",
    );
  const rows = t.body.flatMap((cells) => {
    const query = cells[t.first]?.trim();
    const clicks = num(cells[t.clicks]);
    const impressions = num(cells[t.impressions]);
    return query && Number.isFinite(clicks) && Number.isFinite(impressions) &&
      clicks >= 0 && impressions >= 0
      ? [{ query, clicks, impressions }]
      : [];
  });
  if (!rows.length) throw new Error("No query rows with clicks and impressions were found.");
  return rows;
}

function parseDates(text: string): Totals {
  const t = table(text, /^date$/);
  if (!t)
    throw new Error("The Dates file needs Date, Clicks and Impressions columns.");
  let clicks = 0;
  let impressions = 0;
  let count = 0;
  for (const cells of t.body) {
    const c = num(cells[t.clicks]);
    const i = num(cells[t.impressions]);
    if (cells[t.first] && Number.isFinite(c) && Number.isFinite(i)) {
      clicks += c;
      impressions += i;
      count++;
    }
  }
  if (!count) throw new Error("No dated rows were found in the Dates file.");
  return { clicks, impressions };
}

function analyse(
  queriesText: string,
  totalsIn: { clicks: string; impressions: string },
  filtered: boolean,
  brandInput: string,
): Result {
  const rows = parseQueries(queriesText);
  const totals = { clicks: num(totalsIn.clicks), impressions: num(totalsIn.impressions) };
  if (!totalsIn.clicks.trim() || !totalsIn.impressions.trim() ||
    !Number.isFinite(totals.clicks) || !Number.isFinite(totals.impressions) ||
    totals.clicks < 0 || totals.impressions <= 0)
    throw new Error(
      "Enter the chart totals for clicks and impressions, or upload the Dates file from the same export.",
    );
  const visible = rows.reduce(
    (sum, row) => ({
      clicks: sum.clicks + row.clicks,
      impressions: sum.impressions + row.impressions,
    }),
    { clicks: 0, impressions: 0 },
  );
  if (
    visible.clicks > totals.clicks * 1.01 ||
    visible.impressions > totals.impressions * 1.01
  )
    throw new Error(
      "Rows add up to more than the chart totals. Check both files come from the same report, date range, search type and filters.",
    );
  const brandTerms = brandInput
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const brandClicks = rows.reduce(
    (sum, row) =>
      brandTerms.some((term) => row.query.toLowerCase().includes(term))
        ? sum + row.clicks
        : sum,
    0,
  );
  const byClicks = [...rows].sort((a, b) => b.clicks - a.clicks);
  const top10 = byClicks.slice(0, 10).reduce((sum, row) => sum + row.clicks, 0);
  const zero = rows.filter((row) => row.clicks === 0);
  return {
    rows,
    visible,
    totals,
    remainder: {
      clicks: Math.max(totals.clicks - visible.clicks, 0),
      impressions: Math.max(totals.impressions - visible.impressions, 0),
    },
    capReached: rows.length === 1000 ? 1000 : rows.length === 25000 ? 25000 : 0,
    filtered,
    top10,
    zeroRows: zero.length,
    zeroImpressionShare: zero.reduce((sum, row) => sum + row.impressions, 0),
    brandTerms,
    brandClicks,
  };
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");
const pct = (part: number, whole: number) =>
  whole > 0 ? `${((100 * part) / whole).toFixed(1)}%` : "n/a";

function attribution(r: Result): string {
  const remPct = Math.max(
    (100 * r.remainder.clicks) / Math.max(r.totals.clicks, 1),
    (100 * r.remainder.impressions) / Math.max(r.totals.impressions, 1),
  );
  const capped = r.capReached > 0;
  if (!r.filtered && capped)
    return `The export reached the ${fmt(r.capReached)}-row limit and no query filter was applied, so this gap cannot be split between anonymised queries and the row limit.`;
  if (!r.filtered)
    return "The export is under the row limit with no query filter, so the gap is consistent with anonymised queries, which Google leaves out of the table but includes in the chart totals.";
  if (capped)
    return `The export reached the ${fmt(r.capReached)}-row limit with a query filter applied. Anonymised queries are already excluded from the totals when you filter by query, so the gap is attributable to the row limit.`;
  if (remPct > 1)
    return "The export is under the row limit and a query filter was applied, so a gap this size is unexpected. Check that both files come from the same report.";
  return "Your rows cover the chart totals to within 1%.";
}

function headline(r: Result): string {
  if (r.remainder.clicks === 0)
    return "Every click in the chart totals appears in your exported query rows.";
  return `${fmt(r.remainder.clicks)} of ${fmt(r.totals.clicks)} clicks (${pct(r.remainder.clicks, r.totals.clicks)}) are not in any query row you exported.`;
}

const csvCell = (value: string | number) =>
  `"${String(value).replace(/"/g, '""')}"`;

function summaryCsv(r: Result): string {
  const lines = [
    ["Measure", "Clicks", "Impressions"],
    ["Chart totals", r.totals.clicks, r.totals.impressions],
    ["Exported query rows", r.visible.clicks, r.visible.impressions],
    ["Not in any query row", r.remainder.clicks, r.remainder.impressions],
    [
      "Share not in any query row",
      pct(r.remainder.clicks, r.totals.clicks),
      pct(r.remainder.impressions, r.totals.impressions),
    ],
    ["Query rows exported", r.rows.length, ""],
    ["Top 10 rows share of exported clicks", pct(r.top10, r.visible.clicks), ""],
    ["Zero-click rows", r.zeroRows, pct(r.zeroImpressionShare, r.visible.impressions)],
  ];
  return lines.map((line) => line.map(csvCell).join(",")).join("\r\n");
}

function drawPng(r: Result) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#0b0f19";
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = "#f5f7fb";
  ctx.font = "bold 40px sans-serif";
  const words = headline(r).split(" ");
  let line = "";
  let y = 100;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > 1060 && line) {
      ctx.fillText(line, 70, y);
      line = word;
      y += 52;
    } else line = test;
  }
  ctx.fillText(line, 70, y);
  const bars: [string, number, number, number][] = [
    ["Clicks", r.visible.clicks, r.remainder.clicks, r.totals.clicks],
    ["Impressions", r.visible.impressions, r.remainder.impressions, r.totals.impressions],
  ];
  bars.forEach(([label, visible, remainder, total], index) => {
    const top = 300 + index * 120;
    ctx.fillStyle = "#c9d1e3";
    ctx.font = "26px sans-serif";
    ctx.fillText(`${label}: ${fmt(visible)} in query rows, ${fmt(remainder)} not in any row`, 70, top - 14);
    const width = 1060;
    const vw = total > 0 ? (visible / total) * width : 0;
    ctx.fillStyle = "#4f8cff";
    ctx.fillRect(70, top, vw, 48);
    ctx.save();
    ctx.beginPath();
    ctx.rect(70 + vw, top, width - vw, 48);
    ctx.clip();
    ctx.fillStyle = "#1a2133";
    ctx.fillRect(70 + vw, top, width - vw, 48);
    ctx.strokeStyle = "#e8b04a";
    ctx.lineWidth = 3;
    for (let x = 70 + vw - 60; x < 70 + width; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, top + 48);
      ctx.lineTo(x + 48, top);
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.fillStyle = "#8a94ab";
  ctx.font = "22px sans-serif";
  ctx.fillText("Blue: rows in the Queries export. Hatched: not in any query row.", 70, 548);
  ctx.fillText("sunnypatel.co.uk/tools/gsc-export-coverage/", 70, 590);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "gsc-export-coverage.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 60_000);
  });
}

function CoverageBar({
  label,
  visible,
  remainder,
  total,
}: {
  label: string;
  visible: number;
  remainder: number;
  total: number;
}) {
  const share = total > 0 ? Math.min((100 * visible) / total, 100) : 0;
  return (
    <div>
      <p className="text-sm text-foreground">
        <span className="font-semibold">{label}:</span> {fmt(visible)} in query
        rows, {fmt(remainder)} not in any row ({pct(remainder, total)})
      </p>
      <div
        role="img"
        aria-label={`${label}: ${share.toFixed(1)}% in query rows, ${(100 - share).toFixed(1)}% not in any query row`}
        className="mt-2 flex h-8 w-full overflow-hidden rounded-sm border border-hairline"
      >
        <div className="bg-brand" style={{ width: `${share}%` }} />
        <div
          className="flex-1"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--gold-ink) 0 2px, transparent 2px 8px)",
          }}
        />
      </div>
    </div>
  );
}

export default function GscExportCoverage() {
  const [queriesText, setQueriesText] = useState("");
  const [totals, setTotals] = useState({ clicks: "", impressions: "" });
  const [filtered, setFiltered] = useState<boolean | null>(null);
  const [brand, setBrand] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  async function readFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setResult(null);
    const next: string[] = [];
    for (const file of Array.from(files)) {
      const text = await file.text();
      const kind = detect(text);
      try {
        if (kind === "queries") {
          setQueriesText(text);
          next.push(`${file.name}: read as the Queries table.`);
        } else if (kind === "dates") {
          const sum = parseDates(text);
          setTotals({ clicks: String(sum.clicks), impressions: String(sum.impressions) });
          next.push(`${file.name}: read as the Dates table, totals filled in.`);
        } else if (kind === "pages") {
          next.push(`${file.name}: a Pages table is not needed for this check.`);
        } else {
          next.push(`${file.name}: not recognised. Use the Queries or Dates file from a Performance export.`);
        }
      } catch (cause) {
        next.push(`${file.name}: ${cause instanceof Error ? cause.message : "could not be read."}`);
      }
    }
    setNotes(next);
  }

  function run() {
    setError("");
    if (filtered === null) {
      setResult(null);
      setError("Say whether you applied a query filter before exporting.");
      return;
    }
    try {
      setResult(analyse(queriesText, totals, filtered, brand));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : "Could not read the data.");
    }
  }

  const field =
    "mt-2 block w-full min-w-0 rounded-lg border border-hairline bg-background p-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <section className="rounded-xl border border-hairline bg-wash p-5 sm:p-7">
      <label className="block text-sm font-semibold text-foreground">
        Search Console export files (Queries and Dates)
        <input
          type="file"
          multiple
          accept=".csv,.tsv,text/csv,text/plain"
          onChange={(event) => readFiles(event.target.files)}
          className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-background"
        />
      </label>
      {notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground" aria-live="polite">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <label className="mt-5 block text-sm font-semibold text-foreground">
        Or paste the Queries rows
        <textarea
          value={queriesText}
          onChange={(event) => setQueriesText(event.target.value)}
          rows={7}
          className={`${field} font-mono text-xs`}
        />
      </label>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-foreground">
          Chart total clicks
          <input
            inputMode="numeric"
            value={totals.clicks}
            onChange={(event) => setTotals({ ...totals, clicks: event.target.value })}
            className={field}
          />
        </label>
        <label className="block text-sm font-semibold text-foreground">
          Chart total impressions
          <input
            inputMode="numeric"
            value={totals.impressions}
            onChange={(event) => setTotals({ ...totals, impressions: event.target.value })}
            className={field}
          />
        </label>
      </div>
      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-foreground">
          Did you apply a query filter before exporting?
        </legend>
        <div className="mt-2 flex gap-6 text-sm text-foreground">
          <label className="flex items-center gap-2">
            <input type="radio" name="filtered" checked={filtered === false} onChange={() => setFiltered(false)} />
            No filter
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="filtered" checked={filtered === true} onChange={() => setFiltered(true)} />
            Yes, a query filter
          </label>
        </div>
      </fieldset>
      <label className="mt-5 block text-sm font-semibold text-foreground">
        Brand terms, optional, separated by commas
        <input value={brand} onChange={(event) => setBrand(event.target.value)} className={field} />
      </label>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="rounded-lg bg-brand px-5 py-3 font-semibold text-background">
          Check coverage
        </button>
        <button
          type="button"
          onClick={() => {
            setQueriesText(SAMPLE_QUERIES);
            setTotals(SAMPLE_TOTALS);
            setFiltered(false);
            setBrand("sample brand");
            setResult(null);
            setError("");
            setNotes(["Sample data is invented for illustration."]);
          }}
          className="rounded-lg border border-hairline px-5 py-3 font-semibold text-foreground hover:bg-background"
        >
          Load sample dataset
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        All analysis happens in this browser. Nothing from your files is uploaded.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-8" aria-live="polite">
          <h2 className="text-2xl font-bold text-foreground">{headline(result)}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{attribution(result)}</p>
          {result.capReached > 0 && (
            <p className="mt-3 rounded-lg border border-hairline bg-background p-3 text-sm text-foreground">
              {result.capReached === 1000
                ? "This export reached the 1,000-row limit of the Search Console interface."
                : "This export reached the 25,000-row API request limit; page through with startRow."}
            </p>
          )}
          <div className="mt-6 space-y-5">
            <CoverageBar label="Clicks" visible={result.visible.clicks} remainder={result.remainder.clicks} total={result.totals.clicks} />
            <CoverageBar label="Impressions" visible={result.visible.impressions} remainder={result.remainder.impressions} total={result.totals.impressions} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Blue is the share in your query rows. Hatched is the share no query row explains.
          </p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-background p-3">
              <dt className="text-muted-foreground">Query rows exported</dt>
              <dd className="font-semibold text-foreground">{fmt(result.rows.length)}</dd>
            </div>
            <div className="rounded-lg border border-hairline bg-background p-3">
              <dt className="text-muted-foreground">Top 10 rows share of exported clicks</dt>
              <dd className="font-semibold text-foreground">{pct(result.top10, result.visible.clicks)}</dd>
            </div>
            <div className="rounded-lg border border-hairline bg-background p-3">
              <dt className="text-muted-foreground">Rows with zero clicks</dt>
              <dd className="font-semibold text-foreground">
                {fmt(result.zeroRows)} ({pct(result.zeroRows, result.rows.length)} of rows, {pct(result.zeroImpressionShare, result.visible.impressions)} of exported impressions)
              </dd>
            </div>
            <div className="rounded-lg border border-hairline bg-background p-3">
              <dt className="text-muted-foreground">CTR: exported rows against chart totals</dt>
              <dd className="font-semibold text-foreground">
                {pct(result.visible.clicks, result.visible.impressions)} against {pct(result.totals.clicks, result.totals.impressions)}
              </dd>
            </div>
            {result.brandTerms.length > 0 && (
              <div className="rounded-lg border border-hairline bg-background p-3 sm:col-span-2">
                <dt className="text-muted-foreground">Heuristic brand split of exported clicks</dt>
                <dd className="font-semibold text-foreground">
                  Rows matching your brand terms: {fmt(result.brandClicks)} clicks ({pct(result.brandClicks, result.visible.clicks)}). Other rows: {fmt(result.visible.clicks - result.brandClicks)} clicks. The remainder is not split.
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => drawPng(result)}
              className="rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background"
            >
              Download chart PNG
            </button>
            <button
              type="button"
              onClick={() => downloadText("gsc-export-coverage.csv", summaryCsv(result), "text/csv")}
              className="rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background"
            >
              Download summary CSV
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
