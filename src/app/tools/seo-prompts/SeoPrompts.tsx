'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { PROMPTS, promptFields, preparePrompt, exampleInputs, outputCheck, type Prompt } from './prompts-data';

const CATEGORIES = ['All', ...new Set(PROMPTS.map(prompt => prompt.category))];
const button = 'min-h-11 rounded-md border border-hairline-strong dark:border-white/20 px-3 py-2 text-sm font-semibold transition-colors hover:bg-wash dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50';
const fieldClass = 'mt-2 w-full rounded-md border border-hairline-strong dark:border-white/25 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

async function writeClipboard(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function PromptCard({ prompt, values, setValues }: { prompt: Prompt; values: Record<string, string>; setValues: (values: Record<string, string>) => void }) {
  const [notice, setNotice] = useState('');
  const fields = promptFields(prompt.text);
  const missing = fields.filter(field => !values[field]?.trim());
  const prepared = preparePrompt(prompt, values);
  async function copy(personalised: boolean) {
    const copied = await writeClipboard(personalised ? preparePrompt(prompt, values) : preparePrompt(prompt));
    setNotice(copied ? `${personalised ? 'Personalised prompt' : 'Template'} copied. Paste it into your chosen AI tool.` : 'Copy was blocked. Select the prompt text below and copy it manually.');
    trackEvent(copied ? 'prompt_copy' : 'prompt_copy_error', { tool: 'seo_prompts', prompt_id: prompt.id, mode: personalised ? 'personalised' : 'template' });
  }

  return (
    <article id={prompt.id} className="min-w-0 scroll-mt-28 rounded-lg border border-hairline-strong dark:border-white/15 bg-wash dark:bg-white/[0.02] p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-wide text-brand-ink">{prompt.category}</p>
      <h2 className="mt-2 text-lg font-semibold leading-snug text-foreground">{prompt.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{prompt.use}</p>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Inputs:</strong> {fields.join(' · ')}</p>
      <details className="mt-5 border-t border-hairline dark:border-white/10 pt-4">
        <summary className="min-h-11 cursor-pointer rounded-sm py-2 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">Read or copy the template</summary>
        <pre tabIndex={0} aria-label={`${prompt.title} template`} className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-surface-2 dark:bg-black/20 p-4 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-2 focus-visible:outline-brand">{preparePrompt(prompt)}</pre>
        <button type="button" onClick={() => copy(false)} className={`${button} mt-3`}>Copy template</button>
      </details>
      <details className="mt-3 border-t border-hairline dark:border-white/10 pt-3" onToggle={event => {
        if (event.currentTarget.open) trackEvent('prompt_personalise', { tool: 'seo_prompts', prompt_id: prompt.id });
      }}>
        <summary className="min-h-11 cursor-pointer rounded-sm py-2 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">Personalise this prompt</summary>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Fill every field, then copy the prepared prompt. Inputs stay in this page until you copy them; reloading clears them.</p>
        <button type="button" className={`${button} mt-3`} onClick={() => {
          setValues(exampleInputs(prompt));
          setNotice('Fictional example inputs loaded. Replace them with your own evidence before using the output.');
          trackEvent('prompt_example', { tool: 'seo_prompts', prompt_id: prompt.id });
        }}>Replace inputs with an example</button>
        <div className="mt-4 space-y-4">
          {fields.map((field, index) => <div key={field}>
            <label htmlFor={`${prompt.id}-input-${index}`} className="block text-sm font-medium text-foreground">{field}</label>
            <textarea id={`${prompt.id}-input-${index}`} className={fieldClass} rows={field.includes('paste') || field.includes('notes') || field.includes('facts') || field.includes('evidence') ? 4 : 2} value={values[field] || ''} maxLength={20000} onChange={event => {
              setValues({ ...values, [field]: event.target.value }); setNotice('');
            }} />
          </div>)}
        </div>
        <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">{missing.length ? `${missing.length} input${missing.length === 1 ? '' : 's'} still needed.` : 'All inputs filled. Check the preview before copying.'}</p>
        <pre tabIndex={0} aria-label={`${prompt.title} personalised preview`} className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-surface-2 dark:bg-black/20 p-4 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-2 focus-visible:outline-brand">{prepared}</pre>
        <button type="button" disabled={missing.length > 0} onClick={() => copy(true)} className={`${button} mt-3 bg-foreground text-background hover:bg-foreground/90`}>Copy personalised prompt</button>
      </details>
      <p role="status" className="mt-3 text-sm text-foreground">{notice}</p>
      <p className="mt-4 border-t border-hairline dark:border-white/10 pt-4 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Check the result:</strong> {outputCheck(prompt)}</p>
    </article>
  );
}

export default function SeoPrompts() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});
  const lastSearch = useRef('');
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return PROMPTS.filter(prompt => (activeCategory === 'All' || prompt.category === activeCategory) && (!search || `${prompt.title} ${prompt.use} ${prompt.text} ${prompt.category}`.toLowerCase().includes(search)));
  }, [query, activeCategory]);
  function chooseCategory(category: string) {
    if (category === activeCategory) return;
    setActiveCategory(category); trackEvent('prompt_category', { tool: 'seo_prompts', category });
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">SEO Prompt Library</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{PROMPTS.length} free SEO prompts for ChatGPT, Claude and Gemini. Choose a task, add your evidence and copy a prompt built around your inputs.</p>
        <p className="mt-3 text-sm text-muted-foreground">No signup or API key. This tool prepares prompts locally; run them in your chosen AI tool and check the output before publishing.</p>
      </header>
      <nav aria-label="Suggested SEO workflow" className="mb-8 border-y border-hairline-strong dark:border-white/15 py-5">
        <p className="text-sm font-semibold text-foreground">Start with the task you need to finish</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/tools/keyword-scraper/" className={`${button} inline-flex items-center`} data-cta-location="prompts_workflow" data-cta-offer="keyword_scraper">Find keyword ideas</Link>
          <button type="button" onClick={() => { setQuery(''); chooseCategory('Content Briefs'); }} className={button}>Prepare a content brief</button>
          <Link href="/tools/schema-generator/" className={`${button} inline-flex items-center`} data-cta-location="prompts_workflow" data-cta-offer="schema_generator">Generate structured data</Link>
        </div>
      </nav>
      <div className="mb-6">
        <label htmlFor="prompt-search" className="text-sm font-semibold text-foreground">Search the prompt library</label>
        <input id="prompt-search" type="search" value={query} onChange={event => setQuery(event.target.value)} onBlur={() => {
          const searchState = JSON.stringify([query.trim().toLowerCase(), filtered.length]);
          if (query.trim() && searchState !== lastSearch.current) {
            trackEvent('prompt_search', { tool: 'seo_prompts', result_count: filtered.length });
          }
          lastSearch.current = searchState;
        }} placeholder="Try schema, local SEO or content brief" className={fieldClass} />
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by SEO task">
          {CATEGORIES.map(category => <button type="button" key={category} aria-pressed={activeCategory === category} onClick={() => chooseCategory(category)} className={`${button} ${activeCategory === category ? 'border-foreground bg-brand-wash dark:bg-white/10 text-foreground underline decoration-2 underline-offset-4' : 'text-muted-foreground'}`}>{category}</button>)}
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground" role="status">Showing {filtered.length} of {PROMPTS.length} prompts</p>
      <div className="mb-10 grid items-start gap-5 lg:grid-cols-2">{filtered.map(prompt => <PromptCard key={prompt.id} prompt={prompt} values={inputs[prompt.id] || {}} setValues={values => setInputs(previous => ({ ...previous, [prompt.id]: values }))} />)}</div>
      {filtered.length === 0 && <div className="mb-10 rounded-lg border border-hairline-strong dark:border-white/15 p-6">
        <p className="text-sm text-foreground">No matching prompts. Try a broader term or reset the filters.</p>
        <button type="button" className={`${button} mt-3`} onClick={() => { setQuery(''); chooseCategory('All'); }}>Show all prompts</button>
      </div>}
      <section aria-labelledby="prompt-review-help" className="mb-8 rounded-lg border border-hairline-strong dark:border-white/20 p-6 sm:p-8">
        <h2 id="prompt-review-help" className="text-xl font-bold text-foreground">Need a writer-ready brief?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">A useful AI draft still needs source checks, a clear business purpose and editorial decisions. See what a researched content brief includes and inspect a demonstration before enquiring.</p>
        <Link href="/services/content-briefs/" className={`${button} mt-5 inline-flex items-center bg-foreground text-background hover:bg-foreground/90`} data-cta-location="prompts_after_library" data-cta-offer="content_briefs">View content briefs from £150</Link>
      </section>
      <section aria-labelledby="prompt-use-help" className="max-w-3xl">
        <h2 id="prompt-use-help" className="text-xl font-bold text-foreground">How to use the prompts well</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Choose a task and supply the requested inputs. The example button uses fictional demonstration data.</li>
          <li>Copy the prepared prompt into your AI tool. Supply page extracts or search evidence when the tool cannot browse them.</li>
          <li>Check sources, proposed URLs and business claims. A generated checklist does not confirm that a site passed an audit.</li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">For a longer walkthrough, read <Link href="/blog/chatgpt-prompts-for-seo/" className="text-brand-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand">ChatGPT prompts for SEO</Link>.</p>
      </section>
    </div>
  );
}
