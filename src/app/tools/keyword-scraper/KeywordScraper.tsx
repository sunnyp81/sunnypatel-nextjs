'use client';

import { useRef, useState, useCallback } from 'react';

type EngineId = 'googleUK' | 'googleUS' | 'googleFR' | 'googlePT' | 'googleES' | 'googleDE' | 'googleRU' | 'googleNL';

const ENGINES: { id: EngineId; label: string; hl: string; gl: string }[] = [
  { id: 'googleUK', label: 'Google UK', hl: 'en-GB', gl: 'GB' },
  { id: 'googleUS', label: 'Google US', hl: 'en', gl: 'US' },
  { id: 'googleFR', label: 'Google FR', hl: 'fr', gl: 'SC' },
  { id: 'googlePT', label: 'Google PT', hl: 'pt-PT', gl: 'PT' },
  { id: 'googleES', label: 'Google ES', hl: 'es', gl: 'ES' },
  { id: 'googleDE', label: 'Google DE', hl: 'de', gl: 'DE' },
  { id: 'googleRU', label: 'Google RU', hl: 'ru', gl: 'RU' },
  { id: 'googleNL', label: 'Google NL', hl: 'nl', gl: 'NL' },
];

const MAX_QUEUE = 20000;
const BATCH_SIZE = 6;
const CHARS = 'abcdefghijklmnopqrstuvwxyz'.split('');

function googleAutocomplete(query: string, hl: string, gl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const cbName = '_gac' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      try { delete (window as any)[cbName]; } catch (_) {}
      const el = document.getElementById(cbName);
      if (el?.parentNode) el.parentNode.removeChild(el);
    };

    const timer = setTimeout(() => { cleanup(); resolve([]); }, 6000);

    (window as any)[cbName] = (data: any) => {
      clearTimeout(timer);
      cleanup();
      resolve(Array.isArray(data?.[1]) ? (data[1] as string[]) : []);
    };

    const script = document.createElement('script');
    script.id = cbName;
    const q = query.replace(/\+/g, ' ');
    script.src = `https://www.google.com/complete/search?output=search&client=chrome&q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&jsonp=${cbName}`;
    script.onerror = () => { clearTimeout(timer); cleanup(); resolve([]); };
    document.head.appendChild(script);
  });
}

type EngineState = Record<EngineId, boolean>;

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

export default function KeywordScraper() {
  const [keywords, setKeywords] = useState('seo consultant');
  const [positives, setPositives] = useState('how\nwhat\nbest\nnear me');
  const [negatives, setNegatives] = useState('');
  const [engines, setEngines] = useState<EngineState>(DEFAULT_ENGINES);
  const [resultLines, setResultLines] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Mutable refs for the processing loop
  const runningRef = useRef(false);
  const queueRef = useRef<string[]>([]);
  const seenQueriesRef = useRef(new Set<string>());
  const seenResultsRef = useRef(new Set<string>());
  const enginesRef = useRef<EngineState>(engines);
  const negativesRef = useRef(negatives);

  // Sync refs when state changes (only matters before start)
  const syncRefs = () => {
    enginesRef.current = engines;
    negativesRef.current = negatives;
  };

  const applyFilters = useCallback((results: string[]): string[] => {
    const negLines = negativesRef.current
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (negLines.length === 0) return results;
    return results.filter((r) => !negLines.some((neg) => r.includes(neg)));
  }, []);

  const expandWithAlphabet = useCallback((result: string) => {
    const base = result.trim().replace(/\s+/g, '+');
    for (const c of CHARS) {
      const q = base + '+' + c;
      if (queueRef.current.length < MAX_QUEUE && !seenQueriesRef.current.has(q)) {
        seenQueriesRef.current.add(q);
        queueRef.current.push(q);
      }
    }
  }, []);

  const handleResults = useCallback(
    (rawResults: string[], engineLabel: string) => {
      if (!runningRef.current) return;
      const filtered = applyFilters(rawResults);
      const newLines: string[] = [];

      for (const r of filtered) {
        if (!seenResultsRef.current.has(r)) {
          seenResultsRef.current.add(r);
          newLines.push(engineLabel ? `${r}, ${engineLabel}` : r);
          expandWithAlphabet(r);
        }
      }

      if (newLines.length > 0) {
        setResultLines((prev) => [...prev, ...newLines]);
        setCount((prev) => prev + newLines.length);
      }
    },
    [applyFilters, expandWithAlphabet]
  );

  const makeInitialQueries = useCallback((): string[] => {
    const kws = keywords
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const pos = positives
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const queries: string[] = [];
    for (const kw of kws) {
      const k = kw.replace(/\s+/g, '+');
      if (pos.length === 0) {
        queries.push(k);
      } else {
        for (const p of pos) {
          const pf = p.replace(/\s+/g, '+');
          queries.push(pf + '+' + k);
        }
      }
    }
    return queries;
  }, [keywords, positives]);

  const runLoop = useCallback(async () => {
    while (runningRef.current) {
      if (queueRef.current.length === 0) {
        runningRef.current = false;
        setIsRunning(false);
        break;
      }

      const batch = queueRef.current.splice(0, BATCH_SIZE);
      const activeEngines = ENGINES.filter((e) => enginesRef.current[e.id]);
      if (activeEngines.length === 0) break;

      const promises: Promise<void>[] = [];
      for (const query of batch) {
        for (const engine of activeEngines) {
          promises.push(
            googleAutocomplete(query, engine.hl, engine.gl).then((results) => {
              handleResults(results, engine.label);
            })
          );
        }
      }

      await Promise.all(promises);
      await new Promise((r) => setTimeout(r, 80));
    }
  }, [handleResults]);

  const handleStart = useCallback(() => {
    syncRefs();

    // Reset state
    queueRef.current = [];
    seenQueriesRef.current = new Set();
    seenResultsRef.current = new Set();
    setResultLines([]);
    setCount(0);
    runningRef.current = true;
    setIsRunning(true);

    // Build initial queue
    const initialQueries = makeInitialQueries();
    for (const q of initialQueries) {
      if (!seenQueriesRef.current.has(q)) {
        seenQueriesRef.current.add(q);
        queueRef.current.push(q);
      }
    }

    // Expand initial queries with a-z
    for (const q of initialQueries) {
      for (const c of CHARS) {
        const expanded = q + '+' + c;
        if (!seenQueriesRef.current.has(expanded)) {
          seenQueriesRef.current.add(expanded);
          queueRef.current.push(expanded);
        }
      }
    }

    runLoop();
  }, [makeInitialQueries, runLoop]);

  const handleStop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
  }, []);

  const handleDownload = useCallback(() => {
    const header = 'Keyword,Search Engine\r\n';
    const rows = resultLines
      .map((line) => {
        const parts = line.split(', ');
        const kw = parts[0] ?? '';
        const se = parts.slice(1).join(', ') ?? '';
        return `"${kw.replace(/"/g, '""')}","${se}"`;
      })
      .join('\r\n');
    const content = header + rows;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword_suggestions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [resultLines]);

  const toggleEngine = (id: EngineId) => {
    setEngines((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resultsText = resultLines.join('\n');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Keyword Suggestions Tool
        </h1>
        <p className="mt-3 text-muted-foreground">
          Scrape Google Autocomplete suggestions across multiple regions. Enter seed keywords, pick your engines, and hit Start — the tool expands each keyword a–z for deep coverage.
        </p>
      </div>

      {/* Input row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Keywords */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Seed Keywords <span className="text-muted-foreground">(one per line)</span>
            </label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isRunning}
              rows={10}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 disabled:opacity-50 font-mono"
              placeholder="seo consultant&#10;keyword research&#10;..."
            />
          </div>

          {/* Engines */}
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Search Engines
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {ENGINES.map((engine) => (
                <label
                  key={engine.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-white/[0.04] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={engines[engine.id]}
                    onChange={() => toggleEngine(engine.id)}
                    disabled={isRunning}
                    className="h-3.5 w-3.5 rounded border-white/20 accent-[#5B8AEF]"
                  />
                  {engine.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Positives + Negatives */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Positive Words{' '}
              <span className="text-muted-foreground">(prepended to each keyword)</span>
            </label>
            <textarea
              value={positives}
              onChange={(e) => setPositives(e.target.value)}
              disabled={isRunning}
              rows={6}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 disabled:opacity-50 font-mono"
              placeholder="how&#10;best&#10;what&#10;near me"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Negative Words{' '}
              <span className="text-muted-foreground">(filter out results containing these)</span>
            </label>
            <textarea
              value={negatives}
              onChange={(e) => setNegatives(e.target.value)}
              disabled={isRunning}
              rows={5}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 disabled:opacity-50 font-mono"
              placeholder="spam word&#10;irrelevant"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="md:col-span-2 flex flex-col justify-start gap-3 pt-6">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="w-full rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-all hover:bg-[#4a79de] hover:shadow-[0_0_28px_rgba(91,138,239,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRunning ? 'Running…' : 'Start'}
          </button>
          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Stop
          </button>
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#5B8AEF]" />
              <span className="text-xs text-muted-foreground">Scraping…</span>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Results{' '}
              <span className="ml-2 rounded-full bg-[#5B8AEF]/15 px-2 py-0.5 text-xs font-mono text-[#5B8AEF]">
                {count} keywords
              </span>
            </label>
          </div>
          <textarea
            readOnly
            value={resultsText}
            rows={16}
            className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground font-mono focus:outline-none"
            placeholder="Results will appear here…"
          />
        </div>
        <div className="md:col-span-2 flex flex-col justify-end">
          <button
            onClick={handleDownload}
            disabled={count === 0}
            className="w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="mb-3 text-lg font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How it works
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">Seed keywords</span> — enter one or more base terms (one per line).
          </li>
          <li>
            <span className="text-foreground font-medium">Positive words</span> — prepended to each seed before querying (e.g. &quot;how&quot; → &quot;how seo consultant&quot;). Leave blank to query seeds directly.
          </li>
          <li>
            <span className="text-foreground font-medium">Negative words</span> — any suggestion containing these words is discarded.
          </li>
          <li>
            <span className="text-foreground font-medium">a–z expansion</span> — each returned suggestion is automatically re-queried with every letter of the alphabet appended, uncovering thousands of long-tail variations.
          </li>
          <li>
            <span className="text-foreground font-medium">Multiple regions</span> — tick Google UK for UK-specific suggestions, add other locales for international keyword research.
          </li>
        </ul>
      </div>
    </div>
  );
}
