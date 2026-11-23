"use client";

import { useState } from "react";
import { downloadText } from "@/lib/fetch-page-client";
import {
  analyse,
  reportToCsv,
  summaryText,
  SAMPLE_MAP,
  SAMPLE_NEW,
  SAMPLE_OLD,
  type Report,
} from "./redirect-map-logic";

const ROW_CAP = 200;
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const inputClass =
  "mt-2 block w-full min-w-0 rounded-lg border border-hairline bg-background p-3 font-mono text-xs text-foreground focus-visible:outline-2 focus-visible:outline-brand";
const fileClass =
  "mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-background";
const ghostBtn = `rounded-lg border border-hairline px-5 py-3 font-semibold text-foreground hover:bg-background ${focus}`;

type FieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onFile: (file?: File) => void;
};

function Field({ id, label, placeholder, value, onChange, onFile }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={9}
        spellCheck={false}
        placeholder={placeholder}
        className={inputClass}
      />
      <label htmlFor={`${id}-file`} className="mt-2 block text-xs text-muted-foreground">
        Or load a .csv or .txt file
      </label>
      <input
        id={`${id}-file`}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        onChange={(e) => onFile(e.target.files?.[0])}
        className={fileClass}
      />
    </div>
  );
}

export default function RedirectMapChecker() {
  const [oldText, setOldText] = useState("");
  const [mapText, setMapText] = useState("");
  const [newText, setNewText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function readFile(file: File | undefined, set: (v: string) => void) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set(String(reader.result ?? ""));
    reader.onerror = () => setMessage("Could not read that file.");
    reader.readAsText(file);
  }

  function run() {
    setCopied(false);
    if (!mapText.trim()) {
      setReport(null);
      setMessage("Add your redirect map first. Each line needs an old URL and a new URL.");
      return;
    }
    setMessage("");
    setReport(analyse(oldText, mapText, newText));
  }

  function loadExample() {
    setOldText(SAMPLE_OLD);
    setMapText(SAMPLE_MAP);
    setNewText(SAMPLE_NEW);
    setReport(null);
    setMessage("");
  }

  function clearAll() {
    setOldText("");
    setMapText("");
    setNewText("");
    setReport(null);
    setMessage("");
  }

  async function copySummary() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(summaryText(report));
      setCopied(true);
    } catch {
      setMessage("The browser blocked copying. Select the summary text and copy it by hand.");
    }
  }

  return (
    <section className="rounded-xl border border-hairline bg-wash p-5 sm:p-7" aria-labelledby="rmc-tool-heading">
      <h2 id="rmc-tool-heading" className="sr-only">
        Redirect map checker
      </h2>
      <p className="text-sm text-muted-foreground">
        Runs in your browser. Nothing is uploaded and no request is made to any site.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Field
          id="rmc-old"
          label="1. Old URLs, one per line"
          placeholder="https://old.example/page-a"
          value={oldText}
          onChange={setOldText}
          onFile={(f) => readFile(f, setOldText)}
        />
        <Field
          id="rmc-map"
          label="2. Redirect map, old URL then new URL"
          placeholder="https://old.example/page-a,https://new.example/page-a/"
          value={mapText}
          onChange={setMapText}
          onFile={(f) => readFile(f, setMapText)}
        />
        <Field
          id="rmc-new"
          label="3. New site URLs, optional"
          placeholder="https://new.example/page-a/"
          value={newText}
          onChange={setNewText}
          onFile={(f) => readFile(f, setNewText)}
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className={`rounded-lg bg-brand px-5 py-3 font-semibold text-background ${focus}`}>
          Check redirect map
        </button>
        <button type="button" onClick={loadExample} className={ghostBtn}>
          Load example
        </button>
        <button type="button" onClick={clearAll} className={ghostBtn}>
          Clear
        </button>
      </div>
      <div aria-live="polite" className="mt-6">
        {message && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
        {report && <ReportView report={report} copied={copied} onCopy={copySummary} />}
      </div>
    </section>
  );
}

function ReportView({ report, copied, onCopy }: { report: Report; copied: boolean; onCopy: () => void }) {
  const issueSections = report.sections.filter((s) => s.ran && s.count > 0);
  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground" data-testid="rmc-summary">
        {report.summary}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {report.stats.validRows} map rows read
        {report.stats.newTotal > 0 ? `, ${report.stats.newTotal} new URLs listed` : ""}. This checks the map only. It
        does not test what your live site returns.
      </p>
      {report.notes.map((n) => (
        <p key={n} className="mt-1 text-sm text-muted-foreground">
          {n}
        </p>
      ))}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => downloadText("redirect-map-report.csv", reportToCsv(report), "text/csv")}
          className={`rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background ${focus}`}
        >
          Download report (CSV)
        </button>
        <button
          type="button"
          onClick={onCopy}
          className={`rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background ${focus}`}
        >
          {copied ? "Copied" : "Copy summary"}
        </button>
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {report.sections.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-background px-3 py-2 text-sm"
          >
            <span className="text-foreground">{s.title}</span>
            <span
              className={`shrink-0 font-semibold ${
                !s.ran
                  ? "text-muted-foreground"
                  : s.count > 0
                    ? "text-amber-800 dark:text-amber-400"
                    : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {s.ran ? s.count : "n/a"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-6">
        {issueSections.length === 0 && (
          <p className="text-sm text-foreground">No problems found in the checks that ran.</p>
        )}
        {issueSections.map((s) => (
          <article key={s.id} className="rounded-lg border border-hairline bg-background p-4" data-testid={`rmc-section-${s.id}`}>
            <h4 className="font-bold text-foreground">
              {s.title} <span className="font-normal text-muted-foreground">({s.count})</span>
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">{s.why}</p>
            <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label={`${s.title} table`}>
              <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
                <thead>
                  <tr>
                    {s.columns.map((c) => (
                      <th key={c} scope="col" className="border-b border-hairline px-2 py-1.5 font-semibold text-foreground">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.rows.slice(0, ROW_CAP).map((r, i) => (
                    <tr key={i}>
                      {s.columns.map((_, j) => (
                        <td key={j} className={`border-b border-hairline/60 px-2 py-1.5 align-top font-mono text-muted-foreground ${(r[j] ?? "").length > 24 ? "break-all" : "whitespace-nowrap"}`}>
                          {r[j] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {s.rows.length > ROW_CAP && (
              <p className="mt-2 text-xs text-muted-foreground">
                Showing the first {ROW_CAP} of {s.rows.length} rows. The CSV has them all.
              </p>
            )}
          </article>
        ))}
      </div>
      {report.sections.some((s) => !s.ran) && (
        <p className="mt-4 text-sm text-muted-foreground">
          Checks marked n/a need the old URL list (old URLs with no redirect, sources not in the list), the new URL list
          (targets not found) or either list (advisories).
        </p>
      )}
    </div>
  );
}
