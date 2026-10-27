import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { countWords, detectType, segmentFile, segmentPages } from '../lib/segment.mjs';
import { readXliff, restore, writeXliff } from '../lib/xliff.mjs';
import { parseXml, serialize } from '../lib/xml.mjs';
import { readTmx, toTmx } from '../lib/tmx.mjs';
import { findMatches, importMemory } from '../lib/memory.mjs';
import { checkSegment } from '../lib/checks.mjs';
import { cleanProject } from '../lib/store.mjs';
import { collectLater, costOf, submitLater } from '../lib/translate.mjs';
import { reportCsv } from '../lib/export.mjs';

const mac = process.platform === 'darwin';

test('XML is written back byte for byte', () => {
  const xml = '<?xml version="1.0"?>\n<!-- note -->\n<a x=\'1\'><b>T &amp; <![CDATA[<raw>]]></b><c/></a>\n';
  assert.equal(serialize(parseXml(xml)), xml);
  assert.throws(() => parseXml('<a><b></a>'), /valid XML/);
});

const XLIFF12 = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file source-language="en-US" datatype="plaintext" original="app">
    <body>
      <trans-unit id="1" resname="welcome" maxwidth="30" size-unit="char">
        <source>Welcome, <g id="b">friend</g>!</source>
        <note>Home screen title</note>
      </trans-unit>
      <trans-unit id="2">
        <source>You have <x id="n"/> new messages &amp; alerts.</source>
        <target/>
      </trans-unit>
      <trans-unit id="3" translate="no"><source>ACME</source></trans-unit>
      <trans-unit id="4"><source><x id="only"/> 42</source></trans-unit>
    </body>
  </file>
</xliff>
`;

test('XLIFF 1.2: units become segments with tag markers, notes, keys and limits', () => {
  const { blocks, language } = readXliff(XLIFF12);
  assert.equal(language, 'en');
  assert.deepEqual(blocks.map((b) => b.source), ['Welcome, ⟨1⟩friend⟨/1⟩!', 'You have ⟨1/⟩ new messages & alerts.']);
  assert.equal(blocks[0].maxChars, 30);
  assert.match(blocks[0].context, /Key: welcome/);
  assert.match(blocks[0].context, /Home screen title/);
  assert.deepEqual(blocks.map((b) => b.ref), ['0', '1']);
});

test('XLIFF 1.2: translations are written back into the same file, tags restored', () => {
  const segments = [
    { ref: '0', target: '¡Bienvenido, ⟨1⟩amigo⟨/1⟩!', approved: true },
    { ref: '1', target: 'Tiene ⟨1/⟩ mensajes y alertas nuevos.', approved: false },
  ];
  const { xml, written } = writeXliff(XLIFF12, segments, 'es');
  assert.equal(written, 2);
  assert.match(xml, /<target state="translated">¡Bienvenido, <g id="b">amigo<\/g>!<\/target>/);
  assert.match(xml, /<target state="needs-review-translation">Tiene <x id="n"\/> mensajes y alertas nuevos.<\/target>/);
  assert.match(xml, /target-language="es"/);
  assert.match(xml, /<trans-unit id="3" translate="no"><source>ACME<\/source><\/trans-unit>/);
  // The file still reads, and nothing outside the targets changed
  assert.equal(readXliff(xml).blocks.length, 2);
  assert.ok(xml.includes('<note>Home screen title</note>'));
});

test('tag markers: a dropped or crossed pair is left out so the XML stays valid', () => {
  const tags = [{ n: 1, open: '<g id="1">', close: '</g>' }, { n: 2, open: '<g id="2">', close: '</g>' }, { n: 3, raw: '<x id="3"/>' }];
  assert.equal(restore('a ⟨1⟩b⟨/1⟩ ⟨3/⟩ & c', tags), 'a <g id="1">b</g> <x id="3"/> &amp; c');
  assert.equal(restore('a ⟨1⟩b c', tags), 'a b c');
  assert.equal(restore('⟨1⟩a ⟨2⟩b⟨/1⟩ c⟨/2⟩', tags), 'a <g id="2">b c</g>'); // crossed: pair 1 is dropped
  assert.equal(restore('⟨3/⟩⟨3/⟩ ⟨9/⟩x', tags), '<x id="3"/> x');
});

test('Trados .sdlxliff: one segment per sentence marker, targets and status written', () => {
  const sdl = `<?xml version="1.0" encoding="utf-8"?>
<xliff xmlns:sdl="http://sdl.com/FileTypes/SdlXliff/1.0" version="1.2">
<file source-language="en-US" target-language="es-MX"><body>
<trans-unit id="u1">
<source>First sentence. Second <g id="5">bold</g> one.</source>
<seg-source><mrk mtype="seg" mid="1">First sentence.</mrk> <mrk mtype="seg" mid="2">Second <g id="5">bold</g> one.</mrk></seg-source>
<sdl:seg-defs><sdl:seg id="1"/><sdl:seg id="2"/></sdl:seg-defs>
</trans-unit>
</body></file></xliff>`;
  const { blocks } = readXliff(sdl);
  assert.deepEqual(blocks.map((b) => [b.ref, b.source]), [['0:1', 'First sentence.'], ['0:2', 'Second ⟨1⟩bold⟨/1⟩ one.']]);
  const { xml } = writeXliff(sdl, [{ ref: '0:1', target: 'Primera oración.', approved: true }, { ref: '0:2', target: 'Otra en ⟨1⟩negrita⟨/1⟩.', approved: false }], 'es');
  assert.match(xml, /<target><mrk mtype="seg" mid="1">Primera oración.<\/mrk> <mrk mtype="seg" mid="2">Otra en <g id="5">negrita<\/g>.<\/mrk><\/target>/);
  assert.match(xml, /<sdl:seg id="1" conf="Translated"\/>/);
  assert.match(xml, /<sdl:seg id="2" conf="Draft"\/>/);
  assert.match(xml, /target-language="es-MX"/);
});

test('XLIFF 2.0: segments, notes, target and state', () => {
  const x2 = `<xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0" srcLang="es">
  <file id="f1">
    <unit id="u1" name="greeting">
      <notes><note>Shown once</note></notes>
      <segment><source>Hola, <pc id="1">mundo</pc>.</source></segment>
    </unit>
  </file>
</xliff>`;
  const { blocks, language } = readXliff(x2);
  assert.equal(language, 'es');
  assert.deepEqual(blocks.map((b) => [b.ref, b.source, b.context]), [['0:0', 'Hola, ⟨1⟩mundo⟨/1⟩.', 'Key: greeting\nShown once']]);
  const { xml } = writeXliff(x2, [{ ref: '0:0', target: 'Hello, ⟨1⟩world⟨/1⟩.', approved: false }], 'en');
  assert.match(xml, /<segment state="translated"><source>Hola, <pc id="1">mundo<\/pc>.<\/source><target>Hello, <pc id="1">world<\/pc>.<\/target><\/segment>/);
  assert.match(xml, /trgLang="en"/);
});

test('XLIFF and TMX files are recognized from their contents', async () => {
  assert.equal(detectType('strings.xlf', Buffer.from(XLIFF12)), 'xliff');
  assert.equal(detectType('memory.tmx', Buffer.from('<?xml version="1.0"?><tmx version="1.4">')), 'tmx');
  const { segments, language } = await segmentFile('strings.xlf', Buffer.from(XLIFF12));
  assert.equal(segments.length, 2);
  assert.equal(segments[0].ref, '0');
  assert.equal(language, 'en');
  await assert.rejects(segmentFile('memory.tmx', Buffer.from('<tmx version="1.4">')), /translation memory/);
});

test('checks: a missing tag marker is an error', () => {
  const seg = (source, target) => ({ id: 's001', kind: 'body', source, target, maxChars: null, flags: [], checks: [], approved: false });
  const c = checkSegment(seg('Click ⟨1⟩Save⟨/1⟩ on page ⟨2/⟩.', 'Haga clic en Guardar en la página ⟨2/⟩.'));
  assert.ok(c.some((x) => x.check === 'tags' && x.level === 'error' && /⟨1⟩/.test(x.message)));
  assert.ok(!c.some((x) => x.check === 'numbers'), 'marker numbers are not compared as numbers');
  assert.ok(!checkSegment(seg('Click ⟨1⟩Save⟨/1⟩.', 'Haga clic en ⟨1⟩Guardar⟨/1⟩.')).some((x) => x.check === 'tags'));
});

test('TMX: pairs are read in the header direction, formatting codes dropped; export reads back', () => {
  const tmx = `<?xml version="1.0"?><tmx version="1.4"><header srclang="en-US" creationtool="x"/><body>
<tu><tuv xml:lang="en-US"><seg>The <bpt i="1">&lt;b&gt;</bpt>museum<ept i="1">&lt;/b&gt;</ept> opens.</seg></tuv><tuv xml:lang="es-MX"><seg>El museo abre.</seg></tuv></tu>
<tu><tuv xml:lang="en-US"><seg>Only English</seg></tuv><tuv xml:lang="fr-FR"><seg>Seulement</seg></tuv></tu>
</body></tmx>`;
  const { entries, skipped } = readTmx(tmx);
  assert.deepEqual(entries, [{ source: 'The museum opens.', target: 'El museo abre.', direction: 'en-es' }]);
  assert.equal(skipped, 1);
  const back = readTmx(toTmx([{ source: 'A & *B* ⟨1/⟩', target: 'A y *B* ⟨1/⟩', direction: 'en-es', date: '2026-10-26' }]));
  assert.deepEqual(back.entries, [{ source: 'A & B', target: 'A y B', direction: 'en-es' }]);
});

test('memory import: new and updated entries, and the size limit', () => {
  const memory = [{ source: 'Hello', target: 'Hola', direction: 'en-es', project: 'x', date: '' }];
  const r = importMemory(memory, [{ source: 'hello', target: 'Buenas', direction: 'en-es' }, { source: 'The museum opens at ten.', target: 'El museo abre a las diez.', direction: 'en-es' }], 'TMX: a.tmx');
  assert.deepEqual([r.added, r.updated, r.full], [1, 1, false]);
  assert.equal(memory[0].target, 'Buenas');
  assert.equal(findMatches(memory, 'The museum opens at ten').length, 1);
});

test('several photos or PDFs are read together, in order, as one document', async () => {
  let got;
  const readDocument = async (parts) => { got = parts.map((p) => p.type); return { blocks: [{ kind: 'body', source: 'Page one ends' }, { kind: 'body', source: 'on page two.' }], costUsd: 0.05, language: 'es' }; };
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  const { segments } = await segmentPages([{ name: '1.jpg', buffer: jpg }, { name: '2.pdf', buffer: Buffer.from('%PDF-1.7') }], { readDocument });
  assert.deepEqual(got, ['jpeg', 'pdf']);
  assert.deepEqual(segments.map((s) => s.source), ['Page one ends on page two.']);
  await assert.rejects(segmentPages([{ name: '1.jpg', buffer: jpg }, { name: 'a.docx', buffer: Buffer.from('PK\x03\x04') }], { readDocument }), /pages of one document/);
});

test('older Word, RTF and OpenDocument files are converted on the Mac, keeping italics', { skip: !mac && 'needs macOS textutil' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'td-test-'));
  try {
    const rtf = path.join(dir, 'a.rtf');
    fs.writeFileSync(rtf, '{\\rtf1\\ansi {\\b Room 1}\\par This is {\\i The River}, a sculpture.\\par}');
    for (const type of ['doc', 'odt']) execFileSync('/usr/bin/textutil', ['-convert', type, rtf, '-output', path.join(dir, `a.${type}`)]);
    for (const type of ['rtf', 'doc', 'odt']) {
      const buf = fs.readFileSync(path.join(dir, `a.${type}`));
      assert.equal(detectType(`a.${type}`, buf), type);
      const { segments } = await segmentFile(`a.${type}`, buf);
      assert.ok(segments.some((s) => s.source === 'This is *The River*, a sculpture.'), `${type}: ${JSON.stringify(segments.map((s) => s.source))}`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('projects keep client, time, pages and a waiting half-price job; bad values are dropped', () => {
  const p = cleanProject({ name: 'x', client: ' Museo ', seconds: 90, originals: ['original-1.jpg', '../etc/passwd', 'original-2.pdf'], pending: { batchId: 'msgbatch_01', submitted: '2026-10-26', parts: [['s001', 'bad'], 'x'] } });
  assert.equal(p.client, 'Museo');
  assert.equal(p.seconds, 90);
  assert.deepEqual(p.originals, ['original-1.jpg', 'original-2.pdf']);
  assert.deepEqual(p.pending.parts, [['s001'], []]);
  assert.equal(cleanProject({ pending: { batchId: 'no spaces allowed' } }).pending, null);
  assert.deepEqual(cleanProject({ original: 'original.pdf' }).originals, ['original.pdf']);
});

test('half price: batch cost is 50%, and results fill only untouched segments', async () => {
  assert.equal(costOf({ input_tokens: 1e6, output_tokens: 0 }, { batch: true }), 2);
  const p = cleanProject({
    name: 'x', settings: { direction: 'en-es' },
    segments: [{ id: 's001', source: 'One.' }, { id: 's002', source: 'Two.' }],
  });
  await submitLater(p, { glossary: [], memory: [], fake: true });
  assert.ok(p.pending.batchId.startsWith('fake-'));
  assert.deepEqual(p.pending.parts, [['s001', 's002']]);
  p.segments[1].target = 'Dos (mine).';
  const r = await collectLater(p, { fake: true });
  assert.equal(r.ended, true);
  assert.equal(p.segments[0].target, '[ES] One.');
  assert.equal(p.segments[1].target, 'Dos (mine).');
  assert.equal(p.pending, null);
});

test('word counts and the client report', () => {
  assert.equal(countWords('The *River*, 1920 — l’eau ⟨1⟩here⟨/1⟩.'), 5);
  const csv = reportCsv([{ created: '2026-10-26T10:00:00Z', client: 'Museo', name: '=bad', direction: 'en-es', domain: 'arts', words: 1500, total: 30, approved: 30, costUsd: 0.4, seconds: 3600 }]);
  assert.match(csv, /2026-10-26,Museo,'=bad,en-es,arts,1500,30,30,0.40,60/);
});
