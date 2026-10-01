"use client";

import { useState } from "react";
import { downloadText } from "@/lib/fetch-page-client";

type Row = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  position: number;
};
type Issue = {
  query: string;
  pages: Row[];
  impressions: number;
  owner: string;
  closeness: number;
};

const SAMPLE = `Query,Page,Clicks,Impressions,CTR,Position
local seo bracknell,https://example.co.uk/services/local-seo-bracknell/,24,850,2.82%,5.4
local seo bracknell,https://example.co.uk/blog/local-seo-guide/,8,620,1.29%,6.1
seo consultant reading,https://example.co.uk/services/seo-reading/,15,480,3.13%,4.8
seo consultant reading,https://example.co.uk/about/,2,120,1.67%,18.2
technical seo audit,https://example.co.uk/services/technical-seo-audit/,30,1100,2.73%,3.6
technical seo audit,https://example.co.uk/blog/technical-audit/,5,420,1.19%,4.1
seo pricing,https://example.co.uk/pricing/,12,350,3.43%,7.2`;

function csvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const text = input.replace(/^\uFEFF/, "");
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

function parse(input: string): Row[] {
  const table = csvRows(input);
  const headerAt = table.findIndex((row) => {
    const lower = row.map((cell) => cell.toLowerCase());
    return (
      lower.some((cell) => /^(query|top queries|search query)$/.test(cell)) &&
      lower.some((cell) => /^(page|top pages|url|landing page)$/.test(cell))
    );
  });
  if (headerAt < 0)
    throw new Error("Use a table with Query and Page columns in the same CSV.");
  const headers = table[headerAt].map((cell) => cell.toLowerCase());
  const column = (names: string[]) =>
    headers.findIndex((cell) => names.includes(cell));
  const q = column(["query", "top queries", "search query"]);
  const p = column(["page", "top pages", "url", "landing page"]);
  const c = column(["clicks"]);
  const i = column(["impressions"]);
  const pos = column(["position", "average position"]);
  if ([c, i, pos].some((index) => index < 0)) {
    throw new Error(
      "The CSV also needs Clicks, Impressions and Position columns.",
    );
  }
  const rows = table.slice(headerAt + 1).flatMap((cells) => {
    const query = cells[q]?.trim();
    const page = cells[p]?.trim();
    const clicks = Number((cells[c] || "").replace(/,/g, ""));
    const impressions = Number((cells[i] || "").replace(/,/g, ""));
    const position = Number((cells[pos] || "").replace(/,/g, ""));
    return query &&
      page &&
      Number.isFinite(clicks) &&
      Number.isFinite(impressions) &&
      Number.isFinite(position) &&
      clicks >= 0 &&
      impressions > 0 &&
      position > 0
      ? [{ query, page, clicks, impressions, position }]
      : [];
  });
  if (!rows.length)
    throw new Error(
      "No valid query and page rows with impressions were found.",
    );
  return rows;
}

function analyse(rows: Row[]): Issue[] {
  const grouped = new Map<string, Map<string, Row>>();
  for (const row of rows) {
    const key = row.query.toLocaleLowerCase();
    const pages = grouped.get(key) || new Map<string, Row>();
    const previous = pages.get(row.page);
    pages.set(
      row.page,
      previous
        ? {
            ...previous,
            clicks: previous.clicks + row.clicks,
            impressions: previous.impressions + row.impressions,
            position:
              (previous.position * previous.impressions +
                row.position * row.impressions) /
              (previous.impressions + row.impressions),
          }
        : row,
    );
    grouped.set(key, pages);
  }
  return [...grouped.values()]
    .flatMap((group) => {
      const pages = [...group.values()].sort(
        (a, b) => b.clicks - a.clicks || a.position - b.position,
      );
      if (pages.length < 2) return [];
      const impressions = pages.reduce(
        (sum, page) => sum + page.impressions,
        0,
      );
      const positions = pages.map((page) => page.position);
      const gap = Math.max(...positions) - Math.min(...positions);
      return [
        {
          query: pages[0].query,
          pages,
          impressions,
          owner: pages[0].page,
          closeness: 1 / (1 + gap),
        },
      ];
    })
    .sort((a, b) => b.impressions * b.closeness - a.impressions * a.closeness);
}

const csvCell = (value: string | number) =>
  `"${String(value).replace(/"/g, '""')}"`;
function exportCsv(issues: Issue[]) {
  const lines = [
    "Query,Page,Clicks,Impressions,Position,Impression share,Suggested owner,Combined impressions",
  ];
  for (const issue of issues) {
    for (const page of issue.pages) {
      lines.push(
        [
          issue.query,
          page.page,
          page.clicks,
          page.impressions,
          page.position.toFixed(1),
          `${((100 * page.impressions) / issue.impressions).toFixed(1)}%`,
          issue.owner,
          issue.impressions,
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return lines.join("\r\n");
}

export default function KeywordCannibalisationChecker() {
  const [input, setInput] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState("");
  function run() {
    setError("");
    try {
      const rows = parse(input);
      setRowCount(rows.length);
      setIssues(analyse(rows));
    } catch (cause) {
      setIssues([]);
      setRowCount(0);
      setError(
        cause instanceof Error ? cause.message : "Could not read the CSV.",
      );
    }
  }
  async function readFile(file?: File) {
    if (!file) return;
    setError("");
    setIssues([]);
    setInput(await file.text());
  }
  return (
    <section className="rounded-xl border border-hairline bg-wash p-5 sm:p-7">
      <label className="block text-sm font-semibold text-foreground">
        Search Console CSV file
        <input
          type="file"
          accept=".csv,.tsv,text/csv,text/plain"
          onChange={(event) => readFile(event.target.files?.[0])}
          className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-background"
        />
      </label>
      <label className="mt-5 block text-sm font-semibold text-foreground">
        Or paste rows with Query, Page, Clicks, Impressions and Position columns
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={8}
          className="mt-2 block w-full min-w-0 rounded-lg border border-hairline bg-background p-3 font-mono text-xs text-foreground focus-visible:outline-2 focus-visible:outline-brand"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={run}
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-background"
        >
          Check overlap
        </button>
        <button
          type="button"
          onClick={() => {
            setInput(SAMPLE);
            setIssues([]);
            setError("");
          }}
          className="rounded-lg border border-hairline px-5 py-3 font-semibold text-foreground hover:bg-background"
        >
          Load sample dataset
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        All analysis happens in this browser. No file is uploaded.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {rowCount > 0 && (
        <div className="mt-8" aria-live="polite">
          <h2 className="text-2xl font-bold text-foreground">
            {issues.length} flagged {issues.length === 1 ? "query" : "queries"} from {rowCount} rows
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ranked by combined impressions adjusted for how close the page
            positions are. The owner suggestion uses most clicks, then best
            position. Review search intent before making changes.
          </p>
          {issues.length > 0 && (
            <button
              type="button"
              onClick={() =>
                downloadText(
                  "cannibalisation-findings.csv",
                  exportCsv(issues),
                  "text/csv",
                )
              }
              className="mt-4 rounded-lg border border-hairline px-4 py-2 font-semibold text-foreground hover:bg-background"
            >
              Download flagged CSV
            </button>
          )}
          <div className="mt-5 space-y-5">
            {issues.map((issue) => (
              <article
                key={issue.query}
                className="rounded-lg border border-hairline bg-background p-4"
              >
                <h3 className="break-words font-bold text-foreground">
                  {issue.query}
                </h3>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  Suggested owner: {issue.owner}
                </p>
                <p className="text-sm text-muted-foreground">
                  {issue.impressions.toLocaleString()} combined impressions
                </p>
                <div
                  className="mt-3 overflow-x-auto"
                  tabIndex={0}
                  aria-label={`Page comparison for ${issue.query}`}
                >
                  <table className="w-full min-w-[570px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-hairline text-foreground">
                        <th scope="col" className="p-2">
                          Page
                        </th>
                        <th scope="col" className="p-2">
                          Clicks
                        </th>
                        <th scope="col" className="p-2">
                          Impressions
                        </th>
                        <th scope="col" className="p-2">
                          Position
                        </th>
                        <th scope="col" className="p-2">
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {issue.pages.map((page) => (
                        <tr
                          key={page.page}
                          className="border-b border-hairline/60"
                        >
                          <th
                            scope="row"
                            className="max-w-[320px] break-all p-2 font-normal"
                          >
                            {page.page}
                          </th>
                          <td className="p-2">{page.clicks}</td>
                          <td className="p-2">{page.impressions}</td>
                          <td className="p-2">{page.position.toFixed(1)}</td>
                          <td className="p-2">
                            {(
                              (100 * page.impressions) /
                              issue.impressions
                            ).toFixed(1)}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Scroll the table sideways on a narrow screen.
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
