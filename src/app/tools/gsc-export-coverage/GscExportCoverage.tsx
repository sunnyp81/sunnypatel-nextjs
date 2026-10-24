"use client";

import { useRef, useState } from "react";
import { downloadText } from "@/lib/fetch-page-client";

type QueryRow = { query: string; clicks: number; impressions: number };
type Totals = { clicks: number; impressions: number };
type Result = {
  rows: QueryRow[];
  visible: Totals;
  totals: Totals;
  remainder: Totals;
  rowLimitMatch: 1000 | 25000 | 0;
  duplicates: number;
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
  const firstLine = input.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] || "";
  const delimiter =
    (firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length
      ? "\t"
      : ",";
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
      } else if (char === '"') {
        const next = text[index + 1];
        if (next !== undefined && next !== delimiter && next !== String.fromCharCode(10) && next !== String.fromCharCode(13))
          throw new Error("A quoted value is followed by extra text. Check the file is a clean Search Console export.");
        quoted = false;
      } else field += char;
    } else if (char === '"' && !field) quoted = true;
    else if (char === delimiter) {
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
  if (quoted)
    throw new Error(
      "A quoted value in the file is never closed. Check the export is complete.",
    );
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const COUNT = /^(\d{1,3}(,\d{3})+|\d+)$/;
const num = (value: string | undefined) => {
  if (!COUNT.test((value || "").trim())) return NaN;
  const n = Number((value || "").trim().replace(/,/g, ""));
  return Number.isSafeInteger(n) ? n : NaN;
};
const DATE = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/;

type Kind = "queries" | "dates" | "pages" | "unknown";

function detect(text: string): Kind {
  const header = (csvRows(text)[0] || []).map((cell) => cell.toLowerCase());
  if (header.some((cell) => /^(top pages|page|pages|landing page)$/.test(cell)))
    return "pages";
  if (header.some((cell) => /^(top queries|query|queries|search query)$/.test(cell)))
    return "queries";
  if (header.includes("date")) return "dates";
  return "unknown";
}

function table(text: string, firstColumn: RegExp) {
  const all = csvRows(text);
  const at = 0;
  if (!all.length || !all[0].some((cell) => firstColumn.test(cell.toLowerCase())))
    return null;
  const head = all[at].map((cell) => cell.toLowerCase());
  const first = head.findIndex((cell) => firstColumn.test(cell));
  const clicks = head.indexOf("clicks");
  const impressions = head.indexOf("impressions");
  if (clicks < 0 || impressions < 0) return null;
  const body = all.slice(at + 1);
  const bad = body.findIndex((row) => row.length !== head.length);
  if (bad >= 0)
    throw new Error(
      `Row ${bad + 2} has ${body[bad].length} columns but the header has ${head.length}. Quote any query that contains a comma.`,
    );
  return { body, first, clicks, impressions };
}

function parseQueries(text: string): QueryRow[] {
  const t = table(text, /^(top queries|query|queries|search query)$/);
  if (!t)
    throw new Error(
      "The Queries rows need a query column plus Clicks and Impressions columns.",
    );
  const rows: QueryRow[] = [];
  t.body.forEach((cells, index) => {
    const query = cells[t.first]?.trim();
    const clicks = num(cells[t.clicks]);
    const impressions = num(cells[t.impressions]);
    if (!query || !Number.isFinite(clicks) || !Number.isFinite(impressions))
      throw new Error(
        `Row ${index + 2} of the Queries data has no usable query, clicks or impressions. Use whole numbers from the English-language export, and fix or remove the row so the totals are not changed silently.`,
      );
    rows.push({ query, clicks, impressions });
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
    if (!DATE.test(cells[t.first] || "") || !Number.isFinite(c) || !Number.isFinite(i))
      throw new Error(
        "A row in the Dates file has no usable date, clicks or impressions. Use the English-language export with whole numbers.",
      );
    clicks += c;
    impressions += i;
    count++;
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
  if (visible.clicks > totals.clicks || visible.impressions > totals.impressions)
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
  const seen = new Set<string>();
  let duplicates = 0;
  for (const row of rows) {
    const key = row.query.toLowerCase();
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  }
  return {
    rows,
    visible,
    totals,
    remainder: {
      clicks: totals.clicks - visible.clicks,
      impressions: totals.impressions - visible.impressions,
    },
    rowLimitMatch: rows.length === 1000 ? 1000 : rows.length === 25000 ? 25000 : 0,
    duplicates,
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
  if (r.remainder.clicks === 0 && r.remainder.impressions === 0)
    return "Every click and impression in the chart totals is in an exported row.";
  const atInterfaceLimit = r.rowLimitMatch === 1000;
  if (!r.filtered && atInterfaceLimit)
    return "The export has 1,000 rows. That is the interface export maximum. No query filter was applied. The gap could come from anonymised queries, from rows cut by the 1,000-row limit or from both. These inputs cannot separate them.";
  if (!r.filtered)
    return "The gap is consistent with anonymised queries. Google leaves them out of the tables but includes them in the chart totals. These inputs cannot rule out other causes. An incomplete export is one example.";
  if (atInterfaceLimit)
    return "Rows cut by the 1,000-row export limit may explain this gap. The export has 1,000 rows. That is the interface export maximum. Anonymised queries should already be excluded from the chart totals because you reported a query filter. These inputs cannot establish the cause.";
  return "A gap remains even though anonymised queries should already be excluded from the chart totals under your query filter. Check that both files come from the same report, date range, search type and filters. Check that the export is complete.";
}

function headline(r: Result): string {
  if (r.remainder.clicks === 0 && r.remainder.impressions === 0)
    return "The exported query rows add up to the chart totals you supplied.";
  if (r.remainder.clicks === 0)
    return `The exported click sum matches the chart total, but ${fmt(r.remainder.impressions)} of ${fmt(r.totals.impressions)} impressions (${pct(r.remainder.impressions, r.totals.impressions)}) are not in any query row.`;
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
    if (total <= 0) {
      ctx.fillText(`${label}: the chart total is zero, so there is no share to show.`, 70, top + 20);
      return;
    }
    ctx.fillText(`${label}: ${fmt(visible)} in query rows, ${fmt(remainder)} not in any row`, 70, top - 14);
    const width = 1060;
    const vw = total > 0 ? Math.min(visible / total, 1) * width : 0;
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
  if (total <= 0)
    return (
      <p className="text-sm text-foreground">
        <span className="font-semibold">{label}:</span> the chart total is zero, so there is no share to show.
      </p>
    );
  const share = Math.min((100 * visible) / total, 100);
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
  const [ran, setRan] = useState<{ key: string; result: Result } | null>(null);
  const [error, setError] = useState("");
  const inputKey = JSON.stringify([queriesText, totals, filtered, brand]);
  const result = ran && ran.key === inputKey ? ran.result : null;
  const [notes, setNotes] = useState<string[]>([]);
  const importGeneration = useRef(0);

  async function readFiles(files: FileList | null) {
    if (!files?.length) return;
    const generation = ++importGeneration.current;
    setError("");
    setRan(null);
    const texts = await Promise.all(
      Array.from(files).map(async (file) => ({ name: file.name, text: await file.text() })),
    );
    if (generation !== importGeneration.current) return;
    const next: string[] = [];
    const apply: (() => void)[] = [];
    let failed = false;
    for (const { name, text } of texts) {
      try {
        const kind = detect(text);
        if (kind === "queries") {
          parseQueries(text);
          apply.push(() => setQueriesText(text));
          next.push(`${name}: read as the Queries table.`);
        } else if (kind === "dates") {
          const sum = parseDates(text);
          apply.push(() =>
            setTotals({ clicks: String(sum.clicks), impressions: String(sum.impressions) }),
          );
          next.push(`${name}: read as the Dates table, totals filled in.`);
        } else if (kind === "pages") {
          next.push(`${name}: a Pages table is not needed for this check.`);
        } else {
          failed = true;
          next.push(`${name}: not recognised. Use the Queries or Dates file from an English-language Performance export.`);
        }
      } catch (cause) {
        failed = true;
        next.push(`${name}: ${cause instanceof Error ? cause.message : "could not be read."}`);
      }
    }
    if (failed) {
      setQueriesText("");
      setTotals({ clicks: "", impressions: "" });
      next.push("A file could not be used, so nothing from this selection was loaded and earlier data was cleared. Fix the file and select the files again.");
    } else apply.forEach((fn) => fn());
    setNotes(next);
  }

  function run() {
    setError("");
    if (filtered === null) {
      setRan(null);
      setError("Say whether you applied a query filter before exporting.");
      return;
    }
    try {
      setRan({ key: inputKey, result: analyse(queriesText, totals, filtered, brand) });
    } catch (cause) {
      setRan(null);
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
      <div role="status">
        {notes.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </div>
      <label className="mt-5 block text-sm font-semibold text-foreground">
        Or paste the Queries rows
        <textarea
          value={queriesText}
          onChange={(event) => {
            importGeneration.current++;
            setQueriesText(event.target.value);
          }}
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
            onChange={(event) => {
              importGeneration.current++;
              setTotals({ ...totals, clicks: event.target.value });
            }}
            className={field}
          />
        </label>
        <label className="block text-sm font-semibold text-foreground">
          Chart total impressions
          <input
            inputMode="numeric"
            value={totals.impressions}
            onChange={(event) => {
              importGeneration.current++;
              setTotals({ ...totals, impressions: event.target.value });
            }}
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
            importGeneration.current++;
            setQueriesText(SAMPLE_QUERIES);
            setTotals(SAMPLE_TOTALS);
            setFiltered(false);
            setBrand("sample brand");
            setRan(null);
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
      <div role="status" className="sr-only">
        {result ? headline(result) : ""}
      </div>
      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground">{headline(result)}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{attribution(result)}</p>
          {result.rowLimitMatch > 0 && (
            <p className="mt-3 rounded-lg border border-hairline bg-background p-3 text-sm text-foreground">
              {result.rowLimitMatch === 1000
                ? "This file contains 1,000 rows, matching the Search Console interface export maximum. That does not establish whether rows were omitted."
                : "This file contains 25,000 rows, matching the API per-request maximum. It may be one page of a longer result; page through with startRow."}
            </p>
          )}
          {result.duplicates > 0 && (
            <p className="mt-3 rounded-lg border border-hairline bg-background p-3 text-sm text-foreground">
              {fmt(result.duplicates)} {result.duplicates === 1 ? "query row repeats a query" : "query rows repeat queries"} that appear{result.duplicates === 1 ? "s" : ""} earlier in the file. Their clicks and impressions are all counted, so check the export for duplicates.
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
