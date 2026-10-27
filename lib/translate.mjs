// Sends the project to Claude batch by batch and merges the results back.

import { execFile, spawn } from 'node:child_process';
import os from 'node:os';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { BatchResult, buildSystem, buildUserMessage, makeBatches, orientGlossary } from './prompt.mjs';
import { findMatches } from './memory.mjs';

export const MODEL = 'claude-opus-5-5';
export const KEYCHAIN_SERVICE = 'anthropic-translation-assistant';

// List prices per million tokens for Claude Opus 5.5 (October 2026), used for the cost shown to the user
const PRICE = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 };

export function readKey() {
  if (process.env.ANTHROPIC_API_KEY) return Promise.resolve(process.env.ANTHROPIC_API_KEY);
  return new Promise((resolve) => {
    execFile('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-w'], (err, stdout) => {
      resolve(err ? null : stdout.trim() || null);
    });
  });
}

const KEY_FORMAT = /^sk-ant-[A-Za-z0-9_-]{20,300}$/;

/** Checks a new key with Claude (listing a model costs nothing), then saves it in the Keychain. */
export async function saveKey(key, { check = true } = {}) {
  key = String(key || '').trim();
  if (!KEY_FORMAT.test(key)) throw Object.assign(new Error('That doesn\'t look like a Claude API key. It starts with sk-ant-. Copy it again from console.anthropic.com → API Keys.'), { status: 400 });
  if (check) {
    try {
      await new Anthropic({ apiKey: key, maxRetries: 1 }).models.retrieve(MODEL);
    } catch (err) {
      throw Object.assign(new Error(explainError(err)), { status: 400 });
    }
  }
  // Sent to `security` on its standard input, so the key never appears in the list of running commands
  await new Promise((resolve, reject) => {
    const p = spawn('/usr/bin/security', ['-i'], { stdio: ['pipe', 'ignore', 'ignore'] });
    p.on('error', reject);
    p.on('close', resolve);
    p.stdin.end(`add-generic-password -U -a ${os.userInfo().username} -s ${KEYCHAIN_SERVICE} -w ${key}\n`);
  });
  if (process.env.ANTHROPIC_API_KEY) return;
  if ((await readKey()) !== key) throw new Error("The key couldn't be saved in the Keychain. Try again, or follow the Terminal steps in the README.");
}

export function costOf(u, { batch = false } = {}) {
  return (
    ((u.input_tokens || 0) * PRICE.input +
      (u.output_tokens || 0) * PRICE.output +
      (u.cache_creation_input_tokens || 0) * PRICE.cacheWrite +
      (u.cache_read_input_tokens || 0) * PRICE.cacheRead) /
    1e6 * (batch ? 0.5 : 1)
  );
}

// Rough, before anything is sent: about 4 characters per token, and translation plus
// thinking writes about 3 times the input. The real cost is recorded after each batch.
export function estimateCost(segments, batches) {
  const chars = segments.reduce((n, s) => n + s.source.length, 0);
  const tokens = chars / 4;
  const system = 9000;
  return (system * PRICE.cacheWrite + (batches - 1) * system * PRICE.cacheRead + tokens * 1.6 * PRICE.input + tokens * 3 * PRICE.output) / 1e6;
}

export function explainError(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'Claude rejected the API key. Save a new key in Keychain (see the README), then restart the app.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'This API key is not allowed to use the model. Check the key\'s workspace in console.anthropic.com.';
  if (err instanceof Anthropic.RateLimitError) return 'Claude is receiving too many requests right now. Wait a minute and press Translate again; finished segments are saved.';
  if (err instanceof Anthropic.BadRequestError) {
    if (/credit balance/i.test(err.message)) return 'Your Anthropic account is out of credit. Add credit at console.anthropic.com → Billing, then press Translate again.';
    return `Claude couldn't accept the request: ${err.message}`;
  }
  if (err instanceof Anthropic.InternalServerError) return 'Claude had a temporary problem. Press Translate again in a minute; finished segments are saved.';
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach Claude. Check the internet connection and press Translate again.";
  if (err instanceof Anthropic.APIError) return `Claude returned an error (${err.status}): ${err.message}`;
  return err?.message || String(err);
}

// For trying the app without a key or credit: TD_FAKE=1 returns placeholder Spanish
function fakeBatch(batch, tgt) {
  return {
    result: {
      segments: batch.map((s) => ({ id: s.id, kind: s.kind === 'heading' ? 'heading' : 'paragraph', translation: `[${tgt}] ${s.source}`, flags: [] })),
      term_decisions: [],
    },
    usage: { input_tokens: 0, output_tokens: 0 },
  };
}

const requestParams = (system, user) => ({
  model: MODEL,
  max_tokens: 64000,
  thinking: { type: 'adaptive' },
  output_config: { effort: 'high', format: betaZodOutputFormat(BatchResult) },
  system,
  messages: [{ role: 'user', content: user }],
});

async function callClaude(client, system, user) {
  const stream = client.beta.messages.stream({
    ...requestParams(system, user),
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') {
    const why = msg.stop_details?.explanation ? ` (${msg.stop_details.explanation})` : '';
    throw Object.assign(new Error(`Claude declined to translate this batch${why}. Translate these segments by hand.`), { refusal: true, usage: msg.usage });
  }
  if (msg.stop_reason === 'max_tokens') throw Object.assign(new Error('The answer was cut off because it was too long.'), { usage: msg.usage });
  if (!msg.parsed_output) throw Object.assign(new Error("Claude's answer didn't match the expected format."), { usage: msg.usage });
  return { result: msg.parsed_output, usage: msg.usage };
}

const isDone = (s) => s.target || s.flags.some((f) => f.type === 'duplicate');
export const segmentsToTranslate = (project, ids) => project.segments.filter((s) => (ids ? ids.includes(s.id) : !isDone(s)) && !s.approved);

function userMessageFor(project, batch, memory) {
  const firstIndex = project.segments.indexOf(batch[0]);
  const previous = project.segments.slice(Math.max(0, firstIndex - 3), firstIndex).filter((s) => s.target);
  const matches = new Map(batch.map((s) => [s.id, findMatches(memory, s.source, { direction: project.settings.direction })]));
  return buildUserMessage({ batch, previous, termDecisions: project.termDecisions, matches });
}

// Puts Claude's answer for one batch into the project. With `keepExisting`, segments the
// translator filled in meanwhile are left alone. Returns the ids Claude skipped.
function merge(project, batch, result, { keepExisting = false } = {}) {
  const byId = new Map(project.segments.map((s) => [s.id, s]));
  const returned = new Set();
  for (const r of result.segments) {
    const seg = byId.get(r.id);
    if (!seg || !batch.includes(seg)) continue;
    returned.add(r.id);
    if (keepExisting && (seg.target || seg.approved)) continue;
    seg.target = r.translation.trim();
    seg.kind = r.kind;
    seg.flags = r.flags;
  }
  for (const t of result.term_decisions) {
    if (t.source && !project.termDecisions.some((d) => d.source.toLowerCase() === t.source.toLowerCase())) project.termDecisions.push(t);
  }
  return batch.filter((s) => !returned.has(s.id)).map((s) => s.id);
}

/**
 * Translates every segment that has no translation yet (or the ids given).
 * onProgress receives {done, total, batch, batches, message}.
 */
export async function translateProject(project, { glossary, memory, ids, onProgress = () => {}, apiKey, fake = process.env.TD_FAKE === '1' }) {
  const todo = segmentsToTranslate(project, ids);
  const batches = makeBatches(todo);
  const client = fake ? null : new Anthropic({ apiKey, maxRetries: 3 });
  const system = buildSystem(project.settings, orientGlossary(project.settings.direction, glossary));
  let done = 0;
  const problems = [];

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    await onProgress({ done, total: todo.length, batch: b + 1, batches: batches.length });
    const user = userMessageFor(project, batch, memory);

    let out;
    try {
      out = fake ? fakeBatch(batch, project.settings.direction === 'es-en' ? 'EN' : 'ES') : await callClaude(client, system, user);
    } catch (err) {
      if (err.usage) addUsage(project, err.usage);
      if (err.refusal) {
        for (const s of batch) s.flags = [{ type: 'other', span: '', note: err.message }];
        problems.push(err.message);
        done += batch.length;
        continue;
      }
      throw Object.assign(new Error(explainError(err)), { partial: true });
    }

    addUsage(project, out.usage);
    const missing = merge(project, batch, out.result);
    if (missing.length) problems.push(`Claude skipped ${missing.join(', ')}. Press Translate again to fill them in.`);
    done += batch.length;
    await onProgress({ done, total: todo.length, batch: b + 1, batches: batches.length, saved: true });
  }
  return { translated: done, problems };
}

function addUsage(project, u, opts) {
  project.usage.inputTokens += u.input_tokens || 0;
  project.usage.outputTokens += u.output_tokens || 0;
  project.usage.cacheReadTokens += u.cache_read_input_tokens || 0;
  project.usage.cacheWriteTokens += u.cache_creation_input_tokens || 0;
  project.usage.costUsd += costOf(u, opts);
}

// ---------- Half price: the Message Batches API answers within 24 hours (usually under an hour)
// at half the cost. All parts are sent at once, so each part gets the term decisions made
// before it was sent, not those of the parts sent with it.

/** Sends every untranslated segment as one batch job and records it on the project. */
export async function submitLater(project, { glossary, memory, apiKey, fake = process.env.TD_FAKE === '1' }) {
  const batches = makeBatches(segmentsToTranslate(project));
  if (!batches.length) throw Object.assign(new Error('Every segment already has a translation.'), { status: 400 });
  const system = buildSystem(project.settings, orientGlossary(project.settings.direction, glossary));
  const requests = batches.map((batch, i) => ({ custom_id: `part-${i}`, params: requestParams(system, userMessageFor(project, batch, memory)) }));
  let batchId;
  if (fake) batchId = `fake-${Date.now()}`;
  else {
    try {
      ({ id: batchId } = await new Anthropic({ apiKey, maxRetries: 3 }).beta.messages.batches.create({ requests }));
    } catch (err) {
      throw Object.assign(new Error(explainError(err)), { status: 400 });
    }
  }
  project.pending = { batchId, submitted: new Date().toISOString(), parts: batches.map((batch) => batch.map((s) => s.id)) };
  return project.pending;
}

/**
 * Checks a waiting batch job; when Claude has finished, puts the translations into the project
 * and clears `pending`. Returns {ended, translated, problems}.
 */
export async function collectLater(project, { apiKey, fake = process.env.TD_FAKE === '1' }) {
  const { batchId, parts } = project.pending;
  const byId = new Map(project.segments.map((s) => [s.id, s]));
  const batches = parts.map((ids) => ids.map((id) => byId.get(id)).filter(Boolean));
  const problems = [];
  let translated = 0;

  if (fake || batchId.startsWith('fake-')) {
    for (const batch of batches) { merge(project, batch, fakeBatch(batch, project.settings.direction === 'es-en' ? 'EN' : 'ES').result, { keepExisting: true }); translated += batch.length; }
    project.pending = null;
    return { ended: true, translated, problems };
  }

  const client = new Anthropic({ apiKey, maxRetries: 3 });
  const job = await client.beta.messages.batches.retrieve(batchId);
  if (job.processing_status !== 'ended') return { ended: false, translated: 0, problems, counts: job.request_counts };

  for await (const r of await client.beta.messages.batches.results(batchId)) {
    const i = Number(r.custom_id.replace('part-', ''));
    const batch = batches[i] || [];
    const part = i + 1;
    if (r.result.type !== 'succeeded') {
      problems.push(`Part ${part} wasn't translated (${r.result.type === 'expired' ? 'Claude ran out of time' : r.result.type === 'canceled' ? 'canceled' : 'an error'}). Press Translate to finish it.`);
      continue;
    }
    const msg = r.result.message;
    addUsage(project, msg.usage, { batch: true });
    let parsed;
    try {
      parsed = BatchResult.safeParse(JSON.parse(msg.content.find((b) => b.type === 'text')?.text || ''));
    } catch { parsed = { success: false }; }
    if (msg.stop_reason === 'refusal' || !parsed.success) {
      problems.push(`Part ${part} came back unusable${msg.stop_reason === 'refusal' ? ' (Claude declined it)' : ''}. Press Translate to finish it.`);
      continue;
    }
    const missing = merge(project, batch, parsed.data, { keepExisting: true });
    if (missing.length) problems.push(`Claude skipped ${missing.join(', ')}. Press Translate to fill them in.`);
    translated += batch.length - missing.length;
  }
  project.pending = null;
  return { ended: true, translated, problems };
}

export async function cancelLater(project, { apiKey }) {
  const { batchId } = project.pending;
  if (!batchId.startsWith('fake-')) {
    try { await new Anthropic({ apiKey, maxRetries: 2 }).beta.messages.batches.cancel(batchId); } catch { /* already finished or gone */ }
  }
  project.pending = null;
}
