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

export function findMatches(memory, source, { limit = 2, threshold = 0.7 } = {}) {
  return memory
    .map((m) => ({ ...m, score: similarity(source, m.source) }))
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function remember(memory, { source, target, project }) {
  const key = source.trim().toLowerCase();
  const existing = memory.find((m) => m.source.trim().toLowerCase() === key);
  const entry = { source, target, project, date: new Date().toISOString().slice(0, 10) };
  if (existing) Object.assign(existing, entry);
  else memory.push(entry);
  return memory;
}
