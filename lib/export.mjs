// Delivery files: a bilingual Word table for review, the translation as a Word file
// (with the translator's certificate for certified jobs), and CSV.

import { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, PageBreak, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { visibleLength } from './segment.mjs';

export const LANG_NAMES = { en: { en: 'English', es: 'Spanish' }, es: { en: 'inglés', es: 'español' } };
export const langs = (project) => (project.settings?.direction === 'es-en' ? ['es', 'en'] : ['en', 'es']);

// "*Title*, 1920" → runs with italics and bold where the markers are
export function runs(text, base = {}) {
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
    r.text.split('\n').map((line, i) => new TextRun({ ...base, text: line, italics: r.italics, bold: r.bold, break: i ? 1 : 0 })),
  );
}

const HEADINGS = new Set(['title', 'exhibition_title', 'heading']);

function paragraph(seg, text) {
  return new Paragraph({
    children: runs(text),
    heading: ['title', 'exhibition_title'].includes(seg.kind) ? HeadingLevel.TITLE : seg.kind === 'heading' ? HeadingLevel.HEADING_2 : undefined,
    spacing: { after: HEADINGS.has(seg.kind) ? 120 : 200 },
  });
}

const p = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts.run })], spacing: { after: opts.after ?? 200 }, alignment: opts.align });

function longDate(lang, d = new Date()) {
  return d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** The translator's certificate of accuracy, in the language of the translation. */
export function certificate(project, profile, date = new Date()) {
  const [src, tgt] = langs(project);
  const name = profile.name || (tgt === 'es' ? '[Nombre del traductor]' : "[Translator's name]");
  const title = project.name;
  const lines = tgt === 'es'
    ? {
        heading: 'Certificado de exactitud de la traducción',
        body: `Yo, ${name}, certifico que tengo la competencia necesaria para traducir del ${LANG_NAMES.es[src]} al ${LANG_NAMES.es[tgt]} y que la traducción al ${LANG_NAMES.es[tgt]} adjunta del documento titulado «${title}» es completa y exacta, según mi leal saber y entender.`,
        sig: 'Firma', nameL: 'Nombre', addr: 'Dirección', contact: 'Contacto', dateL: 'Fecha',
      }
    : {
        heading: 'Certificate of Translation Accuracy',
        body: `I, ${name}, certify that I am competent to translate from ${LANG_NAMES.en[src]} into ${LANG_NAMES.en[tgt]}, and that the attached ${LANG_NAMES.en[tgt]} translation of the document titled “${title}” is complete and accurate to the best of my knowledge and ability.`,
        sig: 'Signature', nameL: 'Name', addr: 'Address', contact: 'Contact', dateL: 'Date',
      };
  const out = [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ children: [new TextRun({ text: lines.heading, bold: true, size: 32 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    p(lines.body, { after: 300 }),
  ];
  if (profile.credentials) out.push(p(profile.credentials, { after: 300 }));
  out.push(
    p(`${lines.sig}: ______________________________`, { after: 240 }),
    p(`${lines.nameL}: ${name}`, { after: 80 }),
    ...(profile.address ? [p(`${lines.addr}: ${profile.address}`, { after: 80 })] : []),
    ...(profile.contact ? [p(`${lines.contact}: ${profile.contact}`, { after: 80 })] : []),
    p(`${lines.dateL}: ${longDate(tgt, date)}`, { after: 400 }),
  );
  if (project.settings?.notaryBlock) {
    // Completed by a notary other than the translator
    out.push(
      p('State of Texas', { after: 80 }),
      p('County of ______________________', { after: 240 }),
      p(`Sworn to and subscribed before me on ______________________ by ${name}.`, { after: 400 }),
      p('______________________________', { after: 80 }),
      p('Notary Public, State of Texas', { after: 80 }),
      p('[Notary seal]', { after: 80, run: { color: '666666' } }),
    );
  }
  return out;
}

export async function translationDocx(project, profile = {}) {
  const [, tgt] = langs(project);
  const children = project.segments.filter((s) => s.target).map((s) => paragraph(s, s.target));
  if (project.settings?.domain === 'certified') children.push(...certificate(project, profile));
  const doc = new Document({ creator: 'Translation Desk', title: `${project.name} (${tgt.toUpperCase()})`, sections: [{ children }] });
  return Packer.toBuffer(doc);
}

const cell = (children, opts = {}) =>
  new TableCell({ children, width: { size: opts.width || 45, type: WidthType.PERCENTAGE }, margins: { top: 80, bottom: 80, left: 100, right: 100 } });

export async function bilingualDocx(project) {
  const [src, tgt] = langs(project);
  const header = new TableRow({
    tableHeader: true,
    children: [
      cell([new Paragraph({ children: [new TextRun({ text: 'ID', bold: true })] })], { width: 10 }),
      cell([new Paragraph({ children: [new TextRun({ text: LANG_NAMES.en[src], bold: true })] })]),
      cell([new Paragraph({ children: [new TextRun({ text: LANG_NAMES.en[tgt], bold: true })] })]),
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
    title: `${project.name} (${src.toUpperCase()}–${tgt.toUpperCase()} review)`,
    sections: [
      {
        properties: { page: { size: { orientation: 'landscape' } } },
        children: [
          new Paragraph({ children: [new TextRun({ text: `${project.name}: ${LANG_NAMES.en[src]}–${LANG_NAMES.en[tgt]} review`, bold: true, size: 32 })], spacing: { after: 200 } }),
          new Table({
            rows: [header, ...rows],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: Object.fromEntries(['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical'].map((k) => [k, { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' }])),
          }),
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
  const [src, tgt] = langs(project);
  const head = ['id', 'kind', LANG_NAMES.en[src].toLowerCase(), LANG_NAMES.en[tgt].toLowerCase(), 'characters', 'max_chars', 'approved', 'notes'];
  const lines = project.segments.map((s) =>
    [s.id, s.kind, s.source, s.target, visibleLength(s.target || ''), s.maxChars ?? '', s.approved ? 'yes' : 'no', s.flags.map((f) => f.note).join(' | ')].map(csvField).join(','),
  );
  return '﻿' + [head.join(','), ...lines].join('\r\n') + '\r\n';
}

/** One row per project, for quotes and invoices: client, words, Claude cost, time spent. */
export function reportCsv(projects) {
  const head = ['date', 'client', 'project', 'direction', 'type', 'words', 'segments', 'approved', 'claude_cost_usd', 'minutes'];
  const lines = projects.filter((p) => !p.broken).map((p) =>
    [String(p.created).slice(0, 10), p.client, p.name, p.direction, p.domain, p.words, p.total, p.approved, p.costUsd.toFixed(2), Math.round(p.seconds / 60)].map(csvField).join(','),
  );
  return '﻿' + [head.join(','), ...lines].join('\r\n') + '\r\n';
}
