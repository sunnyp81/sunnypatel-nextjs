'use client';

import { useState, useMemo, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Stop words                                                         */
/* ------------------------------------------------------------------ */
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','shall','should','may',
  'might','must','can','could','to','of','in','for','on','with','at','by',
  'from','as','into','through','during','before','after','above','below',
  'between','out','off','over','under','again','further','then','once','it',
  'its','it\'s','that','this','these','those','he','she','they','them','his',
  'her','their','we','you','your','our','my','me','him','us','i','am','not',
  'no','nor','so','very','just','than','too','also','if','about','up','each',
  'which','who','whom','what','when','where','why','how','all','both','each',
  'few','more','most','other','some','such','only','own','same','here','there',
  'while','because','until','although','though','even','still','already','yet',
]);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

type PhraseRow = { phrase: string; count: number; density: number };

function getNgrams(words: string[], n: number, filterStops: boolean): PhraseRow[] {
  const freq: Record<string, number> = {};
  const total = words.length;

  for (let i = 0; i <= words.length - n; i++) {
    const slice = words.slice(i, i + n);
    if (filterStops && n === 1 && STOP_WORDS.has(slice[0])) continue;
    const key = slice.join(' ');
    freq[key] = (freq[key] || 0) + 1;
  }

  return Object.entries(freq)
    .map(([phrase, count]) => ({
      phrase,
      count,
      density: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function readingTime(words: number): string {
  const mins = Math.ceil(words / 200);
  if (mins < 1) return '< 1 min';
  return `${mins} min`;
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */
type TabId = '1-word' | '2-word' | '3-word';

const TABS: { id: TabId; label: string }[] = [
  { id: '1-word', label: '1-Word' },
  { id: '2-word', label: '2-Word' },
  { id: '3-word', label: '3-Word' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function KeywordDensity() {
  const [content, setContent] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('1-word');
  const [stopFilter, setStopFilter] = useState(true);

  /* Derived data ---------------------------------------------------- */
  const words = useMemo(() => tokenise(content), [content]);
  const totalWords = words.length;
  const charCount = content.length;

  const uniqueWords = useMemo(() => new Set(words).size, [words]);
  const avgWordLen = useMemo(() => {
    if (words.length === 0) return 0;
    return words.reduce((sum, w) => sum + w.length, 0) / words.length;
  }, [words]);

  const unigrams = useMemo(() => getNgrams(words, 1, stopFilter), [words, stopFilter]);
  const bigrams = useMemo(() => getNgrams(words, 2, false), [words]);
  const trigrams = useMemo(() => getNgrams(words, 3, false), [words]);

  const activeData: PhraseRow[] =
    activeTab === '1-word' ? unigrams : activeTab === '2-word' ? bigrams : trigrams;

  /* Target keyword stats -------------------------------------------- */
  const targetStats = useMemo(() => {
    const kw = targetKeyword.trim().toLowerCase();
    if (!kw || totalWords === 0) return null;
    const kwWords = kw.split(/\s+/);
    const n = kwWords.length;
    let count = 0;
    for (let i = 0; i <= words.length - n; i++) {
      if (words.slice(i, i + n).join(' ') === kw) count++;
    }
    return { keyword: kw, count, density: (count / totalWords) * 100 };
  }, [targetKeyword, words, totalWords]);

  /* CSV export ------------------------------------------------------ */
  const handleExport = useCallback(() => {
    const sections = [
      { label: '1-Word Phrases', data: unigrams },
      { label: '2-Word Phrases', data: bigrams },
      { label: '3-Word Phrases', data: trigrams },
    ];
    let csv = 'Section,Phrase,Count,Density %\r\n';
    for (const section of sections) {
      for (const row of section.data) {
        csv += `"${section.label}","${row.phrase.replace(/"/g, '""')}",${row.count},${row.density.toFixed(2)}\r\n`;
      }
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword-density.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [unigrams, bigrams, trigrams]);

  /* Max count for bar widths ---------------------------------------- */
  const maxCount = activeData.length > 0 ? activeData[0].count : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Keyword Density Checker
        </h1>
        <p className="mt-3 text-muted-foreground">
          Paste your content below to analyse word frequency, n-gram density, and overall readability stats. Optionally enter a target keyword to see its density highlighted.
        </p>
      </div>

      {/* Input area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono"
              placeholder="Paste your article, page copy, or any text here..."
            />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>
                <span className="rounded-full bg-[#5B8AEF]/15 px-2 py-0.5 font-mono text-[#5B8AEF]">
                  {totalWords}
                </span>{' '}
                words
              </span>
              <span>
                <span className="rounded-full bg-[#5B8AEF]/15 px-2 py-0.5 font-mono text-[#5B8AEF]">
                  {charCount.toLocaleString()}
                </span>{' '}
                characters
              </span>
            </div>
          </div>

          {/* Target keyword */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Target Keyword <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
              placeholder="e.g. seo consultant"
            />
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Target keyword highlight */}
          {targetStats && (
            <div className="rounded-xl border border-[#5B8AEF]/30 bg-[#5B8AEF]/[0.06] p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Target Keyword
              </p>
              <p className="text-lg font-semibold text-foreground">&ldquo;{targetStats.keyword}&rdquo;</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Count</p>
                  <p className="text-2xl font-bold text-[#5B8AEF]">{targetStats.count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Density</p>
                  <p className="text-2xl font-bold text-[#5B8AEF]">{targetStats.density.toFixed(2)}%</p>
                </div>
              </div>
              {targetStats.density > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                    <div
                      className="h-1.5 rounded-full bg-[#5B8AEF]"
                      style={{ width: `${Math.min(targetStats.density * 10, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {targetStats.density < 0.5
                      ? 'Low density — consider adding more instances'
                      : targetStats.density <= 2.5
                      ? 'Good density range (0.5–2.5%)'
                      : 'High density — may appear over-optimised'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Summary stats */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Summary
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Words</p>
                <p className="text-xl font-bold text-foreground">{totalWords.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unique Words</p>
                <p className="text-xl font-bold text-foreground">{uniqueWords.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Word Length</p>
                <p className="text-xl font-bold text-foreground">{avgWordLen.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reading Time</p>
                <p className="text-xl font-bold text-foreground">{readingTime(totalWords)}</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={totalWords === 0}
            className="w-full rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-all hover:bg-[#4a79de] hover:shadow-[0_0_28px_rgba(91,138,239,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export Results CSV
          </button>
        </div>
      </div>

      {/* Phrase frequency section */}
      {totalWords > 0 && (
        <div className="mt-8">
          {/* Tabs + stop word toggle */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#5B8AEF]/15 text-[#5B8AEF] border-[#5B8AEF]/30'
                    : 'border-white/[0.08] text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {activeTab === '1-word' && (
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={stopFilter}
                  onChange={() => setStopFilter((v) => !v)}
                  className="h-3.5 w-3.5 rounded border-white/20 accent-[#5B8AEF]"
                />
                Exclude stop words
              </label>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 border-b border-white/[0.06] px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Phrase</div>
              <div className="col-span-2 text-right">Count</div>
              <div className="col-span-2 text-right">Density</div>
              <div className="col-span-3">Distribution</div>
            </div>

            {activeData.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No phrases found. Paste some content above.
              </div>
            ) : (
              activeData.map((row, idx) => (
                <div
                  key={row.phrase}
                  className="grid grid-cols-12 gap-2 items-center border-b border-white/[0.04] px-5 py-2.5 text-sm transition-colors hover:bg-white/[0.02]"
                >
                  <div className="col-span-1 text-muted-foreground font-mono text-xs">
                    {idx + 1}
                  </div>
                  <div className="col-span-4 font-medium text-foreground truncate">
                    {row.phrase}
                  </div>
                  <div className="col-span-2 text-right font-mono text-foreground">
                    {row.count}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="rounded-full bg-[#5B8AEF]/15 px-2 py-0.5 text-xs font-mono text-[#5B8AEF]">
                      {row.density.toFixed(2)}%
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                      <div
                        className="h-1.5 rounded-full bg-[#5B8AEF]"
                        style={{ width: `${(row.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="mb-3 text-lg font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How to use this tool
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">Paste your content</span> — drop in any article, page copy, or text you want to analyse.
          </li>
          <li>
            <span className="text-foreground font-medium">Target keyword</span> — optionally enter your focus keyword to see its count and density prominently displayed, with a recommendation on whether the density is within the ideal 0.5–2.5% range.
          </li>
          <li>
            <span className="text-foreground font-medium">1-word phrases</span> — shows the top 20 single words by frequency. Common stop words (the, a, is, etc.) are filtered by default — toggle this off to see all words.
          </li>
          <li>
            <span className="text-foreground font-medium">2-word &amp; 3-word phrases</span> — shows the top 20 bigrams and trigrams, useful for spotting over-used phrases or finding your content&apos;s natural keyword themes.
          </li>
          <li>
            <span className="text-foreground font-medium">Export CSV</span> — download all phrase data across all three tabs as a CSV file for further analysis in a spreadsheet.
          </li>
        </ul>
      </div>
    </div>
  );
}
