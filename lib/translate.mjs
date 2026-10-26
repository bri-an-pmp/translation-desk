// Sends the project to Claude batch by batch and merges the results back.

import { execFile } from 'node:child_process';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { BatchResult, buildSystem, buildUserMessage, makeBatches } from './prompt.mjs';
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

export function costOf(u) {
  return (
    ((u.input_tokens || 0) * PRICE.input +
      (u.output_tokens || 0) * PRICE.output +
      (u.cache_creation_input_tokens || 0) * PRICE.cacheWrite +
      (u.cache_read_input_tokens || 0) * PRICE.cacheRead) /
    1e6
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
function fakeBatch(batch) {
  return {
    result: {
      segments: batch.map((s) => ({ id: s.id, kind: s.kind === 'heading' ? 'heading' : 'wall_text', translation: `[ES] ${s.source}`, flags: [] })),
      term_decisions: [],
    },
    usage: { input_tokens: 0, output_tokens: 0 },
  };
}

async function callClaude(client, system, user) {
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: betaZodOutputFormat(BatchResult) },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system,
    messages: [{ role: 'user', content: user }],
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

/**
 * Translates every segment that has no translation yet (or the ids given).
 * onProgress receives {done, total, batch, batches, message}.
 */
export async function translateProject(project, { glossary, memory, ids, onProgress = () => {}, apiKey, fake = process.env.TD_FAKE === '1' }) {
  const todo = project.segments.filter((s) => (ids ? ids.includes(s.id) : !s.target) && !s.approved);
  const batches = makeBatches(todo);
  const client = fake ? null : new Anthropic({ apiKey, maxRetries: 3 });
  const system = buildSystem(project.settings, glossary);
  const byId = new Map(project.segments.map((s) => [s.id, s]));
  let done = 0;
  const problems = [];

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    await onProgress({ done, total: todo.length, batch: b + 1, batches: batches.length });
    const firstIndex = project.segments.indexOf(batch[0]);
    const previous = project.segments.slice(Math.max(0, firstIndex - 3), firstIndex).filter((s) => s.target);
    const matches = new Map(batch.map((s) => [s.id, findMatches(memory, s.source)]));
    const user = buildUserMessage({ batch, previous, termDecisions: project.termDecisions, matches });

    let out;
    try {
      out = fake ? fakeBatch(batch) : await callClaude(client, system, user);
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
    const returned = new Set();
    for (const r of out.result.segments) {
      const seg = byId.get(r.id);
      if (!seg || !batch.includes(seg)) continue;
      seg.target = r.translation.trim();
      seg.kind = r.kind;
      seg.flags = r.flags;
      returned.add(r.id);
    }
    const missing = batch.filter((s) => !returned.has(s.id));
    if (missing.length) problems.push(`Claude skipped ${missing.map((s) => s.id).join(', ')}. Press Translate again to fill them in.`);
    for (const t of out.result.term_decisions) {
      if (t.source && !project.termDecisions.some((d) => d.source.toLowerCase() === t.source.toLowerCase())) project.termDecisions.push(t);
    }
    done += batch.length;
    await onProgress({ done, total: todo.length, batch: b + 1, batches: batches.length, saved: true });
  }
  return { translated: done, problems };
}

function addUsage(project, u) {
  project.usage.inputTokens += u.input_tokens || 0;
  project.usage.outputTokens += u.output_tokens || 0;
  project.usage.cacheReadTokens += u.cache_read_input_tokens || 0;
  project.usage.cacheWriteTokens += u.cache_creation_input_tokens || 0;
  project.usage.costUsd += costOf(u);
}
