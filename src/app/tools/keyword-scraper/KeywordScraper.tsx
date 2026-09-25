'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import {
  buildScrapePlan,
  countIntentBuckets,
  filterKeywordRows,
  INTENT_BUCKET_LABELS,
  KEYWORD_ENGINES,
  keywordRowsToCsv,
  parseUniqueLines,
  runKeywordScrape,
  topModifierWords,
  validateScrapeSetup,
  type AutocompleteResult,
  type EngineId,
  type IntentBucket,
  type KeywordEngine,
  type KeywordRow,
  type ScrapeProgress,
  type ScrapeSummary,
} from '@/lib/keyword-scraper';

type EngineState = Record<EngineId, boolean>;
type Notice = { tone: 'neutral' | 'success' | 'warning' | 'error'; text: string };

const DEFAULT_ENGINES: EngineState = {
  googleUK: true,
  googleUS: false,
  googleFR: false,
  googlePT: false,
  googleES: false,
  googleDE: false,
  googleRU: false,
  googleNL: false,
};
const REQUEST_LIMITS = [50, 100, 250] as const;
const REQUEST_TIMEOUT_MS = 6000;

function googleAutocomplete(
  query: string,
  engine: KeywordEngine,
  signal: AbortSignal,
): Promise<AutocompleteResult> {
  return new Promise((resolve) => {
    const callbackName = `_gac_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const script = document.createElement('script');
    let settled = false;

    const settle = (result: AutocompleteResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      signal.removeEventListener('abort', handleAbort);
      try {
        delete (window as unknown as Record<string, unknown>)[callbackName];
      } catch {
        (window as unknown as Record<string, unknown>)[callbackName] = undefined;
      }
      script.remove();
      resolve(result);
    };
    const handleAbort = () => settle({ status: 'cancelled' });
    const timer = window.setTimeout(
      () => settle({ status: 'timeout' }),
      REQUEST_TIMEOUT_MS,
    );

    if (signal.aborted) {
      settle({ status: 'cancelled' });
      return;
    }

    signal.addEventListener('abort', handleAbort, { once: true });
    (window as unknown as Record<string, unknown>)[callbackName] = (data: unknown) => {
      if (!Array.isArray(data)) {
        settle({ status: 'error' });
        return;
      }
      const suggestions = data[1];
      if (!Array.isArray(suggestions)) {
        settle({ status: 'error' });
        return;
      }
      settle({
        status: 'success',
        suggestions: suggestions.filter((item): item is string => typeof item === 'string'),
      });
    };
    script.id = callbackName;
    script.src = `https://www.google.com/complete/search?output=search&client=chrome&q=${encodeURIComponent(query)}&hl=${encodeURIComponent(engine.hl)}&gl=${encodeURIComponent(engine.gl)}&jsonp=${encodeURIComponent(callbackName)}`;
    script.onerror = () => settle({ status: 'error' });
    document.head.appendChild(script);
  });
}

function completionNotice(summary: ScrapeSummary, capped: boolean): Notice {
  const failures = summary.timeoutCount + summary.errorCount;
  const limitText = capped ? ' The selected request limit was reached.' : '';

  if (summary.uniqueKeywords === 0 && failures === 0) {
    if (summary.excludedSuggestions > 0) {
      return {
        tone: 'neutral',
        text: `Finished ${summary.completedRequests} requests. All ${summary.excludedSuggestions} returned suggestions were removed by your excluded words.${limitText}`,
      };
    }
    return {
      tone: 'neutral',
      text: `Finished ${summary.completedRequests} requests. Google returned no suggestions for these query and region combinations.${limitText}`,
    };
  }
  if (summary.uniqueKeywords === 0) {
    return {
      tone: 'error',
      text: `No suggestions were retrieved. ${summary.timeoutCount} requests timed out and ${summary.errorCount} failed. Try again with fewer regions or a smaller request limit.`,
    };
  }
  if (failures > 0) {
    return {
      tone: 'warning',
      text: `Found ${summary.uniqueKeywords} unique suggestions from ${summary.completedRequests} completed requests. ${summary.timeoutCount} timed out and ${summary.errorCount} failed.${limitText}`,
    };
  }
  return {
    tone: 'success',
    text: `Found ${summary.uniqueKeywords} unique suggestions across ${summary.keywordRegionPairs} keyword-region matches.${limitText}`,
  };
}

const inputClassName =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50';

export default function KeywordScraper() {
  const [keywords, setKeywords] = useState('seo consultant');
  const [positives, setPositives] = useState('how\nwhat\nbest\nnear me');
  const [negatives, setNegatives] = useState('');
  const [engines, setEngines] = useState<EngineState>(DEFAULT_ENGINES);
  const [requestLimit, setRequestLimit] = useState<(typeof REQUEST_LIMITS)[number]>(100);
  const [rows, setRows] = useState<KeywordRow[]>([]);
  const [activeBucket, setActiveBucket] = useState<IntentBucket | null>(null);
  const [activeModifier, setActiveModifier] = useState<string | null>(null);
  const [progress, setProgress] = useState<ScrapeProgress | null>(null);
  const [notice, setNotice] = useState<Notice>({
    tone: 'neutral',
    text: 'Choose your inputs and start when ready.',
  });
  const [isRunning, setIsRunning] = useState(false);

  const mountedRef = useRef(true);
  const nextRunIdRef = useRef(0);
  const activeRunIdRef = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      activeRunIdRef.current = null;
      controllerRef.current?.abort();
    };
  }, []);

  const activeEngines = useMemo(
    () => KEYWORD_ENGINES.filter((engine) => engines[engine.id]),
    [engines],
  );
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('demo') === '1') {
      const suggestions = [
        'seo audit checklist', 'how to do an seo audit', 'seo audit vs seo review',
        'best seo audit tool', 'seo audit near me', 'free seo audit online',
        'seo audit cost', 'seo audit template', 'technical seo audit',
        'seo audit for ecommerce', 'what is an seo audit', 'why seo audit matters',
        'when should you do an seo audit', 'who does an seo audit', 'where to start an seo audit',
        'which seo audit tool is best', 'can an seo audit improve rankings', 'does seo audit include backlinks',
        'is an seo audit worth it', 'are seo audit tools accurate', 'should i buy an seo audit',
        'seo audit vs site audit', 'seo audit versus content audit', 'seo audit or seo strategy',
        'seo audit tools compared', 'seo audit tool alternative', 'seo audit vs technical audit',
        'best free seo audit software', 'top seo audit services', 'cheap seo audit service',
        'seo audit price', 'seo audit tool review', 'buy seo audit report',
        'seo audit deals', 'seo audit agency near me', 'seo audit in london',
        'seo audit in manchester', 'seo audit in birmingham', 'seo audit in leeds',
        'seo audit in bristol', 'best seo audit in london', 'seo audit consultant near me',
        'seo audit report example', 'seo audit spreadsheet', 'seo audit google sheets',
        'seo audit wordpress', 'seo audit shopify', 'seo audit magento',
        'seo audit screaming frog', 'seo audit semrush', 'seo audit ahrefs',
        'seo audit for small business', 'seo audit for startups', 'seo audit for large websites',
        'seo audit automation', 'seo audit python script', 'seo audit 2026 checklist',
        'seo audit mobile usability', 'seo audit internal links', 'seo audit structured data',
      ];
      const demoRows = suggestions.map((keyword) => ({ keyword, regions: ['United Kingdom'] }));
      const frame = window.requestAnimationFrame(() => {
        setKeywords('seo audit');
        setEngines(DEFAULT_ENGINES);
        setRows(demoRows);
        setProgress({
          completedRequests: 100, totalRequests: 100, uniqueKeywords: demoRows.length,
          keywordRegionPairs: demoRows.length, emptyResponses: 0, excludedSuggestions: 0,
          timeoutCount: 0, errorCount: 0,
        });
        setNotice({ tone: 'success', text: `Demo: ${demoRows.length} fixture suggestions loaded without contacting Google.` });
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  const seeds = useMemo(() => parseUniqueLines(keywords), [keywords]);
  const intentCounts = useMemo(() => countIntentBuckets(rows), [rows]);
  const modifiers = useMemo(() => topModifierWords(rows, seeds), [rows, seeds]);
  const filteredRows = useMemo(
    () => filterKeywordRows(rows, activeBucket, activeModifier),
    [rows, activeBucket, activeModifier],
  );
  const hasFilter = activeBucket !== null || activeModifier !== null;
  const maxIntentCount = Math.max(1, ...Object.values(intentCounts));
  const resultsText = useMemo(
    () => filteredRows.map((row) => `${row.keyword}\t${row.regions.join(', ')}`).join('\n'),
    [filteredRows],
  );
  const filteredRegionPairs = useMemo(
    () => filteredRows.reduce((total, row) => total + row.regions.length, 0),
    [filteredRows],
  );
  const keywordRegionPairs = useMemo(
    () => rows.reduce((total, row) => total + row.regions.length, 0),
    [rows],
  );

  const handleStart = useCallback(async () => {
    const setupError = validateScrapeSetup(keywords, activeEngines.length);
    if (setupError) {
      setIsRunning(false);
      setNotice({ tone: 'error', text: setupError });
      trackEvent('keyword_error', {
        event_category: 'tool',
        tool: 'keyword_scraper',
        error_type: activeEngines.length === 0 ? 'no_region' : 'no_seed_keyword',
        region_count: activeEngines.length,
      });
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    const runId = ++nextRunIdRef.current;
    const plan = buildScrapePlan(keywords, positives, activeEngines.length, requestLimit);
    controllerRef.current = controller;
    activeRunIdRef.current = runId;
    setRows([]);
    setActiveBucket(null);
    setActiveModifier(null);
    setProgress({
      completedRequests: 0,
      totalRequests: plan.totalRequests,
      uniqueKeywords: 0,
      keywordRegionPairs: 0,
      emptyResponses: 0,
      excludedSuggestions: 0,
      timeoutCount: 0,
      errorCount: 0,
    });
    setNotice({
      tone: 'neutral',
      text: `Checking up to ${plan.totalRequests} query-region requests. You can stop at any time.`,
    });
    setIsRunning(true);
    trackEvent('keyword_start', {
      event_category: 'tool',
      tool: 'keyword_scraper',
      seed_count: parseUniqueLines(keywords).length,
      positive_word_count: parseUniqueLines(positives).length,
      region_count: activeEngines.length,
      request_limit: requestLimit,
      planned_request_count: plan.totalRequests,
    });

    const isCurrent = () =>
      mountedRef.current && activeRunIdRef.current === runId && !controller.signal.aborted;
    const summary = await runKeywordScrape({
      plan,
      engines: activeEngines,
      negativeText: negatives,
      signal: controller.signal,
      request: googleAutocomplete,
      isCurrent,
      batchSize: Math.max(1, Math.floor(8 / activeEngines.length)),
      onRows: (nextRows) => {
        if (isCurrent()) setRows(nextRows);
      },
      onProgress: (nextProgress) => {
        if (isCurrent()) setProgress(nextProgress);
      },
    });

    if (!isCurrent() || summary.status !== 'complete') return;
    activeRunIdRef.current = null;
    controllerRef.current = null;
    setRows(summary.rows);
    setProgress(summary);
    setIsRunning(false);
    setNotice(completionNotice(summary, plan.capped));
    const terminalCounts = {
      event_category: 'tool',
      tool: 'keyword_scraper',
      unique_keyword_count: summary.uniqueKeywords,
      keyword_region_pair_count: summary.keywordRegionPairs,
      completed_request_count: summary.completedRequests,
      empty_response_count: summary.emptyResponses,
      excluded_suggestion_count: summary.excludedSuggestions,
      timeout_count: summary.timeoutCount,
      error_count: summary.errorCount,
      region_count: activeEngines.length,
      request_limit_reached: plan.capped,
    };
    const hasRequestFailures = summary.timeoutCount > 0 || summary.errorCount > 0;
    if (summary.uniqueKeywords === 0 && hasRequestFailures) {
      trackEvent('keyword_error', {
        ...terminalCounts,
        error_type: 'request_failures_no_results',
      });
    } else {
      trackEvent('keyword_complete', {
        ...terminalCounts,
        outcome: hasRequestFailures
          ? 'partial'
          : summary.uniqueKeywords === 0
            ? 'empty'
            : 'success',
      });
    }
  }, [activeEngines, keywords, negatives, positives, requestLimit]);

  const handleStop = useCallback(() => {
    if (!isRunning) return;
    activeRunIdRef.current = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsRunning(false);
    setNotice({
      tone: 'warning',
      text: `Stopped after ${progress?.completedRequests ?? 0} requests. Results collected before stopping are still available.`,
    });
    trackEvent('keyword_stop', {
      event_category: 'tool',
      tool: 'keyword_scraper',
      outcome: 'stopped',
      unique_keyword_count: rows.length,
      keyword_region_pair_count: keywordRegionPairs,
      completed_request_count: progress?.completedRequests ?? 0,
      region_count: activeEngines.length,
    });
  }, [activeEngines.length, isRunning, keywordRegionPairs, progress?.completedRequests, rows.length]);

  const handleDownload = useCallback((exportAll = false) => {
    const exportRows = exportAll ? rows : filteredRows;
    if (exportRows.length === 0) return;
    const blob = new Blob([`\uFEFF${keywordRowsToCsv(exportRows)}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'keyword_suggestions.csv';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    trackEvent('keyword_download', {
      event_category: 'tool',
      tool: 'keyword_scraper',
      unique_keyword_count: exportRows.length,
      keyword_region_pair_count: exportRows.reduce((total, row) => total + row.regions.length, 0),
      region_count: new Set(exportRows.flatMap((row) => row.regions)).size,
    });
  }, [filteredRows, rows]);

  const toggleEngine = (id: EngineId) => {
    setEngines((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const statusColour =
    notice.tone === 'error'
      ? 'text-red-300'
      : notice.tone === 'warning'
        ? 'text-amber-300'
        : notice.tone === 'success'
          ? 'text-emerald-300'
          : 'text-muted-foreground';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
          Keyword Suggestions Tool
        </h1>
        <p className="mt-3 text-muted-foreground">
          Collect Google Autocomplete suggestions from up to eight regions. Results show the regions
          where each suggestion appeared; they do not include search volume or competition data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="flex flex-col gap-3 md:col-span-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="keyword-seeds" className="text-sm font-medium text-foreground">
              Seed keywords <span className="text-muted-foreground">(one per line)</span>
            </label>
            <textarea id="keyword-seeds" value={keywords} onChange={(event) => setKeywords(event.target.value)} disabled={isRunning} rows={10} className={`${inputClassName} resize-none font-mono`} placeholder={'seo consultant\nkeyword research'} />
          </div>

          <fieldset className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <legend className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Google regions</legend>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {KEYWORD_ENGINES.map((engine) => (
                <label key={engine.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-white/[0.04] focus-within:ring-2 focus-within:ring-brand/40">
                  <input type="checkbox" checked={engines[engine.id]} onChange={() => toggleEngine(engine.id)} disabled={isRunning} className="h-4 w-4 rounded border-white/20 accent-brand focus-visible:outline-none" />
                  {engine.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-3 md:col-span-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="keyword-positive-words" className="text-sm font-medium text-foreground">
              Query starters <span className="text-muted-foreground">(placed before each seed)</span>
            </label>
            <textarea id="keyword-positive-words" value={positives} onChange={(event) => setPositives(event.target.value)} disabled={isRunning} rows={6} className={`${inputClassName} resize-none font-mono`} placeholder={'how\nbest\nwhat\nnear me'} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="keyword-negative-words" className="text-sm font-medium text-foreground">
              Excluded words <span className="text-muted-foreground">(remove matching suggestions)</span>
            </label>
            <textarea id="keyword-negative-words" value={negatives} onChange={(event) => setNegatives(event.target.value)} disabled={isRunning} rows={5} className={`${inputClassName} resize-none font-mono`} placeholder={'jobs\nfree'} />
          </div>
        </div>

        <div className="flex flex-col justify-start gap-3 pt-0 md:col-span-2 md:pt-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="keyword-request-limit" className="text-sm font-medium text-foreground">Request limit</label>
            <select id="keyword-request-limit" value={requestLimit} onChange={(event) => setRequestLimit(Number(event.target.value) as (typeof REQUEST_LIMITS)[number])} disabled={isRunning} aria-describedby="keyword-request-limit-help" className={inputClassName}>
              {REQUEST_LIMITS.map((limit) => <option key={limit} value={limit} className="bg-background">{limit} requests</option>)}
            </select>
            <p id="keyword-request-limit-help" className="text-xs leading-relaxed text-muted-foreground">Each query-region check uses one request.</p>
          </div>
          <button type="button" onClick={handleStart} disabled={isRunning} className="min-h-11 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-[#070A12] shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-[background-color,box-shadow] hover:bg-[#6f9cf3] hover:shadow-[0_0_28px_rgba(91,138,239,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-40">
            {isRunning ? 'Running...' : 'Start'}
          </button>
          <button type="button" onClick={handleStop} disabled={!isRunning} className="min-h-11 w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 disabled:cursor-not-allowed disabled:opacity-40">Stop</button>
        </div>
      </div>

      <div className={`mt-4 min-h-6 text-sm ${statusColour}`} role={notice.tone === 'error' ? 'alert' : 'status'} aria-live="polite">
        {isRunning && progress ? (
          <span>Checked {progress.completedRequests} of {progress.totalRequests} requests; {progress.uniqueKeywords} unique suggestions</span>
        ) : notice.text}
      </div>

      <div className="mt-6 h-[36rem] overflow-y-auto rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:h-[25rem]" tabIndex={rows.length > 0 ? 0 : undefined} role="region" aria-label="Suggestion insights">
        {rows.length === 0 && !isRunning && (
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4" aria-labelledby="keyword-flow-heading">
            <h2 id="keyword-flow-heading" className="mb-4 text-sm font-semibold text-foreground">From seed to suggestions</h2>
            <div className="relative isolate">
              <span aria-hidden="true" className="absolute bottom-5 left-1/2 top-5 -z-10 w-px bg-gradient-to-b from-brand to-[#D79F1E] md:bottom-auto md:left-5 md:right-5 md:top-1/2 md:h-px md:w-auto md:bg-gradient-to-r" />
              <ol className="flex flex-col gap-4 md:flex-row">
                {['Seed keyword', 'Expanded with letters/modifiers', 'Google suggestions', 'Grouped and exported'].map((label, index) => (
                  <li key={label} className={`flex min-h-16 flex-1 items-center justify-center rounded-lg border bg-background px-3 py-3 text-center text-sm font-medium ${index < 2 ? 'border-brand/40 text-brand' : 'border-[#D79F1E]/40 text-[#D79F1E]'}`}>
                    <span><span className="mr-2 font-mono">{index + 1}.</span>{label}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
        {rows.length > 0 && (
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4" aria-labelledby="keyword-insights-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="keyword-insights-heading" className="text-sm font-semibold text-foreground">
                {rows.length} unique suggestions from {seeds.length} seed{seeds.length === 1 ? '' : 's'} across {activeEngines.length} region{activeEngines.length === 1 ? '' : 's'}
              </h2>
              <button type="button" onClick={() => { setActiveBucket(null); setActiveModifier(null); }} aria-pressed={!hasFilter} className="min-h-11 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm text-foreground hover:border-brand/60 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">Show all</button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-foreground">Intent breakdown</h3>
                <div className="space-y-1">
                  {(Object.keys(INTENT_BUCKET_LABELS) as IntentBucket[]).map((bucket) => (
                    <button key={bucket} type="button" aria-pressed={activeBucket === bucket} onClick={() => setActiveBucket((current) => current === bucket ? null : bucket)} className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm text-foreground hover:border-brand/60 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${activeBucket === bucket ? 'border-brand bg-brand/15 font-semibold underline' : 'border-white/[0.12] bg-white/[0.03]'}`}>
                      <span className="w-28 shrink-0">{INTENT_BUCKET_LABELS[bucket]}</span>
                      <span aria-hidden="true" className="h-1.5 min-w-0 flex-1 rounded-full bg-white/[0.08]">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${intentCounts[bucket] / maxIntentCount * 100}%`, minWidth: intentCounts[bucket] > 0 ? 3 : 0 }} />
                      </span>
                      <span className="min-w-8 text-right font-mono">{intentCounts[bucket]}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-foreground/75">A suggestion can match more than one category, so counts may add up to more than the total.</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-foreground">Top modifier words</h3>
                <div className="flex flex-wrap gap-2">
                  {modifiers.map(({ word, count }) => (
                    <button key={word} type="button" aria-pressed={activeModifier === word} onClick={() => setActiveModifier((current) => current === word ? null : word)} className={`min-h-11 max-w-full break-all rounded-full border px-3 py-2 text-sm text-[#D79F1E] hover:border-[#D79F1E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${activeModifier === word ? 'border-[#D79F1E] bg-[#D79F1E]/10 font-semibold underline' : 'border-[#D79F1E]/40 bg-white/[0.03]'}`}>
                      {word} · {count}
                    </button>
                  ))}
                </div>
                {modifiers.length === 0 && <p className="text-sm text-foreground/75">No modifier words remain after excluding seeds and common words.</p>}
                <p className="mt-3 text-xs leading-relaxed text-foreground/75">Counts show word occurrences. Select a category and a word to find suggestions matching both.</p>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="flex flex-col gap-1.5 md:col-span-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="keyword-results" className="text-sm font-medium text-foreground">Results</label>
            <span role="status" className="rounded-md bg-brand/15 px-2 py-1 font-mono text-xs text-brand">{filteredRows.length} unique{hasFilter ? ' (filtered)' : ''}; {filteredRegionPairs} region matches</span>
          </div>
          <textarea id="keyword-results" readOnly value={resultsText} rows={16} aria-busy={isRunning} aria-describedby="keyword-results-help" className={`${inputClassName} resize-none font-mono`} placeholder="Results will appear here..." />
          <p id="keyword-results-help" className="text-xs text-muted-foreground">Each line contains a suggestion followed by every region where it appeared.</p>
        </div>
        <div className="flex flex-col justify-end md:col-span-2">
          <button type="button" onClick={() => handleDownload()} disabled={filteredRows.length === 0} className="min-h-11 w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color] motion-reduce:transition-none hover:border-brand/40 hover:bg-brand/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-40">{hasFilter ? `Export ${filteredRows.length} filtered rows` : 'Download CSV'}</button>
          {hasFilter && <button type="button" onClick={() => handleDownload(true)} className="mt-2 min-h-11 rounded-lg px-3 py-2 text-sm text-brand underline underline-offset-4 hover:bg-brand/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">Export all rows</button>}
        </div>
      </div>

      {rows.length > 0 && !isRunning && (
        <section className="mt-8 border-y border-white/[0.08] py-6" aria-labelledby="keyword-next-step">
          <h2 id="keyword-next-step" className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Turn the suggestions into a content decision</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Classify intent and choose the right page format before writing. Autocomplete suggestions
            are useful inputs, but they are not evidence of search volume or ranking difficulty.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href="/tools/seo-prompts/" data-cta-location="keyword_scraper_results" data-cta-offer="seo_prompt_library" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4a79de] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">Classify intent with an SEO prompt</Link>
            <Link href="/services/content-briefs/" data-cta-location="keyword_scraper_results" data-cta-offer="content_briefs" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-foreground transition-[background-color,border-color] hover:border-brand/40 hover:bg-brand/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">Explore writer-ready content briefs</Link>
          </div>
        </section>
      )}

      <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>How it works</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><span className="font-medium text-foreground">Seed keywords:</span> enter one or more starting topics, one per line.</li>
          <li><span className="font-medium text-foreground">Query starters:</span> add words such as “how” or “best” before each seed. Leave this field blank to query the seeds directly.</li>
          <li><span className="font-medium text-foreground">Alphabet expansion:</span> the tool checks each starting combination, then adds a–z until it reaches your chosen request limit.</li>
          <li><span className="font-medium text-foreground">Regional matches:</span> a suggestion found in several selected regions appears once with every matching region listed.</li>
          <li><span className="font-medium text-foreground">Excluded words:</span> matching suggestions are removed without changing the queries sent to Google.</li>
        </ul>
      </div>
    </div>
  );
}
