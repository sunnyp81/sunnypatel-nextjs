'use client';

import { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface RedirectStep {
  url: string;
  status: number;
  headers: Record<string, string>;
  responseTime: number;
}

interface CheckResult {
  chain: RedirectStep[];
  loopDetected: boolean;
  error?: string;
}

interface BulkResult {
  inputUrl: string;
  result: CheckResult | null;
  loading: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const STATUS_LABELS: Record<number, string> = {
  200: '200 OK',
  201: '201 Created',
  204: '204 No Content',
  301: '301 Moved Permanently',
  302: '302 Found',
  303: '303 See Other',
  307: '307 Temporary Redirect',
  308: '308 Permanent Redirect',
  400: '400 Bad Request',
  401: '401 Unauthorized',
  403: '403 Forbidden',
  404: '404 Not Found',
  410: '410 Gone',
  429: '429 Too Many Requests',
  500: '500 Internal Server Error',
  502: '502 Bad Gateway',
  503: '503 Service Unavailable',
  0: 'Connection Failed',
};

function getStatusLabel(status: number): string {
  return STATUS_LABELS[status] || `${status}`;
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red';

function getStatusColor(status: number): BadgeColor {
  if (status === 200 || status === 201 || status === 204) return 'green';
  if (status === 301 || status === 308) return 'blue';
  if (status === 302 || status === 303 || status === 307) return 'amber';
  return 'red';
}

const BADGE_CLASSES: Record<BadgeColor, string> = {
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
};

/* ------------------------------------------------------------------ */
/*  StatusBadge                                                        */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: number }) {
  const color = getStatusColor(status);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_CLASSES[color]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  WarningBadge                                                       */
/* ------------------------------------------------------------------ */
function WarningBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Arrow connector between chain nodes                                */
/* ------------------------------------------------------------------ */
function ArrowConnector() {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="flex flex-col items-center">
        <div className="h-6 w-px border-l border-dashed border-white/[0.15]" />
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-white/30">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chain node card                                                    */
/* ------------------------------------------------------------------ */
function ChainNode({ step, index }: { step: RedirectStep; index: number }) {
  const isRedirect = [301, 302, 303, 307, 308].includes(step.status);
  const location = step.headers?.location || step.headers?.Location || null;

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Hop {index + 1}
        </span>
        <StatusBadge status={step.status} />
        <span className="text-xs text-muted-foreground">
          {step.responseTime}ms
        </span>
      </div>
      <p className="break-all text-sm font-mono text-foreground/90">
        {step.url}
      </p>
      {isRedirect && location && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/60">Location:</span>{' '}
          <span className="break-all">{location}</span>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chain summary                                                      */
/* ------------------------------------------------------------------ */
function ChainSummary({ result }: { result: CheckResult }) {
  const { chain, loopDetected } = result;
  const hops = chain.length;
  const finalStep = chain[chain.length - 1];
  const totalTime = chain.reduce((sum, s) => sum + s.responseTime, 0);
  const has302 = chain.some((s) => s.status === 302 || s.status === 307);
  const longChain = hops > 2;

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 mb-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Chain Summary</h3>
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Hops:</span>
          <span className="font-medium text-foreground">{hops}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Final status:</span>
          {finalStep && <StatusBadge status={finalStep.status} />}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Total time:</span>
          <span className="font-medium text-foreground">{totalTime}ms</span>
        </div>
      </div>
      {(loopDetected || longChain || has302) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {loopDetected && <WarningBadge>Redirect loop detected</WarningBadge>}
          {longChain && <WarningBadge>Chain has {hops} hops (&gt;2)</WarningBadge>}
          {has302 && <WarningBadge>302/307 found (should this be a 301?)</WarningBadge>}
        </div>
      )}
    </div>
  );
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
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function RedirectChecker() {
  const [url, setUrl] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<CheckResult | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [error, setError] = useState('');

  const checkUrl = useCallback(async (targetUrl: string): Promise<CheckResult> => {
    const res = await fetch('/api/check-redirect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `API error ${res.status}`);
    }
    return res.json();
  }, []);

  const handleSingleCheck = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Auto-add https:// if missing
    const finalUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    setLoading(true);
    setError('');
    setSingleResult(null);

    try {
      const result = await checkUrl(finalUrl);
      if (result.error) {
        setError(result.error);
      }
      setSingleResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [url, checkUrl]);

  const handleBulkCheck = useCallback(async () => {
    const urls = bulkUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean)
      .map((u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`));

    if (urls.length === 0) return;

    setLoading(true);
    setError('');
    setBulkResults(urls.map((u) => ({ inputUrl: u, result: null, loading: true })));

    const results: BulkResult[] = [];

    for (const u of urls) {
      try {
        const result = await checkUrl(u);
        results.push({ inputUrl: u, result, loading: false });
      } catch (err: unknown) {
        results.push({
          inputUrl: u,
          result: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed',
        });
      }
      setBulkResults([...results, ...urls.slice(results.length).map((remaining) => ({ inputUrl: remaining, result: null, loading: true }))]);
    }

    setBulkResults(results);
    setLoading(false);
  }, [bulkUrls, checkUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkMode) {
      handleBulkCheck();
    } else {
      handleSingleCheck();
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
          Redirect Chain Checker
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Follow the full redirect path for any URL. Detect 301s, 302s, loops, and long chains.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Mode:</label>
          <button
            type="button"
            onClick={() => { setBulkMode(false); setError(''); setSingleResult(null); }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              !bulkMode
                ? 'bg-[#5B8AEF]/20 text-[#5B8AEF] border border-[#5B8AEF]/30'
                : 'text-muted-foreground hover:text-foreground border border-white/[0.08]'
            }`}
          >
            Single URL
          </button>
          <button
            type="button"
            onClick={() => { setBulkMode(true); setError(''); setBulkResults([]); }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              bulkMode
                ? 'bg-[#5B8AEF]/20 text-[#5B8AEF] border border-[#5B8AEF]/30'
                : 'text-muted-foreground hover:text-foreground border border-white/[0.08]'
            }`}
          >
            Bulk Check
          </button>
        </div>

        {!bulkMode ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/old-page"
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Checking...
                </span>
              ) : (
                'Check'
              )}
            </button>
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Enter URLs (one per line)
            </label>
            <textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder={"https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3"}
              rows={6}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !bulkUrls.trim()}
              className="mt-3 rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Following redirects...
                </span>
              ) : (
                `Check ${bulkUrls.split('\n').filter((l) => l.trim()).length || 0} URLs`
              )}
            </button>
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && !bulkMode && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <Spinner />
          Following redirects...
        </div>
      )}

      {/* Single result */}
      {!bulkMode && singleResult && singleResult.chain.length > 0 && (
        <div>
          <ChainSummary result={singleResult} />
          <div>
            {singleResult.chain.map((step, i) => (
              <div key={i}>
                <ChainNode step={step} index={i} />
                {i < singleResult.chain.length - 1 && <ArrowConnector />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk results */}
      {bulkMode && bulkResults.length > 0 && (
        <div className="space-y-6">
          {bulkResults.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground">URL {idx + 1}</span>
                <span className="break-all text-sm font-mono text-foreground/80">{item.inputUrl}</span>
              </div>

              {item.loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Spinner />
                  Following redirects...
                </div>
              )}

              {item.error && (
                <p className="text-sm text-red-400">{item.error}</p>
              )}

              {item.result && item.result.chain.length > 0 && (
                <div>
                  <ChainSummary result={item.result} />
                  <div>
                    {item.result.chain.map((step, i) => (
                      <div key={i}>
                        <ChainNode step={step} index={i} />
                        {i < item.result!.chain.length - 1 && <ArrowConnector />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="mt-16">
        <h2
          className="text-xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How Redirect Chains Work
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">301 Moved Permanently</h3>
            <p className="text-sm text-muted-foreground">
              The page has permanently moved to a new URL. Search engines transfer almost all ranking
              signals (link equity) to the destination. This is the recommended redirect type for SEO.
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">302 Found / 307 Temporary</h3>
            <p className="text-sm text-muted-foreground">
              The page has temporarily moved. Search engines may not pass full link equity. If a page
              has permanently moved, a 302 should be changed to a 301 to preserve rankings.
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Redirect Chains</h3>
            <p className="text-sm text-muted-foreground">
              When a URL redirects to another URL that also redirects, it creates a chain. Each hop
              can dilute link equity and slow down crawling. Aim for a maximum of one redirect between
              the original URL and the final destination.
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Redirect Loops</h3>
            <p className="text-sm text-muted-foreground">
              A redirect loop occurs when URL A redirects to URL B, which redirects back to URL A.
              This makes the page completely inaccessible. Browsers and search engines will stop
              following after a few attempts and show an error.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">SEO Impact of Redirects</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground/80">Every hop costs crawl budget</strong> &mdash; Googlebot
              has a finite crawl budget per site. Long chains waste it.
            </li>
            <li>
              <strong className="text-foreground/80">Link equity decays with each redirect</strong> &mdash; While
              Google says 301s pass full PageRank, real-world data shows diminishing returns through chains.
            </li>
            <li>
              <strong className="text-foreground/80">302s can cause indexing confusion</strong> &mdash; Search engines
              may index the wrong URL in the chain if temporary redirects are used for permanent moves.
            </li>
            <li>
              <strong className="text-foreground/80">Page speed suffers</strong> &mdash; Each redirect adds a full
              HTTP round-trip. On mobile connections, this can add hundreds of milliseconds.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
