'use client';

import { useState, useCallback, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RuleBlock {
  id: string;
  userAgent: string;
  disallowPaths: string[];
  allowPaths: string[];
  crawlDelay: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const USER_AGENT_PRESETS = [
  '*',
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'CCBot',
];

type PresetKey = 'standard' | 'block-ai' | 'googlebot-only' | 'dev-block';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'standard', label: 'Standard (allow all)' },
  { key: 'block-ai', label: 'Block AI Crawlers' },
  { key: 'googlebot-only', label: 'Block everything except Googlebot' },
  { key: 'dev-block', label: 'Development (block all)' },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeBlock(overrides?: Partial<RuleBlock>): RuleBlock {
  return {
    id: uid(),
    userAgent: '*',
    disallowPaths: [''],
    allowPaths: [''],
    crawlDelay: '',
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Preset factories                                                   */
/* ------------------------------------------------------------------ */

function applyPreset(key: PresetKey): { rules: RuleBlock[]; sitemaps: string[] } {
  switch (key) {
    case 'standard':
      return {
        rules: [makeBlock({ userAgent: '*', disallowPaths: [''], allowPaths: ['/'] })],
        sitemaps: ['https://example.com/sitemap.xml'],
      };
    case 'block-ai':
      return {
        rules: [
          makeBlock({ userAgent: 'GPTBot', disallowPaths: ['/'] }),
          makeBlock({ userAgent: 'ChatGPT-User', disallowPaths: ['/'] }),
          makeBlock({ userAgent: 'Google-Extended', disallowPaths: ['/'] }),
          makeBlock({ userAgent: 'CCBot', disallowPaths: ['/'] }),
          makeBlock({ userAgent: '*', disallowPaths: [''], allowPaths: ['/'] }),
        ],
        sitemaps: ['https://example.com/sitemap.xml'],
      };
    case 'googlebot-only':
      return {
        rules: [
          makeBlock({ userAgent: 'Googlebot', disallowPaths: [''], allowPaths: ['/'] }),
          makeBlock({ userAgent: '*', disallowPaths: ['/'] }),
        ],
        sitemaps: ['https://example.com/sitemap.xml'],
      };
    case 'dev-block':
      return {
        rules: [makeBlock({ userAgent: '*', disallowPaths: ['/'] })],
        sitemaps: [],
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RobotsGenerator() {
  const [rules, setRules] = useState<RuleBlock[]>([makeBlock()]);
  const [sitemaps, setSitemaps] = useState<string[]>(['']);
  const [copied, setCopied] = useState(false);

  /* ---------- rule helpers ---------- */

  const updateRule = useCallback(
    (id: string, patch: Partial<RuleBlock>) =>
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
    [],
  );

  const removeRule = useCallback(
    (id: string) => setRules((prev) => prev.filter((r) => r.id !== id)),
    [],
  );

  const addRule = useCallback(() => setRules((prev) => [...prev, makeBlock()]), []);

  const updatePath = useCallback(
    (ruleId: string, field: 'disallowPaths' | 'allowPaths', index: number, value: string) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== ruleId) return r;
          const copy = [...r[field]];
          copy[index] = value;
          return { ...r, [field]: copy };
        }),
      );
    },
    [],
  );

  const addPath = useCallback(
    (ruleId: string, field: 'disallowPaths' | 'allowPaths') => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== ruleId) return r;
          return { ...r, [field]: [...r[field], ''] };
        }),
      );
    },
    [],
  );

  const removePath = useCallback(
    (ruleId: string, field: 'disallowPaths' | 'allowPaths', index: number) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== ruleId) return r;
          const copy = r[field].filter((_, i) => i !== index);
          return { ...r, [field]: copy.length === 0 ? [''] : copy };
        }),
      );
    },
    [],
  );

  /* ---------- sitemap helpers ---------- */

  const updateSitemap = useCallback(
    (index: number, value: string) =>
      setSitemaps((prev) => prev.map((s, i) => (i === index ? value : s))),
    [],
  );

  const addSitemap = useCallback(() => setSitemaps((prev) => [...prev, '']), []);

  const removeSitemap = useCallback(
    (index: number) =>
      setSitemaps((prev) => {
        const copy = prev.filter((_, i) => i !== index);
        return copy.length === 0 ? [''] : copy;
      }),
    [],
  );

  /* ---------- preset ---------- */

  const handlePreset = useCallback((key: PresetKey) => {
    const preset = applyPreset(key);
    setRules(preset.rules);
    setSitemaps(preset.sitemaps.length > 0 ? preset.sitemaps : ['']);
  }, []);

  /* ---------- generate output ---------- */

  const output = useMemo(() => {
    const lines: string[] = [];
    lines.push('# robots.txt generated by sunnypatel.co.uk/tools/robots-generator');
    lines.push('');

    for (const rule of rules) {
      lines.push(`User-agent: ${rule.userAgent || '*'}`);

      for (const p of rule.disallowPaths) {
        if (p.trim()) lines.push(`Disallow: ${p.trim()}`);
      }

      // If all disallow paths are empty, add an empty Disallow (allow everything)
      if (rule.disallowPaths.every((p) => !p.trim())) {
        lines.push('Disallow:');
      }

      for (const p of rule.allowPaths) {
        if (p.trim()) lines.push(`Allow: ${p.trim()}`);
      }

      if (rule.crawlDelay && Number(rule.crawlDelay) > 0) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      }

      lines.push('');
    }

    for (const s of sitemaps) {
      if (s.trim()) lines.push(`Sitemap: ${s.trim()}`);
    }

    return lines.join('\n').trimEnd();
  }, [rules, sitemaps]);

  /* ---------- copy / download ---------- */

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  /* ---------- syntax-highlighted preview ---------- */

  const highlighted = useMemo(() => {
    return output.split('\n').map((line, i) => {
      if (line.startsWith('#')) {
        return (
          <span key={i} className="text-white/30">
            {line}
            {'\n'}
          </span>
        );
      }

      const colonIdx = line.indexOf(':');
      if (colonIdx > -1) {
        const directive = line.slice(0, colonIdx + 1);
        const value = line.slice(colonIdx + 1);
        return (
          <span key={i}>
            <span className="text-[#5B8AEF]">{directive}</span>
            <span className="text-foreground">{value}</span>
            {'\n'}
          </span>
        );
      }

      return (
        <span key={i} className="text-foreground">
          {line}
          {'\n'}
        </span>
      );
    });
  }, [output]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Robots.txt Generator
        </h1>
        <p className="mt-3 text-muted-foreground">
          Build a valid robots.txt with a visual editor. Add user-agent rules, allow/disallow paths, crawl-delay, and sitemap references — then copy or download.
        </p>
      </div>

      {/* Preset selector */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-foreground">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePreset(p.key)}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08]"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main grid: editor + preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: editor */}
        <div className="flex flex-col gap-5">
          {rules.map((rule, ruleIdx) => (
            <div
              key={rule.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3
                  className="text-sm font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Rule Block {ruleIdx + 1}
                </h3>
                {rules.length > 1 && (
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove block
                  </button>
                )}
              </div>

              {/* User-agent */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground">User-agent</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="text"
                    value={rule.userAgent}
                    onChange={(e) => updateRule(rule.id, { userAgent: e.target.value })}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
                    placeholder="*"
                  />
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) updateRule(rule.id, { userAgent: e.target.value });
                    }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-2.5 text-sm text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
                  >
                    <option value="">Presets</option>
                    {USER_AGENT_PRESETS.map((ua) => (
                      <option key={ua} value={ua}>
                        {ua}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Disallow paths */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Disallow paths</label>
                  <button
                    onClick={() => addPath(rule.id, 'disallowPaths')}
                    className="text-xs text-[#5B8AEF] hover:text-[#7BA3F7] transition-colors"
                  >
                    + Add path
                  </button>
                </div>
                <div className="mt-1.5 flex flex-col gap-2">
                  {rule.disallowPaths.map((path, pi) => (
                    <div key={pi} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={path}
                        onChange={(e) =>
                          updatePath(rule.id, 'disallowPaths', pi, e.target.value)
                        }
                        className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono"
                        placeholder="/admin/"
                      />
                      {rule.disallowPaths.length > 1 && (
                        <button
                          onClick={() => removePath(rule.id, 'disallowPaths', pi)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          aria-label="Remove disallow path"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Allow paths */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Allow paths</label>
                  <button
                    onClick={() => addPath(rule.id, 'allowPaths')}
                    className="text-xs text-[#5B8AEF] hover:text-[#7BA3F7] transition-colors"
                  >
                    + Add path
                  </button>
                </div>
                <div className="mt-1.5 flex flex-col gap-2">
                  {rule.allowPaths.map((path, pi) => (
                    <div key={pi} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={path}
                        onChange={(e) =>
                          updatePath(rule.id, 'allowPaths', pi, e.target.value)
                        }
                        className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono"
                        placeholder="/public/"
                      />
                      {rule.allowPaths.length > 1 && (
                        <button
                          onClick={() => removePath(rule.id, 'allowPaths', pi)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          aria-label="Remove allow path"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Crawl-delay */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Crawl-delay{' '}
                  <span className="text-muted-foreground font-normal">(seconds, optional)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={rule.crawlDelay}
                  onChange={(e) => updateRule(rule.id, { crawlDelay: e.target.value })}
                  className="mt-1.5 w-32 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
                  placeholder="10"
                />
              </div>
            </div>
          ))}

          {/* Add rule block button */}
          <button
            onClick={addRule}
            className="rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-[#5B8AEF]/40 hover:text-foreground"
          >
            + Add Rule Block
          </button>

          {/* Sitemaps */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Sitemap URLs
              </h3>
              <button
                onClick={addSitemap}
                className="text-xs text-[#5B8AEF] hover:text-[#7BA3F7] transition-colors"
              >
                + Add sitemap
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {sitemaps.map((sm, si) => (
                <div key={si} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sm}
                    onChange={(e) => updateSitemap(si, e.target.value)}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30 font-mono"
                    placeholder="https://example.com/sitemap.xml"
                  />
                  {sitemaps.length > 1 && (
                    <button
                      onClick={() => removeSitemap(si)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Remove sitemap"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="flex flex-col gap-4">
          <div className="sticky top-28">
            <div className="mb-3 flex items-center justify-between">
              <h3
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Live Preview
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-[#5B8AEF]/40 hover:bg-[#5B8AEF]/[0.08]"
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-all hover:bg-[#4a79de] hover:shadow-[0_0_28px_rgba(91,138,239,0.5)]"
                >
                  Download robots.txt
                </button>
              </div>
            </div>
            <pre className="overflow-auto rounded-lg border border-white/[0.08] bg-[#0d0d14] p-4 font-mono text-sm leading-relaxed">
              {highlighted}
            </pre>
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
            <h3 className="mb-1 font-medium text-foreground">What is robots.txt?</h3>
            <p>
              A robots.txt file tells search engine crawlers which URLs on your site they can and cannot access. It lives at the root of your domain (e.g. example.com/robots.txt) and follows the Robots Exclusion Protocol.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-foreground">User-agent matching</h3>
            <p>
              Each rule block targets a specific crawler via the <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">User-agent</code> directive. Use <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">*</code> to match all crawlers, or name a specific bot like <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">Googlebot</code> or <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">GPTBot</code>. The most specific matching rule wins.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-foreground">Allow vs Disallow</h3>
            <p>
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">Disallow: /path/</code> blocks crawlers from that URL prefix. <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">Allow: /path/</code> overrides a broader disallow for that specific prefix. An empty <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">Disallow:</code> means &quot;allow everything&quot;.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-foreground">Crawl-delay</h3>
            <p>
              The <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">Crawl-delay</code> directive (in seconds) asks bots to wait between requests. Googlebot ignores this — configure crawl rate in Google Search Console instead. Bing and Yandex do respect it.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-foreground">Common pitfalls</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Robots.txt does not prevent indexing — use a <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">noindex</code> meta tag or X-Robots-Tag header for that.</li>
              <li>Blocking CSS/JS files can hurt rendering and SEO — Google needs these to understand your pages.</li>
              <li>Wildcards (<code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">*</code> in paths) and end-of-URL markers (<code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">$</code>) are supported by Google and Bing but not all bots.</li>
              <li>The file must be served from the root domain — not a subdirectory.</li>
              <li>If your robots.txt returns a 5xx error, Google treats it as if all URLs are blocked.</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-foreground">AI crawler blocking</h3>
            <p>
              To prevent AI training crawlers from scraping your content, add specific rules for <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">GPTBot</code> (OpenAI), <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">ChatGPT-User</code> (ChatGPT browse), <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">Google-Extended</code> (Gemini training), and <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-foreground">CCBot</code> (Common Crawl / Anthropic). Use the &quot;Block AI Crawlers&quot; preset above to set this up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
