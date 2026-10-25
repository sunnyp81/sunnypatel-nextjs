"use client";

import { useRef, useState } from "react";
import { downloadText } from "@/lib/fetch-page-client";
import { canInflate, readZip } from "@/lib/zip-read";
import {
  analyse,
  classify,
  compare,
  makeBaseline,
  type Analysis,
  type Baseline,
  type Compare,
  type Table,
} from "@/lib/gsc-actions";

const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");
const pct = (n: number, digits = 1) => `${(100 * n).toFixed(digits)}%`;
const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
const TYPE_LABEL: Record<string, string> = {
  A: "Striking distance",
  B: "Low CTR for its position",
  C: "Zero clicks",
  D: "Page CTR",
  F: "Mobile gap",
};

function headline(a: Analysis): string {
  const n = a.actions.length;
  const noun = n === 1 ? "action" : "actions";
  if (!n) return "No actions met the thresholds in this export.";
  if (a.scenarioQueries >= 1)
    return `${n} ${noun} found. Scenario: ${fmt(a.scenarioQueries)} extra clicks over these ${a.days || "same"} days.`;
  return `${n} ${noun} found.`;
}

function coverageLine(a: Analysis): string {
  if (!a.coverage || !a.totals) return "";
  const { remainder } = a.coverage;
  if (remainder.clicks === 0 && remainder.impressions === 0) return "Your query rows add up to the chart totals.";
  const share = a.totals.clicks > 0 ? pct(remainder.clicks / a.totals.clicks) : "n/a";
  const why =
    a.queryFilter === "yes"
      ? "You applied a query filter, so anonymised queries should already be excluded from the totals; the gap may come from the 1,000-row export limit."
      : a.queryRows.length === 1000
        ? "The Queries table has exactly 1,000 rows, the interface export maximum, so omitted rows and anonymised queries cannot be separated here."
        : `The gap is consistent with anonymised queries${a.queryFilter === "unsure" ? ", assuming no query filter" : ""}, which Google leaves out of the tables but includes in the chart totals.`;
  return `${fmt(remainder.clicks)} of ${fmt(a.totals.clicks)} chart clicks (${share}) are not in any query row. ${why}`;
}

function actionsCsv(a: Analysis): string {
  const lines = [
    "rank,action_type,item_type,item,clicks,impressions,ctr,position,position_band,site_band_median_ctr,scenario_extra_clicks,next_step,status,done_date",
  ];
  a.actions.forEach((x, i) =>
    lines.push(
      [
        i + 1, TYPE_LABEL[x.type], x.itemType, x.item, x.clicks, x.impressions, (x.ctr * 100).toFixed(2) + "%",
        x.position === null ? "" : x.position.toFixed(1), x.band,
        x.bandMedian === null ? "" : (x.bandMedian * 100).toFixed(2) + "%",
        x.scenario ? x.scenario.toFixed(1) : "", x.nextStep, "", "",
      ].map(csvCell).join(","),
    ),
  );
  return lines.join("\r\n");
}

function drawPng(a: Analysis) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#0b0f19";
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = "#f5f7fb";
  ctx.font = "bold 40px sans-serif";
  const words = headline(a).split(" ");
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
  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#c9d1e3";
  const bands = a.queryBands;
  const max = Math.max(0.01, ...bands.map((b) => b.median ?? 0));
  bands.forEach((b, i) => {
    const top = 270 + i * 58;
    ctx.fillStyle = "#c9d1e3";
    ctx.fillText(b.label, 70, top + 30);
    if (b.median === null) {
      ctx.fillStyle = "#8a94ab";
      ctx.fillText("not enough data", 380, top + 30);
    } else {
      ctx.fillStyle = "#4f8cff";
      ctx.fillRect(380, top, (b.median / max) * 560, 40);
      ctx.fillStyle = "#f5f7fb";
      ctx.fillText(`${pct(b.median)} median CTR`, 380 + (b.median / max) * 560 + 16, top + 30);
    }
  });
  ctx.fillStyle = "#8a94ab";
  ctx.font = "22px sans-serif";
  ctx.fillText("Your site's own median CTR by position band. Scenario, not a forecast.", 70, 548);
  ctx.fillText("sunnypatel.co.uk/tools/gsc-export-coverage/", 70, 590);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "search-console-action-finder.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 60_000);
  });
}

export default function GscExportCoverage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [fileNotes, setFileNotes] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [filter, setFilter] = useState<"yes" | "no" | "unsure">("unsure");
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [baselineNote, setBaselineNote] = useState("");
  const [ran, setRan] = useState<{ key: string; analysis: Analysis; cmp: Compare | null } | null>(null);
  const [error, setError] = useState("");
  const generation = useRef(0);

  const inputKey = JSON.stringify([tables.map((t) => [t.kind, t.rows.length, t.rows[0]]), brand, filter, baseline?.start]);
  const result = ran && ran.key === inputKey ? ran : null;

  async function readFiles(files: FileList | null) {
    if (!files?.length) return;
    const gen = ++generation.current;
    setError("");
    setRan(null);
    const notes: string[] = [];
    const found: Table[] = [];
    let failed = false;
    for (const file of Array.from(files)) {
      try {
        const isZip = /\.zip$/i.test(file.name) || file.type === "application/zip" || file.type === "application/x-zip-compressed";
        const texts: { name: string; text: string }[] = isZip
          ? await readZip(file)
          : [{ name: file.name, text: await file.text() }];
        if (isZip) notes.push(`${file.name}: opened, ${texts.length} files inside.`);
        for (const { name, text } of texts) {
          if (!/\.(csv|tsv|txt)$/i.test(name)) continue;
          const table = classify(text);
          if (table.kind === "unknown") {
            notes.push(`${name}: not recognised, skipped.`);
            continue;
          }
          if (table.kind === "ignored") continue;
          if (found.some((t) => t.kind === table.kind)) {
            notes.push(`${name}: a second ${table.kind} table was skipped.`);
            continue;
          }
          found.push(table);
          notes.push(`${name}: read as the ${table.kind} table.`);
        }
      } catch (cause) {
        failed = true;
        notes.push(`${file.name}: ${cause instanceof Error ? cause.message : "could not be read."}`);
      }
    }
    if (gen !== generation.current) return;
    if (failed) {
      setTables([]);
      notes.push("A file could not be used, so nothing from this selection was loaded. Fix the file and drop it again.");
    } else setTables(found);
    setFileNotes(notes);
  }

  async function readBaseline(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setRan(null);
    try {
      const parsed = JSON.parse(await file.text()) as Baseline;
      if (parsed.version !== 1 || !Array.isArray(parsed.flagged)) throw new Error("not a baseline");
      setBaseline(parsed);
      setBaselineNote(`Baseline loaded: ${parsed.start} to ${parsed.end}, ${parsed.flagged.length} flagged rows.`);
    } catch {
      setBaseline(null);
      setBaselineNote("That file is not a baseline downloaded from this tool.");
    }
  }

  function run() {
    setError("");
    try {
      const analysis = analyse({
        tables,
        brandTerms: brand.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
        queryFilter: filter,
      });
      const cmp = baseline ? compare(baseline, analysis) : null;
      setRan({ key: inputKey, analysis, cmp });
    } catch (cause) {
      setRan(null);
      setError(cause instanceof Error ? cause.message : "Could not read the data.");
    }
  }

  const a = result?.analysis;
  const field =
    "mt-2 block w-full min-w-0 rounded-lg border border-hairline bg-background p-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <section className="rounded-xl border border-hairline bg-wash p-5 sm:p-7">
      <label className="block text-sm font-semibold text-foreground">
        Drop the zip Search Console downloads
        <input
          type="file"
          multiple
          accept=".zip,.csv,.tsv,application/zip,text/csv,text/plain"
          onChange={(event) => readFiles(event.target.files)}
          className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-background"
        />
      </label>
      {!canInflate() && (
        <p className="mt-2 text-sm text-muted-foreground">
          This browser cannot open zip files here. Unzip the download and select the CSV files instead.
        </p>
      )}
      <div role="status">
        {fileNotes.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {fileNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </div>
      <label className="mt-5 block text-sm font-semibold text-foreground">
        Brand terms, optional, separated by commas
        <input value={brand} onChange={(event) => setBrand(event.target.value)} className={field} />
      </label>
      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-foreground">
          Did you filter by query before exporting? Only needed if the zip has no Filters file.
        </legend>
        <div className="mt-2 flex flex-wrap gap-6 text-sm text-foreground">
          {(
            [
              ["unsure", "Not sure"],
              ["no", "No query filter"],
              ["yes", "Yes, a query filter"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input type="radio" name="filtered" checked={filter === value} onChange={() => setFilter(value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          Re-checking after 28 days? Add your earlier baseline
        </summary>
        <label className="mt-3 block text-sm text-muted-foreground">
          Baseline file downloaded from this tool
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => readBaseline(event.target.files)}
            className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-background"
          />
        </label>
        {baselineNote && <p className="mt-2 text-sm text-muted-foreground">{baselineNote}</p>}
      </details>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="rounded-lg bg-brand px-5 py-3 font-semibold text-background">
          Find actions
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
        {a ? headline(a) : ""}
      </div>
      {a && result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground">{headline(a)}</h2>
          {a.scenarioQueries >= 1 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Scenario, not a forecast: {fmt(a.scenarioQueries)} extra clicks over this same period if the flagged queries
              matched your site&apos;s own median CTR at their position. Formula: impressions × (band median CTR − current CTR), summed.
              {a.scenarioPages >= 1 &&
                ` Pages scenario, shown separately: ${fmt(a.scenarioPages)} extra clicks. Do not add it to the query figure; the two tables overlap.`}
            </p>
          )}
          {coverageLine(a) && <p className="mt-3 text-sm text-muted-foreground">{coverageLine(a)}</p>}
          {a.notices.map((note) => (
            <p key={note} className="mt-3 rounded-lg border border-hairline bg-background p-3 text-sm text-foreground">
              {note}
            </p>
          ))}

          <h3 className="mt-8 text-lg font-bold text-foreground">Your own CTR by position</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Median CTR of your non-brand query rows with at least 30 impressions. A band needs 5 rows to show a median.
          </p>
          <ul className="mt-3 space-y-3">
            {a.queryBands.map((b) => (
              <li key={b.label}>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{b.label}:</span>{" "}
                  {b.median === null ? `not enough data (${b.rows} rows)` : `${pct(b.median)} median across ${b.rows} rows`}
                </p>
                <div className="mt-1 h-3 w-full rounded-sm border border-hairline" aria-hidden="true">
                  {b.median === null ? (
                    <div
                      className="h-full w-full"
                      style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--gold-ink) 0 2px, transparent 2px 8px)" }}
                    />
                  ) : (
                    <div
                      className="h-full bg-brand"
                      style={{ width: `${Math.min(100, (b.median / Math.max(...a.queryBands.map((x) => x.median ?? 0), 0.01)) * 100)}%` }}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>

          {a.actions.length > 0 && (
            <>
              <h3 className="mt-8 text-lg font-bold text-foreground">Ranked actions</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Pages first because a page is directly fixable. Top {Math.min(25, a.actions.length)} of {a.actions.length} shown; the CSV holds all.
              </p>
              <div className="mt-3 overflow-x-auto" tabIndex={0} aria-label="Ranked actions table">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline text-foreground">
                      <th scope="col" className="p-2">#</th>
                      <th scope="col" className="p-2">Action</th>
                      <th scope="col" className="p-2">Item</th>
                      <th scope="col" className="p-2">Impr.</th>
                      <th scope="col" className="p-2">Clicks</th>
                      <th scope="col" className="p-2">CTR</th>
                      <th scope="col" className="p-2">Pos.</th>
                      <th scope="col" className="p-2">Next step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.actions.slice(0, 25).map((x, i) => (
                      <tr key={`${x.type}-${x.item}`} className="border-b border-hairline/60 align-top">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2 font-semibold">{TYPE_LABEL[x.type]}</td>
                        <th scope="row" className="max-w-[260px] break-all p-2 font-normal">{x.item}</th>
                        <td className="p-2">{fmt(x.impressions)}</td>
                        <td className="p-2">{fmt(x.clicks)}</td>
                        <td className="p-2">{pct(x.ctr)}</td>
                        <td className="p-2">{x.position === null ? "" : x.position.toFixed(1)}</td>
                        <td className="max-w-[320px] p-2 text-muted-foreground">{x.nextStep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Scroll the table sideways on a narrow screen.</p>
            </>
          )}

          {a.brand && (
            <p className="mt-6 text-sm text-foreground">
              Rows matching your brand terms: {fmt(a.brand.clicks)} clicks ({pct(a.brand.share)} of exported clicks, a term-match heuristic).
              {a.brand.share >= 0.6 &&
                " Most clicks come from people already searching your name. The actions above are the non-brand growth list."}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => downloadText("search-console-actions.csv", actionsCsv(a), "text/csv")}
              className="rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background">
              Download action CSV
            </button>
            <button type="button"
              onClick={() => downloadText(`gsc-action-baseline-${a.start || "start"}-${a.end || "end"}.json`, JSON.stringify(makeBaseline(a)), "application/json")}
              className="rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background">
              Download baseline
            </button>
            <button type="button" onClick={() => drawPng(a)}
              className="rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background">
              Download chart PNG
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-hairline bg-background p-4 text-sm text-foreground">
            <p className="font-semibold">Re-check in 28 days</p>
            <p className="mt-1 text-muted-foreground">
              Work the list, then export the same report for the same number of days and drop the new zip here with your baseline added above. The tool compares the flagged rows with the unflagged ones so a site-wide change is not mistaken for your edits.
            </p>
          </div>

          {result.cmp && (
            <div className="mt-6 rounded-lg border border-hairline bg-background p-4 text-sm text-foreground" aria-live="polite">
              <p className="font-semibold">Change since your baseline</p>
              <p className="mt-2">
                Flagged rows: {fmt(result.cmp.flagged.clicksBefore)} clicks then, {fmt(result.cmp.flagged.clicksAfter)} now
                {result.cmp.flaggedChange !== null && ` (${result.cmp.flaggedChange >= 0 ? "+" : ""}${result.cmp.flaggedChange.toFixed(0)}%)`};
                {" "}{result.cmp.flagged.matched} of {result.cmp.flagged.n} found in the new export. Rows missing from the new export are not counted as a loss.
              </p>
              <p className="mt-2">
                Unflagged control rows: {fmt(result.cmp.control.clicksBefore)} clicks then, {fmt(result.cmp.control.clicksAfter)} now
                {result.cmp.controlChange !== null && ` (${result.cmp.controlChange >= 0 ? "+" : ""}${result.cmp.controlChange.toFixed(0)}%)`};
                {" "}{result.cmp.control.matched} of {result.cmp.control.n} found.
              </p>
              <p className="mt-2 text-muted-foreground">{result.cmp.verdict}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
