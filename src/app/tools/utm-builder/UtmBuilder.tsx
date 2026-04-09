'use client';

import { useState, useEffect, useCallback } from 'react';

/* ── Preset data ─────────────────────────────────────────────── */
const SOURCE_PRESETS = ['google', 'facebook', 'twitter', 'linkedin', 'email', 'newsletter'];
const MEDIUM_PRESETS = ['cpc', 'email', 'social', 'banner', 'referral'];

/* ── Types ───────────────────────────────────────────────────── */
interface HistoryEntry {
  url: string;
  label: string;
  ts: number;
}

const HISTORY_KEY = 'utm-builder-history';
const MAX_HISTORY = 10;

/* ── Helpers ─────────────────────────────────────────────────── */
function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str.startsWith('http') ? str : `https://${str}`);
    return !!u.hostname.includes('.');
  } catch {
    return false;
  }
}

function buildUtmUrl(
  websiteUrl: string,
  source: string,
  medium: string,
  campaign: string,
  term: string,
  content: string,
): string {
  if (!websiteUrl) return '';
  let base = websiteUrl.trim();
  if (!/^https?:\/\//i.test(base)) base = 'https://' + base;

  try {
    const url = new URL(base);
    if (source) url.searchParams.set('utm_source', source.trim());
    if (medium) url.searchParams.set('utm_medium', medium.trim());
    if (campaign) url.searchParams.set('utm_campaign', campaign.trim());
    if (term) url.searchParams.set('utm_term', term.trim());
    if (content) url.searchParams.set('utm_content', content.trim());
    return url.toString();
  } catch {
    return '';
  }
}

/* ── Component ───────────────────────────────────────────────── */
export default function UtmBuilder() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedHistoryIdx, setCopiedHistoryIdx] = useState<number | null>(null);

  /* Load history from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
  }, []);

  /* Derived state */
  const generatedUrl = buildUtmUrl(websiteUrl, source, medium, campaign, term, content);
  const urlValid = !websiteUrl || isValidUrl(websiteUrl);
  const requiredMissing = touched && (!websiteUrl || !source || !medium || !campaign);
  const canGenerate = !!websiteUrl && !!source && !!medium && !!campaign && urlValid;

  /* Copy generated URL */
  const handleCopy = useCallback(async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    /* Add to history */
    const label = `${source} / ${medium} / ${campaign}`;
    const entry: HistoryEntry = { url: generatedUrl, label, ts: Date.now() };
    const updated = [entry, ...history.filter((h) => h.url !== generatedUrl)].slice(0, MAX_HISTORY);
    saveHistory(updated);
  }, [generatedUrl, source, medium, campaign, history, saveHistory]);

  /* Copy from history */
  const handleCopyHistory = useCallback(async (idx: number) => {
    await navigator.clipboard.writeText(history[idx].url);
    setCopiedHistoryIdx(idx);
    setTimeout(() => setCopiedHistoryIdx(null), 2000);
  }, [history]);

  /* Clear history */
  const handleClearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  /* Shared input classes */
  const inputClass =
    'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30';
  const inputErrorClass =
    'w-full rounded-lg border border-red-500/50 bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          UTM Link Builder
        </h1>
        <p className="mt-3 text-muted-foreground">
          Generate campaign-tagged URLs in seconds. Fill in your parameters, copy the link, and track every click in Google Analytics.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        {/* Website URL — full width */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground">
            Website URL <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => { setWebsiteUrl(e.target.value); setTouched(true); }}
            placeholder="https://example.com/landing-page"
            className={touched && (!websiteUrl || !urlValid) ? inputErrorClass : inputClass + ' mt-1.5'}
          />
          {touched && websiteUrl && !urlValid && (
            <p className="mt-1 text-xs text-red-400">Enter a valid URL (e.g. https://example.com)</p>
          )}
        </div>

        {/* Two-column grid for UTM params */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Source */}
          <div>
            <label className="text-sm font-medium text-foreground">
              utm_source <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => { setSource(e.target.value); setTouched(true); }}
              placeholder="e.g. google, facebook, newsletter"
              className={(touched && !source ? inputErrorClass : inputClass) + ' mt-1.5'}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SOURCE_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSource(s); setTouched(true); }}
                  className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground hover:border-[#5B8AEF]/40 hover:text-foreground cursor-pointer transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Medium */}
          <div>
            <label className="text-sm font-medium text-foreground">
              utm_medium <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => { setMedium(e.target.value); setTouched(true); }}
              placeholder="e.g. cpc, email, social"
              className={(touched && !medium ? inputErrorClass : inputClass) + ' mt-1.5'}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MEDIUM_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMedium(m); setTouched(true); }}
                  className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground hover:border-[#5B8AEF]/40 hover:text-foreground cursor-pointer transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign */}
          <div>
            <label className="text-sm font-medium text-foreground">
              utm_campaign <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => { setCampaign(e.target.value); setTouched(true); }}
              placeholder="e.g. spring-sale, product-launch"
              className={(touched && !campaign ? inputErrorClass : inputClass) + ' mt-1.5'}
            />
          </div>

          {/* Term (optional) */}
          <div>
            <label className="text-sm font-medium text-foreground">
              utm_term <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. running+shoes, seo+tools"
              className={inputClass + ' mt-1.5'}
            />
          </div>

          {/* Content (optional) */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground">
              utm_content <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. hero-banner, sidebar-cta"
              className={inputClass + ' mt-1.5'}
            />
          </div>
        </div>

        {/* Validation hint */}
        {requiredMissing && (
          <p className="mt-4 text-xs text-red-400">
            Fill in all required fields (URL, source, medium, campaign) to generate a link.
          </p>
        )}
      </div>

      {/* Generated URL */}
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <label className="text-sm font-medium text-foreground">Generated URL</label>
        <div className="mt-2 flex items-stretch gap-3">
          <div className="flex-1 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/30 px-4 py-3 font-mono text-sm text-foreground">
            {canGenerate ? (
              <span className="break-all">{generatedUrl}</span>
            ) : (
              <span className="text-muted-foreground">Fill in the fields above to generate your URL...</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            disabled={!canGenerate}
            className="shrink-0 rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-all hover:bg-[#4a79de] hover:shadow-[0_0_28px_rgba(91,138,239,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Recent URLs
            </h2>
            <button
              onClick={handleClearHistory}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear history
            </button>
          </div>
          <ul className="space-y-2">
            {history.map((entry, idx) => (
              <li
                key={entry.ts}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{entry.label}</p>
                  <p className="truncate font-mono text-sm text-foreground">{entry.url}</p>
                </div>
                <button
                  onClick={() => handleCopyHistory(idx)}
                  className="shrink-0 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08]"
                >
                  {copiedHistoryIdx === idx ? 'Copied!' : 'Copy'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* How it works */}
      <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="mb-3 text-lg font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How it works
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">utm_source</span> — identifies which site or platform sent the traffic (e.g. google, facebook, newsletter). Required by Google Analytics.
          </li>
          <li>
            <span className="text-foreground font-medium">utm_medium</span> — the marketing channel or type of link (e.g. cpc, email, social, banner). Helps you compare channel performance.
          </li>
          <li>
            <span className="text-foreground font-medium">utm_campaign</span> — the specific campaign name, promotion, or strategic keyword (e.g. spring-sale, product-launch). Groups all links from the same campaign.
          </li>
          <li>
            <span className="text-foreground font-medium">utm_term</span> — optional. Used mainly for paid search to identify the keyword you bid on. Useful for tracking individual ad group keywords.
          </li>
          <li>
            <span className="text-foreground font-medium">utm_content</span> — optional. Differentiates similar content or links within the same campaign (e.g. hero-banner vs. sidebar-cta). Great for A/B testing.
          </li>
          <li>
            <span className="text-foreground font-medium">How to use</span> — paste the generated URL into your marketing campaigns. When someone clicks the link, Google Analytics automatically captures each UTM parameter so you can see exactly which sources, mediums, and campaigns drive traffic and conversions.
          </li>
        </ul>
      </div>
    </div>
  );
}
