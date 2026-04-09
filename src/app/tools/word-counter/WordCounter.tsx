"use client";

import { useState, useMemo, useCallback, useRef } from "react";

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","is","it","as","was","are","be","this","that","which","not","have",
  "has","had","do","does","did","will","would","could","should","can","may",
  "might","shall","been","being","its","i","you","he","she","we","they","me",
  "him","her","us","them","my","your","his","our","their","am","if","so",
  "no","up","out","just","about","into","over","after","also","than","then",
  "very","all","any","each","how","when","where","what","who","more","some",
]);

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  if (mins === 0) return `${secs} sec`;
  return `${mins} min ${secs} sec`;
}

interface Stats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
  avgWordLength: string;
  avgSentenceLength: string;
  topKeywords: { word: string; count: number }[];
}

function computeStats(text: string): Stats {
  if (!text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: "0 sec",
      speakingTime: "0 sec",
      avgWordLength: "0",
      avgSentenceLength: "0",
      topKeywords: [],
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const wordMatches = text.match(/\b[a-zA-Z0-9''-]+\b/g) || [];
  const words = wordMatches.length;

  const sentenceMatches = text.match(/[.!?]+(?:\s|$)/g) || [];
  const sentences = sentenceMatches.length || (words > 0 ? 1 : 0);

  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length || (words > 0 ? 1 : 0);

  const readingTime = formatTime((words / 200) * 60);
  const speakingTime = formatTime((words / 130) * 60);

  const totalCharLen = wordMatches.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = words > 0 ? (totalCharLen / words).toFixed(1) : "0";
  const avgSentenceLength =
    sentences > 0 ? (words / sentences).toFixed(1) : "0";

  // Top keywords
  const freq: Record<string, number> = {};
  for (const w of wordMatches) {
    const lower = w.toLowerCase();
    if (lower.length < 2 || STOP_WORDS.has(lower)) continue;
    freq[lower] = (freq[lower] || 0) + 1;
  }
  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime,
    speakingTime,
    avgWordLength,
    avgSentenceLength,
    topKeywords,
  };
}

const SEO_RANGES = [
  { label: "Blog Post", min: 1500, max: 2500, unit: "words" as const },
  { label: "Product Page", min: 300, max: 500, unit: "words" as const },
  { label: "Landing Page", min: 500, max: 1000, unit: "words" as const },
  { label: "Meta Description", min: 150, max: 160, unit: "chars" as const },
  { label: "Title Tag", min: 50, max: 60, unit: "chars" as const },
];

export default function WordCounter() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => computeStats(text), [text]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      // Auto-expand
      const el = e.target;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    },
    []
  );

  const handleClear = useCallback(() => {
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }, [text]);

  function seoIndicator(
    current: number,
    min: number,
    max: number
  ): { pct: number; color: string; label: string } {
    if (current === 0) return { pct: 0, color: "bg-white/10", label: "---" };
    if (current < min) {
      const pct = Math.min((current / min) * 100, 100);
      return { pct, color: "bg-yellow-500", label: `${current} (under)` };
    }
    if (current <= max) {
      return { pct: 100, color: "bg-green-500", label: `${current} (ideal)` };
    }
    return { pct: 100, color: "bg-red-500", label: `${current} (over)` };
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <h1
        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Word Counter
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Count words, characters, sentences, and paragraphs instantly. See
        reading time, keyword density, and SEO content length guidance.
      </p>

      {/* Stat Cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {[
          { value: stats.words.toLocaleString(), label: "Words" },
          {
            value: stats.characters.toLocaleString(),
            label: "Characters",
            sub: `${stats.charactersNoSpaces.toLocaleString()} without spaces`,
          },
          { value: stats.sentences.toLocaleString(), label: "Sentences" },
          { value: stats.paragraphs.toLocaleString(), label: "Paragraphs" },
          { value: stats.readingTime, label: "Reading Time" },
          { value: stats.speakingTime, label: "Speaking Time" },
          { value: stats.avgWordLength, label: "Avg Word Length" },
          { value: stats.avgSentenceLength, label: "Avg Sentence Length" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
          >
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
            {"sub" in stat && stat.sub && (
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {stat.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Buttons + Textarea */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleClear}
          className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.08] transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleCopy}
          className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] hover:bg-[#4A79DE] transition-colors"
        >
          Copy Text
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        rows={12}
        placeholder="Paste or type your text here..."
        className="mt-4 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 resize-none"
      />

      {/* Bottom row: SEO Guide + Top Keywords */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* SEO Content Length Guide */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            SEO Content Length Guide
          </h2>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Recommended word/character counts for different content types
          </p>
          <div className="space-y-4">
            {SEO_RANGES.map((range) => {
              const current =
                range.unit === "words" ? stats.words : stats.characters;
              const { pct, color, label } = seoIndicator(
                current,
                range.min,
                range.max
              );
              return (
                <div key={range.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">
                      {range.label}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {range.min.toLocaleString()}&ndash;
                      {range.max.toLocaleString()} {range.unit} &middot;{" "}
                      {label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Keywords */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Top Keywords
          </h2>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Most frequent words (excluding common stop words)
          </p>
          {stats.topKeywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Start typing to see keyword frequency...
            </p>
          ) : (
            <div className="space-y-3">
              {stats.topKeywords.map((kw, i) => {
                const maxCount = stats.topKeywords[0].count;
                const barPct = (kw.count / maxCount) * 100;
                return (
                  <div key={kw.word}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">
                        {i + 1}. {kw.word}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {kw.count}x
                        {stats.words > 0 &&
                          ` (${((kw.count / stats.words) * 100).toFixed(1)}%)`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#5B8AEF] transition-all duration-300"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
