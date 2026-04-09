'use client';

import { useState, useMemo, useCallback } from 'react';

type TitleStatus = 'good' | 'too-short' | 'too-long';
type SortMode = 'input' | 'status' | 'length';

interface TitleResult {
  text: string;
  charCount: number;
  pixelWidth: number;
  status: TitleStatus;
}

const CHAR_WIDTHS: Record<string, number> = {
  ' ': 4.4, '!': 4.8, '"': 5.7, '#': 8.9, '$': 7.1, '%': 9.5, '&': 8.5,
  "'": 3.1, '(': 4.3, ')': 4.3, '*': 5.0, '+': 8.4, ',': 3.6, '-': 4.2,
  '.': 3.6, '/': 3.6, '0': 7.1, '1': 7.1, '2': 7.1, '3': 7.1, '4': 7.1,
  '5': 7.1, '6': 7.1, '7': 7.1, '8': 7.1, '9': 7.1, ':': 3.6, ';': 3.6,
  '<': 8.4, '=': 8.4, '>': 8.4, '?': 6.1, '@': 12.2,
  A: 8.0, B: 7.6, C: 7.9, D: 8.6, E: 6.9, F: 6.5, G: 8.6, H: 8.6,
  I: 3.3, J: 5.1, K: 7.6, L: 6.5, M: 10.3, N: 8.6, O: 9.0, P: 7.2,
  Q: 9.0, R: 7.6, S: 7.2, T: 7.2, U: 8.6, V: 8.0, W: 11.3, X: 7.6,
  Y: 7.2, Z: 7.2, '[': 3.6, '\\': 3.6, ']': 3.6, '^': 6.0, '_': 5.7,
  '`': 4.3, a: 6.8, b: 7.1, c: 5.7, d: 7.1, e: 6.8, f: 3.6, g: 7.1,
  h: 7.1, i: 2.8, j: 2.8, k: 6.5, l: 2.8, m: 10.7, n: 7.1, o: 7.1,
  p: 7.1, q: 7.1, r: 4.3, s: 5.7, t: 3.9, u: 7.1, v: 6.5, w: 9.3,
  x: 6.5, y: 6.5, z: 5.7, '{': 4.3, '|': 3.3, '}': 4.3, '~': 8.4,
};

function estimatePixelWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += CHAR_WIDTHS[char] ?? 7.5;
  }
  return Math.round(width * 10) / 10;
}

function getStatus(pixelWidth: number, charCount: number): TitleStatus {
  if (charCount < 30 || pixelWidth < 200) return 'too-short';
  if (pixelWidth > 580 || charCount > 65) return 'too-long';
  return 'good';
}

const STATUS_ORDER: Record<TitleStatus, number> = {
  'too-long': 0,
  'too-short': 1,
  'good': 2,
};

const STATUS_CONFIG: Record<TitleStatus, { label: string; badge: string; bar: string }> = {
  good: {
    label: 'Good',
    badge: 'bg-emerald-500/15 text-emerald-400',
    bar: 'bg-emerald-500',
  },
  'too-short': {
    label: 'Too Short',
    badge: 'bg-amber-500/15 text-amber-400',
    bar: 'bg-amber-500',
  },
  'too-long': {
    label: 'Too Long',
    badge: 'bg-red-500/15 text-red-400',
    bar: 'bg-red-500',
  },
};

export default function TitleChecker() {
  const [input, setInput] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('input');

  const results: TitleResult[] = useMemo(() => {
    if (!input.trim()) return [];
    return input
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const text = line.trim();
        const charCount = text.length;
        const pixelWidth = estimatePixelWidth(text);
        const status = getStatus(pixelWidth, charCount);
        return { text, charCount, pixelWidth, status };
      });
  }, [input]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    if (sortMode === 'status') {
      sorted.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    } else if (sortMode === 'length') {
      sorted.sort((a, b) => b.pixelWidth - a.pixelWidth);
    }
    return sorted;
  }, [results, sortMode]);

  const stats = useMemo(() => {
    const total = results.length;
    const good = results.filter((r) => r.status === 'good').length;
    const tooLong = results.filter((r) => r.status === 'too-long').length;
    const tooShort = results.filter((r) => r.status === 'too-short').length;
    return { total, good, tooLong, tooShort };
  }, [results]);

  const exportCSV = useCallback(() => {
    if (results.length === 0) return;
    const header = 'Title,Characters,Pixel Width,Status\n';
    const rows = results
      .map(
        (r) =>
          `"${r.text.replace(/"/g, '""')}",${r.charCount},${r.pixelWidth},${STATUS_CONFIG[r.status].label}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'title-tag-check.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const clearAll = useCallback(() => {
    setInput('');
    setSortMode('input');
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Bulk Title Tag Checker
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">
          Paste your title tags below (one per line) to check character counts, estimated pixel
          widths, and Google truncation risk. Optimise for 50&ndash;60 characters and under 580px.
        </p>
      </div>

      {/* Input area */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
        <label className="text-sm font-medium text-foreground block mb-2">
          Title Tags (one per line)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={"Best Running Shoes for Flat Feet 2026 | Expert Reviews\nHow to Train for a Marathon: Complete Beginner's Guide\n10 Budget-Friendly Home Office Desks Under £200"}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono resize-y"
        />
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={exportCSV}
            disabled={results.length === 0}
            className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Export CSV
          </button>
          <button
            onClick={clearAll}
            disabled={results.length === 0}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Clear All
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            {(['input', 'status', 'length'] as SortMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortMode === mode
                    ? 'bg-[#5B8AEF]/20 text-[#5B8AEF] border border-[#5B8AEF]/30'
                    : 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'input' ? 'Order' : mode === 'status' ? 'Status' : 'Length'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Titles Checked" value={stats.total} color="text-foreground" />
          <StatCard label="Good" value={stats.good} color="text-emerald-400" />
          <StatCard label="Too Long" value={stats.tooLong} color="text-red-400" />
          <StatCard label="Too Short" value={stats.tooShort} color="text-amber-400" />
        </div>
      )}

      {/* Results */}
      {sortedResults.length > 0 && (
        <div className="space-y-3 mb-12">
          {sortedResults.map((result, i) => {
            const config = STATUS_CONFIG[result.status];
            const barPercent = Math.min((result.pixelWidth / 580) * 100, 100);
            return (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-mono break-all leading-relaxed">
                      {result.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span>
                        <strong className="text-foreground">{result.charCount}</strong> chars
                      </span>
                      <span>
                        <strong className="text-foreground">{result.pixelWidth}</strong>px est.
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold shrink-0 ${config.badge}`}
                  >
                    {config.label}
                  </span>
                </div>
                {/* Pixel width progress bar */}
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${config.bar}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>0px</span>
                    <span>580px (Google limit)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How it works */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="text-xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How It Works
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Google does not truncate title tags based on character count alone. Instead, it uses{' '}
            <strong className="text-foreground">pixel width</strong>. On desktop, Google truncates
            titles at approximately <strong className="text-foreground">580 pixels</strong> when
            rendered in Arial at 20px &mdash; the font used in search results.
          </p>
          <p>
            This tool estimates pixel width using per-character width measurements from Arial 20px.
            Narrow characters like &ldquo;i&rdquo; and &ldquo;l&rdquo; take up fewer pixels than
            wide characters like &ldquo;M&rdquo; and &ldquo;W&rdquo;. A title with 60 characters
            of narrow letters may fit, while 55 wide characters may not.
          </p>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Guidelines for good title tags:
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Aim for <strong className="text-foreground">50&ndash;60 characters</strong> as a
                general range
              </li>
              <li>
                Keep estimated pixel width{' '}
                <strong className="text-foreground">under 580px</strong> to avoid truncation
              </li>
              <li>
                Front-load your primary keyword &mdash; Google may rewrite titles that bury the
                topic
              </li>
              <li>
                Avoid filler words like &ldquo;Best&rdquo;, &ldquo;Top&rdquo;, &ldquo;Ultimate&rdquo;
                unless they match search intent
              </li>
              <li>
                Include your brand name only if it adds value (e.g. high domain authority)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
