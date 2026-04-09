'use client';

import { useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Syllable counting                                                  */
/* ------------------------------------------------------------------ */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) return 1;

  // Remove silent-e at end
  let processed = w;
  if (processed.endsWith('e') && !processed.endsWith('le') && processed.length > 2) {
    processed = processed.slice(0, -1);
  }

  // Count vowel groups
  const vowelGroups = processed.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 1;

  return Math.max(1, count);
}

/* ------------------------------------------------------------------ */
/*  Text analysis engine                                               */
/* ------------------------------------------------------------------ */
interface AnalysisResult {
  words: number;
  sentences: number;
  paragraphs: number;
  syllables: number;
  complexWords: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  complexWordPct: number;
  readingTimeMin: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
}

function analyseText(text: string): AnalysisResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Split words
  const wordList = trimmed.match(/[a-zA-Z'-]+/g) || [];
  const words = wordList.length;
  if (words === 0) return null;

  // Count sentences (split on . ! ?)
  const sentenceList = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentences = Math.max(sentenceList.length, 1);

  // Count paragraphs
  const paragraphs = Math.max(
    trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length,
    1
  );

  // Syllable counts
  let totalSyllables = 0;
  let complexWords = 0;

  for (const word of wordList) {
    const syllCount = countSyllables(word);
    totalSyllables += syllCount;

    // Complex word: 3+ syllables, excluding common suffixes
    if (syllCount >= 3) {
      const lower = word.toLowerCase();
      // Don't count words that only reach 3 syllables because of -es, -ed, -ing
      const stripped = lower.replace(/(es|ed|ing)$/, '');
      const strippedSyll = countSyllables(stripped);
      if (strippedSyll >= 3 || stripped === lower) {
        complexWords++;
      }
    }
  }

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = totalSyllables / words;
  const complexWordPct = (complexWords / words) * 100;
  const readingTimeMin = words / 200;

  // Flesch Reading Ease: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
  const fleschReadingEase = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord)
  );

  // Flesch-Kincaid Grade Level: 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
  const fleschKincaidGrade = Math.max(
    0,
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  );

  // Gunning Fog Index: 0.4 * ((words/sentences) + 100*(complexWords/words))
  const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / words));

  return {
    words,
    sentences,
    paragraphs,
    syllables: totalSyllables,
    complexWords,
    avgWordsPerSentence,
    avgSyllablesPerWord,
    complexWordPct,
    readingTimeMin,
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
  };
}

/* ------------------------------------------------------------------ */
/*  Flesch Reading Ease label + colour                                 */
/* ------------------------------------------------------------------ */
function getFleschLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Very Easy', color: '#22c55e' };
  if (score >= 80) return { label: 'Easy', color: '#4ade80' };
  if (score >= 70) return { label: 'Fairly Easy', color: '#86efac' };
  if (score >= 60) return { label: 'Standard', color: '#facc15' };
  if (score >= 50) return { label: 'Fairly Difficult', color: '#f59e0b' };
  if (score >= 30) return { label: 'Difficult', color: '#ef4444' };
  return { label: 'Very Difficult', color: '#dc2626' };
}

function getGradeDescription(grade: number): string {
  const g = Math.round(grade);
  if (g <= 5) return `Grade ${g} \u2014 suitable for 10\u201311 year olds`;
  if (g <= 6) return `Grade ${g} \u2014 suitable for 11\u201312 year olds`;
  if (g <= 7) return `Grade ${g} \u2014 suitable for 12\u201313 year olds`;
  if (g <= 8) return `Grade ${g} \u2014 suitable for 13\u201314 year olds`;
  if (g <= 9) return `Grade ${g} \u2014 suitable for 14\u201315 year olds`;
  if (g <= 10) return `Grade ${g} \u2014 suitable for 15\u201316 year olds`;
  if (g <= 12) return `Grade ${g} \u2014 suitable for 16\u201318 year olds`;
  if (g <= 14) return `Grade ${g} \u2014 college level`;
  return `Grade ${g} \u2014 postgraduate level`;
}

function getGradeColor(grade: number): string {
  if (grade <= 6) return '#22c55e';
  if (grade <= 8) return '#4ade80';
  if (grade <= 10) return '#facc15';
  if (grade <= 12) return '#f59e0b';
  return '#ef4444';
}

function getFogColor(fog: number): string {
  if (fog <= 8) return '#22c55e';
  if (fog <= 10) return '#4ade80';
  if (fog <= 12) return '#facc15';
  if (fog <= 14) return '#f59e0b';
  return '#ef4444';
}

function getFogLabel(fog: number): string {
  if (fog <= 8) return 'Easy to read';
  if (fog <= 10) return 'Acceptable';
  if (fog <= 12) return 'Ideal for most audiences';
  if (fog <= 14) return 'Hard to read';
  return 'Very hard to read';
}

/* ------------------------------------------------------------------ */
/*  Recommendation generator                                           */
/* ------------------------------------------------------------------ */
function getRecommendation(result: AnalysisResult): string {
  const { fleschReadingEase, avgWordsPerSentence, complexWordPct } = result;

  if (fleschReadingEase >= 70) {
    return 'Your content is easy to read and accessible to a broad audience. Great job keeping things clear and concise.';
  }

  const tips: string[] = [];

  if (fleschReadingEase >= 50) {
    tips.push('Your content reads at a moderate difficulty level.');
  } else if (fleschReadingEase >= 30) {
    tips.push('Your content reads at a college level, which may be too complex for general audiences.');
  } else {
    tips.push('Your content is very difficult to read and may lose most readers.');
  }

  if (avgWordsPerSentence > 20) {
    tips.push('Try shortening your sentences \u2014 aim for 15\u201320 words on average.');
  }
  if (complexWordPct > 15) {
    tips.push('Replace multi-syllable words with simpler alternatives where possible.');
  }

  tips.push('For broader audiences, target a Flesch Reading Ease score of 60\u201370.');

  return tips.join(' ');
}

/* ------------------------------------------------------------------ */
/*  Circular gauge (SVG donut)                                         */
/* ------------------------------------------------------------------ */
function CircularGauge({
  value,
  max,
  color,
  label,
  size = 140,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold font-mono" style={{ color }}>
          {Math.round(value)}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score card component                                               */
/* ------------------------------------------------------------------ */
function ScoreCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3
        className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ReadabilityScore() {
  const [text, setText] = useState('');

  const result = useMemo(() => analyseText(text), [text]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Readability Score Calculator
        </h1>
        <p className="mt-3 text-muted-foreground">
          Paste your content below to analyse its readability with Flesch Reading Ease, Flesch-Kincaid Grade Level, and Gunning Fog Index scores.
        </p>
      </div>

      {/* Textarea */}
      <div className="mb-8 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Your Content</label>
          {result && (
            <span className="rounded-full bg-[#5B8AEF]/15 px-2 py-0.5 text-xs font-mono text-[#5B8AEF]">
              {result.words} words
            </span>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
          placeholder="Paste your article, blog post, or any text content here to analyse its readability..."
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setText('')}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
          <button
            onClick={() =>
              setText(
                'The quick brown fox jumps over the lazy dog. This is a simple sentence that most people can read easily. Readability matters because clear writing helps your audience understand your message. Short sentences and common words make content accessible to everyone. When you write for the web, aim for a reading level that matches your target audience.'
              )
            }
            className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)]"
          >
            Try Sample Text
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Score cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Flesch Reading Ease */}
            <ScoreCard title="Flesch Reading Ease">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <CircularGauge
                    value={result.fleschReadingEase}
                    max={100}
                    color={getFleschLabel(result.fleschReadingEase).color}
                    label={getFleschLabel(result.fleschReadingEase).label}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  0 (hardest) to 100 (easiest)
                </p>
              </div>
            </ScoreCard>

            {/* Flesch-Kincaid Grade Level */}
            <ScoreCard title="Flesch-Kincaid Grade">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <CircularGauge
                    value={result.fleschKincaidGrade}
                    max={20}
                    color={getGradeColor(result.fleschKincaidGrade)}
                    label="Grade"
                  />
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {getGradeDescription(result.fleschKincaidGrade)}
                </p>
              </div>
            </ScoreCard>

            {/* Gunning Fog Index */}
            <ScoreCard title="Gunning Fog Index">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <CircularGauge
                    value={result.gunningFog}
                    max={20}
                    color={getFogColor(result.gunningFog)}
                    label={getFogLabel(result.gunningFog)}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Years of education needed to understand
                </p>
              </div>
            </ScoreCard>
          </div>

          {/* Recommendation */}
          <div className="mb-6 rounded-xl border border-[#5B8AEF]/20 bg-[#5B8AEF]/5 p-5">
            <div className="mb-2 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.674 6.674 0 0 0 8 1.333Zm0 10.667a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334Zm.667-3.334a.667.667 0 0 1-1.334 0V5.333a.667.667 0 0 1 1.334 0v3.333Z"
                  fill="#5B8AEF"
                />
              </svg>
              <span className="text-sm font-semibold text-foreground">Recommendation</span>
            </div>
            <p className="text-sm text-muted-foreground">{getRecommendation(result)}</p>
          </div>

          {/* Stats panel */}
          <div className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Content Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Words</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">{result.words}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sentences</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">{result.sentences}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paragraphs</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">{result.paragraphs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Syllables</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">{result.syllables}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Words / Sentence</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">
                  {result.avgWordsPerSentence.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Syllables / Word</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">
                  {result.avgSyllablesPerWord.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Complex Words</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">
                  {result.complexWordPct.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reading Time</p>
                <p className="mt-0.5 text-lg font-bold font-mono text-foreground">
                  {result.readingTimeMin < 1
                    ? '< 1 min'
                    : `${Math.ceil(result.readingTimeMin)} min`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* How it works */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2
          className="mb-3 text-lg font-semibold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How it works
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground">Flesch Reading Ease (FRE)</h3>
            <p className="mt-1">
              Developed by Rudolf Flesch in 1948, this formula scores text on a 0&ndash;100 scale. Higher scores mean easier reading. The formula is:{' '}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs font-mono text-[#5B8AEF]">
                206.835 &minus; 1.015 &times; (words &divide; sentences) &minus; 84.6 &times; (syllables &divide; words)
              </code>
              . A score of 60&ndash;70 is considered standard &mdash; easily understood by 13&ndash;15 year old students. Most web content should aim for 60 or above.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Flesch-Kincaid Grade Level</h3>
            <p className="mt-1">
              Created by J. Peter Kincaid for the US Navy, this formula converts readability into a US grade level. The formula is:{' '}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs font-mono text-[#5B8AEF]">
                0.39 &times; (words &divide; sentences) + 11.8 &times; (syllables &divide; words) &minus; 15.59
              </code>
              . A result of 8.0 means the text is suitable for an eighth-grader (13&ndash;14 years old). For general web content, aim for grade 7&ndash;9.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Gunning Fog Index</h3>
            <p className="mt-1">
              Developed by Robert Gunning in 1952, this index estimates the years of formal education needed to understand a text on first reading. The formula is:{' '}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs font-mono text-[#5B8AEF]">
                0.4 &times; ((words &divide; sentences) + 100 &times; (complex words &divide; words))
              </code>
              . &ldquo;Complex words&rdquo; are those with three or more syllables, excluding common suffixes like -es, -ed, and -ing. A Fog Index of 12 requires roughly a high-school senior reading level. For most audiences, aim for 8&ndash;12.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Tips for Better Readability</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Keep sentences under 20 words on average.</li>
              <li>Use common, everyday words instead of jargon or technical terms.</li>
              <li>Break long paragraphs into shorter ones.</li>
              <li>Use active voice instead of passive voice.</li>
              <li>Front-load your main point in each paragraph.</li>
              <li>Read your content aloud &mdash; if you stumble, simplify.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
