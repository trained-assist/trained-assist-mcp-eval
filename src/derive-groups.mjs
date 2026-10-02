#!/usr/bin/env node
// Derives confusable groups from measured routing errors.
//
// tasks/confusable-groups.v1.json is hand-curated: 14 groups, 36 tools, written from reading
// FINDINGS.md. That does not scale — the corpus run showed 523 wrong answers spread over the catalog,
// and only some of those collisions were in my list. Anyone can be forgotten; a measured confusion
// matrix cannot.
//
// The evidence is direct: when a phrasing written for tool E is answered as tool A, then E and A are
// confusable, k times. That is exactly the condition Probe C measures. So the full-catalog run feeds
// the confusable-group run: every group here is a group the router demonstrably confused.
//
// Groups are built as connected components over those edges, with a size cap. The cap matters: one
// popular wrong answer (hh_list_vacancies attracts several neighbours) would otherwise collapse into a
// single huge group where chance is 1/20 and everything looks broken. Weaker edges are dropped first,
// which keeps the strong pairs and discards the coincidental ones.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const EVAL_FILE = arg('eval', path.join(ROOT, 'out', 'eval.v1.json'));
const OUT = arg('out', path.join(ROOT, 'tasks', 'confusable-groups.auto.json'));
const MAX_GROUP = Math.max(2, Number(arg('max-group', 4)));
const MIN_EDGE = Math.max(1, Number(arg('min-edge', 2)));

function main() {
  if (!fs.existsSync(EVAL_FILE)) {
    console.error(`[groups] ${EVAL_FILE} is missing — run the corpus eval first`);
    process.exit(2);
  }
  const rows = JSON.parse(fs.readFileSync(EVAL_FILE, 'utf8'));

  // Edge evidence: expected -> actually chosen. A refusal (null) is NOT evidence of confusion — it
  // says the model found nothing suitable, which is the refusal bug already documented, not a
  // collision between two names. Mixing the two would produce groups made of tools that merely fail
  // together, which is a different and much weaker claim.
  const edges = new Map();
  for (const r of rows) {
    if (r.status !== 'wrong' || !r.actual || !r.tool) continue;
    const key = `${r.tool}|${r.actual}`;
    edges.set(key, (edges.get(key) || 0) + 1);
  }

  const byTool = new Map();
  for (const r of rows) {
    if (r.tool) byTool.set(r.tool, (byTool.get(r.tool) || 0) + 1);
  }

  const pairs = [...edges.entries()]
    .map(([key, n]) => {
      const [a, b] = key.split('|');
      return { a, b, n };
    })
    .filter((p) => p.n >= MIN_EDGE)
    .sort((x, y) => y.n - x.n);

  // Adjacency over the surviving edges.
  const adj = new Map();
  for (const p of pairs) {
    if (!adj.has(p.a)) adj.set(p.a, []);
    if (!adj.has(p.b)) adj.set(p.b, []);
    adj.get(p.a).push(p);
    adj.get(p.b).push(p);
  }

  const seen = new Set();
  const groups = [];
  for (const p of pairs) {
    if (seen.has(p.a) || seen.has(p.b)) continue;
    const members = new Set([p.a, p.b]);
    const evidence = [];
    evidence.push({ from: p.a, to: p.b, n: p.n });
    seen.add(p.a);
    seen.add(p.b);

    // Greedy expansion by strongest connecting edge, bounded by MAX_GROUP.
    const frontier = [p.a, p.b];
    while (frontier.length && members.size < MAX_GROUP) {
      const from = frontier.shift();
      const neighbours = (adj.get(from) || [])
        .filter((e) => !members.has(e.a === from ? e.b : e.a))
        .sort((x, y) => y.n - x.n);
      for (const e of neighbours) {
        if (members.size >= MAX_GROUP) break;
        const other = e.a === from ? e.b : e.a;
        members.add(other);
        seen.add(other);
        frontier.push(other);
        evidence.push({ from: e.a, to: e.b, n: e.n });
      }
    }

    const total = evidence.reduce((s, e) => s + e.n, 0);
    groups.push({
      id: `auto-${members.size}-${[...members].sort()[0]}`,
      names: [...members].sort(),
      why: `измерено: ${evidence
        .sort((x, y) => y.n - x.n)
        .slice(0, 3)
        .map((e) => `${e.from}→${e.to} ×${e.n}`)
        .join(', ')}`,
      evidenceTotal: total,
      evidence,
    });
  }

  groups.sort((a, b) => b.evidenceTotal - a.evidenceTotal);

  const payload = {
    _comment:
      'Derived from measured routing errors, not curated. Regenerate with `node src/derive-groups.mjs` after a corpus run. Refusals (tool: null) are excluded — they are the refusal bug, not a name collision.',
    source: path.relative(ROOT, EVAL_FILE),
    minEdge: MIN_EDGE,
    maxGroup: MAX_GROUP,
    groups,
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');

  const covered = new Set(groups.flatMap((g) => g.names));
  console.error(`[groups] ${pairs.length} edges ≥${MIN_EDGE} → ${groups.length} groups covering ${covered.size} tools`);
  for (const g of groups.slice(0, 14)) {
    console.error(`  ${String(g.evidenceTotal).padStart(4)}  ${g.names.join(' / ')}`);
  }
  if (groups.length > 14) console.error(`  ... ${groups.length - 14} more`);
  console.error(`[groups] ${OUT}`);
}

main();