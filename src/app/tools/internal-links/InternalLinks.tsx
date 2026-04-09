'use client';

import { useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Stop words — filtered when phrases contain ONLY these             */
/* ------------------------------------------------------------------ */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'was', 'were',
  'are', 'been', 'has', 'have', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me',
  'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our',
  'their', 'what', 'which', 'who', 'when', 'where', 'how', 'not',
  'no', 'nor', 'if', 'then', 'than', 'too', 'very', 'just', 'about',
  'up', 'out', 'so', 'also', 'each', 'only', 'into', 'over', 'after',
  'before', 'between', 'under', 'again', 'there', 'here', 'all', 'any',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'own',
]);

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface LinkOpportunity {
  phrase: string;
  context: string;
  phraseStart: number;
  score: number;
  frequency: number;
}

/* ------------------------------------------------------------------ */
/*  Core algorithm                                                    */
/* ------------------------------------------------------------------ */
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(Boolean);
}

function extractNgrams(text: string, n: number): Map<string, number> {
  const tokens = tokenize(text);
  const ngrams = new Map<string, number>();
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(' ');
    // Skip if every word is a stop word
    const words = gram.split(' ');
    if (words.every(w => STOP_WORDS.has(w))) continue;
    // Skip very short phrases (under 5 chars)
    if (gram.length < 5) continue;
    ngrams.set(gram, (ngrams.get(gram) || 0) + 1);
  }
  return ngrams;
}

function getContext(text: string, phrase: string): { context: string; phraseStart: number } {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(phrase.toLowerCase());
  if (idx === -1) return { context: '', phraseStart: 0 };

  // Get surrounding words — roughly 10 words each side
  const before = text.substring(Math.max(0, idx - 80), idx);
  const match = text.substring(idx, idx + phrase.length);
  const after = text.substring(idx + phrase.length, Math.min(text.length, idx + phrase.length + 80));

  // Trim to word boundaries
  const beforeTrimmed = before.includes(' ') ? '...' + before.substring(before.indexOf(' ') + 1) : before;
  const afterTrimmed = after.includes(' ') ? after.substring(0, after.lastIndexOf(' ')) + '...' : after;

  const context = beforeTrimmed + match + afterTrimmed;
  const phraseStart = beforeTrimmed.length;

  return { context, phraseStart };
}

function findOpportunities(sourceText: string, targetText: string): LinkOpportunity[] {
  const results: LinkOpportunity[] = [];
  const seen = new Set<string>();

  // Extract n-grams from target (these are potential anchor texts)
  for (const n of [4, 3, 2]) {
    const targetNgrams = extractNgrams(targetText, n);

    for (const [phrase, freq] of targetNgrams) {
      // Check if phrase exists in source text
      if (sourceText.toLowerCase().includes(phrase)) {
        // Skip if a longer phrase already covers this
        const dominated = Array.from(seen).some(s => s.includes(phrase));
        if (dominated) continue;

        const { context, phraseStart } = getContext(sourceText, phrase);
        if (!context) continue;

        // Score: phrase length weight + frequency bonus
        const score = n * 25 + Math.min(freq, 5) * 5;

        results.push({ phrase, context, phraseStart, score, frequency: freq });
        seen.add(phrase);
      }
    }
  }

  // Sort by score descending, limit to top 20
  return results.sort((a, b) => b.score - a.score).slice(0, 20);
}

/* ------------------------------------------------------------------ */
/*  Confidence badge                                                  */
/* ------------------------------------------------------------------ */
function ConfidenceBadge({ score }: { score: number }) {
  let label: string;
  let classes: string;

  if (score >= 80) {
    label = 'High';
    classes = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (score >= 50) {
    label = 'Medium';
    classes = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else {
    label = 'Low';
    classes = 'bg-white/10 text-white/50 border-white/20';
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Opportunity card                                                  */
/* ------------------------------------------------------------------ */
function OpportunityCard({ opp }: { opp: LinkOpportunity }) {
  const before = opp.context.substring(0, opp.phraseStart);
  const match = opp.context.substring(opp.phraseStart, opp.phraseStart + opp.phrase.length);
  const after = opp.context.substring(opp.phraseStart + opp.phrase.length);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <code className="text-sm font-semibold text-[#5B8AEF]">&quot;{opp.phrase}&quot;</code>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{opp.frequency}x in target</span>
          <ConfidenceBadge score={opp.score} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {before}
        <span className="bg-[#5B8AEF]/20 text-[#5B8AEF] px-1 rounded">{match}</span>
        {after}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Direction section                                                 */
/* ------------------------------------------------------------------ */
function DirectionSection({
  fromLabel,
  toLabel,
  fromUrl,
  toUrl,
  opportunities,
}: {
  fromLabel: string;
  toLabel: string;
  fromUrl: string;
  toUrl: string;
  opportunities: LinkOpportunity[];
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-lg font-semibold text-foreground">
          Link from {fromLabel} <span className="text-[#5B8AEF]">&rarr;</span> {toLabel}
        </h3>
      </div>
      {fromUrl && toUrl && (
        <p className="text-xs text-muted-foreground mb-4 break-all">
          Add links in <span className="text-foreground">{fromUrl}</span> pointing to{' '}
          <span className="text-[#5B8AEF]">{toUrl}</span>
        </p>
      )}
      {opportunities.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No linking opportunities found in this direction.</p>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp, i) => (
            <OpportunityCard key={i} opp={opp} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export default function InternalLinks() {
  const [contentA, setContentA] = useState('');
  const [urlA, setUrlA] = useState('');
  const [contentB, setContentB] = useState('');
  const [urlB, setUrlB] = useState('');
  const [hasRun, setHasRun] = useState(false);

  const { aToBOpps, bToAOpps } = useMemo(() => {
    if (!hasRun || !contentA.trim() || !contentB.trim()) {
      return { aToBOpps: [], bToAOpps: [] };
    }
    // Phrases from B found in A's text → link from A to B
    const aToBOpps = findOpportunities(contentA, contentB);
    // Phrases from A found in B's text → link from B to A
    const bToAOpps = findOpportunities(contentB, contentA);
    return { aToBOpps, bToAOpps };
  }, [hasRun, contentA, contentB]);

  const totalOpps = aToBOpps.length + bToAOpps.length;

  const inputClasses =
    'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Internal Link Opportunity Finder
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">
          Paste the content of two pages below and discover natural anchor text overlaps for internal linking in both
          directions.
        </p>
      </div>

      {/* Input panels */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Page A */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Page A</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Page URL</label>
              <input
                type="url"
                value={urlA}
                onChange={(e) => setUrlA(e.target.value)}
                placeholder="https://example.com/page-a/"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
              <textarea
                value={contentA}
                onChange={(e) => setContentA(e.target.value)}
                placeholder="Paste the full text content of Page A..."
                rows={10}
                className={inputClasses + ' resize-y'}
              />
            </div>
          </div>
        </div>

        {/* Page B */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Page B</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Page URL</label>
              <input
                type="url"
                value={urlB}
                onChange={(e) => setUrlB(e.target.value)}
                placeholder="https://example.com/page-b/"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
              <textarea
                value={contentB}
                onChange={(e) => setContentB(e.target.value)}
                placeholder="Paste the full text content of Page B..."
                rows={10}
                className={inputClasses + ' resize-y'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => setHasRun(true)}
          disabled={!contentA.trim() || !contentB.trim()}
          className="rounded-lg bg-[#5B8AEF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Find Opportunities
        </button>
      </div>

      {/* Results */}
      {hasRun && contentA.trim() && contentB.trim() && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Summary</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#5B8AEF]">{totalOpps}</p>
                <p className="text-sm text-muted-foreground mt-1">Total opportunities</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{aToBOpps.length}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Page A <span className="text-[#5B8AEF]">&rarr;</span> Page B
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{bToAOpps.length}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Page B <span className="text-[#5B8AEF]">&rarr;</span> Page A
                </p>
              </div>
            </div>
          </div>

          {/* A → B */}
          <DirectionSection
            fromLabel="Page A"
            toLabel="Page B"
            fromUrl={urlA}
            toUrl={urlB}
            opportunities={aToBOpps}
          />

          {/* B → A */}
          <DirectionSection
            fromLabel="Page B"
            toLabel="Page A"
            fromUrl={urlB}
            toUrl={urlA}
            opportunities={bToAOpps}
          />
        </div>
      )}

      {/* How it works */}
      <div className="mt-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="text-xl font-bold text-foreground mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How It Works
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Internal links pass authority between pages on your site and help search engines understand your content
            hierarchy. This tool finds natural anchor text opportunities by comparing the content of two pages.
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-1">1. Phrase extraction</h3>
              <p>
                The tool extracts all 2-word, 3-word, and 4-word phrases from each page, filtering out stop-word-only
                combinations that would make poor anchor text.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">2. Cross-matching</h3>
              <p>
                It then checks whether phrases from Page B appear naturally in Page A&apos;s text (and vice versa). If a phrase
                from your target page already appears in your source page, that&apos;s a natural anchor text opportunity
                &mdash; no rewriting needed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">3. Scoring</h3>
              <p>
                Longer phrases score higher because they provide more topical context to search engines. Phrases that
                appear multiple times in the target page also score higher, as they&apos;re likely core terms for that page.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <h3 className="font-semibold text-foreground mb-2">Best practices for internal linking</h3>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Use descriptive, keyword-rich anchor text rather than &quot;click here&quot; or &quot;read more&quot;</li>
              <li>Link from high-authority pages to pages you want to rank higher</li>
              <li>Keep internal links contextually relevant &mdash; only link when it helps the reader</li>
              <li>Avoid over-optimising: vary your anchor text naturally across pages</li>
              <li>Aim for 3&ndash;5 internal links per 1,000 words of content</li>
              <li>Prioritise linking to pages that are close to ranking (positions 5&ndash;15 in Google)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
