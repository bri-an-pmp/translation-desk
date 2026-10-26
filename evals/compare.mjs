// Compares the app's translation with the translator's own delivered translation.
//
//   npm run compare -- "<folder with original.docx and translation.pdf|.docx|.txt>"
//
// The folder stays private: results are written inside it (compare-<date>.md / .json),
// never into this repository. Uses the same Keychain key as the app.

import fs from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import mammoth from 'mammoth';
import { segmentFile } from '../lib/segment.mjs';
import { runChecks } from '../lib/checks.mjs';
import { cleanProject, cleanSettings } from '../lib/store.mjs';
import { costOf, explainError, readKey, translateProject } from '../lib/translate.mjs';

const JUDGE_MODEL = 'claude-opus-5-5';

const Verdict = z.object({
  overall: z.object({
    app_score: z.number().describe('1-10: how ready the app translation is to deliver without edits'),
    reference_score: z.number().describe('1-10: the same for the translator reference'),
    summary: z.string(),
  }),
  differences: z.array(
    z.object({
      category: z.enum(['meaning', 'omission', 'addition', 'terminology', 'register', 'titles', 'names', 'dates_numbers', 'style', 'grammar', 'other']),
      english: z.string().describe('The English source span'),
      app: z.string().describe("The app's Spanish"),
      reference: z.string().describe("The translator's Spanish"),
      better: z.enum(['app', 'reference', 'equal']),
      severity: z.enum(['critical', 'major', 'minor']),
      lesson: z.string().describe('A rule the app could follow next time, or empty'),
    }),
  ),
});

const JUDGE_SYSTEM = `You are a senior English-to-Spanish museum translation reviewer. Compare two Spanish translations of the same English source: the APP translation (machine-assisted draft) and the REFERENCE (the professional translator's delivered version). Judge both against the English source, not against each other: the reference can be wrong too.

List every material difference: meaning, omissions, additions, terminology, register, how titles and names are handled, dates and numbers, and natural style. Skip trivial word-order variants that are equally good. For each, say which is better (or equal), how serious it is, and the general rule the app should learn (written so it could be added to a style guide; empty if there's nothing general to learn).`;

async function readReference(file) {
  const buf = await fs.readFile(file);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.pdf') return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buf.toString('base64') }, title: 'REFERENCE (translator)' };
  const text = ext === '.docx' ? (await mammoth.extractRawText({ buffer: buf })).value : buf.toString('utf8');
  return { type: 'text', text: `<reference>\n${text}\n</reference>` };
}

async function findFile(dir, base, exts) {
  for (const e of exts) {
    try { await fs.access(path.join(dir, base + e)); return path.join(dir, base + e); } catch { /* next */ }
  }
  return null;
}

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error('Pass the sample folder, e.g. npm run compare -- "~/Documents/Translation Assistant - private samples/museum/<job folder>"');
  const original = await findFile(dir, 'original', ['.docx', '.txt', '.md']);
  const reference = await findFile(dir, 'translation', ['.pdf', '.docx', '.txt']);
  if (!original || !reference) throw new Error('The folder needs original.docx (or .txt) and translation.pdf (or .docx/.txt).');
  const apiKey = await readKey();
  if (!apiKey) throw new Error('No Claude API key found in Keychain. See "Set up your API key" in the README.');

  const settings = cleanSettings(JSON.parse(await fs.readFile(path.join(dir, 'settings.json'), 'utf8').catch(() => '{}')));
  const project = cleanProject({ name: path.basename(dir), settings, segments: await segmentFile(original, await fs.readFile(original)) });
  console.log(`Translating ${project.segments.length} segments with the app…`);
  const result = await translateProject(project, { glossary: [], memory: [], apiKey, onProgress: (p) => process.stdout.write(`\r  part ${p.batch}/${p.batches}`) });
  console.log(`\n  done, $${project.usage.costUsd.toFixed(2)}${result.problems.length ? ` (problems: ${result.problems.join(' ')})` : ''}`);
  runChecks(project, []);

  const appText = project.segments.map((s) => s.target).join('\n\n');
  const sourceText = project.segments.map((s) => s.source).join('\n\n');
  console.log('Comparing with your translation…');
  const client = new Anthropic({ apiKey, maxRetries: 3 });
  const msg = await client.beta.messages.stream({
    model: JUDGE_MODEL,
    max_tokens: 32000,
    output_config: { effort: 'high', format: betaZodOutputFormat(Verdict) },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: JUDGE_SYSTEM,
    messages: [{ role: 'user', content: [
      { type: 'text', text: `<english_source>\n${sourceText}\n</english_source>\n\n<app_translation>\n${appText}\n</app_translation>` },
      await readReference(reference),
      { type: 'text', text: 'The REFERENCE translation is the document above (or in <reference>). Compare.' },
    ] }],
  }).finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('The judge declined to compare these texts.');
  const verdict = msg.parsed_output;
  if (!verdict) throw new Error("The judge's answer didn't match the expected format.");
  const judgeCost = costOf(msg.usage);

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const counts = (who) => verdict.differences.filter((d) => d.better === who).length;
  const md = [
    `# Comparison: ${project.name}`, '',
    `App ${verdict.overall.app_score}/10 · Your translation ${verdict.overall.reference_score}/10 · Your version better in ${counts('reference')} places, the app in ${counts('app')}, equal in ${counts('equal')}.`, '',
    verdict.overall.summary, '',
    `Cost: translation $${project.usage.costUsd.toFixed(2)}, comparison about $${judgeCost.toFixed(2)}.`, '',
    '| Better | Severity | Category | English | App | Yours | Lesson |', '|---|---|---|---|---|---|---|',
    ...verdict.differences.map((d) => `| ${d.better} | ${d.severity} | ${d.category} | ${d.english} | ${d.app} | ${d.reference} | ${d.lesson} |`.replace(/\n/g, ' ')),
  ].join('\n');
  await fs.writeFile(path.join(dir, `compare-${stamp}.md`), md);
  await fs.writeFile(path.join(dir, `compare-${stamp}.json`), JSON.stringify({ project, verdict }, null, 2));
  console.log(`\n${md.split('\n').slice(0, 5).join('\n')}\n\nFull report: ${path.join(dir, `compare-${stamp}.md`)}`);
}

main().catch((err) => {
  console.error(`\n${explainError(err)}`);
  process.exit(1);
});
