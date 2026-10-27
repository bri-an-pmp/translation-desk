// TMX: the standard file for translation memories. Imports English–Spanish pairs from
// other tools (Trados, memoQ, Phrase, Wordfast…) and exports this app's memory the same way.

import { child, escapeXml, findAll, parseXml } from './xml.mjs';

// Codes for the original formatting (bpt, ept, ph, it, ut) are dropped; highlighted text is kept
const SKIP = new Set(['bpt', 'ept', 'ph', 'it', 'ut', 'sub']);
const plain = (el) => el.children.map((c) => (!c.name ? c.text ?? '' : SKIP.has(c.name) ? '' : plain(c))).join('').replace(/\s+/g, ' ').trim();

const lang = (tuv) => (tuv.attrs['xml:lang'] || tuv.attrs.lang || '').toLowerCase().slice(0, 2);

/** → {entries: [{source, target, direction}], skipped} */
export function readTmx(xml) {
  const root = parseXml(xml);
  const tmx = findAll(root, 'tmx')[0];
  if (!tmx) throw Object.assign(new Error('This file is not a TMX translation memory.'), { status: 400 });
  const header = findAll(tmx, 'header')[0];
  const direction = /^es/i.test(header?.attrs.srclang || '') ? 'es-en' : 'en-es';
  const [from, to] = direction.split('-');
  const entries = [];
  let skipped = 0;
  for (const tu of findAll(tmx, 'tu')) {
    const segs = {};
    for (const tuv of findAll(tu, 'tuv')) {
      const seg = child(tuv, 'seg');
      if (seg && !segs[lang(tuv)]) segs[lang(tuv)] = plain(seg);
    }
    if (segs[from] && segs[to]) entries.push({ source: segs[from], target: segs[to], direction });
    else skipped++;
  }
  return { entries, skipped };
}

// This app's own markers (⟨1⟩ tags, *italic*) mean nothing to other tools
const exportText = (s) => s.replace(/⟨\/?\d+\/?⟩/g, '').replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, '$1$2').replace(/ {2,}/g, ' ').trim();

const tmxDate = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d.replace(/-/g, '')}T000000Z` : '');

export function toTmx(memory) {
  const tus = memory.map((m) => {
    const [src, tgt] = m.direction === 'es-en' ? ['es', 'en'] : ['en', 'es'];
    const date = tmxDate(m.date);
    return `    <tu srclang="${src}"${date ? ` creationdate="${date}"` : ''}>\n      <tuv xml:lang="${src}"><seg>${escapeXml(exportText(m.source))}</seg></tuv>\n      <tuv xml:lang="${tgt}"><seg>${escapeXml(exportText(m.target))}</seg></tuv>\n    </tu>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <header creationtool="Translation Desk" creationtoolversion="1" datatype="plaintext" segtype="sentence" adminlang="en" srclang="*all*" o-tmf="Translation Desk"/>
  <body>
${tus.join('\n')}
  </body>
</tmx>
`;
}
