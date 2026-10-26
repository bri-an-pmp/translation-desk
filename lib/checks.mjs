// Mechanical checks on each translated segment. They can't judge meaning;
// they catch what a reviewer's eye skips: length, glossary, numbers, titles.

import { visibleLength } from './segment.mjs';

const MONTHS_DAYS = /\b(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo|Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Setiembre|Octubre|Noviembre|Diciembre)\b/g;

const fold = (s) => s.toLowerCase().normalize('NFC');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hasTerm(text, term) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(fold(term))}($|[^\\p{L}\\p{N}])`, 'u').test(fold(text));
}

function digits(s) {
  // A number may use . , or a thin/non-breaking space between digit groups, but not ", " (that's a list)
  return (s.replace(/(\d):00\b/g, '$1').match(/\d(?:[.,\u00a0\u202f]?\d)*/g) || []).map((n) => n.replace(/\D/g, '')).sort();
}

const italics = (s) => (s.replace(/\*\*/g, '').match(/\*[^*]+\*/g) || []).length;

export function checkSegment(seg, glossary = []) {
  const out = [];
  const add = (level, check, message) => out.push({ level, check, message });
  const t = seg.target || '';
  if (!t.trim()) {
    if (seg.flags?.some((f) => f.type === 'duplicate')) return [{ level: 'note', check: 'duplicate', message: 'Left empty on purpose: this repeats another segment. Delete it in the layout.' }];
    return [{ level: 'error', check: 'empty', message: 'No translation yet.' }];
  }

  const len = visibleLength(t);
  if (seg.maxChars && len > seg.maxChars) add('error', 'length', `${len} characters; the space allows ${seg.maxChars}.`);
  else if (!seg.maxChars && visibleLength(seg.source) >= 40 && len > visibleLength(seg.source) * 1.35) {
    add('warning', 'length', `${Math.round((len / visibleLength(seg.source)) * 100)}% of the English length; check it fits the panel.`);
  }

  for (const g of glossary) {
    if (g.source && g.target && hasTerm(seg.source, g.source) && !hasTerm(t, g.target)) {
      add('warning', 'glossary', `Glossary: "${g.source}" should be "${g.target}".`);
    }
  }

  const a = digits(seg.source), b = digits(t);
  if (a.join(',') !== b.join(',')) add('warning', 'numbers', `Numbers differ: English has ${a.join(', ') || 'none'}, Spanish has ${b.join(', ') || 'none'}.`);

  if (italics(seg.source) !== italics(t)) add('warning', 'italics', `English has ${italics(seg.source)} italic title(s), Spanish has ${italics(t)}.`);

  if (t.includes('?') && !t.includes('¿')) add('warning', 'punctuation', 'Question without the opening ¿.');
  if (t.includes('!') && !t.includes('¡')) add('warning', 'punctuation', 'Exclamation without the opening ¡.');

  for (const m of t.matchAll(MONTHS_DAYS)) {
    const before = t.slice(0, m.index).trimEnd();
    if (before && !/[.:¿¡!?\n"«*]$/.test(before)) add('warning', 'capitalization', `"${m[0]}" is lowercase in Spanish mid-sentence.`);
  }

  if (t.trim() === seg.source.trim() && /\p{L}{4,}/u.test(seg.source) && seg.kind !== 'name') {
    add('note', 'untranslated', 'Same as the English. Fine for names and titles kept in the original; otherwise translate.');
  }
  return out;
}

// Same English, different Spanish: usually an inconsistency the reviewer wants to see
export function checkConsistency(segments) {
  const bySource = new Map();
  for (const s of segments) {
    if (!s.target) continue;
    const k = s.source.trim().toLowerCase();
    if (!bySource.has(k)) bySource.set(k, []);
    bySource.get(k).push(s);
  }
  const notes = new Map();
  for (const group of bySource.values()) {
    const targets = new Set(group.map((s) => s.target.trim()));
    if (group.length > 1 && targets.size > 1) {
      for (const s of group) {
        const others = group.filter((o) => o !== s).map((o) => o.id).join(', ');
        notes.set(s.id, { level: 'warning', check: 'consistency', message: `Same English as ${others}, translated differently.` });
      }
    }
  }
  return notes;
}

export function runChecks(project, glossary) {
  const consistency = checkConsistency(project.segments);
  for (const s of project.segments) {
    s.checks = checkSegment(s, glossary);
    if (consistency.has(s.id)) s.checks.push(consistency.get(s.id));
  }
  return project;
}
