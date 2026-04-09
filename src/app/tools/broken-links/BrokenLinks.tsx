'use client';

import { useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LinkResult {
  url: string;
  status: number;
  ok: boolean;
  internal: boolean;
  responseTime: number;
}

interface ScanResult {
  pageUrl: string;
  totalLinks: number;
  results: LinkResult[];
}

type FilterTab = 'all' | 'broken' | 'redirected' | 'working';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getStatusCategory(status: number): 'working' | 'redirected' | 'broken' | 'timeout' {
  if (status >= 200 && status < 300) return 'working';
  if (status >= 300 && status < 400) return 'redirected';
  if (status === 408 || status === 0) return 'timeout';
  return 'broken';
}

function getStatusBadgeClass(status: number): string {
  const cat = getStatusCategory(status);
  switch (cat) {
    case 'working':
      return 'bg-emerald-500/15 text-emerald-400';
    case 'redirected':
      return 'bg-amber-500/15 text-amber-400';
    case 'broken':
      return 'bg-red-500/15 text-red-400';
    case 'timeout':
      return 'bg-white/[0.06] text-muted-foreground';
  }
}

function getStatusLabel(status: number): string {
  if (status === 0) return 'Failed';
  if (status === 408) return 'Timeout';
  return String(status);
}

function getRowBorderClass(status: number): string {
  const cat = getStatusCategory(status);
  if (cat === 'broken') return 'border-l-2 border-l-red-500/60';
  if (cat === 'redirected') return 'border-l-2 border-l-amber-500/60';
  if (cat === 'timeout') return 'border-l-2 border-l-white/20';
  return '';
}

function truncateUrl(url: string, max: number = 60): string {
  if (url.length <= max) return url;
  return url.slice(0, max - 3) + '...';
}

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-[#5B8AEF]" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  CSV export                                                         */
/* ------------------------------------------------------------------ */
function exportCsv(results: LinkResult[], pageUrl: string) {
  const header = 'URL,Status,OK,Type,Response Time (ms)\n';
  const rows = results
    .map(
      (r) =>
        `"${r.url.replace(/"/g, '""')}",${r.status},${r.ok ? 'Yes' : 'No'},${r.internal ? 'Internal' : 'External'},${r.responseTime}`
    )
    .join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  const domain = (() => {
    try {
      return new URL(pageUrl).hostname;
    } catch {
      return 'links';
    }
  })();

  link.download = `broken-links-${domain}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function BrokenLinks() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [progress, setProgress] = useState('');

  /* Counts */
  const counts = useMemo(() => {
    if (!result) return { working: 0, broken: 0, redirected: 0, timeout: 0 };
    return result.results.reduce(
      (acc, r) => {
        const cat = getStatusCategory(r.status);
        acc[cat]++;
        return acc;
      },
      { working: 0, broken: 0, redirected: 0, timeout: 0 }
    );
  }, [result]);

  /* Filtered results */
  const filtered = useMemo(() => {
    if (!result) return [];
    if (filter === 'all') return result.results;
    if (filter === 'broken') return result.results.filter((r) => getStatusCategory(r.status) === 'broken' || getStatusCategory(r.status) === 'timeout');
    if (filter === 'redirected') return result.results.filter((r) => getStatusCategory(r.status) === 'redirected');
    return result.results.filter((r) => getStatusCategory(r.status) === 'working');
  }, [result, filter]);

  /* Submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    const finalUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    setLoading(true);
    setError('');
    setResult(null);
    setFilter('all');
    setProgress('Fetching page and extracting links...');

    try {
      const res = await fetch('/api/check-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API error ${res.status}`);
      }

      const data: ScanResult = await res.json();
      setResult(data);
      setProgress('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Broken Link Checker
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Scan any webpage for broken links and 404 errors. Fix dead links to improve SEO and user experience.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Scanning...
              </span>
            ) : (
              'Scan for Broken Links'
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading progress */}
      {loading && (
        <div className="mb-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <Spinner />
            {progress}
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-2 rounded-full bg-[#5B8AEF] transition-all duration-500 animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Summary bar */}
          <div className="mb-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Scan Summary</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Total links:</span>
                <span className="font-medium text-foreground">{result.totalLinks}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-muted-foreground">Working:</span>
                <span className="font-medium text-emerald-400">{counts.working}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Broken:</span>
                <span className="font-medium text-red-400">{counts.broken}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-muted-foreground">Redirected:</span>
                <span className="font-medium text-amber-400">{counts.redirected}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-white/30" />
                <span className="text-muted-foreground">Timeout:</span>
                <span className="font-medium text-muted-foreground">{counts.timeout}</span>
              </div>
            </div>
          </div>

          {/* Filter tabs + Export */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {(
                [
                  { key: 'all', label: 'All', count: result.totalLinks },
                  { key: 'broken', label: 'Broken', count: counts.broken + counts.timeout },
                  { key: 'redirected', label: 'Redirected', count: counts.redirected },
                  { key: 'working', label: 'Working', count: counts.working },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-[#5B8AEF]/20 text-[#5B8AEF] border border-[#5B8AEF]/30'
                      : 'text-muted-foreground hover:text-foreground border border-white/[0.08]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <button
              onClick={() => exportCsv(result.results, result.pageUrl)}
              className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-white/[0.15]"
            >
              Export CSV
            </button>
          </div>

          {/* Results table */}
          <div className="rounded-lg border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">URL</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">Type</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground w-28">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No links match this filter.
                      </td>
                    </tr>
                  )}
                  {filtered.map((link, i) => (
                    <tr
                      key={i}
                      className={`border-b border-white/[0.06] hover:bg-white/[0.02] ${getRowBorderClass(link.status)}`}
                    >
                      <td className="px-4 py-3">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-foreground/80 hover:text-[#5B8AEF] transition-colors"
                          title={link.url}
                        >
                          {truncateUrl(link.url)}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(link.status)}`}
                        >
                          {getStatusLabel(link.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            link.internal
                              ? 'bg-[#5B8AEF]/15 text-[#5B8AEF]'
                              : 'bg-purple-500/15 text-purple-400'
                          }`}
                        >
                          {link.internal ? 'Internal' : 'External'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
                        {link.responseTime}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* How broken links hurt SEO */}
      <div className="mt-16">
        <h2
          className="text-xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How Broken Links Hurt SEO
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Wasted Crawl Budget</h3>
            <p className="text-sm text-muted-foreground">
              Broken internal links waste Googlebot&apos;s crawl budget. Every request that returns a 404
              is a missed opportunity to crawl and index a real page on your site.
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Reduced User Trust</h3>
            <p className="text-sm text-muted-foreground">
              Broken external links erode user trust and signal poor content maintenance. Visitors who
              click a dead link are more likely to bounce and less likely to convert.
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Poor Maintenance Signals</h3>
            <p className="text-sm text-muted-foreground">
              Frequent 404 errors can indicate to Google that a page is poorly maintained. This may
              affect quality assessments and reduce your overall crawl priority.
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Lost Link Equity</h3>
            <p className="text-sm text-muted-foreground">
              Redirect chains pass less link equity than direct links. Each hop in a redirect chain
              dilutes the PageRank flowing to the destination, weakening your rankings.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">How to Fix Broken Links</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground/80">Update or remove the link</strong> &mdash; If the
              target page has moved, update the href to the new URL. If it no longer exists, remove the
              link entirely.
            </li>
            <li>
              <strong className="text-foreground/80">Set up 301 redirects</strong> &mdash; For your own
              pages that have moved, implement a 301 redirect from the old URL to the new one to preserve
              link equity.
            </li>
            <li>
              <strong className="text-foreground/80">Use the Wayback Machine</strong> &mdash; If an
              external resource has gone offline, check web.archive.org for a cached version you can link
              to instead.
            </li>
            <li>
              <strong className="text-foreground/80">Run regular audits</strong> &mdash; Schedule a
              monthly broken link check to catch issues before they accumulate and impact rankings.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
