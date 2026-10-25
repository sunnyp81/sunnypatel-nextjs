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
      if (!cells[0] || !Number.isFinite(cc) || !Number.isFinite(ic))
        throw new Error(`Row ${index + 2} of the Dates table has no usable date, clicks or impressions.`);
      c += cc;
      i += ic;
      dates.push(cells[0]);
    });
    dates.sort();
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
  const order = { D: 0, B: 1, C: 2, A: 3, F: 4 } as const;
  actions.sort((a, b) => order[a.type] - order[b.type] || b.impressions - a.impressions);

  let brandInfo: Analysis["brand"] = null;
  if (input.brandTerms.length) {
    const bc = qm.rows.filter((r) => brand(r.key)).reduce((s, r) => s + r.clicks, 0);
    if (visible.clicks >= 30) brandInfo = { terms: input.brandTerms, clicks: bc, share: bc / visible.clicks };
  }

  const filt = by("filters");
  let queryFilter = input.queryFilter;
  if (filt) {
    const hit = filt.rows.some((r) => r.some((c) => /quer/i.test(c))) || filt.headers.some((h) => /quer/i.test(h));
    queryFilter = hit ? "yes" : "no";
  }

  return {
    start, end, days, totals, queryRows: qm.rows, pageRows: pm ? pm.rows : [], queryFilter, coverage, hasPosition,
    queryBands, pageBands, actions,
    scenarioQueries: actions.filter((a) => a.itemType === "query" && (a.type === "B" || a.type === "C")).reduce((s, a) => s + a.scenario, 0),
    scenarioPages: actions.filter((a) => a.type === "D").reduce((s, a) => s + a.scenario, 0),
    brand: brandInfo, notices,
  };
}

export function makeBaseline(a: Analysis): Baseline {
  const flaggedKeys = new Set(a.actions.map((x) => `${x.itemType}:${x.item.toLowerCase()}`));
  const row = (itemType: string, r: Metric) => ({ itemType, item: r.key, clicks: r.clicks, impressions: r.impressions, position: r.position });
  const control = [
    ...a.queryRows.filter((r) => r.impressions >= 100 && !flaggedKeys.has(`query:${r.key.toLowerCase()}`)).map((r) => row("query", r)),
    ...a.pageRows.filter((r) => r.impressions >= 200 && !flaggedKeys.has(`page:${r.key.toLowerCase()}`)).map((r) => row("page", r)),
  ];
  return {
    version: 1, start: a.start, end: a.end, days: a.days, queryFilter: a.queryFilter, totals: a.totals, queryBands: a.queryBands,
    flagged: a.actions.filter((x) => x.itemType !== "device").map((x) => ({
      itemType: x.itemType, item: x.item, type: x.type, clicks: x.clicks, impressions: x.impressions, position: x.position,
    })),
    control,
  };
}

export type Compare = {
  flagged: { n: number; matched: number; clicksBefore: number; clicksAfter: number; impressionsBefore: number; impressionsAfter: number };
  control: { n: number; matched: number; clicksBefore: number; clicksAfter: number; impressionsBefore: number; impressionsAfter: number };
  flaggedChange: number | null;
  controlChange: number | null;
  verdict: string;
};

export function compare(base: Baseline, now: Analysis): Compare {
  if (base.version !== 1 || !Array.isArray(base.flagged) || !Array.isArray(base.control))
    throw new Error("That file is not a baseline from this tool.");
  if (Math.abs(base.days - now.days) > 2)
    throw new Error(`The periods differ in length (${base.days} days then, ${now.days} days now). Re-export the same number of days.`);
  if (base.queryFilter !== now.queryFilter)
    throw new Error("The query filter state differs between the two exports, so the figures are not comparable.");
  const nowQ = new Map(now.queryRows.map((r) => [r.key.toLowerCase(), r]));
  const nowP = new Map(now.pageRows.map((r) => [r.key.toLowerCase(), r]));
  const sum = (items: Baseline["flagged"] | Baseline["control"]) => {
    let matched = 0;
    let cb = 0;
    let ca = 0;
    let ib = 0;
    let ia = 0;
    for (const it of items) {
      const hit = (it.itemType === "page" ? nowP : nowQ).get(it.item.toLowerCase());
      if (!hit) continue;
      matched++;
      cb += it.clicks; ca += hit.clicks; ib += it.impressions; ia += hit.impressions;
    }
    return { n: items.length, matched, clicksBefore: cb, clicksAfter: ca, impressionsBefore: ib, impressionsAfter: ia };
  };
  const f = sum(base.flagged);
  const c = sum(base.control);
  const change = (x: { clicksBefore: number; clicksAfter: number }) =>
    x.clicksBefore >= MIN_IMPRESSIONS ? ((x.clicksAfter - x.clicksBefore) / x.clicksBefore) * 100 : null;
  const fc = change(f);
  const cc = change(c);
  let verdict = "Not enough clicks in the matched rows to compare. Re-check after a longer period.";
  if (fc !== null && cc !== null)
    verdict =
      Math.abs(fc - cc) <= 10
        ? "Both sets moved together. The change is consistent with a broad shift, not with your edits."
        : fc > cc
          ? "The flagged rows moved more than the unflagged control rows. That is consistent with your edits helping, but it does not prove it."
          : "The flagged rows moved less than the unflagged control rows. Review whether the edits were made and indexed.";
  return { flagged: f, control: c, flaggedChange: fc, controlChange: cc, verdict };
}
