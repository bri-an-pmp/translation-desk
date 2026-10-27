// XLIFF files from translation tools: XLIFF 1.2 (and memoQ .mqxliff), Trados .sdlxliff and XLIFF 2.0.
// Each source segment becomes a project segment; on delivery the translations are written back
// into the same file, so the translator can open it again in their tool.
// Inline tags (bold, links, placeholders) become numbered markers: ⟨1⟩…⟨/1⟩ around words, ⟨2/⟩ alone.

import { XmlProblem, child, childrenNamed, escapeXml, findAll, parseXml, serialize, setAttr, setContent, textOf } from './xml.mjs';

const PAIRED = new Set(['g', 'pc', 'mrk']);
export const MARKER = /⟨\/?\d+\/?⟩/g;

// Inline content → marked text and the tags behind each marker
function inline(children, tags) {
  let out = '';
  for (const c of children) {
    if (!c.name) { out += c.text ?? ''; continue; }
    const n = tags.length + 1;
    if (PAIRED.has(c.name) && !c.open.endsWith('/>')) {
      tags.push({ n, open: c.open, close: c.close });
      out += `⟨${n}⟩${inline(c.children, tags)}⟨/${n}⟩`;
    } else {
      tags.push({ n, raw: serialize(c) });
      out += `⟨${n}/⟩`;
    }
  }
  return out;
}

/** Marked translation → XML content. Pairs that were dropped, crossed or repeated are left out. */
export function restore(text, tags) {
  const byN = new Map(tags.map((t) => [t.n, t]));
  const parts = text.split(/(⟨\/?\d+\/?⟩)/);
  const balanced = new Set(), seen = new Set(), stack = [];
  for (const p of parts) {
    const open = p.match(/^⟨(\d+)⟩$/), close = p.match(/^⟨\/(\d+)⟩$/);
    if (open) {
      const n = +open[1];
      if (seen.has(n)) seen.add(-n); // opened twice: not safe to write
      seen.add(n);
      stack.push(n);
    } else if (close) {
      const n = +close[1];
      if (stack[stack.length - 1] === n) { stack.pop(); if (!seen.has(-n)) balanced.add(n); }
      else if (stack.includes(n)) stack.splice(stack.indexOf(n), 1);
    }
  }
  const used = new Set();
  return parts.map((p) => {
    const m = p.match(/^⟨(\/?)(\d+)(\/?)⟩$/);
    if (!m) return escapeXml(p);
    const tag = byN.get(+m[2]);
    if (!tag) return '';
    if (m[3]) {
      if (!tag.raw || used.has(tag.n)) return '';
      used.add(tag.n);
      return tag.raw;
    }
    if (!tag.open || !balanced.has(tag.n)) return '';
    return m[1] ? tag.close : tag.open;
  }).join('');
}

const langOf = (code = '') => (/^en\b/i.test(code) ? 'en' : /^es\b/i.test(code) ? 'es' : code ? 'other' : '');

// Everything translatable in the file, in order, with what's needed to write it back
function items(root) {
  const xliff = findAll(root, 'xliff')[0];
  if (!xliff) throw new XmlProblem('This file is not XLIFF.');
  const v2 = /^2/.test(xliff.attrs.version || '');
  const out = [];
  let language = langOf(xliff.attrs.srcLang);
  const push = (unit, segment, sourceEl, key, extra) => {
    const tags = [];
    const raw = inline(sourceEl.children, tags);
    const text = raw.trim();
    out.push({ unit, segment, key, tags, text, lead: raw.match(/^\s*/)[0], trail: raw.match(/\s*$/)[0], ...extra });
  };

  if (v2) {
    findAll(xliff, 'unit').forEach((unit, u) => {
      if (unit.attrs.translate === 'no') return;
      const notes = child(unit, 'notes');
      const context = [unit.attrs.name ? `Key: ${unit.attrs.name}` : '', ...(notes ? childrenNamed(notes, 'note').map(textOf) : [])].filter(Boolean).join('\n');
      childrenNamed(unit, 'segment').forEach((segment, k) => {
        const source = child(segment, 'source');
        if (source) push(unit, segment, source, `${u}:${k}`, { context });
      });
    });
    return { items: out, language, version: 2, xliff };
  }

  for (const file of findAll(xliff, 'file')) language ||= langOf(file.attrs['source-language']);
  findAll(xliff, 'trans-unit').forEach((unit, u) => {
    if (unit.attrs.translate === 'no') return;
    const context = [unit.attrs.resname ? `Key: ${unit.attrs.resname}` : '', ...childrenNamed(unit, 'note').map(textOf)].filter(Boolean).join('\n');
    const max = unit.attrs['size-unit'] === 'char' ? parseInt(unit.attrs.maxwidth, 10) : null;
    const segSource = child(unit, 'seg-source');
    const marks = segSource ? findAll(segSource, 'mrk').filter((m) => m.attrs.mtype === 'seg') : [];
    if (marks.length) {
      for (const mrk of marks) push(unit, mrk, mrk, `${u}:${mrk.attrs.mid}`, { context, mid: mrk.attrs.mid, segSource });
    } else {
      const source = child(unit, 'source');
      if (source) push(unit, null, source, String(u), { context, maxChars: max });
    }
  });
  return { items: out, language, version: 1, xliff };
}

const hasWords = (text) => /\p{L}/u.test(text.replace(MARKER, ''));

/** Reads an XLIFF file into blocks for segment.mjs: {source, context, maxChars, ref}. */
export function readXliff(xml) {
  const { items: list, language } = items(parseXml(xml));
  const blocks = list.filter((i) => hasWords(i.text)).map((i) => ({ kind: 'body', source: i.text, context: i.context, maxChars: i.maxChars, ref: i.key }));
  return { blocks, language: language || 'other' };
}

// Places a new element right after `after`, with the same indentation
function insertAfter(parent, after, el) {
  const i = parent.children.indexOf(after);
  const prev = parent.children[i - 1];
  const indent = prev && !prev.name && /\n[ \t]*$/.test(prev.raw) ? prev.raw.match(/\n[ \t]*$/)[0] : '';
  parent.children.splice(i + 1, 0, ...(indent ? [{ raw: indent, text: indent }] : []), el);
}

const clone = (n) => (n.name ? { ...n, attrs: { ...n.attrs }, children: n.children.map(clone) } : { ...n });

/**
 * Writes the translations into the original XLIFF. segments: project segments with `ref`.
 * Only translated segments are written; untouched units stay exactly as they were.
 */
export function writeXliff(xml, segments, targetLang) {
  const root = parseXml(xml);
  const { items: list, version, xliff } = items(root);
  const byRef = new Map(segments.filter((s) => s.ref && s.target.trim()).map((s) => [s.ref, s]));
  let written = 0;

  for (const item of list) {
    const seg = byRef.get(item.key);
    if (!seg) continue;
    const content = item.lead + restore(seg.target.trim(), item.tags) + item.trail;
    written++;

    if (version === 2) {
      let target = child(item.segment, 'target');
      if (!target) {
        target = { name: 'target', open: '<target>', close: '</target>', attrs: {}, children: [] };
        insertAfter(item.segment, child(item.segment, 'source'), target);
      }
      setContent(target, content);
      setAttr(item.segment, 'state', seg.approved ? 'reviewed' : 'translated');
    } else if (item.mid !== undefined) {
      // Trados: the target repeats the seg-source structure, one <mrk mtype="seg"> per sentence
      let target = child(item.unit, 'target');
      if (!target) {
        target = { ...clone(item.segSource), name: 'target', open: '<target>', close: '</target>', attrs: {} };
        for (const m of findAll(target, 'mrk')) if (m.attrs.mtype === 'seg') m.children = [];
        insertAfter(item.unit, item.segSource, target);
      }
      const mrk = findAll(target, 'mrk').find((m) => m.attrs.mtype === 'seg' && m.attrs.mid === item.mid);
      if (!mrk) { written--; continue; }
      setContent(mrk, content);
      const def = findAll(item.unit, 'sdl:seg').find((d) => d.attrs.id === item.mid);
      if (def) setAttr(def, 'conf', seg.approved ? 'Translated' : 'Draft');
    } else {
      let target = child(item.unit, 'target');
      if (!target) {
        target = { name: 'target', open: '<target>', close: '</target>', attrs: {}, children: [] };
        insertAfter(item.unit, child(item.unit, 'source'), target);
      }
      setContent(target, content);
      setAttr(target, 'state', seg.approved ? 'translated' : 'needs-review-translation');
    }
  }

  // A file with translations must say which language they are in
  if (version === 2) { if (!xliff.attrs.trgLang) setAttr(xliff, 'trgLang', targetLang); }
  else for (const file of findAll(xliff, 'file')) if (!file.attrs['target-language']) setAttr(file, 'target-language', targetLang);

  return { xml: serialize(root), written };
}
