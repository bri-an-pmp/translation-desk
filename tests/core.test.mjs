import { test } from 'node:test';
import assert from 'node:assert/strict';
import { segmentText, segmentCsv, joinBrokenLines, visibleLength, parseCsv, detectType, segmentFile } from '../lib/segment.mjs';
import { checkSegment, checkConsistency } from '../lib/checks.mjs';
import { similarity, findMatches, remember } from '../lib/memory.mjs';
import { cleanProject, cleanSettings } from '../lib/store.mjs';
import { makeBatches, buildUserMessage, buildSystem, BatchResult } from '../lib/prompt.mjs';
import { toCsv, bilingualDocx, spanishDocx } from '../lib/export.mjs';
import { costOf } from '../lib/translate.mjs';

const seg = (source, target, extra = {}) => ({ id: 's001', kind: 'body', source, target, maxChars: null, flags: [], checks: [], approved: false, ...extra });
const has = (checks, name) => checks.some((c) => c.check === name);

test('text is split into paragraphs and headings', () => {
  const s = segmentText('# Room 1\n\nFirst paragraph.\n\nSecond\nstill second.');
  assert.deepEqual(s.map((x) => [x.kind, x.source]), [['heading', 'Room 1'], ['body', 'First paragraph.'], ['body', 'Second\nstill second.']]);
});

test('hard line breaks inside a Word paragraph are rejoined', () => {
  const out = joinBrokenLines([{ kind: 'body', source: 'work includes sculpture,' }, { kind: 'body', source: 'installation, and art.' }, { kind: 'body', source: 'Next paragraph.' }]);
  assert.deepEqual(out.map((b) => b.source), ['work includes sculpture, installation, and art.', 'Next paragraph.']);
});

test('label sheets read text, type and character limit columns', () => {
  const s = segmentCsv('id,type,text,max\n1,label,"Oil on canvas, 1920",40\n2,credit,Gift of Jane Doe,\n');
  assert.equal(s.length, 2);
  assert.equal(s[0].source, 'Oil on canvas, 1920');
  assert.equal(s[0].maxChars, 40);
  assert.equal(s[1].kind, 'credit');
  assert.equal(s[1].maxChars, null);
});

test('CSV parser handles quotes and line breaks in fields', () => {
  assert.deepEqual(parseCsv('a,"b ""c""",d\r\n"x\ny",z\n'), [['a', 'b "c"', 'd'], ['x\ny', 'z']]);
});

test('italic markers do not count toward length', () => {
  assert.equal(visibleLength('*Sin título*, 1920'), 'Sin título, 1920'.length);
});

test('checks: over the character limit is an error', () => {
  const c = checkSegment(seg('Gift of Jane Doe', 'Donación de la señora Jane Doe y familia', { maxChars: 20 }));
  assert.ok(c.some((x) => x.check === 'length' && x.level === 'error'));
});

test('checks: glossary term missing', () => {
  const c = checkSegment(seg('The exhibition opens today.', 'La muestra abre hoy.'), [{ source: 'exhibition', target: 'exposición' }]);
  assert.ok(has(c, 'glossary'));
  assert.ok(!has(checkSegment(seg('The exhibition opens today.', 'La exposición abre hoy.'), [{ source: 'exhibition', target: 'exposición' }]), 'glossary'));
});

test('checks: numbers, with time formats treated as equal', () => {
  assert.ok(has(checkSegment(seg('It measures 20 ft.', 'Mide 200 pies.')), 'numbers'));
  assert.ok(!has(checkSegment(seg('September 5, 2026, 1-4 PM', '5 de septiembre de 2026, 1:00 p.m. a 4:00 p.m.')), 'numbers'));
  assert.ok(!has(checkSegment(seg('1,500.75 visitors', '1.500,75 visitantes')), 'numbers'));
});

test('checks: italics, ¿ ¡ and capitalized months', () => {
  const c = checkSegment(seg('*Untitled*, 1920. Join us!', 'Sin título, 1920. Acompáñenos!'));
  assert.ok(has(c, 'italics'));
  assert.ok(has(c, 'punctuation'));
  assert.ok(has(checkSegment(seg('Opens in September.', 'Abre en Septiembre.')), 'capitalization'));
  assert.ok(!has(checkSegment(seg('September 5', 'Septiembre: 5')), 'capitalization'));
});

test('checks: empty translation, unless left empty as a duplicate', () => {
  assert.equal(checkSegment(seg('Hello', ''))[0].check, 'empty');
  const dup = checkSegment(seg('Este proyecto es apoyado…', '', { flags: [{ type: 'duplicate', span: '', note: 'see s024' }] }));
  assert.equal(dup[0].level, 'note');
});

test('consistency: same English, different Spanish', () => {
  const notes = checkConsistency([{ ...seg('Gift of the artist', 'Donación del artista'), id: 's001' }, { ...seg('Gift of the artist', 'Regalo del artista'), id: 's002' }]);
  assert.equal(notes.size, 2);
});

test('translation memory finds close matches', () => {
  assert.equal(similarity('Gift of Jane Doe', 'gift of jane doe'), 1);
  assert.ok(similarity('Oil on canvas', 'Oil on panel') > 0.4);
  assert.ok(similarity('Oil on canvas', 'Gift of Jane Doe') < 0.2);
  const mem = remember([], { source: 'Oil on canvas', target: 'Óleo sobre tela', project: 'x' });
  remember(mem, { source: 'oil on canvas', target: 'Óleo sobre tela (corrected)', project: 'y' });
  assert.equal(mem.length, 1);
  assert.equal(findMatches(mem, 'Oil on canvas, 1920')[0].target, 'Óleo sobre tela (corrected)');
});

test('stored data is validated', () => {
  const p = cleanProject({ id: '../../etc', name: 5, segments: [{ id: 'x', source: 'Hi', maxChars: -3, approved: 'yes', flags: [{ note: 1 }] }], usage: { costUsd: -1 } });
  assert.match(p.id, /^[a-z0-9-]+$/);
  assert.equal(p.name, 'Untitled');
  assert.equal(p.segments[0].maxChars, null);
  assert.equal(p.segments[0].approved, false);
  assert.equal(p.usage.costUsd, 0);
  assert.equal(cleanSettings({ variant: 'klingon' }).variant, 'us');
});

test('batches respect size limits', () => {
  const segs = Array.from({ length: 100 }, (_, i) => seg('x'.repeat(200), '', { id: `s${i}` }));
  const b = makeBatches(segs);
  assert.ok(b.every((x) => x.length <= 40 && x.reduce((n, s) => n + s.source.length, 0) <= 6000));
  assert.equal(b.flat().length, 100);
});

test('prompt: glossary in the cached system prompt, segments in the user message', () => {
  const sys = buildSystem(cleanSettings({}), [{ source: 'exhibition', target: 'exposición', note: '' }]);
  assert.equal(sys.length, 2);
  assert.ok(sys.every((b) => b.cache_control));
  assert.match(sys[1].text, /exhibition → exposición/);
  const user = buildUserMessage({ batch: [seg('Hello', '', { maxChars: 10 })], previous: [], termDecisions: [], matches: new Map() });
  assert.match(user, /<segment id="s001" max_chars="10">/);
});

test('output schema accepts a valid batch and rejects a broken one', () => {
  assert.ok(BatchResult.safeParse({ segments: [{ id: 's001', kind: 'label', translation: 'Hola', flags: [] }], term_decisions: [] }).success);
  assert.ok(!BatchResult.safeParse({ segments: [{ id: 's001', translation: 'Hola' }] }).success);
});

test('cost uses cache prices', () => {
  assert.equal(costOf({ input_tokens: 1e6 }), 4);
  assert.equal(costOf({ cache_read_input_tokens: 1e6 }), 0.2);
  assert.equal(costOf({ output_tokens: 1e6 }), 20);
});

test('exports: CSV guards against formulas; Word files build', async () => {
  const p = cleanProject({ name: 'Test', segments: [{ id: 's001', source: '*Untitled*', target: '=SUM(A1)', flags: [{ type: 'title', span: 'Untitled', note: 'Check title' }] }] });
  const csv = toCsv(p);
  assert.match(csv, /'=SUM\(A1\)/);
  assert.ok((await bilingualDocx(p)).length > 1000);
  assert.ok((await spanishDocx(p)).length > 1000);
});

test('file type comes from the contents, not the name', async () => {
  assert.equal(detectType('letter.docx', Buffer.from('Dear selection committee,\nThank you for your time.')), 'text');
  assert.equal(detectType('x.docx', Buffer.from('%PDF-1.7')), 'pdf');
  assert.equal(detectType('x.doc', Buffer.from('d0cf11e0a1b11ae1', 'hex')), 'doc');
  assert.equal(detectType('x.docx', Buffer.from('PK\x03\x04')), 'docx');
  assert.equal(detectType('x.pages', Buffer.from('PK\x03\x04')), 'pages');
  const { segments } = await segmentFile('letter.docx', Buffer.from('Dear team,\n\nThank you.'));
  assert.equal(segments.length, 2);
  await assert.rejects(segmentFile('old.doc', Buffer.from('d0cf11e0a1b11ae1', 'hex')), /Save As/);
  await assert.rejects(segmentFile('broken.docx', Buffer.from('PK\x03\x04garbage')), /damaged/);
  await assert.rejects(segmentFile('scan.pdf', Buffer.from('%PDF-1.7')), /API key/);
});

test('PDF blocks become segments, with broken lines joined', async () => {
  const readPdf = async () => ({ blocks: [{ kind: 'heading', source: 'Room 1' }, { kind: 'body', source: 'A long sentence that' }, { kind: 'body', source: 'continues here.' }], costUsd: 0.03 });
  const { segments, costUsd } = await segmentFile('x.pdf', Buffer.from('%PDF-1.7'), { readPdf });
  assert.deepEqual(segments.map((x) => x.source), ['Room 1', 'A long sentence that continues here.']);
  assert.equal(costUsd, 0.03);
});
