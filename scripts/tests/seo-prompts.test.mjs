import test from 'node:test';
import assert from 'node:assert/strict';
import { PROMPTS, EVIDENCE_RULES, promptFields, preparePrompt, exampleInputs } from '../../src/app/tools/seo-prompts/prompts-data.ts';

test('all prompt examples fill every input and preserve evidence instructions', () => {
  assert.equal(new Set(PROMPTS.map(prompt => prompt.id)).size, 20);
  for (const prompt of PROMPTS) {
    const values = exampleInputs(prompt);
    assert.ok(promptFields(prompt.text).every(field => values[field]?.trim()), prompt.id);
    const result = preparePrompt(prompt, values);
    assert.deepEqual(promptFields(result), [], prompt.id);
    assert.ok(result.endsWith(EVIDENCE_RULES), prompt.id);
  }
});

test('personal inputs remain literal rather than replacement tokens or recursive fields', () => {
  const prompt = { id: 'test', title: 'test', category: 'test', use: 'test', text: 'Topic: {topic}. Again: {topic}. Country: {country}.' };
  const result = preparePrompt(prompt, { topic: '$& </script> {country}', country: 'United Kingdom' });
  assert.ok(result.startsWith('Topic: $& </script> {country}. Again: $& </script> {country}. Country: United Kingdom.'));
  assert.ok(preparePrompt(prompt).includes('{topic}'));
});
