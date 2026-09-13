import test from 'node:test';
import assert from 'node:assert/strict';
import { getToolJourney, trackEvent } from '../../src/lib/analytics.ts';

test('journey records only successful known tools and excludes free-text or unrelated state', () => {
  const originalWindow = globalThis.window;
  const originalStorage = globalThis.sessionStorage;
  const values = new Map();
  globalThis.window = { gtag() {} };
  globalThis.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  try {
    trackEvent('schema_copy', { status: 'error' });
    trackEvent('keyword_complete', { unique_keyword_count: 0 });
    assert.deepEqual(getToolJourney(), {});
    trackEvent('prompt_copy', { prompt_id: 'intent-classify' });
    trackEvent('schema_copy', { status: 'success' });
    trackEvent('keyword_complete', { unique_keyword_count: 3 });
    trackEvent('prompt_copy', { prompt_id: 'semantic-brief' });
    assert.deepEqual(getToolJourney(), { last_tool_used: 'seo_prompts', tools_used: 'schema_generator,keyword_scraper,seo_prompts', tool_count: 3 });
    values.set('sp_tool_journey', JSON.stringify(['private input', 'schema_generator', 'schema_generator', 'unknown']));
    assert.deepEqual(getToolJourney(), { last_tool_used: 'schema_generator', tools_used: 'schema_generator', tool_count: 1 });
    values.set('sp_tool_journey', 'invalid json');
    assert.deepEqual(getToolJourney(), {});
    globalThis.sessionStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
    assert.doesNotThrow(() => trackEvent('prompt_copy', {}));
    assert.deepEqual(getToolJourney(), {});
  } finally {
    globalThis.window = originalWindow;
    globalThis.sessionStorage = originalStorage;
  }
});
