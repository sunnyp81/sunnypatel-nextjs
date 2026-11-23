/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness transpiles the TS logic module. */
const fs = require('fs'), path = require('path'), assert = require('assert'), test = require('node:test'), ts = require('typescript');
const repo = path.resolve(__dirname, '..');
const src = fs.readFileSync(repo + '/src/app/tools/redirect-map-checker/redirect-map-logic.ts', 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', 'require', js)(mod, mod.exports, require);
const L = mod.exports;
const sec = (r, id) => r.sections.find((s) => s.id === id);

test('example data has each problem type', () => {
  const r = L.analyse(L.SAMPLE_OLD, L.SAMPLE_MAP, L.SAMPLE_NEW);
  assert.equal(r.summary, '10 of 12 old URLs have a redirect.');
  assert.equal(sec(r, 'no-redirect').count, 2);
  assert.equal(sec(r, 'extra-sources').count, 3);
  assert.equal(sec(r, 'conflicts').count, 1);
  assert.equal(sec(r, 'duplicates').count, 1);
  assert.equal(sec(r, 'chains').count, 1);
  assert.equal(sec(r, 'loops').count, 2);
  assert.equal(sec(r, 'many-to-one').count, 1);
  assert.equal(sec(r, 'malformed').count, 1);
  assert.ok(sec(r, 'not-in-new').count > 0);
  assert.ok(sec(r, 'advisories').count > 0);
});

test('parses separators, quotes, header, CRLF, whitespace', () => {
  const m = L.parseMap('Old URL,New URL\r\n"/a,1","/b"\r\n  /c\t/d  \r\n/e -> /f\r\n/g => /h\r\n\r\n/i\r\n');
  assert.equal(m.headerSkipped, true);
  assert.deepEqual(m.rows.map((r) => [r.source, r.target]), [['/a,1', '/b'], ['/c', '/d'], ['/e', '/f'], ['/g', '/h']]);
  assert.equal(m.malformed.length, 1);
  assert.equal(m.malformed[0].reason, 'Missing target URL');
});

test('normalisation: host case, fragment, slash, query', () => {
  const r = L.analyse('HTTPS://Example.com/Page/#top\n', 'https://example.com/Page,https://example.com/new\n', '');
  assert.equal(r.summary, '1 of 1 old URLs have a redirect.');
  assert.equal(sec(r, 'advisories').count, 1);
  const q = L.analyse('/a?x=1\n/a\n', '/a,/b\n', '');
  assert.equal(sec(q, 'no-redirect').count, 1);
  const c = L.analyse('/Page\n', '/page,/b\n', '');
  assert.equal(sec(c, 'no-redirect').count, 1);
});

test('chains, loops, self-redirects, feeders', () => {
  const r = L.analyse('', '/a,/b\n/b,/c\n/c,/d\n/x,/y\n/y,/x\n/s,/s\n/f,/x\n', '');
  const chains = sec(r, 'chains').rows;
  assert.equal(chains.find((row) => row[0] === '/a')[1], '/d');
  assert.equal(chains.find((row) => row[0] === '/a')[2], '3 hops');
  assert.ok(chains.find((row) => row[0] === '/f'));
  assert.equal(sec(r, 'loops').count, 2);
});

test('domain move is not a chain; http to https is not a loop', () => {
  const r = L.analyse('', 'https://old.com/a,https://new.com/a\nhttp://x.com/p,https://x.com/p\n', '');
  assert.equal(sec(r, 'chains').count, 0);
  assert.equal(sec(r, 'loops').count, 0);
});

test('many-to-one thresholds and homepage', () => {
  let map = '';
  for (let i = 0; i < 12; i++) map += `/o${i},/same\n`;
  for (let i = 0; i < 150; i++) map += `/p${i},/t${i}\n`;
  let r = L.analyse('', map, '');
  assert.equal(sec(r, 'many-to-one').count, 0);
  map = '';
  for (let i = 0; i < 12; i++) map += `/o${i},/same\n`;
  for (let i = 0; i < 20; i++) map += `/p${i},/t${i}\n`;
  r = L.analyse('', map, '');
  assert.equal(sec(r, 'many-to-one').count, 1);
  r = L.analyse('', '/a,/\n/b,/\n/c,/c2\n', '');
  assert.equal(sec(r, 'many-to-one').rows[0][3], 'Homepage');
  r = L.analyse('', '/a,/\n/c,/c2\n', '');
  assert.equal(sec(r, 'many-to-one').count, 0);
});

test('optional sections are skipped without their list', () => {
  const r = L.analyse('', '/a,/b\n', '');
  assert.equal(sec(r, 'no-redirect').ran, false);
  assert.equal(sec(r, 'not-in-new').ran, false);
});

test('mixed absolute and relative compares on path', () => {
  const r = L.analyse('https://a.com/x\n', '/x,/y\n', '');
  assert.equal(r.summary, '1 of 1 old URLs have a redirect.');
  assert.ok(r.notes.length > 0);
});

test('csv export neutralises formulas and quotes', () => {
  const r = L.analyse('/a,b\n', '/q,/r\n', '');
  assert.ok(L.reportToCsv(r).startsWith('Section,Item'));
  assert.equal(L.reportToCsv({ sections: [{ ran: true, title: 'T', rows: [['=1+1', 'a"b']] }] }), 'Section,Item,Detail 1,Detail 2,Detail 3\r\nT,\'=1+1,"a""b"\r\n');
});

test('20,000 rows finish under 2 seconds', () => {
  const oldLines = [], mapLines = [];
  for (let i = 0; i < 20000; i++) {
    oldLines.push(`https://old.example/page-${i}`);
    mapLines.push(`https://old.example/page-${i},https://new.example/${i % 7 === 0 ? 'page-' + (i + 1) : 'new-' + i}/`);
  }
  // add a long chain and a long loop
  for (let i = 0; i < 2000; i++) mapLines.push(`https://new.example/c${i},https://new.example/c${i + 1}`);
  const t0 = performance.now();
  const r = L.analyse(oldLines.join('\n'), mapLines.join('\n'), '');
  const ms = performance.now() - t0;
  console.log('20k analyse ms', Math.round(ms));
  assert.ok(ms < 2000, `took ${ms}ms`);
  assert.equal(r.stats.oldTotal, 20000);
  assert.equal(r.stats.oldWithRedirect, 20000);
});
