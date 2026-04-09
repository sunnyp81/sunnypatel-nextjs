'use client';

import { useState, useCallback, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pl', label: 'Polish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' },
  { code: 'fi', label: 'Finnish' },
  { code: 'no', label: 'Norwegian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'cs', label: 'Czech' },
  { code: 'ro', label: 'Romanian' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'el', label: 'Greek' },
  { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'he', label: 'Hebrew' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'ca', label: 'Catalan' },
  { code: 'hr', label: 'Croatian' },
  { code: 'sk', label: 'Slovak' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'lv', label: 'Latvian' },
  { code: 'et', label: 'Estonian' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ta', label: 'Tamil' },
  { code: 'fil', label: 'Filipino' },
];

const REGIONS: { code: string; label: string }[] = [
  { code: '', label: 'None (language only)' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'AU', label: 'Australia' },
  { code: 'CA', label: 'Canada' },
  { code: 'IE', label: 'Ireland' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'IN', label: 'India' },
  { code: 'DE', label: 'Germany' },
  { code: 'AT', label: 'Austria' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgium' },
  { code: 'ES', label: 'Spain' },
  { code: 'MX', label: 'Mexico' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CO', label: 'Colombia' },
  { code: 'CL', label: 'Chile' },
  { code: 'PT', label: 'Portugal' },
  { code: 'BR', label: 'Brazil' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'RU', label: 'Russia' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'CN', label: 'China' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'SG', label: 'Singapore' },
  { code: 'PH', label: 'Philippines' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'TH', label: 'Thailand' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'AE', label: 'UAE' },
  { code: 'EG', label: 'Egypt' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'KE', label: 'Kenya' },
  { code: 'SE', label: 'Sweden' },
  { code: 'DK', label: 'Denmark' },
  { code: 'FI', label: 'Finland' },
  { code: 'NO', label: 'Norway' },
  { code: 'PL', label: 'Poland' },
  { code: 'CZ', label: 'Czech Republic' },
  { code: 'RO', label: 'Romania' },
  { code: 'HU', label: 'Hungary' },
  { code: 'GR', label: 'Greece' },
  { code: 'TR', label: 'Turkey' },
  { code: 'IL', label: 'Israel' },
  { code: 'UA', label: 'Ukraine' },
];

type Row = {
  id: string;
  url: string;
  language: string;
  region: string;
};

type OutputFormat = 'html' | 'xml';

interface Preset {
  label: string;
  rows: Omit<Row, 'id'>[];
}

const PRESETS: Preset[] = [
  {
    label: 'English (UK + US + AU)',
    rows: [
      { url: 'https://example.com/en-gb/', language: 'en', region: 'GB' },
      { url: 'https://example.com/en-us/', language: 'en', region: 'US' },
      { url: 'https://example.com/en-au/', language: 'en', region: 'AU' },
    ],
  },
  {
    label: 'European (EN/FR/DE/ES/IT)',
    rows: [
      { url: 'https://example.com/en/', language: 'en', region: '' },
      { url: 'https://example.com/fr/', language: 'fr', region: '' },
      { url: 'https://example.com/de/', language: 'de', region: '' },
      { url: 'https://example.com/es/', language: 'es', region: '' },
      { url: 'https://example.com/it/', language: 'it', region: '' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let rowIdCounter = 0;
function makeId() {
  return 'row_' + ++rowIdCounter;
}

function hreflangCode(lang: string, region: string): string {
  if (!region) return lang;
  return `${lang}-${region}`;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Chevron SVG (for selects)                                          */
/* ------------------------------------------------------------------ */

const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`;

const selectClass =
  'w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 pr-8 text-sm text-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30';

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HreflangGenerator() {
  const [rows, setRows] = useState<Row[]>([
    { id: makeId(), url: '', language: 'en', region: 'GB' },
    { id: makeId(), url: '', language: 'en', region: 'US' },
  ]);
  const [includeXDefault, setIncludeXDefault] = useState(true);
  const [xDefaultUrl, setXDefaultUrl] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('html');
  const [copied, setCopied] = useState(false);

  /* ---- Row CRUD ---- */

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: makeId(), url: '', language: 'en', region: '' }]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const updateRow = useCallback((id: string, field: keyof Omit<Row, 'id'>, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setRows(preset.rows.map((r) => ({ ...r, id: makeId() })));
  }, []);

  /* ---- Validation ---- */

  const warnings = useMemo(() => {
    const w: string[] = [];

    // Missing x-default
    if (!includeXDefault) {
      w.push('Missing x-default: Google recommends including an x-default hreflang for the fallback page.');
    } else if (includeXDefault && !xDefaultUrl.trim()) {
      w.push('x-default is enabled but no URL is set.');
    } else if (includeXDefault && xDefaultUrl.trim() && !isValidUrl(xDefaultUrl.trim())) {
      w.push('x-default URL is not a valid URL (must start with http:// or https://).');
    }

    // Invalid URLs
    rows.forEach((r, i) => {
      if (r.url.trim() && !isValidUrl(r.url.trim())) {
        w.push(`Row ${i + 1}: URL is not valid.`);
      }
    });

    // Empty URLs
    const emptyUrlRows = rows.filter((r) => !r.url.trim());
    if (emptyUrlRows.length > 0) {
      w.push(`${emptyUrlRows.length} row(s) have empty URLs.`);
    }

    // Duplicate language-region
    const seen = new Set<string>();
    rows.forEach((r, i) => {
      const code = hreflangCode(r.language, r.region);
      if (seen.has(code)) {
        w.push(`Row ${i + 1}: duplicate language-region "${code}" — each combo must be unique.`);
      }
      seen.add(code);
    });

    return w;
  }, [rows, includeXDefault, xDefaultUrl]);

  /* ---- Output generation ---- */

  const output = useMemo(() => {
    const validRows = rows.filter((r) => r.url.trim());
    if (validRows.length === 0) return '';

    if (outputFormat === 'html') {
      const lines: string[] = [];
      // Self-referencing: every page needs every hreflang tag, including itself
      for (const r of validRows) {
        const code = hreflangCode(r.language, r.region);
        lines.push(`<link rel="alternate" hreflang="${code}" href="${r.url.trim()}" />`);
      }
      if (includeXDefault && xDefaultUrl.trim()) {
        lines.push(`<link rel="alternate" hreflang="x-default" href="${xDefaultUrl.trim()}" />`);
      }
      return lines.join('\n');
    }

    // XML sitemap format
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    lines.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml">');

    for (const r of validRows) {
      lines.push('  <url>');
      lines.push(`    <loc>${r.url.trim()}</loc>`);
      for (const alt of validRows) {
        const code = hreflangCode(alt.language, alt.region);
        lines.push(`    <xhtml:link rel="alternate" hreflang="${code}" href="${alt.url.trim()}" />`);
      }
      if (includeXDefault && xDefaultUrl.trim()) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl.trim()}" />`);
      }
      lines.push('  </url>');
    }

    lines.push('</urlset>');
    return lines.join('\n');
  }, [rows, includeXDefault, xDefaultUrl, outputFormat]);

  /* ---- Clipboard ---- */

  const copyToClipboard = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  /* ---- Render ---- */

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Hreflang Tag Generator
        </h1>
        <p className="mt-3 text-muted-foreground">
          Generate correct hreflang tags for multilingual and multi-regional websites. Add your
          language versions below, choose HTML or XML sitemap format, and copy the output straight
          into your site.
        </p>
      </div>

      {/* Presets */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Quick presets:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08]"
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() =>
            setRows([{ id: makeId(), url: '', language: 'en', region: '' }])
          }
          className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08]"
        >
          Custom (reset)
        </button>
      </div>

      {/* Language rows */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Language Versions
          </h2>
          <button
            onClick={addRow}
            className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-all hover:bg-[#4a79de] hover:shadow-[0_0_28px_rgba(91,138,239,0.5)]"
          >
            + Add Language Version
          </button>
        </div>

        {/* Column labels (desktop) */}
        <div className="mb-2 hidden grid-cols-12 gap-3 md:grid">
          <div className="col-span-5">
            <span className="text-sm font-medium text-foreground">URL</span>
          </div>
          <div className="col-span-3">
            <span className="text-sm font-medium text-foreground">Language</span>
          </div>
          <div className="col-span-3">
            <span className="text-sm font-medium text-foreground">Region (optional)</span>
          </div>
          <div className="col-span-1" />
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={row.id} className="grid grid-cols-1 gap-3 md:grid-cols-12">
              {/* URL */}
              <div className="md:col-span-5">
                <label className="mb-1 block text-sm font-medium text-foreground md:hidden">
                  URL
                </label>
                <input
                  type="url"
                  value={row.url}
                  onChange={(e) => updateRow(row.id, 'url', e.target.value)}
                  placeholder={`https://example.com/${row.language}${row.region ? '-' + row.region.toLowerCase() : ''}/`}
                  className={inputClass}
                />
              </div>

              {/* Language */}
              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-foreground md:hidden">
                  Language
                </label>
                <select
                  value={row.language}
                  onChange={(e) => updateRow(row.id, 'language', e.target.value)}
                  className={selectClass}
                  style={{
                    backgroundImage: chevronSvg,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label} ({l.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-foreground md:hidden">
                  Region
                </label>
                <select
                  value={row.region}
                  onChange={(e) => updateRow(row.id, 'region', e.target.value)}
                  className={selectClass}
                  style={{
                    backgroundImage: chevronSvg,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  {REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code ? `${r.label} (${r.code})` : r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove */}
              <div className="flex items-end justify-start md:col-span-1 md:justify-center">
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-2 text-sm"
                  title="Remove row"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* x-default + output format */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* x-default */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={includeXDefault}
              onChange={(e) => setIncludeXDefault(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 accent-[#5B8AEF]"
            />
            <span className="text-sm font-medium text-foreground">
              Include x-default (fallback URL)
            </span>
          </label>
          {includeXDefault && (
            <div className="mt-3">
              <input
                type="url"
                value={xDefaultUrl}
                onChange={(e) => setXDefaultUrl(e.target.value)}
                placeholder="https://example.com/"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                The x-default URL is shown to users whose language/region does not match any
                hreflang tag.
              </p>
            </div>
          )}
        </div>

        {/* Output format */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="mb-3 text-sm font-medium text-foreground">Output Format</p>
          <div className="flex gap-3">
            <button
              onClick={() => setOutputFormat('html')}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                outputFormat === 'html'
                  ? 'bg-[#5B8AEF] text-white shadow-[0_0_20px_rgba(91,138,239,0.35)]'
                  : 'border border-white/[0.12] bg-white/[0.04] text-foreground hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08]'
              }`}
            >
              HTML &lt;link&gt; Tags
            </button>
            <button
              onClick={() => setOutputFormat('xml')}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                outputFormat === 'xml'
                  ? 'bg-[#5B8AEF] text-white shadow-[0_0_20px_rgba(91,138,239,0.35)]'
                  : 'border border-white/[0.12] bg-white/[0.04] text-foreground hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08]'
              }`}
            >
              XML Sitemap
            </button>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] p-4">
          <p className="mb-1.5 text-sm font-medium text-amber-400">Warnings</p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-amber-400 text-xs">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code preview */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Generated Output</label>
          <button
            onClick={copyToClipboard}
            disabled={!output}
            className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-all hover:bg-[#4a79de] hover:shadow-[0_0_28px_rgba(91,138,239,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
        <div className="rounded-lg bg-[#0d0d14] border border-white/[0.08] p-4 font-mono text-sm overflow-x-auto">
          {output ? (
            <pre className="whitespace-pre text-foreground">{output}</pre>
          ) : (
            <p className="text-muted-foreground italic">
              Add URLs above to generate hreflang tags...
            </p>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="mb-3 text-lg font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How Hreflang Tags Work
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            The <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">hreflang</code> attribute
            tells search engines which language and regional version of a page to show to users. It
            prevents duplicate content issues across multilingual sites and ensures the right version
            appears in local search results.
          </p>

          <div>
            <h3 className="mb-1.5 text-foreground font-medium">Tag syntax</h3>
            <p>
              Each tag uses an ISO 639-1 language code (e.g.{' '}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">en</code>),
              optionally followed by an ISO 3166-1 Alpha-2 region code (e.g.{' '}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">en-GB</code>
              ). Language-only tags target all regions for that language; language + region tags
              target a specific country.
            </p>
          </div>

          <div>
            <h3 className="mb-1.5 text-foreground font-medium">x-default</h3>
            <p>
              The{' '}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">
                x-default
              </code>{' '}
              value designates the fallback page shown when no other hreflang matches the
              user&apos;s language or region. Google strongly recommends including it.
            </p>
          </div>

          <div>
            <h3 className="mb-1.5 text-foreground font-medium">Self-referencing tags</h3>
            <p>
              Every page in the set must include hreflang tags pointing to{' '}
              <strong className="text-foreground">all</strong> versions, including itself. This is
              the most common mistake — forgetting the self-referencing tag causes search engines to
              ignore the entire hreflang set.
            </p>
          </div>

          <div>
            <h3 className="mb-1.5 text-foreground font-medium">Reciprocal confirmation</h3>
            <p>
              Hreflang tags must be reciprocal. If page A links to page B with hreflang, page B must
              link back to page A. Non-reciprocal tags are treated as errors and ignored.
            </p>
          </div>

          <div>
            <h3 className="mb-1.5 text-foreground font-medium">Implementation methods</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              <li>
                <span className="text-foreground font-medium">HTML &lt;link&gt; tags</span> — placed
                in the <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">&lt;head&gt;</code> of
                each page. Best for smaller sites.
              </li>
              <li>
                <span className="text-foreground font-medium">XML Sitemap</span> — hreflang annotations
                added inside each <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">&lt;url&gt;</code> element.
                Better for large sites with many language versions.
              </li>
              <li>
                <span className="text-foreground font-medium">HTTP headers</span> — useful for
                non-HTML files (PDFs). Not generated by this tool.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-1.5 text-foreground font-medium">Common mistakes to avoid</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              <li>Missing self-referencing tags on each page.</li>
              <li>Non-reciprocal tags between page pairs.</li>
              <li>Using country codes alone (e.g. &quot;GB&quot;) without a language prefix.</li>
              <li>Pointing hreflang tags to redirected or non-canonical URLs.</li>
              <li>Mixing implementation methods (use one consistently).</li>
              <li>Forgetting the x-default fallback.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
