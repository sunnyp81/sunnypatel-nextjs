'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle2, Loader2, Search, XCircle, MinusCircle } from 'lucide-react';

interface Check {
  check: string;
  passed: boolean | null;
  value: string;
  recommendation: string;
}

interface Pillar {
  name: string;
  score: number | null;
  max: number;
  checks: Check[];
}

interface Result {
  url: string;
  brand: string;
  totalScore: number | null;
  incomplete?: boolean;
  pillars: Pillar[];
  verdict: string;
}

function readInk(varName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function scoreColor(pct: number): string {
  if (pct >= 0.8) return readInk('--success-ink', '#5a922c');
  if (pct >= 0.55) return readInk('--gold-ink', '#d79f1e');
  return readInk('--destructive', '#e5484d');
}

export default function AiVisibilityChecker({ showHeading = true }: { showHeading?: boolean }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [, setThemeTick] = useState(0);

  useEffect(() => {
    const onThemeChange = () => setThemeTick((t) => t + 1);
    window.addEventListener('themechange', onThemeChange);
    return () => window.removeEventListener('themechange', onThemeChange);
  }, []);

  const runCheck = useCallback(async (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch('/api/ai-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Check failed (${res.status})`);
      setResult(data);
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'ai_visibility_check', {
          event_category: 'engagement',
          event_label: data.url,
          value: data.totalScore,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      runCheck(url);
    },
    [url, runCheck]
  );

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('url');
    if (param) {
      setUrl(param);
      runCheck(param);
    }
  }, [runCheck]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {showHeading && (
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            AI Visibility Checker
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Inspect crawl directives, structured data, public entity search matches and page structure. This technical diagnostic uses our own heuristics; it does not query live AI answers or measure retrieval, recommendations or citations.
          </p>
        </div>
      )}

      <div className="mb-8 space-y-2 text-sm text-muted-foreground">
        <p>Bot roles differ: OAI-SearchBot supports ChatGPT search, while GPTBot concerns model training. PerplexityBot supports Perplexity search. Googlebot controls Google Search crawling, including AI features; Google-Extended covers some other Google uses.</p>
        <p>Allowing a bot in robots.txt does not prove that firewalls permit it or that the page will be selected. User-requested fetchers also have different rules. Neither llms.txt nor FAQ markup is required for Google AI features.</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <a href="https://developers.openai.com/api/docs/bots" className="underline">OpenAI crawler roles</a>
          <a href="https://docs.perplexity.ai/docs/resources/perplexity-crawlers" className="underline">Perplexity crawler roles</a>
          <a href="https://developers.google.com/search/docs/appearance/ai-features" className="underline">Google AI feature guidance</a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourwebsite.co.uk"
              aria-label="Website address to check"
              className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground/40 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            style={{
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, #2a5bd7 0%, #234bb8 100%)',
              boxShadow: '0 0 20px rgba(91,138,239,0.25)',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Check Technical Readiness
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive dark:text-red-400">{error}</p>}
      </form>

      {result && (
        <div aria-live="polite">
          {/* Score header */}
          <div className="mb-8 flex flex-col items-start gap-5 rounded-2xl border border-border p-6 sm:flex-row sm:items-center md:p-8">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: result.totalScore === null ? 'var(--ink-soft)' : scoreColor(result.totalScore / 100),
                background: result.totalScore === null ? 'var(--surface-2)' : `color-mix(in oklab, ${scoreColor(result.totalScore / 100)} 12%, transparent)`,
              }}
            >
              {result.totalScore === null ? 'N/A' : result.totalScore}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {result.brand}: {result.totalScore === null ? 'incomplete diagnostic' : `${result.totalScore}/100 technical heuristic score`}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{result.verdict}</p>
              <p className="mt-2 text-xs text-muted-foreground">Weights are editorial choices, not a validated citation predictor. A high score does not establish AI visibility. Unavailable checks are marked unknown.</p>
            </div>
          </div>

          {/* Pillars */}
          <div className="mb-10 grid gap-4 md:grid-cols-2">
            {result.pillars.map((pillar) => (
              <div key={pillar.name} className="rounded-2xl border border-border p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {pillar.name}
                  </h3>
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: pillar.score === null ? 'var(--ink-soft)' : scoreColor(pillar.score / pillar.max) }}
                  >
                    {pillar.max === 0 ? 'Information only' : pillar.score === null ? 'Unavailable' : `${pillar.score}/${pillar.max}`}
                  </span>
                </div>
                <ul className="space-y-3">
                  {pillar.checks.map((c) => (
                    <li key={c.check} className="flex items-start gap-2.5">
                      {c.passed === null ? (
                        <MinusCircle aria-label="Unknown" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : c.passed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive dark:text-red-400" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">
                          {c.check}
                          <span className="ml-2 text-xs text-muted-foreground">{c.value}</span>
                        </p>
                        {c.recommendation && (
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.recommendation}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/[0.08] to-brand-deep/[0.04] p-6 md:p-8">
            <h2 className="mb-3 text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Want a review of the issues behind these checks?
            </h2>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The £495 paid audit covers technical SEO, content and AI-search visibility, with a prioritised action plan and 45-minute walkthrough. Any sampled AI answers are observations that can vary, not a promise of inclusion or a complete view of an engine.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services/paid-seo-audit/"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{
                  fontFamily: 'var(--font-heading)',
                  background: 'linear-gradient(135deg, #2a5bd7 0%, #234bb8 100%)',
                  boxShadow: '0 0 20px rgba(91,138,239,0.25)',
                }}
              >
                Get the £495 Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services/ai-search-optimisation/"
                className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                AI search optimisation service
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
