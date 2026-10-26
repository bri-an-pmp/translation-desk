// Local storage for projects, the glossary, the translation memory and settings.
// Everything lives outside the code folder (default ~/Documents/Translation Desk),
// so client text can never be committed to git by accident.

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

export const DATA_DIR = process.env.TD_DATA || path.join(os.homedir(), 'Documents', 'Translation Desk');

const DOMAINS = ['general', 'arts', 'certified', 'legal', 'business', 'technical'];
const DIRECTIONS = ['en-es', 'es-en'];
const VARIANTS = ['neutral', 'mexican', 'us', 'castilian'];
const REGISTERS = ['usted', 'tu', 'impersonal'];
const TITLE_POLICIES = ['keep-with-gloss', 'translate-english', 'keep-original', 'translate-all'];

export const DEFAULT_SETTINGS = {
  domain: 'general',
  direction: 'en-es',
  variant: 'us',
  register: 'usted',
  titles: 'keep-with-gloss',
  styleNotes: '',
  notaryBlock: false,
};

const str = (v, max = 20000) => (typeof v === 'string' ? v.slice(0, max) : '');
const oneOf = (v, list, d) => (list.includes(v) ? v : d);

export function cleanSettings(s = {}) {
  return {
    domain: oneOf(s.domain, DOMAINS, DEFAULT_SETTINGS.domain),
    direction: oneOf(s.direction, DIRECTIONS, DEFAULT_SETTINGS.direction),
    variant: oneOf(s.variant, VARIANTS, DEFAULT_SETTINGS.variant),
    register: oneOf(s.register, REGISTERS, DEFAULT_SETTINGS.register),
    titles: oneOf(s.titles, TITLE_POLICIES, DEFAULT_SETTINGS.titles),
    styleNotes: str(s.styleNotes, 8000),
    notaryBlock: s.notaryBlock === true,
  };
}

// The translator's own details, used only on certificates of accuracy. Stored on this Mac only.
export function cleanProfile(p = {}) {
  return {
    name: str(p.name, 200).trim(),
    address: str(p.address, 500).trim(),
    contact: str(p.contact, 300).trim(),
    credentials: str(p.credentials, 500).trim(),
  };
}

const cleanFlag = (f) => ({ type: str(f?.type, 40) || 'other', span: str(f?.span, 500), note: str(f?.note, 2000) });
const cleanCheck = (c) => ({ level: oneOf(c?.level, ['error', 'warning', 'note'], 'note'), check: str(c?.check, 40), message: str(c?.message, 500) });

export function cleanSegment(s = {}, i = 0) {
  const max = Number(s.maxChars);
  return {
    id: /^s\d{1,5}$/.test(s.id) ? s.id : 's' + String(i + 1).padStart(3, '0'),
    kind: str(s.kind, 40) || 'body',
    source: str(s.source),
    maxChars: Number.isInteger(max) && max > 0 && max < 100000 ? max : null,
    context: str(s.context, 2000),
    target: str(s.target),
    flags: Array.isArray(s.flags) ? s.flags.slice(0, 20).map(cleanFlag) : [],
    checks: Array.isArray(s.checks) ? s.checks.slice(0, 40).map(cleanCheck) : [],
    approved: s.approved === true,
  };
}

export function cleanProject(p = {}) {
  const u = p.usage || {};
  const num = (v) => (Number.isFinite(v) && v >= 0 ? v : 0);
  return {
    id: /^[a-z0-9-]{1,80}$/.test(p.id) ? p.id : newId(p.name),
    name: str(p.name, 200) || 'Untitled',
    fileName: str(p.fileName, 300),
    original: str(p.original, 40),
    created: str(p.created, 40) || new Date().toISOString(),
    settings: cleanSettings(p.settings),
    segments: Array.isArray(p.segments) ? p.segments.slice(0, 5000).map(cleanSegment) : [],
    termDecisions: Array.isArray(p.termDecisions) ? p.termDecisions.slice(0, 500).map(cleanTerm).filter((t) => t.source) : [],
    usage: { inputTokens: num(u.inputTokens), outputTokens: num(u.outputTokens), cacheReadTokens: num(u.cacheReadTokens), cacheWriteTokens: num(u.cacheWriteTokens), costUsd: num(u.costUsd) },
  };
}

export function cleanTerm(t = {}) {
  return { source: str(t.source, 300).trim(), target: str(t.target, 300).trim(), note: str(t.note, 1000) };
}

const cleanMemory = (m = {}) => ({ source: str(m.source), target: str(m.target), project: str(m.project, 200), direction: oneOf(m.direction, DIRECTIONS, 'en-es'), date: str(m.date, 20) });

export function newId(name = '') {
  const slug = String(name ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `${slug || 'project'}-${crypto.randomBytes(3).toString('hex')}`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw new Error(`Could not read ${path.basename(file)}: ${err.message}`);
  }
}

// Writes are serialized per file and go through a temp file, so a crash never leaves half a file
const queues = new Map();
function writeJson(file, data) {
  const run = async () => {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2));
    await fs.rename(tmp, file);
  };
  const next = (queues.get(file) || Promise.resolve()).then(run, run);
  queues.set(file, next);
  return next;
}

const projectFile = (id) => {
  if (!/^[a-z0-9-]{1,80}$/.test(id)) throw new Error('bad project id');
  return path.join(DATA_DIR, 'projects', `${id}.json`);
};

export async function listProjects() {
  let files = [];
  try {
    files = (await fs.readdir(path.join(DATA_DIR, 'projects'))).filter((f) => f.endsWith('.json'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const out = [];
  for (const f of files) {
    try {
      const p = cleanProject(await readJson(path.join(DATA_DIR, 'projects', f), {}));
      const done = p.segments.filter((s) => s.target).length;
      const approved = p.segments.filter((s) => s.approved).length;
      out.push({ id: p.id, name: p.name, created: p.created, total: p.segments.length, translated: done, approved });
    } catch {
      out.push({ id: f.replace(/\.json$/, ''), name: f, broken: true });
    }
  }
  return out.sort((a, b) => String(b.created).localeCompare(String(a.created)));
}

export const getProject = async (id) => {
  const raw = await readJson(projectFile(id), null);
  return raw ? cleanProject({ ...raw, id }) : null;
};
export const saveProject = (p) => writeJson(projectFile(p.id), cleanProject(p));

export const getGlossary = async () => (await readJson(path.join(DATA_DIR, 'glossary.json'), [])).map?.(cleanTerm).filter((t) => t.source) ?? [];
export const saveGlossary = (g) => writeJson(path.join(DATA_DIR, 'glossary.json'), g.map(cleanTerm).filter((t) => t.source));

export const getMemory = async () => (await readJson(path.join(DATA_DIR, 'memory.json'), [])).map?.(cleanMemory).filter((m) => m.source && m.target) ?? [];
export const saveMemory = (m) => writeJson(path.join(DATA_DIR, 'memory.json'), m.map(cleanMemory));

export const getSettings = async () => cleanSettings(await readJson(path.join(DATA_DIR, 'settings.json'), DEFAULT_SETTINGS));
export const saveSettings = (s) => writeJson(path.join(DATA_DIR, 'settings.json'), cleanSettings(s));

export const getProfile = async () => cleanProfile(await readJson(path.join(DATA_DIR, 'profile.json'), {}));
export const saveProfile = (p) => writeJson(path.join(DATA_DIR, 'profile.json'), cleanProfile(p));

// Deletes the project file and its stored original. Used for sensitive documents once a job is done.
export async function deleteProject(id) {
  await fs.rm(projectFile(id), { force: true });
  await fs.rm(path.join(DATA_DIR, 'originals', id), { recursive: true, force: true });
}

// Keeps the uploaded original next to the project so it can be shown during review
export async function saveOriginal(id, fileName, buffer) {
  projectFile(id); // validates the id
  const dir = path.join(DATA_DIR, 'originals', id);
  await fs.mkdir(dir, { recursive: true });
  const ext = (fileName.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '').toLowerCase();
  await fs.writeFile(path.join(dir, `original${ext}`), buffer);
  return `original${ext}`;
}

export async function readOriginal(id) {
  projectFile(id); // validates the id
  const dir = path.join(DATA_DIR, 'originals', id);
  const files = await fs.readdir(dir).catch(() => []);
  const name = files.find((f) => f.startsWith('original'));
  return name ? { name, data: await fs.readFile(path.join(dir, name)) } : null;
}
