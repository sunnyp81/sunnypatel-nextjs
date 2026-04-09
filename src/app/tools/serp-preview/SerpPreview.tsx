'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Pixel-width estimation for Arial 20px (Google title font)         */
/*  Widths sampled from a canvas measurement of common characters.    */
/* ------------------------------------------------------------------ */
const CHAR_WIDTHS: Record<string, number> = {
  ' ': 5.6, '!': 5.6, '"': 7.1, '#': 11.2, $: 11.2, '%': 13.4, '&': 12.3,
  "'": 4.5, '(': 6.7, ')': 6.7, '*': 7.8, '+': 11.7, ',': 5.6, '-': 6.7,
  '.': 5.6, '/': 5.6, '0': 11.2, '1': 11.2, '2': 11.2, '3': 11.2,
  '4': 11.2, '5': 11.2, '6': 11.2, '7': 11.2, '8': 11.2, '9': 11.2,
  ':': 5.6, ';': 5.6, '<': 11.7, '=': 11.7, '>': 11.7, '?': 10.0,
  '@': 18.2, A: 12.3, B: 12.3, C: 12.3, D: 13.4, E: 11.2, F: 10.0,
  G: 13.4, H: 13.4, I: 5.6, J: 8.9, K: 12.3, L: 10.0, M: 15.6,
  N: 13.4, O: 13.4, P: 11.2, Q: 13.4, R: 12.3, S: 11.2, T: 10.0,
  U: 13.4, V: 12.3, W: 16.7, X: 11.2, Y: 10.0, Z: 11.2,
  a: 10.0, b: 11.2, c: 10.0, d: 11.2, e: 10.0, f: 5.6, g: 11.2,
  h: 11.2, i: 4.5, j: 5.6, k: 10.0, l: 4.5, m: 16.7, n: 11.2,
  o: 11.2, p: 11.2, q: 11.2, r: 6.7, s: 8.9, t: 6.7, u: 11.2,
  v: 10.0, w: 14.5, x: 10.0, y: 10.0, z: 8.9,
};
const DEFAULT_CHAR_WIDTH = 10.0;

function estimatePixelWidth(text: string): number {
  let total = 0;
  for (const ch of text) {
    total += CHAR_WIDTHS[ch] ?? DEFAULT_CHAR_WIDTH;
  }
  return Math.round(total);
}

/* ------------------------------------------------------------------ */
/*  Canvas-based measurement (more accurate, runs client-side only)   */
/* ------------------------------------------------------------------ */
function useCanvasMeasure() {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '20px Arial';
      ctxRef.current = ctx;
    }
  }, []);

  return useCallback(
    (text: string): number => {
      if (ctxRef.current) {
        return Math.round(ctxRef.current.measureText(text).width);
      }
      return estimatePixelWidth(text);
    },
    []
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge component                                            */
/* ------------------------------------------------------------------ */
type StatusColor = 'green' | 'amber' | 'red';

function StatusBadge({ color, label }: { color: StatusColor; label: string }) {
  const colors: Record<StatusColor, string> = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                      */
/* ------------------------------------------------------------------ */
function PixelBar({ used, max }: { used: number; max: number }) {
  const pct = Math.min((used / max) * 100, 100);
  const color =
    pct <= 85 ? 'bg-emerald-500' : pct <= 100 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.06]">
      <div
        className={`h-full rounded-full transition-all duration-200 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Google SERP preview card                                          */
/* ------------------------------------------------------------------ */
function GooglePreviewCard({
  title,
  url,
  description,
  maxTitlePx,
  measurePx,
}: {
  title: string;
  url: string;
  description: string;
  maxTitlePx: number;
  measurePx: (t: string) => number;
}) {
  const displayUrl = url || 'https://example.com';

  // Breadcrumb-style URL: domain > path segments
  const breadcrumb = (() => {
    try {
      const u = new URL(displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`);
      const parts = u.pathname
        .split('/')
        .filter(Boolean)
        .map((p) => decodeURIComponent(p));
      if (parts.length === 0) return u.hostname;
      return `${u.hostname} > ${parts.join(' > ')}`;
    } catch {
      return displayUrl;
    }
  })();

  // Truncate title
  const titlePx = measurePx(title || 'Page Title');
  const isTruncated = titlePx > maxTitlePx;
  const displayTitle = title || 'Page Title';

  // Truncate description at ~920px (~two lines at 14px Arial)
  const maxDescChars = 160;
  const displayDesc = description
    ? description.length > maxDescChars
      ? description.slice(0, maxDescChars) + '...'
      : description
    : 'Add a meta description to see how it will appear in Google search results.';

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#5B8AEF]" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Google Preview
        </span>
      </div>
      <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
        {/* Favicon + site name row */}
        <div className="mb-0.5 flex items-center gap-2">
          <div
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
            style={{ backgroundColor: '#f1f3f4' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#70757a" strokeWidth="2" />
              <path d="M12 2a10 10 0 0 1 0 20" stroke="#70757a" strokeWidth="2" />
              <path d="M2 12h20" stroke="#70757a" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#202124' }}>
              {(() => {
                try {
                  const u = new URL(displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`);
                  return u.hostname.replace(/^www\./, '');
                } catch {
                  return 'example.com';
                }
              })()}
            </span>
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#4d5156' }}>
              {breadcrumb}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="mt-1 cursor-pointer hover:underline"
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            lineHeight: '1.3',
            color: '#1a0dab',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: `${maxTitlePx}px`,
          }}
          title={isTruncated ? displayTitle : undefined}
        >
          {displayTitle}
        </h3>

        {/* Description */}
        <p
          className="mt-1"
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.58',
            color: '#4d5156',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {displayDesc}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function SerpPreview() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  const measurePx = useCanvasMeasure();

  const maxTitlePx = viewport === 'desktop' ? 580 : 480;
  const titlePx = useMemo(() => measurePx(title || 'Page Title'), [title, measurePx]);

  const titleStatus: StatusColor = titlePx <= maxTitlePx * 0.85 ? 'green' : titlePx <= maxTitlePx ? 'amber' : 'red';
  const titleStatusLabel =
    titleStatus === 'green'
      ? 'Good length'
      : titleStatus === 'amber'
        ? 'Near limit'
        : 'Will be truncated';

  const descLen = description.length;
  const descStatus: StatusColor = descLen === 0 ? 'red' : descLen >= 120 && descLen <= 160 ? 'green' : descLen > 160 ? 'red' : 'amber';
  const descStatusLabel =
    descLen === 0
      ? 'Empty'
      : descStatus === 'green'
        ? 'Optimal'
        : descStatus === 'amber'
          ? 'Could be longer'
          : 'Too long';

  const urlLen = url.length;
  const urlStatus: StatusColor = urlLen === 0 ? 'amber' : urlLen <= 60 ? 'green' : urlLen <= 80 ? 'amber' : 'red';
  const urlStatusLabel =
    urlLen === 0 ? 'No URL entered' : urlStatus === 'green' ? 'Good' : urlStatus === 'amber' ? 'A bit long' : 'Very long';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          SERP Snippet Previewer
        </h1>
        <p className="mt-3 text-muted-foreground">
          See exactly how your page will appear in Google search results. Check title pixel width, meta description length, and URL display before publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: inputs */}
        <div className="flex flex-col gap-5">
          {/* Title input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Title Tag</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {title.length} chars / {titlePx}px of {maxTitlePx}px
                </span>
                <StatusBadge color={titleStatus} label={titleStatusLabel} />
              </div>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
              placeholder="Your Page Title | Brand Name"
            />
            <PixelBar used={titlePx} max={maxTitlePx} />
          </div>

          {/* Meta description input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Meta Description</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {descLen} / 160 chars
                </span>
                <StatusBadge color={descStatus} label={descStatusLabel} />
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
              placeholder="Write a compelling meta description for your page..."
            />
          </div>

          {/* URL input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">URL</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{urlLen} chars</span>
                <StatusBadge color={urlStatus} label={urlStatusLabel} />
              </div>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
              placeholder="https://example.com/your-page/"
            />
          </div>

          {/* Viewport toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Viewport:</span>
            <div className="flex overflow-hidden rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setViewport('desktop')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewport === 'desktop'
                    ? 'bg-[#5B8AEF] text-white shadow-[0_0_20px_rgba(91,138,239,0.35)]'
                    : 'bg-white/[0.03] text-muted-foreground hover:text-foreground'
                }`}
              >
                Desktop (580px)
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewport === 'mobile'
                    ? 'bg-[#5B8AEF] text-white shadow-[0_0_20px_rgba(91,138,239,0.35)]'
                    : 'bg-white/[0.03] text-muted-foreground hover:text-foreground'
                }`}
              >
                Mobile (480px)
              </button>
            </div>
          </div>
        </div>

        {/* Right column: preview */}
        <div className="flex flex-col gap-4">
          <GooglePreviewCard
            title={title}
            url={url}
            description={description}
            maxTitlePx={maxTitlePx}
            measurePx={measurePx}
          />

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-muted-foreground">Title Width</p>
              <p className="mt-1 text-lg font-bold font-mono text-foreground">{titlePx}px</p>
              <p className="text-xs text-muted-foreground">/ {maxTitlePx}px max</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="mt-1 text-lg font-bold font-mono text-foreground">{descLen}</p>
              <p className="text-xs text-muted-foreground">/ 160 chars</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-muted-foreground">URL Length</p>
              <p className="mt-1 text-lg font-bold font-mono text-foreground">{urlLen}</p>
              <p className="text-xs text-muted-foreground">characters</p>
            </div>
          </div>
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
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground">Title Tag Truncation</h3>
            <p className="mt-1">
              Google does not truncate titles by character count &mdash; it uses pixel width. Desktop results truncate at approximately 580 pixels, while mobile truncates at around 480 pixels. This tool measures your title using the same Arial 20px font Google uses, giving you an accurate pixel-width estimate. Keep your most important keywords at the front, as the end of a long title may be replaced with an ellipsis (&hellip;).
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Meta Description Length</h3>
            <p className="mt-1">
              Google typically displays up to 155&ndash;160 characters of your meta description on desktop, and slightly fewer on mobile. Descriptions between 120&ndash;160 characters tend to perform best &mdash; long enough to be compelling, short enough to avoid truncation. If your description is too short, Google may pull text from your page content instead.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">URL Display</h3>
            <p className="mt-1">
              Google shows URLs in a breadcrumb format (domain &gt; path &gt; segment). Shorter, descriptive URLs with real words perform better in search results. Avoid long query strings, session IDs, or deeply nested paths. Your URL should give users a clear idea of the page content before they click.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Best Practices</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Front-load your primary keyword in the title tag.</li>
              <li>Include a compelling call-to-action or unique value proposition in the meta description.</li>
              <li>Use a pipe (|) or dash (&ndash;) to separate your brand name at the end of the title.</li>
              <li>Test both desktop and mobile previews &mdash; your title may fit on desktop but truncate on mobile.</li>
              <li>Avoid ALL CAPS &mdash; uppercase letters are wider and consume more pixel budget.</li>
              <li>Remember: Google may rewrite your title if it doesn&apos;t match the page content well.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
