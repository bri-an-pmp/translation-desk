// Turns an uploaded document into translation segments.
// Formatting that matters for museum text is kept as light markers:
// *italic* (artwork titles) and **bold**.

import mammoth from 'mammoth';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function htmlToMarked(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**')
      .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/(?<!\*)\*\s*\*(?!\*)/g, '')
    .replace(/(\*+)(\s+)([^*]*?)(\s*)\1/g, (m, star, lead, inner, trail) => `${lead}${star}${inner.trimEnd()}${star}${trail}`)
    .replace(/(\*+)([^*\s][^*]*?)(\s+)\1/g, '$1$2$1$3')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Word files often have a hard line break at the end of every line of a paragraph.
// A block that ends mid-sentence followed by one that starts in lowercase is the same paragraph.
export function joinBrokenLines(blocks) {
  const out = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    if (prev && prev.kind === b.kind && !/[.!?:;"”»)|\]]$/.test(prev.source) && /^[\p{Ll}(]/u.test(b.source)) {
      prev.source = `${prev.source} ${b.source}`;
    } else out.push({ ...b });
  }
  return out;
}

function make(blocks) {
  return blocks
    .filter((b) => b.source)
    .map((b, i) => ({
      id: 's' + String(i + 1).padStart(3, '0'),
      kind: b.kind || 'body',
      source: b.source,
      maxChars: Number.isInteger(b.maxChars) && b.maxChars > 0 ? b.maxChars : null,
      context: b.context || '',
      target: '',
      flags: [],
      checks: [],
      approved: false,
    }));
}

export async function segmentDocx(buffer) {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const blocks = [];
  // mammoth wraps table cells and list items in <p>, so paragraphs and headings cover everything
  for (const m of html.matchAll(/<(h[1-6]|p)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)) {
    const source = htmlToMarked(m[2]);
    blocks.push({ kind: m[1][0].toLowerCase() === 'h' ? 'heading' : 'body', source });
  }
  return make(joinBrokenLines(blocks));
}

export function segmentText(text) {
  const blocks = [];
  for (const para of text.replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    const source = para.trim();
    if (!source) continue;
    const heading = source.match(/^#{1,6}\s+(.*)$/s);
    blocks.push(heading ? { kind: 'heading', source: heading[1].trim() } : { kind: 'body', source });
  }
  return make(blocks);
}

export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim()));
}

// Label sheets: a header row with a text column (text, source, english, label)
// and optionally type/kind, max/limit/max_chars, context/notes.
export function segmentCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (...names) => head.findIndex((h) => names.includes(h));
  let textCol = col('text', 'source', 'english', 'label', 'en', 'texto');
  const hasHeader = textCol >= 0;
  if (!hasHeader) textCol = 0;
  const kindCol = col('type', 'kind', 'tipo');
  const maxCol = col('max', 'limit', 'max_chars', 'max chars', 'characters', 'límite');
  const ctxCol = col('context', 'notes', 'note', 'contexto');
  return make(
    rows.slice(hasHeader ? 1 : 0).map((r) => ({
      source: (r[textCol] || '').trim(),
      kind: kindCol >= 0 && r[kindCol] ? r[kindCol].trim().toLowerCase().replace(/\s+/g, '_') : 'label',
      maxChars: maxCol >= 0 ? parseInt(r[maxCol], 10) : null,
      context: ctxCol >= 0 ? (r[ctxCol] || '').trim() : '',
    })),
  );
}

export async function segmentFile(fileName, buffer) {
  const ext = (fileName.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
  if (ext === '.docx') return segmentDocx(buffer);
  if (ext === '.csv') return segmentCsv(buffer.toString('utf8'));
  if (ext === '.txt' || ext === '.md') return segmentText(buffer.toString('utf8'));
  throw new Error(`unsupported file type "${ext || fileName}": use .docx, .txt, .md or .csv`);
}

// Visible length, without the *italic* and **bold** markers
export function visibleLength(s) {
  return s.replace(/\*\*|\*/g, '').length;
}
