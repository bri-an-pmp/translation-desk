// Delivery files: a bilingual Word table for review, a Spanish-only Word file, and CSV.

import { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { visibleLength } from './segment.mjs';

// "*Title*, 1920" → runs with italics and bold where the markers are
export function runs(text) {
  const out = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], italics: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out.flatMap((r) =>
    r.text.split('\n').map((line, i) => new TextRun({ text: line, italics: r.italics, bold: r.bold, break: i ? 1 : 0 })),
  );
}

const HEADINGS = new Set(['exhibition_title', 'heading']);

function paragraph(seg, text) {
  return new Paragraph({
    children: runs(text),
    heading: seg.kind === 'exhibition_title' ? HeadingLevel.TITLE : seg.kind === 'heading' ? HeadingLevel.HEADING_2 : undefined,
    spacing: { after: HEADINGS.has(seg.kind) ? 120 : 200 },
  });
}

export async function spanishDocx(project) {
  const doc = new Document({
    creator: 'Translation Desk',
    title: `${project.name} (ES)`,
    sections: [{ children: project.segments.map((s) => paragraph(s, s.target || '')) }],
  });
  return Packer.toBuffer(doc);
}

const cell = (children, opts = {}) =>
  new TableCell({ children, width: { size: opts.width || 45, type: WidthType.PERCENTAGE }, margins: { top: 80, bottom: 80, left: 100, right: 100 } });

export async function bilingualDocx(project) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      cell([new Paragraph({ children: [new TextRun({ text: 'ID', bold: true })] })], { width: 10 }),
      cell([new Paragraph({ children: [new TextRun({ text: 'English', bold: true })] })]),
      cell([new Paragraph({ children: [new TextRun({ text: 'Español', bold: true })] })]),
    ],
  });
  const rows = project.segments.map((s) => {
    const notes = [
      s.maxChars ? `${visibleLength(s.target || '')}/${s.maxChars} characters` : '',
      ...s.flags.map((f) => `Note: ${f.note}`),
      ...s.checks.filter((c) => c.level !== 'note').map((c) => `Check: ${c.message}`),
    ].filter(Boolean);
    return new TableRow({
      children: [
        cell([new Paragraph({ children: [new TextRun({ text: s.id + (s.approved ? ' ✓' : ''), size: 18 })] })], { width: 10 }),
        cell([new Paragraph({ children: runs(s.source) })]),
        cell([
          new Paragraph({ children: runs(s.target || '') }),
          ...notes.map((n) => new Paragraph({ children: [new TextRun({ text: n, size: 18, color: '7A4B00' })], spacing: { before: 60 } })),
        ]),
      ],
    });
  });
  const doc = new Document({
    creator: 'Translation Desk',
    title: `${project.name} (EN–ES review)`,
    sections: [
      {
        properties: { page: { size: { orientation: 'landscape' } } },
        children: [
          new Paragraph({ children: [new TextRun({ text: `${project.name}: English–Spanish review`, bold: true, size: 32 })], spacing: { after: 200 } }),
          new Table({
            rows: [header, ...rows],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: Object.fromEntries(['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical'].map((k) => [k, { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' }])),
          }),
          new Paragraph({ alignment: AlignmentType.LEFT, children: [] }),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc);
}

const csvField = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // don't let a spreadsheet run text as a formula
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(project) {
  const head = ['id', 'kind', 'english', 'spanish', 'characters', 'max_chars', 'approved', 'notes'];
  const lines = project.segments.map((s) =>
    [s.id, s.kind, s.source, s.target, visibleLength(s.target || ''), s.maxChars ?? '', s.approved ? 'yes' : 'no', s.flags.map((f) => f.note).join(' | ')].map(csvField).join(','),
  );
  return '﻿' + [head.join(','), ...lines].join('\r\n') + '\r\n';
}
