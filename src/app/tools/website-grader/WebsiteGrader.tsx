'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Check {
  check: string;
  passed: boolean;
  value: string;
  recommendation: string;
}

interface ContentStats {
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  imagesWithAlt: number;
  headings: { h1: number; h2: number; h3: number };
}

interface GradeResult {
  seoChecks: Check[];
  securityChecks: Check[];
  contentStats: ContentStats;
  seoScore: number;
  securityScore: number;
  contentScore: number;
  url: string;
}

interface FullResult extends GradeResult {
  performanceScore: number;
  overallScore: number;
  grade: string;
}

/* ------------------------------------------------------------------ */
/*  Grading helpers                                                    */
/* ------------------------------------------------------------------ */
function computeOverall(seo: number, perf: number, sec: number, content: number): number {
  return Math.round(seo * 0.4 + perf * 0.3 + sec * 0.2 + content * 0.1);
}

function scoreToGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function gradeColor(grade: string): string {
  if (grade === 'A+' || grade === 'A') return '#22c55e';
  if (grade === 'B') return '#3b82f6';
  if (grade === 'C') return '#f59e0b';
  if (grade === 'D') return '#f97316';
  return '#ef4444';
}

/* ------------------------------------------------------------------ */
/*  SVG Grade Badge (large, 120x120)                                   */
/* ------------------------------------------------------------------ */
function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const color = gradeColor(grade);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text
          x="60"
          y="56"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="36"
          fontWeight="700"
          fontFamily="var(--font-heading), system-ui"
        >
          {grade}
        </text>
        <text
          x="60"
          y="80"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fillOpacity="0.5"
          fontSize="13"
          fontWeight="500"
        >
          {score}/100
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Donut Gauge (smaller, 80x80)                                   */
/* ------------------------------------------------------------------ */
function DonutGauge({ score, label }: { score: number; label: string }) {
  const grade = scoreToGrade(score);
  const color = gradeColor(grade);
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="32"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text
          x="40"
          y="40"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="20"
          fontWeight="700"
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Check / X icons                                                    */
/* ------------------------------------------------------------------ */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Chevron icon                                                       */
/* ------------------------------------------------------------------ */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Expandable section                                                 */
/* ------------------------------------------------------------------ */
function ExpandableSection({ title, checks }: { title: string; checks: Check[] }) {
  const [open, setOpen] = useState(false);

  // Sort: failures first
  const sorted = [...checks].sort((a, b) => {
    if (a.passed === b.passed) return 0;
    return a.passed ? 1 : -1;
  });

  const failCount = checks.filter((c) => !c.passed).length;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {failCount > 0 && (
            <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
              {failCount} issue{failCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="border-t border-white/[0.06] p-4 space-y-3">
          {sorted.map((check, i) => (
            <div key={i} className="flex items-start gap-3">
              {check.passed ? <CheckIcon /> : <XIcon />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{check.check}</span>
                  <span className="text-xs text-muted-foreground">{check.value}</span>
                </div>
                {!check.passed && check.recommendation && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{check.recommendation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Content details section                                            */
/* ------------------------------------------------------------------ */
function ContentDetails({ stats }: { stats: ContentStats }) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: 'Word count', value: stats.wordCount.toLocaleString(), good: stats.wordCount >= 300 },
    { label: 'Internal links', value: String(stats.internalLinks), good: stats.internalLinks >= 3 },
    { label: 'External links', value: String(stats.externalLinks), good: stats.externalLinks >= 1 },
    { label: 'Images', value: String(stats.images), good: stats.images >= 1 },
    { label: 'Images with alt text', value: `${stats.imagesWithAlt}/${stats.images}`, good: stats.images === 0 || stats.imagesWithAlt / stats.images >= 0.9 },
    { label: 'H1 tags', value: String(stats.headings.h1), good: stats.headings.h1 === 1 },
    { label: 'H2 tags', value: String(stats.headings.h2), good: stats.headings.h2 >= 2 },
    { label: 'H3 tags', value: String(stats.headings.h3), good: stats.headings.h3 >= 0 },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">Content Analysis</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="border-t border-white/[0.06] p-4 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.good ? <CheckIcon /> : <XIcon />}
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{item.value}</span>
            </div>
          ))}
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
export default function WebsiteGrader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [result, setResult] = useState<FullResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) return;

    const targetUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    setLoading(true);
    setLoadingPhase('Fetching page...');
    setResult(null);
    setError('');

    try {
      // Fire both requests in parallel
      const [gradePromise, psiPromise] = [
        // Server-side HTML analysis
        fetch('/api/grade-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        }),
        // PageSpeed Insights (client-side, no API key needed for basic usage)
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=mobile`
        ).catch(() => null),
      ];

      setLoadingPhase('Analysing SEO & security...');

      const gradeRes = await gradePromise;
      if (!gradeRes.ok) {
        const data = await gradeRes.json().catch(() => ({}));
        throw new Error(data.error || `Analysis failed (${gradeRes.status})`);
      }

      const gradeData: GradeResult = await gradeRes.json();

      setLoadingPhase('Checking performance...');

      // Get PageSpeed score
      let performanceScore = 0;
      try {
        const psiRes = await psiPromise;
        if (psiRes && psiRes.ok) {
          const psiData = await psiRes.json();
          const lighthouseScore = psiData?.lighthouseResult?.categories?.performance?.score;
          if (typeof lighthouseScore === 'number') {
            performanceScore = Math.round(lighthouseScore * 100);
          }
        }
      } catch {
        // PSI may fail for some sites; score stays 0
      }

      const overallScore = computeOverall(
        gradeData.seoScore,
        performanceScore,
        gradeData.securityScore,
        gradeData.contentScore
      );

      setResult({
        ...gradeData,
        performanceScore,
        overallScore,
        grade: scoreToGrade(overallScore),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingPhase('');
    }
  }, [url]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Website Grader
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Get an instant A-F grade covering SEO, performance, security, and content quality. Enter any URL for a free audit with actionable recommendations.
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
                Grading...
              </span>
            ) : (
              'Grade My Website'
            )}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-8">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-sm text-muted-foreground animate-pulse">{loadingPhase}</p>
            <div className="w-full max-w-xs">
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5B8AEF] animate-pulse"
                  style={{ width: loadingPhase.includes('performance') ? '80%' : loadingPhase.includes('Analysing') ? '50%' : '25%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Overall grade + URL */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
              <GradeBadge grade={result.grade} score={result.overallScore} />
              <div className="text-center sm:text-left">
                <h2
                  className="text-xl font-bold text-foreground sm:text-2xl"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Overall Grade: <span style={{ color: gradeColor(result.grade) }}>{result.grade}</span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground break-all">{result.url}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Score breakdown: SEO {result.seoScore} (40%) + Performance {result.performanceScore} (30%) + Security {result.securityScore} (20%) + Content {result.contentScore} (10%)
                </p>
              </div>
            </div>
          </div>

          {/* 2x2 category grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col items-center gap-2">
              <DonutGauge score={result.seoScore} label="SEO Score" />
              <p className="text-xs text-muted-foreground">
                {result.seoChecks.filter((c) => c.passed).length}/{result.seoChecks.length} checks passed
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col items-center gap-2">
              <DonutGauge score={result.performanceScore} label="Performance" />
              <p className="text-xs text-muted-foreground">
                {result.performanceScore > 0 ? 'PageSpeed Insights (mobile)' : 'Could not fetch PageSpeed data'}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col items-center gap-2">
              <DonutGauge score={result.securityScore} label="Security" />
              <p className="text-xs text-muted-foreground">
                {result.securityChecks.filter((c) => c.passed).length}/{result.securityChecks.length} headers present
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col items-center gap-2">
              <DonutGauge score={result.contentScore} label="Content" />
              <p className="text-xs text-muted-foreground">
                {result.contentStats.wordCount.toLocaleString()} words, {result.contentStats.internalLinks} internal links
              </p>
            </div>
          </div>

          {/* Detailed findings */}
          <div className="space-y-3">
            <h2
              className="text-xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Detailed Findings
            </h2>
            <ExpandableSection title="SEO Checks" checks={result.seoChecks} />
            <ExpandableSection title="Security Headers" checks={result.securityChecks} />
            <ContentDetails stats={result.contentStats} />
          </div>

          {/* CTA section */}
          <div className="rounded-xl border border-[#5B8AEF]/30 bg-[#5B8AEF]/[0.06] p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <h2
                className="text-xl font-bold text-foreground sm:text-2xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Want to improve your score?
              </h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                I help businesses in Reading and across the UK improve their search rankings, site speed, and technical SEO. Book a free 30-minute consultation to discuss how to fix these issues and grow your organic traffic.
              </p>
              <Link
                href="/contact/"
                className="rounded-lg bg-[#5B8AEF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90"
              >
                Book a Free Consultation
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* How it works (shown when no results) */}
      {!result && !loading && (
        <div className="mt-12">
          <h2
            className="text-xl font-bold tracking-tight text-foreground mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            What This Tool Checks
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">SEO (40% of grade)</h3>
              <p className="text-sm text-muted-foreground">
                Title tag, meta description, heading structure, canonical tags, Open Graph meta, structured data, image alt text, and indexability.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Performance (30% of grade)</h3>
              <p className="text-sm text-muted-foreground">
                Google PageSpeed Insights score for mobile. Covers Core Web Vitals including LCP, CLS, and interaction responsiveness.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Security (20% of grade)</h3>
              <p className="text-sm text-muted-foreground">
                HTTPS usage, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and Strict-Transport-Security headers.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Content (10% of grade)</h3>
              <p className="text-sm text-muted-foreground">
                Word count, internal and external link count, image count, and heading diversity to assess content depth and structure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
