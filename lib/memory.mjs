// Translation memory: segments the translator approved, matched by similarity.

function trigrams(s) {
  const t = ` ${s.toLowerCase().replace(/\*+/g, '').replace(/\s+/g, ' ').trim()} `;
  const out = new Map();
  for (let i = 0; i < t.length - 2; i++) {
    const g = t.slice(i, i + 3);
    out.set(g, (out.get(g) || 0) + 1);
  }
  return out;
}

export function similarity(a, b) {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return 1;
  const x = trigrams(a), y = trigrams(b);
  let shared = 0, total = 0;
  for (const [g, n] of x) { total += n; shared += Math.min(n, y.get(g) || 0); }
  for (const n of y.values()) total += n;
  return total ? (2 * shared) / total : 0;
}

export function findMatches(memory, source, { limit = 2, threshold = 0.7, direction = 'en-es' } = {}) {
  // Texts less than half as long as each other can't reach the threshold, so skip them before
  // the slower comparison (this keeps large imported memories fast)
  const len = source.length;
  return memory
    .filter((m) => (m.direction || 'en-es') === direction && m.source.length * 2 >= len && len * 2 >= m.source.length)
    .map((m) => ({ ...m, score: similarity(source, m.source) }))
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function remember(memory, { source, target, project, direction = 'en-es' }) {
  const key = source.trim().toLowerCase();
  const existing = memory.find((m) => m.source.trim().toLowerCase() === key && (m.direction || 'en-es') === direction);
  const entry = { source, target, project, direction, date: new Date().toISOString().slice(0, 10) };
  if (existing) Object.assign(existing, entry);
  else memory.push(entry);
  return memory;
}

export const MEMORY_LIMIT = 50000;

/** Adds many entries at once (a TMX import). Returns {added, updated, full}. */
export function importMemory(memory, entries, project) {
  const key = (m) => `${m.direction || 'en-es'}\n${m.source.trim().toLowerCase()}`;
  const index = new Map(memory.map((m) => [key(m), m]));
  const date = new Date().toISOString().slice(0, 10);
  let added = 0, updated = 0, full = false;
  for (const e of entries) {
    const entry = { source: e.source, target: e.target, project, direction: e.direction, date };
    const existing = index.get(key(entry));
    if (existing) { Object.assign(existing, entry); updated++; continue; }
    if (memory.length >= MEMORY_LIMIT) { full = true; break; }
    memory.push(entry);
    index.set(key(entry), entry);
    added++;
  }
  return { added, updated, full };
}
