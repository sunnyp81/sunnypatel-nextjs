'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle2, Loader2, Search, XCircle } from 'lucide-react';

interface Check {
  check: string;
  passed: boolean;
  value: string;
  recommendation: string;
}

interface Pillar {
  name: string;
  score: number;
  max: number;
  checks: Check[];
}

interface Result {
  url: string;
  brand: string;
  totalScore: number;
  pillars: Pillar[];
  verdict: string;
}

function scoreColor(pct: number): string {
  if (pct >= 0.8) return '#5a922c';
  if (pct >= 0.55) return '#d79f1e';
  return '#e5484d';
}

export default function AiVisibilityChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

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
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          AI Visibility Checker
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Can ChatGPT, Perplexity and Google AI Overviews actually find, verify and cite your website? Enter your domain for a free scored report across the four things AI systems check.
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
              background: 'linear-gradient(135deg, #5B8AEF 0%, #3d6fe8 100%)',
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
                Check AI Visibility
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </form>

      {result && (
        <div aria-live="polite">
          {/* Score header */}
          <div className="mb-8 flex flex-col items-start gap-5 rounded-2xl border border-border p-6 sm:flex-row sm:items-center md:p-8">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: scoreColor(result.totalScore / 100),
                background: `${scoreColor(result.totalScore / 100)}1a`,
              }}
            >
              {result.totalScore}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {result.brand}: {result.totalScore}/100 for AI visibility
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{result.verdict}</p>
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
                    style={{ fontFamily: 'var(--font-heading)', color: scoreColor(pillar.score / pillar.max) }}
                  >
                    {pillar.score}/{pillar.max}
                  </span>
                </div>
                <ul className="space-y-3">
                  {pillar.checks.map((c) => (
                    <li key={c.check} className="flex items-start gap-2.5">
                      {c.passed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">
                          {c.check}
                          <span className="ml-2 text-xs text-muted-foreground">{c.value}</span>
                        </p>
                        {!c.passed && c.recommendation && (
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
              This checker reads signals. The audit reads answers.
            </h2>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The free check covers crawlability, schema, entities and structure. The full £495 audit goes further: I query ChatGPT, Perplexity and Google AI Overviews directly for your money questions, show exactly which competitors get cited instead of you, and deliver a prioritised fix plan with a 45-minute walkthrough.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services/paid-seo-audit/"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{
                  fontFamily: 'var(--font-heading)',
                  background: 'linear-gradient(135deg, #5B8AEF 0%, #3d6fe8 100%)',
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
