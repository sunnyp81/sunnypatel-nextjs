// Pure logic for the Search Console export action finder. Runs in the browser; nothing here sends data anywhere.
export type Kind = "queries" | "pages" | "dates" | "devices" | "filters" | "ignored" | "unknown";
export type Table = { kind: Kind; headers: string[]; rows: string[][] };
export type Metric = { key: string; clicks: number; impressions: number; position: number | null };
export type Band = { id: number; label: string; max: number };
export type BandStat = { label: string; rows: number; median: number | null };
export type ActionType = "A" | "B" | "C" | "D" | "F";
export type Action = {
  type: ActionType;
  itemType: "query" | "page" | "device";
  item: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
  band: string;
  bandMedian: number | null;
  scenario: number;
  nextStep: string;
};
export type Totals = { clicks: number; impressions: number };
export type Analysis = {
  start: string;
  end: string;
  days: number;
  totals: Totals | null;
  queryRows: Metric[];
  pageRows: Metric[];
  queryFilter: "yes" | "no" | "unsure";
  filterSignature: string;
  coverage: { visible: Totals; remainder: Totals } | null;
  hasPosition: boolean;
  queryBands: BandStat[];
  pageBands: BandStat[];
  actions: Action[];
  scenarioQueries: number;
  scenarioPages: number;
  brand: { terms: string[]; clicks: number; share: number } | null;
  notices: string[];
};
export type Baseline = {
  version: 1;
  start: string;
  end: string;
  days: number;
  queryFilter: "yes" | "no" | "unsure";
  filterSignature: string;
  totals: Totals | null;
  queryBands: BandStat[];
  flagged: { itemType: string; item: string; type: string; clicks: number; impressions: number; position: number | null }[];
  control: { itemType: string; item: string; clicks: number; impressions: number; position: number | null }[];
};

export const MIN_IMPRESSIONS = 30;
export const MIN_BAND_ROWS = 5;
export const BANDS: Band[] = [
  { id: 1, label: "Positions 1 to 3", max: 3 },
  { id: 2, label: "Positions 3.1 to 6", max: 6 },
  { id: 3, label: "Positions 6.1 to 10", max: 10 },
  { id: 4, label: "Positions 10.1 to 20", max: 20 },
];

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delimiter =
    (firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
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
  if (quoted) throw new Error("A quoted value in the file is never closed. Check the export is complete.");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function classify(text: string): Table {
  const all = parseCsv(text);
  const headers = (all[0] || []).map((cell) => cell.toLowerCase());
  const first = headers[0] || "";
  let kind: Kind = "unknown";
  if (/^(top queries|query|queries|search query)$/.test(first)) kind = "queries";
  else if (/^(top pages|page|pages|landing page)$/.test(first)) kind = "pages";
  else if (first === "date") kind = "dates";
  else if (first === "device") kind = "devices";
  else if (/filter/.test(first)) kind = "filters";
  else if (/^(country|countries|search appearance|searchappearance)$/.test(first)) kind = "ignored";
  const body = all.slice(1);
  const bad = body.findIndex((row) => row.length !== headers.length);
  if (kind !== "unknown" && kind !== "ignored" && bad >= 0)
    throw new Error(
      `Row ${bad + 2} has ${body[bad].length} columns but the header has ${headers.length}. Quote any value that contains a comma.`,
    );
  return { kind, headers, rows: body };
}

const COUNT = /^(\d{1,3}(,\d{3})+|\d+)$/;
export const toCount = (value: string | undefined) => {
  const v = (value || "").trim();
  if (!COUNT.test(v)) return NaN;
  const n = Number(v.replace(/,/g, ""));
  return Number.isSafeInteger(n) ? n : NaN;
};

export function metrics(table: Table, label: string): { rows: Metric[]; hasPosition: boolean } {
  const ci = table.headers.indexOf("clicks");
  const ii = table.headers.indexOf("impressions");
  const pi = table.headers.findIndex((h) => /^(position|average position)$/.test(h));
  if (ci < 0 || ii < 0) throw new Error(`The ${label} table needs Clicks and Impressions columns. Tick them before exporting.`);
  const rows: Metric[] = [];
  table.rows.forEach((cells, index) => {
    const key = (cells[0] || "").trim();
    const clicks = toCount(cells[ci]);
    const impressions = toCount(cells[ii]);
    const rawPos = pi >= 0 ? (cells[pi] || "").trim() : "";
    const position = rawPos === "" ? null : Number(rawPos);
    if (!key || !Number.isFinite(clicks) || !Number.isFinite(impressions) || (position !== null && !Number.isFinite(position)))
      throw new Error(
        `Row ${index + 2} of the ${label} table has no usable value. Use whole numbers from the English-language export, and fix or remove the row.`,
      );
    rows.push({ key, clicks, impressions, position });
  });
  if (!rows.length) throw new Error(`The ${label} table has no rows.`);
  return { rows, hasPosition: pi >= 0 };
}

export function bandOf(position: number | null): Band | null {
  if (position === null) return null;
  return BANDS.find((b, i) => position <= b.max && (i === 0 || position > BANDS[i - 1].max)) || null;
}

const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function bandStats(rows: Metric[]): BandStat[] {
  return BANDS.map((band) => {
    const ctrs = rows
      .filter((r) => r.impressions >= MIN_IMPRESSIONS && bandOf(r.position)?.id === band.id)
      .map((r) => r.clicks / r.impressions);
    return {
      label: band.label,
      rows: ctrs.length,
      median: ctrs.length >= MIN_BAND_ROWS ? median(ctrs) : null,
    };
  });
}

const STEP = {
  A: "Filter Search Console by this query, open Pages to see which page ranks, add a section that answers the query directly and link to that page from two relevant pages.",
  B: "Filter Search Console by this query to find the page, rewrite its title and description to name the query, then re-check in 28 days.",
  C: "Search the query yourself. If a search feature or a different intent owns the result, change the page's angle or drop the target.",
  D: "Rewrite this page's title and description. This is the one action here with a known page.",
  F: "Check title truncation and mobile load on your top pages.",
};

export function analyse(input: {
  tables: Table[];
  brandTerms: string[];
  queryFilter: "yes" | "no" | "unsure";
}): Analysis {
  const notices: string[] = [];
  const by = (kind: Kind) => input.tables.find((t) => t.kind === kind);
  const q = by("queries");
  if (!q) throw new Error("No Queries table found. Export the Performance report with the Queries tab and drop the zip here.");
  const qm = metrics(q, "Queries");
  const pm = by("pages") ? metrics(by("pages")!, "Pages") : null;
  const hasPosition = qm.hasPosition;
  if (!hasPosition) notices.push("The Queries table has no Average position column, so the CTR actions are off. Tick CTR and Average position before exporting.");

  let start = "";
  let end = "";
  let days = 0;
  let totals: Totals | null = null;
  const d = by("dates");
  if (d) {
    const ci = d.headers.indexOf("clicks");
    const ii = d.headers.indexOf("impressions");
    if (ci < 0 || ii < 0) throw new Error("The Dates table needs Clicks and Impressions columns.");
    let c = 0;
    let i = 0;
    const dates: string[] = [];
    d.rows.forEach((cells, index) => {
      const cc = toCount(cells[ci]);
      const ic = toCount(cells[ii]);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cells[0] || "") || !Number.isFinite(cc) || !Number.isFinite(ic))
        throw new Error(`Row ${index + 2} of the Dates table has no usable date, clicks or impressions.`);
      if (dates.includes(cells[0]))
        throw new Error(`The Dates table repeats the date ${cells[0]}. Export one report for one period.`);
      c += cc;
      i += ic;
      dates.push(cells[0]);
    });
    dates.sort();
    const valid = (s: string) => {
      const [y, m, dd] = s.split("-").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, dd));
      return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === dd;
    };
    if (dates.some((s) => !valid(s))) throw new Error("The Dates table holds a date that does not exist.");
    const span = Math.round((Date.parse(dates[dates.length - 1]) - Date.parse(dates[0])) / 86_400_000) + 1;
    if (span !== dates.length) throw new Error("The Dates table has gaps. Export one continuous period.");
    start = dates[0] || "";
    end = dates[dates.length - 1] || "";
    days = dates.length;
    totals = { clicks: c, impressions: i };
  } else notices.push("No Dates table found, so the coverage line and the period length are off.");

  const visible = qm.rows.reduce(
    (s, r) => ({ clicks: s.clicks + r.clicks, impressions: s.impressions + r.impressions }),
    { clicks: 0, impressions: 0 },
  );
  let coverage: Analysis["coverage"] = null;
  if (totals) {
    if (visible.clicks > totals.clicks || visible.impressions > totals.impressions)
      throw new Error("The query rows add up to more than the chart totals. Check the files come from the same report, date range, search type and filters.");
    coverage = {
      visible,
      remainder: { clicks: totals.clicks - visible.clicks, impressions: totals.impressions - visible.impressions },
    };
  }

  const brand = (key: string) => input.brandTerms.some((t) => key.toLowerCase().includes(t));
  const nonBrand = qm.rows.filter((r) => !brand(r.key));
  const queryBands = hasPosition ? bandStats(nonBrand) : bandStats([]);
  const pageBands = pm && pm.hasPosition ? bandStats(pm.rows) : bandStats([]);
  const actions: Action[] = [];

  if (pm && pm.hasPosition) {
    for (const r of pm.rows) {
      const band = bandOf(r.position);
      if (!band || r.impressions < 200) continue;
      const med = pageBands[band.id - 1].median;
      const ctr = r.clicks / r.impressions;
      if (med !== null && ctr < 0.5 * med)
        actions.push({
          type: "D", itemType: "page", item: r.key, clicks: r.clicks, impressions: r.impressions, ctr,
          position: r.position, band: band.label, bandMedian: med, scenario: r.impressions * (med - ctr), nextStep: STEP.D,
        });
    }
  }
  if (hasPosition) {
    for (const r of nonBrand) {
      if (r.impressions < 100 || r.position === null) continue;
      const band = bandOf(r.position);
      const ctr = r.clicks / r.impressions;
      const med = band ? queryBands[band.id - 1].median : null;
      let type: ActionType | null = null;
      let scenario = 0;
      if (r.clicks === 0 && r.position <= 10 && band) {
        type = "C";
        scenario = med !== null ? r.impressions * Math.max(0, med - ctr) : 0;
      } else if (band && med !== null && ctr < 0.5 * med) {
        type = "B";
        scenario = r.impressions * (med - ctr);
      } else if (r.position >= 8 && r.position <= 20) type = "A";
      if (type && band)
        actions.push({
          type, itemType: "query", item: r.key, clicks: r.clicks, impressions: r.impressions, ctr,
          position: r.position, band: band.label, bandMedian: med, scenario, nextStep: STEP[type],
        });
    }
  }
  const dev = by("devices");
  if (dev) {
    try {
      const dm = metrics(dev, "Devices");
      const desk = dm.rows.find((r) => /^desktop$/i.test(r.key));
      const mob = dm.rows.find((r) => /^mobile$/i.test(r.key));
      if (desk && mob && desk.impressions >= 500 && mob.impressions >= 500 && desk.position !== null && mob.position !== null &&
        Math.abs(desk.position - mob.position) <= 2 && mob.clicks / mob.impressions < 0.6 * (desk.clicks / desk.impressions))
        actions.push({
          type: "F", itemType: "device", item: "Mobile compared with desktop", clicks: mob.clicks, impressions: mob.impressions,
          ctr: mob.clicks / mob.impressions, position: mob.position, band: "", bandMedian: desk.clicks / desk.impressions,
          scenario: 0, nextStep: STEP.F,
        });
    } catch {
      notices.push("The Devices table could not be read, so the device check was skipped.");
    }
  }
  const order = { D: 0, C: 1, B: 2, A: 3, F: 4 } as const;
  actions.sort((a, b) => order[a.type] - order[b.type] || b.impressions - a.impressions);

  let brandInfo: Analysis["brand"] = null;
  if (input.brandTerms.length) {
    const eligible = qm.rows.filter((r) => r.impressions >= MIN_IMPRESSIONS);
    const total = eligible.reduce((s, r) => s + r.clicks, 0);
    const bc = eligible.filter((r) => brand(r.key)).reduce((s, r) => s + r.clicks, 0);
    if (total >= 30) brandInfo = { terms: input.brandTerms, clicks: bc, share: bc / total };
  }

  const filt = by("filters");
  let queryFilter = input.queryFilter;
  let filterSignature = "";
  if (filt) {
    filterSignature = filt.rows
      .filter((r) => !/^(date|period)/i.test(r[0] || ""))
      .map((r) => r.join("="))
      .join("|");
    queryFilter = filt.rows.some((r) => /^quer/i.test(r[0] || "")) ? "yes" : "no";
  }

  return {
    start, end, days, totals, queryRows: qm.rows, pageRows: pm ? pm.rows : [], queryFilter, filterSignature, coverage, hasPosition,
    queryBands, pageBands, actions,
    scenarioQueries: actions.filter((a) => a.itemType === "query" && (a.type === "B" || a.type === "C")).reduce((s, a) => s + a.scenario, 0),
    scenarioPages: actions.filter((a) => a.type === "D").reduce((s, a) => s + a.scenario, 0),
    brand: brandInfo, notices,
  };
}

export function makeBaseline(a: Analysis): Baseline {
  const flaggedKeys = new Set(a.actions.map((x) => `${x.itemType}:${x.itemType === "query" ? x.item.toLowerCase() : x.item}`));
  const row = (itemType: string, r: Metric) => ({ itemType, item: r.key, clicks: r.clicks, impressions: r.impressions, position: r.position });
  const control = [
    ...a.queryRows.filter((r) => r.impressions >= 100 && !flaggedKeys.has(`query:${r.key.toLowerCase()}`)).map((r) => row("query", r)),
    ...a.pageRows.filter((r) => r.impressions >= 200 && !flaggedKeys.has(`page:${r.key}`)).map((r) => row("page", r)),
  ];
  return {
    version: 1, start: a.start, end: a.end, days: a.days, queryFilter: a.queryFilter, filterSignature: a.filterSignature,
    totals: a.totals, queryBands: a.queryBands,
    flagged: a.actions.filter((x) => x.itemType !== "device").map((x) => ({
      itemType: x.itemType, item: x.item, type: x.type, clicks: x.clicks, impressions: x.impressions, position: x.position,
    })),
    control,
  };
}

export type Group = { n: number; matched: number; clicksBefore: number; clicksAfter: number };
export type DimCompare = { flagged: Group; unflagged: Group; flaggedChange: number | null; unflaggedChange: number | null; verdict: string };
export type Compare = { queries: DimCompare; pages: DimCompare | null };

function dimCompare(
  base: Baseline,
  itemType: "query" | "page",
  now: Map<string, Metric>,
): DimCompare {
  const norm = (s: string) => (itemType === "query" ? s.toLowerCase() : s);
  const sum = (items: { itemType: string; item: string; clicks: number; impressions: number }[]): Group => {
    const mine = items.filter((x) => x.itemType === itemType);
    let matched = 0;
    let cb = 0;
    let ca = 0;
    for (const it of mine) {
      const hit = now.get(norm(it.item));
      if (!hit || it.impressions < MIN_IMPRESSIONS || hit.impressions < MIN_IMPRESSIONS) continue;
      matched++;
      cb += it.clicks;
      ca += hit.clicks;
    }
    return { n: mine.length, matched, clicksBefore: cb, clicksAfter: ca };
  };
  const f = sum(base.flagged);
  const u = sum(base.control);
  const change = (g: Group) => (g.clicksBefore >= MIN_IMPRESSIONS ? ((g.clicksAfter - g.clicksBefore) / g.clicksBefore) * 100 : null);
  const fc = change(f);
  const uc = change(u);
  let verdict = "Not enough clicks in the matched rows to compare. Re-check after a longer period.";
  if (fc !== null && uc !== null)
    verdict =
      Math.abs(fc - uc) <= 10
        ? "The flagged and unflagged rows moved by similar amounts. This comparison cannot separate your edits from broader changes."
        : fc > uc
          ? "The flagged rows moved more than the unflagged rows. That is consistent with your edits helping, but it does not prove it."
          : "The flagged rows moved less than the unflagged rows. Check that the edits were made and have been recrawled.";
  return { flagged: f, unflagged: u, flaggedChange: fc, unflaggedChange: uc, verdict };
}

export function compare(base: Baseline, now: Analysis): Compare {
  if (base.version !== 1 || !Array.isArray(base.flagged) || !Array.isArray(base.control) || !Number.isFinite(base.days) || base.days <= 0)
    throw new Error("That file is not a baseline from this tool.");
  if (base.days !== now.days)
    throw new Error(`The periods differ in length (${base.days} days then, ${now.days} days now). Re-export the same number of days.`);
  if (base.queryFilter === "unsure" || now.queryFilter === "unsure")
    throw new Error("Say whether each export used a query filter, or include the Filters file in the zip, so the two exports can be matched.");
  if (base.queryFilter !== now.queryFilter || (base.filterSignature || "") !== now.filterSignature)
    throw new Error("The filters differ between the two exports, or cannot be confirmed to match, so the figures are not comparable.");
  const q = new Map(now.queryRows.map((r) => [r.key.toLowerCase(), r]));
  const p = new Map(now.pageRows.map((r) => [r.key, r]));
  return {
    queries: dimCompare(base, "query", q),
    pages: now.pageRows.length ? dimCompare(base, "page", p) : null,
  };
}
