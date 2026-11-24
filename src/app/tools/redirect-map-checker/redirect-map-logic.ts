export type ParsedUrl = {
  raw: string;
  absolute: boolean;
  scheme: string;
  host: string;
  path: string;
  query: string;
};

export type Malformed = { list: string; line: number; text: string; reason: string };
export type MapRow = { line: number; source: string; target: string };

export type Section = {
  id: string;
  title: string;
  why: string;
  ran: boolean;
  count: number;
  columns: string[];
  rows: string[][];
};

export type Report = {
  summary: string;
  stats: {
    oldTotal: number;
    oldWithRedirect: number;
    mapRows: number;
    validRows: number;
    newTotal: number;
    oldDuplicateLines: number;
  };
  notes: string[];
  sections: Section[];
};

const URL_START = /^https?:\/\/[^\s/?#]+/i;

export function splitLines(text: string): string[] {
  return text.replace(/^﻿/, "").split(/\r\n|\n|\r/);
}

export function looksLikeUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  return URL_START.test(value) || (value.startsWith("/") && !value.startsWith("//"));
}

export function parseUrl(input: string): ParsedUrl | null {
  let value = input.trim();
  const hash = value.indexOf("#");
  if (hash >= 0) value = value.slice(0, hash);
  if (!looksLikeUrl(value)) return null;
  let scheme = "";
  let host = "";
  let rest = value;
  const m = /^(https?):\/\/([^\s/?#]+)(.*)$/i.exec(value);
  if (m) {
    scheme = m[1].toLowerCase();
    host = m[2].toLowerCase();
    rest = m[3];
  }
  const q = rest.indexOf("?");
  let path = q >= 0 ? rest.slice(0, q) : rest;
  const query = q >= 0 ? rest.slice(q) : "";
  if (path === "") path = "/";
  return { raw: input.trim(), absolute: !!m, scheme, host, path, query };
}

function stripSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.replace(/\/+$/, "") || "/" : path;
}

export type KeyMode = "abs" | "rel";

export function strictKey(u: ParsedUrl, mode: KeyMode): string {
  const p = stripSlash(u.path) + u.query;
  return mode === "abs" ? `${u.scheme}://${u.host}${p}` : p;
}

export function looseKey(u: ParsedUrl, mode: KeyMode): string {
  const p = stripSlash(u.path) + u.query;
  return mode === "abs" ? `${u.host.replace(/^www\./, "")}${p}` : p;
}

function facetDiff(a: ParsedUrl, b: ParsedUrl, mode: KeyMode): string[] {
  const out: string[] = [];
  if (mode === "abs") {
    if (a.scheme !== b.scheme) out.push("http/https");
    if (a.host.startsWith("www.") !== b.host.startsWith("www.")) out.push("www");
  }
  if (a.path !== b.path) out.push("trailing slash");
  return out;
}

export function parseCsvLine(line: string, delimiter = ","): string[] {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"' && cur.trim() === "") {
      quoted = true;
      cur = "";
    } else if (ch === delimiter) {
      cells.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function splitPair(line: string): string[] {
  if (line.includes("\t")) return parseCsvLine(line, "\t");
  const arrow = /\s(?:->|=>|→)\s/.exec(line);
  if (arrow) {
    return [line.slice(0, arrow.index), line.slice(arrow.index + arrow[0].length)].map((s) =>
      s.trim().replace(/^"(.*)"$/, "$1"),
    );
  }
  return parseCsvLine(line, ",");
}

export function parseMap(text: string): { rows: MapRow[]; malformed: Malformed[]; headerSkipped: boolean } {
  const rows: MapRow[] = [];
  const malformed: Malformed[] = [];
  let headerSkipped = false;
  let seenFirst = false;
  const lines = splitLines(text);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = splitPair(line);
    const a = (cells[0] ?? "").trim();
    const b = (cells[1] ?? "").trim();
    if (!seenFirst) {
      seenFirst = true;
      if (!looksLikeUrl(a) && !looksLikeUrl(b) && cells.length >= 2) {
        headerSkipped = true;
        continue;
      }
    }
    if (!a) {
      malformed.push({ list: "Redirect map", line: i + 1, text: line, reason: "Missing source URL" });
    } else if (!b) {
      malformed.push({ list: "Redirect map", line: i + 1, text: line, reason: "Missing target URL" });
    } else if (!looksLikeUrl(a)) {
      malformed.push({ list: "Redirect map", line: i + 1, text: line, reason: "Source is not a URL or path starting with /" });
    } else if (!looksLikeUrl(b.replace(/#.*$/, "")) ) {
      malformed.push({ list: "Redirect map", line: i + 1, text: line, reason: "Target is not a URL or path starting with /" });
    } else rows.push({ line: i + 1, source: a, target: b });
  }
  return { rows, malformed, headerSkipped };
}

export function parseList(text: string, list: string): { urls: { line: number; value: string }[]; malformed: Malformed[] } {
  const urls: { line: number; value: string }[] = [];
  const malformed: Malformed[] = [];
  let seenFirst = false;
  const lines = splitLines(text);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    line = line.replace(/^"(.*)"$/, "$1").trim();
    if (!seenFirst) {
      seenFirst = true;
      if (!looksLikeUrl(line) && !/\s/.test(line) && !line.includes(".") && !line.includes("/")) continue;
    }
    if (!looksLikeUrl(line.replace(/#.*$/, ""))) {
      malformed.push({ list, line: i + 1, text: line, reason: "Not a URL or path starting with /" });
    } else urls.push({ line: i + 1, value: line });
  }
  return { urls, malformed };
}

function pct(n: number, d: number): string {
  return d === 0 ? "0%" : `${Math.round((n / d) * 1000) / 10}%`;
}

function isRoot(u: ParsedUrl): boolean {
  return u.path === "/" && u.query === "";
}

export const SAMPLE_OLD = `https://old-shop.example/
https://old-shop.example/about-us
https://old-shop.example/services/seo
https://old-shop.example/services/ppc
https://old-shop.example/blog/post-1
https://old-shop.example/blog/post-2
https://old-shop.example/blog/post-3
https://old-shop.example/contact
https://old-shop.example/pricing
https://old-shop.example/team
https://old-shop.example/careers
https://old-shop.example/products/blue-widget
`;

export const SAMPLE_MAP = `old,new
https://old-shop.example/,https://new-shop.example/
https://old-shop.example/about-us,https://new-shop.example/about/
https://old-shop.example/services/seo,https://new-shop.example/services/seo-consultant/
https://old-shop.example/services/seo,https://new-shop.example/services/search/
https://old-shop.example/services/ppc -> https://new-shop.example/services/ppc/
https://old-shop.example/blog/post-1,https://new-shop.example/blog/post-1/
https://old-shop.example/blog/post-1,https://new-shop.example/blog/post-1/
https://old-shop.example/blog/post-2,https://new-shop.example/
https://old-shop.example/blog/post-3,https://new-shop.example/
https://old-shop.example/contact,https://old-shop.example/contact-us
https://old-shop.example/contact-us,https://new-shop.example/contact/
https://old-shop.example/pricing,https://old-shop.example/plans
https://old-shop.example/plans,https://old-shop.example/pricing
https://old-shop.example/team,https://old-shop.example/team
https://old-shop.example/blog/post-9,https://new-shop.example/blog/post-9/
https://old-shop.example/careers,
`;

export const SAMPLE_NEW = `https://new-shop.example/
https://new-shop.example/about
https://new-shop.example/services/seo-consultant/
https://new-shop.example/services/ppc/
https://new-shop.example/blog/post-1/
https://new-shop.example/contact/
`;

export function analyse(oldText: string, mapText: string, newText: string): Report {
  const map = parseMap(mapText);
  const oldList = parseList(oldText, "Old URLs");
  const newList = parseList(newText, "New URLs");
  const hasOld = oldList.urls.length > 0;
  const hasNew = newList.urls.length > 0;
  const notes: string[] = [];

  // Parse everything once.
  const parsedMap: { row: MapRow; s: ParsedUrl; t: ParsedUrl }[] = [];
  for (const row of map.rows) {
    const s = parseUrl(row.source);
    const t = parseUrl(row.target);
    if (!s || !t) {
      map.malformed.push({ list: "Redirect map", line: row.line, text: `${row.source} | ${row.target}`, reason: "Could not read URL" });
      continue;
    }
    parsedMap.push({ row, s, t });
  }
  const parsedOld = oldList.urls.map((u) => ({ u, p: parseUrl(u.value)! }));
  const parsedNew = newList.urls.map((u) => ({ u, p: parseUrl(u.value)! }));

  let anyRel = false;
  let anyAbs = false;
  const tally = (p: ParsedUrl) => {
    if (p.absolute) anyAbs = true;
    else anyRel = true;
  };
  parsedMap.forEach((r) => {
    tally(r.s);
    tally(r.t);
  });
  parsedOld.forEach((r) => tally(r.p));
  parsedNew.forEach((r) => tally(r.p));
  const mode: KeyMode = anyRel ? "rel" : "abs";
  if (anyRel && anyAbs) {
    notes.push("The lists mix full URLs and paths, so I compared path and query only and ignored the domain.");
  }
  if (map.headerSkipped) notes.push("The first line of the redirect map looked like a header, so I skipped it.");
  const extraCols = mapText.length > 0 && splitLines(mapText).some((l) => l.trim() && splitPair(l.trim()).length > 2);
  if (extraCols) notes.push("Some map lines have more than two columns. I used the first two and ignored the rest.");

  // Old list, deduplicated on the loose key.
  const oldByLoose = new Map<string, ParsedUrl>();
  let oldDuplicateLines = 0;
  for (const { p } of parsedOld) {
    const k = looseKey(p, mode);
    if (oldByLoose.has(k)) oldDuplicateLines++;
    else oldByLoose.set(k, p);
  }
  const newByLoose = new Map<string, ParsedUrl>();
  for (const { p } of parsedNew) {
    const k = looseKey(p, mode);
    if (!newByLoose.has(k)) newByLoose.set(k, p);
  }

  // Map indexes.
  const sourceLoose = new Set<string>();
  const targetsBySource = new Map<string, { targets: Map<string, string>; lines: number[]; s: ParsedUrl }>();
  const pairCounts = new Map<string, { count: number; lines: number[]; s: string; t: string }>();
  const firstTarget = new Map<string, string>();
  const strictParsed = new Map<string, ParsedUrl>();
  for (const { row, s, t } of parsedMap) {
    const sk = strictKey(s, mode);
    const tk = strictKey(t, mode);
    sourceLoose.add(looseKey(s, mode));
    strictParsed.set(sk, s);
    if (!strictParsed.has(tk)) strictParsed.set(tk, t);
    let entry = targetsBySource.get(sk);
    if (!entry) {
      entry = { targets: new Map(), lines: [], s };
      targetsBySource.set(sk, entry);
    }
    if (!entry.targets.has(tk)) entry.targets.set(tk, t.raw);
    entry.lines.push(row.line);
    if (!firstTarget.has(sk)) firstTarget.set(sk, tk);
    const pk = sk + "\u0000" + tk;
    const pc = pairCounts.get(pk);
    if (pc) {
      pc.count++;
      pc.lines.push(row.line);
    } else pairCounts.set(pk, { count: 1, lines: [row.line], s: s.raw, t: t.raw });
  }

  // 1 old URLs with no redirect
  const noRedirect: string[][] = [];
  let withRedirect = 0;
  oldByLoose.forEach((p, k) => {
    if (sourceLoose.has(k)) withRedirect++;
    else noRedirect.push([p.raw]);
  });

  // 2 sources not in old list
  const extra: string[][] = [];
  if (hasOld) {
    const seen = new Set<string>();
    for (const { row, s } of parsedMap) {
      const k = looseKey(s, mode);
      if (!oldByLoose.has(k) && !seen.has(k)) {
        seen.add(k);
        extra.push([s.raw, `Map line ${row.line}`]);
      }
    }
  }

  // 3 conflicts and duplicates
  const conflicts: string[][] = [];
  targetsBySource.forEach((e) => {
    if (e.targets.size > 1) {
      conflicts.push([e.s.raw, Array.from(e.targets.values()).join("  |  "), `Map lines ${e.lines.join(", ")}`]);
    }
  });
  const dupes: string[][] = [];
  pairCounts.forEach((pc) => {
    if (pc.count > 1) dupes.push([pc.s, pc.t, `${pc.count} times, map lines ${pc.lines.join(", ")}`]);
  });

  // 4 chains and loops (iterative, memoised)
  type Res = { final: string; hops: number; loop: boolean };
  const memo = new Map<string, Res>();
  const onCycle = new Set<string>();
  const cycles: string[][] = [];
  const sourcesStrict = firstTarget;
  sourcesStrict.forEach((_t, start) => {
    if (memo.has(start)) return;
    const stack: string[] = [];
    const index = new Map<string, number>();
    let cur: string | undefined = start;
    let base: Res | null = null;
    while (true) {
      if (cur === undefined) break;
      const m = memo.get(cur);
      if (m) {
        base = m;
        break;
      }
      const at = index.get(cur);
      if (at !== undefined) {
        const cyc = stack.slice(at);
        cycles.push(cyc);
        cyc.forEach((n) => onCycle.add(n));
        for (let i = stack.length - 1; i >= 0; i--) memo.set(stack[i], { final: "", hops: Infinity, loop: true });
        stack.length = 0;
        base = null;
        break;
      }
      const next = sourcesStrict.get(cur);
      if (next === undefined) {
        base = { final: cur, hops: 0, loop: false };
        break;
      }
      index.set(cur, stack.length);
      stack.push(cur);
      cur = next;
    }
    if (stack.length > 0 && base) {
      let r = base;
      for (let i = stack.length - 1; i >= 0; i--) {
        r = { final: r.final, hops: r.hops + 1, loop: r.loop };
        memo.set(stack[i], r);
      }
    }
  });
  const display = (k: string) => strictParsed.get(k)?.raw ?? k;
  const walk = (start: string): string => {
    const parts = [display(start)];
    let cur = sourcesStrict.get(start);
    let n = 0;
    while (cur !== undefined && n < 12) {
      parts.push(display(cur));
      cur = sourcesStrict.get(cur);
      n++;
      if (cur === start) {
        parts.push(display(start));
        break;
      }
    }
    if (cur !== undefined && n >= 12) parts.push("...");
    return parts.join(" > ");
  };
  const chains: string[][] = [];
  memo.forEach((r, k) => {
    if (onCycle.has(k)) return;
    if (r.loop) chains.push([display(k), "(ends in a loop)", "leads into a loop", walk(k)]);
    else if (r.hops >= 2) chains.push([display(k), display(r.final), `${r.hops} hops`, walk(k)]);
  });
  const loops: string[][] = cycles.map((cyc) => {
    const members = cyc.map(display);
    return [members[0], members.length === 1 ? "Redirects to itself" : `${members.length} URLs in a loop`, [...members, members[0]].join(" > ")];
  });

  // 5 many-to-one
  const bySources = new Map<string, Set<string>>();
  for (const { s, t } of parsedMap) {
    const tk = strictKey(t, mode);
    let set = bySources.get(tk);
    if (!set) {
      set = new Set();
      bySources.set(tk, set);
    }
    set.add(strictKey(s, mode));
  }
  const distinctSources = targetsBySource.size;
  const manyToOne: string[][] = [];
  bySources.forEach((set, tk) => {
    const n = set.size;
    const tp = strictParsed.get(tk)!;
    const root = isRoot(tp);
    const heavy = n >= 10 && n > distinctSources * 0.1;
    if ((root && n > 1) || heavy) {
      const why = root && heavy ? "Homepage and large share" : root ? "Homepage" : "Large share";
      manyToOne.push([tp.raw, String(n), pct(n, distinctSources), why]);
    }
  });
  manyToOne.sort((a, b) => Number(b[1]) - Number(a[1]));

  // 6 targets missing from the new list
  const notInNew: string[][] = [];
  if (hasNew) {
    const seenT = new Map<string, { raw: string; n: number }>();
    for (const { t } of parsedMap) {
      const k = looseKey(t, mode);
      const e = seenT.get(k);
      if (e) e.n++;
      else seenT.set(k, { raw: t.raw, n: 1 });
    }
    seenT.forEach((e, k) => {
      if (!newByLoose.has(k)) notInNew.push([e.raw, `${e.n} map ${e.n === 1 ? "row" : "rows"}`]);
    });
  }

  // 7 malformed
  const malformedAll = [...map.malformed, ...oldList.malformed, ...newList.malformed];
  const malformedRows = malformedAll.map((m) => [m.text, `${m.list}, line ${m.line}`, m.reason]);

  // 8 advisories
  const advisories: string[][] = [];
  const seenAdv = new Set<string>();
  const advise = (where: string, mapUrl: ParsedUrl, listUrl: ParsedUrl) => {
    const diffs = facetDiff(mapUrl, listUrl, mode);
    if (diffs.length === 0) return;
    const key = where + mapUrl.raw + listUrl.raw;
    if (seenAdv.has(key)) return;
    seenAdv.add(key);
    advisories.push([mapUrl.raw, listUrl.raw, `${diffs.join(", ")} differs`, where]);
  };
  if (hasOld) {
    for (const { s } of parsedMap) {
      const o = oldByLoose.get(looseKey(s, mode));
      if (o) advise("Map source vs old list", s, o);
    }
  }
  if (hasNew) {
    for (const { t } of parsedMap) {
      const n = newByLoose.get(looseKey(t, mode));
      if (n) advise("Map target vs new list", t, n);
    }
  }

  const sec = (
    id: string,
    title: string,
    why: string,
    ran: boolean,
    columns: string[],
    rows: string[][],
  ): Section => ({ id, title, why, ran, count: ran ? rows.length : 0, columns, rows: ran ? rows : [] });

  const sections: Section[] = [
    sec("no-redirect", "Old URLs with no redirect", "These old URLs have no row in the map. After launch they will return an error unless something else handles them.", hasOld, ["Old URL"], noRedirect),
    sec("extra-sources", "Map sources not in the old URL list", "These rows redirect URLs you did not list. They may be typos, stale rows or URLs missing from your inventory.", hasOld, ["Map source", "Where"], extra),
    sec("conflicts", "Same source, different targets", "A URL can only redirect to one place. These sources appear with more than one target, so one row will be wrong or ignored.", true, ["Source", "Targets", "Where"], conflicts),
    sec("duplicates", "Exact duplicate rows", "The same source and target appear more than once. Remove the repeats so the map stays easy to review.", true, ["Source", "Target", "Where"], dupes),
    sec("chains", "Redirect chains inside the map", "The target of one row is the source of another. Visitors and crawlers take extra hops. Point the first row straight at the final target.", true, ["First source", "Final target", "Hops", "Path"], chains),
    sec("loops", "Redirect loops and self-redirects", "These URLs redirect round in a circle or to themselves, so the page can never load. Fix each one before launch.", true, ["Start", "Type", "Path"], loops),
    sec("many-to-one", "Targets receiving many redirects", "Check these are deliberate. Sending many old pages to one target, especially the homepage, can be right for retired pages and wrong for pages that have a closer match.", true, ["Target", "Sources", "Share of map", "Why flagged"], manyToOne),
    sec("not-in-new", "Targets not found in the new URL list", "These targets are not in the new site list you supplied. They may be typos or pages that do not exist on the new site yet.", hasNew, ["Target", "Used by"], notInNew),
    sec("malformed", "Malformed lines", "These lines could not be read as URLs or pairs, so they were left out of every other check.", true, ["Line text", "Where", "Problem"], malformedRows),
    sec("advisories", "Advisory: slash, http/https and www differences", "These match a listed URL once I ignore the difference, but they are written differently. Make the map use the exact form your server uses.", hasOld || hasNew, ["Map URL", "List URL", "Difference", "Compared"], advisories),
  ];

  const oldTotal = oldByLoose.size;
  const summary = hasOld
    ? `${withRedirect} of ${oldTotal} old URLs have a redirect.`
    : `${parsedMap.length} valid map rows read. Add your old URL list to see which old URLs have no redirect.`;

  return {
    summary,
    stats: {
      oldTotal,
      oldWithRedirect: withRedirect,
      mapRows: map.rows.length + map.malformed.filter((m) => m.list === "Redirect map").length,
      validRows: parsedMap.length,
      newTotal: newByLoose.size,
      oldDuplicateLines,
    },
    notes,
    sections,
  };
}

function csvCell(v: string): string {
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function reportToCsv(report: Report): string {
  const lines = ["Section,Item,Detail 1,Detail 2,Detail 3"];
  for (const s of report.sections) {
    if (!s.ran) continue;
    for (const r of s.rows) {
      lines.push([s.title, ...r].map(csvCell).join(","));
    }
  }
  return lines.join("\r\n") + "\r\n";
}

export function summaryText(report: Report): string {
  const out = [report.summary];
  for (const s of report.sections) {
    out.push(s.ran ? `${s.title}: ${s.count}` : `${s.title}: not checked`);
  }
  out.push("Checked in the browser against the map only. Live status codes not tested.");
  return out.join("\n");
}
