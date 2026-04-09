'use client';

import { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface AuditResult {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
  numericValue?: number;
  details?: {
    type?: string;
    overallSavingsMs?: number;
    overallSavingsBytes?: number;
  };
}

interface PageSpeedResult {
  strategy: 'mobile' | 'desktop';
  score: number;
  audits: Record<string, AuditResult>;
}

/* ------------------------------------------------------------------ */
/*  Score Gauge (SVG donut)                                            */
/* ------------------------------------------------------------------ */
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Metric status helpers                                              */
/* ------------------------------------------------------------------ */
type StatusColor = 'green' | 'amber' | 'red';

function getMetricStatus(
  id: string,
  numericValue: number | undefined
): { color: StatusColor; label: string } {
  if (numericValue === undefined) return { color: 'amber', label: 'N/A' };

  switch (id) {
    case 'largest-contentful-paint': {
      const s = numericValue / 1000;
      if (s <= 2.5) return { color: 'green', label: 'Good' };
      if (s <= 4) return { color: 'amber', label: 'Needs Work' };
      return { color: 'red', label: 'Poor' };
    }
    case 'total-blocking-time': {
      if (numericValue <= 200) return { color: 'green', label: 'Good' };
      if (numericValue <= 600) return { color: 'amber', label: 'Needs Work' };
      return { color: 'red', label: 'Poor' };
    }
    case 'cumulative-layout-shift': {
      if (numericValue <= 0.1) return { color: 'green', label: 'Good' };
      if (numericValue <= 0.25) return { color: 'amber', label: 'Needs Work' };
      return { color: 'red', label: 'Poor' };
    }
    case 'first-contentful-paint': {
      const s = numericValue / 1000;
      if (s <= 1.8) return { color: 'green', label: 'Good' };
      if (s <= 3) return { color: 'amber', label: 'Needs Work' };
      return { color: 'red', label: 'Poor' };
    }
    case 'server-response-time': {
      if (numericValue <= 200) return { color: 'green', label: 'Good' };
      if (numericValue <= 600) return { color: 'amber', label: 'Needs Work' };
      return { color: 'red', label: 'Poor' };
    }
    case 'speed-index': {
      const s = numericValue / 1000;
      if (s <= 3.4) return { color: 'green', label: 'Good' };
      if (s <= 5.8) return { color: 'amber', label: 'Needs Work' };
      return { color: 'red', label: 'Poor' };
    }
    default:
      return { color: 'amber', label: 'N/A' };
  }
}

const borderColors: Record<StatusColor, string> = {
  green: 'border-l-emerald-400',
  amber: 'border-l-amber-400',
  red: 'border-l-red-400',
};

const badgeColors: Record<StatusColor, string> = {
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const METRICS = [
  {
    id: 'largest-contentful-paint',
    name: 'LCP',
    full: 'Largest Contentful Paint',
    desc: 'Time until the largest visible element is rendered. Under 2.5s is good.',
  },
  {
    id: 'total-blocking-time',
    name: 'TBT (INP proxy)',
    full: 'Total Blocking Time',
    desc: 'Sum of long task blocking time. Proxy for interactivity. Under 200ms is good.',
  },
  {
    id: 'cumulative-layout-shift',
    name: 'CLS',
    full: 'Cumulative Layout Shift',
    desc: 'Measures visual stability. Under 0.1 means elements stay put during load.',
  },
  {
    id: 'first-contentful-paint',
    name: 'FCP',
    full: 'First Contentful Paint',
    desc: 'Time until the first text or image is painted. Under 1.8s is good.',
  },
  {
    id: 'server-response-time',
    name: 'TTFB',
    full: 'Time to First Byte',
    desc: 'Server response time. Under 200ms indicates a fast server or CDN.',
  },
  {
    id: 'speed-index',
    name: 'SI',
    full: 'Speed Index',
    desc: 'How quickly content is visually displayed. Under 3.4s is good.',
  },
];

/* ------------------------------------------------------------------ */
/*  Metric Card                                                        */
/* ------------------------------------------------------------------ */
function MetricCard({
  metric,
  audit,
}: {
  metric: (typeof METRICS)[number];
  audit: AuditResult | undefined;
}) {
  const numericValue = audit?.numericValue;
  const displayValue = audit?.displayValue ?? 'N/A';
  const status = getMetricStatus(metric.id, numericValue);

  return (
    <div
      className={`rounded-lg border border-white/[0.06] border-l-4 ${borderColors[status.color]} bg-white/[0.02] p-4`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {metric.name}
          </p>
          <p className="text-xs text-muted-foreground">{metric.full}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeColors[status.color]}`}
        >
          {status.label}
        </span>
      </div>
      <p className="mt-2 text-xl font-bold font-mono text-foreground">
        {displayValue}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{metric.desc}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Opportunity row                                                    */
/* ------------------------------------------------------------------ */
function OpportunityRow({ audit }: { audit: AuditResult }) {
  const savingsMs = audit.details?.overallSavingsMs;
  const savingsBytes = audit.details?.overallSavingsBytes;

  let savingsLabel = '';
  if (savingsMs && savingsMs > 0) {
    savingsLabel =
      savingsMs >= 1000
        ? `${(savingsMs / 1000).toFixed(1)}s`
        : `${Math.round(savingsMs)}ms`;
  }
  if (savingsBytes && savingsBytes > 0) {
    const kb = savingsBytes / 1024;
    const label =
      kb >= 1024
        ? `${(kb / 1024).toFixed(1)} MB`
        : `${Math.round(kb)} KB`;
    savingsLabel = savingsLabel ? `${savingsLabel} / ${label}` : label;
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{audit.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {audit.description?.replace(/\[.*?\]\(.*?\)/g, '').slice(0, 200)}
        </p>
      </div>
      {savingsLabel && (
        <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-400">
          Save {savingsLabel}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function SpeedChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<PageSpeedResult[]>([]);
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');

  const runTest = useCallback(async () => {
    if (!url.trim()) return;

    const testUrl = url.trim().startsWith('http')
      ? url.trim()
      : `https://${url.trim()}`;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const strategies: ('mobile' | 'desktop')[] = ['mobile', 'desktop'];
      const fetches = strategies.map(async (strategy) => {
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&strategy=${strategy}`;
        const res = await fetch(apiUrl);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body?.error?.message || `API returned ${res.status}`
          );
        }
        const data = await res.json();
        const lh = data.lighthouseResult;
        const score = Math.round((lh?.categories?.performance?.score ?? 0) * 100);
        return {
          strategy,
          score,
          audits: lh?.audits ?? {},
        } as PageSpeedResult;
      });

      const all = await Promise.all(fetches);
      setResults(all);
      setActiveTab('mobile');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const current = results.find((r) => r.strategy === activeTab);

  const opportunities =
    current
      ? Object.values(current.audits)
          .filter(
            (a) =>
              a.details?.type === 'opportunity' &&
              a.score !== null &&
              a.score < 1 &&
              ((a.details?.overallSavingsMs ?? 0) > 0 ||
                (a.details?.overallSavingsBytes ?? 0) > 0)
          )
          .sort(
            (a, b) =>
              (b.details?.overallSavingsMs ?? 0) -
              (a.details?.overallSavingsMs ?? 0)
          )
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Website Speed Checker
        </h1>
        <p className="mt-3 text-muted-foreground">
          Test any URL against Google&apos;s PageSpeed Insights. Get Core Web
          Vitals scores, performance metrics, and actionable recommendations for
          both mobile and desktop.
        </p>
      </div>

      {/* URL input + button */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Website URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) runTest();
            }}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
            placeholder="https://example.com"
            disabled={loading}
          />
        </div>
        <button
          onClick={runTest}
          disabled={loading || !url.trim()}
          className="rounded-lg bg-[#5B8AEF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Speed'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#5B8AEF]" />
          <p className="text-sm font-medium text-foreground">
            Analysing... this usually takes 10-20 seconds
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Running Lighthouse audits for both mobile and desktop
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <>
          {/* Strategy toggle */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              Results:
            </span>
            <div className="flex overflow-hidden rounded-lg border border-white/[0.08]">
              {(['mobile', 'desktop'] as const).map((s) => {
                const r = results.find((x) => x.strategy === s);
                return (
                  <button
                    key={s}
                    onClick={() => setActiveTab(s)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === s
                        ? 'bg-[#5B8AEF] text-white shadow-[0_0_20px_rgba(91,138,239,0.35)]'
                        : 'bg-white/[0.03] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {r ? ` (${r.score})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {current && (
            <>
              {/* Score gauges */}
              <div className="mb-8 grid grid-cols-2 gap-6 sm:grid-cols-2">
                {results.map((r) => (
                  <div
                    key={r.strategy}
                    className="flex justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
                  >
                    <ScoreGauge
                      score={r.score}
                      label={
                        r.strategy.charAt(0).toUpperCase() + r.strategy.slice(1)
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Core Web Vitals */}
              <div className="mb-8">
                <h2
                  className="mb-4 text-lg font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Core Web Vitals &amp; Metrics
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {METRICS.map((m) => (
                    <MetricCard
                      key={m.id}
                      metric={m}
                      audit={current.audits[m.id]}
                    />
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              {opportunities.length > 0 && (
                <div className="mb-8">
                  <h2
                    className="mb-4 text-lg font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Opportunities
                  </h2>
                  <div className="flex flex-col gap-2">
                    {opportunities.map((opp) => (
                      <OpportunityRow key={opp.id} audit={opp} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* SEO impact section */}
      <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="mb-3 text-lg font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Why page speed matters for SEO
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Since the June 2021 Page Experience update, Google uses Core Web
            Vitals (LCP, FID/INP, and CLS) as ranking signals. Pages that
            deliver a fast, visually stable experience have a measurable
            advantage in search rankings&mdash;especially on mobile, where
            Google now uses mobile-first indexing for all sites.
          </p>
          <p>
            Beyond rankings, speed directly impacts user behaviour. A 1-second
            delay in page load can reduce conversions by up to 7%. Improving
            your Core Web Vitals is one of the highest-ROI technical SEO tasks
            you can do.
          </p>
          <div className="mt-4 rounded-lg border border-[#5B8AEF]/20 bg-[#5B8AEF]/5 p-4">
            <p className="text-sm text-foreground">
              Need help improving your Core Web Vitals?{' '}
              <a
                href="/contact/"
                className="font-medium text-[#5B8AEF] underline underline-offset-2 hover:text-[#5B8AEF]/80"
              >
                Get in touch
              </a>{' '}
              for a performance audit tailored to your site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
