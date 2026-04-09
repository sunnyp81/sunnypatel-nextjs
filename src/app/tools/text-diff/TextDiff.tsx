'use client';

import { useState, useMemo, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  LCS-based line diff algorithm                                      */
/* ------------------------------------------------------------------ */

function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

type DiffLineType = 'added' | 'removed' | 'unchanged';

interface DiffLine {
  type: DiffLineType;
  text: string;
  oldLineNo?: number;
  newLineNo?: number;
}

function computeDiff(originalText: string, modifiedText: string): DiffLine[] {
  const a = originalText.split('\n');
  const b = modifiedText.split('\n');
  const dp = lcsTable(a, b);

  const result: DiffLine[] = [];
  let i = a.length;
  let j = b.length;

  const stack: DiffLine[] = [];

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      stack.push({ type: 'unchanged', text: a[i - 1], oldLineNo: i, newLineNo: j });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      stack.push({ type: 'removed', text: a[i - 1], oldLineNo: i });
      i--;
    } else {
      stack.push({ type: 'added', text: b[j - 1], newLineNo: j });
      j--;
    }
  }

  while (i > 0) {
    stack.push({ type: 'removed', text: a[i - 1], oldLineNo: i });
    i--;
  }
  while (j > 0) {
    stack.push({ type: 'added', text: b[j - 1], newLineNo: j });
    j--;
  }

  stack.reverse();
  result.push(...stack);
  return result;
}

/* ------------------------------------------------------------------ */
/*  Word-level diff for modified lines                                 */
/* ------------------------------------------------------------------ */

interface WordSpan {
  text: string;
  type: 'same' | 'added' | 'removed';
}

function wordDiff(oldLine: string, newLine: string): { oldSpans: WordSpan[]; newSpans: WordSpan[] } {
  const oldWords = oldLine.split(/(\s+)/);
  const newWords = newLine.split(/(\s+)/);

  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const oldSpans: WordSpan[] = [];
  const newSpans: WordSpan[] = [];
  let i = m;
  let j = n;
  const oldStack: WordSpan[] = [];
  const newStack: WordSpan[] = [];

  while (i > 0 && j > 0) {
    if (oldWords[i - 1] === newWords[j - 1]) {
      oldStack.push({ text: oldWords[i - 1], type: 'same' });
      newStack.push({ text: newWords[j - 1], type: 'same' });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      oldStack.push({ text: oldWords[i - 1], type: 'removed' });
      i--;
    } else {
      newStack.push({ text: newWords[j - 1], type: 'added' });
      j--;
    }
  }

  while (i > 0) {
    oldStack.push({ text: oldWords[i - 1], type: 'removed' });
    i--;
  }
  while (j > 0) {
    newStack.push({ text: newWords[j - 1], type: 'added' });
    j--;
  }

  oldStack.reverse();
  newStack.reverse();
  oldSpans.push(...oldStack);
  newSpans.push(...newStack);

  return { oldSpans, newSpans };
}

/* ------------------------------------------------------------------ */
/*  Pair removed+added lines that are "similar" for word-level diff    */
/* ------------------------------------------------------------------ */

function similarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  const aWords = new Set(a.toLowerCase().split(/\s+/));
  const bWords = new Set(b.toLowerCase().split(/\s+/));
  let common = 0;
  for (const w of aWords) {
    if (bWords.has(w)) common++;
  }
  return common / Math.max(aWords.size, bWords.size);
}

interface PairedDiff {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  oldText?: string;
  newText?: string;
  oldLineNo?: number;
  newLineNo?: number;
  oldSpans?: WordSpan[];
  newSpans?: WordSpan[];
}

function pairDiffLines(diff: DiffLine[]): PairedDiff[] {
  const result: PairedDiff[] = [];
  let i = 0;

  while (i < diff.length) {
    if (diff[i].type === 'unchanged') {
      result.push({
        type: 'unchanged',
        oldText: diff[i].text,
        newText: diff[i].text,
        oldLineNo: diff[i].oldLineNo,
        newLineNo: diff[i].newLineNo,
      });
      i++;
    } else {
      // Collect consecutive removed and added
      const removed: DiffLine[] = [];
      const added: DiffLine[] = [];
      while (i < diff.length && diff[i].type === 'removed') {
        removed.push(diff[i]);
        i++;
      }
      while (i < diff.length && diff[i].type === 'added') {
        added.push(diff[i]);
        i++;
      }

      // Pair them up
      const pairs = Math.min(removed.length, added.length);
      for (let p = 0; p < pairs; p++) {
        const sim = similarity(removed[p].text, added[p].text);
        if (sim > 0.3) {
          const { oldSpans, newSpans } = wordDiff(removed[p].text, added[p].text);
          result.push({
            type: 'modified',
            oldText: removed[p].text,
            newText: added[p].text,
            oldLineNo: removed[p].oldLineNo,
            newLineNo: added[p].newLineNo,
            oldSpans,
            newSpans,
          });
        } else {
          result.push({
            type: 'removed',
            oldText: removed[p].text,
            oldLineNo: removed[p].oldLineNo,
          });
          result.push({
            type: 'added',
            newText: added[p].text,
            newLineNo: added[p].newLineNo,
          });
        }
      }

      // Remaining unmatched
      for (let p = pairs; p < removed.length; p++) {
        result.push({
          type: 'removed',
          oldText: removed[p].text,
          oldLineNo: removed[p].oldLineNo,
        });
      }
      for (let p = pairs; p < added.length; p++) {
        result.push({
          type: 'added',
          newText: added[p].text,
          newLineNo: added[p].newLineNo,
        });
      }
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Render helpers                                                     */
/* ------------------------------------------------------------------ */

function renderWordSpans(spans: WordSpan[], highlightType: 'added' | 'removed') {
  return spans.map((span, idx) => {
    if (span.type === 'same') {
      return <span key={idx}>{span.text}</span>;
    }
    if (span.type === highlightType) {
      const cls =
        highlightType === 'added'
          ? 'bg-emerald-500/25 rounded px-0.5'
          : 'bg-red-500/25 rounded px-0.5 line-through';
      return (
        <span key={idx} className={cls}>
          {span.text}
        </span>
      );
    }
    return null;
  });
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function TextDiff() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [view, setView] = useState<'unified' | 'side-by-side'>('unified');

  const diff = useMemo(() => {
    if (!original && !modified) return [];
    return computeDiff(original, modified);
  }, [original, modified]);

  const paired = useMemo(() => pairDiffLines(diff), [diff]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    for (const d of diff) {
      if (d.type === 'added') added++;
      else if (d.type === 'removed') removed++;
      else unchanged++;
    }
    const origLines = original ? original.split('\n').length : 0;
    const modLines = modified ? modified.split('\n').length : 0;
    const maxLines = Math.max(origLines, modLines);
    const similarityPct = maxLines === 0 ? 100 : Math.round((unchanged / maxLines) * 100);
    return { added, removed, unchanged, similarityPct };
  }, [diff, original, modified]);

  const handleSwap = useCallback(() => {
    setOriginal(modified);
    setModified(original);
  }, [original, modified]);

  const handleClear = useCallback(() => {
    setOriginal('');
    setModified('');
  }, []);

  const hasContent = original.length > 0 || modified.length > 0;
  const hasDiff = diff.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Text Diff Checker
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Compare two pieces of text and see exactly what changed. Additions, deletions, and modifications highlighted instantly.
        </p>
      </div>

      {/* Input textareas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Original</label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste the original text here..."
            rows={12}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono resize-y"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Modified</label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste the modified text here..."
            rows={12}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono resize-y"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSwap}
          disabled={!hasContent}
          className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Swap Texts
        </button>
        <button
          onClick={handleClear}
          disabled={!hasContent}
          className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>

        {hasDiff && (
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-white/[0.08] p-0.5">
            <button
              onClick={() => setView('unified')}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                view === 'unified'
                  ? 'bg-[#5B8AEF]/15 text-[#5B8AEF] border border-[#5B8AEF]/30'
                  : 'border border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setView('side-by-side')}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                view === 'side-by-side'
                  ? 'bg-[#5B8AEF]/15 text-[#5B8AEF] border border-[#5B8AEF]/30'
                  : 'border border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Side by Side
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {hasDiff && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.added}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Lines Added</div>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.removed}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Lines Removed</div>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.unchanged}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Lines Unchanged</div>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center">
            <div className="text-2xl font-bold text-[#5B8AEF]">{stats.similarityPct}%</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Similarity</div>
          </div>
        </div>
      )}

      {/* Diff output */}
      {hasDiff && view === 'unified' && (
        <div className="mt-6 rounded-lg border border-white/[0.08] bg-[#0d0d14] p-0 font-mono text-sm overflow-auto max-h-[600px]">
          {paired.map((line, idx) => {
            if (line.type === 'unchanged') {
              return (
                <div key={idx} className="flex border-l-2 border-transparent">
                  <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                    {line.oldLineNo}
                  </span>
                  <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                    {line.newLineNo}
                  </span>
                  <span className="flex-1 px-2 py-0.5 text-foreground/80 whitespace-pre-wrap break-all">
                    {line.oldText}
                  </span>
                </div>
              );
            }

            if (line.type === 'removed') {
              return (
                <div key={idx} className="flex bg-red-500/10 border-l-2 border-red-500">
                  <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                    {line.oldLineNo}
                  </span>
                  <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5" />
                  <span className="flex-1 px-2 py-0.5 text-red-300 whitespace-pre-wrap break-all">
                    - {line.oldText}
                  </span>
                </div>
              );
            }

            if (line.type === 'added') {
              return (
                <div key={idx} className="flex bg-emerald-500/10 border-l-2 border-emerald-500">
                  <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5" />
                  <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                    {line.newLineNo}
                  </span>
                  <span className="flex-1 px-2 py-0.5 text-emerald-300 whitespace-pre-wrap break-all">
                    + {line.newText}
                  </span>
                </div>
              );
            }

            if (line.type === 'modified') {
              return (
                <div key={idx}>
                  <div className="flex bg-red-500/10 border-l-2 border-red-500">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.oldLineNo}
                    </span>
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5" />
                    <span className="flex-1 px-2 py-0.5 text-red-300 whitespace-pre-wrap break-all">
                      - {line.oldSpans && renderWordSpans(line.oldSpans, 'removed')}
                    </span>
                  </div>
                  <div className="flex bg-emerald-500/10 border-l-2 border-emerald-500">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5" />
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.newLineNo}
                    </span>
                    <span className="flex-1 px-2 py-0.5 text-emerald-300 whitespace-pre-wrap break-all">
                      + {line.newSpans && renderWordSpans(line.newSpans, 'added')}
                    </span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {hasDiff && view === 'side-by-side' && (
        <div className="mt-6 grid grid-cols-2 gap-0 rounded-lg border border-white/[0.08] bg-[#0d0d14] font-mono text-sm overflow-auto max-h-[600px]">
          {/* Left: Original */}
          <div className="border-r border-white/[0.08] overflow-auto">
            {paired.map((line, idx) => {
              if (line.type === 'unchanged') {
                return (
                  <div key={idx} className="flex border-l-2 border-transparent">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.oldLineNo}
                    </span>
                    <span className="flex-1 px-2 py-0.5 text-foreground/80 whitespace-pre-wrap break-all">
                      {line.oldText}
                    </span>
                  </div>
                );
              }
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="flex bg-red-500/10 border-l-2 border-red-500">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.oldLineNo}
                    </span>
                    <span className="flex-1 px-2 py-0.5 text-red-300 whitespace-pre-wrap break-all">
                      {line.oldText}
                    </span>
                  </div>
                );
              }
              if (line.type === 'added') {
                return (
                  <div key={idx} className="flex border-l-2 border-transparent">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5" />
                    <span className="flex-1 px-2 py-0.5 whitespace-pre-wrap break-all">&nbsp;</span>
                  </div>
                );
              }
              if (line.type === 'modified') {
                return (
                  <div key={idx} className="flex bg-red-500/10 border-l-2 border-red-500">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.oldLineNo}
                    </span>
                    <span className="flex-1 px-2 py-0.5 text-red-300 whitespace-pre-wrap break-all">
                      {line.oldSpans && renderWordSpans(line.oldSpans, 'removed')}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Right: Modified */}
          <div className="overflow-auto">
            {paired.map((line, idx) => {
              if (line.type === 'unchanged') {
                return (
                  <div key={idx} className="flex border-l-2 border-transparent">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.newLineNo}
                    </span>
                    <span className="flex-1 px-2 py-0.5 text-foreground/80 whitespace-pre-wrap break-all">
                      {line.newText}
                    </span>
                  </div>
                );
              }
              if (line.type === 'added') {
                return (
                  <div key={idx} className="flex bg-emerald-500/10 border-l-2 border-emerald-500">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.newLineNo}
                    </span>
                    <span className="flex-1 px-2 py-0.5 text-emerald-300 whitespace-pre-wrap break-all">
                      {line.newText}
                    </span>
                  </div>
                );
              }
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="flex border-l-2 border-transparent">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5" />
                    <span className="flex-1 px-2 py-0.5 whitespace-pre-wrap break-all">&nbsp;</span>
                  </div>
                );
              }
              if (line.type === 'modified') {
                return (
                  <div key={idx} className="flex bg-emerald-500/10 border-l-2 border-emerald-500">
                    <span className="text-muted-foreground/50 text-right pr-3 select-none w-10 inline-block shrink-0 py-0.5">
                      {line.newLineNo}
                    </span>
                    <span className="flex-1 px-2 py-0.5 text-emerald-300 whitespace-pre-wrap break-all">
                      {line.newSpans && renderWordSpans(line.newSpans, 'added')}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasDiff && hasContent && (
        <div className="mt-6 rounded-lg border border-white/[0.08] bg-[#0d0d14] p-8 text-center">
          <p className="text-muted-foreground">Both texts are identical. No differences found.</p>
        </div>
      )}

      {/* How it works */}
      <div className="mt-12">
        <h2
          className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How to use the Text Diff Checker
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              title: 'Compare SEO edits',
              desc: 'Paste your original and updated content to see exactly what changed in title tags, meta descriptions, and body copy.',
            },
            {
              title: 'Review content updates',
              desc: 'Check that content refreshes haven\'t introduced errors or accidentally removed important sections.',
            },
            {
              title: 'Track competitor changes',
              desc: 'Compare different versions of competitor pages to understand their content strategy over time.',
            },
            {
              title: 'Audit code changes',
              desc: 'Review schema markup, robots.txt, or htaccess changes before deploying to production.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
