export type EngineId =
  | "googleUK"
  | "googleUS"
  | "googleFR"
  | "googlePT"
  | "googleES"
  | "googleDE"
  | "googleRU"
  | "googleNL";

export interface KeywordEngine {
  id: EngineId;
  label: string;
  hl: string;
  gl: string;
}

export const KEYWORD_ENGINES: readonly KeywordEngine[] = [
  { id: "googleUK", label: "United Kingdom", hl: "en-GB", gl: "GB" },
  { id: "googleUS", label: "United States", hl: "en", gl: "US" },
  { id: "googleFR", label: "France", hl: "fr", gl: "FR" },
  { id: "googlePT", label: "Portugal", hl: "pt-PT", gl: "PT" },
  { id: "googleES", label: "Spain", hl: "es", gl: "ES" },
  { id: "googleDE", label: "Germany", hl: "de", gl: "DE" },
  { id: "googleRU", label: "Russia", hl: "ru", gl: "RU" },
  { id: "googleNL", label: "Netherlands", hl: "nl", gl: "NL" },
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export interface KeywordRow {
  keyword: string;
  regions: string[];
}

export interface ScrapePlan {
  queries: string[];
  totalCandidateQueries: number;
  totalRequests: number;
  capped: boolean;
}

export type AutocompleteResult =
  | { status: "success"; suggestions: string[] }
  | { status: "timeout" }
  | { status: "error" }
  | { status: "cancelled" };

export interface ScrapeProgress {
  completedRequests: number;
  totalRequests: number;
  uniqueKeywords: number;
  keywordRegionPairs: number;
  emptyResponses: number;
  excludedSuggestions: number;
  timeoutCount: number;
  errorCount: number;
}

export interface ScrapeSummary extends ScrapeProgress {
  status: "complete" | "cancelled";
  rows: KeywordRow[];
}

export function parseUniqueLines(value: string): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const rawLine of value.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/\s+/g, " ");
    const key = line.toLocaleLowerCase();
    if (!line || seen.has(key)) continue;
    seen.add(key);
    lines.push(line);
  }

  return lines;
}

export function validateScrapeSetup(keywordText: string, regionCount: number): string | null {
  if (parseUniqueLines(keywordText).length === 0) {
    return "Enter at least one seed keyword before starting.";
  }
  if (regionCount === 0) {
    return "Select at least one Google region before starting.";
  }
  return null;
}

export function buildScrapePlan(
  keywordText: string,
  positiveText: string,
  regionCount: number,
  maxRequests: number,
): ScrapePlan {
  if (regionCount < 1) {
    return { queries: [], totalCandidateQueries: 0, totalRequests: 0, capped: false };
  }

  const keywords = parseUniqueLines(keywordText);
  const positives = parseUniqueLines(positiveText);
  const baseQueries = keywords.flatMap((keyword) =>
    positives.length > 0 ? positives.map((positive) => `${positive} ${keyword}`) : [keyword],
  );
  const candidates = [
    ...baseQueries,
    ...baseQueries.flatMap((query) => ALPHABET.map((letter) => `${query} ${letter}`)),
  ];
  const maxQueries = Math.max(0, Math.floor(maxRequests / regionCount));
  const queries = candidates.slice(0, maxQueries);

  return {
    queries,
    totalCandidateQueries: candidates.length,
    totalRequests: queries.length * regionCount,
    capped: queries.length < candidates.length,
  };
}

function matchesNegative(keyword: string, negatives: readonly string[]): boolean {
  const comparableKeyword = keyword.toLocaleLowerCase();
  return negatives.some((negative) => comparableKeyword.includes(negative.toLocaleLowerCase()));
}

function rowsFromMap(
  resultMap: Map<string, { keyword: string; regionIds: Set<EngineId> }>,
  engines: readonly KeywordEngine[],
): KeywordRow[] {
  const labels = new Map(engines.map((engine) => [engine.id, engine.label]));
  return Array.from(resultMap.values(), ({ keyword, regionIds }) => ({
    keyword,
    regions: engines
      .filter((engine) => regionIds.has(engine.id))
      .map((engine) => labels.get(engine.id) ?? engine.label),
  }));
}

export async function runKeywordScrape(options: {
  plan: ScrapePlan;
  engines: readonly KeywordEngine[];
  negativeText: string;
  signal: AbortSignal;
  request: (
    query: string,
    engine: KeywordEngine,
    signal: AbortSignal,
  ) => Promise<AutocompleteResult>;
  isCurrent: () => boolean;
  onProgress?: (progress: ScrapeProgress) => void;
  onRows?: (rows: KeywordRow[]) => void;
  batchSize?: number;
}): Promise<ScrapeSummary> {
  const {
    plan,
    engines,
    negativeText,
    signal,
    request,
    isCurrent,
    onProgress,
    onRows,
    batchSize = 4,
  } = options;
  const negatives = parseUniqueLines(negativeText);
  const resultMap = new Map<string, { keyword: string; regionIds: Set<EngineId> }>();
  let completedRequests = 0;
  let keywordRegionPairs = 0;
  let emptyResponses = 0;
  let excludedSuggestions = 0;
  let timeoutCount = 0;
  let errorCount = 0;

  const currentProgress = (): ScrapeProgress => ({
    completedRequests,
    totalRequests: plan.totalRequests,
    uniqueKeywords: resultMap.size,
    keywordRegionPairs,
    emptyResponses,
    excludedSuggestions,
    timeoutCount,
    errorCount,
  });
  const cancelledSummary = (): ScrapeSummary => ({
    status: "cancelled",
    ...currentProgress(),
    rows: rowsFromMap(resultMap, engines),
  });

  for (let offset = 0; offset < plan.queries.length; offset += batchSize) {
    if (signal.aborted || !isCurrent()) return cancelledSummary();

    const queryBatch = plan.queries.slice(offset, offset + batchSize);
    const tasks = queryBatch.flatMap((query) =>
      engines.map(async (engine) => ({
        engine,
        result: await request(query, engine, signal).catch(
          (): AutocompleteResult => ({ status: signal.aborted ? "cancelled" : "error" }),
        ),
      })),
    );
    const responses = await Promise.all(tasks);

    // A stopped or superseded run must not update the current run's UI.
    if (signal.aborted || !isCurrent()) return cancelledSummary();

    for (const { engine, result } of responses) {
      if (result.status === "cancelled") continue;
      completedRequests += 1;

      if (result.status === "timeout") {
        timeoutCount += 1;
        continue;
      }
      if (result.status === "error") {
        errorCount += 1;
        continue;
      }
      if (result.suggestions.length === 0) {
        emptyResponses += 1;
        continue;
      }

      for (const rawSuggestion of result.suggestions) {
        const keyword = typeof rawSuggestion === "string" ? rawSuggestion.trim() : "";
        if (!keyword) continue;
        if (matchesNegative(keyword, negatives)) {
          excludedSuggestions += 1;
          continue;
        }
        const key = keyword.toLocaleLowerCase();
        const existing = resultMap.get(key);
        if (existing) {
          if (!existing.regionIds.has(engine.id)) {
            existing.regionIds.add(engine.id);
            keywordRegionPairs += 1;
          }
        } else {
          resultMap.set(key, { keyword, regionIds: new Set([engine.id]) });
          keywordRegionPairs += 1;
        }
      }
    }

    const rows = rowsFromMap(resultMap, engines);
    onRows?.(rows);
    onProgress?.(currentProgress());
  }

  return {
    status: "complete",
    ...currentProgress(),
    rows: rowsFromMap(resultMap, engines),
  };
}

export function neutralizeCsvFormula(value: string): string {
  return /^(?:\s*[=+\-@]|[\t\r\n])/.test(value) ? `'${value}` : value;
}

function quoteCsvField(value: string): string {
  return `"${neutralizeCsvFormula(value).replace(/"/g, '""')}"`;
}

export function keywordRowsToCsv(rows: readonly KeywordRow[]): string {
  const header = `${quoteCsvField("Keyword")},${quoteCsvField("Regions")}`;
  const body = rows.map(
    (row) => `${quoteCsvField(row.keyword)},${quoteCsvField(row.regions.join(", "))}`,
  );
  return [header, ...body].join("\r\n");
}
