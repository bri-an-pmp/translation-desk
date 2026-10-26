// Translation Desk: a local app. It listens only on this Mac (127.0.0.1) and
// rejects requests from other websites, so only the page it serves can use it.

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { segmentFile, segmentText, parseCsv } from './lib/segment.mjs';
import { readDocument } from './lib/read-document.mjs';
import { runChecks } from './lib/checks.mjs';
import { remember } from './lib/memory.mjs';
import { bilingualDocx, langs, toCsv, translationDocx } from './lib/export.mjs';
import { estimateCost, explainError, MODEL, readKey, translateProject } from './lib/translate.mjs';
import { makeBatches } from './lib/prompt.mjs';
import * as store from './lib/store.mjs';

const PORT = Number(process.env.PORT) || 4321;
const HOST = '127.0.0.1';
const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, 'public');
const ALLOWED_HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);
const MAX_BODY = 30 * 1024 * 1024;
const running = new Set();

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf' };
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function send(res, status, body, type = 'application/json; charset=utf-8', extra = {}) {
  const data = type.startsWith('application/json') ? JSON.stringify(body) : body;
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...extra });
  res.end(data);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw new HttpError(413, 'That file is too large (over 20 MB).');
    chunks.push(c);
  }
  try {
    return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
  } catch {
    throw new HttpError(400, 'The request was not valid JSON.');
  }
}

function asciiName(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'translation';
}

async function loadProject(id) {
  const p = await store.getProject(id).catch(() => null);
  if (!p) throw new HttpError(404, 'That project was not found.');
  return p;
}

const routes = [
  ['GET', /^\/api\/status$/, async () => ({ keyFound: Boolean(await readKey()) || process.env.TD_FAKE === '1', fake: process.env.TD_FAKE === '1', model: MODEL, dataDir: store.DATA_DIR })],

  ['GET', /^\/api\/settings$/, () => store.getSettings()],
  ['GET', /^\/api\/profile$/, () => store.getProfile()],
  ['PUT', /^\/api\/profile$/, async (req) => { const pr = store.cleanProfile(await readBody(req)); await store.saveProfile(pr); return pr; }],
  ['PUT', /^\/api\/settings$/, async (req) => { const s = store.cleanSettings(await readBody(req)); await store.saveSettings(s); return s; }],

  ['GET', /^\/api\/projects$/, () => store.listProjects()],
  ['POST', /^\/api\/projects$/, async (req) => {
    const body = await readBody(req);
    const settings = store.cleanSettings(body.settings);
    let segments, costUsd = 0, language, buffer;
    if (typeof body.fileBase64 === 'string' && body.fileName) {
      const apiKey = await readKey();
      buffer = Buffer.from(body.fileBase64, 'base64');
      const read = apiKey
        ? (buf, type) => readDocument(buf, type, { apiKey, official: settings.domain === 'certified' }).catch((err) => { throw new HttpError(400, err.status && !err.headers ? err.message : explainError(err)); })
        : undefined;
      ({ segments, costUsd = 0, language } = await segmentFile(String(body.fileName), buffer, { readDocument: read }));
    } else if (typeof body.text === 'string') segments = segmentText(body.text);
    else throw new HttpError(400, 'Choose a file or paste some text.');
    if (!segments.length) throw new HttpError(400, 'No text was found in that file. If it is a scan or an image, try the PDF; otherwise paste the text.');
    const project = store.cleanProject({ name: body.name || body.fileName || 'Untitled', fileName: body.fileName || '', settings, segments, usage: { costUsd } });
    project.id = store.newId(project.name);
    if (buffer) project.original = await store.saveOriginal(project.id, String(body.fileName), buffer);
    await store.saveProject(project);
    const [src] = langs(project);
    const notice = language && language !== 'other' && language !== src ? 'languageMismatch' : '';
    return { ...project, notice };
  }],
  ['GET', /^\/api\/projects\/([\w-]+)$/, async (_req, [id]) => {
    const p = await loadProject(id);
    const todo = p.segments.filter((s) => !s.target && !s.approved && !s.flags.some((f) => f.type === 'duplicate'));
    const batches = makeBatches(todo).length;
    return { ...p, estimate: batches ? estimateCost(todo, batches) : 0, translating: running.has(id) };
  }],
  ['DELETE', /^\/api\/projects\/([\w-]+)$/, async (_req, [id]) => {
    if (running.has(id)) throw new HttpError(409, 'Wait until the translation finishes before deleting.');
    await loadProject(id);
    await store.deleteProject(id);
    return { deleted: id };
  }],
  ['GET', /^\/api\/projects\/([\w-]+)\/original$/, async (_req, [id], res) => {
    const file = await store.readOriginal(id).catch(() => null);
    if (!file) throw new HttpError(404, 'The original file is not stored for this project.');
    const type = TYPES[path.extname(file.name)];
    if (!type) throw new HttpError(404, 'This kind of original can only be viewed in its own app.');
    send(res, 200, file.data, type, { 'Content-Disposition': 'inline' });
    return undefined;
  }],
  ['PATCH', /^\/api\/projects\/([\w-]+)$/, async (req, [id]) => {
    const p = await loadProject(id);
    const body = await readBody(req);
    if (typeof body.name === 'string' && body.name.trim()) p.name = body.name.trim();
    if (body.settings) p.settings = store.cleanSettings(body.settings);
    await store.saveProject(p);
    return p;
  }],
  ['PATCH', /^\/api\/projects\/([\w-]+)\/segments\/(s\d+)$/, async (req, [id, sid]) => {
    if (running.has(id)) throw new HttpError(409, 'Wait until the translation finishes before editing.');
    const p = await loadProject(id);
    const seg = p.segments.find((s) => s.id === sid);
    if (!seg) throw new HttpError(404, 'That segment was not found.');
    const body = await readBody(req);
    if (typeof body.target === 'string') seg.target = body.target.slice(0, 20000);
    if (typeof body.approved === 'boolean') seg.approved = body.approved && Boolean(seg.target.trim());
    runChecks(p, await store.getGlossary());
    await store.saveProject(p);
    if (seg.approved) await store.saveMemory(remember(await store.getMemory(), { source: seg.source, target: seg.target, project: p.name, direction: p.settings.direction }));
    return p;
  }],
  ['POST', /^\/api\/projects\/([\w-]+)\/translate$/, async (req, [id], res) => {
    if (running.has(id)) throw new HttpError(409, 'This project is already being translated.');
    const body = await readBody(req);
    const apiKey = await readKey();
    if (!apiKey && process.env.TD_FAKE !== '1') throw new HttpError(400, 'No Claude API key was found. Follow "Set up your API key" in the README, then restart the app.');
    const project = await loadProject(id);
    const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === 'string') : undefined;
    running.add(id);
    res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'keep-alive', ...SECURITY_HEADERS });
    const event = (type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    try {
      const glossary = await store.getGlossary();
      const memory = await store.getMemory();
      const result = await translateProject(project, {
        glossary, memory, ids, apiKey,
        onProgress: async (p) => {
          if (p.saved) { runChecks(project, glossary); await store.saveProject(project); }
          event('progress', p);
        },
      });
      runChecks(project, glossary);
      await store.saveProject(project);
      event('done', { ...result, usage: project.usage });
    } catch (err) {
      runChecks(project, await store.getGlossary());
      await store.saveProject(project);
      event('failed', { message: err.message });
    } finally {
      running.delete(id);
      res.end();
    }
    return undefined;
  }],
  ['GET', /^\/api\/projects\/([\w-]+)\/export\/(bilingual|translation|spanish|csv)$/, async (_req, [id, kind], res) => {
    const p = await loadProject(id);
    const base = asciiName(p.name);
    const [src, tgt] = langs(p).map((l) => l.toUpperCase());
    const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const [data, type, file] =
      kind === 'csv' ? [toCsv(p), 'text/csv; charset=utf-8', `${base}_${tgt}.csv`]
      : kind === 'bilingual' ? [await bilingualDocx(p), DOCX, `${base}_${src}-${tgt}_review.docx`]
      : [await translationDocx(p, await store.getProfile()), DOCX, `${base}_${tgt}.docx`];
    send(res, 200, data, type, { 'Content-Disposition': `attachment; filename="${file}"` });
    return undefined;
  }],

  ['GET', /^\/api\/glossary$/, () => store.getGlossary()],
  ['PUT', /^\/api\/glossary$/, async (req) => {
    const body = await readBody(req);
    if (!Array.isArray(body)) throw new HttpError(400, 'Expected a list of terms.');
    await store.saveGlossary(body);
    return store.getGlossary();
  }],
  ['POST', /^\/api\/glossary\/import$/, async (req) => {
    const { csv } = await readBody(req);
    if (typeof csv !== 'string') throw new HttpError(400, 'Choose a CSV file.');
    const rows = parseCsv(csv);
    const head = (rows[0] || []).map((h) => h.trim().toLowerCase());
    const hasHeader = head.some((h) => ['english', 'source', 'en', 'spanish', 'target', 'es'].includes(h));
    const ci = (names, d) => { const i = head.findIndex((h) => names.includes(h)); return hasHeader && i >= 0 ? i : d; };
    const [s, t, n] = [ci(['english', 'source', 'en'], 0), ci(['spanish', 'target', 'es', 'español'], 1), ci(['note', 'notes', 'nota'], 2)];
    const current = await store.getGlossary();
    for (const r of rows.slice(hasHeader ? 1 : 0)) {
      const term = store.cleanTerm({ source: r[s], target: r[t], note: r[n] || '' });
      if (!term.source || !term.target) continue;
      const existing = current.find((g) => g.source.toLowerCase() === term.source.toLowerCase());
      if (existing) Object.assign(existing, term);
      else current.push(term);
    }
    await store.saveGlossary(current);
    return store.getGlossary();
  }],
];

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x');
  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 404, { error: 'Not found' });
  try {
    const data = await fs.readFile(file);
    send(res, 200, data, TYPES[path.extname(file)] || 'application/octet-stream');
  } catch {
    send(res, 404, { error: 'Not found' });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (!ALLOWED_HOSTS.has(req.headers.host || '')) throw new HttpError(403, 'Forbidden');
    const origin = req.headers.origin;
    if (req.method !== 'GET' && origin && !ALLOWED_HOSTS.has(origin.replace(/^https?:\/\//, ''))) throw new HttpError(403, 'Forbidden');
    if (req.method !== 'GET' && !String(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'Expected JSON.');
    const { pathname } = new URL(req.url, 'http://x');
    if (!pathname.startsWith('/api/')) return await serveStatic(req, res);
    for (const [method, re, handler] of routes) {
      const m = pathname.match(re);
      if (m && req.method === method) {
        const out = await handler(req, m.slice(1), res);
        if (out !== undefined) send(res, 200, out);
        return;
      }
    }
    throw new HttpError(404, 'Not found');
  } catch (err) {
    if (res.headersSent) return res.end();
    const status = err.status || 500;
    if (status === 500) console.error(err);
    send(res, status, { error: err.status ? err.message : `Something went wrong in the app: ${err.message}. Try again; if it keeps happening, restart Translation Desk.` });
  }
});

server.listen(PORT, HOST, async () => {
  const key = await readKey();
  console.log(`\nTranslation Desk is running: open http://localhost:${PORT}\n`);
  console.log(`Files are saved in: ${store.DATA_DIR}`);
  if (process.env.TD_FAKE === '1') console.log('Sample mode: translations are placeholders and Claude is not called.');
  else if (!key) console.log('No Claude API key found yet. See "Set up your API key" in the README.');
  console.log('Press Control-C to stop.\n');
});
