'use client';

import { useState, FormEvent } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface OgData {
  url: string;
  title: string | null;
  metaDescription: string | null;
  favicon: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function truncate(text: string | undefined | null, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
function CheckIcon() {
  return (
    <svg className="inline-block h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="inline-block h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="mr-1 inline-block h-3 w-3 opacity-50" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.354 5.354a.5.5 0 010-.708l3-3a2.5 2.5 0 013.536 3.536l-3 3a.5.5 0 01-.708-.708l3-3a1.5 1.5 0 00-2.122-2.122l-3 3a.5.5 0 01-.706.002zm3.292 5.292a.5.5 0 010 .708l-3 3a2.5 2.5 0 01-3.536-3.536l3-3a.5.5 0 01.708.708l-3 3a1.5 1.5 0 002.122 2.122l3-3a.5.5 0 01.708 0z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Image placeholder                                                  */
/* ------------------------------------------------------------------ */
function ImagePlaceholder({ aspect = '16/9' }: { aspect?: string }) {
  return (
    <div
      className="flex items-center justify-center bg-[#e4e6eb] dark:bg-white/[0.06]"
      style={{ aspectRatio: aspect }}
    >
      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Facebook preview                                                   */
/* ------------------------------------------------------------------ */
function FacebookPreview({ data }: { data: OgData }) {
  const image = data.og['og:image'];
  const title = data.og['og:title'] || data.title || 'Untitled';
  const description = data.og['og:description'] || data.metaDescription || '';
  const siteName = data.og['og:site_name'] || getDomain(data.url);
  const domain = getDomain(data.url);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Facebook
      </h3>
      <div className="overflow-hidden rounded-lg border border-[#dadde1] dark:border-white/[0.1] bg-[#f0f2f5] dark:bg-white/[0.04]">
        {image ? (
          <div style={{ aspectRatio: '16/9' }} className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<div class="flex h-full items-center justify-center bg-[#e4e6eb] dark:bg-white/[0.06]"><svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
              }}
            />
          </div>
        ) : (
          <ImagePlaceholder />
        )}
        <div className="px-3 py-2.5">
          <p className="text-[11px] font-normal uppercase tracking-wide text-gray-500 dark:text-muted-foreground">
            {domain}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold leading-5 text-[#1d2129] dark:text-foreground line-clamp-2">
            {title}
          </p>
          <p className="mt-0.5 text-[13px] leading-[18px] text-gray-500 dark:text-muted-foreground line-clamp-2">
            {truncate(description, 200)}
          </p>
          {siteName && siteName !== domain && (
            <p className="mt-1 text-[11px] uppercase text-gray-400 dark:text-muted-foreground/60">
              {siteName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Twitter/X preview                                                  */
/* ------------------------------------------------------------------ */
function TwitterPreview({ data }: { data: OgData }) {
  const card = data.twitter['twitter:card'] || 'summary_large_image';
  const image = data.twitter['twitter:image'] || data.og['og:image'];
  const title = data.twitter['twitter:title'] || data.og['og:title'] || data.title || 'Untitled';
  const description = data.twitter['twitter:description'] || data.og['og:description'] || data.metaDescription || '';
  const domain = getDomain(data.url);

  const isLarge = card === 'summary_large_image';

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Twitter / X
      </h3>
      {isLarge ? (
        /* --- Large summary image card --- */
        <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-black/40">
          {image ? (
            <div style={{ aspectRatio: '16/9' }} className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ) : (
            <ImagePlaceholder />
          )}
          <div className="px-3 py-2.5">
            <p className="text-[15px] font-bold leading-5 text-foreground line-clamp-1">
              {title}
            </p>
            <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground line-clamp-2">
              {truncate(description, 200)}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground/70">
              <LinkIcon />
              {domain}
            </p>
          </div>
        </div>
      ) : (
        /* --- Summary card (small image left) --- */
        <div className="flex overflow-hidden rounded-2xl border border-white/[0.1] bg-black/40">
          <div className="flex h-[125px] w-[125px] shrink-0 items-center justify-center overflow-hidden border-r border-white/[0.1] bg-white/[0.04]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <ImagePlaceholder aspect="1/1" />
            )}
          </div>
          <div className="flex flex-col justify-center px-3 py-2">
            <p className="text-[13px] text-muted-foreground/70">
              <LinkIcon />
              {domain}
            </p>
            <p className="mt-0.5 text-[15px] font-bold leading-5 text-foreground line-clamp-2">
              {title}
            </p>
            <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground line-clamp-2">
              {truncate(description, 150)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LinkedIn preview                                                   */
/* ------------------------------------------------------------------ */
function LinkedInPreview({ data }: { data: OgData }) {
  const image = data.og['og:image'];
  const title = data.og['og:title'] || data.title || 'Untitled';
  const domain = getDomain(data.url);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        LinkedIn
      </h3>
      <div className="overflow-hidden rounded-lg border border-white/[0.1] bg-white/[0.03]">
        {image ? (
          <div style={{ aspectRatio: '1.91/1' }} className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        ) : (
          <ImagePlaceholder aspect="1.91/1" />
        )}
        <div className="bg-[#eef3f8] px-3 py-2.5 dark:bg-white/[0.06]">
          <p className="text-[14px] font-semibold leading-5 text-[#000000e6] dark:text-foreground line-clamp-2">
            {title}
          </p>
          <p className="mt-0.5 text-[12px] text-gray-500 dark:text-muted-foreground">
            {domain}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tag audit table                                                    */
/* ------------------------------------------------------------------ */
const CRITICAL_TAGS = ['og:title', 'og:description', 'og:image'];
const RECOMMENDED_TAGS = ['og:url', 'og:type', 'og:site_name', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:site'];

function TagAudit({ data }: { data: OgData }) {
  const allTags: Record<string, string | null> = {};

  // Combine all og and twitter tags found
  for (const [k, v] of Object.entries(data.og)) {
    allTags[k] = v;
  }
  for (const [k, v] of Object.entries(data.twitter)) {
    allTags[k] = v;
  }

  // Also ensure critical + recommended are listed even if missing
  for (const tag of [...CRITICAL_TAGS, ...RECOMMENDED_TAGS]) {
    if (!(tag in allTags)) {
      allTags[tag] = null;
    }
  }

  // Also add fallback <title> and <meta description>
  const rows: { tag: string; value: string | null; status: 'present' | 'missing' | 'warning' }[] = [];

  // Add HTML fallbacks first
  rows.push({
    tag: '<title>',
    value: data.title,
    status: data.title ? 'present' : 'missing',
  });
  rows.push({
    tag: '<meta description>',
    value: data.metaDescription,
    status: data.metaDescription ? 'present' : 'missing',
  });

  // Sort: critical first, then recommended, then the rest
  const sortedTags = Object.keys(allTags).sort((a, b) => {
    const aCrit = CRITICAL_TAGS.includes(a) ? 0 : RECOMMENDED_TAGS.includes(a) ? 1 : 2;
    const bCrit = CRITICAL_TAGS.includes(b) ? 0 : RECOMMENDED_TAGS.includes(b) ? 1 : 2;
    if (aCrit !== bCrit) return aCrit - bCrit;
    return a.localeCompare(b);
  });

  for (const tag of sortedTags) {
    const value = allTags[tag];
    let status: 'present' | 'missing' | 'warning' = 'present';
    if (!value) {
      status = CRITICAL_TAGS.includes(tag) ? 'missing' : 'warning';
    }
    rows.push({ tag, value, status });
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        Tag Audit
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Status</th>
              <th className="pb-2 pr-4 font-medium text-muted-foreground">Tag</th>
              <th className="pb-2 font-medium text-muted-foreground">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.tag} className="border-b border-white/[0.04]">
                <td className="py-2 pr-4">
                  {row.status === 'present' && <CheckIcon />}
                  {row.status === 'missing' && <XIcon />}
                  {row.status === 'warning' && (
                    <svg className="inline-block h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </td>
                <td className={`py-2 pr-4 font-mono text-xs ${
                  row.status === 'present' ? 'text-emerald-400' :
                  row.status === 'missing' ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {row.tag}
                </td>
                <td className="py-2 text-xs text-muted-foreground break-all">
                  {row.value || (
                    <span className={row.status === 'missing' ? 'text-red-400' : 'text-amber-400'}>
                      {row.status === 'missing' ? 'Missing (critical)' : 'Not set'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function OgPreview() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OgData | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
      setUrl(finalUrl);
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/fetch-og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || `Request failed with status ${res.status}`);
        return;
      }

      setData(json);
    } catch {
      setError('Failed to fetch. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Open Graph Preview
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          See how your URL looks when shared on Facebook, Twitter/X, and LinkedIn. Check your Open Graph tags and fix social sharing issues.
        </p>
      </div>

      {/* URL input form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <label htmlFor="og-url" className="text-sm font-medium text-foreground">
          Enter a URL to preview
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="og-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner />
                Fetching...
              </>
            ) : (
              'Preview'
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="mt-8 space-y-8">
          {/* Platform previews */}
          <div className="grid gap-6 md:grid-cols-3">
            <FacebookPreview data={data} />
            <TwitterPreview data={data} />
            <LinkedInPreview data={data} />
          </div>

          {/* Tag audit table */}
          <TagAudit data={data} />

          {/* SEO tip */}
          <div className="rounded-xl border border-[#5B8AEF]/20 bg-[#5B8AEF]/5 p-6">
            <h3 className="text-sm font-semibold text-[#5B8AEF]" style={{ fontFamily: 'var(--font-heading)' }}>
              Why Open Graph tags matter for SEO
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Open Graph tags control how your content appears when shared on social media. While they are not a direct
              Google ranking factor, well-optimised social previews increase click-through rates from platforms like
              Facebook, Twitter/X, and LinkedIn. Higher engagement drives more referral traffic, brand signals,
              and natural backlinks &mdash; all of which have an indirect but meaningful impact on search rankings.
              At minimum, every page should have <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs font-mono text-[#5B8AEF]">og:title</code>,{' '}
              <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs font-mono text-[#5B8AEF]">og:description</code>, and{' '}
              <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs font-mono text-[#5B8AEF]">og:image</code> set.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
