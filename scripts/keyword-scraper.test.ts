import assert from 'node:assert/strict';
import test from 'node:test';
import type { AutocompleteResult } from '../src/lib/keyword-scraper';

const {
  buildScrapePlan,
  KEYWORD_ENGINES,
  keywordRowsToCsv,
  runKeywordScrape,
  validateScrapeSetup,
} = await import(
  // @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
  '../src/lib/keyword-scraper.ts'
);

test('uses the correct Google region code for France', () => {
  assert.equal(KEYWORD_ENGINES.find((engine) => engine.id === 'googleFR')?.gl, 'FR');
});

test('rejects an empty region selection before a run starts', () => {
  assert.equal(
    validateScrapeSetup('seo consultant', 0),
    'Select at least one Google region before starting.',
  );
  assert.deepEqual(buildScrapePlan('seo consultant', '', 0, 100).queries, []);
});

test('caps total query-region work at the selected request limit', () => {
  const plan = buildScrapePlan('seo consultant', 'how\nwhat\nbest\nnear me', 2, 100);
  assert.equal(plan.queries.length, 50);
  assert.equal(plan.totalRequests, 100);
  assert.equal(plan.capped, true);
  assert.deepEqual(plan.queries.slice(0, 4), [
    'how seo consultant',
    'what seo consultant',
    'best seo consultant',
    'near me seo consultant',
  ]);
});

test('aggregates each keyword across regions in configured order', async () => {
  const engines = KEYWORD_ENGINES.slice(0, 2);
  const controller = new AbortController();
  const plan = buildScrapePlan('seo consultant', '', engines.length, 2);
  const summary = await runKeywordScrape({
    plan,
    engines,
    negativeText: '',
    signal: controller.signal,
    isCurrent: () => true,
    request: async (_query, engine) => {
      await new Promise((resolve) => setTimeout(resolve, engine.id === 'googleUK' ? 15 : 0));
      return {
        status: 'success',
        suggestions: engine.id === 'googleUK'
          ? ['seo consultant, london', 'seo consultant, london']
          : ['SEO Consultant, London'],
      };
    },
  });

  assert.equal(summary.uniqueKeywords, 1);
  assert.equal(summary.keywordRegionPairs, 2);
  assert.deepEqual(summary.rows, [
    { keyword: 'seo consultant, london', regions: ['United Kingdom', 'United States'] },
  ]);
});

test('does not publish callbacks from a superseded run', async () => {
  const engine = KEYWORD_ENGINES.slice(0, 1);
  const controller = new AbortController();
  let current = true;
  let releaseRequest: ((result: AutocompleteResult) => void) | undefined;
  const rowUpdates: unknown[] = [];
  const progressUpdates: unknown[] = [];
  const run = runKeywordScrape({
    plan: buildScrapePlan('first run', '', 1, 1),
    engines: engine,
    negativeText: '',
    signal: controller.signal,
    isCurrent: () => current,
    request: () => new Promise((resolve) => { releaseRequest = resolve; }),
    onRows: (rows) => rowUpdates.push(rows),
    onProgress: (progress) => progressUpdates.push(progress),
  });

  await Promise.resolve();
  current = false;
  assert.ok(releaseRequest);
  releaseRequest({ status: 'success', suggestions: ['stale suggestion'] });
  const summary = await run;

  assert.equal(summary.status, 'cancelled');
  assert.equal(rowUpdates.length, 0);
  assert.equal(progressUpdates.length, 0);
});

test('counts actual empty responses separately from timeouts', async () => {
  const engines = KEYWORD_ENGINES.slice(0, 2);
  const controller = new AbortController();
  const summary = await runKeywordScrape({
    plan: buildScrapePlan('empty query', '', engines.length, 2),
    engines,
    negativeText: '',
    signal: controller.signal,
    isCurrent: () => true,
    request: async (_query, engine) =>
      engine.id === 'googleUK'
        ? { status: 'success', suggestions: [] }
        : { status: 'timeout' },
  });

  assert.equal(summary.emptyResponses, 1);
  assert.equal(summary.timeoutCount, 1);
  assert.equal(summary.errorCount, 0);
});

test('CSV keeps commas, quotes and line breaks while neutralising spreadsheet formulas', () => {
  const csv = keywordRowsToCsv([
    {
      keyword: '=HYPERLINK("https://example.test", "click, me")',
      regions: ['United Kingdom', 'United States'],
    },
    { keyword: 'line one\nline two, exact', regions: ['France'] },
    { keyword: '  -2+3', regions: ['Portugal'] },
  ]);

  assert.equal(
    csv,
    '"Keyword","Regions"\r\n' +
      '"\'=HYPERLINK(""https://example.test"", ""click, me"")","United Kingdom, United States"\r\n' +
      '"line one\nline two, exact","France"\r\n' +
      '"\'  -2+3","Portugal"',
  );
});
