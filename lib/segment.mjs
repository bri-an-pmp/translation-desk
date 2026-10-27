// Turns an uploaded document into translation segments.
// Formatting that matters for translation is kept as light markers:
// *italic* (titles of works, foreign terms) and **bold**.

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import mammoth from 'mammoth';
import { readXliff } from './xliff.mjs';

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
      ref: b.ref || '',
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

// Older Word (.doc), Rich Text and OpenDocument files are converted to .docx with macOS's own textutil,
// then read like any Word file (italics and bold are kept)
export async function convertToDocx(buffer, type) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'td-doc-'));
  try {
    const src = path.join(dir, `in.${type}`), out = path.join(dir, 'out.docx');
    await fs.writeFile(src, buffer);
    await new Promise((resolve, reject) => execFile('/usr/bin/textutil', ['-format', type, '-convert', 'docx', '-output', out, src], (err) => (err ? reject(err) : resolve())));
    return await fs.readFile(out);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

// A problem with the file itself, explained in words the user can act on
export class FileProblem extends Error {
  constructor(message) { super(message); this.status = 400; }
}

// What the file really is, from its first bytes (names and extensions can be wrong)
export function detectType(fileName, buffer) {
  const ext = (fileName.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
  const head = buffer.subarray(0, 8);
  if (head.subarray(0, 4).toString('latin1') === '%PDF') return 'pdf';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'jpeg';
  if (head.toString('hex') === '89504e470d0a1a0a') return 'png';
  if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  if (head.subarray(0, 3).toString('latin1') === 'GIF') return 'gif';
  if (buffer.subarray(4, 8).toString('latin1') === 'ftyp' && /^(heic|heix|mif1|msf1|hevc)$/.test(buffer.subarray(8, 12).toString('latin1'))) return 'heic';
  if (head[0] === 0x50 && head[1] === 0x4b) return ext === '.pages' ? 'pages' : ext === '.odt' ? 'odt' : 'docx';
  if (head.toString('hex') === 'd0cf11e0a1b11ae1') return 'doc';
  if (head.subarray(0, 5).toString('latin1') === '{\\rtf') return 'rtf';
  if (!buffer.length) return 'empty';
  const text = buffer.toString('utf8');
  if (text.includes('�') || /[\x00-\x08\x0e-\x1f]/.test(text.slice(0, 4000))) return 'binary';
  if (/<xliff[\s>]/.test(text.slice(0, 5000))) return 'xliff';
  if (/<tmx[\s>]/.test(text.slice(0, 5000))) return 'tmx';
  return ext === '.csv' ? 'csv' : 'text';
}

/**
 * Splits an uploaded file into segments. PDFs and photos are read by Claude, so pass
 * readDocument([{buffer, type}]) → {blocks, costUsd, language}; everything else is read on this Mac.
 */
export async function segmentFile(fileName, buffer, { readDocument } = {}) {
  const type = detectType(fileName, buffer);
  switch (type) {
    case 'docx':
      try {
        return { segments: await segmentDocx(buffer) };
      } catch {
        throw new FileProblem('This Word file seems to be damaged. Open it in Word, choose File → Save As, save it as .docx, and try again.');
      }
    case 'pdf': case 'jpeg': case 'png': case 'webp': case 'gif': case 'heic': {
      if (!readDocument) throw new FileProblem('PDFs and photos are read by Claude, and no API key was found. Add your key under My details.');
      const { blocks, costUsd, language } = await readDocument([{ buffer, type }]);
      return { segments: make(joinBrokenLines(blocks)), costUsd, language };
    }
    case 'csv':
      return { segments: segmentCsv(buffer.toString('utf8')) };
    case 'text':
      return { segments: segmentText(buffer.toString('utf8')) };
    case 'doc': case 'rtf': case 'odt': {
      let docx;
      try {
        docx = await convertToDocx(buffer, type);
      } catch {
        throw new FileProblem(`This ${type === 'doc' ? 'Word' : type === 'rtf' ? 'Rich Text' : 'OpenDocument'} file couldn't be opened. Open it in Word or TextEdit, save it as .docx, and try again.`);
      }
      return { segments: await segmentDocx(docx) };
    }
    case 'xliff': {
      const { blocks, language } = readXliff(buffer.toString('utf8'));
      if (blocks.length > 5000) throw new FileProblem(`This file has ${blocks.length} segments; the limit is 5,000. Split it in your translation tool and try again.`);
      return { segments: make(blocks), language };
    }
    case 'tmx':
      throw new FileProblem('This is a translation memory (TMX), not a document. Import it under Glossary → Translation memory.');
    case 'pages':
      throw new FileProblem('This is a Pages file. In Pages, choose File → Export To → Word, and upload the .docx.');
    case 'empty':
      throw new FileProblem('This file is empty.');
    default:
      throw new FileProblem("This file type can't be read. Use Word (.docx or .doc), PDF, a photo (JPEG, PNG, HEIC), RTF, XLIFF, text (.txt) or a spreadsheet saved as .csv, or paste the text.");
  }
}

const PAGE_TYPES = new Set(['pdf', 'jpeg', 'png', 'webp', 'gif', 'heic']);
export const MAX_PAGES = 20;

/**
 * Several photos or PDFs of one document (page 1, page 2…), read together by Claude in the
 * order given. files: [{name, buffer}]. readDocument(parts) → {blocks, costUsd, language}.
 */
export async function segmentPages(files, { readDocument } = {}) {
  if (files.length > MAX_PAGES) throw new FileProblem(`Choose up to ${MAX_PAGES} pages at a time.`);
  const parts = files.map((f) => ({ name: f.name, buffer: f.buffer, type: detectType(f.name, f.buffer) }));
  const other = parts.find((p) => !PAGE_TYPES.has(p.type));
  if (other) throw new FileProblem(`“${other.name}” isn't a photo or PDF. Several files can be combined only when they are pages of one document (photos or PDFs); upload other files one at a time.`);
  if (!readDocument) throw new FileProblem('PDFs and photos are read by Claude, and no API key was found. Add your key under My details.');
  const { blocks, costUsd, language } = await readDocument(parts);
  return { segments: make(joinBrokenLines(blocks)), costUsd, language };
}

// Visible length, without the *italic* and **bold** markers
export function visibleLength(s) {
  return s.replace(/\*\*|\*/g, '').length;
}

// Words in the source, as translators count them for quotes and invoices
export function countWords(s) {
  return (s.replace(/⟨\/?\d+\/?⟩|\*+/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
}
